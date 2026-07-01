# Segurança & Checklist de Deploy — Konvexy

Estado: pagamento 100% Stripe (MercadoPago removido). Build de produção limpo, typecheck sem erros.

## ⚠️ Antes de liberar para o cliente (obrigatório)

1. **Rodar a migração RLS** no SQL Editor do Supabase de produção:
   `supabase/migrations/004_lock_plan_escalation.sql`
   Sem ela, um usuário autenticado consegue se auto-promover a Pro editando
   `profiles.plan` direto pela anon key (RLS restringe linha, não coluna).
   A migração instala trigger que congela `plan`/`subscription_status`/`last_payment_id`
   fora do `service_role` e tranca escrita em `subscriptions`.

2. **Configurar variáveis de ambiente** (ver `env.example`):
   - `CSRF_SECRET` — hex fixo de 64 chars. Sem ele, tokens CSRF quebram entre instâncias serverless.
   - `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_STARTER_PRICE_ID`, `STRIPE_PRO_PRICE_ID`
   - `GEMINI_API_KEY`
   - `REDIS_STORAGE_REDIS_URL` — rate limiting distribuído (sem ele cai p/ memória, não recomendado em prod)
   - `NEXT_PUBLIC_APP_URL`

3. **Webhook Stripe**: apontar o endpoint do Stripe para `/api/stripe/webhook` e assinar
   os eventos `checkout.session.completed`, `invoice.payment_succeeded`,
   `customer.subscription.updated`, `customer.subscription.deleted`.

## Controles implementados

### Pagamento (Stripe)
- Webhook valida assinatura via `stripe.webhooks.constructEvent` (rejeita sem `stripe-signature`/secret).
- Só ativa plano com `payment_status === 'paid'` (boleto/PIX pendentes não liberam acesso).
- Casa usuário por `user_id` (metadata), com email como fallback.
- Rebaixa para `free` em `canceled`/`unpaid`/`incomplete_expired` e no `subscription.deleted`.
- Checkout e customer-portal: exigem sessão autenticada + CSRF + rate limit; email vem da sessão, nunca do body.

### Auth / dados
- RLS: SELECT/UPDATE só da própria linha; colunas privilegiadas protegidas por trigger; subscriptions só `service_role` escreve.
- Rotas de geração: auth + CSRF + rate limit por usuário + validação Zod.
- `security_audit_log` com RLS `service_role`-only.
- Logout limpa sessão/local/cookies globalmente.

### Aplicação
- Headers: HSTS, X-Frame-Options DENY, X-Content-Type-Options, CSP restrita (Stripe/Supabase/Gemini), Referrer-Policy.
- Sanitização de input (perfil, settings, copy) e de conteúdo gerado por IA.
- Clientes Stripe/Supabase com init lazy — sem crash de cold start se env faltar.
- Rate limit Redis endurecido p/ serverless (fail-fast, sem travar request).
- `CSRF_SECRET` ausente em produção emite alerta explícito no log.

## Notas de arquitetura

- **Não há fila (queue)**: o webhook Stripe processa inline. É seguro porque o Stripe
  reenvia eventos que falham e o processamento é idempotente (sobrescreve estado, não acumula).
  Uma fila só seria necessária em volume muito alto — não é o caso hoje.
- Rate limiting usa `ioredis`. Em serverless de volume alto, avaliar migrar para
  Upstash REST (client HTTP, sem socket persistente).

## Verificação local

```bash
# typecheck
npx tsc --noEmit
# build de produção
npx next build
```
