-- Gece 03:00 otomatik yedek. ÖNCE: Supabase > Database > Extensions > "pg_cron" arayıp AÇIN.
-- Sonra bunu SQL Editor'de bir kez çalıştırın. (Mevcut veritabanınızda zaten kuruluysa gerek yok.)
select cron.schedule('gunluk-yedek', '0 3 * * *', 'select public.yedek_al()');
select public.yedek_al();  -- ilk yedeği hemen al
