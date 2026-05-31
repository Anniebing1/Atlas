import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://snxjziwnzyhkpsdmmmjq.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNueGp6aXduenloa3BzZG1tbWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNDMwNjEsImV4cCI6MjA5NTgxOTA2MX0.ym1bU2S0Ht11fAgJeVXBJxe_oHAi-aiSTKbyW3ATBqQ";

export function createClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
