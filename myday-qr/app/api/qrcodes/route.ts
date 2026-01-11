import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

const supabaseUrl = 'https://mqkqfpbaxnjtadinctek.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xa3FmcGJheG5qdGFkaW5jdGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNTQxNTYsImV4cCI6MjA4MTczMDE1Nn0.Ve8L7DAAsbUXUp6aXoPBo0MqTi5I1a-mg6EV37KR3s4';

// Criar cliente com autenticação do usuário
function getSupabaseClient(authToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }
  });
}

// GET - Listar QR codes do usuário
export async function GET(request: NextRequest) {
  const authToken = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!authToken) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const supabase = getSupabaseClient(authToken);

  const { data, error } = await supabase
    .from('qrcodes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST - Criar novo QR code
export async function POST(request: NextRequest) {
  const authToken = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!authToken) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const { phrase } = body;

  if (!phrase || !phrase.trim()) {
    return NextResponse.json({ error: 'Frase é obrigatória' }, { status: 400 });
  }

  const shortCode = nanoid(8);
  const supabase = getSupabaseClient(authToken);

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('qrcodes')
    .insert({
      user_id: userData.user.id,
      phrase: phrase.trim(),
      short_code: shortCode,
    })
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data?.[0] || data);
}

// PUT - Atualizar frase do QR code
export async function PUT(request: NextRequest) {
  const authToken = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!authToken) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const { id, phrase } = body;

  if (!id || !phrase || !phrase.trim()) {
    return NextResponse.json({ error: 'ID e frase são obrigatórios' }, { status: 400 });
  }

  const supabase = getSupabaseClient(authToken);

  const { data, error } = await supabase
    .from('qrcodes')
    .update({ phrase: phrase.trim() })
    .eq('id', id)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'QR Code não encontrado' }, { status: 404 });
  }

  return NextResponse.json(data[0]);
}

// DELETE - Remover QR code
export async function DELETE(request: NextRequest) {
  const authToken = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!authToken) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
  }

  const supabase = getSupabaseClient(authToken);

  const { error } = await supabase
    .from('qrcodes')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
