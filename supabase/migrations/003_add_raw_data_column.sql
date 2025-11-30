-- Migration: Adicionar coluna raw_data na tabela webhook_events
-- Data: 2025-11-30
-- Descrição: Adiciona coluna para armazenar o payload completo do webhook

-- 1. Adicionar coluna raw_data (se não existir)
ALTER TABLE public.webhook_events
ADD COLUMN IF NOT EXISTS raw_data jsonb;

-- 2. Comentário
COMMENT ON COLUMN public.webhook_events.raw_data IS 'Payload completo do webhook recebido do MercadoPago';

-- Rollback instructions (comentado):
-- Para reverter esta migration, execute:
/*
ALTER TABLE public.webhook_events DROP COLUMN IF EXISTS raw_data;
*/

