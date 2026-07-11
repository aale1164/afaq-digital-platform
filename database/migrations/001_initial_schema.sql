-- منصة آفاق الرقمية - المخطط الأولي
-- نفّذ هذا الملف مرة واحدة داخل Supabase SQL Editor.

begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (name in ('OWNER','ADMIN','SUPPORT','USER','DEVELOPER')),
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  description text,
  is_active boolean not null default true,
  is_public boolean not null default true,
  daily_limit integer check (daily_limit is null or daily_limit >= 0),
  monthly_limit integer check (monthly_limit is null or monthly_limit >= 0),
  included_credits integer not null default 0 check (included_credits >= 0),
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.roles (name, description) values
  ('OWNER','مالك المنصة بصلاحيات محمية'),
  ('ADMIN','مدير المنصة'),
  ('SUPPORT','فريق الدعم'),
  ('USER','مستخدم عادي'),
  ('DEVELOPER','مستخدم مركز المطورين')
on conflict (name) do nothing;

insert into public.plans (slug,name,description,is_active,is_public,daily_limit,monthly_limit,included_credits,sort_order) values
  ('free','المجانية','الباقة الافتراضية عند إنشاء الحساب',true,true,null,100,0,1),
  ('trial','التجريبية','فترة تجربة قابلة للتعديل',true,false,null,250,50,2),
  ('professional','الاحترافية','جاهزة للتسعير مستقبلًا',false,false,null,null,500,3),
  ('team','الفرق','للشركات والفرق مستقبلًا',false,false,null,null,2000,4)
