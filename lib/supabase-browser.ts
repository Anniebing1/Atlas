import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://snxjziwnzyhkpsdmmmjq.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_JEeDAxfCbziBGx4EoozMbA_bATn5yjs";

export function createClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_KEY);
}
