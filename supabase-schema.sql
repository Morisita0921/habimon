-- =============================================
-- ハビもん Supabase スキーマ
-- Supabase の SQL Editor で実行してください
-- =============================================

-- プロフィールテーブル（auth.users と紐付け）
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  character_name text default 'もこたん',
  selected_character_id text,
  level integer default 1,
  exp integer default 0,
  exp_to_next integer default 100,
  streak integer default 0,
  total_check_ins integer default 0,
  badges text[] default '{}',
  akashi_coins integer default 0,
  owned_cosmetics text[] default '{}',
  equipped_cosmetics text[] default '{}',
  is_admin boolean default false,
  facility_name text default 'メタゲーム明石',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- チェックイン履歴テーブル
create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  mood integer check (mood between 1 and 5) not null,
  checked_in boolean default true,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- コイン履歴テーブル
create table public.coin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  date text not null,
  type text check (type in ('earn', 'spend')) not null,
  amount integer not null,
  reason text,
  created_at timestamptz default now()
);

-- 交換申請テーブル
create table public.exchange_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  item_name text not null,
  cost integer not null,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at text not null,
  processed_at text,
  created_at timestamptz default now()
);

-- =============================================
-- RLS（行レベルセキュリティ）の設定
-- =============================================

alter table public.profiles enable row level security;
alter table public.check_ins enable row level security;
alter table public.coin_transactions enable row level security;
alter table public.exchange_requests enable row level security;

-- profiles: 自分のデータは読み書き可、管理者は全員分読める
create policy "自分のプロフィールを参照" on public.profiles
  for select using (auth.uid() = id);

create policy "自分のプロフィールを更新" on public.profiles
  for update using (auth.uid() = id);

create policy "管理者は全プロフィールを参照" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- check_ins: 自分のデータは読み書き可、管理者は全員分読める
create policy "自分のチェックインを参照" on public.check_ins
  for select using (auth.uid() = user_id);

create policy "自分のチェックインを追加" on public.check_ins
  for insert with check (auth.uid() = user_id);

create policy "管理者は全チェックインを参照" on public.check_ins
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- coin_transactions: 自分のデータは読み書き可
create policy "自分のコイン履歴を参照" on public.coin_transactions
  for select using (auth.uid() = user_id);

create policy "自分のコイン履歴を追加" on public.coin_transactions
  for insert with check (auth.uid() = user_id);

create policy "管理者はコイン履歴を追加" on public.coin_transactions
  for insert with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "管理者は全コイン履歴を参照" on public.coin_transactions
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- exchange_requests: 自分のデータは読み書き可、管理者は全員分更新可
create policy "自分の申請を参照" on public.exchange_requests
  for select using (auth.uid() = user_id);

create policy "自分の申請を追加" on public.exchange_requests
  for insert with check (auth.uid() = user_id);

create policy "管理者は全申請を参照" on public.exchange_requests
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "管理者は申請を更新" on public.exchange_requests
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- =============================================
-- 新規ユーザー登録時に自動でプロフィール作成
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce((new.raw_user_meta_data->>'is_admin')::boolean, false)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
