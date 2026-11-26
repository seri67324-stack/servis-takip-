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
 toplam:'Toplam Kayıt',aktif:'Aktif Cihaz',bekleyen:'Teslim Bekleyen',ciro:'Bu Ay Tahsilat',durumDag:'Durum Dağılımı',aylik:'Aylık Tahsilat',son6:'Son 6 ay',kayit:'KAYIT',
 sb:'Servis Bilgilerim',sbN:'(müşteri sayfasında görünür)',sAdi:'Servis adı',sTel:'Telefon (+90... / +963...)',sAdres:'Açık adres',sSaat:'Çalışma saatleri',sHarita:'Google Haritalar konum linki',sKonum:'Şu anki konumumu kullan',sKaydet:'Bilgileri Kaydet',sOk:'Servis bilgileri kaydedildi.',
 yeni:'Yeni Cihaz Kaydı',ad:'Müşteri adı',tel:'Telefon (+90... / +963...)',model:'Cihaz modeli',ucret:'Ücret',arizaSec:'Arıza türü (birden fazla seçebilirsiniz)',not:'Ek not / arıza açıklaması',onceF:'Tamir öncesi fotoğraflar',kaydet:'Kaydet',
 ara:'Ara: ad, telefon, model, kod...',tumu:'Tümü',bekF:'Teslim Bekleyen',sYeni:'En yeni önce',sEski:'En eski önce',sUcret:'Ücret (yüksek → düşük)',sUcretK:'Kalan alacak (çok → az)',yok:'Kayıt yok.',islem:'Yapılan işlem',oncesi:'Öncesi',sonrasi:'Sonrası',
 guncelle:'Kaydet',wa:'WhatsApp',hat:'Teslim Hatırlat',sosyal:'Sosyal Medya Görseli',silOnay:'Bu kayıt silinsin mi?',kamera:'Kamera',galeri:'Galeri',hazirUy:n=>`Hazır, ${n} gündür teslim alınmadı`,hata:'Hata: ',konumHata:'Konum alınamadı.'},
ar:{giris:'تسجيل دخول الإدارة',email:'البريد الإلكتروني',sifre:'كلمة المرور',girisBtn:'دخول',girisHata:'فشل الدخول: البريد أو كلمة المرور غير صحيحة.',panel:'لوحة الصيانة',cikis:'خروج',
 toplam:'إجمالي السجلات',aktif:'أجهزة قيد العمل',bekleyen:'بانتظار التسليم',ciro:'تحصيل هذا الشهر',durumDag:'توزيع الحالات',aylik:'التحصيل الشهري',son6:'آخر 6 أشهر',kayit:'سجل',
 sb:'معلومات المركز',sbN:'(تظهر في صفحة العميل)',sAdi:'اسم المركز',sTel:'الهاتف (+90... / +963...)',sAdres:'العنوان',sSaat:'ساعات العمل',sHarita:'رابط الموقع على خرائط جوجل',sKonum:'استخدام موقعي الحالي',sKaydet:'حفظ المعلومات',sOk:'تم حفظ معلومات المركز.',
 yeni:'تسجيل جهاز جديد',ad:'اسم العميل',tel:'الهاتف (+90... / +963...)',model:'طراز الجهاز',ucret:'التكلفة',arizaSec:'نوع العطل (يمكن اختيار أكثر من واحد)',not:'ملاحظة إضافية / وصف العطل',onceF:'صور قبل الإصلاح',kaydet:'حفظ',
 ara:'بحث: الاسم، الهاتف، الطراز، الرمز...',tumu:'الكل',bekF:'بانتظار التسليم',sYeni:'الأحدث أولاً',sEski:'الأقدم أولاً',sUcret:'التكلفة (الأعلى أولاً)',sUcretK:'المتبقي (الأعلى أولاً)',yok:'لا توجد سجلات.',islem:'الإجراء المنفذ',oncesi:'قبل',sonrasi:'بعد',
 guncelle:'حفظ',wa:'واتساب',hat:'تذكير بالاستلام',sosyal:'صورة للسوشيال ميديا',silOnay:'هل تريد حذف هذا السجل؟',kamera:'كاميرا',galeri:'المعرض',hazirUy:n=>`جاهز منذ ${n} يوم ولم يُستلم`,hata:'خطأ: ',konumHata:'تعذر تحديد الموقع.'}
};

