-- Vision Production: independent Supabase/Postgres schema.
-- This migration creates schema only. It does not import MySQL data or touch any
-- existing Supabase project.

create extension if not exists pgcrypto;
create schema if not exists private;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_key text not null unique,
  public_url text,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  kind text not null default 'image' check (kind in ('image', 'video', 'document', 'other')),
  alt_ar text,
  alt_en text,
  is_public boolean not null default false,
  created_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_ar text not null,
  title_en text not null,
  description_ar text,
  description_en text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.portfolio_categories(id) on delete set null,
  slug text not null unique,
  title_ar text not null,
  title_en text not null,
  summary_ar text,
  summary_en text,
  description_ar text,
  description_en text,
  client_name text,
  project_date text,
  cover_media_id uuid references public.media_assets(id) on delete set null,
  media_ids jsonb not null default '[]'::jsonb,
  content_ar jsonb,
  content_en jsonb,
  seo_title_ar text,
  seo_title_en text,
  seo_description_ar text,
  seo_description_en text,
  seo_keywords text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_ar text not null,
  title_en text not null,
  summary_ar text,
  summary_en text,
  description_ar text,
  description_en text,
  icon text,
  cover_media_id uuid references public.media_assets(id) on delete set null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title_ar text not null,
  title_en text not null,
  description_ar text,
  description_en text,
  achievement_date text,
  media_id uuid references public.media_assets(id) on delete set null,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text not null,
  logo_media_id uuid references public.media_assets(id) on delete set null,
  website_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text not null,
  logo_media_id uuid references public.media_assets(id) on delete set null,
  website_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_role_ar text,
  author_role_en text,
  quote_ar text not null,
  quote_en text not null,
  avatar_media_id uuid references public.media_assets(id) on delete set null,
  source_url text,
  is_verified boolean not null default false,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question_ar text not null,
  question_en text not null,
  answer_ar text not null,
  answer_en text not null,
  category text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  template text not null default 'custom',
  title_ar text not null,
  title_en text not null,
  hero_title_ar text,
  hero_title_en text,
  hero_text_ar text,
  hero_text_en text,
  content_ar jsonb,
  content_en jsonb,
  hero_media_id uuid references public.media_assets(id) on delete set null,
  seo_title_ar text,
  seo_title_en text,
  seo_description_ar text,
  seo_description_en text,
  seo_keywords text,
  show_in_navigation boolean not null default false,
  navigation_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  company text,
  service_id uuid references public.services(id) on delete set null,
  project_type text,
  requested_date text,
  budget_range text,
  message text,
  preferred_language text not null default 'ar' check (preferred_language in ('ar', 'en')),
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'closed')),
  whatsapp_opened_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  subject text,
  message text not null,
  preferred_language text not null default 'ar' check (preferred_language in ('ar', 'en')),
  status text not null default 'new' check (status in ('new', 'read', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.instagram_sync_configs (
  id uuid primary key default gen_random_uuid(),
  facebook_page_id text not null unique,
  instagram_account_id text,
  instagram_username text,
  cron_expression text not null default '0 0 */6 * * *',
  is_schedule_enabled boolean not null default false,
  last_synced_at timestamptz,
  last_sync_status text,
  last_sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.instagram_videos (
  id uuid primary key default gen_random_uuid(),
  sync_config_id uuid not null references public.instagram_sync_configs(id) on delete cascade,
  source_media_id text not null unique,
  shortcode text,
  permalink text not null,
  caption text,
  thumbnail_url text,
  media_type text,
  media_product_type text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  source_published_at timestamptz,
  approved_by uuid references public.user_profiles(id) on delete set null,
  approved_at timestamptz,
  first_synced_at timestamptz not null default now(),
  last_synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  is_public boolean not null default true,
  updated_by uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists media_assets_public_idx on public.media_assets(is_public, kind);
create index if not exists categories_public_idx on public.portfolio_categories(is_active, sort_order);
create index if not exists projects_public_idx on public.projects(status, is_featured, published_at desc);
create index if not exists projects_category_idx on public.projects(category_id);
create index if not exists services_public_idx on public.services(is_active, sort_order);
create index if not exists achievements_public_idx on public.achievements(is_published, sort_order);
create index if not exists clients_public_idx on public.clients(is_active, sort_order);
create index if not exists partners_public_idx on public.partners(is_active, sort_order);
create index if not exists testimonials_public_idx on public.testimonials(is_published, is_verified, sort_order);
create index if not exists faqs_public_idx on public.faqs(is_published, sort_order);
create index if not exists pages_public_idx on public.pages(status, show_in_navigation, navigation_order);
create index if not exists bookings_status_idx on public.bookings(status, created_at desc);
create index if not exists contacts_status_idx on public.contact_requests(status, created_at desc);
create index if not exists instagram_videos_public_idx on public.instagram_videos(status, source_published_at desc);
create index if not exists instagram_videos_config_idx on public.instagram_videos(sync_config_id, status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(excluded.display_name, public.user_profiles.display_name);
  return new;
end;
$$;

create or replace function public.create_booking(
  p_name text,
  p_phone text,
  p_company text default null,
  p_service_id uuid default null,
  p_project_type text default null,
  p_requested_date text default null,
  p_budget_range text default null,
  p_message text default null,
  p_preferred_language text default 'ar'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_booking_id uuid;
begin
  if coalesce(length(trim(p_name)), 0) < 2 then
    raise exception 'name is required';
  end if;
  if coalesce(length(trim(p_phone)), 0) < 5 then
    raise exception 'phone is required';
  end if;
  if p_preferred_language not in ('ar', 'en') then
    raise exception 'invalid preferred language';
  end if;
  insert into public.bookings (
    name, phone, company, service_id, project_type, requested_date,
    budget_range, message, preferred_language
  ) values (
    trim(p_name), trim(p_phone), nullif(trim(p_company), ''), p_service_id,
    nullif(trim(p_project_type), ''), nullif(trim(p_requested_date), ''),
    nullif(trim(p_budget_range), ''), nullif(trim(p_message), ''), p_preferred_language
  ) returning id into new_booking_id;
  return new_booking_id;
end;
$$;

create or replace function public.create_contact_request(
  p_name text,
  p_message text,
  p_phone text default null,
  p_email text default null,
  p_subject text default null,
  p_preferred_language text default 'ar'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_request_id uuid;
begin
  if coalesce(length(trim(p_name)), 0) < 2 then
    raise exception 'name is required';
  end if;
  if coalesce(length(trim(p_message)), 0) < 3 then
    raise exception 'message is required';
  end if;
  if p_preferred_language not in ('ar', 'en') then
    raise exception 'invalid preferred language';
  end if;
  insert into public.contact_requests (
    name, phone, email, subject, message, preferred_language
  ) values (
    trim(p_name), nullif(trim(p_phone), ''), nullif(trim(p_email), ''),
    nullif(trim(p_subject), ''), trim(p_message), p_preferred_language
  ) returning id into new_request_id;
  return new_request_id;
end;
$$;

grant execute on function public.create_booking(text, text, text, uuid, text, text, text, text, text) to anon, authenticated;
grant execute on function public.create_contact_request(text, text, text, text, text, text) to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.media_assets, public.portfolio_categories, public.projects,
  public.services, public.achievements, public.clients, public.partners,
  public.testimonials, public.faqs, public.pages, public.instagram_videos,
  public.site_settings to anon;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vision-media',
  'vision-media',
  false,
  524288000,
  array[
    'video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png',
    'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf'
  ]::text[]
)
on conflict (id) do nothing;

drop policy if exists vision_media_read on storage.objects;
create policy vision_media_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'vision-media');
drop policy if exists vision_media_admin_write on storage.objects;
create policy vision_media_admin_write on storage.objects
  for insert to authenticated with check (
    bucket_id = 'vision-media' and (select private.is_admin())
  );
drop policy if exists vision_media_admin_update on storage.objects;
create policy vision_media_admin_update on storage.objects
  for update to authenticated using (
    bucket_id = 'vision-media' and (select private.is_admin())
  ) with check (
    bucket_id = 'vision-media' and (select private.is_admin())
  );
drop policy if exists vision_media_admin_delete on storage.objects;
create policy vision_media_admin_delete on storage.objects
  for delete to authenticated using (
    bucket_id = 'vision-media' and (select private.is_admin())
  );

alter table public.user_profiles enable row level security;
alter table public.media_assets enable row level security;
alter table public.portfolio_categories enable row level security;
alter table public.projects enable row level security;
alter table public.services enable row level security;
alter table public.achievements enable row level security;
alter table public.clients enable row level security;
alter table public.partners enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.pages enable row level security;
alter table public.bookings enable row level security;
alter table public.contact_requests enable row level security;
alter table public.instagram_sync_configs enable row level security;
alter table public.instagram_videos enable row level security;
alter table public.site_settings enable row level security;

-- Admin policies are intentionally narrow: non-admin authenticated users receive no
-- content-management privileges even though they hold the authenticated role.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'media_assets', 'portfolio_categories', 'projects', 'services', 'achievements',
    'clients', 'partners', 'testimonials', 'faqs', 'pages', 'bookings',
    'contact_requests', 'instagram_sync_configs', 'instagram_videos', 'site_settings'
  ] loop
    execute format('drop policy if exists admin_manage_all on public.%I', table_name);
    execute format(
      'create policy admin_manage_all on public.%I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))',
      table_name
    );
  end loop;
end;
$$;

drop policy if exists profile_self_read on public.user_profiles;
create policy profile_self_read on public.user_profiles
  for select to authenticated using (id = (select auth.uid()) or (select private.is_admin()));
drop policy if exists profile_admin_manage on public.user_profiles;
create policy profile_admin_manage on public.user_profiles
  for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

drop trigger if exists create_profile_on_auth_user on auth.users;
create trigger create_profile_on_auth_user
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop policy if exists public_media_read on public.media_assets;
create policy public_media_read on public.media_assets
  for select to anon, authenticated using (is_public = true);
drop policy if exists public_categories_read on public.portfolio_categories;
create policy public_categories_read on public.portfolio_categories
  for select to anon, authenticated using (is_active = true);
drop policy if exists public_projects_read on public.projects;
create policy public_projects_read on public.projects
  for select to anon, authenticated using (status = 'published');
drop policy if exists public_services_read on public.services;
create policy public_services_read on public.services
  for select to anon, authenticated using (is_active = true);
drop policy if exists public_achievements_read on public.achievements;
create policy public_achievements_read on public.achievements
  for select to anon, authenticated using (is_published = true);
drop policy if exists public_clients_read on public.clients;
create policy public_clients_read on public.clients
  for select to anon, authenticated using (is_active = true);
drop policy if exists public_partners_read on public.partners;
create policy public_partners_read on public.partners
  for select to anon, authenticated using (is_active = true);
drop policy if exists public_testimonials_read on public.testimonials;
create policy public_testimonials_read on public.testimonials
  for select to anon, authenticated using (is_published = true and is_verified = true);
drop policy if exists public_faqs_read on public.faqs;
create policy public_faqs_read on public.faqs
  for select to anon, authenticated using (is_published = true);
drop policy if exists public_pages_read on public.pages;
create policy public_pages_read on public.pages
  for select to anon, authenticated using (status = 'published');
drop policy if exists public_instagram_videos_read on public.instagram_videos;
create policy public_instagram_videos_read on public.instagram_videos
  for select to anon, authenticated using (status = 'published');
drop policy if exists public_site_settings_read on public.site_settings;
create policy public_site_settings_read on public.site_settings
  for select to anon, authenticated using (is_public = true);

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at before update on public.user_profiles
  for each row execute function public.set_updated_at();
drop trigger if exists set_categories_updated_at on public.portfolio_categories;
create trigger set_categories_updated_at before update on public.portfolio_categories
  for each row execute function public.set_updated_at();
drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();
drop trigger if exists set_services_updated_at on public.services;
create trigger set_services_updated_at before update on public.services
  for each row execute function public.set_updated_at();
drop trigger if exists set_achievements_updated_at on public.achievements;
create trigger set_achievements_updated_at before update on public.achievements
  for each row execute function public.set_updated_at();
drop trigger if exists set_clients_updated_at on public.clients;
create trigger set_clients_updated_at before update on public.clients
  for each row execute function public.set_updated_at();
drop trigger if exists set_partners_updated_at on public.partners;
create trigger set_partners_updated_at before update on public.partners
  for each row execute function public.set_updated_at();
drop trigger if exists set_testimonials_updated_at on public.testimonials;
create trigger set_testimonials_updated_at before update on public.testimonials
  for each row execute function public.set_updated_at();
drop trigger if exists set_faqs_updated_at on public.faqs;
create trigger set_faqs_updated_at before update on public.faqs
  for each row execute function public.set_updated_at();
drop trigger if exists set_pages_updated_at on public.pages;
create trigger set_pages_updated_at before update on public.pages
  for each row execute function public.set_updated_at();
drop trigger if exists set_bookings_updated_at on public.bookings;
create trigger set_bookings_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();
drop trigger if exists set_contact_requests_updated_at on public.contact_requests;
create trigger set_contact_requests_updated_at before update on public.contact_requests
  for each row execute function public.set_updated_at();
drop trigger if exists set_instagram_sync_configs_updated_at on public.instagram_sync_configs;
create trigger set_instagram_sync_configs_updated_at before update on public.instagram_sync_configs
  for each row execute function public.set_updated_at();
drop trigger if exists set_instagram_videos_updated_at on public.instagram_videos;
create trigger set_instagram_videos_updated_at before update on public.instagram_videos
  for each row execute function public.set_updated_at();
drop trigger if exists set_site_settings_updated_at on public.site_settings;
create trigger set_site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();
