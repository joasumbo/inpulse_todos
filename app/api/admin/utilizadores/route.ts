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

// GET — listar utilizadores
export async function GET() {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('maint_utilizadores')
    .select('*')
    .order('nome')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST — criar utilizador
export async function POST(req: NextRequest) {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const body = await req.json()
  const { nome, username, password, telefone, cargo, notas } = body

  if (!nome || !username || !password || !cargo) {
    return NextResponse.json({ error: 'Campos obrigatórios em falta' }, { status: 400 })
  }

  const slug = username.toLowerCase().replace(/[^a-z0-9._-]/g, '')
  if (!slug) return NextResponse.json({ error: 'Username inválido' }, { status: 400 })

  const internalEmail = `${slug}@inpulse.app`
  const supabaseAdmin = await createAdminClient()

  // Criar utilizador no Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: internalEmail,
    password,
    email_confirm: true,
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  // Criar perfil na tabela maint_utilizadores
  const { data, error } = await supabaseAdmin
    .from('maint_utilizadores')
    .insert({ nome, username: slug, email: internalEmail, telefone, cargo, notas, user_id: authData.user.id })
    .select()
    .single()

  if (error) {
    // Reverter criação no Auth se o perfil falhar
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

// PATCH — editar utilizador
export async function PATCH(req: NextRequest) {
  const admin = await verificarAdmin()
  if (!admin) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

  const body = await req.json()
  const { id, nome, telefone, cargo, notas, ativo, username, password } = body

  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
  if (password && String(password).length < 6) {
    return NextResponse.json({ error: 'A password deve ter pelo menos 6 caracteres' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  // Obter o registo atual para o user_id (necessário para alterar Auth) e username
  const { data: existente, error: fetchErr } = await supabase
    .from('maint_utilizadores')
    .select('user_id, username')
    .eq('id', id)
    .single()

  if (fetchErr || !existente) {
    return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 })
  }

  const updates: Record<string, unknown> = { nome, telefone, cargo, notas, ativo }

  // Username (e respetivo email interno) — só se mudou
  let novoEmail: string | undefined
  if (typeof username === 'string' && username.trim()) {
    const slug = username.toLowerCase().replace(/[^a-z0-9._-]/g, '')
    if (!slug) return NextResponse.json({ error: 'Username inválido' }, { status: 400 })
    if (slug !== existente.username) {
      updates.username = slug
      novoEmail = `${slug}@inpulse.app`
      updates.email = novoEmail
    }
  }

  // Alterações de Auth (email/password) — requerem user_id
  if (existente.user_id && (novoEmail || password)) {
    const authUpdate: { email?: string; password?: string } = {}
    if (novoEmail) authUpdate.email = novoEmail
    if (password)  authUpdate.password = String(password)
    const { error: authErr } = await supabase.auth.admin.updateUserById(existente.user_id, authUpdate)
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('maint_utilizadores')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
