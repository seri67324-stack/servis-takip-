const $ = id => document.getElementById(id);
const TR = { sub:'Cihazınızın durumunu anlık izleyin', ph:'Örn: SRV-123456', btn:'Cihazı Sorgula', nf:'Bu koda ait kayıt bulunamadı.', conn:'Bağlantı hatası, tekrar deneyin.',
  hazirT:'Cihazınız hazır', hazirD:'Dilediğiniz zaman teslim alabilirsiniz.', step:'Adım', cust:'Müşteri', fault:'Arıza', work:'Yapılan İşlem', none:'Henüz girilmedi', price:'Toplam Ücret',
  before:'Tamir Öncesi', after:'Tamir Sonrası', now:'Şu anki aşama', call:'Ara', wa:'WhatsApp', route:'Yol Tarifi', live:'Canlı takip aktif', title:'Cihaz Takip',
  d:['Kabul Edildi','İnceleniyor','Parça Bekleniyor','Onarımda','Tamamlandı / Hazır','Teslim Edildi'], loc:'tr-TR',
  rol:'Müşteri Takip Ekranı', lblKod:'Takip Kodu', lblAnahtar:'Takip Şifresi (SMS / WhatsApp)', adminLink:'Yetkili / Servis Girişi →' };
const AR = { sub:'تابع حالة جهازك لحظة بلحظة', ph:'مثال: SRV-123456', btn:'استعلام عن الجهاز', nf:'لم يتم العثور على سجل بهذا الرمز.', conn:'خطأ في الاتصال، حاول مرة أخرى.',
  hazirT:'جهازك جاهز', hazirD:'يمكنك استلامه في أي وقت.', step:'المرحلة', cust:'العميل', fault:'العطل', work:'الإجراء المنفذ', none:'لم يتم إدخاله بعد', price:'التكلفة الإجمالية',
  before:'قبل الإصلاح', after:'بعد الإصلاح', now:'المرحلة الحالية', call:'اتصال', wa:'واتساب', route:'الاتجاهات', live:'تحديث تلقائي مباشر', title:'تتبع الجهاز',
  d:['تم الاستلام','قيد الفحص','بانتظار قطعة الغيار','قيد الإصلاح','اكتمل / جاهز','تم التسليم'], loc:'ar-u-nu-latn',
  rol:'صفحة تتبع العميل', lblKod:'رمز التتبع', lblAnahtar:'كلمة سر التتبع (مذكورة في الرسالة)', adminLink:'دخول الإدارة / الفني ←' };
TR.ph2='8 haneli şifre'; TR.anahtarIste='Güvenlik için takip kodunu ve şifreyi girin.'; TR.nf='Kayıt bulunamadı. Kod ve şifreyi kontrol edin. Çok fazla hatalı denemede bir süre beklemeniz gerekir.'; TR.paid='Ödenen'; TR.rest='Kalan Tutar'; TR.allPaid='Ödeme tamamlandı ✓';
AR.ph2='كلمة السر (8 أحرف)'; AR.anahtarIste='للأمان، أدخل رمز التتبع وكلمة السر.'; AR.nf='لم يتم العثور على سجل. تحقق من الرمز وكلمة السر. بعد محاولات خاطئة كثيرة يجب الانتظار قليلاً.'; AR.paid='المدفوع'; AR.rest='المبلغ المتبقي'; AR.allPaid='تم السداد بالكامل ✓';
const TT = {tr:TR, ar:AR};
let L = 'tr'; try{ const sd = localStorage.getItem('dil'); L = sd ? (sd==='ar'?'ar':'tr') : ((navigator.language||'').toLowerCase().startsWith('ar')?'ar':'tr'); const pd = new URLSearchParams(location.search).get('dil'); if(pd==='ar'||pd==='tr'){ L=pd; localStorage.setItem('dil',pd); } }catch(e){}
let PB = getParaBirimi();
const t = k => TT[L][k];
const para = (n, pbKod) => paraFormat(n, pbKod || PB, L);
let galeri = [], gi = 0, son = null, sonJs = '', aktif = '', aktifAnahtar = '', hataK = '';
$('logo').innerHTML = ic('wrench','text-white');

