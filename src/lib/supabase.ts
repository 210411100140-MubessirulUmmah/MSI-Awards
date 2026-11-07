import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

// Kunci anon memang publik; keamanan data dijaga oleh aturan RLS di database (supabase/schema.sql).
export const supabase = createClient(url ?? 'http://localhost', anonKey ?? 'missing-key', {
  auth: { persistSession: true, autoRefreshToken: true },
});
