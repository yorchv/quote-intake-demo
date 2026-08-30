create table if not exists organizations (
  organization_id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists users (
  user_id text primary key,
  organization_id text not null references organizations(organization_id),
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists providers (
  provider_id text primary key,
  organization_id text not null references organizations(organization_id),
  name text not null,
  status text not null,
  risk_level text not null,
  payload jsonb not null default '{}'::jsonb
);

create table if not exists provider_requests (
  request_id text primary key,
  organization_id text not null references organizations(organization_id),
  provider_id text,
  status text not null,
  owner_user_id text,
  due_date date,
  payload jsonb not null default '{}'::jsonb
);

create table if not exists usage_events (
  event_id bigserial primary key,
  organization_id text not null,
  user_id text,
  event_name text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists billing_events (
  event_id bigserial primary key,
  organization_id text not null,
  event_name text not null,
  amount_usd numeric(12,2) not null,
  sandbox boolean not null default true,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists feedback_events (
  event_id bigserial primary key,
  organization_id text not null,
  user_id text,
  workflow text,
  severity text not null,
  message text not null,
  willingness_to_pay text,
  lost_time_minutes text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists product_states (
  organization_id text not null,
  product_id text not null,
  state jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (organization_id, product_id)
);

create table if not exists public_directory_items (
  product_id text not null,
  item_id text not null,
  item_name text not null,
  postal_code text not null,
  postal_prefix text not null,
  latitude double precision,
  longitude double precision,
  source_kind text not null default 'seed',
  origin text not null default 'seed',
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (product_id, item_id)
);

create index if not exists public_directory_items_product_postal_idx
on public_directory_items (product_id, postal_prefix, postal_code);
