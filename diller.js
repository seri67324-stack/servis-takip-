const ARIZALAR = [
 {k:'ekran',tr:'Ekran',ar:'الشاشة'},{k:'batarya',tr:'Batarya',ar:'البطارية'},{k:'sarj',tr:'Şarj soketi',ar:'منفذ الشحن'},
 {k:'hoparlor',tr:'Hoparlör',ar:'السماعة'},{k:'mikrofon',tr:'Mikrofon',ar:'الميكروفون'},{k:'kasa',tr:'Kasa / Kapak',ar:'الهيكل / الغطاء'},
 {k:'kamera',tr:'Kamera',ar:'الكاميرا'},{k:'dokunmatik',tr:'Dokunmatik',ar:'شاشة اللمس'},{k:'tus',tr:'Tuş / Buton',ar:'الأزرار'},
 {k:'yazilim',tr:'Yazılım',ar:'البرمجيات'},{k:'su',tr:'Sıvı teması',ar:'تلف بالسوائل'},{k:'acilmiyor',tr:'Açılmıyor',ar:'لا يعمل'},
 {k:'titresim',tr:'Titreşim',ar:'الاهتزاز'},{k:'sinyal',tr:'Sinyal / SIM',ar:'الشبكة / الشريحة'},{k:'wifi',tr:'Wi-Fi / Bluetooth',ar:'واي فاي / بلوتوث'},
 {k:'faceid',tr:'Face ID / Parmak izi',ar:'بصمة الوجه / الإصبع'},{k:'isinma',tr:'Aşırı ısınma',ar:'ارتفاع الحرارة'},{k:'diger',tr:'Diğer',ar:'أخرى'}
];
const D_AR = ['تم الاستلام','قيد الفحص','بانتظار قطعة الغيار','قيد الإصلاح','اكتمل / جاهز','تم التسليم'];
const ADM = {
tr:{giris:'Yönetim Girişi',email:'E-posta',sifre:'Şifre',girisBtn:'Giriş Yap',girisHata:'Giriş başarısız: e-posta veya şifre hatalı.',panel:'Servis Paneli',cikis:'Çıkış',
 toplam:'Toplam Kayıt',aktif:'Aktif Cihaz',bekleyen:'Teslim Bekleyen',ciro:'Bu Ay Ciro',durumDag:'Durum Dağılımı',aylik:'Aylık Ciro',son6:'Son 6 ay',kayit:'KAYIT',
 sb:'Servis Bilgilerim',sbN:'(müşteri sayfasında görünür)',sAdi:'Servis adı',sTel:'Telefon (05xx...)',sAdres:'Açık adres',sSaat:'Çalışma saatleri',sHarita:'Google Haritalar konum linki',sKonum:'Şu anki konumumu kullan',sKaydet:'Bilgileri Kaydet',sOk:'Servis bilgileri kaydedildi.',
 yeni:'Yeni Cihaz Kaydı',ad:'Müşteri adı',tel:'Telefon (05xx...)',model:'Cihaz modeli',ucret:'Ücret (₺)',arizaSec:'Arıza türü (birden fazla seçebilirsiniz)',not:'Ek not / arıza açıklaması',onceF:'Tamir öncesi fotoğraflar',kaydet:'Kaydet',
 ara:'Ara: ad, telefon, model, kod...',tumu:'Tümü',bekF:'Teslim Bekleyen',sYeni:'En yeni önce',sEski:'En eski önce',sUcret:'Ücret (yüksek → düşük)',yok:'Kayıt yok.',islem:'Yapılan işlem',oncesi:'Öncesi',sonrasi:'Sonrası',
 guncelle:'Güncelle',wa:'WhatsApp',hat:'Hatırlat',sosyal:'Sosyal Medya Görseli',silOnay:'Bu kayıt silinsin mi?',kamera:'Kamera',galeri:'Galeri',hazirUy:n=>`Hazır, ${n} gündür teslim alınmadı`,hata:'Hata: ',konumHata:'Konum alınamadı.'},
ar:{giris:'تسجيل دخول الإدارة',email:'البريد الإلكتروني',sifre:'كلمة المرور',girisBtn:'دخول',girisHata:'فشل الدخول: البريد أو كلمة المرور غير صحيحة.',panel:'لوحة الصيانة',cikis:'خروج',
 toplam:'إجمالي السجلات',aktif:'أجهزة قيد العمل',bekleyen:'بانتظار التسليم',ciro:'إيرادات هذا الشهر',durumDag:'توزيع الحالات',aylik:'الإيرادات الشهرية',son6:'آخر 6 أشهر',kayit:'سجل',
 sb:'معلومات المركز',sbN:'(تظهر في صفحة العميل)',sAdi:'اسم المركز',sTel:'الهاتف (05xx...)',sAdres:'العنوان',sSaat:'ساعات العمل',sHarita:'رابط الموقع على خرائط جوجل',sKonum:'استخدام موقعي الحالي',sKaydet:'حفظ المعلومات',sOk:'تم حفظ معلومات المركز.',
 yeni:'تسجيل جهاز جديد',ad:'اسم العميل',tel:'الهاتف (05xx...)',model:'طراز الجهاز',ucret:'التكلفة (₺)',arizaSec:'نوع العطل (يمكن اختيار أكثر من واحد)',not:'ملاحظة إضافية / وصف العطل',onceF:'صور قبل الإصلاح',kaydet:'حفظ',
 ara:'بحث: الاسم، الهاتف، الطراز، الرمز...',tumu:'الكل',bekF:'بانتظار التسليم',sYeni:'الأحدث أولاً',sEski:'الأقدم أولاً',sUcret:'التكلفة (الأعلى أولاً)',yok:'لا توجد سجلات.',islem:'الإجراء المنفذ',oncesi:'قبل',sonrasi:'بعد',
 guncelle:'تحديث',wa:'واتساب',hat:'تذكير',sosyal:'صورة للسوشيال ميديا',silOnay:'هل تريد حذف هذا السجل؟',kamera:'كاميرا',galeri:'المعرض',hazirUy:n=>`جاهز منذ ${n} يوم ولم يُستلم`,hata:'خطأ: ',konumHata:'تعذر تحديد الموقع.'}
};
