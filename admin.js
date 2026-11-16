const $ = id => document.getElementById(id);
let kayitlar = [], filtre = 'hepsi';
const bek = {};
const liste = (k,t)=>{ const a = t==='once'?k.fotolar_once:k.fotolar_sonra, u = t==='once'?k.onceki_foto_url:k.sonraki_foto_url; return a&&a.length ? a : (u?[u]:[]); };
const gun = d => Math.floor((Date.now()-new Date(d))/864e5);
const bekliyor = k => k.durum==='Tamamlandı / Hazır' && k.hazir_tarihi && gun(k.hazir_tarihi)>=HAZIR_UYARI_GUN;
const thumbs = key => (bek[key]||[]).map(f=>`<img src="${f._u||(f._u=URL.createObjectURL(f))}" class="w-14 h-14 rounded-lg object-cover">`).join('');
const picker = (id,tip)=>{ const key=id+'_'+tip; return `<div class="pk" data-key="${key}"><div class="flex gap-2 flex-wrap"><button type="button" class="chip pk-cam">📷 Kamera</button><button type="button" class="chip pk-gal">🖼 Galeri</button></div><div class="flex gap-2 flex-wrap mt-2 pk-th">${thumbs(key)}</div><input type="file" accept="image/*" capture="environment" class="hidden pk-ic"><input type="file" accept="image/*" multiple class="hidden pk-ig"></div>`; };
document.addEventListener('click',e=>{ const pk=e.target.closest('.pk'); if(!pk) return;
  if(e.target.closest('.pk-cam')) pk.querySelector('.pk-ic').click(); if(e.target.closest('.pk-gal')) pk.querySelector('.pk-ig').click(); });
document.addEventListener('change',e=>{ if(!e.target.matches('.pk-ic,.pk-ig')) return;
  const pk=e.target.closest('.pk'), key=pk.dataset.key; (bek[key]=bek[key]||[]).push(...e.target.files); e.target.value=''; pk.querySelector('.pk-th').innerHTML=thumbs(key); });
$('n_pk').innerHTML = picker('yeni','once');

async function oturumKontrol(){
  const {data:{session}} = await sb.auth.getSession();
  $('giris').classList.toggle('hidden', !!session); $('panel').classList.toggle('hidden', !session);
  if(session) yukle();
}
$('girisForm').onsubmit = async e=>{ e.preventDefault();
  const {error} = await sb.auth.signInWithPassword({email:$('email').value, password:$('sifre').value});
  if(error) $('girisHata').textContent = 'Giriş başarısız: e-posta veya şifre hatalı.'; else oturumKontrol(); };
$('cikis').onclick = async()=>{ await sb.auth.signOut(); oturumKontrol(); };

