const $ = id => document.getElementById(id);
let galeri = [], gi = 0;
$('logo').innerHTML = ic('wrench','text-white'); $('sbtn').innerHTML = ic('search')+' Sorgula';
function iletisim(){
  const A = AYAR; document.title = A.servis_adi+' | Cihaz Takip'; $('baslik').textContent = A.servis_adi;
  const harita = A.harita || (A.adres ? 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(A.adres) : '');
  const b = [A.tel?`<a href="tel:+${telNo(A.tel)}" class="btn grad">${ic('phone')} Ara</a>`:'', A.tel?`<a href="https://wa.me/${telNo(A.tel)}" target="_blank" class="btn grad-g">${ic('chat')} WhatsApp</a>`:'', harita?`<a href="${esc(harita)}" target="_blank" class="btn ghost">${ic('pin')} Yol Tarifi</a>`:''].filter(Boolean);
  if(!b.length && !A.adres){ $('iletisim').classList.add('hidden'); return; }
  $('iletisim').innerHTML = `<div class="font-bold text-base mb-2">${esc(A.servis_adi)}</div>
  ${A.adres?`<div class="flex gap-2 text-slate-300">${ic('pin','mt-0.5 text-fuchsia-300')}<span>${esc(A.adres)}</span></div>`:''}
  ${A.saat?`<div class="flex gap-2 text-slate-300 mt-1.5">${ic('clock','mt-0.5 text-cyan-300')}<span>${esc(A.saat)}</span></div>`:''}
  ${A.tel?`<div class="flex gap-2 text-slate-300 mt-1.5">${ic('phone','mt-0.5 text-emerald-300')}<span>${esc(A.tel)}</span></div>`:''}
  <div class="grid grid-cols-${b.length} gap-2 mt-4">${b.join('')}</div>`;
}
async function sorgula(kod){
  kod = kod.trim().toUpperCase(); if(!kod) return;
  $('hata').classList.add('hidden');
  const {data,error} = await sb.rpc('takip_sorgula',{kod});
  if(error || !data || !data.length){ $('sonuc').classList.add('hidden'); $('hata').textContent = error ? 'Bağlantı hatası, tekrar deneyin.' : 'Bu koda ait kayıt bulunamadı.'; $('hata').classList.remove('hidden'); return; }
  goster(data[0]);
}
function goster(k){
  const i = DURUMLAR.indexOf(k.durum), renk = D_RENK[i], N = DURUMLAR.length, p = (i+1)/N*100, hazir = i===4;
  const halka = `<div class="relative w-28 h-28 shrink-0"><svg viewBox="0 0 100 100" class="w-28 h-28 -rotate-90"><circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,.1)" stroke-width="9" fill="none"/><circle class="ringa" cx="50" cy="50" r="42" stroke="${renk}" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="${2.64*p} 264" style="filter:drop-shadow(0 0 7px ${renk})"/></svg><div class="absolute inset-0 grid place-items-center text-3xl" style="color:${renk}">${ic(D_IKON[i])}</div></div>`;
  const adimlar = DURUMLAR.map((d,n)=>`<li class="flex gap-3"><div class="flex flex-col items-center"><span class="ibox w-9 h-9 rounded-full ${n===i?'pulse':''}" style="${n<=i?`background:${D_RENK[n]}22;color:${D_RENK[n]};border:1.5px solid ${D_RENK[n]}`:'background:rgba(255,255,255,.04);color:#475569;border:1.5px solid rgba(255,255,255,.08)'}">${n<i?ic('check'):ic(D_IKON[n])}</span>${n<N-1?`<span class="w-0.5 flex-1 min-h-4" style="background:${n<i?D_RENK[n]:'rgba(255,255,255,.08)'}"></span>`:''}</div><div class="pb-4 pt-1.5 ${n<=i?'text-white font-medium':'text-slate-500'}">${d}${n===i?'<div class="text-xs font-normal" style="color:'+renk+'">Şu anki aşama</div>':''}</div></li>`).join('');
  galeri = [];
  const grup = (arr,t)=>{ if(!arr||!arr.length) return ''; const bas = galeri.length; galeri.push(...arr);
    return `<div><div class="text-xs text-slate-400 mb-2 flex items-center gap-1.5">${ic('camera')} ${t}</div><div class="flex gap-2 overflow-x-auto pb-1">${arr.map((u,n)=>`<img src="${esc(u)}" data-g="${bas+n}" class="h-28 w-28 shrink-0 rounded-2xl object-cover cursor-zoom-in border border-white/10">`).join('')}</div></div>`; };
  const fotolar = grup(k.fotolar_once,'Tamir Öncesi') + grup(k.fotolar_sonra,'Tamir Sonrası');
  const satir = (t,v)=>`<div><div class="text-xs uppercase tracking-wide text-slate-500">${t}</div><div class="mt-0.5">${v}</div></div>`;
  $('sonuc').innerHTML = `
  ${hazir?`<div class="glass p-4 flex items-center gap-3 pulse" style="border-color:#34d399"><span class="ibox w-11 h-11 text-xl" style="background:#34d39922;color:#34d399">${ic('check')}</span><div><div class="font-bold text-emerald-300">Cihazınız hazır</div><div class="text-sm text-slate-300">Dilediğiniz zaman teslim alabilirsiniz.</div></div></div>`:''}
  <div class="glass p-5 up">
    <div class="flex items-center gap-4">${halka}<div class="min-w-0"><div class="text-xs font-mono text-slate-400">${esc(k.takip_kodu)} · ${new Date(k.olusturma_tarihi).toLocaleDateString('tr-TR')}</div><h2 class="text-xl font-bold truncate">${esc(k.cihaz_modeli)}</h2><div class="inline-block mt-1.5 text-sm font-semibold px-3 py-1 rounded-full" style="background:${renk}22;color:${renk}">${esc(k.durum)}</div><div class="text-xs text-slate-400 mt-1.5">Adım ${i+1} / ${N}</div></div></div>
    <ul class="mt-5 border-t border-white/10 pt-5">${adimlar}</ul>
  </div>
  <div class="glass p-5 space-y-4 text-sm up">
    ${satir('Müşteri',esc(k.musteri_adi))}${satir('Arıza',esc(k.ariza_aciklamasi)||'-')}${satir('Yapılan İşlem',esc(k.yapilan_islem)||'<span class="text-slate-500">Henüz girilmedi</span>')}
    <div class="flex justify-between items-center border-t border-white/10 pt-4"><span class="flex items-center gap-2 text-slate-400">${ic('wallet')} Ücret</span><span class="text-2xl font-extrabold gt">${tl(k.ucret)}</span></div>
  </div>
  ${fotolar?`<div class="glass p-5 space-y-4 up">${fotolar}</div>`:''}`;
  $('sonuc').classList.remove('hidden');
  $('sonuc').querySelectorAll('[data-g]').forEach(im=>im.onclick=()=>lb(+im.dataset.g));
}
function lb(n){ gi=(n+galeri.length)%galeri.length; $('lbimg').src=galeri[gi]; $('lb').classList.remove('hidden'); }
$('lbp').onclick=e=>{e.stopPropagation();lb(gi-1)}; $('lbn').onclick=e=>{e.stopPropagation();lb(gi+1)}; $('lbx').onclick=$('lb').onclick=()=>$('lb').classList.add('hidden');
$('sorgu').onsubmit = e=>{e.preventDefault(); sorgula($('kod').value)};
ayarYukle().then(iletisim);
const p = new URLSearchParams(location.search).get('kod');
if(p){ $('kod').value = p.toUpperCase(); sorgula(p); }
