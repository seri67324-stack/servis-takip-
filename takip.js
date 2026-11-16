const $ = id => document.getElementById(id);
let galeri = [], gi = 0;
$('iletisim').innerHTML = `<div class="font-semibold mb-1">📞 Bize Ulaşın</div>
<div class="text-slate-400">${esc(SERVIS_ADRES)}<br>🕒 ${esc(SERVIS_SAAT)}</div>
<div class="grid grid-cols-3 gap-2 mt-3">
<a href="tel:+${telNo(SERVIS_TEL)}" class="btn grad text-center">📞 Ara</a>
<a href="https://wa.me/${telNo(SERVIS_TEL)}" target="_blank" class="btn grad-g text-center">💬 Yaz</a>
<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SERVIS_ADRES)}" target="_blank" class="btn text-center" style="background:#f59e0b">📍 Konum</a></div>`;
async function sorgula(kod){
  kod = kod.trim().toUpperCase(); if(!kod) return;
  $('hata').classList.add('hidden');
  const {data,error} = await sb.rpc('takip_sorgula',{kod});
  if(error || !data || !data.length){ $('sonuc').classList.add('hidden'); $('hata').textContent = error ? 'Bağlantı hatası, tekrar deneyin.' : 'Bu koda ait kayıt bulunamadı.'; $('hata').classList.remove('hidden'); return; }
  goster(data[0]);
}
function goster(k){
  const i = DURUMLAR.indexOf(k.durum), yuzde = Math.round(i/(DURUMLAR.length-1)*100), renk = D_RENK[i];
  const hazir = i === 4;
  const adimlar = DURUMLAR.map((d,n)=>`<li class="flex items-center gap-3 py-2"><span class="w-9 h-9 rounded-full grid place-items-center text-base ${n===i?'pulse':''}" style="background:${n<=i?D_RENK[n]:'rgba(255,255,255,.08)'};${n===i?'box-shadow:0 0 18px '+D_RENK[n]:''}">${n<i?'✓':D_IKON[n]}</span><span class="${n<=i?'text-white font-medium':'text-slate-500'}">${d}</span></li>`).join('');
  galeri = [];
  const grup = (arr,t)=>{ if(!arr||!arr.length) return ''; const bas = galeri.length; galeri.push(...arr);
    return `<div><div class="text-xs text-slate-400 mb-1">${t}</div><div class="flex gap-2 overflow-x-auto pb-1">${arr.map((u,n)=>`<img src="${esc(u)}" data-g="${bas+n}" class="h-28 w-28 shrink-0 rounded-xl object-cover cursor-zoom-in border border-white/10">`).join('')}</div></div>`; };
  const fotolar = grup(k.fotolar_once,'📷 Tamir Öncesi') + grup(k.fotolar_sonra,'✨ Tamir Sonrası');
  $('sonuc').innerHTML = `
  ${hazir?`<div class="glass p-4 text-center pulse" style="border-color:#10b981"><div class="text-3xl">🎉</div><div class="font-bold text-emerald-300">Cihazınız hazır!</div><div class="text-sm text-slate-300">Dilediğiniz zaman teslim alabilirsiniz.</div></div>`:''}
  <div class="glass p-5 up">
    <div class="flex justify-between text-xs text-slate-400"><span class="font-mono">${esc(k.takip_kodu)}</span><span>${new Date(k.olusturma_tarihi).toLocaleDateString('tr-TR')}</span></div>
    <h2 class="text-xl font-bold mt-1">${esc(k.cihaz_modeli)}</h2>
    <div class="h-3 bg-white/10 rounded-full mt-4 overflow-hidden"><div class="h-full rounded-full fill" style="width:${yuzde}%;background:linear-gradient(90deg,#6366f1,${renk});box-shadow:0 0 14px ${renk}"></div></div>
    <p class="text-center mt-3 font-bold text-lg" style="color:${renk}">${D_IKON[i]} ${esc(k.durum)}</p>
    <ul class="mt-3 border-t border-white/10 pt-3">${adimlar}</ul>
  </div>
  <div class="glass p-5 space-y-3 text-sm up">
    <div><div class="text-slate-400">Müşteri</div><div>${esc(k.musteri_adi)}</div></div>
    <div><div class="text-slate-400">Arıza</div><div>${esc(k.ariza_aciklamasi)||'-'}</div></div>
    <div><div class="text-slate-400">Yapılan İşlem</div><div>${esc(k.yapilan_islem)||'Henüz girilmedi'}</div></div>
    <div class="flex justify-between items-center border-t border-white/10 pt-3"><span class="text-slate-400">Ücret</span><span class="text-2xl font-extrabold gt">${tl(k.ucret)}</span></div>
  </div>
  ${fotolar?`<div class="glass p-5 space-y-3 up">${fotolar}</div>`:''}`;
  $('sonuc').classList.remove('hidden');
  $('sonuc').querySelectorAll('[data-g]').forEach(im=>im.onclick=()=>lb(+im.dataset.g));
}
function lb(n){ gi=(n+galeri.length)%galeri.length; $('lbimg').src=galeri[gi]; $('lb').classList.remove('hidden'); }
$('lbp').onclick=e=>{e.stopPropagation();lb(gi-1)}; $('lbn').onclick=e=>{e.stopPropagation();lb(gi+1)}; $('lbx').onclick=$('lb').onclick=()=>$('lb').classList.add('hidden');
$('sorgu').onsubmit = e=>{e.preventDefault(); sorgula($('kod').value)};
const p = new URLSearchParams(location.search).get('kod');
if(p){ $('kod').value = p.toUpperCase(); sorgula(p); }
