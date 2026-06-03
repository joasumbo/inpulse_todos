import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'

async function getUtilizador() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('maint_utilizadores')
    .select('cargo')
    .eq('user_id', user.id)
    .eq('ativo', true)
    .single()
  return data ?? null
}

export async function GET(req: NextRequest) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if (!['admin', 'supervisor'].includes(utilizador.cargo)) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const raw = Number(req.nextUrl.searchParams.get('dias') ?? 30)
  const dias = [30, 90, 180, 365].includes(raw) ? raw : 30

  const supabase = await createAdminClient()
  const { data, error } = await supabase.rpc('maint_fn_relatorios', { p_dias: dias })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data ?? {})
}
