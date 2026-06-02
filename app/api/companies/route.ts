import { createClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";
  const market = searchParams.get("market") ?? "";
  const building_class = searchParams.get("class") ?? "";
  const for_sale = searchParams.get("for_sale") ?? "";
  const year_min = searchParams.get("year_min") ?? "";
  const year_max = searchParams.get("year_max") ?? "";
  const units_min = searchParams.get("units_min") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = 50;
  const offset = (page - 1) * limit;

  const supabase = createClient();
  let query = supabase
    .from("companies")
    .select("id, name, city, state, market, units, building_class, year_built, owner_name, manager_name, for_sale, sale_price", { count: "exact" });

  if (search) {
    query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%,owner_name.ilike.%${search}%,manager_name.ilike.%${search}%`);
  }
  if (market) query = query.eq("market", market);
  if (building_class) query = query.eq("building_class", building_class);
  if (for_sale === "true") query = query.eq("for_sale", true);
  if (year_min) query = query.gte("year_built", parseInt(year_min));
  if (year_max) query = query.lte("year_built", parseInt(year_max));
  if (units_min) query = query.gte("units", parseInt(units_min));

  const { data, count, error } = await query
    .order("name")
    .range(offset, offset + limit - 1);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ data, count, page, limit });
}
