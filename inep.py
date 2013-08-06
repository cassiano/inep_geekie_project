# -*- coding: UTF-8 -*-

# Imports.
from flask import Flask, request, session, g, redirect, url_for, abort, \
    render_template, flash, json, jsonify
from flask.ext.sqlalchemy import SQLAlchemy
from os import environ
from sqlalchemy import func
from operator import itemgetter

# Configuration.
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
# TODO: rewrite the SQL command below using the SQLAlchemy API.
COUNT_BY_RANGE_SQL_STATEMENT = """
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
        s.{1} = :{1} and 
        f.year = :year 
    group by 
        n.range1 
    order by 
        n.range1
"""
        
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
            
    def __repr__(self):
        return "<School('%s')>" % self.name

    @classmethod
    def search(cls, city_code_context, term):
        return cls.query.filter_by(city_code=city_code_context).filter(cls.name.contains(term.upper())).order_by(School.name)

    @classmethod
    def aggregated_scores(cls, city_id, year, enem_subject):
      sql_statement = COUNT_BY_RANGE_SQL_STATEMENT.format(ENEM_SUBJECTS_MAPPING[enem_subject.upper()][0], 'id')

      return db.session.query('range1', 'count').from_statement(sql_statement).params(id=city_id, year=year)

class City(db.Model):
    __tablename__ = 'cities'
    
    # Columns.
    id    = db.Column(db.String(7), primary_key=True)
    name  = db.Column(db.String(255))
    state = db.Column(db.String(2), db.ForeignKey('states.state'))
            
    def __repr__(self):
        return "<City('%s')>" % self.name

    @classmethod
    def search(cls, state_context, term):
        return cls.query.filter_by(state=state_context).filter(cls.name.contains(term.upper())).order_by(City.name)

    @classmethod
    def aggregated_scores(cls, city_code, year, enem_subject):
        sql_statement = COUNT_BY_RANGE_SQL_STATEMENT.format(ENEM_SUBJECTS_MAPPING[enem_subject.upper()][0], 'city_code')

        return db.session.query('range1', 'count').from_statement(sql_statement).params(city_code=city_code, year=year)

class State(db.Model):
    __tablename__ = 'states'
    
    # Columns.
    state = db.Column(db.String(2), primary_key=True)
            
    def __repr__(self):
        return "<State('%s')>" % self.state

    @classmethod
    def aggregated_scores(cls, state, year, enem_subject):
        sql_statement = COUNT_BY_RANGE_SQL_STATEMENT.format(ENEM_SUBJECTS_MAPPING[enem_subject.upper()][0], 'state')

        return db.session.query('range1', 'count').from_statement(sql_statement).params(state=state.upper(), year=year)

##############################
# Schools routes
##############################

@app.route("/schools/<id>/aggregated_scores/<year>/<enem_subject>.json")
def aggregated_scores_by_school(id, year, enem_subject):
    return jsonify([[a.range1, a.count] for a in School.aggregated_scores(id, year, enem_subject)])

@app.route("/schools/search/<city_code>.json")
def search_schools_in_city(city_code):
    term = request.args.get('term', '')
        
    return jsonify({ 'schools': [{ 'id': s.id, 'value': s.name.title() } for s in School.search(city_code, term)] })

##############################
# Cities routes
##############################

@app.route("/cities/<city_code>/aggregated_scores/<year>/<enem_subject>.json")
def aggregated_scores_by_city(city_code, year, enem_subject):
    return jsonify([[a.range1, a.count] for a in City.aggregated_scores(city_code, year, enem_subject)])

##############################
# States routes
##############################

@app.route("/states/<state>/cities/search.json")
def search_cities_in_state(state):
    term = request.args.get('term', '')

    return jsonify({ 'cities': [{ 'id': c.id, 'value': c.name.title() } for c in City.search(state, term)] })

@app.route("/states/<state>/aggregated_scores/<year>/<enem_subject>.json")
def aggregated_scores_by_state(state, year, enem_subject):
    return jsonify([[a.range1, a.count] for a in State.aggregated_scores(state, year, enem_subject)])

##############################
# Root route
##############################

@app.route('/')
def show_main_page():
    enem_subjects = sorted([[k, v[1]] for k, v in ENEM_SUBJECTS_MAPPING.iteritems()], key=itemgetter(1))
    states        = State.query
    years         = [es.year for es in EnemSubscription.years()]
    
    return render_template('main_page.html', enem_subjects=enem_subjects, states=states, years=years)
