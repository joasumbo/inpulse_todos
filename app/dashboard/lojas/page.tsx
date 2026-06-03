import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LojasClient from './LojasClient'

export const metadata = { title: 'Lojas' }

export default async function LojasPage() {
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

  const { data: lojas } = await supabase
    .from('maint_lojas')
    .select('*')
    .order('nome')

  return <LojasClient lojas={lojas ?? []} />
}