on conflict (slug) do nothing;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default 'مستخدم آفاق',
  avatar_url text,
  email_confirmed boolean not null default false,
  blocked boolean not null default false,
  plan_id uuid references public.plans(id) on delete set null,
  usage_reset_at timestamptz,
  last_seen_at timestamptz,
  last_login_at timestamptz,
  locale text not null default 'ar-SA',
  timezone text not null default 'Asia/Riyadh',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete restrict,
  assigned_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete restrict,
  status text not null default 'active' check (status in ('trialing','active','paused','canceled','expired')),
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  trial_ends_at timestamptz,
  canceled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tool_registry (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name_ar text not null,
  name_en text not null,
  description text not null default '',
  category text not null,
  icon text not null,
  status text not null default 'coming-soon' check (status in ('active','external','coming-soon','maintenance')),
  access_level text not null default 'public' check (access_level in ('public','member','premium')),
  anonymous_limit integer not null default 3 check (anonymous_limit >= 0),
  member_limit integer check (member_limit is null or member_limit >= 0),
  credit_cost integer not null default 0 check (credit_cost >= 0),
  featured boolean not null default false,
  maintenance_mode boolean not null default false,
  sort_order integer not null default 0,
  configuration jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.usage_limits (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.plans(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  tool_slug text references public.tool_registry(slug) on delete cascade,
  period text not null default 'month' check (period in ('day','week','month','lifetime')),
  max_runs integer not null check (max_runs >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  check (plan_id is not null or user_id is not null)
);

create table if not exists public.tool_usage (
  id uuid primary key default gen_random_uuid(),
  operation_id uuid not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  visitor_hash text,
  tool_slug text not null references public.tool_registry(slug) on delete restrict,
  status text not null check (status in ('succeeded','failed')),
  credits_charged integer not null default 0 check (credits_charged >= 0),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  error_code text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (user_id is not null or visitor_hash is not null)
);

create index if not exists tool_usage_user_month_idx on public.tool_usage(user_id, tool_slug, created_at desc);
create index if not exists tool_usage_visitor_idx on public.tool_usage(visitor_hash, created_at desc);
create index if not exists tool_usage_created_idx on public.tool_usage(created_at desc);

create table if not exists public.anonymous_usage (
  visitor_hash text primary key,
  ip_hash text not null,
  total_runs integer not null default 0 check (total_runs >= 0),
  last_tool_slug text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists anonymous_usage_ip_idx on public.anonymous_usage(ip_hash);

create table if not exists public.credits (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance bigint not null default 0 check (balance >= 0),
  lifetime_granted bigint not null default 0 check (lifetime_granted >= 0),
  lifetime_spent bigint not null default 0 check (lifetime_spent >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount bigint not null check (amount <> 0),
  reason text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  balance_after bigint not null check (balance_after >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);
create index if not exists admin_audit_created_idx on public.admin_audit_logs(created_at desc);

create table if not exists public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_hash text not null unique,
  user_agent_summary text,
  ip_hash text,
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  description text,
  is_public boolean not null default false,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  rollout_percentage integer not null default 0 check (rollout_percentage between 0 and 100),
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  kind text not null default 'info',
  read_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new','open','resolved','spam')),
  assigned_to uuid references public.profiles(id) on delete set null,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stored_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  original_name text,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  purpose text not null,
  expires_at timestamptz not null,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.developer_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  display_name text,
  organization text,
  website_url text,
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  key_prefix text not null,
  key_hash text not null unique,
  last_four text not null,
  request_limit integer not null default 1000 check (request_limit >= 0),
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.api_usage (
  id bigserial primary key,
  api_key_id uuid not null references public.api_keys(id) on delete cascade,
  tool_slug text references public.tool_registry(slug) on delete set null,
  status_code integer not null,
  duration_ms integer,
  request_hash text,
  created_at timestamptz not null default now()
);
create index if not exists api_usage_key_created_idx on public.api_usage(api_key_id, created_at desc);

-- المتجر: موجود معماريًا ومخفي ما دام Feature Flag معطلًا.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  status text not null default 'draft' check (status in ('draft','active','archived')),
  price_minor bigint check (price_minor is null or price_minor >= 0),
  currency text not null default 'SAR',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value bigint not null check (discount_value > 0),
  max_redemptions integer,
  redeemed_count integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded','canceled')),
  subtotal_minor bigint not null default 0,
  discount_minor bigint not null default 0,
  total_minor bigint not null default 0,
  currency text not null default 'SAR',
  coupon_id uuid references public.coupons(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  unit_price_minor bigint not null check (unit_price_minor >= 0),
  total_minor bigint not null check (total_minor >= 0)
);

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  provider text,
  provider_reference_hash text,
  status text not null default 'pending' check (status in ('pending','authorized','captured','failed','refunded')),
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null default 'SAR',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete restrict,
  invoice_number text not null unique,
  status text not null default 'draft' check (status in ('draft','issued','void')),
  issued_at timestamptz,
  file_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.account_deletion_requests (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','rejected','completed')),
  requested_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  notes text
);

insert into public.site_settings (key,value,description,is_public) values
  ('x_url', to_jsonb('https://x.com/aale1164?s=20'::text), 'رابط حساب عدناني على X', true),
  ('anonymous_free_runs', '3'::jsonb, 'عدد العمليات المجانية للزائر', false)
on conflict (key) do nothing;

insert into public.feature_flags (key,enabled,description,rollout_percentage) values
  ('MARKETPLACE_ENABLED',false,'إظهار المتجر ومساراته',0),
  ('DEVELOPER_API_ENABLED',false,'تفعيل API ومركز المطورين',0)
on conflict (key) do nothing;

insert into public.tool_registry (slug,name_ar,name_en,description,category,icon,status,access_level,anonymous_limit,member_limit,credit_cost,featured,sort_order) values
  ('photo-editor','محرر الصور الاحترافي','Photo Editor V3','محرر صور عربي داخل المتصفح','الصور','image','active','public',3,null,1,true,1),
  ('background-remover','إزالة خلفية الصور','Background Remover','إزالة عبر مزود خارجي آمن','الصور','wand','external','public',3,25,2,true,2),
  ('batch-images','معمل الصور الدُفعي','Batch Image Lab','ضغط وتغيير صيغة ومقاس عدة صور','الصور','layers','active','public',3,null,1,true,3),
  ('watermark','العلامة المائية الجماعية','Bulk Watermark','إضافة نص أو شعار لعدة صور','الصور','stamp','active','public',3,null,1,false,4),
  ('qr-studio','استوديو QR','QR Studio','إنشاء QR متعدد الأنواع','الأعمال','qr','active','public',3,null,1,true,5),
  ('developer-lab','مختبر المطور','Developer Lab','أدوات يومية للمطور','المطورون','code','active','public',3,null,1,true,6),
  ('pdf-studio','استوديو PDF','PDF Studio','أدوات PDF مستقبلية','المستندات','file','coming-soon','member',0,10,2,false,20),
  ('arabic-ocr','استخراج النص العربي','Arabic OCR','OCR عربي مستقبلي','المستندات','languages','coming-soon','member',0,10,2,false,21),
  ('document-scanner','ماسح المستندات','Document Scanner','تحسين المستندات مستقبلًا','المستندات','scan','coming-soon','public',3,null,1,false,22),
  ('image-forensics','فحص سلامة الصور','Image Integrity','مؤشرات أولية لفحص الصور','الصور','shield','coming-soon','member',0,5,3,false,23),
  ('student-tools','أدوات الطلاب','Student Tools','مجموعة أدوات دراسية مستقبلية','الطلاب','graduation','coming-soon','member',0,null,1,false,30),
  ('business-tools','أدوات الشركات','Business Tools','أدوات للشركات مستقبلًا','الأعمال','building','coming-soon','premium',0,100,3,false,31)
on conflict (slug) do update set
  name_ar=excluded.name_ar, name_en=excluded.name_en, description=excluded.description,
  category=excluded.category, icon=excluded.icon, sort_order=excluded.sort_order;

-- دوال الصلاحيات. SECURITY DEFINER تمنع الدوران في RLS.
create or replace function public.has_role(required_role text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid() and r.name = required_role
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role('OWNER') or public.has_role('ADMIN');
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or public.has_role('SUPPORT');
$$;

-- إنشاء الملف والدور الافتراضي تلقائيًا بعد التسجيل.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_plan_id uuid;
  v_role_id uuid;
begin
  select id into v_plan_id from public.plans where slug = 'free';
  select id into v_role_id from public.roles where name = 'USER';
  insert into public.profiles (id,email,full_name,email_confirmed,plan_id)
  values (new.id,coalesce(new.email,''),coalesce(nullif(new.raw_user_meta_data->>'full_name',''),'مستخدم آفاق'),new.email_confirmed_at is not null,v_plan_id)
  on conflict (id) do nothing;
  insert into public.user_roles(user_id,role_id) values(new.id,v_role_id) on conflict do nothing;
  insert into public.credits(user_id) values(new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.sync_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set
    email = coalesce(new.email,email),
    email_confirmed = new.email_confirmed_at is not null,
    last_login_at = coalesce(new.last_sign_in_at,last_login_at),
    updated_at = now()
  where id = new.id;
  return new;
end;
$$;
drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated after update of email,email_confirmed_at,last_sign_in_at on auth.users for each row execute procedure public.sync_auth_user();

-- OWNER لا يمكن حذفه أو تخفيض دوره حتى باستخدام Service Role دون إزالة Trigger صراحة.
create or replace function public.protect_owner_role()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_name text;
begin
  select name into v_name from public.roles where id = old.role_id;
  if v_name = 'OWNER' then raise exception 'OWNER role is protected'; end if;
  return old;
end;
$$;
drop trigger if exists protect_owner_role_delete on public.user_roles;
create trigger protect_owner_role_delete before delete on public.user_roles for each row execute procedure public.protect_owner_role();
drop trigger if exists protect_owner_role_update on public.user_roles;
create trigger protect_owner_role_update before update of role_id,user_id on public.user_roles for each row execute procedure public.protect_owner_role();

create or replace function public.protect_owner_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists(select 1 from public.user_roles ur join public.roles r on r.id=ur.role_id where ur.user_id=old.id and r.name='OWNER') then
    raise exception 'OWNER profile is protected';
  end if;
  return old;
end;
$$;
drop trigger if exists protect_owner_profile_delete on public.profiles;
create trigger protect_owner_profile_delete before delete on public.profiles for each row execute procedure public.protect_owner_profile();

-- خصم استخدام الزائر ذريًا وبعد نجاح الأداة فقط.
create or replace function public.consume_anonymous_tool_usage(
  p_visitor_hash text, p_ip_hash text, p_tool_slug text, p_operation_id uuid, p_limit integer
)
returns table(success boolean, remaining integer, idempotent boolean)
language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  if exists(select 1 from public.tool_usage where operation_id=p_operation_id and visitor_hash=p_visitor_hash) then
    select total_runs into v_count from public.anonymous_usage where visitor_hash=p_visitor_hash;
    return query select true, greatest(0,p_limit-coalesce(v_count,0)), true;
    return;
  end if;
  insert into public.anonymous_usage(visitor_hash,ip_hash,total_runs,last_seen_at)
  values(p_visitor_hash,p_ip_hash,0,now()) on conflict(visitor_hash) do nothing;
  select total_runs into v_count from public.anonymous_usage where visitor_hash=p_visitor_hash for update;
  if v_count >= p_limit then return query select false,0,false; return; end if;
  update public.anonymous_usage set total_runs=total_runs+1,ip_hash=p_ip_hash,last_tool_slug=p_tool_slug,last_seen_at=now() where visitor_hash=p_visitor_hash;
  insert into public.tool_usage(operation_id,visitor_hash,tool_slug,status) values(p_operation_id,p_visitor_hash,p_tool_slug,'succeeded');
  return query select true,greatest(0,p_limit-v_count-1),false;
end;
$$;

-- خصم استخدام العضو ذريًا مع احترام نقطة التصفير وبداية الشهر.
create or replace function public.consume_user_tool_usage(
  p_user_id uuid, p_tool_slug text, p_operation_id uuid, p_limit integer
)
returns table(success boolean, remaining integer, idempotent boolean)
language plpgsql security definer set search_path = public as $$
declare v_count integer; v_start timestamptz;
begin
  select greatest(date_trunc('month',now()),coalesce(usage_reset_at,'epoch'::timestamptz)) into v_start from public.profiles where id=p_user_id for update;
  if v_start is null then return query select false,0,false; return; end if;
  select count(*)::integer into v_count from public.tool_usage where user_id=p_user_id and tool_slug=p_tool_slug and status='succeeded' and created_at>=v_start;
  if exists(select 1 from public.tool_usage where operation_id=p_operation_id and user_id=p_user_id) then
    return query select true,greatest(0,p_limit-v_count),true; return;
  end if;
  if v_count >= p_limit then return query select false,0,false; return; end if;
  insert into public.tool_usage(operation_id,user_id,tool_slug,status) values(p_operation_id,p_user_id,p_tool_slug,'succeeded');
  return query select true,greatest(0,p_limit-v_count-1),false;
end;
$$;

create or replace function public.grant_user_credits(p_user_id uuid,p_amount integer,p_reason text,p_actor_id uuid)
returns bigint language plpgsql security definer set search_path = public as $$
declare v_balance bigint;
begin
  if p_amount <= 0 then raise exception 'amount must be positive'; end if;
  insert into public.credits(user_id,balance,lifetime_granted) values(p_user_id,p_amount,p_amount)
  on conflict(user_id) do update set balance=public.credits.balance+p_amount,lifetime_granted=public.credits.lifetime_granted+p_amount,updated_at=now()
  returning balance into v_balance;
  insert into public.credit_transactions(user_id,amount,reason,actor_id,balance_after) values(p_user_id,p_amount,p_reason,p_actor_id,v_balance);
  return v_balance;
end;
$$;

-- تحديث updated_at
do $$
declare t text;
begin
  foreach t in array array['plans','subscriptions','tool_registry','support_messages','developer_profiles','products','orders'] loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I',t,t);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute procedure public.set_updated_at()',t,t);
  end loop;
end $$;

-- RLS
alter table public.roles enable row level security;
alter table public.plans enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.tool_registry enable row level security;
alter table public.usage_limits enable row level security;
alter table public.tool_usage enable row level security;
alter table public.anonymous_usage enable row level security;
alter table public.credits enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.user_sessions enable row level security;
alter table public.site_settings enable row level security;
alter table public.feature_flags enable row level security;
alter table public.notifications enable row level security;
alter table public.support_messages enable row level security;
alter table public.stored_files enable row level security;
alter table public.developer_profiles enable row level security;
alter table public.api_keys enable row level security;
alter table public.api_usage enable row level security;
alter table public.products enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.invoices enable row level security;
alter table public.account_deletion_requests enable row level security;

create policy roles_read on public.roles for select to authenticated using (true);
create policy plans_public_read on public.plans for select using ((is_active and is_public) or public.is_admin());
create policy profiles_self_read on public.profiles for select to authenticated using (id=auth.uid() or public.is_staff());
create policy profiles_self_update on public.profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid());
create policy user_roles_self_read on public.user_roles for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy subscriptions_self_read on public.subscriptions for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy tool_registry_read on public.tool_registry for select using ((status in ('active','external','coming-soon') and not maintenance_mode) or public.is_staff());
create policy usage_limits_self_read on public.usage_limits for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy tool_usage_self_read on public.tool_usage for select to authenticated using (user_id=auth.uid() or public.is_staff());
create policy credits_self_read on public.credits for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy credit_transactions_self_read on public.credit_transactions for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy audit_admin_read on public.admin_audit_logs for select to authenticated using (public.is_admin());
create policy sessions_self_read on public.user_sessions for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy settings_public_read on public.site_settings for select using (is_public or public.is_admin());
create policy flags_admin_read on public.feature_flags for select to authenticated using (public.is_admin());
create policy notifications_self_read on public.notifications for select to authenticated using (user_id=auth.uid() or public.is_staff());
create policy notifications_self_update on public.notifications for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy support_self_read on public.support_messages for select to authenticated using (user_id=auth.uid() or public.is_staff());
create policy stored_files_self on public.stored_files for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy developer_profiles_read on public.developer_profiles for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy developer_profiles_self_update on public.developer_profiles for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy api_keys_self_read on public.api_keys for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy api_usage_self_read on public.api_usage for select to authenticated using (exists(select 1 from public.api_keys k where k.id=api_key_id and (k.user_id=auth.uid() or public.is_admin())));
create policy products_public_read on public.products for select using ((status='active' and (select enabled from public.feature_flags where key='MARKETPLACE_ENABLED')) or public.is_admin());
create policy orders_self_read on public.orders for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy order_items_self_read on public.order_items for select to authenticated using (exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin())));
create policy payments_self_read on public.payment_transactions for select to authenticated using (exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin())));
create policy invoices_self_read on public.invoices for select to authenticated using (exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin())));
create policy deletion_self_read on public.account_deletion_requests for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy deletion_self_insert on public.account_deletion_requests for insert to authenticated with check (user_id=auth.uid());
create policy deletion_self_update on public.account_deletion_requests for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

-- تقييد تحديث المستخدم لحقول الملف الحساسة.
revoke update on public.profiles from authenticated;
grant update(full_name,avatar_url,locale,timezone,updated_at) on public.profiles to authenticated;

-- دوال الخصم والمنح لا تُستدعى من المتصفح.
revoke all on function public.consume_anonymous_tool_usage(text,text,text,uuid,integer) from public,anon,authenticated;
revoke all on function public.consume_user_tool_usage(uuid,text,uuid,integer) from public,anon,authenticated;
revoke all on function public.grant_user_credits(uuid,integer,text,uuid) from public,anon,authenticated;
grant execute on function public.consume_anonymous_tool_usage(text,text,text,uuid,integer) to service_role;
grant execute on function public.consume_user_tool_usage(uuid,text,uuid,integer) to service_role;
grant execute on function public.grant_user_credits(uuid,integer,text,uuid) to service_role;

commit;
