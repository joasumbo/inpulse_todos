-- =====================================================
-- PASSO 0: Limpar tabelas existentes (se houver conflito)
-- =====================================================

DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS site_config CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS examples CASCADE;

-- =====================================================
-- PASSO 1: Criar as tabelas
-- =====================================================

-- Tabela de administradores
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabela de configurações do site
CREATE TABLE site_config (
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
CREATE TABLE products (
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

-- Tabela de exemplos
CREATE TABLE examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- PASSO 2: Configurar RLS (Row Level Security)
-- =====================================================

-- Admins
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admins" ON admins;
CREATE POLICY "Admins can view admins" ON admins
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM admins)
  );

DROP POLICY IF EXISTS "Super admins can manage admins" ON admins;
CREATE POLICY "Super admins can manage admins" ON admins
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM admins WHERE role = 'super_admin')
  );

-- Site Config
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view site config" ON site_config;
CREATE POLICY "Anyone can view site config" ON site_config
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage site config" ON site_config;
CREATE POLICY "Admins can manage site config" ON site_config
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM admins)
  );

-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true OR auth.uid() IN (SELECT user_id FROM admins));

DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM admins)
  );

-- Examples
ALTER TABLE examples ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active examples" ON examples;
CREATE POLICY "Anyone can view active examples" ON examples
  FOR SELECT USING (is_active = true OR auth.uid() IN (SELECT user_id FROM admins));

DROP POLICY IF EXISTS "Admins can manage examples" ON examples;
CREATE POLICY "Admins can manage examples" ON examples
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM admins)
  );

-- =====================================================
-- PASSO 3: Inserir dados iniciais
-- =====================================================

-- Configurações do site
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

-- Produtos
INSERT INTO products (name, description, price, image_url, category, display_order) VALUES
  -- DECORAÇÃO METAL - 24,90€
  ('LOVE - Decoração Metal', 'Uma palavra simples, universal e direta. Decoração em metal com QR integrado, pensada para mesas, estantes ou secretárias.', 24.90, '/imagens/decor-love.jpeg', 'decoracao', 1),
  ('AMOR - Decoração Metal', 'Mais próxima, mais nossa. Uma peça decorativa com presença e significado, com QR integrado de forma discreta.', 24.90, '/imagens/decor-amor.jpeg', 'decoracao', 2),
  ('TE AMO - Decoração Metal', 'Direto ao ponto, sem rodeios. Uma declaração clara, transformada numa peça decorativa sólida e intencional.', 24.90, '/imagens/decor-teamo.jpeg', 'decoracao', 3),
  ('FAMÍLIA - Decoração Metal', 'Uma palavra que não precisa de explicação. Decoração em metal com QR integrado, pensada para o centro da casa.', 24.90, '/imagens/decor-familia.jpeg', 'decoracao', 4),
  
  -- CANECAS - 13,90€
  ('Caneca LOVE', 'Uma caneca simples com uma palavra que todos reconhecem. O QR acrescenta uma camada pessoal a um objeto do dia a dia.', 13.90, '/imagens/caneca-love.jpeg', 'canecas', 5),
  ('Caneca AMOR', 'Uma caneca pensada para casa, para uso diário ou como presente. A palavra "Amor" é clara, próxima e intemporal.', 13.90, '/imagens/caneca-amor.jpeg', 'canecas', 6),
  ('Caneca TE AMO', 'Para quem prefere dizer as coisas sem filtros. Uma caneca direta, com uma mensagem forte e um QR integrado.', 13.90, '/imagens/caneca-teamo.jpeg', 'canecas', 7),
  ('Caneca FAMÍLIA', 'Uma caneca que faz sentido em qualquer cozinha. Pensada para uso diário, com uma palavra que une e um QR discreto.', 13.90, '/imagens/caneca-familia.jpeg', 'canecas', 8),
  
  -- PORTA-CHAVES - 8,90€
  ('Porta-chaves QR Neutro', 'Design simples e discreto. Feito para uso diário, sem texto nem símbolos desnecessários. Funcional e direto.', 8.90, '/imagens/chaveiro-neutro.jpeg', 'uso_pessoal', 9),
  ('Porta-chaves QR Feminino', 'Linhas suaves e acabamento cuidado. Pensado para quem prefere um objeto funcional com um toque mais delicado.', 8.90, '/imagens/chaveiro-feminino.jpeg', 'uso_pessoal', 10),
  ('Porta-chaves QR Masculino', 'Mais sóbrio, mais direto. Um porta-chaves resistente, com QR discreto e sem elementos decorativos.', 8.90, '/imagens/chaveiro-masculino.jpeg', 'uso_pessoal', 11),
  ('Porta-chaves QR Minimal Premium', 'Versão mais refinada, com materiais e acabamento superiores. Funcional e elegante.', 8.90, '/imagens/chaveiro-premium.jpeg', 'uso_pessoal', 12),
  
  -- ÍMAN / AUTOCOLANTE - 6,90€
  ('Íman QR Clássico', 'Pensado para o frigorífico ou superfícies metálicas. Discreto, funcional e sempre acessível.', 6.90, '/imagens/iman-classico.jpeg', 'uso_pessoal', 13),
  ('Íman QR Minimal', 'Design preto e branco, sem texto. Ideal para quem quer algo o mais neutro possível.', 6.90, '/imagens/iman-minimal.jpeg', 'uso_pessoal', 14),
  ('Autocolante QR Espelho/Portátil', 'Autocolante discreto para superfícies lisas. Ideal para espelhos, portáteis ou uso pessoal.', 6.90, '/imagens/autocolante-espelho.jpeg', 'uso_pessoal', 15),
  ('Autocolante QR Vinil Removível', 'Vinil mate, fácil de aplicar e remover. Pensado para quem quer flexibilidade.', 6.90, '/imagens/autocolante-vinil.jpeg', 'uso_pessoal', 16),
  
  -- DIGITAL - 2,90€
  ('QR Digital', 'Versão digital. Ideal para uso discreto ou integração em outros objetos. Download imediato.', 2.90, NULL, 'digital', 17)
ON CONFLICT DO NOTHING;

-- Exemplos
INSERT INTO examples (title, description, image_url, display_order) VALUES
  ('Caneca com frase diária', 'Café da manhã com uma mensagem sempre nova', '/imagens/caneca.jpeg', 1),
  ('Autocolante para colocar num objeto', 'No portátil, agenda ou espelho', '/imagens/autocolante.jpeg', 2),
  ('Peça na mesa de cabeceira', 'A última coisa que vês antes de dormir', '/imagens/quadro.jpeg', 3),
  ('T-shirt com mensagem sempre nova', 'Uma t-shirt que nunca enjoa', '/imagens/tshirt.jpeg', 4)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PASSO 4: Adicionar o administrador principal
-- =====================================================

INSERT INTO admins (email, name, role) 
VALUES ('admin@gmail.com', 'Administrador', 'super_admin')
ON CONFLICT (email) DO UPDATE SET role = 'super_admin';
