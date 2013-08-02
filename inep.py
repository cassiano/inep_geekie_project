# Imports.
from flask import Flask, request, session, g, redirect, url_for, abort, \
    render_template, flash, json, jsonify
from flask.ext.sqlalchemy import SQLAlchemy
from os import environ

# Configuration.
DEBUG                   = True
SECRET_KEY              = 'development key'
SQLALCHEMY_DATABASE_URI = environ.get('HEROKU_POSTGRESQL_OLIVE_URL') or 'postgres://cassiano:@localhost:5432/inep'

# Application initialization.
app = Flask(__name__)
app.config.from_object(__name__)
db = SQLAlchemy(app)

##############################
# SQLAlchemy domain models
##############################

class School(db.Model):
    __tablename__ = 'schools'
    
    # Columns.
    id      = db.Column(db.String(8), primary_key=True)
    name    = db.Column(db.String(255))
    state   = db.Column(db.String(2))
    city_id = db.Column(db.String(7))
    city    = db.Column(db.String(255))
    
    # Relationships.
    aggregated_scores = db.relationship('AggregatedScoreBySchool', order_by='AggregatedScoreBySchool.enem_subject_id, AggregatedScoreBySchool.score_range', lazy='dynamic')
    
    def __repr__(self):
        return '<School %s [%s-%s]>' % (self.name, self.city, self.state)

    def aggregated_scores_by_year_and_enem_subject_id(self, year, enem_subject_id):
        return self.aggregated_scores.filter_by(year=year, enem_subject_id=enem_subject_id.upper())
        
    @classmethod
    def search(cls, city_id, term):
        return cls.query.filter_by(city_id=city_id).filter(cls.name.contains(term.upper())).order_by(School.name)

    @classmethod
    def search_cities(cls, state, term):
        return cls.query.filter_by(state=state.upper()).distinct(School.city).filter(cls.city.contains(term.upper())).order_by(School.city)

class AggregatedScoreBySchool(db.Model):
    __tablename__ = 'aggregated_scores_by_school'

    # Columns.
    school_id       = db.Column(db.String(8), db.ForeignKey('schools.id'), primary_key=True)
    year            = db.Column(db.Integer, primary_key=True)
    enem_subject_id = db.Column(db.String(3), db.ForeignKey('enem_subjects.id'), primary_key=True)
    score_range     = db.Column(db.Integer, primary_key=True)
    student_count   = db.Column(db.Integer)

    # Relationships.
    school       = db.relationship('School')
    enem_subject = db.relationship('EnemSubject')

    def __repr__(self):
        return '<School Aggregate %s - %d - %s - %d - %d>' % (self.school.name, self.year, self.enem_subject.name, self.score_range, self.student_count)
        
class AggregatedScoreByState(db.Model):
    __tablename__ = 'aggregated_scores_by_state'

    # Columns.
    state           = db.Column(db.String(2))
    year            = db.Column(db.Integer, primary_key=True)
    enem_subject_id = db.Column(db.String(3), db.ForeignKey('enem_subjects.id'), primary_key=True)
    score_range     = db.Column(db.Integer, primary_key=True)
    student_count   = db.Column(db.Integer)

    # Relationships.
    enem_subject = db.relationship('EnemSubject')

    def __repr__(self):
        return '<State Aggregate %s - %d - %s - %d - %d>' % (self.state, self.year, self.enem_subject.name, self.score_range, self.student_count)
        
    @classmethod
    def aggregated_scores_by_state_and_year_and_enem_subject_id(cls, state, year, enem_subject_id):
        return cls.query.filter_by(state=state.upper(), year=year, enem_subject_id=enem_subject_id.upper())

class AggregatedScoreByCity(db.Model):
    __tablename__ = 'aggregated_scores_by_city'

    # Columns.
    city_id         = db.Column(db.String(7))
    city            = db.Column(db.String(255))
    year            = db.Column(db.Integer, primary_key=True)
    enem_subject_id = db.Column(db.String(3), db.ForeignKey('enem_subjects.id'), primary_key=True)
    score_range     = db.Column(db.Integer, primary_key=True)
    student_count   = db.Column(db.Integer)

    # Relationships.
    enem_subject = db.relationship('EnemSubject')

    def __repr__(self):
        return '<City Aggregate %s - %s - %d - %s - %d - %d>' % (self.city_id, self.city, self.year, self.enem_subject.name, self.score_range, self.student_count)
        
    @classmethod
    def aggregated_scores_by_city_id_and_year_and_enem_subject_id(cls, city_id, year, enem_subject_id):
        return cls.query.filter_by(city_id=city_id, year=year, enem_subject_id=enem_subject_id.upper())

