-- Companies
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  industry text,
  notes text,
  created_at timestamptz default now()
);

-- Contacts
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text,
  title text,
  notes text,
  created_at timestamptz default now()
);

-- Deals
create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  title text not null,
  value numeric,
  stage text not null default 'Qualified',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Activity log
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  type text not null,
  description text not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security (keeps data private)
alter table companies enable row level security;
alter table contacts enable row level security;
alter table deals enable row level security;
alter table activities enable row level security;

-- Allow authenticated users full access to their data
create policy "authenticated full access" on companies for all using (auth.role() = 'authenticated');
create policy "authenticated full access" on contacts for all using (auth.role() = 'authenticated');
create policy "authenticated full access" on deals for all using (auth.role() = 'authenticated');
create policy "authenticated full access" on activities for all using (auth.role() = 'authenticated');
