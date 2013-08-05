select 
  n.range1, count(*)
from 
  facts_enem_subscriptions f 
inner join 
  dim_nature_sciences_scores n on f.nature_sciences_score_id = n.id
inner join 
  dim_schools s on f.school_id = s.id
where 
  s.state = 'SP'
group by 
  n.range1
order by 
  n.range1;