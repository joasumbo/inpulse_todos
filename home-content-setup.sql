-- Adicionar tabela para conteúdo da home page
CREATE TABLE IF NOT EXISTS home_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_badge TEXT DEFAULT 'Disponível para novos projetos',
  hero_title TEXT DEFAULT 'INPULSE',
  hero_subtitle TEXT DEFAULT 'Grupo Multidisciplinar',
  hero_description TEXT DEFAULT 'Somos um grupo com várias áreas especializadas — eventos, manutenção, laser, car wash e projetos infantis. Trabalhamos com precisão, rapidez e qualidade.',
  hero_cta_primary TEXT DEFAULT 'Começar Projeto',
  hero_cta_secondary TEXT DEFAULT 'Explorar Serviços',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert inicial
INSERT INTO home_content (id) 
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE home_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_read_home_content" ON home_content FOR SELECT USING (true);
CREATE POLICY "allow_authenticated_update_home_content" ON home_content FOR UPDATE USING (auth.role() = 'authenticated');

-- Trigger para atualizar updated_at
CREATE TRIGGER update_home_content_updated_at
BEFORE UPDATE ON home_content
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
