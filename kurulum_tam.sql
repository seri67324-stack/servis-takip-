-- ============================================================
-- SIFIRDAN KURULUM  —  YENİ, BOŞ bir Supabase projesi için
-- (Zaten çalışan bir veritabanınız varsa bunu ÇALIŞTIRMAYIN; guncelleme7.sql kullanın.)
-- Supabase > SQL Editor > New query > hepsini yapıştırıp Run.
-- ============================================================

create table if not exists public.servis_kayitlari (
  id uuid primary key default gen_random_uuid(),
  sahip_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  takip_kodu text unique not null,
  erisim_anahtari text not null default substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  musteri_adi text not null,
  musteri_tel text not null,
  cihaz_modeli text not null,
  ariza_aciklamasi text,
  ariza_kodlari text[] default '{}',
  yapilan_islem text,
  durum text not null default 'Kabul Edildi' check (durum in ('Kabul Edildi','İnceleniyor','Parça Bekleniyor','Onarımda','Tamamlandı / Hazır','Teslim Edildi')),
  ucret numeric default 0,
  odemeler jsonb not null default '[]'::jsonb,
  onceki_foto_url text,
  sonraki_foto_url text,
  fotolar_once text[] default '{}',
  fotolar_sonra text[] default '{}',
  olusturma_tarihi timestamptz default now(),
  hazir_tarihi timestamptz,
  silindi boolean default false,
  silinme_tarihi timestamptz
);
alter table public.servis_kayitlari enable row level security;
drop policy if exists "sahip_tam_yetki" on public.servis_kayitlari;
create policy "sahip_tam_yetki" on public.servis_kayitlari for all to authenticated
  using (sahip_id = auth.uid()) with check (sahip_id = auth.uid());

create table if not exists public.ayarlar (
  sahip_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  servis_adi text, tel text, adres text, saat text, harita text
);
alter table public.ayarlar enable row level security;
drop policy if exists "ayar_sahip" on public.ayarlar;
create policy "ayar_sahip" on public.ayarlar for all to authenticated
  using (sahip_id = auth.uid()) with check (sahip_id = auth.uid());

