const $ = id => document.getElementById(id);
async function sorgula(kod){
  kod = kod.trim().toUpperCase(); if(!kod) return;
  $('hata').classList.add('hidden');
  const {data,error} = await sb.rpc('takip_sorgula',{kod});
  if(error || !data || !data.length){ $('sonuc').classList.add('hidden'); $('hata').textContent = error ? 'Bağlantı hatası, tekrar deneyin.' : 'Bu koda ait kayıt bulunamadı.'; $('hata').classList.remove('hidden'); return; }
  goster(data[0]);
}
function goster(k){
  const i = DURUMLAR.indexOf(k.durum), yuzde = Math.round(i/(DURUMLAR.length-1)*100);
  const adimlar = DURUMLAR.map((d,n)=>`<li class="flex items-center gap-3 py-1.5"><span class="w-6 h-6 rounded-full grid place-items-center text-xs ${n<i?'bg-emerald-500':n===i?'bg-indigo-500 ring-4 ring-indigo-500/30':'bg-slate-700'}">${n<i?'✓':n+1}</span><span class="${n<=i?'text-white font-medium':'text-slate-500'}">${d}</span></li>`).join('');
  const foto = (u,t)=>u?`<figure><img src="${esc(u)}" data-zoom class="rounded-xl w-full h-36 object-cover cursor-zoom-in"><figcaption class="text-xs text-slate-400 text-center mt-1">${t}</figcaption></figure>`:'';
  const fotolar = foto(k.onceki_foto_url,'Tamir Öncesi')+foto(k.sonraki_foto_url,'Tamir Sonrası');
  $('sonuc').innerHTML = `
  <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
    <div class="flex justify-between text-sm text-slate-400"><span>${esc(k.takip_kodu)}</span><span>${new Date(k.olusturma_tarihi).toLocaleDateString('tr-TR')}</span></div>
    <h2 class="text-lg font-bold mt-1">${esc(k.cihaz_modeli)}</h2>
    <div class="h-2 bg-slate-800 rounded-full mt-4 overflow-hidden"><div class="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all" style="width:${yuzde}%"></div></div>
    <p class="text-center mt-3 text-indigo-300 font-semibold">${esc(k.durum)}</p>
    <ul class="mt-3 border-t border-slate-800 pt-3">${adimlar}</ul>
  </div>
  <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 text-sm">
    <div><div class="text-slate-400">Müşteri</div><div>${esc(k.musteri_adi)}</div></div>
    <div><div class="text-slate-400">Arıza</div><div>${esc(k.ariza_aciklamasi)||'-'}</div></div>
    <div><div class="text-slate-400">Yapılan İşlem</div><div>${esc(k.yapilan_islem)||'Henüz girilmedi'}</div></div>
    <div class="flex justify-between items-center border-t border-slate-800 pt-3"><span class="text-slate-400">Ücret</span><span class="text-xl font-bold text-emerald-400">${tl(k.ucret)}</span></div>
  </div>
  ${fotolar?`<div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-2 gap-3">${fotolar}</div>`:''}`;
  $('sonuc').classList.remove('hidden');
  $('sonuc').querySelectorAll('[data-zoom]').forEach(im=>im.onclick=()=>{$('lbimg').src=im.src;$('lb').classList.remove('hidden')});
}
$('lb').onclick = ()=>$('lb').classList.add('hidden');
$('sorgu').onsubmit = e=>{e.preventDefault(); sorgula($('kod').value)};
const p = new URLSearchParams(location.search).get('kod');
if(p){ $('kod').value = p.toUpperCase(); sorgula(p); }