async function yukle(){
  const {data,error} = await sb.from('servis_kayitlari').select('*').order('olusturma_tarihi',{ascending:false});
  if(error) return alert('Liste yüklenemedi: '+error.message);
  kayitlar = data; istatistik(); ciz();
}
function istatistik(){
  const aktif = kayitlar.filter(k=>k.durum!=='Teslim Edildi').length, bk = kayitlar.filter(bekliyor).length;
  const anahtar = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  const ciroAy = {}; kayitlar.forEach(k=>{ const a = anahtar(new Date(k.olusturma_tarihi)); ciroAy[a]=(ciroAy[a]||0)+(+k.ucret||0); });
  const simdi = new Date(), buAy = ciroAy[anahtar(simdi)]||0;
  const kt = [['📦','Toplam',kayitlar.length,'#6366f1'],['🛠️','Aktif',aktif,'#f59e0b'],['⏰','Bekleyen',bk,'#ef4444'],['💰','Bu Ay',tl(buAy),'#10b981']];
  $('kartlar').innerHTML = kt.map(([i,t,v,c])=>`<div class="glass p-4 up" style="border-top:3px solid ${c}"><div class="text-2xl">${i}</div><div class="text-xl font-extrabold mt-1">${v}</div><div class="text-xs text-slate-400">${t}</div></div>`).join('');
  const say = DURUMLAR.map(d=>kayitlar.filter(k=>k.durum===d).length), T = say.reduce((a,b)=>a+b,0);
  let ac = 0; const dil = T ? say.map((n,i)=>{ const s=ac/T*100; ac+=n; return `${D_RENK[i]} ${s}% ${ac/T*100}%`; }).join(',') : '#334155 0 100%';
  $('donut').innerHTML = `<div class="flex items-center gap-4"><div class="relative w-32 h-32 shrink-0 rounded-full" style="background:conic-gradient(${dil})"><div class="absolute inset-4 rounded-full grid place-items-center text-center" style="background:#0b1026"><div><div class="text-2xl font-extrabold">${T}</div><div class="text-[10px] text-slate-400">KAYIT</div></div></div></div>
  <div class="text-xs space-y-1">${DURUMLAR.map((d,i)=>`<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full" style="background:${D_RENK[i]}"></span>${d} <b>${say[i]}</b></div>`).join('')}</div></div>`;
  const aylar = []; for(let i=5;i>=0;i--){ const d = new Date(simdi.getFullYear(),simdi.getMonth()-i,1); aylar.push([d.toLocaleDateString('tr-TR',{month:'short'}), ciroAy[anahtar(d)]||0]); }
  const mx = Math.max(...aylar.map(a=>a[1]),1);
  $('aylik').innerHTML = `<div class="flex items-end gap-2 h-32">${aylar.map(([m,v])=>`<div class="flex-1 flex flex-col items-center justify-end h-full"><div class="text-[10px] text-slate-400 mb-1">${v?Math.round(v):''}</div><div class="bar w-full rounded-t-lg" style="height:${Math.max(v/mx*100,3)}%;background:linear-gradient(180deg,#ec4899,#6366f1)"></div><div class="text-[10px] mt-1">${m}</div></div>`).join('')}</div>`;
  const f = [['hepsi','Tümü'],['bekleyen','⏰ Bekleyen'],...DURUMLAR.map(d=>[d,d])];
  $('chips').innerHTML = f.map(([v,t])=>`<button class="chip ${filtre===v?'on':''}" data-f="${v}">${t}</button>`).join('');
}
$('chips').onclick = e=>{ const b=e.target.closest('[data-f]'); if(!b) return; filtre=b.dataset.f; istatistik(); ciz(); };
$('ara').oninput = ciz; $('sira').onchange = ciz;

