drop table if exists raw_schools;
drop table if exists raw_enem_scores;

-- schools table.
create table raw_schools(
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
  school_id char(8),
  state char(2),
  city_id char(7),
  city varchar(255),
  present_in_nature_sciences_exam smallint,
  present_in_human_sciences_exam smallint,
  present_in_languages_and_codes_exam smallint,
  present_in_math_exam smallint,
  nature_sciences_score varchar(9),
  human_sciences_score varchar(9),
  languages_and_codes_score varchar(9),
  math_score varchar(9)
);
create index school_id on raw_enem_scores(school_id);
