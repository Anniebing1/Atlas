"""
Atlas Import Script
- Imports CoStar FL properties as companies
- Imports ZoomInfo contacts (Operations, Construction, Facilities, C-Suite)
"""

import json, re, time
from numbers_parser import Document
import urllib.request, urllib.parse

SUPABASE_URL = "https://snxjziwnzyhkpsdmmmjq.supabase.co"
ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNueGp6aXduenloa3BzZG1tbWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNDMwNjEsImV4cCI6MjA5NTgxOTA2MX0.ym1bU2S0Ht11fAgJeVXBJxe_oHAi-aiSTKbyW3ATBqQ"

HEADERS = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def supabase_post(table, rows):
    if not rows:
        return []
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    data = json.dumps(rows).encode()
    req = urllib.request.Request(url, data=data, headers=HEADERS, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"  ERROR {e.code}: {e.read().decode()[:200]}")
        return []

def batch(lst, n=50):
    for i in range(0, len(lst), n):
        yield lst[i:i+n]

def looks_like_company(name):
    if not name or len(name.strip()) < 4:
        return False
    if re.match(r'^\d', name.strip()):
        return False
    return True

def split_name(full):
    parts = full.strip().split()
    if len(parts) == 0:
        return "Unknown", ""
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], " ".join(parts[1:])

# ── STEP 1: Read CoStar files ────────────────────────────────────────────────
print("📂 Reading CoStar files...")
costar_companies = {}  # name -> {name, website, industry, notes}

files = [
    "/Users/anniebing/Desktop/CoStar/FL CoStar 1.numbers",
    "/Users/anniebing/Desktop/CoStar/CoStar FL 2.numbers"
]

for path in files:
    doc = Document(path)
    table = doc.sheets[0].tables[0]
    rows = list(table.iter_rows())
    headers = [str(c.value) if c.value else "" for c in rows[0]]

    def col(row, name):
        try:
            idx = headers.index(name)
            v = row[idx].value
            return str(v).strip() if v is not None and str(v).strip() not in ["None", ""] else ""
        except:
            return ""

    for row in rows[1:]:
        # Use Property Name or fall back to address
        name = col(row, "Property Name") or col(row, "Property Address")
        if not name or not looks_like_company(name):
            continue

        owner = col(row, "Owner Name")
        mgr = col(row, "Property Manager Name")
        city = col(row, "City")
        state = col(row, "State")
        units = col(row, "Number of Units")
        market = col(row, "Market Name")
        bldg_class = col(row, "Building Class")
        year_built = col(row, "Year Built")
        for_sale = col(row, "For Sale Status")
        sale_price = col(row, "For Sale Price")
        address = col(row, "Property Address")

        notes_parts = []
        if address: notes_parts.append(f"Address: {address}")
        if city and state: notes_parts.append(f"City: {city}, {state}")
        if market: notes_parts.append(f"Market: {market}")
        if units: notes_parts.append(f"Units: {units}")
        if bldg_class: notes_parts.append(f"Class: {bldg_class}")
        if year_built: notes_parts.append(f"Year Built: {year_built}")
        if owner: notes_parts.append(f"Owner: {owner}")
        if mgr: notes_parts.append(f"Manager: {mgr}")
        if for_sale == "Y" and sale_price:
            notes_parts.append(f"FOR SALE: ${float(sale_price):,.0f}" if sale_price.replace('.','').isdigit() else f"FOR SALE: {sale_price}")

        costar_companies[name] = {
            "name": name,
            "website": None,
            "industry": "Multifamily Real Estate",
            "notes": " | ".join(notes_parts)
        }

print(f"  Found {len(costar_companies):,} unique properties from CoStar")

# ── STEP 2: Insert companies into Supabase ───────────────────────────────────
print("\n🏢 Importing companies to Supabase...")
company_rows = list(costar_companies.values())
inserted_companies = {}  # name -> id

total = 0
for chunk in batch(company_rows, 50):
    result = supabase_post("companies", chunk)
    for r in result:
        inserted_companies[r["name"]] = r["id"]
    total += len(result)
    print(f"  Inserted {total}/{len(company_rows)} companies...", end="\r")

print(f"\n  ✅ {total:,} companies imported")

# ── STEP 3: ZoomInfo contacts (pre-collected) ────────────────────────────────
print("\n👥 Importing ZoomInfo contacts...")