async function ayarYukle(){
  try{ const {data} = await sb.from('ayarlar').select('*').maybeSingle();
    if(data) for(const k in data) if(data[k] && k!=='sahip_id' && k!=='id') AYAR[k]=data[k]; }catch(e){}
  return AYAR;
}
async function fotoYukle(file, kod, tip){
  const {data:{user}} = await sb.auth.getUser();
  const blob = await sikistir(file);
  const yol = `${user.id}/${kod}/${tip}_${Date.now()}.jpg`;
  const {error} = await sb.storage.from('cihaz-fotolari').upload(yol, blob, {contentType:'image/jpeg'});
  if(error) throw error;
  return sb.storage.from('cihaz-fotolari').getPublicUrl(yol).data.publicUrl;
}

const kodUret5 = () => 'SRV-' + String(100000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900000));
Object.assign(ADM.tr,{cop:'Silinenler',geriAl:'Geri al',kalici:'Kalıcı sil',kaliciOnay:'Bu kayıt KALICI olarak silinsin mi? Geri alınamaz.',silOnay:'Kayıt "Silinenler" bölümüne taşınsın mı? (Geri alınabilir)',
 yedek:'Yedek',yJson:'Yedek indir (JSON)',yCsv:'Excel (CSV)',yGeri:'Yedekten yükle',yedekUy:'Son yedeğiniz 7 günden eski. Lütfen "Yedek indir (JSON)" ile yedek alın.',yedekOk:n=>`${n} kayıt yüklendi.`,yedekOnay:'Yedekteki kayıtlar bu hesaba yüklenecek. Devam edilsin mi?'});
Object.assign(ADM.ar,{cop:'المحذوفات',geriAl:'استرجاع',kalici:'حذف نهائي',kaliciOnay:'هل تريد حذف هذا السجل نهائياً؟ لا يمكن التراجع.',silOnay:'هل تريد نقل السجل إلى المحذوفات؟ (يمكن استرجاعه)',
 yedek:'نسخة احتياطية',yJson:'تنزيل نسخة (JSON)',yCsv:'إكسل (CSV)',yGeri:'استعادة من نسخة',yedekUy:'آخر نسخة احتياطية أقدم من 7 أيام. يرجى تنزيل نسخة جديدة.',yedekOk:n=>`تم تحميل ${n} سجل.`,yedekOnay:'سيتم تحميل سجلات النسخة إلى هذا الحساب. هل تريد المتابعة؟'});
