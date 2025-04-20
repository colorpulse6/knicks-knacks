-- Create users table (if using Supabase Auth, this might be redundant)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  created_at timestamptz default now()
);

-- Create food_logs table
create table if not exists food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  image_url text not null,
  food_name text,
  calories integer,
  proteins numeric(5,2),
  fats numeric(5,2),
  carbs numeric(5,2),
  logged_at timestamptz default now()
);

-- Create storage bucket for food images
insert into storage.buckets (id, name, public) 
values ('food-images', 'food-images', true)
on conflict (id) do nothing;

-- Set up storage policy to allow public access to food images
create policy "Food images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'food-images');

-- Set up storage policy to allow authenticated uploads
create policy "Users can upload food images"
  on storage.objects for insert
  using (bucket_id = 'food-images');

-- Optional: Add RLS (Row Level Security) for food_logs
alter table food_logs enable row level security;

-- Policy to allow users to see only their own food logs
create policy "Users can view their own food logs"
  on food_logs for select
  using (user_id = auth.uid());

-- Policy to allow users to insert their own food logs
create policy "Users can add their own food logs"
  on food_logs for insert
  with check (user_id = auth.uid());

-- Policy to allow anonymous uploads
create policy "Allow anonymous uploads"
  on food_logs for insert
  with check (user_id is null); 