function ciz(){
  const q = $('ara').value.toLowerCase(), s = $('sira').value;
  let l = kayitlar.filter(k=>[k.musteri_adi,k.musteri_tel,k.cihaz_modeli,k.takip_kodu].join(' ').toLowerCase().includes(q))
    .filter(k=> filtre==='hepsi' || (filtre==='bekleyen'?bekliyor(k):k.durum===filtre));
  if(s==='eski') l.reverse(); if(s==='ucret') l.sort((a,b)=>(b.ucret||0)-(a.ucret||0));
  $('liste').innerHTML = l.map(k=>{ const di = DURUMLAR.indexOf(k.durum), r = D_RENK[di];
  return `<div class="glass p-4 up" data-id="${k.id}" style="border-left:4px solid ${r}">
    <div class="flex justify-between items-start gap-2"><div><b class="text-lg">${esc(k.cihaz_modeli)}</b><div class="text-sm text-slate-400">${esc(k.musteri_adi)} · ${esc(k.musteri_tel)}</div></div>
    <div class="text-right"><div class="text-xs font-mono text-indigo-300">${esc(k.takip_kodu)}</div><span class="text-xs px-2 py-0.5 rounded-full" style="background:${r}33;color:${r}">${D_IKON[di]} ${esc(k.durum)}</span></div></div>
    ${bekliyor(k)?`<div class="mt-2 text-xs bg-rose-500/20 text-rose-300 rounded-lg px-3 py-2">⚠️ Hazır, ${gun(k.hazir_tarihi)} gündür teslim alınmadı</div>`:''}
    <div class="text-sm mt-2 text-slate-300">${esc(k.ariza_aciklamasi)}</div>
    <div class="grid sm:grid-cols-2 gap-2 mt-3">
      <select class="inp f-durum">${DURUMLAR.map(d=>`<option ${d===k.durum?'selected':''}>${d}</option>`).join('')}</select>
      <input type="number" step="0.01" class="inp f-ucret" value="${k.ucret||0}">
      <textarea class="inp f-islem sm:col-span-2" rows="2" placeholder="Yapılan işlem">${esc(k.yapilan_islem)}</textarea>
      <div><div class="text-xs text-slate-400 mb-1">Öncesi (${liste(k,'once').length})</div>${picker(k.id,'once')}</div>
      <div><div class="text-xs text-slate-400 mb-1">Sonrası (${liste(k,'sonra').length})</div>${picker(k.id,'sonra')}</div>
    </div>
    <div class="flex flex-wrap gap-2 mt-3">
      <button class="btn grad b-kaydet">Güncelle</button>
      <button class="btn grad-g b-wa">WhatsApp'tan Gönder</button>
      ${bekliyor(k)?'<button class="btn b-hat" style="background:#ef4444">⏰ Hatırlat</button>':''}
      ${k.onceki_foto_url&&k.sonraki_foto_url?'<button class="btn b-gorsel" style="background:#db2777">Sosyal Medya Görseli</button>':''}
      <button class="btn b-sil ml-auto" style="background:#334155">Sil</button>
    </div></div>`; }).join('') || '<p class="text-center text-slate-500 py-6">Kayıt yok.</p>';
}
async function yukleHepsi(files,kod,tip){ const u=[]; for(const f of files) u.push(await fotoYukle(f,kod,tip)); return u; }

$('yeniForm').onsubmit = async e=>{
  e.preventDefault(); const btn=$('n_btn'); btn.disabled=true; btn.textContent='Kaydediliyor...';
  try{
    let kod, hata, satir;
    for(let i=0;i<8;i++){
      kod = kodUret();
      ({data:satir,error:hata} = await sb.from('servis_kayitlari').insert({takip_kodu:kod,musteri_adi:$('n_ad').value.trim(),musteri_tel:$('n_tel').value.trim(),cihaz_modeli:$('n_model').value.trim(),ariza_aciklamasi:$('n_ariza').value.trim(),ucret:+$('n_ucret').value||0}).select().single());
      if(!hata || hata.code!=='23505') break;
    }
    if(hata) throw hata;
    const fl = bek['yeni_once']||[];
    if(fl.length){ const u = await yukleHepsi(fl,kod,'once'); const {error} = await sb.from('servis_kayitlari').update({fotolar_once:u,onceki_foto_url:u[0]}).eq('id',satir.id); if(error) throw error; }
    delete bek['yeni_once']; e.target.reset(); $('n_pk').innerHTML = picker('yeni','once'); await yukle();
  }catch(err){ alert('Hata: '+err.message); }
  btn.disabled=false; btn.textContent='Kaydet';
};

