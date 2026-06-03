import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const admin = await createAdminClient()
  const formData = await req.formData()
  const file = formData.get('file') as File
  const jornadaId = (formData.get('jornada_id') as string) || 'misc'

  if (!file) return NextResponse.json({ error: 'Nenhum ficheiro' }, { status: 400 })

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${jornadaId}/${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const doUpload = () =>
    admin.storage.from('jornada').upload(path, bytes, { contentType: file.type })

  let { error } = await doUpload()

  if (error) {
    const msg = error.message?.toLowerCase() ?? ''
    if (msg.includes('bucket') || msg.includes('not found')) {
      await admin.storage.createBucket('jornada', { public: true })
      const r2 = await doUpload()
      if (r2.error) return NextResponse.json({ error: r2.error.message }, { status: 500 })
    } else {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  const { data: { publicUrl } } = admin.storage.from('jornada').getPublicUrl(path)
  return NextResponse.json({ url: publicUrl })
}
