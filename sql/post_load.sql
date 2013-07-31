-- cleanse 'ciências da natureza' scores.
update raw_enem_scores set nature_sciences_score = trim(both ' ' from nature_sciences_score) where nature_sciences_score is not null;
update raw_enem_scores set nature_sciences_score = null where nature_sciences_score = '.';

-- cleanse 'ciências humanas' scores.
update raw_enem_scores set human_sciences_score = trim(both ' ' from human_sciences_score) where human_sciences_score is not null;
update raw_enem_scores set human_sciences_score = null where human_sciences_score = '.';

-- cleanse 'linguagens e códigos' scores.
update raw_enem_scores set languages_and_codes_score = trim(both ' ' from languages_and_codes_score) where languages_and_codes_score is not null;
update raw_enem_scores set languages_and_codes_score = null where languages_and_codes_score = '.';

-- cleanse 'matemática' scores.
update raw_enem_scores set math_score = trim(both ' ' from math_score) where math_score is not null;
update raw_enem_scores set math_score = null where math_score = '.';