# Contacts from our ZoomInfo searches (C-Suite, Facilities, Operations)
zoominfo_contacts = [
    # C-Suite / Operations
    {"first_name": "Paul", "last_name": "Biondolillo", "title": "CFO & COO & CEO", "company_name": "Campbell Property Management"},
    {"first_name": "Steve", "last_name": "Theobald", "title": "EVP & Chief Operating Officer", "company_name": "Walker & Dunlop"},
    {"first_name": "Hayden", "last_name": "McMillian", "title": "President & COO & CFO", "company_name": "Hanover Capital Partners"},
    {"first_name": "Helen", "last_name": "Gotman", "title": "COO & CFO", "company_name": "Hirschfeld Properties"},
    {"first_name": "Dale", "last_name": "Fitch", "title": "CFO & COO", "company_name": "Unicorp National Developments"},
    {"first_name": "Michael", "last_name": "Eustace", "title": "Executive Director & COO & VP", "company_name": "Boca West Master Association"},
    {"first_name": "Pedro", "last_name": "Garcia", "title": "COO & CFO & Co-Founder", "company_name": "Affinity Management Services"},
    {"first_name": "Jonathan", "last_name": "Landrum", "title": "EVP & Chief Operating Officer", "company_name": "Related Group"},
    {"first_name": "Eric", "last_name": "Zimmerman", "title": "VP - Chief Operating Officer", "company_name": "Murex Properties"},
    {"first_name": "Marc", "last_name": "Orio", "title": "Director Operations & COO Construction Management", "company_name": "JBL Asset Management"},
    {"first_name": "Kimberly", "last_name": "Bryan", "title": "COO & Senior VP", "company_name": "The Hutson Companies"},
    {"first_name": "Robert", "last_name": "Johansmeyer", "title": "SVP - Chief Operations Officer", "company_name": "Owens Realty Services"},
    {"first_name": "Craig", "last_name": "Collin", "title": "President & COO", "company_name": "Tavistock Development"},
    {"first_name": "Christopher", "last_name": "Pfeil", "title": "SVP & Chief Operating Officer", "company_name": "Coastal Builders"},
    {"first_name": "Roland", "last_name": "Faith", "title": "COO & CFO", "company_name": "The Faith Group"},
    # Facilities
    {"first_name": "Eric", "last_name": "Skedel", "title": "VP Facilities Management", "company_name": "Discovery Senior Living"},
    {"first_name": "Daniel", "last_name": "Cruz", "title": "VP & Regional Facilities Manager", "company_name": "Cenvill Recreation"},
    {"first_name": "Michael", "last_name": "Cleveland", "title": "VP Facilities Management", "company_name": "ERES Companies"},
    {"first_name": "Elaine", "last_name": "Cabrera", "title": "VP Facilities Management", "company_name": "Sentry Management"},
    {"first_name": "Dan", "last_name": "Carson", "title": "Director Facilities Management", "company_name": "Advenir"},
    {"first_name": "Luis", "last_name": "Misla", "title": "VP Facilities", "company_name": "Carteret Management"},
    {"first_name": "Carlos", "last_name": "Lopez", "title": "VP Facility Operations", "company_name": "Mandich Group"},
    {"first_name": "Dale", "last_name": "Bennett", "title": "VP Facilities", "company_name": "Bedrock Communities"},
    {"first_name": "Stephen", "last_name": "Hess", "title": "VP Facilities", "company_name": "SROA Capital"},
    {"first_name": "Steve", "last_name": "Harrison", "title": "VP Facilities & Sustainability", "company_name": "Parmenter Realty Partners"},
    {"first_name": "Robert", "last_name": "De Torres", "title": "VP Construction & Facilities", "company_name": "Tobin Properties"},
    {"first_name": "Michael", "last_name": "Alejandro", "title": "Director Facilities Management", "company_name": "FirstService Residential"},
    {"first_name": "Michael", "last_name": "Ludy", "title": "Director Facility Management", "company_name": "FirstService Residential"},
    {"first_name": "Daniel", "last_name": "Roderick", "title": "Senior Director Facilities Management", "company_name": "Jones Lang LaSalle"},
    {"first_name": "Gayle", "last_name": "Erickson-Ash", "title": "Director Property Management & Facility Services", "company_name": "Commercial Property Southwest Florida"},
    {"first_name": "Carlos", "last_name": "Alba", "title": "Director Facilities & Manager", "company_name": "Related Group"},
    {"first_name": "Derek", "last_name": "Olszewski", "title": "VP Facility Operations", "company_name": "NDM Hospitality Services"},
]

# First, ensure companies exist for ZoomInfo contacts
zi_company_names = list(set(c["company_name"] for c in zoominfo_contacts))
zi_new_companies = [
    {"name": n, "industry": "Real Estate", "notes": "Added via ZoomInfo import"}
    for n in zi_company_names
    if n not in inserted_companies
]

if zi_new_companies:
    result = supabase_post("companies", zi_new_companies)
    for r in result:
        inserted_companies[r["name"]] = r["id"]
    print(f"  Added {len(result)} new companies from ZoomInfo")

# Insert contacts
contact_rows = []
for c in zoominfo_contacts:
    cid = inserted_companies.get(c["company_name"])
    contact_rows.append({
        "first_name": c["first_name"],
        "last_name": c["last_name"],
        "title": c["title"],
        "company_id": cid,
        "notes": f"Source: ZoomInfo | Company: {c['company_name']}"
    })

result = supabase_post("contacts", contact_rows)
print(f"  ✅ {len(result)} ZoomInfo contacts imported")

print(f"""
🎉 Import complete!
   Companies (CoStar properties): {total:,}
   ZoomInfo contacts: {len(result)}

Open Atlas and check your dashboard → https://atlas-one-omega.vercel.app/dashboard
""")
