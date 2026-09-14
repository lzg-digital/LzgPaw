-- ============================================================================
-- LzgPaw — Database schema (Supabase / PostgreSQL)
--
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh
-- project. It is idempotent-ish (uses IF NOT EXISTS / OR REPLACE) so it can
-- be re-run safely during setup.
--
-- Design principles this schema enforces:
--   1. Every storefront fact (products, prices, bundles, reviews, orders) is
--      DATA, never hardcoded in the frontend.
--   2. Selling price is always a value a human typed in (`products.price`).
--      total_cost / estimated_profit / profit_margin_pct are GENERATED
--      (computed) columns — the database itself guarantees the app can only
--      calculate from the manual price, never rewrite it.
--   3. Ratings are never stored as free numbers — they are derived from the
--      `product_ratings` view over *approved* reviews only, so a product
--      with zero genuine reviews always shows zero, never a fabricated
--      number.
--   4. Row Level Security is ON for every table. Public (anon) visitors get
--      narrow, explicit read access to storefront-safe tables only.
--      Orders, customers, payment events, discount codes and admin_users
--      have NO anon/authenticated policies at all — they are only ever
--      touched by trusted server code using the Supabase service-role key
--      (see lib/supabase/admin.ts), which bypasses RLS by design and is
--      never sent to the browser.
-- ============================================================================

