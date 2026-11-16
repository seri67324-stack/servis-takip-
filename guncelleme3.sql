-- Supabase > SQL Editor'de bir kez çalıştırın
alter table public.servis_kayitlari add column if not exists ariza_kodlari text[] default '{}';
drop function if exists public.takip_sorgula(text);
create function public.takip_sorgula(kod text)
returns table (takip_kodu text, musteri_adi text, cihaz_modeli text, ariza_aciklamasi text, ariza_kodlari text[], yapilan_islem text, durum text, ucret numeric, fotolar_once text[], fotolar_sonra text[], olusturma_tarihi timestamptz)
language sql security definer set search_path = public as $$
  select takip_kodu, musteri_adi, cihaz_modeli, ariza_aciklamasi, ariza_kodlari, yapilan_islem, durum, ucret, fotolar_once, fotolar_sonra, olusturma_tarihi
  from servis_kayitlari where upper(takip_kodu) = upper(kod) limit 1;
$$;
grant execute on function public.takip_sorgula(text) to anon, authenticated;