if($('pbSec')){
  $('pbSec').value = PB;
  $('pbSec').onchange = ()=>{
    PB = $('pbSec').value;
    try{ localStorage.setItem('paraBirimi', PB); }catch(e){}
    if(son) goster(son);
  };
}

function iletisim(){
  const A = AYAR; document.title = A.servis_adi+' | '+t('title'); $('baslik').textContent = A.servis_adi;
  const harita = A.harita || (A.adres ? 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(A.adres) : '');
  const b = [A.tel?`<a href="tel:+${telNo(A.tel)}" class="btn grad">${ic('phone')} ${t('call')}</a>`:'', A.tel?`<a href="https://wa.me/${telNo(A.tel)}" target="_blank" class="btn grad-g">${ic('chat')} ${t('wa')}</a>`:'', harita?`<a href="${esc(harita)}" target="_blank" class="btn ghost">${ic('pin')} ${t('route')}</a>`:''].filter(Boolean);
  if(!b.length && !A.adres){ $('iletisim').classList.add('hidden'); return; }
  $('iletisim').classList.remove('hidden');
  $('iletisim').innerHTML = `<div class="font-bold text-base mb-2">${esc(A.servis_adi)}</div>
  ${A.adres?`<div class="flex gap-2 text-slate-300">${ic('pin','mt-0.5 text-fuchsia-300')}<span>${esc(A.adres)}</span></div>`:''}
  ${A.saat?`<div class="flex gap-2 text-slate-300 mt-1.5">${ic('clock','mt-0.5 text-cyan-300')}<span>${esc(A.saat)}</span></div>`:''}
  ${A.tel?`<div class="flex gap-2 text-slate-300 mt-1.5">${ic('phone','mt-0.5 text-emerald-300')}<span dir="ltr">${esc(A.tel)}</span></div>`:''}
  <div class="grid grid-cols-${b.length} gap-2 mt-4">${b.join('')}</div>`;
}
function uygula(){
  document.documentElement.lang = L; document.documentElement.dir = L==='ar'?'rtl':'ltr';
  $('altbaslik').textContent = t('sub'); $('kod').placeholder = t('ph'); $('anahtar').placeholder = t('ph2'); $('sbtn').innerHTML = ic('search')+' '+t('btn');
  if($('rolRozet')) $('rolRozet').textContent = t('rol');
  if($('lblKod')) $('lblKod').textContent = t('lblKod');
  if($('lblAnahtar')) $('lblAnahtar').textContent = t('lblAnahtar');
  if($('adminGecis')) $('adminGecis').textContent = t('adminLink');
  document.querySelectorAll('[data-l]').forEach(b=>b.classList.toggle('on', b.dataset.l===L));
  iletisim(); if(son) goster(son); if(hataK) $('hata').textContent = t(hataK);
}
document.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{ L=b.dataset.l; try{localStorage.setItem('dil',L)}catch(e){} uygula(); });