$('liste').onclick = async e=>{
  const kart = e.target.closest('[data-id]'); if(!kart) return;
  const k = kayitlar.find(x=>x.id===kart.dataset.id), b = e.target.closest('button'); if(!b) return;
  if(b.classList.contains('b-kaydet')){
    b.disabled=true; b.textContent='...';
    try{
      const durum = kart.querySelector('.f-durum').value;
      const upd = {durum, ucret:+kart.querySelector('.f-ucret').value||0, yapilan_islem:kart.querySelector('.f-islem').value};
      if(durum==='Tamamlandı / Hazır'){ if(k.durum!==durum || !k.hazir_tarihi) upd.hazir_tarihi = new Date().toISOString(); } else upd.hazir_tarihi = null;
      for(const t of ['once','sonra']){ const key=k.id+'_'+t, fl=bek[key]||[];
        if(fl.length){ const yeni = [...liste(k,t), ...await yukleHepsi(fl,k.takip_kodu,t)];
          upd[t==='once'?'fotolar_once':'fotolar_sonra']=yeni; upd[t==='once'?'onceki_foto_url':'sonraki_foto_url']=yeni[0]; delete bek[key]; } }
      const {error} = await sb.from('servis_kayitlari').update(upd).eq('id',k.id);
      if(error) throw error; await yukle();
    }catch(err){ alert('Hata: '+err.message); b.disabled=false; b.textContent='Güncelle'; }
  }
  if(b.classList.contains('b-wa')||b.classList.contains('b-hat')){
    const m = b.classList.contains('b-hat')
      ? `Merhaba ${k.musteri_adi},\n\n✅ *${k.cihaz_modeli}* cihazınız hazır ve teslim almanızı bekliyor.\n💰 Ücret: ${tl(k.ucret)}\n🕒 ${SERVIS_SAAT}\n\nDetay: ${takipLinki(k.takip_kodu)}\n\n${SERVIS_ADI}`
      : `Merhaba ${k.musteri_adi},\n\n📱 *${k.cihaz_modeli}* cihazınızın durumu: *${k.durum}*\n💰 Ücret: ${tl(k.ucret)}\n\nCihazınızı anlık takip edin:\n${takipLinki(k.takip_kodu)}\n\n${SERVIS_ADI}`;
    window.open(`https://wa.me/${telNo(k.musteri_tel)}?text=${encodeURIComponent(m)}`,'_blank');
  }
  if(b.classList.contains('b-gorsel')) sosyalGorsel(k);
  if(b.classList.contains('b-sil') && confirm('Bu kayıt silinsin mi?')){
    const {error} = await sb.from('servis_kayitlari').delete().eq('id',k.id);
    if(error) alert(error.message); else yukle();
  }
};

const resimYukle = u => new Promise((res,rej)=>{const i=new Image();i.crossOrigin='anonymous';i.onload=()=>res(i);i.onerror=()=>rej(new Error('Görsel yüklenemedi'));i.src=u+'?t='+Date.now()});
function kapla(ctx,img,x,y,w,h){ const r=Math.max(w/img.width,h/img.height), sw=w/r, sh=h/r;
  ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip(); ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,x,y,w,h); ctx.restore(); }
async function sosyalGorsel(k){
  try{
    const [a,b] = await Promise.all([resimYukle(k.onceki_foto_url),resimYukle(k.sonraki_foto_url)]);
    const W=1080,H=1350,c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d');
    const g=x.createLinearGradient(0,0,W,H); g.addColorStop(0,'#1e1b4b'); g.addColorStop(1,'#831843'); x.fillStyle=g; x.fillRect(0,0,W,H);
    const ph=600; kapla(x,a,0,0,W,ph); kapla(x,b,0,ph+150,W,ph);
    const etiket=(t,y,renk)=>{x.fillStyle=renk;x.fillRect(40,y,260,64);x.fillStyle='#fff';x.font='bold 36px sans-serif';x.textAlign='left';x.textBaseline='middle';x.fillText(t,64,y+33)};
    etiket('ÖNCESİ',30,'rgba(225,29,72,.92)'); etiket('SONRASI',ph+150+30,'rgba(16,185,129,.92)');
    x.fillStyle='#fff'; x.textAlign='center'; x.font='bold 54px sans-serif'; x.fillText(k.cihaz_modeli,W/2,ph+75);
    x.textAlign='right'; x.globalAlpha=.75; x.font='bold 36px sans-serif'; x.fillText('🔧 '+SERVIS_ADI,W-40,H-40); x.globalAlpha=1;
    c.toBlob(bl=>{const l=document.createElement('a');l.href=URL.createObjectURL(bl);l.download=`${k.takip_kodu}-oncesi-sonrasi.jpg`;l.click()},'image/jpeg',.92);
  }catch(err){ alert('Görsel oluşturulamadı: '+err.message); }
}
oturumKontrol();
