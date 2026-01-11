import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mqkqfpbaxnjtadinctek.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xa3FmcGJheG5qdGFkaW5jdGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNTQxNTYsImV4cCI6MjA4MTczMDE1Nn0.Ve8L7DAAsbUXUp6aXoPBo0MqTi5I1a-mg6EV37KR3s4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
