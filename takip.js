const $ = id => document.getElementById(id);
const TR = { sub:'Cihazınızın durumunu anlık izleyin', ph:'Takip kodu (SRV-1234)', btn:'Sorgula', nf:'Bu koda ait kayıt bulunamadı.', conn:'Bağlantı hatası, tekrar deneyin.',
  hazirT:'Cihazınız hazır', hazirD:'Dilediğiniz zaman teslim alabilirsiniz.', step:'Adım', cust:'Müşteri', fault:'Arıza', work:'Yapılan İşlem', none:'Henüz girilmedi', price:'Ücret',
  before:'Tamir Öncesi', after:'Tamir Sonrası', now:'Şu anki aşama', call:'Ara', wa:'WhatsApp', route:'Yol Tarifi', live:'Canlı takip', title:'Cihaz Takip',
  d:['Kabul Edildi','İnceleniyor','Parça Bekleniyor','Onarımda','Tamamlandı / Hazır','Teslim Edildi'], loc:'tr-TR' };
const AR = { sub:'تابع حالة جهازك لحظة بلحظة', ph:'رمز التتبع (SRV-1234)', btn:'بحث', nf:'لم يتم العثور على سجل بهذا الرمز.', conn:'خطأ في الاتصال، حاول مرة أخرى.',
  hazirT:'جهازك جاهز', hazirD:'يمكنك استلامه في أي وقت.', step:'المرحلة', cust:'العميل', fault:'العطل', work:'الإجراء المنفذ', none:'لم يتم إدخاله بعد', price:'التكلفة',
  before:'قبل الإصلاح', after:'بعد الإصلاح', now:'المرحلة الحالية', call:'اتصال', wa:'واتساب', route:'الاتجاهات', live:'تحديث تلقائي', title:'تتبع الجهاز',
  d:['تم الاستلام','قيد الفحص','بانتظار قطعة الغيار','قيد الإصلاح','اكتمل / جاهز','تم التسليم'], loc:'ar-u-nu-latn' };
const TT = {tr:TR, ar:AR};
let L = 'tr'; try{ L = localStorage.getItem('dil')==='ar' ? 'ar' : 'tr'; }catch(e){}
const t = k => TT[L][k];
const para = n => L==='ar' ? Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})+' ₺' : tl(n);
let galeri = [], gi = 0, son = null, sonJs = '', aktif = '', hataK = '';
$('logo').innerHTML = ic('wrench','text-white');

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
  $('altbaslik').textContent = t('sub'); $('kod').placeholder = t('ph'); $('sbtn').innerHTML = ic('search')+' '+t('btn');
  document.querySelectorAll('[data-l]').forEach(b=>b.classList.toggle('on', b.dataset.l===L));
  iletisim(); if(son) goster(son); if(hataK) $('hata').textContent = t(hataK);
}
document.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{ L=b.dataset.l; try{localStorage.setItem('dil',L)}catch(e){} uygula(); });

