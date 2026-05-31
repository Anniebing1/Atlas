import { createClient } from "./supabase-server";

export type Deal = {
  id: string;
  title: string;
  value: number | null;
  stage: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  company: { id: string; name: string } | null;
  contact: { id: string; first_name: string; last_name: string } | null;
};

export type Contact = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  title: string | null;
  notes: string | null;
  created_at: string;
  company: { id: string; name: string } | null;
};

export type Company = {
  id: string;
  name: string;
  website: string | null;
  industry: string | null;
  notes: string | null;
  created_at: string;
};

export async function getDeals(): Promise<Deal[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("deals")
    .select("*, company:companies(id,name), contact:contacts(id,first_name,last_name)")
    .order("updated_at", { ascending: false });
  return (data as Deal[]) ?? [];
}

export async function getContacts(): Promise<Contact[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("contacts")
    .select("*, company:companies(id,name)")
    .order("created_at", { ascending: false });
  return (data as Contact[]) ?? [];
}

export async function getCompanies(): Promise<Company[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .order("name");
  return (data as Company[]) ?? [];
}

export async function getDashboardStats() {
  const supabase = createClient();

  const [dealsRes, wonRes] = await Promise.all([
    supabase.from("deals").select("id, value, stage"),
    supabase.from("deals").select("id, value").eq("stage", "Closed Won"),
  ]);

  const deals = dealsRes.data ?? [];
  const openDeals = deals.filter((d) => d.stage !== "Closed Won" && d.stage !== "Closed Lost");
  const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const totalDeals = deals.length;
  const wonDeals = wonRes.data?.length ?? 0;
  const winRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0;

  return { openDeals: openDeals.length, pipelineValue, winRate, totalDeals };
}
