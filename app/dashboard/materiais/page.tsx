import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MateriaisClient from './MateriaisClient'

export const metadata = { title: 'Materiais' }

export default async function MateriaisPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: perfil } = await supabase
    .from('maint_utilizadores')
    .select('id, cargo')
    .eq('user_id', session.user.id)
    .eq('ativo', true)
    .single()

  if (!perfil) redirect('/dashboard')
  if (perfil.cargo !== 'admin' && perfil.cargo !== 'supervisor') redirect('/dashboard')

  const { data: materiais } = await supabase
    .from('maint_materiais')
    .select('*')
    .order('nome')

  return (
    <MateriaisClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      materiais={(materiais ?? []) as any}
      cargo={perfil.cargo}
    />
  )
}
