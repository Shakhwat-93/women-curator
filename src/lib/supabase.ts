import { createClient } from '@supabase/supabase-js';

// Official Women Curator Supabase Project (Tokyo - ap-northeast-1)
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  'https://tryylliobpikarotyxru.supabase.co';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyeXlsbGlvYnBpa2Fyb3R5eHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMjk3NDIsImV4cCI6MjEwMjgwNTc0Mn0.hhL71TYVAVDagN1VJuM2xQEU0jxaEmtH3P2YzEmHZ28';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
