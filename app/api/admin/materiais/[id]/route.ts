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

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await context.params
  const supabase = await createClient()
  const { data, error } = await supabase.from('maint_materiais').select('*').eq('id', id).single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (utilizador.cargo !== 'admin') return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { id } = await context.params
  const supabase = await createAdminClient()

  // Eliminar definitivo. Se o material estiver associado a serviços, a FK bloqueia
  // (proteção) e devolvemos uma mensagem clara em vez de partir a base de dados.
  const { error } = await supabase
    .from('maint_materiais')
    .delete()
    .eq('id', id)

  if (error) {
    if (error.code === '23503') {
      return NextResponse.json({ error: 'Não é possível eliminar: este material está a ser usado em serviços. Remova-o desses serviços primeiro.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
