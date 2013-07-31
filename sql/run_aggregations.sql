-----------
-- schools
-----------

-- ciencias da natureza
insert into 
  aggregated_scores_by_school
select 
  r.school_id, r.year, es.id, trunc((cast(r.nature_sciences_score as float) - 0.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'ciencias da natureza'
where 
  r.year = 2011 and r.nature_sciences_score is not null 
group by 
  s.id, r.year, es.id, trunc((cast(r.nature_sciences_score as float) - 0.0000000001) / 100 + 1)
order by 
  4;

-- ciencias humanas
insert into 
  aggregated_scores_by_school
select 
  r.school_id, r.year, es.id, trunc((cast(r.nature_sciences_score as float) - 0.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'ciencias humanas'
where 
  r.year = 2011 and r.nature_sciences_score is not null 
group by 
  r.school_id, r.year, es.id, trunc((cast(r.nature_sciences_score as float) - 0.0000000001) / 100 + 1)
order by 
  4;

-- linguagens e codigos
insert into 
  aggregated_scores_by_school
select 
  r.school_id, r.year, es.id, trunc((cast(r.nature_sciences_score as float) - 0.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'linguagens e codigos'
where 
  r.year = 2011 and r.nature_sciences_score is not null 
group by 
  r.school_id, r.year, es.id, trunc((cast(r.nature_sciences_score as float) - 0.0000000001) / 100 + 1)
order by 
  4;
  
-- matematica
insert into 
  aggregated_scores_by_school
select 
  r.school_id, r.year, es.id, trunc((cast(r.math_score as float) - 0.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'matematica'
where 
  r.year = 2011 and r.math_score is not null 
group by 
  r.school_id, r.year, es.id, trunc((cast(r.math_score as float) - 0.0000000001) / 100 + 1)
order by 
  4;

-----------
-- states
-----------

-- ciencias da natureza
insert into 
  aggregated_scores_by_state
select 
  r.state, r.year, es.id, trunc((cast(r.nature_sciences_score as float) - 0.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'ciencias da natureza'
where 
  r.year = 2011 and r.nature_sciences_score is not null 
group by 
  r.state, r.year, es.id, trunc((cast(r.nature_sciences_score as float) - 0.0000000001) / 100 + 1)
order by 
  4;

-- ciencias humanas
insert into 
  aggregated_scores_by_state
select 
  r.state, r.year, es.id, trunc((cast(r.nature_sciences_score as float) - 0.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'ciencias humanas'
where 
  r.year = 2011 and r.nature_sciences_score is not null 
group by 
  r.state, r.year, es.id, trunc((cast(r.nature_sciences_score as float) - 0.0000000001) / 100 + 1)
order by 
  4;

-- linguagens e codigos
insert into 
  aggregated_scores_by_state
select 
  r.state, r.year, es.id, trunc((cast(r.nature_sciences_score as float) - 0.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'linguagens e codigos'
where 
  r.year = 2011 and r.nature_sciences_score is not null 
group by 
  r.state, r.year, es.id, trunc((cast(r.nature_sciences_score as float) - 0.0000000001) / 100 + 1)
order by 
  4;
  
-- matematica
insert into 
  aggregated_scores_by_state
select 
  r.state, r.year, es.id, trunc((cast(r.math_score as float) - 0.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'matematica'
where 
  r.year = 2011 and r.math_score is not null 
group by 
  r.state, r.year, es.id, trunc((cast(r.math_score as float) - 0.0000000001) / 100 + 1)
order by 
  4;

-----------
-- cities
-----------

-- ciencias da natureza
insert into 
  aggregated_scores_by_city
select 
  r.city_id, r.city, r.year, es.id, trunc((cast(r.nature_sciences_score as float) - 0.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'ciencias da natureza'
where 
  r.year = 2011 and r.nature_sciences_score is not null 
group by 
  r.city_id, r.city, r.year, es.id, trunc((cast(r.nature_sciences_score as float) - 0.0000000001) / 100 + 1)
order by 
  5;

-- ciencias humanas
insert into 
  aggregated_scores_by_city
select 
  r.city_id, r.city, r.year, es.id, trunc((cast(r.nature_sciences_score as float) - 0.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'ciencias humanas'
where 
  r.year = 2011 and r.nature_sciences_score is not null 
group by 
  r.city_id, r.city, r.year, es.id, trunc((cast(r.nature_sciences_score as float) - 0.0000000001) / 100 + 1)
order by 
  5;

-- linguagens e codigos
insert into 
  aggregated_scores_by_city
select 
  r.city_id, r.city, r.year, es.id, trunc((cast(r.nature_sciences_score as float) - 0.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'linguagens e codigos'
where 
  r.year = 2011 and r.nature_sciences_score is not null 
group by 
  r.city_id, r.city, r.year, es.id, trunc((cast(r.nature_sciences_score as float) - 0.0000000001) / 100 + 1)
order by 
  5;
  
-- matematica
insert into 
  aggregated_scores_by_city
select 
  r.city_id, r.city, r.year, es.id, trunc((cast(r.math_score as float) - 0.0000000001) / 100 + 1), count(*)
from 
  raw_enem_scores r inner join enem_subjects es on es.name = 'matematica'
where 
  r.year = 2011 and r.math_score is not null 
group by 
  r.city_id, r.city, r.year, es.id, trunc((cast(r.math_score as float) - 0.0000000001) / 100 + 1)
order by 
  5;
