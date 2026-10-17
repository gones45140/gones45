-- BET45 — passer un compte en « soutien » avec son adresse mail
-- Remplace l'adresse ci-dessous, puis Run.
insert into public.user_supporter (user_id, soutien)
select id, true from auth.users where email = 'adresse@exemple.fr'
on conflict (user_id) do update set soutien = true;

-- Vérification : doit afficher la personne avec soutien = true
select u.email, s.soutien
from public.user_supporter s join auth.users u on u.id = s.user_id
where u.email = 'adresse@exemple.fr';
