-----------
-- schools
-----------

truncate table aggregated_scores_by_school;

-- Ciências da Natureza
insert into 
  aggregated_scores_by_school
select 
  r.school_id, r.year, es.id, trunc((cast(trim(both ' ' from r.nature_sciences_score) as float) / 1.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'Ciências da Natureza'
where 
  r.year = 2011 and r.present_in_nature_sciences_exam = 1
group by 
  r.school_id, r.year, es.id, trunc((cast(trim(both ' ' from r.nature_sciences_score) as float) / 1.0000000001) / 100 + 1)
order by 
  4;

-- Ciências Humanas
insert into 
  aggregated_scores_by_school
select 
  r.school_id, r.year, es.id, trunc((cast(trim(both ' ' from r.human_sciences_score) as float) / 1.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'Ciências Humanas'
where 
  r.year = 2011 and r.present_in_human_sciences_exam = 1
group by 
  r.school_id, r.year, es.id, trunc((cast(trim(both ' ' from r.human_sciences_score) as float) / 1.0000000001) / 100 + 1)
order by 
  4;

-- Linguagens e Códigos
insert into 
  aggregated_scores_by_school
select 
  r.school_id, r.year, es.id, trunc((cast(trim(both ' ' from r.languages_and_codes_score) as float) / 1.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'Linguagens e Códigos'
where 
  r.year = 2011 and r.present_in_languages_and_codes_exam = 1
group by 
  r.school_id, r.year, es.id, trunc((cast(trim(both ' ' from r.languages_and_codes_score) as float) / 1.0000000001) / 100 + 1)
order by 
  4;
  
-- Matemática
insert into 
  aggregated_scores_by_school
select 
  r.school_id, r.year, es.id, trunc((cast(trim(both ' ' from r.math_score) as float) / 1.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'Matemática'
where 
  r.year = 2011 and r.present_in_math_exam = 1
group by 
  r.school_id, r.year, es.id, trunc((cast(trim(both ' ' from r.math_score) as float) / 1.0000000001) / 100 + 1)
order by 
  4;

-----------
-- states
-----------

truncate table aggregated_scores_by_state;

-- Ciências da Natureza
insert into 
  aggregated_scores_by_state
select 
  r.state, r.year, es.id, trunc((cast(trim(both ' ' from r.nature_sciences_score) as float) / 1.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'Ciências da Natureza'
where 
  r.year = 2011 and r.present_in_nature_sciences_exam = 1
group by 
  r.state, r.year, es.id, trunc((cast(trim(both ' ' from r.nature_sciences_score) as float) / 1.0000000001) / 100 + 1)
order by 
  4;

-- Ciências Humanas
insert into 
  aggregated_scores_by_state
select 
  r.state, r.year, es.id, trunc((cast(trim(both ' ' from r.human_sciences_score) as float) / 1.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'Ciências Humanas'
where 
  r.year = 2011 and r.present_in_human_sciences_exam = 1
group by 
  r.state, r.year, es.id, trunc((cast(trim(both ' ' from r.human_sciences_score) as float) / 1.0000000001) / 100 + 1)
order by 
  4;

-- Linguagens e Códigos
insert into 
  aggregated_scores_by_state
select 
  r.state, r.year, es.id, trunc((cast(trim(both ' ' from r.languages_and_codes_score) as float) / 1.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'Linguagens e Códigos'
where 
  r.year = 2011 and r.present_in_languages_and_codes_exam = 1
group by 
  r.state, r.year, es.id, trunc((cast(trim(both ' ' from r.languages_and_codes_score) as float) / 1.0000000001) / 100 + 1)
order by 
  4;
  
-- Matemática
insert into 
  aggregated_scores_by_state
select 
  r.state, r.year, es.id, trunc((cast(trim(both ' ' from r.math_score) as float) / 1.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'Matemática'
where 
  r.year = 2011 and r.present_in_math_exam = 1
group by 
  r.state, r.year, es.id, trunc((cast(trim(both ' ' from r.math_score) as float) / 1.0000000001) / 100 + 1)
order by 
  4;

-----------
-- cities
-----------

truncate table aggregated_scores_by_city;

-- Ciências da Natureza
insert into 
  aggregated_scores_by_city
select 
  r.city_id, r.city, r.year, es.id, trunc((cast(trim(both ' ' from r.nature_sciences_score) as float) / 1.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'Ciências da Natureza'
where 
  r.year = 2011 and r.present_in_nature_sciences_exam = 1
group by 
  r.city_id, r.city, r.year, es.id, trunc((cast(trim(both ' ' from r.nature_sciences_score) as float) / 1.0000000001) / 100 + 1)
order by 
  5;

-- Ciências Humanas
insert into 
  aggregated_scores_by_city
select 
  r.city_id, r.city, r.year, es.id, trunc((cast(trim(both ' ' from r.human_sciences_score) as float) / 1.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'Ciências Humanas'
where 
  r.year = 2011 and r.present_in_human_sciences_exam = 1
group by 
  r.city_id, r.city, r.year, es.id, trunc((cast(trim(both ' ' from r.human_sciences_score) as float) / 1.0000000001) / 100 + 1)
order by 
  5;

-- Linguagens e Códigos
insert into 
  aggregated_scores_by_city
select 
  r.city_id, r.city, r.year, es.id, trunc((cast(trim(both ' ' from r.languages_and_codes_score) as float) / 1.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'Linguagens e Códigos'
where 
  r.year = 2011 and r.present_in_languages_and_codes_exam = 1
group by 
  r.city_id, r.city, r.year, es.id, trunc((cast(trim(both ' ' from r.languages_and_codes_score) as float) / 1.0000000001) / 100 + 1)
order by 
  5;
  
-- Matemática
insert into 
  aggregated_scores_by_city
select 
  r.city_id, r.city, r.year, es.id, trunc((cast(trim(both ' ' from r.math_score) as float) / 1.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'Matemática'
where 
  r.year = 2011 and r.present_in_math_exam = 1
group by 
  r.city_id, r.city, r.year, es.id, trunc((cast(trim(both ' ' from r.math_score) as float) / 1.0000000001) / 100 + 1)
order by 
  5;
