-- Demo seed data (safe to run once against a fresh DB)

insert into cities (name, province, country) values
  ('Karachi', 'Sindh', 'Pakistan'),
  ('Lahore', 'Punjab', 'Pakistan'),
  ('Islamabad', 'Islamabad Capital Territory', 'Pakistan'),
  ('Rawalpindi', 'Punjab', 'Pakistan');

insert into categories (name, slug, type) values
  ('MEP', 'mep', 'service'),
  ('HVAC', 'hvac', 'service'),
  ('Architect', 'architect', 'service'),
  ('Ducting', 'ducting', 'service'),
  ('Commercial Kitchen', 'commercial-kitchen', 'service'),
  ('Kitchen Equipment', 'kitchen-equipment', 'product'),
  ('Electrical', 'electrical', 'service'),
  ('Fire Fighting', 'fire-fighting', 'service'),
  ('Plumbing', 'plumbing', 'service'),
  ('Fabrication', 'fabrication', 'service');

insert into subscription_plans (name, price_monthly, price_yearly, benefits) values
  ('FREE', 0, 0, '{"Free Listing"}'),
  ('PROFESSIONAL', 2000, 20000, '{"Free Listing","More Portfolio Photos"}'),
  ('VERIFIED', 5000, 50000, '{"Verified Badge","Higher Search Position"}'),
  ('FEATURED', 10000, 100000, '{"Featured Profile","Priority Leads"}'),
  ('PREMIUM COMPANY', 20000, 200000, '{"Sponsored Placement","Analytics","RFQ Access"}');
