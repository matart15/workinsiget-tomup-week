-- ===============================
-- 1. PUBLIC.PROFILE
-- ===============================
create table public.profile (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null,
  partner_id uuid references public.profile(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- ===============================
-- 2. MASTER: m_problem
-- ===============================
create table public.m_problem (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  description text,
  created_at timestamp with time zone default now()
);

-- ===============================
-- 3. CHECK-IN FLOW
-- ===============================

-- Daily Check-in
create table public.c_daily_checkin (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profile(id) on delete cascade,
  checkin_date date not null default current_date,
  mood text,
  note text,
  created_at timestamp with time zone default now()
);

-- Problem Check (linked to m_problem)
create table public.c_problem_check (
  id uuid primary key default gen_random_uuid(),
  checkin_id uuid references public.c_daily_checkin(id) on delete cascade,
  problem_id uuid references public.m_problem(id) on delete set null,
  custom_text text,
  created_at timestamp with time zone default now()
);

-- ===============================
-- CONVERSATION FLOW
-- ===============================

-- Conversation
create table public.c_conversation (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profile(id) on delete cascade,
  type text, -- e.g., checkin, followup
  started_at timestamp with time zone default now()
);

-- Message (from mom, dad, or system)
create table public.c_message (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.c_conversation(id) on delete cascade,
  sender_id uuid references public.profile(id) on delete set null,
  sender_type text not null, -- e.g., mom, dad, system
  message text,
  is_ai_generated boolean default false,
  sent_at timestamp with time zone default now()
);

-- Suggestion
create table public.c_suggestion (
  id uuid primary key default gen_random_uuid(),
  to_user_id uuid references public.profile(id) on delete cascade,
  from_conversation_id uuid references public.c_conversation(id) on delete set null,
  suggestion text,
  created_at timestamp with time zone default now()
);

-- Summary
create table public.c_summary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profile(id) on delete cascade,
  type text not null, -- weekly, monthly, etc.
  summary text,
  created_at timestamp with time zone default now()
);

-- ===============================
-- ADMIN: a_prompt
-- ===============================
create table public.a_prompt (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  content text not null,
  description text,
  created_at timestamp with time zone default now()
);

-- ===============================
-- TRIGGERS TO SYNC AUTH.USERS → PROFILE
-- ===============================

-- Trigger function to insert into profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profile (id, role)
  values (new.id, coalesce(new.raw_app_meta_data->>'role', 'user'));
  return new;
end;
$$ language plpgsql security definer;

-- Attach trigger to auth.users
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ===============================
-- RLS ENABLE & POLICIES
-- ===============================

-- Enable RLS on all tables
alter table public.profile enable row level security;
alter table public.m_problem enable row level security;
alter table public.c_daily_checkin enable row level security;
alter table public.c_problem_check enable row level security;
alter table public.c_conversation enable row level security;
alter table public.c_message enable row level security;
alter table public.c_suggestion enable row level security;
alter table public.c_summary enable row level security;
alter table public.a_prompt enable row level security;

-- Basic user-level access policies

-- profile: users can select/update their own profile
create policy "Users can manage own profile"
on public.profile
for all
using (auth.uid() = id);

-- check-in: only owner can access
create policy "User can access their check-ins"
on public.c_daily_checkin
for all
using (auth.uid() = user_id);

-- problem_check: based on check-in ownership
create policy "User can access own problem checks"
on public.c_problem_check
for all
using (
  checkin_id in (
    select id from public.c_daily_checkin where user_id = auth.uid()
  )
);

-- conversation
create policy "User can access own conversations"
on public.c_conversation
for all
using (auth.uid() = user_id);

-- message: based on conversation ownership
create policy "User can access messages in own conversations"
on public.c_message
for all
using (
  conversation_id in (
    select id from public.c_conversation where user_id = auth.uid()
  )
);

-- suggestion: if it's sent to the user
create policy "User can access their suggestions"
on public.c_suggestion
for all
using (auth.uid() = to_user_id);

-- summary
create policy "User can access their summaries"
on public.c_summary
for all
using (auth.uid() = user_id);

-- prompts: only admin can access
create policy "Only admin can read/write prompts"
on public.a_prompt
for all
using (
  exists (
    select 1 from public.profile
    where id = auth.uid() and role = 'admin'
  )
);
