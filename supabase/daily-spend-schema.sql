-- Daily Spend database setup
-- Run this once in the Supabase SQL editor for the project used by this site.

create extension if not exists pgcrypto;

create table if not exists public.daily_spend_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  currency text not null default 'NGN' check (currency in ('NGN', 'USD', 'GBP', 'EUR', 'CAD')),
  monthly_budget numeric(14, 2) check (monthly_budget is null or monthly_budget >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_spend_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  amount numeric(14, 2) not null check (amount > 0),
  category text not null check (
    category in (
      'Food & groceries',
      'Transport',
      'Bills & utilities',
      'Shopping',
      'Health',
      'Giving',
      'Education',
      'Home',
      'Entertainment',
      'Other'
    )
  ),
  expense_date date not null default current_date,
  payment_method text not null default 'Cash' check (
    payment_method in ('Cash', 'Card', 'Bank transfer', 'Other')
  ),
  note text not null default '' check (char_length(note) <= 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists daily_spend_expenses_user_date_idx
  on public.daily_spend_expenses (user_id, expense_date desc, created_at desc);

create index if not exists daily_spend_expenses_user_category_idx
  on public.daily_spend_expenses (user_id, category);

alter table public.daily_spend_profiles enable row level security;
alter table public.daily_spend_expenses enable row level security;

drop policy if exists "Users can read their Daily Spend profile" on public.daily_spend_profiles;
create policy "Users can read their Daily Spend profile"
  on public.daily_spend_profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can create their Daily Spend profile" on public.daily_spend_profiles;
create policy "Users can create their Daily Spend profile"
  on public.daily_spend_profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their Daily Spend profile" on public.daily_spend_profiles;
create policy "Users can update their Daily Spend profile"
  on public.daily_spend_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can read their Daily Spend expenses" on public.daily_spend_expenses;
create policy "Users can read their Daily Spend expenses"
  on public.daily_spend_expenses for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their Daily Spend expenses" on public.daily_spend_expenses;
create policy "Users can create their Daily Spend expenses"
  on public.daily_spend_expenses for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their Daily Spend expenses" on public.daily_spend_expenses;
create policy "Users can update their Daily Spend expenses"
  on public.daily_spend_expenses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their Daily Spend expenses" on public.daily_spend_expenses;
create policy "Users can delete their Daily Spend expenses"
  on public.daily_spend_expenses for delete
  using (auth.uid() = user_id);

create or replace function public.daily_spend_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists daily_spend_profiles_set_updated_at on public.daily_spend_profiles;
create trigger daily_spend_profiles_set_updated_at
  before update on public.daily_spend_profiles
  for each row execute function public.daily_spend_set_updated_at();

drop trigger if exists daily_spend_expenses_set_updated_at on public.daily_spend_expenses;
create trigger daily_spend_expenses_set_updated_at
  before update on public.daily_spend_expenses
  for each row execute function public.daily_spend_set_updated_at();

create or replace function public.daily_spend_create_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.daily_spend_profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_daily_spend_profile on auth.users;
create trigger create_daily_spend_profile
  after insert on auth.users
  for each row execute function public.daily_spend_create_profile();

insert into public.daily_spend_profiles (id, full_name)
select id, coalesce(raw_user_meta_data ->> 'full_name', '')
from auth.users
on conflict (id) do nothing;
