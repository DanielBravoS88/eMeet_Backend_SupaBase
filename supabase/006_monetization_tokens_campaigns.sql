-- eMeet: monetizacion por tokens promocionales para locatarios

create table if not exists public.token_wallets (
  id uuid primary key default gen_random_uuid(),
  locatario_id uuid not null references public.profiles(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (locatario_id)
);

create table if not exists public.token_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.token_wallets(id) on delete cascade,
  type text not null check (type in ('purchase','consume','refund','adjustment')),
  amount integer not null,
  reason text not null,
  reference_type text,
  reference_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  locatario_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (provider in ('mercadopago','transbank_webpay')),
  pack_code text not null check (pack_code in ('starter','growth','pro')),
  token_amount integer not null check (token_amount > 0),
  amount_clp integer not null check (amount_clp > 0),
  status text not null default 'pending' check (status in ('pending','paid','failed','cancelled','expired')),
  provider_order_id text,
  provider_payment_id text,
  checkout_url text,
  raw_provider_response jsonb,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create table if not exists public.promotion_campaigns (
  id uuid primary key default gen_random_uuid(),
  locatario_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.locatario_events(id) on delete cascade,
  type text not null check (type in ('featured','geo_boost','coupon','premium_badge')),
  status text not null default 'active' check (status in ('active','paused','expired','cancelled')),
  token_cost integer not null check (token_cost > 0),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.promotion_campaigns(id) on delete cascade,
  title text not null,
  description text,
  qr_token text not null unique,
  status text not null default 'active' check (status in ('active','redeemed','expired','cancelled')),
  expires_at timestamptz not null,
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.qr_validations (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  locatario_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('valid','invalid','expired','consumed','cancelled')),
  scanned_at timestamptz not null default now()
);

create index if not exists idx_token_wallets_locatario on public.token_wallets(locatario_id);
create index if not exists idx_token_transactions_wallet_created on public.token_transactions(wallet_id, created_at desc);
create index if not exists idx_payment_orders_locatario_created on public.payment_orders(locatario_id, created_at desc);
create index if not exists idx_promotion_campaigns_locatario_created on public.promotion_campaigns(locatario_id, created_at desc);
create index if not exists idx_promotion_campaigns_event_status on public.promotion_campaigns(event_id, status);
create index if not exists idx_coupons_qr_token on public.coupons(qr_token);

alter table public.token_wallets enable row level security;
alter table public.token_transactions enable row level security;
alter table public.payment_orders enable row level security;
alter table public.promotion_campaigns enable row level security;
alter table public.coupons enable row level security;
alter table public.qr_validations enable row level security;

create policy "token_wallets_select_own"
  on public.token_wallets for select to authenticated
  using (auth.uid() = locatario_id);

create policy "token_transactions_select_own"
  on public.token_transactions for select to authenticated
  using (
    exists (
      select 1 from public.token_wallets w
      where w.id = wallet_id and w.locatario_id = auth.uid()
    )
  );

create policy "payment_orders_select_own"
  on public.payment_orders for select to authenticated
  using (auth.uid() = locatario_id);

create policy "promotion_campaigns_select_own"
  on public.promotion_campaigns for select to authenticated
  using (auth.uid() = locatario_id);

create policy "coupons_select_own_campaign"
  on public.coupons for select to authenticated
  using (
    exists (
      select 1 from public.promotion_campaigns c
      where c.id = campaign_id and c.locatario_id = auth.uid()
    )
  );

create policy "qr_validations_select_own"
  on public.qr_validations for select to authenticated
  using (auth.uid() = locatario_id);

create or replace function public.consume_tokens_for_campaign(
  p_locatario_id uuid,
  p_event_id uuid,
  p_type text,
  p_token_cost integer,
  p_starts_at timestamptz,
  p_ends_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet_id uuid;
  v_balance integer;
  v_campaign_id uuid;
begin
  if p_token_cost <= 0 then
    raise exception 'invalid_token_cost';
  end if;

  select id, balance
    into v_wallet_id, v_balance
  from public.token_wallets
  where locatario_id = p_locatario_id
  for update;

  if v_wallet_id is null then
    raise exception 'wallet_not_found';
  end if;

  if v_balance < p_token_cost then
    raise exception 'insufficient_balance';
  end if;

  update public.token_wallets
  set balance = balance - p_token_cost,
      updated_at = now()
  where id = v_wallet_id;

  insert into public.promotion_campaigns (
    locatario_id,
    event_id,
    type,
    status,
    token_cost,
    starts_at,
    ends_at
  )
  values (
    p_locatario_id,
    p_event_id,
    p_type,
    'active',
    p_token_cost,
    p_starts_at,
    p_ends_at
  )
  returning id into v_campaign_id;

  insert into public.token_transactions (
    wallet_id,
    type,
    amount,
    reason,
    reference_type,
    reference_id
  )
  values (
    v_wallet_id,
    'consume',
    -p_token_cost,
    'Activacion de promocion',
    'promotion_campaign',
    v_campaign_id
  );

  return v_campaign_id;
end;
$$;

create or replace function public.credit_tokens_for_paid_order(
  p_order_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.payment_orders%rowtype;
  v_wallet_id uuid;
begin
  select *
    into v_order
  from public.payment_orders
  where id = p_order_id
  for update;

  if v_order.id is null then
    raise exception 'order_not_found';
  end if;

  if v_order.status = 'paid' then
    return v_order.id;
  end if;

  if v_order.status not in ('pending', 'failed') then
    raise exception 'order_not_payable';
  end if;

  insert into public.token_wallets (locatario_id, balance)
  values (v_order.locatario_id, 0)
  on conflict (locatario_id) do nothing;

  select id
    into v_wallet_id
  from public.token_wallets
  where locatario_id = v_order.locatario_id
  for update;

  update public.token_wallets
  set balance = balance + v_order.token_amount,
      updated_at = now()
  where id = v_wallet_id;

  insert into public.token_transactions (
    wallet_id,
    type,
    amount,
    reason,
    reference_type,
    reference_id
  )
  values (
    v_wallet_id,
    'purchase',
    v_order.token_amount,
    'Compra de tokens: ' || v_order.pack_code,
    'payment_order',
    v_order.id
  );

  update public.payment_orders
  set status = 'paid',
      paid_at = now()
  where id = v_order.id;

  return v_order.id;
end;
$$;

create or replace function public.redeem_promotion_coupon(
  p_locatario_id uuid,
  p_qr_token text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coupon public.coupons%rowtype;
  v_campaign public.promotion_campaigns%rowtype;
  v_status text;
begin
  select *
    into v_coupon
  from public.coupons
  where qr_token = p_qr_token
  for update;

  if v_coupon.id is null then
    raise exception 'coupon_not_found';
  end if;

  select *
    into v_campaign
  from public.promotion_campaigns
  where id = v_coupon.campaign_id;

  if v_campaign.id is null or v_campaign.locatario_id <> p_locatario_id then
    raise exception 'coupon_not_allowed';
  end if;

  v_status :=
    case
      when v_coupon.status = 'redeemed' then 'consumed'
      when v_coupon.status = 'cancelled' then 'cancelled'
      when v_coupon.status = 'expired' or v_coupon.expires_at < now() then 'expired'
      when v_campaign.status <> 'active' then 'invalid'
      else 'valid'
    end;

  insert into public.qr_validations (
    coupon_id,
    locatario_id,
    status
  )
  values (
    v_coupon.id,
    p_locatario_id,
    v_status
  );

  if v_status <> 'valid' then
    return null;
  end if;

  update public.coupons
  set status = 'redeemed',
      redeemed_at = now()
  where id = v_coupon.id
  returning * into v_coupon;

  return v_coupon.id;
end;
$$;
