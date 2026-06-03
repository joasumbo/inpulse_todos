import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import UtilizadoresClient from './UtilizadoresClient'

export const metadata = { title: 'Utilizadores' }

export default async function UtilizadoresPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')
  const user = session.user

  const { data: perfil } = await supabase
    .from('maint_utilizadores')
    .select('cargo')
    .eq('user_id', user.id)
    .single()

  if (perfil?.cargo !== 'admin') redirect('/dashboard')

  const { data: utilizadores } = await supabase
    .from('maint_utilizadores')
    .select('*')
    .order('nome')

  return <UtilizadoresClient utilizadores={utilizadores ?? []} />
}
