import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

async function getUtilizador() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('maint_utilizadores')
    .select('id, cargo')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .single()
  return data ?? null
}

const SELECT = `
  *,
  loja:maint_lojas(id, nome),
  equipa:maint_equipas(id, nome, cor),
  tecnico:maint_utilizadores!tecnico_responsavel_id(id, nome),
  criador:maint_utilizadores!criado_por(id, nome)
`.trim()

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('maint_servicos')
    .select(SELECT)
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const allowed = ['titulo', 'descricao', 'loja_id', 'equipa_id', 'tecnico_responsavel_id',
                   'estado', 'prioridade', 'tipo', 'data_prevista', 'data_inicio', 'data_fim',
                   'horas_trabalhadas', 'custo_materiais', 'custo_mao_obra', 'observacoes']
  const updates: Record<string, unknown> = {}
  for (const k of allowed) {
    if (k in body) updates[k] = body[k] === '' ? null : body[k]
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('maint_servicos')
    .update(updates)
    .eq('id', id)
    .select(SELECT)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (utilizador.cargo !== 'admin') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('maint_servicos')
    .delete()
    .eq('id', id)

  if (error) {
    if (error.code === '23503') {
      return NextResponse.json({ error: 'Não é possível eliminar: há registos associados a este serviço.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
