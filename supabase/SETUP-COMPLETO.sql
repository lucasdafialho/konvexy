-- =====================================================================
-- KONVEXY — SETUP COMPLETO (schema + segurança consolidados)
-- =====================================================================
-- Rode UMA vez no SQL Editor do projeto Supabase novo.
--
-- Idempotente: seguro em banco vazio OU depois de restaurar um backup
-- (recria funções/triggers/policies, substituindo as antigas vulneráveis
-- pelas versões blindadas). NÃO apaga dados.
--
-- Inclui a correção crítica de RLS (antiga migration 004): usuário NÃO
-- consegue se auto-promover de plano nem escrever em subscriptions.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Extensões
-- ---------------------------------------------------------------------
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. Tabelas
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text not null,
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro')),
  generations_used integer not null default 0,
  subscription_status text,
  last_payment_id text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);
-- Colunas extras (caso a tabela venha de um backup antigo)
alter table public.profiles add column if not exists subscription_status text;
alter table public.profiles add column if not exists last_payment_id text;

create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan_type text not null check (plan_type in ('starter', 'pro')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'expired')),
  mercadopago_subscription_id text, -- legado: hoje guarda ID do Stripe
  mercadopago_payment_id text,      -- legado: hoje guarda ID do Stripe
  payment_method text,
  last_payment_date timestamptz,
  last_payment_amount numeric(10, 2),
  started_at timestamptz not null default timezone('utc'::text, now()),
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);
alter table public.subscriptions add column if not exists mercadopago_subscription_id text;
alter table public.subscriptions add column if not exists mercadopago_payment_id text;
alter table public.subscriptions add column if not exists payment_method text;
alter table public.subscriptions add column if not exists last_payment_date timestamptz;
alter table public.subscriptions add column if not exists last_payment_amount numeric(10, 2);

create table if not exists public.webhook_events (
  id uuid default uuid_generate_v4() primary key,
  webhook_id text not null unique,
  event_type text not null,
  payment_id text,
  status text not null check (status in ('processing', 'completed', 'failed')),
  raw_data jsonb,
  processed_at timestamptz not null default timezone('utc'::text, now()),
  created_at timestamptz not null default timezone('utc'::text, now())
);
alter table public.webhook_events add column if not exists raw_data jsonb;

create table if not exists public.generations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('ads', 'copy', 'funnel', 'canvas')),
  content jsonb not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.security_audit_log (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  user_id uuid,
  email text,
  ip_address text not null,
  user_agent text,
  details jsonb,
  severity text check (severity in ('low', 'medium', 'high', 'critical')),
  created_at timestamptz not null default now()
);

create table if not exists public.business_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name varchar(100) not null,
  is_default boolean default false,
  company_name varchar(200),
  company_description text,
  niche varchar(100),
  target_audience text,
  product_name varchar(200),
  product_description text,
  product_benefits text,
  product_price varchar(50),
  tone varchar(50) default 'professional',
  voice_style text,
  keywords text[],
  tags text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_used_at timestamptz,
  usage_count integer default 0,
  constraint unique_template_name_per_user unique(user_id, name)
);

-- ---------------------------------------------------------------------
-- 2. Índices
-- ---------------------------------------------------------------------
create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists idx_profiles_plan on public.profiles(plan);
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);
create unique index if not exists subscriptions_user_active_unique_idx
  on public.subscriptions(user_id) where status = 'active';
create index if not exists subscriptions_payment_id_idx
  on public.subscriptions(mercadopago_payment_id) where mercadopago_payment_id is not null;
create index if not exists webhook_events_webhook_id_idx on public.webhook_events(webhook_id);
create index if not exists webhook_events_payment_id_idx on public.webhook_events(payment_id);
create index if not exists webhook_events_created_at_idx on public.webhook_events(created_at desc);
create index if not exists webhook_events_status_idx on public.webhook_events(status);
create index if not exists generations_user_id_idx on public.generations(user_id);
create index if not exists generations_created_at_idx on public.generations(created_at desc);
create index if not exists idx_generations_user_month on public.generations(user_id, created_at desc);
create index if not exists idx_security_audit_user_id on public.security_audit_log(user_id);
create index if not exists idx_security_audit_created_at on public.security_audit_log(created_at desc);
create index if not exists idx_business_templates_user_id on public.business_templates(user_id);

-- ---------------------------------------------------------------------
-- 3. Funções + triggers
-- ---------------------------------------------------------------------
-- updated_at automático
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();

-- Cria perfil automaticamente no signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, plan, generations_used)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    'free',
    0
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SEGURANÇA CRÍTICA: congela colunas privilegiadas contra edição pelo usuário.
-- Só o service_role (webhook Stripe / admin) altera plan/status de pagamento.
create or replace function public.protect_profile_privileged_columns()
returns trigger as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    new.plan                := old.plan;
    new.subscription_status := old.subscription_status;
    new.last_payment_id     := old.last_payment_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_protect_profile_columns on public.profiles;
create trigger trg_protect_profile_columns
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_columns();

