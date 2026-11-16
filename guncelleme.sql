-- Supabase > SQL Editor'de bir kez çalıştırın (mevcut verilerinize dokunmaz)
alter table public.servis_kayitlari add column if not exists fotolar_once text[] default '{}';
alter table public.servis_kayitlari add column if not exists fotolar_sonra text[] default '{}';
alter table public.servis_kayitlari add column if not exists hazir_tarihi timestamptz;
update public.servis_kayitlari set fotolar_once = array[onceki_foto_url] where onceki_foto_url is not null and coalesce(array_length(fotolar_once,1),0)=0;
update public.servis_kayitlari set fotolar_sonra = array[sonraki_foto_url] where sonraki_foto_url is not null and coalesce(array_length(fotolar_sonra,1),0)=0;
update public.servis_kayitlari set hazir_tarihi = now() where durum='Tamamlandı / Hazır' and hazir_tarihi is null;
drop function if exists public.takip_sorgula(text);
create function public.takip_sorgula(kod text)
returns table (takip_kodu text, musteri_adi text, cihaz_modeli text, ariza_aciklamasi text, yapilan_islem text, durum text, ucret numeric, fotolar_once text[], fotolar_sonra text[], olusturma_tarihi timestamptz)
language sql security definer set search_path = public as $$
  select takip_kodu, musteri_adi, cihaz_modeli, ariza_aciklamasi, yapilan_islem, durum, ucret, fotolar_once, fotolar_sonra, olusturma_tarihi
  from servis_kayitlari where upper(takip_kodu) = upper(kod) limit 1;
$$;
grant execute on function public.takip_sorgula(text) to anon, authenticated;
