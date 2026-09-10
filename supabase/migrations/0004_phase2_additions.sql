-- Phase 2 additions — additive only, does not alter Phase 1 tables/policies.

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table notifications enable row level security;
create policy "notifications_owner_all" on notifications for all using (profile_id = auth.uid());

-- Full-text search across companies (name + about) for Phase 2 search/filtering
alter table companies add column if not exists search_vector tsvector
  generated always as (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(about,''))) stored;
create index if not exists idx_companies_search on companies using gin(search_vector);

alter table products add column if not exists search_vector tsvector
  generated always as (to_tsvector('english', coalesce(name,''))) stored;
create index if not exists idx_products_search on products using gin(search_vector);

-- Company-side visibility into leads matched to them (Phase 1 leads table had no RLS policy yet)
alter table leads enable row level security;
create policy "leads_admin_all" on leads for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);
create policy "leads_matched_company_read" on leads for select using (
  exists (
    select 1 from companies c
    where c.owner_id = auth.uid() and c.id = any(matched_company_ids)
  )
);

alter table requirement_matches enable row level security;
create policy "requirement_matches_customer_read" on requirement_matches for select using (
  exists (select 1 from requirements r where r.id = requirement_id and r.customer_id = auth.uid())
);
create policy "requirement_matches_company_read" on requirement_matches for select using (
  exists (select 1 from companies c where c.id = company_id and c.owner_id = auth.uid())
);
create policy "requirement_matches_customer_write" on requirement_matches for update using (
  exists (select 1 from requirements r where r.id = requirement_id and r.customer_id = auth.uid())
);

alter table quotations enable row level security;
create policy "quotations_read" on quotations for select using (
  exists (select 1 from companies c where c.id = company_id and c.owner_id = auth.uid())
  or exists (select 1 from rfqs r where r.id = rfq_id and r.customer_id = auth.uid())
);

alter table subscription_plans enable row level security;
create policy "plans_public_read" on subscription_plans for select using (is_active = true);

alter table subscriptions enable row level security;
create policy "subscriptions_owner_all" on subscriptions for all using (
  exists (select 1 from companies c where c.id = company_id and c.owner_id = auth.uid())
);

alter table verifications enable row level security;
create policy "verifications_owner_read" on verifications for select using (
  exists (select 1 from companies c where c.id = company_id and c.owner_id = auth.uid())
);
create policy "verifications_admin_all" on verifications for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
);

alter table whatsapp_templates enable row level security;
create policy "wa_templates_staff_only" on whatsapp_templates for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','company'))
);
alter table whatsapp_campaigns enable row level security;
create policy "wa_campaigns_staff_only" on whatsapp_campaigns for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','company'))
);
alter table segments enable row level security;
create policy "segments_staff_only" on segments for all using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','company'))
);
