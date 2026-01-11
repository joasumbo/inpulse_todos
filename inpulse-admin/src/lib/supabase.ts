import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase - João Sumbo
const supabaseUrl = 'https://mqkqfpbaxnjtadinctek.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xa3FmcGJheG5qdGFkaW5jdGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNTQxNTYsImV4cCI6MjA4MTczMDE1Nn0.Ve8L7DAAsbUXUp6aXoPBo0MqTi5I1a-mg6EV37KR3s4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Definições de tipos para o banco de dados
export type SiteConfig = {
  id: string;
  site_name: string;
  site_description: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export type Page = {
  id: string;
  slug: string;
  title: string;
  content: any;
  is_published: boolean;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  og_image: string | null;
  created_at: string;
  updated_at: string;
}

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  category: string | null;
  tags: string[] | null;
  is_published: boolean;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  replied_at: string | null;
  created_at: string;
}

export type MenuItem = {
  id: string;
  label: string;
  url: string;
  order_index: number;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
}

export type SocialLink = {
  id: string;
  platform: string;
  url: string;
  icon_name: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export type HomeContent = {
  id: string;
  hero_badge: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  updated_at: string;
}
