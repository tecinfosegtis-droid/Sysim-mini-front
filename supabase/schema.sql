
-- Habilitar extensões úteis (geração de UUID)
create extension if not exists "pgcrypto";

-- Enum para status das OS
do $$ begin
  create type status_os as enum ('Pendente','Em andamento','Concluído');
exception when duplicate_object then null; end $$;

-- Tabela de perfis (relacionada ao auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('admin','equipe','condominio')) default 'admin',
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
do $$ begin
  create policy "profiles_auth_read" on public.profiles for select to authenticated using (true);
  create policy "profiles_self_write" on public.profiles for update to authenticated using (auth.uid() = id);
exception when duplicate_object then null; end $$;

-- Condomínios
create table if not exists public.condominios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  endereco text,
  minutos_contratados_mes int default 0,
  created_at timestamptz default now()
);
alter table public.condominios enable row level security;
do $$ begin
  create policy "condominios_rw_auth" on public.condominios for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- Agendamentos (planejado)
create table if not exists public.agendamentos (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null references public.condominios(id) on delete cascade,
  inicio timestamptz not null,
  fim timestamptz not null,
  titulo text,
  created_at timestamptz default now()
);
alter table public.agendamentos enable row level security;
do $$ begin
  create policy "agendamentos_rw_auth" on public.agendamentos for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- Visitas (realizado) - com coluna gerada de duração em minutos
create table if not exists public.visitas (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null references public.condominios(id) on delete cascade,
  agendamento_id uuid references public.agendamentos(id) on delete set null,
  inicio timestamptz not null,
  fim timestamptz,
  duracao_min int generated always as (
    case when fim is not null then (extract(epoch from (fim - inicio))/60)::int else null end
  ) stored,
  created_at timestamptz default now()
);
alter table public.visitas enable row level security;
do $$ begin
  create policy "visitas_rw_auth" on public.visitas for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- OS
create table if not exists public.os (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null references public.condominios(id) on delete cascade,
  tarefas text[] default '{}',
  status status_os default 'Pendente',
  obs text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
do $$ begin
  create trigger trg_os_updated before update on public.os
  for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

alter table public.os enable row level security;
do $$ begin
  create policy "os_rw_auth" on public.os for all to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

-- Exemplo de dados (opcional). Ajuste datas para hoje.
-- Condomínios
insert into public.condominios (nome, endereco, minutos_contratados_mes)
values ('Tendence', 'Av. Exemplo, 123 - São Paulo', 600),
       ('Vitrali', 'Rua Teste, 456 - São Paulo', 480)
on conflict do nothing;

-- Agendamentos para hoje
insert into public.agendamentos (condominio_id, inicio, fim, titulo)
select c.id, date_trunc('day', now()) + interval '9 hours', date_trunc('day', now()) + interval '11 hours', 'Visita de rotina'
from public.condominios c where c.nome='Tendence'
on conflict do nothing;

insert into public.agendamentos (condominio_id, inicio, fim, titulo)
select c.id, date_trunc('day', now()) + interval '14 hours', date_trunc('day', now()) + interval '16 hours', 'Manutenção'
from public.condominios c where c.nome='Vitrali'
on conflict do nothing;
