import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase - João Sumbo
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

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
