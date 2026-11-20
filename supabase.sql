-- Ejecuta este script en Supabase: SQL Editor > New query > Run.
create table if not exists beers  (persona int primary key, n int not null default 0 check (n >= 0));
create table if not exists picks  (persona int not null, drink text not null, primary key (persona, drink));
create table if not exists drinks (name text primary key);
create table if not exists acts   (id bigserial primary key, name text not null, material text not null default '—', descr text not null default '—');

insert into drinks (name) values
  ('Coca-Cola original'),('Coca-Cola Zero'),('Fanta/Kas Naranja'),('Fanta/Kas Limón'),('Tónica'),('Sprite/7up')
on conflict do nothing;

create or replace function inc_beer(p int, d int) returns void language sql as $$
  insert into beers (persona, n) values (p, greatest(0, d))
  on conflict (persona) do update set n = greatest(0, beers.n + d);
$$;

-- Acceso abierto a quien tenga el enlace (app de un solo fin de semana, sin datos sensibles).
alter table beers enable row level security;  alter table picks enable row level security;
alter table drinks enable row level security; alter table acts enable row level security;
create policy "abierto" on beers  for all to anon using (true) with check (true);
create policy "abierto" on picks  for all to anon using (true) with check (true);
create policy "abierto" on drinks for all to anon using (true) with check (true);
create policy "abierto" on acts   for all to anon using (true) with check (true);
grant execute on function inc_beer(int, int) to anon;

-- Tiempo real: avisa a los móviles cuando algo cambia.
alter publication supabase_realtime add table beers, picks, drinks, acts;
