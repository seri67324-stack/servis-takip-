# Sıfırdan Kurulum Rehberi

(Zaten çalışan bir sisteminiz varsa bunu değil `GUNCELLEME.md`'yi izleyin.)

## 1) Supabase
1. https://supabase.com → ücretsiz hesap → **New project** (bölge: Frankfurt).
2. **SQL Editor → New query**: `kurulum_tam.sql` içeriğini yapıştırıp **Run**.
3. **Authentication → Users → Add user → Create new user**: e-posta + şifre (Auto Confirm işaretli). Panele bununla gireceksiniz.
4. **Authentication → Providers → Email**: "Allow new users to sign up" seçeneğini **kapatın**.
5. (Otomatik yedek) **Database → Extensions → pg_cron** açın, sonra `yedek_cron.sql` içeriğini SQL Editor'de çalıştırın.

## 2) Anahtarlar
**Project Settings → API**: `Project URL` ve `anon public` anahtarını `config.js` en üstüne yazın.
`service_role` anahtarını ASLA kullanmayın.

## 3) Yayınlama (GitHub Pages)
Dosyaları repoya yükleyin → Settings → Pages → Deploy from a branch → main / (root).
Adres: `https://KULLANICI.github.io/REPO/` — yönetim: `.../admin.html`

## 4) Telefona kurma
Müşteri sayfası ve `admin.html` ayrı ayrı: Chrome → ⋮ → "Ana ekrana ekle".
