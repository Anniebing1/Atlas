"""
Migration: Extract structured fields from notes into proper columns.
Runs SQL migration then backfills all company records.
"""

import json, re, urllib.request

SUPABASE_URL = "https://snxjziwnzyhkpsdmmmjq.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNueGp6aXduenloa3BzZG1tbWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNDMwNjEsImV4cCI6MjA5NTgxOTA2MX0.ym1bU2S0Ht11fAgJeVXBJxe_oHAi-aiSTKbyW3ATBqQ"

HEADERS = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json",
}

def supabase_get(table, params=""):
    url = f"{SUPABASE_URL}/rest/v1/{table}?{params}"
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def supabase_patch(table, row_id, data):
    url = f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{row_id}"
    payload = json.dumps(data).encode()
    headers = {**HEADERS, "Prefer": "return=minimal"}
    req = urllib.request.Request(url, data=payload, headers=headers, method="PATCH")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status
    except urllib.error.HTTPError as e:
        print(f"  PATCH error {e.code}: {e.read().decode()[:100]}")
        return e.code

def parse_notes(notes):
    """Extract structured fields from the pipe-delimited notes string."""
    if not notes:
        return {}

    def find(pattern, text):
        m = re.search(pattern, text)
        return m.group(1).strip() if m else None

    result = {}

    # Address: value
    result["address"] = find(r"Address: ([^|]+)", notes)
    # City: value, STATE
    city_match = re.search(r"City: ([^,|]+),?\s*([A-Z]{2})?", notes)
    if city_match:
        result["city"] = city_match.group(1).strip()
        result["state"] = city_match.group(2)
    # Market
    result["market"] = find(r"Market: ([^|]+)", notes)
    # Units
    units_str = find(r"Units: ([^|]+)", notes)
    if units_str:
        try:
            result["units"] = int(float(units_str.replace(",", "").strip()))
        except:
            pass
    # Building class
    bclass = find(r"Class: ([^|]+)", notes)
    result["building_class"] = bclass
    # Year built
    yr = find(r"Year Built: ([^|]+)", notes)
    if yr:
        try:
            result["year_built"] = int(float(yr.strip()))
        except:
            pass
    # Owner
    result["owner_name"] = find(r"Owner: ([^|]+)", notes)
    # Manager
    result["manager_name"] = find(r"Manager: ([^|]+)", notes)
    # For sale
    sale_str = find(r"FOR SALE: ([^|]+)", notes)
    result["for_sale"] = sale_str is not None
    if sale_str:
        price_str = sale_str.replace("$", "").replace(",", "").strip()
        try:
            result["sale_price"] = float(price_str)
        except:
            pass

    return {k: v for k, v in result.items() if v is not None}

# ── Fetch all companies ──────────────────────────────────────────────────────
print("📥 Fetching all companies...")
all_companies = []
offset = 0
limit = 1000
while True:
    batch = supabase_get("companies", f"select=id,notes&limit={limit}&offset={offset}")
    if not batch:
        break
    all_companies.extend(batch)
    if len(batch) < limit:
        break
    offset += limit

print(f"  Found {len(all_companies)} companies")

# ── Backfill structured fields ───────────────────────────────────────────────
print("\n🔄 Backfilling structured columns...")
success = 0
errors = 0

for i, company in enumerate(all_companies):
    parsed = parse_notes(company.get("notes", ""))
    if not parsed:
        continue

    status = supabase_patch("companies", company["id"], parsed)
    if status in (200, 204):
        success += 1
    else:
        errors += 1

    if (i + 1) % 100 == 0:
        print(f"  {i+1}/{len(all_companies)} processed ({success} updated, {errors} errors)...")

print(f"\n✅ Done! {success} companies updated, {errors} errors")
print("\nAtlas can now query: city, state, market, units, building_class, year_built, owner_name, manager_name, for_sale, sale_price")
