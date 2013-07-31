select 
  distinct r.school_id 
from 
  schools s right outer join raw_enem_scores r 
on 
  s.id = r.school_id 
where 
  s.id is null
order by
  1; 