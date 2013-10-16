drop table if exists facts_enem_subscriptions;

create table facts_enem_subscriptions as
  select 
    es.subscription_code as id,
    es.year,
    ds.id as school_id,
    nat.id as nature_sciences_score_id,
    his.id as human_sciences_score_id,
    lan.id as languages_and_codes_score_id,
    mat.id as math_score_id
  from
    raw_enem_scores es 
  left outer join 
    dim_schools ds on es.school_code = ds.code
  left outer join 
    dim_nature_sciences_scores nat on es.present_in_nature_sciences_exam = 1 and cast(nullif(trim(es.nature_sciences_score), '.') as float) = nat.score
  left outer join 
    dim_human_sciences_scores his on es.present_in_human_sciences_exam = 1 and cast(nullif(trim(es.human_sciences_score), '.') as float) = his.score
  left outer join 
    dim_languages_and_codes_scores lan on es.present_in_languages_and_codes_exam = 1 and cast(nullif(trim(es.languages_and_codes_score), '.') as float) = lan.score
  left outer join 
    dim_math_scores mat on es.present_in_math_exam = 1 and cast(nullif(trim(es.math_score), '.') as float) = mat.score;

alter table facts_enem_subscriptions add primary key (id);
alter table facts_enem_subscriptions add constraint school_id foreign key (school_id) references dim_schools (id) match full;
alter table facts_enem_subscriptions add constraint nature_sciences_score_id foreign key (nature_sciences_score_id) references dim_nature_sciences_scores (id) match full;
alter table facts_enem_subscriptions add constraint human_sciences_score_id foreign key (human_sciences_score_id) references dim_human_sciences_scores (id) match full;
alter table facts_enem_subscriptions add constraint languages_and_codes_score_id foreign key (languages_and_codes_score_id) references dim_languages_and_codes_scores (id) match full;
alter table facts_enem_subscriptions add constraint math_score_id foreign key (math_score_id) references dim_math_scores (id) match full;

create index facts_enem_subscriptions_year on facts_enem_subscriptions(year);
create index facts_enem_subscriptions_school_id on facts_enem_subscriptions(school_id);
create index facts_enem_subscriptions_nature_sciences_score_id on facts_enem_subscriptions(nature_sciences_score_id);
create index facts_enem_subscriptions_human_sciences_score_id on facts_enem_subscriptions(human_sciences_score_id);
create index facts_enem_subscriptions_languages_and_codes_score_id on facts_enem_subscriptions(languages_and_codes_score_id);
create index facts_enem_subscriptions_math_score_id on facts_enem_subscriptions(math_score_id);
