drop table if exists aggregated_scores_by_city;
drop table if exists aggregated_scores_by_state;
drop table if exists aggregated_scores_by_school;
drop table if exists enem_subjects;
drop table if exists raw_enem_scores;
drop table if exists schools;

-- schools table.
create table schools(
  id char(8) not null primary key,
  name varchar(255),
  state char(2),
  city_id char(7),
  city varchar(255)
);

-- raw_enem_scores table.
create table raw_enem_scores(
  subscription_id char(12) primary key,
  year int,
  age int,
  gender int,
  school_id char(8), -- here we should not stablish a FK constraint, so invalid rows are properly loaded!

  -- the next 3 columns will also be loaded, breaking normalization rules, in order to calculate all states aggregations even if somes schools are missing!
  state char(2),
  city_id char(7),
  city varchar(255),

  nature_sciences_score varchar(9),
  human_sciences_score varchar(9),
  languages_and_codes_score varchar(9),
  math_score varchar(9)
);
create index school_id on raw_enem_scores (school_id);

-- enem_subjects table.
create table enem_subjects(
  id char(3) not null primary key,
  name varchar(255) not null
);
insert into enem_subjects (id, name) values 
  ('nat', 'ciencias da natureza'),
  ('hum', 'ciencias humanas'),
  ('lin', 'linguagens e codigos'),
  ('mat', 'matematica');

-- aggregated_scores_by_schools table.
create table aggregated_scores_by_school(
  school_id char(8) not null references schools(id),
  year int not null,
  enem_subject_id char(3) not null references enem_subjects(id),
  score_range int not null,
  student_count int not null
);
alter table aggregated_scores_by_school add primary key (school_id, year, enem_subject_id, score_range);

-- aggregated_scores_by_states table.
create table aggregated_scores_by_state(
  state char(2),
  year int not null,
  enem_subject_id char(3) not null references enem_subjects(id),
  score_range int not null,
  student_count int not null
);
alter table aggregated_scores_by_state add primary key (state, year, enem_subject_id, score_range);

-- aggregated_scores_by_states table.
create table aggregated_scores_by_city(
  city_id char(7) not null,
  city varchar(255) not null,
  year int not null,
  enem_subject_id char(3) not null references enem_subjects(id),
  score_range int not null,
  student_count int not null
);
alter table aggregated_scores_by_city add primary key (city_id, year, enem_subject_id, score_range);
