import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Rota de setup do primeiro admin — só funciona se não existir nenhum admin
export async function POST(req: NextRequest) {
  const supabase = await createAdminClient()

  // Bloquear se já existir um admin
  const { count } = await supabase
    .from('maint_utilizadores')
    .select('*', { count: 'exact', head: true })
    .eq('cargo', 'admin')

  if (count && count > 0) {
    return NextResponse.json({ error: 'Setup já foi concluído.' }, { status: 403 })
  }

  const { nome, email, password } = await req.json()

  if (!nome || !email || !password) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 })
  }

  // Criar utilizador no Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  // Criar perfil admin
  const { error: profileError } = await supabase
    .from('maint_utilizadores')
    .insert({ nome, email, cargo: 'admin', user_id: authData.user.id })

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
