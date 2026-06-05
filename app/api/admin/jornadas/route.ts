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

// GET — listar jornadas (próprias ou de um funcionário se admin)
export async function GET(req: NextRequest) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const funcionarioId = searchParams.get('funcionario_id')

  const supabase = await createClient()
  let query = supabase
    .from('maint_jornadas')
    .select('*, funcionario:maint_utilizadores(id, nome)')
    .order('dia', { ascending: false })

  if (utilizador.cargo !== 'admin') {
    query = query.eq('funcionario_id', utilizador.id)
  } else if (funcionarioId) {
    query = query.eq('funcionario_id', funcionarioId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — criar ou obter jornada do dia
export async function POST(req: NextRequest) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const dia = body.dia ?? new Date().toISOString().slice(0, 10)
  const funcionarioId = utilizador.cargo === 'admin' && body.funcionario_id
    ? body.funcionario_id
    : utilizador.id

  const supabase = await createAdminClient()

  const { data: existing } = await supabase
    .from('maint_jornadas')
    .select('*')
    .eq('funcionario_id', funcionarioId)
    .eq('dia', dia)
    .maybeSingle()

  if (existing) return NextResponse.json(existing)

  const { data, error } = await supabase
    .from('maint_jornadas')
    .insert({ funcionario_id: funcionarioId, dia })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// PATCH — finalizar (fim = agora) ou reabrir (fim = null) a jornada do dia
export async function PATCH(req: NextRequest) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { id, fim } = body
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const supabase = await createAdminClient()

  // Só o próprio (ou admin) pode finalizar a jornada
  const { data: jornada } = await supabase
    .from('maint_jornadas')
    .select('funcionario_id')
    .eq('id', id)
    .maybeSingle()

  if (!jornada) return NextResponse.json({ error: 'Jornada não encontrada' }, { status: 404 })
  if (utilizador.cargo !== 'admin' && jornada.funcionario_id !== utilizador.id) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  // fim === null → reabrir; caso contrário usa o valor enviado ou agora
  const novoFim = fim === null ? null : (fim ?? new Date().toISOString())

  const { data, error } = await supabase
    .from('maint_jornadas')
    .update({ fim: novoFim })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE — eliminar uma jornada inteira (e as suas ações). Admin ou o próprio.
export async function DELETE(req: NextRequest) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const supabase = await createAdminClient()
  const { data: jornada } = await supabase
    .from('maint_jornadas')
    .select('funcionario_id')
    .eq('id', id)
    .maybeSingle()

  if (!jornada) return NextResponse.json({ error: 'Jornada não encontrada' }, { status: 404 })
  if (utilizador.cargo !== 'admin' && jornada.funcionario_id !== utilizador.id) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  // Apagar as ações primeiro (caso a FK não seja em cascade) e depois a jornada.
  await supabase.from('maint_acoes').delete().eq('jornada_id', id)
  const { error } = await supabase.from('maint_jornadas').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
