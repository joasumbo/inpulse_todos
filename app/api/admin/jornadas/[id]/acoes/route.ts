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

// GET — listar ações de uma jornada
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await context.params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('maint_acoes')
    .select('*')
    .eq('jornada_id', id)
    .order('inicio', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — iniciar uma ação
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await context.params
  const body = await req.json()
  const { tipo, descricao, imagem_url } = body

  const TIPOS_VALIDOS = ['viagem', 'trabalho', 'alimentacao', 'despesa']
  if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('maint_acoes')
    .insert({ jornada_id: id, tipo, descricao: descricao ?? null, imagem_url: imagem_url ?? null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
