// ====== BURAYI DOLDURUN ======
const SUPABASE_URL = 'https://locusbvqjwcwwcnfmryz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY3VzYnZxandjd3djbmZtcnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3OTc1NDMsImV4cCI6MjExMDM3MzU0M30.GTigrpw63qdgwAg-s3LclxBynSGaBF6ifPiR9tLfeiE';
const SERVIS_ADI = 'Teknik Servis';
const SITE_ADRESI = ''; // Boşsa otomatik algılanır. Örn: https://qrcodesy.site
// =============================
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const DURUMLAR = ['Kabul Edildi','İnceleniyor','Parça Bekleniyor','Onarımda','Tamamlandı / Hazır','Teslim Edildi'];

const PARA_BIRIMLERI = {
  TRY: { kod: 'TRY', sembol: '₺', adTr: 'Türk Lirası (₺)', adAr: 'ليرة تركية (₺)', ondalik: 2 },
  USD: { kod: 'USD', sembol: '$', adTr: 'Amerikan Doları ($)', adAr: 'دولار أمريكي ($)', ondalik: 2 },
  SYP: { kod: 'SYP', sembol: 'ل.س', adTr: 'Suriye Lirası (ل.س)', adAr: 'ليرة سورية (ل.س)', ondalik: 0 }
};

function getParaBirimi(){
  try{
    const c = localStorage.getItem('paraBirimi');
    if(c && PARA_BIRIMLERI[c]) return c;
  }catch(e){}
  return 'TRY';
}

function paraFormat(n, kod, dil){
  const pb = PARA_BIRIMLERI[kod] || PARA_BIRIMLERI[getParaBirimi()] || PARA_BIRIMLERI.TRY;
  const val = Number(n || 0);
  const loc = (dil === 'ar') ? 'en-US' : 'tr-TR';
  const fmt = val.toLocaleString(loc, { minimumFractionDigits: pb.ondalik, maximumFractionDigits: pb.ondalik });
  if(pb.kod === 'USD') return '$' + fmt;
  if(pb.kod === 'SYP') return fmt + ' ' + pb.sembol;
  return (dil === 'ar') ? (fmt + ' ₺') : (fmt + ' ₺');
}

const tl = n => paraFormat(n, getParaBirimi(), 'tr');
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function takipLinki(kod){
  const base = SITE_ADRESI || (location.origin + location.pathname.replace(/[^\/]*$/,''));
  return base.replace(/\/$/,'') + '/index.html?kod=' + kod;
}
// Canvas ile sıkıştırma: max 1080px genişlik, %70 JPEG
function sikistir(file, maxW=1080, q=0.7){
  return new Promise((res,rej)=>{
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = ()=>{
      const r = Math.min(1, maxW/img.width), c = document.createElement('canvas');
      c.width = Math.round(img.width*r); c.height = Math.round(img.height*r);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);
      URL.revokeObjectURL(url);
      c.toBlob(b=> b?res(b):rej(new Error('Sıkıştırma başarısız')),'image/jpeg',q);
    };
    img.onerror = ()=>rej(new Error('Görsel okunamadı'));
    img.src = url;
  });
}
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
