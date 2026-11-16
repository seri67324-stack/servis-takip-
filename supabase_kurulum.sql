create table if not exists public.servis_kayitlari (
  id uuid primary key default gen_random_uuid(),
  takip_kodu text unique not null,
  musteri_adi text not null,
  musteri_tel text not null,
  cihaz_modeli text not null,
  ariza_aciklamasi text,
  yapilan_islem text,
  durum text not null default 'Kabul Edildi' check (durum in ('Kabul Edildi','İnceleniyor','Parça Bekleniyor','Onarımda','Tamamlandı / Hazır','Teslim Edildi')),
  ucret numeric default 0,
  onceki_foto_url text,
  sonraki_foto_url text,
  olusturma_tarihi timestamptz default now()
);
alter table public.servis_kayitlari enable row level security;
-- Sadece giriş yapmış admin tabloya erişebilir
create policy "admin_tam_yetki" on public.servis_kayitlari for all to authenticated using (true) with check (true);
-- Müşteri tabloyu listeleyemez; sadece takip koduyla tek kayıt sorgular
create or replace function public.takip_sorgula(kod text)
returns table (takip_kodu text, musteri_adi text, cihaz_modeli text, ariza_aciklamasi text, yapilan_islem text, durum text, ucret numeric, onceki_foto_url text, sonraki_foto_url text, olusturma_tarihi timestamptz)
language sql security definer set search_path = public as $$
  select takip_kodu, musteri_adi, cihaz_modeli, ariza_aciklamasi, yapilan_islem, durum, ucret, onceki_foto_url, sonraki_foto_url, olusturma_tarihi
  from servis_kayitlari where upper(takip_kodu) = upper(kod) limit 1;
$$;
grant execute on function public.takip_sorgula(text) to anon, authenticated;
-- Fotoğraf deposu
insert into storage.buckets (id, name, public) values ('cihaz-fotolari','cihaz-fotolari', true) on conflict (id) do nothing;
create policy "foto_herkes_okur" on storage.objects for select using (bucket_id = 'cihaz-fotolari');
create policy "foto_admin_yazar" on storage.objects for insert to authenticated with check (bucket_id = 'cihaz-fotolari');
create policy "foto_admin_gunceller" on storage.objects for update to authenticated using (bucket_id = 'cihaz-fotolari');
create policy "foto_admin_siler" on storage.objects for delete to authenticated using (bucket_id = 'cihaz-fotolari');
