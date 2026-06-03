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

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string; smId: string }> }
) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { smId } = await context.params
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('maint_servico_materiais')
    .delete()
    .eq('id', smId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
