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

// GET — listar lojas (todos os utilizadores ativos podem ver)
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, error } = await supabase
    .from('maint_lojas')
    .select('*')
    .order('nome')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — criar loja (admin only)
export async function POST(req: NextRequest) {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const body = await req.json()
  const { nome, codigo, morada, cidade, codigo_postal, pais, telefone, email_contacto, contacto_nome, notas, estado } = body

  if (!nome) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('maint_lojas')
    .insert({ nome, codigo: codigo || null, morada, cidade, codigo_postal, pais: pais || 'Portugal', telefone, email_contacto, contacto_nome, notas, estado: estado || 'ativa' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// PATCH — editar loja (admin only)
export async function PATCH(req: NextRequest) {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const body = await req.json()
  const { id, nome, codigo, morada, cidade, codigo_postal, pais, telefone, email_contacto, contacto_nome, notas, estado } = body

  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
  if (!nome) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('maint_lojas')
    .update({ nome, codigo: codigo || null, morada, cidade, codigo_postal, pais, telefone, email_contacto, contacto_nome, notas, estado })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
