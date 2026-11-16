# Kurulum Rehberi

## 1) Supabase projesi
1. https://supabase.com adresinde ücretsiz hesap açın → **New project** (bölge: Frankfurt önerilir).
2. Sol menüden **SQL Editor → New query** açın.
3. `supabase_kurulum.sql` dosyasının tamamını yapıştırıp **Run**'a basın (tablo, güvenlik kuralları ve `cihaz-fotolari` deposu oluşur).
4. **Authentication → Users → Add user → Create new user**: kendi e-posta ve şifrenizi girin, "Auto Confirm User" işaretli olsun. Panele bu bilgilerle gireceksiniz.
5. (Önerilir) **Authentication → Providers → Email** altında "Allow new users to sign up" seçeneğini kapatın.

## 2) Anahtarları yazma
**Project Settings → API** sayfasından `Project URL` ve `anon public` anahtarını kopyalayın.
`config.js` dosyasının en üstüne yazın:
```js
const SUPABASE_URL = 'https://xxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...';
const SERVIS_ADI = 'Servis Adınız';
```
(`service_role` anahtarını ASLA kullanmayın.)

## 3) Ücretsiz yayınlama
**Netlify (en kolay):** https://app.netlify.com/drop → proje klasörünü sürükleyip bırakın. Size bir adres verir.
**Vercel:** vercel.com → Add New → Project → klasörü GitHub'a yükleyip seçin (Framework: Other) → Deploy.

Yayına aldıktan sonra `admin.html` adresinden giriş yapın. Müşteri linkleri otomatik olarak sitenizin adresiyle oluşur (gerekirse `config.js` içindeki `SITE_ADRESI` alanına yazın).

## 4) Telefona kurma (PWA)
Siteyi telefonda açın → tarayıcı menüsü → "Ana ekrana ekle".

## Güvenlik notu
Müşteriler tabloyu listeleyemez; yalnızca takip koduyla tek kaydı görür. Fotoğraf adresleri herkese açıktır ama tahmin edilmesi zordur.
