"use server";

import { createClient } from "./supabase-server";
import { revalidatePath } from "next/cache";

export async function createCompany(formData: FormData) {
  const supabase = createClient();
  await supabase.from("companies").insert({
    name: formData.get("name") as string,
    website: (formData.get("website") as string) || null,
    industry: (formData.get("industry") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });
  revalidatePath("/dashboard/companies");
  revalidatePath("/dashboard");
}

export async function createContact(formData: FormData) {
  const supabase = createClient();
  await supabase.from("contacts").insert({
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    email: (formData.get("email") as string) || null,
    title: (formData.get("title") as string) || null,
    company_id: (formData.get("company_id") as string) || null,
    notes: (formData.get("notes") as string) || null,
  });
  revalidatePath("/dashboard/contacts");
  revalidatePath("/dashboard");
}

export async function createDeal(formData: FormData) {
  const supabase = createClient();
  const valueStr = formData.get("value") as string;
  await supabase.from("deals").insert({
    title: formData.get("title") as string,
    value: valueStr ? parseFloat(valueStr.replace(/[^0-9.]/g, "")) : null,
    stage: (formData.get("stage") as string) || "Qualified",
    company_id: (formData.get("company_id") as string) || null,
    contact_id: (formData.get("contact_id") as string) || null,
    notes: (formData.get("notes") as string) || null,
    updated_at: new Date().toISOString(),
  });
  revalidatePath("/dashboard/deals");
  revalidatePath("/dashboard");
}

export async function updateDealStage(dealId: string, stage: string) {
  const supabase = createClient();
  await supabase.from("deals").update({ stage, updated_at: new Date().toISOString() }).eq("id", dealId);
  revalidatePath("/dashboard/deals");
  revalidatePath("/dashboard");
}

export async function deleteDeal(dealId: string) {
  const supabase = createClient();
  await supabase.from("deals").delete().eq("id", dealId);
  revalidatePath("/dashboard/deals");
  revalidatePath("/dashboard");
}

export async function deleteContact(contactId: string) {
  const supabase = createClient();
  await supabase.from("contacts").delete().eq("id", contactId);
  revalidatePath("/dashboard/contacts");
}

export async function deleteCompany(companyId: string) {
  const supabase = createClient();
  await supabase.from("companies").delete().eq("id", companyId);
  revalidatePath("/dashboard/companies");
}
