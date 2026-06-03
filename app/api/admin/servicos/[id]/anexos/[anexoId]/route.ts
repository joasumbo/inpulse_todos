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
  context: { params: Promise<{ id: string; anexoId: string }> }
) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id, anexoId } = await context.params
  const supabase = await createAdminClient()

  const { data: anexo } = await supabase
    .from('maint_anexos')
    .select('id, storage_path, uploaded_by')
    .eq('id', anexoId)
    .eq('servico_id', id)
    .single()

  if (!anexo) return NextResponse.json({ error: 'Anexo não encontrado' }, { status: 404 })

  const canDelete =
    ['admin', 'supervisor'].includes(utilizador.cargo) ||
    utilizador.id === anexo.uploaded_by

  if (!canDelete) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  await supabase.storage.from('maint-anexos').remove([anexo.storage_path])
  await supabase.from('maint_anexos').delete().eq('id', anexoId)

  return NextResponse.json({ ok: true })
}
