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

export async function GET(req: NextRequest) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const supabase = await createClient()

  let query = supabase
    .from('maint_servicos')
    .select(SELECT)
    .order('created_at', { ascending: false })

  const estado = searchParams.get('estado')
  if (estado) query = query.eq('estado', estado)

  const equipa_id = searchParams.get('equipa_id')
  if (equipa_id) query = query.eq('equipa_id', equipa_id)

  const loja_id = searchParams.get('loja_id')
  if (loja_id) query = query.eq('loja_id', loja_id)

  const prioridade = searchParams.get('prioridade')
  if (prioridade) query = query.eq('prioridade', prioridade)

  const q = searchParams.get('q')
  if (q) query = query.ilike('titulo', `%${q}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!['admin', 'supervisor'].includes(utilizador.cargo)) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const body = await req.json()
  const { titulo, descricao, loja_id, equipa_id, tecnico_responsavel_id,
          estado, prioridade, tipo, data_prevista, observacoes } = body

  if (!titulo)   return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
  if (!loja_id)  return NextResponse.json({ error: 'Loja é obrigatória' }, { status: 400 })

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('maint_servicos')
    .insert({
      titulo,
      descricao:              descricao || null,
      loja_id,
      equipa_id:              equipa_id || null,
      tecnico_responsavel_id: tecnico_responsavel_id || null,
      estado:                 estado || 'pendente',
      prioridade:             prioridade || 'normal',
      tipo:                   tipo || null,
      data_prevista:          data_prevista || null,
      observacoes:            observacoes || null,
      criado_por:             utilizador.id,
    })
    .select(SELECT)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!['admin', 'supervisor', 'tecnico'].includes(utilizador.cargo)) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const body = await req.json()
  const { id, ...rest } = body
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const isTecnico = utilizador.cargo === 'tecnico'
  const allowed = isTecnico
    ? ['estado', 'data_prevista', 'data_inicio', 'data_fim', 'horas_trabalhadas', 'observacoes']
    : ['titulo', 'descricao', 'loja_id', 'equipa_id', 'tecnico_responsavel_id',
       'estado', 'prioridade', 'tipo', 'data_prevista', 'data_inicio', 'data_fim',
       'horas_trabalhadas', 'custo_materiais', 'custo_mao_obra', 'observacoes']

  const updates: Record<string, unknown> = {}
  for (const k of allowed) {
    if (k in rest) updates[k] = rest[k] === '' ? null : rest[k]
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
