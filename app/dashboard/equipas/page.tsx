import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EquipasClient from './EquipasClient'

export const metadata = { title: 'Equipas' }

export default async function EquipasPage() {
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

  const [{ data: equipas }, { data: utilizadores }, { data: membros }] = await Promise.all([
    supabase.from('maint_equipas').select('*').order('nome'),
    supabase.from('maint_utilizadores').select('id, nome, cargo, email').eq('ativo', true).order('nome'),
    supabase.from('maint_equipa_utilizadores').select('equipa_id').eq('ativo', true),
  ])

  const contagemMembros: Record<string, number> = {}
  for (const m of (membros ?? [])) {
    contagemMembros[m.equipa_id] = (contagemMembros[m.equipa_id] ?? 0) + 1
  }

  return (
    <EquipasClient
      equipas={equipas ?? []}
      utilizadores={utilizadores ?? []}
      contagemMembros={contagemMembros}
    />
  )
}
