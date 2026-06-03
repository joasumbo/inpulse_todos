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

const SELECT = '*, material:maint_materiais(id, referencia, nome, unidade, stock_atual)'

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await context.params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('maint_servico_materiais')
    .select(SELECT)
    .eq('servico_id', id)
    .order('created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await context.params
  const body = await req.json()
  const { material_id, quantidade, preco_unit } = body

  if (!material_id) return NextResponse.json({ error: 'Material obrigatório' }, { status: 400 })
  if (!quantidade || Number(quantidade) <= 0) return NextResponse.json({ error: 'Quantidade inválida' }, { status: 400 })

  const supabase = await createAdminClient()

  const { data: existing } = await supabase
    .from('maint_servico_materiais')
    .select('id')
    .eq('servico_id', id)
    .eq('material_id', material_id)
    .maybeSingle()

  let data, error
  if (existing) {
    ;({ data, error } = await supabase
      .from('maint_servico_materiais')
      .update({ quantidade: Number(quantidade), preco_unit: preco_unit ? Number(preco_unit) : 0 })
      .eq('id', existing.id)
      .select(SELECT)
      .single())
  } else {
    ;({ data, error } = await supabase
      .from('maint_servico_materiais')
      .insert({ servico_id: id, material_id, quantidade: Number(quantidade), preco_unit: preco_unit ? Number(preco_unit) : 0 })
      .select(SELECT)
      .single())
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: existing ? 200 : 201 })
}
