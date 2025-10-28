import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl =
  process.env.NEXT_PUBLIC_Bolt_Database_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_Bolt_Database_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_Bolt_Database_URL or NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_Bolt_Database_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
