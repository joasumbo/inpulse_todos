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

// PATCH — finalizar ação (setar fim) ou atualizar descrição/imagem
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string; acaoId: string }> }
) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { acaoId } = await context.params
  const body = await req.json()

  const updates: Record<string, unknown> = {}
  if ('fim' in body)        updates.fim        = body.fim
  if ('descricao' in body)  updates.descricao  = body.descricao
  if ('imagem_url' in body) updates.imagem_url = body.imagem_url

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('maint_acoes')
    .update(updates)
    .eq('id', acaoId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE — remover ação
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string; acaoId: string }> }
) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { acaoId } = await context.params
  const supabase = await createAdminClient()

  const { error } = await supabase.from('maint_acoes').delete().eq('id', acaoId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
