-- ============================================
-- INPULSE CMS - Database Schema
-- ============================================

-- Configurações gerais do site
CREATE TABLE site_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name TEXT NOT NULL DEFAULT 'Inpulse',
  site_description TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#000000',
  secondary_color TEXT DEFAULT '#ffffff',
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Páginas do site
CREATE TABLE pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content JSONB, -- Estrutura flexível para seções
  is_published BOOLEAN DEFAULT false,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  og_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Posts do blog
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  category TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Contatos recebidos
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Items do menu
CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Links de redes sociais
CREATE TABLE social_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL, -- facebook, instagram, linkedin, twitter, youtube, etc
  url TEXT NOT NULL,
  icon_name TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- Inserir dados iniciais
-- ============================================

-- Configuração inicial
INSERT INTO site_config (site_name, site_description, primary_color, secondary_color, email, phone) 
VALUES (
  'INPULSE - Grupo Multidisciplinar',
  'Serviços profissionais em eventos, manutenção técnica, lavagem de carros, corte a laser e brinquedos metálicos',
  '#000000',
  '#ffffff',
  'geral@inpulse.pt',
  '+351 123 456 789'
);

-- Páginas iniciais
INSERT INTO pages (slug, title, is_published, meta_title, meta_description) VALUES
('home', 'Home', true, 'INPULSE - Grupo Multidisciplinar | Eventos, Serviços, Laser', 'Grupo Inpulse oferece serviços completos em eventos, manutenção técnica para lojas, lavagem premium, corte a laser industrial e brinquedos metálicos Ferrolândia'),
('eventos', 'Inpulse Events', true, 'Inpulse Events - Produção Profissional de Eventos', 'Produção completa de eventos: palco, som, luz, vídeo. Eventos corporativos, casamentos, festas e mais'),
('servicos', 'Inpulse Services', true, 'Inpulse Services - Manutenção Técnica para Lojas', 'Serviços técnicos especializados para lojas Inditex. Cablagem, iluminação, serralharia. Disponível 24/7'),
('car-wash', 'Inpulse Car Wash', true, 'Inpulse Car Wash - Lavagem Premium de Automóveis', 'Lavagem exterior e interior premium, detailing profissional e vídeos para redes sociais'),
('laser', 'Inpulse Laser', true, 'Inpulse Laser - Corte a Laser em Metal', 'Corte a laser fibra óptica em aço, inox e ferro. Peças técnicas, decorativas e industriais até 15mm'),
('ferrolandia', 'Ferrolândia', true, 'Ferrolândia - Brinquedos em Metal para Crianças', 'A imaginação em aço. Brinquedos metálicos artesanais, miniaturas e acessórios para crianças'),
('contacto', 'Contacto', true, 'Contacto - INPULSE', 'Entre em contacto com a INPULSE para mais informações sobre nossos serviços');

-- Menu inicial
INSERT INTO menu_items (label, url, order_index) VALUES
('Home', '/', 1),
('Inpulse Events', '/eventos', 2),
('Inpulse Services', '/servicos', 3),
('Inpulse Car Wash', '/car-wash', 4),
('Inpulse Laser', '/laser', 5),
('Ferrolândia', '/ferrolandia', 6),
('Blog', '/blog', 7),
('Contacto', '/contacto', 8);

-- Redes sociais iniciais
INSERT INTO social_links (platform, url, icon_name, order_index) VALUES
('Facebook', 'https://facebook.com/inpulse', 'Facebook', 1),
('Instagram', 'https://instagram.com/inpulse', 'Instagram', 2),
('LinkedIn', 'https://linkedin.com/company/inpulse', 'Linkedin', 3);

-- ============================================
-- Triggers para updated_at automático
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON site_config
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Políticas de segurança RLS
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

-- Políticas: Qualquer um pode LER (para o site público)
CREATE POLICY "Allow public read access" ON site_config FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON pages FOR SELECT USING (is_published = true);
CREATE POLICY "Allow public read access" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Allow public read access" ON menu_items FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access" ON social_links FOR SELECT USING (is_active = true);

-- Política: Qualquer um pode INSERIR contatos
CREATE POLICY "Allow public insert contacts" ON contacts FOR INSERT WITH CHECK (true);

-- Políticas: Apenas usuários autenticados podem EDITAR (admin)
CREATE POLICY "Allow authenticated full access" ON site_config FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access" ON pages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated read contacts" ON contacts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update contacts" ON contacts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access" ON menu_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access" ON social_links FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- Storage bucket para uploads
-- ============================================

-- Criar bucket público para logos e imagens
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Política de storage: qualquer um pode ver, apenas autenticados podem fazer upload
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');
