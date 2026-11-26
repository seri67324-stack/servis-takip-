# v10 Güncelleme (mevcut sisteminiz için)

## Yeni olanlar
- **Ödeme takibi:** ön ödeme, "Ödeme al", "Kalanı al", ödeme geçmişi. Panelde *Bu Ay Tahsilat* ve *Kalan Alacak*. Müşteri sayfasında Ödenen / Kalan görünür.
- **Tek dokunuşla bildirim:** kayıt oluşturunca, durum değişince veya ödeme alınca altta çıkan çubukta "WhatsApp" butonuna basın, mesaj hazır gelir (takip kodu + şifre + link).
- **Canlı yenileme:** başka cihazdan yapılan değişiklik panelde kendiliğinden görünür.
- **Hızlı açılış:** Tailwind CDN kaldırıldı (`tw.css`), internetsiz/yavaş bağlantıda da daha hızlı.
- **Admin ayrı uygulama olarak kurulur** (`manifest-admin.json` düzeltildi).
- **Güvenlik:** müşteri sorgusuna hatalı deneme sınırı, 6 haneli rastgele takip kodu, fotoğraf listesi kapatıldı (linkle görüntüleme açık), `noindex`.

## Adımlar
1. **GitHub'a yükleyin:** zip içindeki dosyaların hepsini repoya kopyalayın (üzerine yazın).
2. **Supabase > SQL Editor > New query:** `guncelleme7.sql` içeriğini yapıştırıp **Run**.
3. 1-2 dakika bekleyin, sitede **Ctrl+F5** (telefonda sayfayı kapatıp açın). Eski uygulamayı kurduysanız bir kez kapatıp açın ki yeni sürümü alsın.

Eski `guncelleme*.sql` ve `supabase_kurulum.sql` dosyalarını repodan silebilirsiniz (gerekmiyor).

## Önemli notlar
- `guncelleme7.sql`, "Teslim Edildi" durumundaki eski kayıtları **tam ödenmiş** sayar. Diğer eski kayıtlar ödenmemiş görünür; ödeme aldıkça "Ödeme al" ile girin.
- Supabase > Authentication > Providers > Email: **"Allow new users to sign up" kapalı** olsun.
- Gece yedeği sizde zaten kurulu. Sıfırdan kuracaksanız `KURULUM_REHBERI.md`'ye bakın.
