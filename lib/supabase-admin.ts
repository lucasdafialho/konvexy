import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Cliente Supabase Admin (com service role key)
 * Usado apenas no servidor para operações privilegiadas
 */
function createSupabaseAdmin() {
  if (!supabaseUrl) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL não configurado')
    return null
  }

  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurado - webhook não funcionará')
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Cria o cliente admin (pode ser null se não configurado)
const _supabaseAdmin = createSupabaseAdmin()

/**
 * Retorna o cliente Supabase Admin
 * @throws Error se não estiver configurado
 */
export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não configurado - verifique as variáveis de ambiente')
  }
  return _supabaseAdmin
}

// Export direto - pode ser null, mas não crashará o import
export const supabaseAdmin = _supabaseAdmin!

// Export para verificação
export const isSupabaseAdminConfigured = !!_supabaseAdmin
