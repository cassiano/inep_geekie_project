create or replace view cities as
  select distinct 
    city_code as id,
    city as name,
    state
  from
    dim_schools
  order by
    3,
    2;
    
create or replace view states as
  select distinct 
    state
  from
    dim_schools
  order by
    1;