function ayarUygula(k){ AYAR.servis_adi=k.servis_adi||'Teknik Servis'; AYAR.tel=k.servis_tel||''; AYAR.adres=k.servis_adres||''; AYAR.saat=k.servis_saat||''; AYAR.harita=k.servis_harita||''; iletisim(); }
async function sorgula(kod, sessiz, anahtar){
  kod = kod.trim().toUpperCase(); anahtar = String(anahtar!==undefined && anahtar!==null ? anahtar : $('anahtar').value).trim().toLowerCase(); if(!kod) return;
  if(!anahtar){ if(sessiz) return; hataK='anahtarIste'; $('hata').textContent=t(hataK); $('hata').classList.remove('hidden'); return; }
  const {data,error} = await sb.rpc('takip_sorgula',{kod, anahtar});
  if(error || !data || !data.length){
    if(sessiz) return;
    if(!error){ try{localStorage.removeItem('sonKod')}catch(e){} aktif=''; }
    son=null; sonJs=''; $('sonuc').classList.add('hidden'); hataK = error?'conn':'nf'; $('hata').textContent = t(hataK); $('hata').classList.remove('hidden'); return;
  }
  aktif = kod; aktifAnahtar = anahtar; hataK=''; $('hata').classList.add('hidden');
  try{ localStorage.setItem('sonKod',kod); localStorage.setItem('sonAnahtar',anahtar); history.replaceState(null,'','?kod='+encodeURIComponent(kod)+'&k='+encodeURIComponent(anahtar)); }catch(e){}
  const js = JSON.stringify(data[0]); if(sessiz && js===sonJs) return;
  sonJs = js; son = data[0]; ayarUygula(son); goster(son);
}
const arizaHtml = k => { const c = (k.ariza_kodlari||[]).map(x=>ARIZALAR.find(a=>a.k===x)).filter(Boolean).map(a=>`<span class="chip">${a[L]}</span>`).join(' '); const n = esc(k.ariza_aciklamasi); return ((c?`<div class="flex flex-wrap gap-1.5">${c}</div>`:'')+(n?`<div class="${c?'mt-1.5 text-slate-300':''}">${n}</div>`:'')) || '-'; };
function goster(k){
  const i = DURUMLAR.indexOf(k.durum), renk = D_RENK[i], N = DURUMLAR.length, p = (i+1)/N*100, hazir = i===4, dn = t('d');
  const aktifPb = k.para_birimi || PB;
  const halka = `<div class="relative w-28 h-28 shrink-0"><svg viewBox="0 0 100 100" class="w-28 h-28 -rotate-90"><circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,.1)" stroke-width="9" fill="none"/><circle class="ringa" cx="50" cy="50" r="42" stroke="${renk}" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="${2.64*p} 264" style="filter:drop-shadow(0 0 7px ${renk})"/></svg><div class="absolute inset-0 grid place-items-center text-3xl" style="color:${renk}">${ic(D_IKON[i])}</div></div>`;
  const adimlar = dn.map((d,n)=>`<li class="flex gap-3"><div class="flex flex-col items-center"><span class="ibox w-9 h-9 rounded-full ${n===i?'pulse':''}" style="${n<=i?`background:${D_RENK[n]}22;color:${D_RENK[n]};border:1.5px solid ${D_RENK[n]}`:'background:rgba(255,255,255,.04);color:#475569;border:1.5px solid rgba(255,255,255,.08)'}">${n<i?ic('check'):ic(D_IKON[n])}</span>${n<N-1?`<span class="w-0.5 flex-1 min-h-4" style="background:${n<i?D_RENK[n]:'rgba(255,255,255,.08)'}"></span>`:''}</div><div class="pb-4 pt-1.5 ${n<=i?'text-white font-medium':'text-slate-500'}">${d}${n===i?'<div class="text-xs font-normal" style="color:'+renk+'">'+t('now')+'</div>':''}</div></li>`).join('');
  galeri = [];
  const grup = (arr,tt)=>{ if(!arr||!arr.length) return ''; const bas = galeri.length; galeri.push(...arr);
    return `<div><div class="text-xs text-slate-400 mb-2 flex items-center gap-1.5">${ic('camera')} ${tt}</div><div class="flex gap-2 overflow-x-auto pb-1">${arr.map((u,n)=>`<img src="${esc(u)}" data-g="${bas+n}" class="h-28 w-28 shrink-0 rounded-2xl object-cover cursor-zoom-in border border-white/10">`).join('')}</div></div>`; };
  const fotolar = grup(k.fotolar_once,t('before')) + grup(k.fotolar_sonra,t('after'));
  const satir = (a,v)=>`<div><div class="text-xs uppercase tracking-wide text-slate-500">${a}</div><div class="mt-0.5">${v}</div></div>`;
  const tarih = new Date(k.olusturma_tarihi).toLocaleDateString(t('loc'));
  const od = +k.odenen||0, kalan = Math.max(0,(+k.ucret||0)-od);
  const odemeHtml = od>0 ? `<div class="flex justify-between text-sm"><span class="text-slate-400">${t('paid')}</span><span dir="ltr" class="text-emerald-300">${para(od, aktifPb)}</span></div><div class="flex justify-between text-sm"><span class="text-slate-400">${t('rest')}</span>${kalan>0?`<span dir="ltr" class="font-bold">${para(kalan, aktifPb)}</span>`:`<span class="text-emerald-300 font-semibold">${t('allPaid')}</span>`}</div>` : '';
  $('sonuc').innerHTML = `
  ${hazir?`<div class="glass p-4 flex items-center gap-3 pulse" style="border-color:#34d399"><span class="ibox w-11 h-11 text-xl" style="background:#34d39922;color:#34d399">${ic('check')}</span><div><div class="font-bold text-emerald-300">${t('hazirT')}</div><div class="text-sm text-slate-300">${t('hazirD')}</div></div></div>`:''}
  <div class="glass p-5">
    <div class="flex items-center gap-4">${halka}<div class="min-w-0"><div class="text-xs text-slate-400"><span class="font-mono" dir="ltr">${esc(k.takip_kodu)}</span> · <span dir="ltr">${tarih}</span></div><h2 class="text-xl font-bold truncate">${esc(k.cihaz_modeli)}</h2><div class="inline-block mt-1.5 text-sm font-semibold px-3 py-1 rounded-full" style="background:${renk}22;color:${renk}">${dn[i]}</div><div class="text-xs text-slate-400 mt-1.5">${t('step')} <span dir="ltr">${i+1} / ${N}</span></div></div></div>
    <ul class="mt-5 border-t border-white/10 pt-5">${adimlar}</ul>
    <div class="flex items-center gap-2 text-xs text-slate-500 mt-1"><span class="w-2 h-2 rounded-full bg-emerald-400 pulse"></span>${t('live')}</div>
  </div>
  <div class="glass p-5 space-y-4 text-sm">
    ${satir(t('cust'),esc(k.musteri_adi))}${satir(t('fault'),arizaHtml(k))}${satir(t('work'),esc(k.yapilan_islem)||'<span class="text-slate-500">'+t('none')+'</span>')}
    <div class="flex justify-between items-center border-t border-white/10 pt-4"><span class="flex items-center gap-2 text-slate-400">${ic('wallet')} ${t('price')}</span><span class="text-2xl font-extrabold gt" dir="ltr">${para(k.ucret, aktifPb)}</span></div>
    ${odemeHtml}
  </div>
  ${fotolar?`<div class="glass p-5 space-y-4">${fotolar}</div>`:''}`;
  $('sonuc').classList.remove('hidden');
  $('sonuc').querySelectorAll('[data-g]').forEach(im=>im.onclick=()=>lb(+im.dataset.g));
}
function lb(n){ gi=(n+galeri.length)%galeri.length; $('lbimg').src=galeri[gi]; $('lb').classList.remove('hidden'); }
$('lbp').onclick=e=>{e.stopPropagation();lb(gi-1)}; $('lbn').onclick=e=>{e.stopPropagation();lb(gi+1)}; $('lbx').onclick=$('lb').onclick=()=>$('lb').classList.add('hidden');
$('sorgu').onsubmit = e=>{e.preventDefault(); sorgula($('kod').value)};

setInterval(()=>{ if(aktif && !document.hidden) sorgula(aktif,true,aktifAnahtar); }, 10000);
document.addEventListener('visibilitychange',()=>{ if(!document.hidden && aktif) sorgula(aktif,true,aktifAnahtar); });

uygula(); ayarYukle().then(iletisim);
const qp = new URLSearchParams(location.search); let ilk = qp.get('kod'), ik = qp.get('k');
if(!ilk){ try{ ilk = localStorage.getItem('sonKod'); ik = localStorage.getItem('sonAnahtar'); }catch(e){} }
if(ilk){ $('kod').value = ilk.toUpperCase(); if(ik) sorgula(ilk,false,ik); else { hataK='anahtarIste'; $('hata').textContent=t(hataK); $('hata').classList.remove('hidden'); } }
