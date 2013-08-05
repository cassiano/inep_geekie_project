﻿drop table if exists dim_human_sciences_scores;

create table dim_human_sciences_scores as
select distinct 
  0 as id,  -- Autonumbered PK. Will be updated later!
  
  cast(human_sciences_score as float) as score,

  cast(trunc((cast(human_sciences_score as float) / 1.0000000001) / 100 + 1) as smallint) as range1,

  cast(
    case when cast(human_sciences_score as float) >= 1000.0 then 
      9
    else
      trunc(cast(human_sciences_score as float) / 100) + 1
    end
   as smallint) as range2
from
  raw_enem_scores
where
  present_in_human_sciences_exam = 1
order by 
  2;

drop sequence if exists temp_seq;
create temp sequence temp_seq;

update dim_human_sciences_scores set id = nextval('temp_seq');

alter table dim_human_sciences_scores add primary key (id);
create index human_sciences_scores_range1 on dim_human_sciences_scores(range1);
create index human_sciences_scores_range2 on dim_human_sciences_scores(range2);