class EnemSubject(db.Model):
    __tablename__ = 'enem_subjects'

    # Columns.
    id   = db.Column(db.String(3), primary_key=True)
    name = db.Column(db.String(255))

    def __repr__(self):
        return '<Enem Subject %s>' % self.name

##############################
# Enem Subjects routes
##############################

# @app.route("/enem_subjects.json")
# def enem_subjects_index():
#     return jsonify({ 'enem_subjects': [[es.id, es.name] for es in EnemSubject.query] })

##############################
# Schools routes
##############################

# @app.route("/schools/<id>.json")
# def schools_show(id):
#     school = School.query.filter_by(id=id).first()
# 
#     if school is None: abort(404)
# 
#     return jsonify(id=id, name=school.name, state=school.state, city_id=school.city_id, city=school.city)

@app.route("/schools/<id>/aggregated_scores/<year>/<enem_subject_id>.json")
def aggregated_scores_by_school_index(id, year, enem_subject_id):
    school = School.query.filter_by(id=id).first()

    if school is None: abort(404)

    aggregated_scores = school.aggregated_scores_by_year_and_enem_subject_id(year, enem_subject_id)
        
    return jsonify([[a.score_range, a.student_count] for a in aggregated_scores])

@app.route("/schools/search/<city_id>.json")
def schools_search(city_id):
    term = request.args.get('term', '')
    schools = School.search(city_id, term)
        
    return jsonify({ 'schools': [{ 'id': s.id, 'value': s.name.title() } for s in schools] })

##############################
# Cities routes
##############################

@app.route("/cities/<city_id>/aggregated_scores/<year>/<enem_subject_id>.json")
def aggregated_scores_by_city_index(city_id, year, enem_subject_id):
    aggregated_scores = AggregatedScoreByCity.aggregated_scores_by_city_id_and_year_and_enem_subject_id(city_id, year, enem_subject_id)
        
    return jsonify([[a.score_range, a.student_count] for a in aggregated_scores])

# @app.route("/cities/<id>.json")
# def cities_show(id):
#     city = School.query.filter_by(city_id=id).first()
# 
#     if city is None: abort(404)
# 
#     return jsonify(id=id, name=city.city, state=city.state)

##############################
# States routes
##############################

# @app.route("/states/<state>/aggregated_scores/<year>/<enem_subject_id>.json")
# def aggregated_scores_by_state_index(state, year, enem_subject_id):
#     aggregated_scores = AggregatedScoreByState.aggregated_scores_by_state_and_year_and_enem_subject_id(state, year, enem_subject_id)
#         
#     return jsonify([[a.score_range, a.student_count] for a in aggregated_scores])

# @app.route("/states/<state>/cities.json")
# def states_cities_index(state):
#     cities = School.query.filter_by(state=state).distinct(School.city_id, School.city).order_by(School.city)
#         
#     return jsonify({ 'cities': [{ 'id': c.city_id, 'value': c.city.title() } for c in cities] })

# @app.route("/states.json")
# def states_index():
#     states = School.query.distinct(School.state).order_by(School.state)
#         
#     return jsonify({ 'states': [{ 'id': s.state, 'value': s.state } for s in states] })

@app.route("/states/<state>/cities/search.json")
def states_cities_search(state):
    term   = request.args.get('term', '')
    cities = School.search_cities(state, term)
        
    return jsonify({ 'cities': [{ 'id': c.city_id, 'value': c.city.title() } for c in cities] })

##############################
# Root route
##############################

@app.route('/')
def show_main_page():
    enem_subjects = EnemSubject.query
    states        = School.query.distinct(School.state).order_by(School.state)
    years         = [2011, 2012]      # TODO: fetch from database.
    
    return render_template('main_page.html', enem_subjects=enem_subjects, states=states, years=years)
