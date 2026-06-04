import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// Reutiliza o bucket que já existe e funciona (o mesmo dos anexos de serviços),
// em vez de depender da criação do bucket "jornada" (que falhava em produção).
const BUCKET = 'maint-anexos'
const UM_ANO = 60 * 60 * 24 * 365

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const admin = await createAdminClient()
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const jornadaId = (formData.get('jornada_id') as string) || 'misc'

  if (!file) return NextResponse.json({ error: 'Nenhum ficheiro' }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Ficheiro muito grande (máx. 10 MB)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `jornadas/${jornadaId}/${crypto.randomUUID()}.${ext}`
  const bytes = await file.arrayBuffer()

  const doUpload = () => admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  })

  let { error: upErr } = await doUpload()
  // Auto-cria o bucket privado se ainda não existir e tenta de novo (à prova de bala).
  if (upErr && /bucket|not found/i.test(upErr.message ?? '')) {
    const { error: createErr } = await admin.storage.createBucket(BUCKET, { public: false })
    if (createErr && !/exist/i.test(createErr.message ?? '')) {
      return NextResponse.json(
        { error: `Não foi possível preparar o armazenamento de fotos: ${createErr.message}` },
        { status: 500 },
      )
    }
    upErr = (await doUpload()).error
  }
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  // Bucket privado → URL assinado de longa duração (1 ano) para mostrar a foto.
  const { data, error: signErr } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(path, UM_ANO)

  if (signErr || !data?.signedUrl) {
    return NextResponse.json({ error: signErr?.message ?? 'Falha ao gerar URL da foto' }, { status: 500 })
  }

  return NextResponse.json({ url: data.signedUrl })
}
