import { createBrowserClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Verificar variáveis apenas em runtime, não durante import
function checkEnvVars() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variáveis do Supabase não configuradas:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey
    })
    return false
  }
  return true
}

// Cliente para o browser (lazy initialization)
let _supabase: ReturnType<typeof createBrowserClient> | null = null

export const supabase = (() => {
  if (!_supabase && supabaseUrl && supabaseAnonKey) {
    _supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabase!
})()

// Cliente admin (apenas servidor)
export const supabaseAdmin = (supabaseServiceKey && supabaseUrl)
  ? createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  : null

// Export a function to create client instances
export function createClient() {
  if (!checkEnvVars()) {
    throw new Error('Variáveis de ambiente do Supabase não configuradas')
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
