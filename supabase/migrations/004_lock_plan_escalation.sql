-- =====================================================================
-- 004_lock_plan_escalation.sql
-- CORREÇÃO CRÍTICA DE SEGURANÇA
--
-- Problema: com a policy de UPDATE permissiva em `profiles`
-- (WITH CHECK auth.uid() = id), qualquer usuário autenticado podia,
-- usando a anon key + seu próprio JWT, executar:
--   supabase.from('profiles').update({ plan: 'pro' }).eq('id', <seu id>)
-- e virar Pro de graça. RLS restringe LINHAS, não COLUNAS — então a
-- coluna `plan` ficava editável pelo dono da linha.
--
-- Além disso, a policy de INSERT em `subscriptions` permitia o usuário
-- inserir uma assinatura 'active' falsa para si mesmo.
--
-- Esta migração fecha os dois vetores de forma robusta, independente de
-- qual policy esteja ativa hoje. Rode no SQL Editor do Supabase.
-- Substitui/consolida: fix-rls-policies.sql e improved-rls-policies.sql
-- (aquele usava OLD/NEW dentro de WITH CHECK, o que é inválido e falha).
-- =====================================================================

-- 1) Garantir RLS ligado
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.generations enable row level security;

-- 2) PROFILES: SELECT/UPDATE apenas da própria linha.
--    O controle de colunas sensíveis é feito pelo trigger abaixo,
--    não pela policy (RLS não filtra colunas).
drop policy if exists "Usuários podem ver seu próprio perfil" on public.profiles;
drop policy if exists "Usuários podem atualizar seu próprio perfil" on public.profiles;
drop policy if exists "Permitir leitura de perfis" on public.profiles;
drop policy if exists "Permitir criação de perfil" on public.profiles;
drop policy if exists "Permitir atualização de perfil" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_insert_on_signup" on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_insert_self"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- 3) Trigger: congela colunas sensíveis quando o UPDATE NÃO vem do
--    service_role (webhook Stripe / rotas admin usam service key).
--    Usuário comum pode editar name/email; plan e status de pagamento
--    voltam ao valor antigo silenciosamente.
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

-- 4) SUBSCRIPTIONS: leitura própria; escrita SOMENTE service_role.
--    (service_role ignora RLS, então nenhuma policy de escrita é
--     necessária — a ausência de policy = negado para anon/authenticated.)
drop policy if exists "Usuários podem ver suas próprias assinaturas" on public.subscriptions;
drop policy if exists "Usuários podem inserir suas próprias assinaturas" on public.subscriptions;
drop policy if exists "subscriptions_select_own" on public.subscriptions;
drop policy if exists "subscriptions_no_direct_insert" on public.subscriptions;
drop policy if exists "subscriptions_no_direct_update" on public.subscriptions;
drop policy if exists "subscriptions_no_direct_delete" on public.subscriptions;

create policy "subscriptions_select_own"
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

-- Sem policies de INSERT/UPDATE/DELETE para authenticated => bloqueado.

-- 5) GENERATIONS: leitura/inserção da própria linha (limite real é
--    aplicado no backend com service key + tabela generations).
drop policy if exists "Usuários podem ver suas próprias gerações" on public.generations;
drop policy if exists "Usuários podem inserir suas próprias gerações" on public.generations;
drop policy if exists "generations_select_own" on public.generations;
drop policy if exists "generations_insert_with_limits" on public.generations;
drop policy if exists "generations_no_update" on public.generations;
drop policy if exists "generations_no_delete" on public.generations;

create policy "generations_select_own"
  on public.generations for select
  to authenticated
  using (auth.uid() = user_id);

create policy "generations_insert_own"
  on public.generations for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Sem UPDATE/DELETE para authenticated => bloqueado.
