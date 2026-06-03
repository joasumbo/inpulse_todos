import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

async function verificarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('maint_utilizadores')
    .select('cargo')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .single()

  return data?.cargo === 'admin' ? user : null
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('maint_equipa_utilizadores')
    .select('*, utilizador:maint_utilizadores(id, nome, cargo, email)')
    .eq('equipa_id', id)
    .eq('ativo', true)
    .order('data_entrada')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const { utilizador_id, cargo_na_equipa } = await req.json()
  if (!utilizador_id) return NextResponse.json({ error: 'utilizador_id obrigatório' }, { status: 400 })

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('maint_equipa_utilizadores')
    .upsert({
      equipa_id: id,
      utilizador_id,
      cargo_na_equipa: cargo_na_equipa || 'tecnico',
      ativo: true,
      data_entrada: new Date().toISOString().split('T')[0],
    }, { onConflict: 'equipa_id,utilizador_id' })
    .select('*, utilizador:maint_utilizadores(id, nome, cargo, email)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const { utilizador_id } = await req.json()
  if (!utilizador_id) return NextResponse.json({ error: 'utilizador_id obrigatório' }, { status: 400 })

  const supabase = await createAdminClient()
  const { error } = await supabase
    .from('maint_equipa_utilizadores')
    .update({ ativo: false })
    .eq('equipa_id', id)
    .eq('utilizador_id', utilizador_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
