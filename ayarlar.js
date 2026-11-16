// ====== SERVİS BİLGİLERİNİZİ YAZIN ======
const SERVIS_TEL = '05XXXXXXXXX';
const SERVIS_ADRES = 'Mahalle, Sokak No:1, İlçe / İl';
const SERVIS_SAAT = 'Hafta içi 09:00 - 19:00';
const HAZIR_UYARI_GUN = 3; // Hazır cihaz kaç gün alınmazsa uyarı çıksın
// ========================================
const D_RENK = ['#64748b','#38bdf8','#f59e0b','#a78bfa','#10b981','#ec4899'];
const D_IKON = ['📥','🔍','⏳','🛠️','✅','🤝'];
const telNo = t => { let x = String(t).replace(/\D/g,''); if(x.startsWith('0')) x = x.slice(1); if(!x.startsWith('90')) x = '90'+x; return x; };
