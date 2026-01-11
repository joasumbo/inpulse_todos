-- Criar tabela qrcodes
CREATE TABLE IF NOT EXISTS public.qrcodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    phrase TEXT NOT NULL,
    short_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para performance
CREATE INDEX idx_qrcodes_user_id ON public.qrcodes(user_id);
CREATE INDEX idx_qrcodes_short_code ON public.qrcodes(short_code);

-- RLS (Row Level Security)
ALTER TABLE public.qrcodes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own QR codes
CREATE POLICY "Users can view own qrcodes"
    ON public.qrcodes FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own QR codes
CREATE POLICY "Users can insert own qrcodes"
    ON public.qrcodes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Anyone can read by short_code (for public pages)
CREATE POLICY "Anyone can read by short_code"
    ON public.qrcodes FOR SELECT
    USING (true);
