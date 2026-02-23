-- Tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de configurações do site
CREATE TABLE IF NOT EXISTS site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'textarea', 'image', 'html', 'json')),
  category TEXT DEFAULT 'general',
  label TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_by UUID REFERENCES auth.users(id)
);

-- Tabela de produtos/presentes
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category TEXT DEFAULT 'gift',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de exemplos (seção de exemplos reais)
CREATE TABLE IF NOT EXISTS examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS Policies

-- Admins - somente admins podem ver/editar
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admins" ON admins
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM admins)
  );

CREATE POLICY "Super admins can manage admins" ON admins
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM admins WHERE role = 'super_admin')
  );

-- Site Config - admins podem editar, todos podem ler
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site config" ON site_config
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage site config" ON site_config
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM admins)
  );

-- Products - admins podem editar, todos podem ler ativos
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true OR auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM admins)
  );

-- Examples - admins podem editar, todos podem ler ativos
ALTER TABLE examples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active examples" ON examples
  FOR SELECT USING (is_active = true OR auth.uid() IN (SELECT user_id FROM admins));

CREATE POLICY "Admins can manage examples" ON examples
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM admins)
  );

-- Inserir configurações iniciais do site
INSERT INTO site_config (key, value, type, category, label, description) VALUES
  ('hero_title', 'Um presente que nunca fica igual', 'text', 'hero', 'Título Principal', 'Título do hero da landing page'),
  ('hero_subtitle', 'Oferece um QR Code que muda de mensagem sempre que quiseres. Muda a frase, sem mudar o presente.', 'textarea', 'hero', 'Subtítulo Principal', 'Descrição do hero'),
  ('hero_cta', 'Começar agora', 'text', 'hero', 'Botão CTA', 'Texto do botão principal'),
  ('para_quem_title', 'Para quem é', 'text', 'para_quem', 'Título da Seção', 'Título da seção Para quem é'),
  ('para_quem_item1', 'Para quem quer oferecer algo que evolui com a relação', 'text', 'para_quem', 'Item 1', 'Primeiro item'),
  ('para_quem_item2', 'Para quem quer estar presente todos os dias, mesmo à distância', 'text', 'para_quem', 'Item 2', 'Segundo item'),
  ('para_quem_item3', 'Para quem gosta de surpreender com palavras', 'text', 'para_quem', 'Item 3', 'Terceiro item'),
  ('diferencial_title', 'Porque é diferente', 'text', 'diferencial', 'Título da Seção', 'Título da seção diferencial'),
  ('diferencial_item1', 'Não é só um QR estático - é um canal de comunicação', 'text', 'diferencial', 'Item 1', 'Primeiro diferencial'),
  ('diferencial_item2', 'Sem apps para instalar - basta apontar a câmara', 'text', 'diferencial', 'Item 2', 'Segundo diferencial'),
  ('diferencial_item3', 'Muda de mensagem quando quiseres - é vitalício', 'text', 'diferencial', 'Item 3', 'Terceiro diferencial'),
  ('contact_email', 'geral@inpulse-events.com', 'text', 'contact', 'Email', 'Email de contato'),
  ('contact_phone', '+351 913 698 968', 'text', 'contact', 'Telefone', 'Telefone de contato'),
  ('contact_address', 'Santa Maria da Feira, Portugal', 'text', 'contact', 'Endereço', 'Endereço'),
  ('footer_copyright', 'Inpulse Events. Todos os direitos reservados.', 'text', 'footer', 'Copyright', 'Texto de copyright')
ON CONFLICT (key) DO NOTHING;

-- Inserir produtos iniciais
INSERT INTO products (name, description, price, image_url, display_order) VALUES
  ('Download Digital', 'Ficheiro PNG de alta qualidade', 2.00, NULL, 1),
  ('Imagem Impressa', 'Imagem impressa pronta para emoldurar', 5.00, '/imagens/quadro.jpeg', 2),
  ('Caneca', 'Caneca personalizada com o teu QR Code', 17.00, '/imagens/caneca.jpeg', 3),
  ('T-shirt', 'T-shirt com o QR Code da tua mensagem', 25.00, '/imagens/tshirt.jpeg', 4),
  ('Autocolante', 'Autocolante resistente para qualquer superfície', 5.00, '/imagens/autocolante.jpeg', 5),
  ('Chaveiro', 'Chaveiro personalizado com QR Code', 8.00, '/imagens/chaveiro.jpeg', 6),
  ('Almofada', 'Almofada decorativa com QR Code', 20.00, '/imagens/almofada.jpeg', 7),
  ('Pack Completo', 'Caneca + T-shirt + Autocolante', 40.00, '/imagens/pack.jpeg', 8)
ON CONFLICT DO NOTHING;

-- Inserir exemplos iniciais
INSERT INTO examples (title, description, image_url, display_order) VALUES
  ('Caneca com frase diária', 'Café da manhã com uma mensagem sempre nova', '/imagens/caneca.jpeg', 1),
  ('Autocolante para colocar num objeto', 'No portátil, agenda ou espelho', '/imagens/autocolante.jpeg', 2),
  ('Peça na mesa de cabeceira', 'A última coisa que vês antes de dormir', '/imagens/quadro.jpeg', 3),
  ('T-shirt com mensagem sempre nova', 'Uma t-shirt que nunca enjoa', '/imagens/tshirt.jpeg', 4)
ON CONFLICT DO NOTHING;

-- Adicionar o primeiro admin (substitua pelo email do admin real)
-- INSERT INTO admins (email, name, role) VALUES ('seu-email@exemplo.com', 'Admin', 'super_admin');
