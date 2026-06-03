import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ServicosClient from './ServicosClient'

export const metadata = { title: 'Serviços' }

const SELECT_SERVICO = `
  *,
  loja:maint_lojas(id, nome),
  equipa:maint_equipas(id, nome, cor),
  tecnico:maint_utilizadores!tecnico_responsavel_id(id, nome),
  criador:maint_utilizadores!criado_por(id, nome)
`.trim()

export default async function ServicosPage() {
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

  const [{ data: servicos }, { data: lojas }, { data: equipasRaw }, { data: utilizadores }] =
    await Promise.all([
      supabase.from('maint_servicos').select(SELECT_SERVICO).order('created_at', { ascending: false }),
      supabase.from('maint_lojas').select('id, nome').eq('estado', 'ativa').order('nome'),
      supabase.from('maint_equipas').select('id, nome, cor').eq('ativa', true).order('nome'),
      supabase.from('maint_utilizadores').select('id, nome, cargo').eq('ativo', true).order('nome'),
    ])

  // Para técnicos, filtrar equipas às suas próprias
  let equipas = equipasRaw ?? []
  let equipaPadrao = ''
  if (perfil.cargo === 'tecnico') {
    const { data: membros } = await supabase
      .from('maint_equipa_utilizadores')
      .select('equipa_id')
      .eq('utilizador_id', perfil.id)
      .eq('ativo', true)
    const ids = (membros ?? []).map((m: { equipa_id: string }) => m.equipa_id)
    if (ids.length > 0) {
      equipas = equipas.filter(e => ids.includes(e.id))
      if (equipas.length === 1) equipaPadrao = equipas[0].id
    }
  }

  return (
    <ServicosClient
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      servicos={(servicos ?? []) as any}
      lojas={lojas ?? []}
      equipas={equipas}
      utilizadores={utilizadores ?? []}
      cargo={perfil.cargo}
      equipaPadrao={equipaPadrao}
    />
  )
}
