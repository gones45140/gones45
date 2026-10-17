-- BET45 — table du statut « soutien » (à lancer UNE fois, sans risque si elle existe déjà)
create table if not exists public.user_supporter (
  user_id uuid primary key references auth.users(id) on delete cascade,
  soutien boolean not null default false,
  cree_le timestamptz not null default now()
);

alter table public.user_supporter enable row level security;

-- Chacun peut lire SA ligne seulement. Aucune règle d'écriture : l'appli ne peut rien modifier.
drop policy if exists "lire mon statut" on public.user_supporter;
create policy "lire mon statut" on public.user_supporter
  for select using (auth.uid() = user_id);
