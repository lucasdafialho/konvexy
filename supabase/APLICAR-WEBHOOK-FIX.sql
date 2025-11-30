-- ============================================================
-- SCRIPT COMPLETO PARA CORRIGIR O WEBHOOK DO MERCADO PAGO
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- Data: 2025-11-30
-- ============================================================

-- 1. ADICIONAR NOVAS COLUNAS NA TABELA PROFILES (se não existirem)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_status text,
ADD COLUMN IF NOT EXISTS last_payment_id text;

-- 2. ADICIONAR NOVAS COLUNAS NA TABELA SUBSCRIPTIONS (se não existirem)
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS mercadopago_payment_id text,
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS last_payment_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS last_payment_amount numeric(10, 2);

-- 3. CRIAR TABELA DE HISTÓRICO DE WEBHOOKS (para evitar duplicados)
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  webhook_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  payment_id text,
  status text NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
  raw_data jsonb,
  processed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ADICIONAR COLUNA raw_data SE A TABELA JÁ EXISTIA
ALTER TABLE public.webhook_events
ADD COLUMN IF NOT EXISTS raw_data jsonb;

-- 5. CRIAR ÍNDICES PARA MELHOR PERFORMANCE
CREATE INDEX IF NOT EXISTS webhook_events_webhook_id_idx ON public.webhook_events(webhook_id);
CREATE INDEX IF NOT EXISTS webhook_events_payment_id_idx ON public.webhook_events(payment_id);
CREATE INDEX IF NOT EXISTS webhook_events_created_at_idx ON public.webhook_events(created_at DESC);
CREATE INDEX IF NOT EXISTS webhook_events_status_idx ON public.webhook_events(status);

-- 6. LIMPAR POSSÍVEIS SUBSCRIPTIONS DUPLICADAS (manter apenas a mais recente)
WITH ranked_subs AS (
  SELECT id,
         user_id,
         status,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, status
           ORDER BY created_at DESC
         ) as rn
  FROM public.subscriptions
  WHERE status = 'active'
)
UPDATE public.subscriptions
SET status = 'cancelled'
WHERE id IN (
  SELECT id FROM ranked_subs WHERE rn > 1
);

-- 7. CRIAR CONSTRAINT ÚNICA PARA EVITAR MÚLTIPLAS SUBSCRIPTIONS ATIVAS POR USUÁRIO
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_user_active_unique_idx
ON public.subscriptions(user_id)
WHERE status = 'active';

-- 8. CRIAR ÍNDICE PARA BUSCAR SUBSCRIPTIONS POR PAYMENT_ID
CREATE INDEX IF NOT EXISTS subscriptions_payment_id_idx
ON public.subscriptions(mercadopago_payment_id)
WHERE mercadopago_payment_id IS NOT NULL;

-- 9. FUNÇÃO PARA LIMPAR WEBHOOKS ANTIGOS (mais de 30 dias)
CREATE OR REPLACE FUNCTION public.cleanup_old_webhooks()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.webhook_events
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND status = 'completed';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE public.webhook_events IS 'Histórico de webhooks recebidos do MercadoPago para evitar processamento duplicado';
COMMENT ON COLUMN public.webhook_events.webhook_id IS 'ID único do webhook gerado pela aplicação';
COMMENT ON COLUMN public.webhook_events.payment_id IS 'ID do pagamento no MercadoPago';
COMMENT ON COLUMN public.webhook_events.status IS 'Status do processamento: processing, completed, failed';
COMMENT ON COLUMN public.webhook_events.raw_data IS 'Payload completo do webhook recebido do MercadoPago';

COMMENT ON COLUMN public.profiles.subscription_status IS 'Status atual da assinatura do usuário';
COMMENT ON COLUMN public.profiles.last_payment_id IS 'ID do último pagamento processado';

COMMENT ON COLUMN public.subscriptions.mercadopago_payment_id IS 'ID do pagamento no MercadoPago';
COMMENT ON COLUMN public.subscriptions.payment_method IS 'Método de pagamento utilizado (credit_card, pix, etc)';
COMMENT ON COLUMN public.subscriptions.last_payment_date IS 'Data do último pagamento aprovado';
COMMENT ON COLUMN public.subscriptions.last_payment_amount IS 'Valor do último pagamento';

COMMENT ON INDEX subscriptions_user_active_unique_idx IS 'Garante que cada usuário tenha apenas uma subscription ativa por vez';
COMMENT ON INDEX subscriptions_payment_id_idx IS 'Índice para buscar subscriptions por ID de pagamento do MercadoPago';
COMMENT ON FUNCTION public.cleanup_old_webhooks() IS 'Remove webhooks processados com sucesso há mais de 30 dias';

-- ============================================================
-- VERIFICAÇÕES (Execute após o script para confirmar)
-- ============================================================

-- Verificar se a tabela webhook_events foi criada corretamente:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'webhook_events';

-- Verificar se há duplicatas de subscriptions ativas (deve retornar 0):
-- SELECT user_id, COUNT(*) as count FROM subscriptions WHERE status = 'active' GROUP BY user_id HAVING COUNT(*) > 1;

-- Verificar se as colunas foram adicionadas nos profiles:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name IN ('subscription_status', 'last_payment_id');

-- ============================================================
-- SCRIPT CONCLUÍDO!
-- ============================================================

