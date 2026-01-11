import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mqkqfpbaxnjtadinctek.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xa3FmcGJheG5qdGFkaW5jdGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNTQxNTYsImV4cCI6MjA4MTczMDE1Nn0.Ve8L7DAAsbUXUp6aXoPBo0MqTi5I1a-mg6EV37KR3s4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type QRCode = {
  id: string;
  user_id: string;
  phrase: string;
  short_code: string;
  created_at: string;
};
