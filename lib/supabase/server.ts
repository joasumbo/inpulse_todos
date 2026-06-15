import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

// Cliente com a SERVICE ROLE — ignora RLS para operações privilegiadas (admin).
// CRÍTICO: NÃO passar os cookies/sessão do utilizador aqui. Se a sessão for
// anexada, o token do utilizador sobrepõe-se à service role e os pedidos voltam
// a ficar sujeitos a RLS — o que fazia o DELETE afetar 0 linhas em silêncio
// (apagava na UI mas não na base de dados). Mantém-se síncrono; os callers
// continuam a poder usar `await createAdminClient()` sem alterações.
export function createAdminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
