-- ExpertNet Pakistan — Phase 1/2 core schema
-- Run via: supabase db push  (or paste into Supabase SQL editor)

create extension if not exists "uuid-ossp";

create type user_role as enum ('customer', 'professional', 'company', 'admin');
create type verification_status as enum ('unverified', 'pending', 'verified', 'rejected');
create type requirement_status as enum ('open', 'matched', 'closed');
create type rfq_status as enum ('open', 'invited', 'quotation_received', 'shortlisted', 'awarded', 'closed');
create type quotation_status as enum ('submitted', 'shortlisted', 'awarded', 'rejected');
create type match_status as enum ('suggested', 'invited', 'contacted', 'declined');
create type consent_status as enum ('unknown', 'opted_in', 'opted_out');
create type wa_direction as enum ('inbound', 'outbound');

-- ---------- geography & taxonomy ----------
create table cities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  province text,
  country text not null default 'Pakistan',
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  parent_id uuid references categories(id),
  type text not null check (type in ('service','product')),
  created_at timestamptz not null default now()
);

create table services (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid not null references categories(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now()
);

-- ---------- identity ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'customer',
  full_name text,
  phone text,
  whatsapp_number text,
  email text,
  city_id uuid references cities(id),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table subscription_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  price_monthly numeric(12,2) not null default 0,
  price_yearly numeric(12,2) not null default 0,
  benefits text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table companies (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  logo_url text,
  category_ids uuid[] not null default '{}',
  city_id uuid references cities(id),
  province text,
  country text not null default 'Pakistan',
  about text,
  experience_years int,
  website text,
  phone text,
  whatsapp_number text,
  email text,
  address text,
  maps_link text,
  business_hours jsonb,
  verification_status verification_status not null default 'unverified',
  plan_id uuid references subscription_plans(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table professionals (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  designation text,
  category_ids uuid[] not null default '{}',
  services text[] not null default '{}',
  experience_years int,
  about text,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table company_services (
  company_id uuid not null references companies(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  primary key (company_id, service_id)
);

create table portfolios (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  title text not null,
  description text,
  photos text[] not null default '{}',
  pdf_url text,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  category_id uuid references categories(id),
  name text not null,
  slug text not null unique,
  specs jsonb,
  photos text[] not null default '{}',
  catalogue_pdf_url text,
  price_note text,
  created_at timestamptz not null default now()
);

-- ---------- requirements / matching / RFQ ----------
create table requirements (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  city_id uuid references cities(id),
  project_type text,
  description text,
  budget numeric(14,2),
  required_date date,
  category_ids uuid[] not null default '{}',
  attachments text[] not null default '{}',
  status requirement_status not null default 'open',
  created_at timestamptz not null default now()
);

create table requirement_matches (
  id uuid primary key default uuid_generate_v4(),
  requirement_id uuid not null references requirements(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  match_score numeric(5,2) not null default 0,
  status match_status not null default 'suggested',
  created_at timestamptz not null default now(),
  unique (requirement_id, company_id)
);

create table rfqs (
  id uuid primary key default uuid_generate_v4(),
  requirement_id uuid not null references requirements(id) on delete cascade,
  customer_id uuid not null references profiles(id) on delete cascade,
  status rfq_status not null default 'open',
  created_at timestamptz not null default now()
);

create table quotations (
  id uuid primary key default uuid_generate_v4(),
  rfq_id uuid not null references rfqs(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  amount numeric(14,2),
  notes text,
  pdf_url text,
  status quotation_status not null default 'submitted',
  created_at timestamptz not null default now()
);

-- ---------- leads ----------
create table leads (
  id uuid primary key default uuid_generate_v4(),
  source text not null,
  category_id uuid references categories(id),
  city_id uuid references cities(id),
  customer_id uuid references profiles(id),
  requirement_id uuid references requirements(id),
  matched_company_ids uuid[] not null default '{}',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table lead_activities (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references leads(id) on delete cascade,
  company_id uuid references companies(id),
  activity_type text not null,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------- billing ----------
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  plan_id uuid not null references subscription_plans(id),
  status text not null default 'active',
  started_at timestamptz not null default now(),
  expires_at timestamptz
);

create table payments (
  id uuid primary key default uuid_generate_v4(),
  subscription_id uuid not null references subscriptions(id) on delete cascade,
  amount numeric(14,2) not null,
  currency text not null default 'PKR',
  status text not null default 'pending',
  provider_ref text,
  created_at timestamptz not null default now()
);

create table featured_listings (
  id uuid primary key default uuid_generate_v4(),
  entity_type text not null check (entity_type in ('company','product')),
  entity_id uuid not null,
  placement text not null check (placement in ('homepage','category','city')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null
);

create table verifications (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  status verification_status not null default 'pending',
  documents text[] not null default '{}',
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------- WhatsApp CRM module ----------
create table whatsapp_contacts (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references profiles(id),
  phone_e164 text not null unique,
  display_name text,
  consent_status consent_status not null default 'unknown',
  source text,
  opted_out_at timestamptz,
  created_at timestamptz not null default now()
);

create table whatsapp_conversations (
  id uuid primary key default uuid_generate_v4(),
  contact_id uuid not null references whatsapp_contacts(id) on delete cascade,
  assigned_to uuid references profiles(id),
  status text not null default 'open',
  last_message_at timestamptz
);

create table whatsapp_templates (
  id uuid primary key default uuid_generate_v4(),
  meta_template_name text not null unique,
  category text,
  language text not null default 'en',
  body text not null,
  status text not null default 'pending'
);

create table whatsapp_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references whatsapp_conversations(id) on delete cascade,
  direction wa_direction not null,
  wa_message_id text,
  template_id uuid references whatsapp_templates(id),
  body text,
  media_url text,
  status text,
  sent_at timestamptz not null default now()
);

create table segments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  filter_json jsonb not null default '{}'
);

create table whatsapp_campaigns (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid not null references whatsapp_templates(id),
  segment_id uuid not null references segments(id),
  scheduled_at timestamptz,
  status text not null default 'draft',
  sent_count int not null default 0,
  delivered_count int not null default 0,
  failed_count int not null default 0
);

create table imported_contacts (
  id uuid primary key default uuid_generate_v4(),
  batch_id uuid not null,
  raw_name text,
  raw_company text,
  raw_phone text,
  raw_email text,
  category text,
  city text,
  notes text,
  source_reference text,
  matched_contact_id uuid references whatsapp_contacts(id),
  created_at timestamptz not null default now()
);

create table analytics_events (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null,
  entity_type text,
  entity_id uuid,
  city_id uuid references cities(id),
  category_id uuid references categories(id),
  created_at timestamptz not null default now()
);

-- ---------- indexes ----------
create index idx_companies_city on companies(city_id);
create index idx_companies_category_ids on companies using gin(category_ids);
create index idx_professionals_category_ids on professionals using gin(category_ids);
create index idx_products_category on products(category_id);
create index idx_requirements_customer on requirements(customer_id);
create index idx_leads_status on leads(status);
create index idx_wa_contacts_consent on whatsapp_contacts(consent_status);
create index idx_wa_messages_conversation on whatsapp_messages(conversation_id);

-- ---------- RLS ----------
alter table profiles enable row level security;
alter table companies enable row level security;
alter table professionals enable row level security;
alter table requirements enable row level security;
alter table rfqs enable row level security;
alter table quotations enable row level security;
alter table whatsapp_contacts enable row level security;
alter table whatsapp_conversations enable row level security;
alter table whatsapp_messages enable row level security;

-- profiles: user reads/updates own row; admin reads all
create policy "profiles_self_select" on profiles for select using (auth.uid() = id);
create policy "profiles_self_update" on profiles for update using (auth.uid() = id);
create policy "profiles_admin_all" on profiles for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- companies: public can read; only owner or admin can write
create policy "companies_public_read" on companies for select using (true);
create policy "companies_owner_write" on companies for insert with check (owner_id = auth.uid());
create policy "companies_owner_update" on companies for update using (
  owner_id = auth.uid()
  or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- professionals: public read; owner write
create policy "professionals_public_read" on professionals for select using (true);
create policy "professionals_owner_write" on professionals for insert with check (profile_id = auth.uid());
create policy "professionals_owner_update" on professionals for update using (profile_id = auth.uid());

-- requirements: customer manages own; matched companies can read via requirement_matches (handled in API layer with service role for the join)
create policy "requirements_owner_all" on requirements for all using (customer_id = auth.uid());

-- rfqs / quotations: scoped to customer or the quoting company owner
create policy "rfqs_owner_read" on rfqs for select using (customer_id = auth.uid());
create policy "quotations_company_write" on quotations for insert with check (
  exists (select 1 from companies c where c.id = company_id and c.owner_id = auth.uid())
);

-- WhatsApp CRM tables: internal staff/admin only (no public access)
create policy "wa_contacts_staff_only" on whatsapp_contacts for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','company'))
);
create policy "wa_conversations_staff_only" on whatsapp_conversations for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','company'))
);
create policy "wa_messages_staff_only" on whatsapp_messages for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','company'))
);
