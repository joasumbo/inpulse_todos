import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import JornadaClient from './JornadaClient'

export const metadata = { title: 'Jornada de Trabalho' }

export default async function JornadaPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: perfil } = await supabase
    .from('maint_utilizadores')
    .select('id, cargo, nome')
    .eq('user_id', session.user.id)
    .eq('ativo', true)
    .single()

  if (!perfil) redirect('/dashboard')

  // For admins, also fetch all active users for the selector
  let funcionarios: { id: string; nome: string }[] = []
  if (perfil.cargo === 'admin') {
    const { data } = await supabase
      .from('maint_utilizadores')
      .select('id, nome')
      .eq('ativo', true)
      .order('nome')
    funcionarios = data ?? []
  }

  return (
    <JornadaClient
      utilizadorId={perfil.id}
      utilizadorNome={perfil.nome}
      cargo={perfil.cargo}
      funcionarios={funcionarios}
    />
  )
}