-- Fotoğraf deposu (linkle herkes görür, yükleme/silme/liste sadece sahibi)
insert into storage.buckets (id, name, public) values ('cihaz-fotolari', 'cihaz-fotolari', true) on conflict (id) do nothing;
drop policy if exists "foto_sahip_okur" on storage.objects;
drop policy if exists "foto_admin_yazar" on storage.objects;
drop policy if exists "foto_admin_gunceller" on storage.objects;
drop policy if exists "foto_admin_siler" on storage.objects;
create policy "foto_sahip_okur" on storage.objects for select to authenticated
  using (bucket_id = 'cihaz-fotolari' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "foto_admin_yazar" on storage.objects for insert to authenticated
  with check (bucket_id = 'cihaz-fotolari' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "foto_admin_gunceller" on storage.objects for update to authenticated
  using (bucket_id = 'cihaz-fotolari' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "foto_admin_siler" on storage.objects for delete to authenticated
  using (bucket_id = 'cihaz-fotolari' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============ Otomatik yedek (tablo + fonksiyonlar; zamanlama yedek_cron.sql ile) ============
create table if not exists public.yedekler (
  tarih date not null,
  sahip_id uuid not null,
  veri jsonb not null,
  primary key (tarih, sahip_id)
);
alter table public.yedekler enable row level security;   -- politika yok: sadece aşağıdaki fonksiyonlar erişir

create or replace function public.yedek_al() returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.yedekler (tarih, sahip_id, veri)
    select current_date, s.sahip_id, jsonb_agg(to_jsonb(s))
    from public.servis_kayitlari s where s.sahip_id is not null group by s.sahip_id
  on conflict (tarih, sahip_id) do update set veri = excluded.veri;
  delete from public.yedekler y where y.tarih < current_date - 30;
end $$;
revoke all on function public.yedek_al() from public, anon, authenticated;

create or replace function public.yedek_tarihleri() returns table (tarih date, adet integer)
language sql security definer set search_path = public as $$
  select y.tarih, jsonb_array_length(y.veri)::integer from public.yedekler y where y.sahip_id = auth.uid() order by y.tarih desc;
$$;
revoke all on function public.yedek_tarihleri() from public, anon;
grant execute on function public.yedek_tarihleri() to authenticated;

create or replace function public.yedekten_geri_yukle(tarih date) returns integer
language plpgsql security definer set search_path = public as $$
declare v jsonb; n integer;
begin
  select y.veri into v from public.yedekler y where y.sahip_id = auth.uid() and y.tarih = yedekten_geri_yukle.tarih;
  if v is null then return 0; end if;
  insert into public.servis_kayitlari (id, sahip_id, takip_kodu, erisim_anahtari, musteri_adi, musteri_tel, cihaz_modeli, ariza_aciklamasi,
      ariza_kodlari, yapilan_islem, durum, ucret, odemeler, onceki_foto_url, sonraki_foto_url, fotolar_once, fotolar_sonra,
      olusturma_tarihi, hazir_tarihi, silindi, silinme_tarihi)
    select r.id, auth.uid(), r.takip_kodu, r.erisim_anahtari, r.musteri_adi, r.musteri_tel, r.cihaz_modeli, r.ariza_aciklamasi,
      r.ariza_kodlari, r.yapilan_islem, r.durum, r.ucret, r.odemeler, r.onceki_foto_url, r.sonraki_foto_url, r.fotolar_once, r.fotolar_sonra,
      r.olusturma_tarihi, r.hazir_tarihi, r.silindi, r.silinme_tarihi
    from jsonb_populate_recordset(null::public.servis_kayitlari, v) r
  on conflict (id) do update set
      takip_kodu = excluded.takip_kodu, erisim_anahtari = excluded.erisim_anahtari, musteri_adi = excluded.musteri_adi,
      musteri_tel = excluded.musteri_tel, cihaz_modeli = excluded.cihaz_modeli, ariza_aciklamasi = excluded.ariza_aciklamasi,
      ariza_kodlari = excluded.ariza_kodlari, yapilan_islem = excluded.yapilan_islem, durum = excluded.durum, ucret = excluded.ucret,
      odemeler = excluded.odemeler, onceki_foto_url = excluded.onceki_foto_url, sonraki_foto_url = excluded.sonraki_foto_url,
      fotolar_once = excluded.fotolar_once, fotolar_sonra = excluded.fotolar_sonra, olusturma_tarihi = excluded.olusturma_tarihi,
      hazir_tarihi = excluded.hazir_tarihi, silindi = excluded.silindi, silinme_tarihi = excluded.silinme_tarihi;
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.yedekten_geri_yukle(date) from public, anon;
grant execute on function public.yedekten_geri_yukle(date) to authenticated;

-- ============ Müşteri sorgusu (kod + şifre, hatalı denemeye sınır) ============
create table if not exists public.takip_deneme (
  id bigserial primary key,
  denenen text not null,
  zaman timestamptz not null default now()
);
create index if not exists takip_deneme_idx on public.takip_deneme (denenen, zaman);
alter table public.takip_deneme enable row level security;   -- politika yok: API'den kimse okuyamaz

drop function if exists public.takip_sorgula(text);
drop function if exists public.takip_sorgula(text, text);
create function public.takip_sorgula(kod text, anahtar text)
returns table (takip_kodu text, musteri_adi text, cihaz_modeli text, ariza_aciklamasi text, ariza_kodlari text[],
  yapilan_islem text, durum text, ucret numeric, odenen numeric, fotolar_once text[], fotolar_sonra text[],
  olusturma_tarihi timestamptz, servis_adi text, servis_tel text, servis_adres text, servis_saat text, servis_harita text)
language plpgsql security definer set search_path = public as $$
declare v_kod text; v_key text; v_id uuid; n integer; g integer;
begin
  v_kod := upper(trim(coalesce(takip_sorgula.kod, '')));
  v_key := lower(trim(coalesce(takip_sorgula.anahtar, '')));
  if v_kod = '' or v_key = '' then return; end if;
  if random() < 0.02 then delete from public.takip_deneme d where d.zaman < now() - interval '1 day'; end if;
  -- Aynı koda 15 dakikada en çok 8 hatalı deneme; genel olarak 10 dakikada 400 hatalı deneme
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
      s.fotolar_once, s.fotolar_sonra, s.olusturma_tarihi, a.servis_adi, a.tel, a.adres, a.saat, a.harita
    from public.servis_kayitlari s left join public.ayarlar a on a.sahip_id = s.sahip_id
    where s.id = v_id;
end $$;
revoke all on function public.takip_sorgula(text, text) from public;
grant execute on function public.takip_sorgula(text, text) to anon, authenticated;

-- ============ Panel canlı yenileme (Realtime) ============
do $$ begin
  alter publication supabase_realtime add table public.servis_kayitlari;
exception when duplicate_object then null; when undefined_object then null;
end $$;