create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- ----------------------------------------------------------------------------
-- Helper: generic updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
do $$ begin
  create type product_status as enum ('draft', 'active', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type stock_status as enum ('in_stock', 'low_stock', 'out_of_stock', 'backorder');
exception when duplicate_object then null; end $$;

do $$ begin
  create type review_status as enum ('pending', 'approved', 'rejected', 'hidden');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending_payment', 'paid', 'failed', 'refunded', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type fulfillment_status as enum ('unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type media_type as enum ('main', 'detail', 'lifestyle', 'before', 'after', 'usage');
exception when duplicate_object then null; end $$;

do $$ begin
  create type discount_type as enum ('percentage', 'fixed');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- admin_users — one row per admin, id mirrors auth.users(id) (Supabase Auth)
-- ----------------------------------------------------------------------------
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  role text not null default 'admin' check (role in ('admin', 'owner')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

-- Track failed logins for brute-force protection (checked by the login route).
create table if not exists admin_login_attempts (
  id bigint generated always as identity primary key,
  email text not null,
  ip_address text,
  success boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_admin_login_attempts_lookup
  on admin_login_attempts (email, created_at desc);

-- Generic rate-limit ledger for other public, unauthenticated endpoints
-- (order lookup, review submission, checkout) where brute-force/spam/
-- enumeration is a concern but a dedicated table like the one above isn't
-- warranted. See lib/rate-limit.ts.
create table if not exists rate_limit_events (
  id bigint generated always as identity primary key,
  bucket text not null,   -- e.g. 'order-lookup', 'review-submit', 'checkout'
  key text not null,      -- e.g. an IP address, or "ip:identifier"
  created_at timestamptz not null default now()
);
create index if not exists idx_rate_limit_events_lookup
  on rate_limit_events (bucket, key, created_at desc);

-- ----------------------------------------------------------------------------
-- categories
-- ----------------------------------------------------------------------------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  how_to_use text,
  benefits jsonb not null default '[]',   -- string[] e.g. ["No batteries","Reusable"]
  faq jsonb not null default '[]',        -- [{question, answer}]
  category_id uuid references categories(id) on delete set null,
  tags text[] not null default '{}',
  status product_status not null default 'draft',
  badge text,                             -- e.g. "BEST SELLER" — admin-set, optional
  position integer not null default 0,    -- admin-controlled manual sort order (storefront default sort, best-sellers shelf)
  sku text unique,
  stock_status stock_status not null default 'in_stock',
  stock_quantity integer not null default 0,
  video_url text,

  currency text not null default 'USD',

  -- Manual pricing inputs (admin-entered — see README "Manual pricing system")
  price numeric(10, 2) not null check (price >= 0),
  compare_at_price numeric(10, 2) check (compare_at_price is null or compare_at_price >= 0),
  product_cost numeric(10, 2) not null default 0 check (product_cost >= 0),
  shipping_cost numeric(10, 2) not null default 0 check (shipping_cost >= 0),
  other_cost numeric(10, 2) not null default 0 check (other_cost >= 0),

  -- Computed (never manually settable, never touches `price`)
  total_cost numeric(10, 2) generated always as
    (round((coalesce(product_cost, 0) + coalesce(shipping_cost, 0) + coalesce(other_cost, 0))::numeric, 2)) stored,
  estimated_profit numeric(10, 2) generated always as
    (round((price - (coalesce(product_cost, 0) + coalesce(shipping_cost, 0) + coalesce(other_cost, 0)))::numeric, 2)) stored,
  profit_margin_pct numeric(6, 2) generated always as
    (case when price > 0
       then round((((price - (coalesce(product_cost, 0) + coalesce(shipping_cost, 0) + coalesce(other_cost, 0))) / price) * 100)::numeric, 2)
       else null
     end) stored,

  seo_title text,
  seo_description text,

  supplier_name text,       -- internal only, never rendered on storefront
  supplier_notes text,      -- internal only

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_products_status on products (status);
create index if not exists idx_products_position on products (position);
create index if not exists idx_products_category on products (category_id);
create index if not exists idx_products_slug on products (slug);

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
  before update on products
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- product_images
-- ----------------------------------------------------------------------------
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt_text text not null default '',
  type media_type not null default 'detail',
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_product_images_product on product_images (product_id, position);

-- ----------------------------------------------------------------------------
-- product_variants (e.g. color/size options)
-- ----------------------------------------------------------------------------
create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  option_name text not null,     -- e.g. "Color"
  option_value text not null,    -- e.g. "Sage Green"
  sku text,
  price_override numeric(10, 2), -- null = use product.price
  stock_quantity integer not null default 0,
  position integer not null default 0,
  active boolean not null default true
);
create index if not exists idx_product_variants_product on product_variants (product_id);

-- ----------------------------------------------------------------------------
-- bundles (e.g. "2 Pack — Most Popular") and their line items
-- ----------------------------------------------------------------------------
create table if not exists bundles (
  id uuid primary key default gen_random_uuid(),
  name text not null,             -- e.g. "2 Pack"
  slug text not null unique,
  description text,
  badge text,                     -- e.g. "MOST POPULAR" — admin-set, optional
  price numeric(10, 2) not null check (price >= 0),          -- manual bundle price
  compare_at_price numeric(10, 2),                            -- optional manual override;
                                                                -- falls back to sum(item price * qty)
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_bundles_updated_at on bundles;
create trigger trg_bundles_updated_at
  before update on bundles
  for each row execute function set_updated_at();

create table if not exists bundle_items (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references bundles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0)
);
create index if not exists idx_bundle_items_bundle on bundle_items (bundle_id);

-- ----------------------------------------------------------------------------
-- reviews — genuine only. Never seeded with fake data.
-- ----------------------------------------------------------------------------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  order_id uuid,                              -- set by server when verifiable, enables "Verified Purchase"
  customer_name text not null,
  customer_email text,                        -- not shown publicly; used only to verify purchase
  rating smallint not null check (rating between 1 and 5),
  review_text text not null,
  photo_url text,
  video_url text,
  verified_purchase boolean not null default false,
  status review_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_reviews_product_status on reviews (product_id, status);

drop trigger if exists trg_reviews_updated_at on reviews;
create trigger trg_reviews_updated_at
  before update on reviews
  for each row execute function set_updated_at();

-- Genuine, derived rating — never a hand-entered number.
create or replace view product_ratings as
  select
    product_id,
    round(avg(rating)::numeric, 2) as rating_average,
    count(*) as rating_count
  from reviews
  where status = 'approved'
  group by product_id;

-- ----------------------------------------------------------------------------
-- customers & addresses
-- ----------------------------------------------------------------------------
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  full_name text not null,
  phone text,
  country text not null,        -- ISO country name
  country_code text not null,   -- ISO-3166 alpha-2, e.g. "US"
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state_region text,
  postal_code text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_addresses_customer on addresses (customer_id);

-- ----------------------------------------------------------------------------
-- discount_codes
-- ----------------------------------------------------------------------------
create table if not exists discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type discount_type not null,
  value numeric(10, 2) not null check (value > 0),
  active boolean not null default true,
  usage_limit integer,
  usage_count integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Atomic redemption counter — called from the payment webhook (never from
-- checkout, where the payment hasn't been confirmed yet) so concurrent
-- redemptions of the same code can't race each other into undercounting.
-- SECURITY DEFINER is intentionally NOT used here — the caller (the
-- webhook route, via the service-role client) already bypasses RLS, so
-- elevating the function's own privileges would add risk with no benefit.
-- What actually matters is the REVOKE/GRANT block at the end of this file,
-- which stops this from being callable through the public RPC API at all.
create or replace function increment_discount_usage(p_code text)
returns void as $$
begin
  update discount_codes set usage_count = usage_count + 1 where code = p_code;
end;
$$ language plpgsql;

-- ----------------------------------------------------------------------------
-- orders & order_items
-- ----------------------------------------------------------------------------
create sequence if not exists order_number_seq start 1000;

create or replace function generate_order_number()
returns text as $$
begin
  return 'LZG-' || nextval('order_number_seq')::text;
end;
$$ language plpgsql;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default generate_order_number(),

  customer_id uuid references customers(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  customer_country_code text, -- ISO-3166 alpha-2

  shipping_address jsonb not null, -- snapshot at time of order
  billing_address jsonb,

  currency text not null default 'USD',
  subtotal numeric(10, 2) not null default 0,
  shipping_amount numeric(10, 2) not null default 0,
  discount_amount numeric(10, 2) not null default 0,
  discount_code text,
  tax_amount numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null default 0,

  payment_status payment_status not null default 'pending_payment',
  fulfillment_status fulfillment_status not null default 'unfulfilled',

  payment_provider text not null default 'paypesa',
  payment_reference text,           -- provider transaction/reference id
  tracking_number text,
  tracking_carrier text,

  customer_notes text,
  internal_notes text,              -- never shown to the customer

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_orders_email on orders (customer_email);
create index if not exists idx_orders_payment_status on orders (payment_status);
create index if not exists idx_orders_created_at on orders (created_at desc);

drop trigger if exists trg_orders_updated_at on orders;
create trigger trg_orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  bundle_id uuid references bundles(id) on delete set null,

  -- Snapshots so historical orders stay accurate even if the product changes later.
  name_snapshot text not null,
  sku_snapshot text,
  unit_price numeric(10, 2) not null,
  quantity integer not null check (quantity > 0),
  line_total numeric(10, 2) not null
);
create index if not exists idx_order_items_order on order_items (order_id);

-- ----------------------------------------------------------------------------
-- payment_events — webhook audit log + idempotency guard
-- ----------------------------------------------------------------------------
create table if not exists payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete set null,
  provider text not null default 'paypesa',
  provider_event_id text not null,   -- unique id PayPesa assigns to the event/webhook delivery
  event_type text not null,
  amount numeric(10, 2),
  currency text,
  signature_valid boolean not null,
  raw_payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)  -- guarantees idempotent webhook processing
);
create index if not exists idx_payment_events_order on payment_events (order_id);

-- ----------------------------------------------------------------------------
-- site_settings — editable copy (announcement bar, trust strip, policies)
-- Single flexible key/value store so non-technical admins can edit storefront
-- copy without a deploy. Only keys explicitly meant to be public are exposed
-- to anon (see RLS policy below) — the table itself has no "public" flag
-- because every current key is safe storefront copy; add a `is_public`
-- boolean here first if a future key should stay internal-only.
-- ----------------------------------------------------------------------------
create table if not exists site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_site_settings_updated_at on site_settings;
create trigger trg_site_settings_updated_at
  before update on site_settings
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- analytics_events — minimal, anonymized, write-only from the browser
-- ----------------------------------------------------------------------------
create table if not exists analytics_events (
  id bigint generated always as identity primary key,
  event_type text not null,   -- page_view | product_view | add_to_cart | begin_checkout | purchase | bundle_select | cta_click
  session_id text not null,   -- random client-generated id, not tied to identity
  product_id uuid references products(id) on delete set null,
  order_id uuid references orders(id) on delete set null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_analytics_events_type on analytics_events (event_type, created_at desc);

-- ============================================================================
-- STORAGE — product media bucket
-- Public read (product photos/videos need to be viewable via plain URLs),
-- writes only ever happen server-side through the service-role client
-- (see app/api/admin/upload/route.ts) — anon/authenticated roles are never
-- granted storage write access, so this stays safe despite being a public
-- bucket.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do nothing;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table admin_users enable row level security;
alter table admin_login_attempts enable row level security;
alter table rate_limit_events enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table bundles enable row level security;
alter table bundle_items enable row level security;
alter table reviews enable row level security;
alter table customers enable row level security;
alter table addresses enable row level security;
alter table discount_codes enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payment_events enable row level security;
alter table site_settings enable row level security;
alter table analytics_events enable row level security;

-- Public, read-only storefront data -----------------------------------------
create policy "public can read categories" on categories
  for select using (true);

create policy "public can read active products" on products
  for select using (status = 'active');

create policy "public can read images of active products" on product_images
  for select using (
    exists (select 1 from products p where p.id = product_images.product_id and p.status = 'active')
  );

create policy "public can read variants of active products" on product_variants
  for select using (
    active and exists (select 1 from products p where p.id = product_variants.product_id and p.status = 'active')
  );

create policy "public can read active bundles" on bundles
  for select using (active);

create policy "public can read items of active bundles" on bundle_items
  for select using (
    exists (select 1 from bundles b where b.id = bundle_items.bundle_id and b.active)
  );

create policy "public can read approved reviews" on reviews
  for select using (status = 'approved');

-- Customers may submit a review, but only ever in the "pending" state, and
-- may never mark themselves as verified — that is set server-side once a
-- matching paid order is confirmed.
create policy "public can submit a pending review" on reviews
  for insert with check (status = 'pending' and verified_purchase = false);

create policy "public can read storefront settings" on site_settings
  for select using (true);

-- Analytics is write-only from the browser; nothing can be read back.
create policy "public can write analytics events" on analytics_events
  for insert with check (true);

-- Everything else (admin_users, admin_login_attempts, rate_limit_events,
-- customers, addresses, discount_codes, orders, order_items, payment_events)
-- intentionally has NO anon/authenticated policies. RLS is enabled with zero
-- permissive policies, so the default is deny — these tables are only
-- reachable through trusted server code using the Supabase service-role
-- key, which bypasses RLS.

-- ============================================================================
-- FUNCTION EXECUTION PRIVILEGES
--
-- IMPORTANT Supabase/PostgREST gotcha: creating a SQL function grants
-- EXECUTE to PUBLIC by default, which means anon/authenticated clients can
-- invoke it directly via the `/rest/v1/rpc/<function>` endpoint — RLS on
-- the underlying tables does NOT protect against this on its own for
-- functions that write data, since the function itself decides what to
-- touch. Both functions below are meant to be called only by trusted
-- server code (via the service-role client), so public/anon/authenticated
-- execute access is explicitly revoked.
-- ============================================================================
revoke execute on function increment_discount_usage(text) from public, anon, authenticated;
grant execute on function increment_discount_usage(text) to service_role;

revoke execute on function generate_order_number() from public, anon, authenticated;
grant execute on function generate_order_number() to service_role;
-- Note: generate_order_number() is also called implicitly as the DEFAULT
-- for orders.order_number on every INSERT — that path runs as the role
-- performing the insert (service_role, per the RLS policies above), not
-- through the RPC surface, so this revoke does not break order creation.
