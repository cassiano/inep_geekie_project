drop table if exists dim_schools;

create table dim_schools as
  select distinct 
    0 as id,  -- Autonumbered PK. Will be updated later on!
    es.school_code as code, 
    coalesce(
      trim(s.name), 
      '[ESCOLA ' || es.school_code || ' (' || trim(es.city) || '-' || es.state || ')'
    ) as name,
    es.city_code, 
    trim(es.city) as city, 
    es.state
  from
    raw_enem_scores es left outer join raw_schools s on es.school_code = s.code
  where
    es.school_code is not null and trim(es.school_code) <> '.'
  order by
    2;

drop sequence if exists temp_seq;
create temp sequence temp_seq;

update dim_schools set id = nextval('temp_seq');

alter table dim_schools add primary key (id);
create unique index dim_schools_code on dim_schools(code);
create index dim_schools_state on dim_schools(state);
create index dim_schools_city_code on dim_schools(city_code);