Object.assign(ADM.tr,{otoYedek:'Otomatik Yedekler (son 30 gün)',otoYok:'Henüz otomatik yedek yok. İlk yedek bu gece 03:00'te oluşur.',kayitS:'kayıt',otoGeri:'Bu güne geri dön',otoOnay:'Bu tarihteki kayıtlar geri yüklenecek. O günden sonra bu kayıtlarda yaptığınız değişiklikler eski haline döner (sonradan eklenen kayıtlar silinmez). Devam edilsin mi?',otoOk:n=>`${n} kayıt geri yüklendi.`});
Object.assign(ADM.ar,{otoYedek:'النسخ الاحتياطية التلقائية (آخر 30 يوماً)',otoYok:'لا توجد نسخ تلقائية بعد. أول نسخة تُنشأ الليلة.',kayitS:'سجل',otoGeri:'الرجوع إلى هذا اليوم',otoOnay:'سيتم استرجاع سجلات هذا التاريخ، وستعود التعديلات اللاحقة عليها إلى حالتها السابقة (السجلات المضافة لاحقاً لا تُحذف). هل تريد المتابعة؟',otoOk:n=>`تم استرجاع ${n} سجل.`});

Object.assign(ADM.tr,{ciro:'Bu Ay Tahsilat',aylik:'Aylık Tahsilat',alacak:'Kalan Alacak',buAyKayit:'Bu Ay Kayıt',onOdeme:'Ön ödeme (varsa)',
 odeme:'Ödeme Geçmişi',kalan:'Kalan',odendi:'Ödeme tamamlandı ✓',tutar:'Tutar',odemeEkle:'Ödeme al',kalaniAl:'Kalanı al',sonOdemeSil:'Son ödemeyi sil',
 odemeOk:'Ödeme kaydedildi.',durumOk:'Durum otomatik güncellendi. Müşteriye bildirilsin mi?',yeniOk:'Kayıt oluşturuldu. Takip linkini müşteriye gönderin.'});
Object.assign(ADM.ar,{ciro:'تحصيل هذا الشهر',aylik:'التحصيل الشهري',alacak:'المبالغ المتبقية',buAyKayit:'سجلات هذا الشهر',onOdeme:'دفعة مقدمة (إن وجدت)',
 odeme:'سجل الدفعات',kalan:'المتبقي',odendi:'تم السداد بالكامل ✓',tutar:'المبلغ',odemeEkle:'تسجيل دفعة',kalaniAl:'تحصيل المتبقي',sonOdemeSil:'حذف آخر دفعة',
 odemeOk:'تم تسجيل الدفعة.',durumOk:'تم تحديث الحالة تلقائياً. هل تريد إبلاغ العميل؟',yeniOk:'تم إنشاء السجل. أرسل رابط التتبع للعميل.'});

Object.assign(ADM.tr,{
  yeniBtn:'Yeni Cihaz Kaydı',ist:'Dönemsel Tahsilat & İstatistik',ayarlar:'Ayarlar, Tema ve Yedek',foto:'Fotoğraflar',arizaT:'Arıza türü',
  pbKilit:'Ödeme alındığı için para birimi değiştirilemez',
  musteriListesi:'Müşteri & Cihaz Listesi',musteriAc:'Tüm müşterileri görmek için dokunun',
  hazirSira:'Hazır Bekleyenler (Hatırlatma Sırası)',
  bugunTahsilat:'Bugün Tahsilat',haftaTahsilat:'Bu Hafta Tahsilat',ayTahsilat:'Bu Ay Tahsilat',
  odemeDokumu:'Ödeme Dökümü (Seçili Para Birimi)',odemeYok:'Bu para biriminde kayıtlı ödeme yok.',
  temaSec:'Tema Seçimi',temaGece:'Gece Moru',temaOkyanus:'Okyanus',temaZumrut:'Zümrüt',temaAydinlik:'Aydınlık',
  otoKaydedildi:'Otomatik kaydedildi ✓'
});
Object.assign(ADM.ar,{
  yeniBtn:'تسجيل جهاز جديد',ist:'التحصيل الدوري والإحصائيات',ayarlar:'الإعدادات والمظهر والنسخ',foto:'الصور',arizaT:'نوع العطل',
  pbKilit:'لا يمكن تغيير العملة بعد استلام دفعة',
  musteriListesi:'قائمة العملاء والأجهزة',musteriAc:'اضغط لعرض جميع العملاء',
  hazirSira:'الأجهزة الجاهزة (قائمة التذكير)',
  bugunTahsilat:'تحصيل اليوم',haftaTahsilat:'تحصيل هذا الأسبوع',ayTahsilat:'تحصيل هذا الشهر',
  odemeDokumu:'كشف الدفعات (العملة المختارة)',odemeYok:'لا توجد دفعات مسجلة بهذه العملة.',
  temaSec:'اختيار المظهر',temaGece:'ليلي بنفسجي',temaOkyanus:'محيطي أزرق',temaZumrut:'زمردي أخضر',temaAydinlik:'نهاري فاتح',
  otoKaydedildi:'تم الحفظ تلقائياً ✓'
});
const PB_AD = {TRY:'TL (₺)', USD:'USD ($)', SYP:'SYP (ل.س)'};
