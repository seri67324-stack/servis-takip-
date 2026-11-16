-- HER KULLANICI KENDİ ALANINDA: Supabase > SQL Editor'de bir kez çalıştırın
-- 1) Kayıtlar artık bir sahibe bağlı
alter table public.servis_kayitlari add column if not exists sahip_id uuid default auth.uid() references auth.users(id) on delete cascade;
-- Şimdiye kadarki tüm kayıtlar EN ESKİ hesaba (ilk açtığınız, yani sizin hesabınıza) verilir
update public.servis_kayitlari set sahip_id = (select id from auth.users order by created_at limit 1) where sahip_id is null;
drop policy if exists "admin_tam_yetki" on public.servis_kayitlari;
drop policy if exists "sahip_tam_yetki" on public.servis_kayitlari;
create policy "sahip_tam_yetki" on public.servis_kayitlari for all to authenticated using (sahip_id = auth.uid()) with check (sahip_id = auth.uid());
-- 2) Servis bilgileri de kullanıcıya özel
alter table public.ayarlar drop constraint if exists ayarlar_pkey;
alter table public.ayarlar drop constraint if exists ayarlar_id_check;
alter table public.ayarlar add column if not exists sahip_id uuid default auth.uid() references auth.users(id) on delete cascade;
update public.ayarlar set sahip_id = (select id from auth.users order by created_at limit 1) where sahip_id is null;
alter table public.ayarlar add primary key (sahip_id);
drop policy if exists "ayar_okuma" on public.ayarlar;
drop policy if exists "ayar_yazma" on public.ayarlar;
drop policy if exists "ayar_sahip" on public.ayarlar;
create policy "ayar_sahip" on public.ayarlar for all to authenticated using (sahip_id = auth.uid()) with check (sahip_id = auth.uid());
-- 3) Müşteri sorgusu: kaydın sahibinin servis bilgilerini de getirir
drop function if exists public.takip_sorgula(text);
create function public.takip_sorgula(kod text)
returns table (takip_kodu text, musteri_adi text, cihaz_modeli text, ariza_aciklamasi text, ariza_kodlari text[], yapilan_islem text, durum text, ucret numeric, fotolar_once text[], fotolar_sonra text[], olusturma_tarihi timestamptz, servis_adi text, servis_tel text, servis_adres text, servis_saat text, servis_harita text)
language sql security definer set search_path = public as $$
  select s.takip_kodu, s.musteri_adi, s.cihaz_modeli, s.ariza_aciklamasi, s.ariza_kodlari, s.yapilan_islem, s.durum, s.ucret, s.fotolar_once, s.fotolar_sonra, s.olusturma_tarihi, a.servis_adi, a.tel, a.adres, a.saat, a.harita
  from servis_kayitlari s left join ayarlar a on a.sahip_id = s.sahip_id
  where upper(s.takip_kodu) = upper(kod) limit 1;
$$;
grant execute on function public.takip_sorgula(text) to anon, authenticated;
-- 4) Fotoğraf yükleme/silme sadece kendi klasörüne
drop policy if exists "foto_admin_yazar" on storage.objects;
drop policy if exists "foto_admin_gunceller" on storage.objects;
drop policy if exists "foto_admin_siler" on storage.objects;
create policy "foto_admin_yazar" on storage.objects for insert to authenticated with check (bucket_id = 'cihaz-fotolari' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "foto_admin_gunceller" on storage.objects for update to authenticated using (bucket_id = 'cihaz-fotolari' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "foto_admin_siler" on storage.objects for delete to authenticated using (bucket_id = 'cihaz-fotolari' and (storage.foldername(name))[1] = auth.uid()::text);
