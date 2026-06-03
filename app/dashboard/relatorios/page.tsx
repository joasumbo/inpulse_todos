import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RelatoriosClient from './RelatoriosClient'

export const metadata = { title: 'Relatórios' }

export default async function RelatoriosPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: perfil } = await supabase
    .from('maint_utilizadores')
    .select('cargo')
    .eq('user_id', session.user.id)
    .eq('ativo', true)
    .single()

  if (!perfil) redirect('/dashboard')
  if (perfil.cargo !== 'admin' && perfil.cargo !== 'supervisor') redirect('/dashboard')

  return <RelatoriosClient />
}
