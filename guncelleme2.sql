-- Supabase > SQL Editor'de bir kez çalıştırın
create table if not exists public.ayarlar (id int primary key default 1 check (id=1), servis_adi text, tel text, adres text, saat text, harita text);
alter table public.ayarlar enable row level security;
drop policy if exists "ayar_okuma" on public.ayarlar;
drop policy if exists "ayar_yazma" on public.ayarlar;
create policy "ayar_okuma" on public.ayarlar for select using (true);
create policy "ayar_yazma" on public.ayarlar for all to authenticated using (true) with check (true);
insert into public.ayarlar (id) values (1) on conflict do nothing;
