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

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('maint_equipas')
    .select('*')
    .order('nome')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const { nome, descricao, cor, ativa } = await req.json()
  if (!nome) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('maint_equipas')
    .insert({ nome, descricao: descricao || null, cor: cor || '#3B82F6', ativa: ativa ?? true })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const { id, nome, descricao, cor, ativa } = await req.json()
  if (!id)   return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
  if (!nome) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('maint_equipas')
    .update({ nome, descricao: descricao || null, cor, ativa })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
