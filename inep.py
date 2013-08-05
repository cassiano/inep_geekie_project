# -*- coding: UTF-8 -*-

# Imports.
from flask import Flask, request, session, g, redirect, url_for, abort, \
    render_template, flash, json, jsonify
from flask.ext.sqlalchemy import SQLAlchemy
from os import environ
from sqlalchemy import func
from operator import itemgetter

# Configuration.
DEBUG                   = True
SECRET_KEY              = 'development key'
SQLALCHEMY_DATABASE_URI = environ.get('HEROKU_POSTGRESQL_OLIVE_URL', 'postgres://cassiano:@localhost:5432/inep')

# Application initialization.
app = Flask(__name__)
app.config.from_object(__name__)
db = SQLAlchemy(app)

# Constants.
ENEM_SUBJECTS_MAPPING = { 
    'NAT': ['nature_sciences',      u'Ciências da Natureza'],
    'HUM': ['human_sciences',       u'Ciências Humanas'],
    'LAN': ['languages_and_codes',  u'Linguagens e Códigos'],
    'MAT': ['math',                 u'Matemática']
}

##############################
# SQLAlchemy domain models
##############################

class EnemSubscription(db.Model):
    __tablename__ = 'facts_enem_subscriptions'
    
    # Columns.
    id                           = db.Column(db.String(12), primary_key=True)
    year                         = db.Column(db.Integer)
    school_id                    = db.Column(db.Integer, db.ForeignKey('dim_schools.id'))
    nature_sciences_score_id     = db.Column(db.Integer, db.ForeignKey('dim_nature_sciences_scores.id'))
    human_sciences_score_id      = db.Column(db.Integer, db.ForeignKey('dim_human_sciences_scores.id'))
    languages_and_codes_score_id = db.Column(db.Integer, db.ForeignKey('dim_languages_and_codes_scores.id'))
    math_score_id                = db.Column(db.Integer, db.ForeignKey('dim_math_scores.id'))
    
    # Relationships. PS: Additional relationships (e.g. nature_sciences_score, human_sciences_score etc) might be implemented later, if necessary.
    school = db.relationship('School')

    def __repr__(self):
        return "<EnemSubscription('%s')>" % self.id
        
    @classmethod
    def years(cls):
        return cls.query.distinct(cls.year).order_by(cls.year)

class School(db.Model):
    __tablename__ = 'dim_schools'
    
    # Columns.
    id        = db.Column(db.Integer, primary_key=True)
    code      = db.Column(db.String(8))
    name      = db.Column(db.String(255))
    city_code = db.Column(db.String(7))
    city      = db.Column(db.String(255))
    state     = db.Column(db.String(2))

    # Relationships.
    enem_subscriptions = db.relationship('EnemSubscription')
            
    @classmethod
    def search(cls, city_code_context, term):
        return cls.query.filter_by(city_code=city_code_context).filter(cls.name.contains(term.upper())).order_by(School.name)

    def __repr__(self):
        return "<School('%s')>" % self.name

class City(db.Model):
    __tablename__ = 'cities'
    
    # Columns.
    id    = db.Column(db.String(7), primary_key=True)
    name  = db.Column(db.String(255))
    state = db.Column(db.String(2), db.ForeignKey('states.state'))
            
    def __repr__(self):
        return "<City('%s')>" % self.name

    # TODO: consider implementing this class method as an instance method of the State class.
    @classmethod
    def search(cls, state_context, term):
        return cls.query.filter_by(state=state_context).filter(cls.name.contains(term.upper())).order_by(City.name)

class State(db.Model):
    __tablename__ = 'states'
    
    # Columns.
    state = db.Column(db.String(2), primary_key=True)
            
    def __repr__(self):
        return "<State('%s')>" % self.state

##############################
# Schools routes
##############################

@app.route("/schools/<id>/aggregated_scores/<year>/<enem_subject>.json")
def aggregated_scores_by_school(id, year, enem_subject):
    school = School.query.filter_by(id=id).first()
    
    if school is None: abort(404)

    # TODO: write the SQL code below purely in Python, using the SQLAlchemy API.
    sql_statement = """
        select 
            n.range1, 
            count(*) as count 
        from 
            facts_enem_subscriptions f 
        inner join 
            dim_{0}_scores n on f.{0}_score_id = n.id 
        inner join 
            dim_schools s on f.school_id = s.id 
        where 
            s.id = :id and 
            f.year = :year 
        group by 
            n.range1 
        order by 
            n.range1
    """.format(ENEM_SUBJECTS_MAPPING[enem_subject.upper()][0])
    
    aggregated_scores = db.session.query('range1', 'count').from_statement(sql_statement).params(id=id, year=year)
        
    return jsonify([[a.range1, a.count] for a in aggregated_scores])

@app.route("/schools/search/<city_code>.json")
def search_schools_in_city(city_code):
    term = request.args.get('term', '')
    schools = School.search(city_code, term)
        
    return jsonify({ 'schools': [{ 'id': s.id, 'value': s.name.title() } for s in schools] })

##############################
# Cities routes
##############################

@app.route("/cities/<city_code>/aggregated_scores/<year>/<enem_subject>.json")
def aggregated_scores_by_city(city_code, year, enem_subject):
    # TODO: write the SQL code below purely in Python, using the SQLAlchemy API.
    sql_statement = """
        select 
            n.range1, 
            count(*) as count 
        from 
            facts_enem_subscriptions f 
        inner join 
            dim_{0}_scores n on f.{0}_score_id = n.id 
        inner join 
            dim_schools s on f.school_id = s.id 
        where 
            s.city_code = :city_code and 
            f.year = :year 
        group by 
            n.range1 
        order by 
            n.range1
    """.format(ENEM_SUBJECTS_MAPPING[enem_subject.upper()][0])
    
    aggregated_scores = db.session.query('range1', 'count').from_statement(sql_statement).params(city_code=city_code, year=year)
        
    return jsonify([[a.range1, a.count] for a in aggregated_scores])

##############################
# States routes
##############################

@app.route("/states/<state>/cities/search.json")
def search_cities_in_state(state):
    term   = request.args.get('term', '')
    cities = City.search(state, term)
        
    return jsonify({ 'cities': [{ 'id': c.id, 'value': c.name.title() } for c in cities] })

##############################
# Root route
##############################

@app.route('/')
def show_main_page():
    enem_subjects = sorted([[k, v[1]] for k, v in ENEM_SUBJECTS_MAPPING.iteritems()], key=itemgetter(1))
    states        = State.query
    years         = [es.year for es in EnemSubscription.years()]
    
    return render_template('main_page.html', enem_subjects=enem_subjects, states=states, years=years)
