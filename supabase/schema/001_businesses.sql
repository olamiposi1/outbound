   create table public.businesses (
     id uuid primary key default gen_random_uuid(),
     user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
     website text not null,
     name text,
     summary text,
     created_at timestamptz not null default now()
   );

   alter table public.businesses enable row level security;

   create policy "Users read own businesses"
     on public.businesses for select to authenticated
     using ((select auth.uid()) = user_id);

   create policy "Users add own businesses"
     on public.businesses for insert to authenticated
     with check ((select auth.uid()) = user_id);

   create policy "Users update own businesses"
     on public.businesses for update to authenticated
     using ((select auth.uid()) = user_id)
     with check ((select auth.uid()) = user_id);

   create policy "Users delete own businesses"
     on public.businesses for delete to authenticated
     using ((select auth.uid()) = user_id);