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
  const supabase = await createAdminClient()

  const { data: anexos, error } = await supabase
    .from('maint_anexos')
    .select('*')
    .eq('servico_id', id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const result = await Promise.all(
    (anexos ?? []).map(async (a) => {
      const { data } = await supabase.storage
        .from('maint-anexos')
        .createSignedUrl(a.storage_path, 3600)
      return { ...a, signedUrl: data?.signedUrl ?? null }
    })
  )

  return NextResponse.json(result)
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const utilizador = await getUtilizador()
  if (!utilizador) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await context.params

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'Ficheiro em falta' }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Ficheiro muito grande (máx. 10 MB)' }, { status: 400 })
  }

  const supabase = await createAdminClient()
  const ext = file.name.split('.').pop() ?? 'bin'
  const storagePath = `${id}/${crypto.randomUUID()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('maint-anexos')
    .upload(storagePath, arrayBuffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data, error } = await supabase
    .from('maint_anexos')
    .insert({
      servico_id:   id,
      nome:         file.name,
      storage_path: storagePath,
      mime_type:    file.type || null,
      tamanho:      file.size,
      uploaded_by:  utilizador.id,
    })
    .select()
    .single()

  if (error) {
    await supabase.storage.from('maint-anexos').remove([storagePath])
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