-- Limpeza de webhooks antigos (opcional, via pg_cron)
create or replace function public.cleanup_old_webhooks()
returns integer as $$
declare deleted_count integer;
begin
  delete from public.webhook_events
  where created_at < now() - interval '30 days' and status = 'completed';
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$ language plpgsql security definer;

-- business_templates: updated_at + único default + contador de uso
create or replace function public.update_business_templates_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists business_templates_updated_at on public.business_templates;
create trigger business_templates_updated_at
  before update on public.business_templates
  for each row execute function public.update_business_templates_updated_at();

create or replace function public.ensure_single_default_template()
returns trigger as $$
begin
  if new.is_default = true then
    update public.business_templates
    set is_default = false
    where user_id = new.user_id and id != new.id and is_default = true;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists ensure_single_default_template_trigger on public.business_templates;
create trigger ensure_single_default_template_trigger
  before insert or update on public.business_templates
  for each row execute function public.ensure_single_default_template();

create or replace function public.increment_template_usage(template_id uuid)
returns void as $$
begin
  update public.business_templates
  set usage_count = usage_count + 1, last_used_at = now()
  where id = template_id;
end;
$$ language plpgsql security definer;

-- ---------------------------------------------------------------------
-- 4. RLS
-- ---------------------------------------------------------------------
alter table public.profiles           enable row level security;
alter table public.subscriptions      enable row level security;
alter table public.generations        enable row level security;
alter table public.security_audit_log enable row level security;
alter table public.business_templates enable row level security;
-- webhook_events: RLS ligado SEM policies para authenticated/anon.
-- Só o service_role (webhook) acessa — service_role ignora RLS.
alter table public.webhook_events     enable row level security;

-- PROFILES: select/update/insert própria linha. Colunas sensíveis
-- protegidas pelo trigger acima (RLS não filtra coluna).
drop policy if exists "Usuários podem ver seu próprio perfil" on public.profiles;
drop policy if exists "Usuários podem atualizar seu próprio perfil" on public.profiles;
drop policy if exists "Permitir leitura de perfis" on public.profiles;
drop policy if exists "Permitir criação de perfil" on public.profiles;
drop policy if exists "Permitir atualização de perfil" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_self" on public.profiles;
drop policy if exists "profiles_insert_on_signup" on public.profiles;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_insert_self" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

-- SUBSCRIPTIONS: leitura própria; escrita SOMENTE service_role
-- (ausência de policy de write = negado para authenticated).
drop policy if exists "Usuários podem ver suas próprias assinaturas" on public.subscriptions;
drop policy if exists "Usuários podem inserir suas próprias assinaturas" on public.subscriptions;
drop policy if exists "subscriptions_select_own" on public.subscriptions;
drop policy if exists "subscriptions_no_direct_insert" on public.subscriptions;
drop policy if exists "subscriptions_no_direct_update" on public.subscriptions;
drop policy if exists "subscriptions_no_direct_delete" on public.subscriptions;

create policy "subscriptions_select_own" on public.subscriptions
  for select to authenticated using (auth.uid() = user_id);

-- GENERATIONS: leitura/inserção própria (limite real aplicado no backend)
drop policy if exists "Usuários podem ver suas próprias gerações" on public.generations;
drop policy if exists "Usuários podem inserir suas próprias gerações" on public.generations;
drop policy if exists "generations_select_own" on public.generations;
drop policy if exists "generations_insert_own" on public.generations;
drop policy if exists "generations_insert_with_limits" on public.generations;

create policy "generations_select_own" on public.generations
  for select to authenticated using (auth.uid() = user_id);
create policy "generations_insert_own" on public.generations
  for insert to authenticated with check (auth.uid() = user_id);

-- SECURITY_AUDIT_LOG: só service_role
drop policy if exists "Service role pode inserir" on public.security_audit_log;
drop policy if exists "Service role pode ler" on public.security_audit_log;
create policy "audit_service_insert" on public.security_audit_log
  for insert with check (auth.role() = 'service_role');
create policy "audit_service_select" on public.security_audit_log
  for select using (auth.role() = 'service_role');

-- BUSINESS_TEMPLATES: CRUD da própria linha (gating de Pro é no app)
drop policy if exists "Users can view their own templates" on public.business_templates;
drop policy if exists "Users can create templates" on public.business_templates;
drop policy if exists "Users can update their own templates" on public.business_templates;
drop policy if exists "Users can delete their own templates" on public.business_templates;

create policy "templates_select_own" on public.business_templates
  for select to authenticated using (auth.uid() = user_id);
create policy "templates_insert_own" on public.business_templates
  for insert to authenticated with check (auth.uid() = user_id);
create policy "templates_update_own" on public.business_templates
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "templates_delete_own" on public.business_templates
  for delete to authenticated using (auth.uid() = user_id);

-- =====================================================================
-- FIM. Depois disso: configure Auth (Site URL + Redirect URLs) e as
-- envs na Vercel apontando pro novo projeto.
-- =====================================================================
