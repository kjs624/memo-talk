-- Create boards table
create table boards (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  type text check (type in ('common', 'public', 'private')) not null,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create memos table
create table memos (
  id uuid default gen_random_uuid() primary key,
  board_id uuid references boards(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  content text not null,
  color text check (color in ('yellow', 'pink', 'green', 'blue')) not null,
  position_x integer not null,
  position_y integer not null,
  rotation decimal not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create board_members table
create table board_members (
  board_id uuid references boards(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  role text check (role in ('owner', 'member')) not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (board_id, user_id)
);

-- Enable RLS
alter table boards enable row level security;
alter table memos enable row level security;
alter table board_members enable row level security;

-- RLS Policies

-- Boards: Everyone can read common boards
create policy "Common boards are public"
  on boards for select
  using (type = 'common');

-- Memos: Everyone can read memos on common boards
create policy "Memos on common boards are public"
  on memos for select
  using (
    exists (
      select 1 from boards
      where boards.id = memos.board_id
      and boards.type = 'common'
    )
  );

-- Memos: Users can insert their own memos
create policy "Users can insert their own memos"
  on memos for insert
  with check (auth.uid() = user_id);

-- Memos: Users can delete their own memos
create policy "Users can delete their own memos"
  on memos for delete
  using (auth.uid() = user_id);

-- Memos: Users can update their own memos
create policy "Users can update their own memos"
  on memos for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