async function sorgula(kod, sessiz){
  kod = kod.trim().toUpperCase(); if(!kod) return;
  const {data,error} = await sb.rpc('takip_sorgula',{kod});
  if(error || !data || !data.length){
    if(sessiz) return;
    if(!error){ try{localStorage.removeItem('sonKod')}catch(e){} aktif=''; }
    son=null; sonJs=''; $('sonuc').classList.add('hidden'); hataK = error?'conn':'nf'; $('hata').textContent = t(hataK); $('hata').classList.remove('hidden'); return;
  }
  aktif = kod; hataK=''; $('hata').classList.add('hidden');
  try{ localStorage.setItem('sonKod',kod); history.replaceState(null,'','?kod='+encodeURIComponent(kod)); }catch(e){}
  const js = JSON.stringify(data[0]); if(sessiz && js===sonJs) return;
  sonJs = js; son = data[0]; goster(son);
}
function goster(k){
  const i = DURUMLAR.indexOf(k.durum), renk = D_RENK[i], N = DURUMLAR.length, p = (i+1)/N*100, hazir = i===4, dn = t('d');
  const halka = `<div class="relative w-28 h-28 shrink-0"><svg viewBox="0 0 100 100" class="w-28 h-28 -rotate-90"><circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,.1)" stroke-width="9" fill="none"/><circle class="ringa" cx="50" cy="50" r="42" stroke="${renk}" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="${2.64*p} 264" style="filter:drop-shadow(0 0 7px ${renk})"/></svg><div class="absolute inset-0 grid place-items-center text-3xl" style="color:${renk}">${ic(D_IKON[i])}</div></div>`;
  const adimlar = dn.map((d,n)=>`<li class="flex gap-3"><div class="flex flex-col items-center"><span class="ibox w-9 h-9 rounded-full ${n===i?'pulse':''}" style="${n<=i?`background:${D_RENK[n]}22;color:${D_RENK[n]};border:1.5px solid ${D_RENK[n]}`:'background:rgba(255,255,255,.04);color:#475569;border:1.5px solid rgba(255,255,255,.08)'}">${n<i?ic('check'):ic(D_IKON[n])}</span>${n<N-1?`<span class="w-0.5 flex-1 min-h-4" style="background:${n<i?D_RENK[n]:'rgba(255,255,255,.08)'}"></span>`:''}</div><div class="pb-4 pt-1.5 ${n<=i?'text-white font-medium':'text-slate-500'}">${d}${n===i?'<div class="text-xs font-normal" style="color:'+renk+'">'+t('now')+'</div>':''}</div></li>`).join('');
  galeri = [];
  const grup = (arr,tt)=>{ if(!arr||!arr.length) return ''; const bas = galeri.length; galeri.push(...arr);
    return `<div><div class="text-xs text-slate-400 mb-2 flex items-center gap-1.5">${ic('camera')} ${tt}</div><div class="flex gap-2 overflow-x-auto pb-1">${arr.map((u,n)=>`<img src="${esc(u)}" data-g="${bas+n}" class="h-28 w-28 shrink-0 rounded-2xl object-cover cursor-zoom-in border border-white/10">`).join('')}</div></div>`; };
  const fotolar = grup(k.fotolar_once,t('before')) + grup(k.fotolar_sonra,t('after'));
  const satir = (a,v)=>`<div><div class="text-xs uppercase tracking-wide text-slate-500">${a}</div><div class="mt-0.5">${v}</div></div>`;
  const tarih = new Date(k.olusturma_tarihi).toLocaleDateString(t('loc'));
  $('sonuc').innerHTML = `
  ${hazir?`<div class="glass p-4 flex items-center gap-3 pulse" style="border-color:#34d399"><span class="ibox w-11 h-11 text-xl" style="background:#34d39922;color:#34d399">${ic('check')}</span><div><div class="font-bold text-emerald-300">${t('hazirT')}</div><div class="text-sm text-slate-300">${t('hazirD')}</div></div></div>`:''}
  <div class="glass p-5">
    <div class="flex items-center gap-4">${halka}<div class="min-w-0"><div class="text-xs text-slate-400"><span class="font-mono" dir="ltr">${esc(k.takip_kodu)}</span> · ${tarih}</div><h2 class="text-xl font-bold truncate">${esc(k.cihaz_modeli)}</h2><div class="inline-block mt-1.5 text-sm font-semibold px-3 py-1 rounded-full" style="background:${renk}22;color:${renk}">${dn[i]}</div><div class="text-xs text-slate-400 mt-1.5">${t('step')} ${i+1} / ${N}</div></div></div>
    <ul class="mt-5 border-t border-white/10 pt-5">${adimlar}</ul>
    <div class="flex items-center gap-2 text-xs text-slate-500 mt-1"><span class="w-2 h-2 rounded-full bg-emerald-400 pulse"></span>${t('live')}</div>
  </div>
  <div class="glass p-5 space-y-4 text-sm">
    ${satir(t('cust'),esc(k.musteri_adi))}${satir(t('fault'),esc(k.ariza_aciklamasi)||'-')}${satir(t('work'),esc(k.yapilan_islem)||'<span class="text-slate-500">'+t('none')+'</span>')}
    <div class="flex justify-between items-center border-t border-white/10 pt-4"><span class="flex items-center gap-2 text-slate-400">${ic('wallet')} ${t('price')}</span><span class="text-2xl font-extrabold gt" dir="ltr">${para(k.ucret)}</span></div>
  </div>
  ${fotolar?`<div class="glass p-5 space-y-4">${fotolar}</div>`:''}`;
  $('sonuc').classList.remove('hidden');
  $('sonuc').querySelectorAll('[data-g]').forEach(im=>im.onclick=()=>lb(+im.dataset.g));
}
function lb(n){ gi=(n+galeri.length)%galeri.length; $('lbimg').src=galeri[gi]; $('lb').classList.remove('hidden'); }
$('lbp').onclick=e=>{e.stopPropagation();lb(gi-1)}; $('lbn').onclick=e=>{e.stopPropagation();lb(gi+1)}; $('lbx').onclick=$('lb').onclick=()=>$('lb').classList.add('hidden');
$('sorgu').onsubmit = e=>{e.preventDefault(); sorgula($('kod').value)};

// Otomatik yenileme: sayfayı yenilemeden durum değişince ekran güncellenir
setInterval(()=>{ if(aktif && !document.hidden) sorgula(aktif,true); }, 10000);
document.addEventListener('visibilitychange',()=>{ if(!document.hidden && aktif) sorgula(aktif,true); });

uygula(); ayarYukle().then(iletisim);
let ilk = new URLSearchParams(location.search).get('kod'); if(!ilk){ try{ ilk = localStorage.getItem('sonKod'); }catch(e){} }
if(ilk){ $('kod').value = ilk.toUpperCase(); sorgula(ilk); }
