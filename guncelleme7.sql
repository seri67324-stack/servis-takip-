-- ============================================================
-- v10 GÜNCELLEMESİ  —  MEVCUT veritabanınız için
-- Supabase > SQL Editor > New query > hepsini yapıştırıp Run.
-- Mevcut kayıtlarınıza dokunmaz. Bir kez çalıştırmanız yeterli.
-- ============================================================

-- 1) Yeni / eksik sütunlar
alter table public.servis_kayitlari add column if not exists odemeler jsonb not null default '[]'::jsonb;
alter table public.servis_kayitlari add column if not exists erisim_anahtari text;
alter table public.servis_kayitlari add column if not exists silindi boolean default false;
alter table public.servis_kayitlari add column if not exists silinme_tarihi timestamptz;
alter table public.servis_kayitlari add column if not exists hazir_tarihi timestamptz;

-- 2) Yeni kayıtlara tahmin edilemez 8 karakterlik şifre; şifresi boş olan eski kayıtlara da ver
alter table public.servis_kayitlari alter column erisim_anahtari set default substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
update public.servis_kayitlari set erisim_anahtari = substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)
  where erisim_anahtari is null or erisim_anahtari = '';

-- 3) Eski kayıtlar: "Teslim Edildi" olanlar tam ödenmiş sayılır (ciro ve alacak doğru çıksın)
update public.servis_kayitlari
  set odemeler = jsonb_build_array(jsonb_build_object('t', ucret, 'd', coalesce(hazir_tarihi, olusturma_tarihi)))
  where durum = 'Teslim Edildi' and coalesce(ucret, 0) > 0 and odemeler = '[]'::jsonb;

-- 4) Fotoğraf deposu: linkle görüntüleme AÇIK kalır, ama herkesin dosya listesini çekmesi kapanır
drop policy if exists "foto_herkes_okur" on storage.objects;
drop policy if exists "foto_sahip_okur" on storage.objects;
create policy "foto_sahip_okur" on storage.objects for select to authenticated
  using (bucket_id = 'cihaz-fotolari' and (storage.foldername(name))[1] = auth.uid()::text);

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
