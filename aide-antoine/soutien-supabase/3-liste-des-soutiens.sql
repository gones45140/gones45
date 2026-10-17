-- BET45 — liste des comptes « soutien »
select u.email, s.soutien
from public.user_supporter s join auth.users u on u.id = s.user_id
order by u.email;
