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

export async function GET(req: NextRequest) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const supabase = await createClient()

  let query = supabase.from('maint_materiais').select('*').order('nome')

  if (searchParams.get('ativo') !== 'all') query = query.eq('ativo', true)

  const q = searchParams.get('q')
  if (q) query = query.ilike('nome', `%${q}%`)

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
  const { nome, descricao, unidade, preco_unit, stock_atual, stock_minimo } = body

  if (!nome) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('maint_materiais')
    .insert({
      nome,
      descricao:    descricao    || null,
      unidade:      unidade      || 'un',
      preco_unit:   preco_unit   ? Number(preco_unit)   : 0,
      stock_atual:  stock_atual  ? Number(stock_atual)  : 0,
      stock_minimo: stock_minimo ? Number(stock_minimo) : 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!['admin', 'supervisor'].includes(utilizador.cargo)) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const body = await req.json()
  const { id, ...rest } = body
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const allowed = ['nome', 'descricao', 'unidade', 'preco_unit', 'stock_atual', 'stock_minimo', 'ativo']
  const updates: Record<string, unknown> = {}
  for (const k of allowed) {
    if (k in rest) updates[k] = rest[k] === '' ? null : rest[k]
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('maint_materiais')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
