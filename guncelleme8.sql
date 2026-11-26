-- ============================================================
-- v11 GÜNCELLEMESİ (para birimi: TL / USD / SYP)
-- Supabase > SQL Editor > New query > hepsini yapıştırıp Run. Bir kez yeterli.
-- Mevcut kayıtlar TL olarak kalır.
-- ============================================================
alter table public.servis_kayitlari add column if not exists para_birimi text not null default 'TRY';
do $$ begin
  alter table public.servis_kayitlari add constraint para_birimi_check check (para_birimi in ('TRY','USD','SYP'));
exception when duplicate_object then null; end $$;

-- Müşteri sorgusu artık para birimini de döndürür
drop function if exists public.takip_sorgula(text, text);
create function public.takip_sorgula(kod text, anahtar text)
returns table (takip_kodu text, musteri_adi text, cihaz_modeli text, ariza_aciklamasi text, ariza_kodlari text[],
  yapilan_islem text, durum text, ucret numeric, odenen numeric, fotolar_once text[], fotolar_sonra text[],
  olusturma_tarihi timestamptz, servis_adi text, servis_tel text, servis_adres text, servis_saat text, servis_harita text, para_birimi text)
language plpgsql security definer set search_path = public as $$
declare v_kod text; v_key text; v_id uuid; n integer; g integer;
begin
  v_kod := upper(trim(coalesce(takip_sorgula.kod, '')));
  v_key := lower(trim(coalesce(takip_sorgula.anahtar, '')));
  if v_kod = '' or v_key = '' then return; end if;
  if random() < 0.02 then delete from public.takip_deneme d where d.zaman < now() - interval '1 day'; end if;
  select count(*) into n from public.takip_deneme d where d.denenen = v_kod and d.zaman > now() - interval '15 minutes';
  select count(*) into g from public.takip_deneme d where d.zaman > now() - interval '10 minutes';
  if n >= 8 or g >= 400 then return; end if;
  select s.id into v_id from public.servis_kayitlari s
    where upper(s.takip_kodu) = v_kod and lower(coalesce(s.erisim_anahtari, '')) = v_key and coalesce(s.silindi, false) = false
    limit 1;
  if v_id is null then
    insert into public.takip_deneme (denenen) values (v_kod);
    return;
  end if;
  return query
    select s.takip_kodu, s.musteri_adi, s.cihaz_modeli, s.ariza_aciklamasi, s.ariza_kodlari, s.yapilan_islem, s.durum, s.ucret,
      coalesce((select sum((e->>'t')::numeric) from jsonb_array_elements(s.odemeler) e), 0),
      s.fotolar_once, s.fotolar_sonra, s.olusturma_tarihi, a.servis_adi, a.tel, a.adres, a.saat, a.harita, s.para_birimi
    from public.servis_kayitlari s left join public.ayarlar a on a.sahip_id = s.sahip_id
    where s.id = v_id;
end $$;
revoke all on function public.takip_sorgula(text, text) from public;
grant execute on function public.takip_sorgula(text, text) to anon, authenticated;

-- Yedekten geri yükleme para birimini de geri getirir
create or replace function public.yedekten_geri_yukle(tarih date) returns integer
language plpgsql security definer set search_path = public as $$
declare v jsonb; n integer;
begin
  select y.veri into v from public.yedekler y where y.sahip_id = auth.uid() and y.tarih = yedekten_geri_yukle.tarih;
  if v is null then return 0; end if;
  insert into public.servis_kayitlari (id, sahip_id, takip_kodu, erisim_anahtari, musteri_adi, musteri_tel, cihaz_modeli, ariza_aciklamasi,
      ariza_kodlari, yapilan_islem, durum, ucret, para_birimi, odemeler, onceki_foto_url, sonraki_foto_url, fotolar_once, fotolar_sonra,
      olusturma_tarihi, hazir_tarihi, silindi, silinme_tarihi)
    select r.id, auth.uid(), r.takip_kodu, r.erisim_anahtari, r.musteri_adi, r.musteri_tel, r.cihaz_modeli, r.ariza_aciklamasi,
      r.ariza_kodlari, r.yapilan_islem, r.durum, r.ucret, coalesce(r.para_birimi,'TRY'), r.odemeler, r.onceki_foto_url, r.sonraki_foto_url, r.fotolar_once, r.fotolar_sonra,
      r.olusturma_tarihi, r.hazir_tarihi, r.silindi, r.silinme_tarihi
    from jsonb_populate_recordset(null::public.servis_kayitlari, v) r
  on conflict (id) do update set
      takip_kodu = excluded.takip_kodu, erisim_anahtari = excluded.erisim_anahtari, musteri_adi = excluded.musteri_adi,
      musteri_tel = excluded.musteri_tel, cihaz_modeli = excluded.cihaz_modeli, ariza_aciklamasi = excluded.ariza_aciklamasi,
      ariza_kodlari = excluded.ariza_kodlari, yapilan_islem = excluded.yapilan_islem, durum = excluded.durum, ucret = excluded.ucret,
      para_birimi = excluded.para_birimi, odemeler = excluded.odemeler, onceki_foto_url = excluded.onceki_foto_url, sonraki_foto_url = excluded.sonraki_foto_url,
      fotolar_once = excluded.fotolar_once, fotolar_sonra = excluded.fotolar_sonra, olusturma_tarihi = excluded.olusturma_tarihi,
      hazir_tarihi = excluded.hazir_tarihi, silindi = excluded.silindi, silinme_tarihi = excluded.silinme_tarihi;
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.yedekten_geri_yukle(date) from public, anon;
grant execute on function public.yedekten_geri_yukle(date) to authenticated;
