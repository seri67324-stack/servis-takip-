const $ = id => document.getElementById(id);
let kayitlar = [], filtre = 'hepsi';
const bek = {};
$('glogo').innerHTML = $('plogo').innerHTML = ic('wrench');
$('s_konum').innerHTML = ic('pin')+' Şu anki konumumu kullan'; $('s_btn').innerHTML = ic('save')+' Bilgileri Kaydet'; $('n_btn').innerHTML = ic('save')+' Kaydet';
const liste = (k,t)=>{ const a = t==='once'?k.fotolar_once:k.fotolar_sonra, u = t==='once'?k.onceki_foto_url:k.sonraki_foto_url; return a&&a.length ? a : (u?[u]:[]); };
const gun = d => Math.floor((Date.now()-new Date(d))/864e5);
const bekliyor = k => k.durum==='Tamamlandı / Hazır' && k.hazir_tarihi && gun(k.hazir_tarihi)>=HAZIR_UYARI_GUN;
const thumbs = key => (bek[key]||[]).map(f=>`<img src="${f._u||(f._u=URL.createObjectURL(f))}" class="w-14 h-14 rounded-xl object-cover border border-white/10">`).join('');
const picker = (id,tip)=>{ const key=id+'_'+tip; return `<div class="pk" data-key="${key}"><div class="flex gap-2 flex-wrap"><button type="button" class="chip pk-cam">${ic('camera')} Kamera</button><button type="button" class="chip pk-gal">${ic('image')} Galeri</button></div><div class="flex gap-2 flex-wrap mt-2 pk-th">${thumbs(key)}</div><input type="file" accept="image/*" capture="environment" class="hidden pk-ic"><input type="file" accept="image/*" multiple class="hidden pk-ig"></div>`; };
document.addEventListener('click',e=>{ const pk=e.target.closest('.pk'); if(!pk) return;
  if(e.target.closest('.pk-cam')) pk.querySelector('.pk-ic').click(); if(e.target.closest('.pk-gal')) pk.querySelector('.pk-ig').click(); });
document.addEventListener('change',e=>{ if(!e.target.matches('.pk-ic,.pk-ig')) return;
  const pk=e.target.closest('.pk'), key=pk.dataset.key; (bek[key]=bek[key]||[]).push(...e.target.files); e.target.value=''; pk.querySelector('.pk-th').innerHTML=thumbs(key); });
$('n_pk').innerHTML = picker('yeni','once');

async function oturumKontrol(){
  const {data:{session}} = await sb.auth.getSession();
  $('giris').classList.toggle('hidden', !!session); $('panel').classList.toggle('hidden', !session);
  if(session){ yukle(); ayarYukle().then(A=>{ $('s_adi').value=A.servis_adi||''; $('s_tel').value=A.tel||''; $('s_adres').value=A.adres||''; $('s_saat').value=A.saat||''; $('s_harita').value=A.harita||''; }); }
}
$('girisForm').onsubmit = async e=>{ e.preventDefault();
  const {error} = await sb.auth.signInWithPassword({email:$('email').value, password:$('sifre').value});
  if(error) $('girisHata').textContent = 'Giriş başarısız: e-posta veya şifre hatalı.'; else oturumKontrol(); };
$('cikis').onclick = async()=>{ await sb.auth.signOut(); oturumKontrol(); };
$('s_konum').onclick = ()=> navigator.geolocation.getCurrentPosition(p=>{ $('s_harita').value=`https://www.google.com/maps?q=${p.coords.latitude},${p.coords.longitude}`; }, ()=>alert('Konum alınamadı. Tarayıcıda konum iznini açın veya Google Haritalar linkini yapıştırın.'));
$('ayarForm').onsubmit = async e=>{ e.preventDefault();
  const row = {id:1, servis_adi:$('s_adi').value.trim(), tel:$('s_tel').value.trim(), adres:$('s_adres').value.trim(), saat:$('s_saat').value.trim(), harita:$('s_harita').value.trim()};
  const {error} = await sb.from('ayarlar').upsert(row); if(error) return alert('Hata: '+error.message+'\n(guncelleme2.sql çalıştırıldı mı?)');
  Object.assign(AYAR,row); alert('Servis bilgileri kaydedildi.'); };

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
  const kt = [['layers','Toplam Kayıt',kayitlar.length,'#818cf8'],['wrench','Aktif Cihaz',aktif,'#fbbf24'],['alert','Teslim Bekleyen',bk,'#f87171'],['wallet','Bu Ay Ciro',tl(buAy),'#34d399']];
  $('kartlar').innerHTML = kt.map(([i,t,v,c])=>`<div class="glass p-4 up"><div class="ibox w-10 h-10 text-lg" style="background:${c}22;color:${c}">${ic(i)}</div><div class="text-xl font-extrabold mt-3">${v}</div><div class="text-xs text-slate-400">${t}</div></div>`).join('');
  const say = DURUMLAR.map(d=>kayitlar.filter(k=>k.durum===d).length), T = say.reduce((a,b)=>a+b,0);
  let ac = 0; const dil = T ? say.map((n,i)=>{ const s=ac/T*100; ac+=n; return `${D_RENK[i]} ${s}% ${ac/T*100}%`; }).join(',') : '#1e293b 0 100%';
  $('donut').innerHTML = `<div class="flex items-center gap-5"><div class="relative w-32 h-32 shrink-0 rounded-full" style="background:conic-gradient(${dil});box-shadow:0 0 30px rgba(99,102,241,.25)"><div class="absolute inset-3.5 rounded-full grid place-items-center text-center" style="background:#0a0f24"><div><div class="text-2xl font-extrabold">${T}</div><div class="text-[10px] text-slate-400 tracking-widest">KAYIT</div></div></div></div>
  <div class="text-xs space-y-1.5 flex-1">${DURUMLAR.map((d,i)=>`<div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full" style="background:${D_RENK[i]}"></span><span class="flex-1 text-slate-300">${d}</span><b>${say[i]}</b></div>`).join('')}</div></div>`;
  const aylar = []; for(let i=5;i>=0;i--){ const d = new Date(simdi.getFullYear(),simdi.getMonth()-i,1); aylar.push([d.toLocaleDateString('tr-TR',{month:'short'}), ciroAy[anahtar(d)]||0]); }
  const mx = Math.max(...aylar.map(a=>a[1]),1), W=300, H=130, P=18;
  const pts = aylar.map(([m,v],i)=>[P+i*(W-2*P)/5, H-24-(v/mx)*(H-56)]), ln = pts.map(p=>p.join(',')).join(' L');
  $('aylik').innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="w-full"><defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a78bfa" stop-opacity=".55"/><stop offset="1" stop-color="#a78bfa" stop-opacity="0"/></linearGradient><linearGradient id="lg" x1="0" x2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs>
  ${[0,1,2].map(n=>`<line x1="${P}" x2="${W-P}" y1="${H-24-n*(H-56)/2}" y2="${H-24-n*(H-56)/2}" stroke="rgba(255,255,255,.07)"/>`).join('')}
  <path d="M${ln} L${pts[5][0]},${H-24} L${pts[0][0]},${H-24}Z" fill="url(#ag)"/><path class="draw" d="M${ln}" fill="none" stroke="url(#lg)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  ${pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#0a0f24" stroke="#f0abfc" stroke-width="2"/><text x="${p[0]}" y="${p[1]-9}" fill="#cbd5e1" font-size="9" text-anchor="middle">${aylar[i][1]?Math.round(aylar[i][1]):''}</text><text x="${p[0]}" y="${H-8}" fill="#94a3b8" font-size="10" text-anchor="middle">${aylar[i][0]}</text>`).join('')}</svg>`;
  const f = [['hepsi','Tümü'],['bekleyen','Teslim Bekleyen'],...DURUMLAR.map(d=>[d,d])];
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
  return `<div class="glass p-4 up" data-id="${k.id}">
    <div class="flex gap-3 items-start"><span class="ibox w-11 h-11 text-xl shrink-0" style="background:${r}22;color:${r}">${ic(D_IKON[di])}</span>
    <div class="flex-1 min-w-0"><div class="flex justify-between gap-2"><b class="text-lg truncate">${esc(k.cihaz_modeli)}</b><span class="text-xs font-mono text-indigo-300 pt-1">${esc(k.takip_kodu)}</span></div>
    <div class="text-sm text-slate-400">${esc(k.musteri_adi)} · ${esc(k.musteri_tel)}</div>
    <span class="inline-block text-xs px-2.5 py-0.5 rounded-full mt-1" style="background:${r}22;color:${r}">${esc(k.durum)}</span></div></div>
    ${bekliyor(k)?`<div class="mt-3 text-xs bg-rose-500/15 text-rose-300 rounded-xl px-3 py-2 flex items-center gap-2">${ic('alert')} Hazır, ${gun(k.hazir_tarihi)} gündür teslim alınmadı</div>`:''}
    <div class="text-sm mt-3 text-slate-300">${esc(k.ariza_aciklamasi)}</div>
    <div class="grid sm:grid-cols-2 gap-2 mt-3">
      <select class="inp f-durum">${DURUMLAR.map(d=>`<option ${d===k.durum?'selected':''}>${d}</option>`).join('')}</select>
      <input type="number" step="0.01" class="inp f-ucret" value="${k.ucret||0}">
      <textarea class="inp f-islem sm:col-span-2" rows="2" placeholder="Yapılan işlem">${esc(k.yapilan_islem)}</textarea>
      <div><div class="text-xs text-slate-400 mb-1">Öncesi (${liste(k,'once').length})</div>${picker(k.id,'once')}</div>
      <div><div class="text-xs text-slate-400 mb-1">Sonrası (${liste(k,'sonra').length})</div>${picker(k.id,'sonra')}</div>
    </div>
    <div class="flex flex-wrap gap-2 mt-4">
      <button class="btn grad b-kaydet">${ic('save')} Güncelle</button>
      <button class="btn grad-g b-wa">${ic('send')} WhatsApp</button>
      ${bekliyor(k)?`<button class="btn b-hat" style="background:#ef4444">${ic('clock')} Hatırlat</button>`:''}
      ${k.onceki_foto_url&&k.sonraki_foto_url?`<button class="btn b-gorsel" style="background:#db2777">${ic('download')} Sosyal Medya Görseli</button>`:''}
      <button class="btn b-sil ghost ml-auto">${ic('trash')}</button>
    </div></div>`; }).join('') || '<p class="text-center text-slate-500 py-8">Kayıt yok.</p>';
}
async function yukleHepsi(files,kod,tip){ const u=[]; for(const f of files) u.push(await fotoYukle(f,kod,tip)); return u; }

$('yeniForm').onsubmit = async e=>{
  e.preventDefault(); const btn=$('n_btn'); btn.disabled=true;
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
  btn.disabled=false;
};

$('liste').onclick = async e=>{
  const kart = e.target.closest('[data-id]'); if(!kart) return;
  const k = kayitlar.find(x=>x.id===kart.dataset.id), b = e.target.closest('button'); if(!b) return;
  if(b.classList.contains('b-kaydet')){
    b.disabled=true;
    try{
      const durum = kart.querySelector('.f-durum').value;
      const upd = {durum, ucret:+kart.querySelector('.f-ucret').value||0, yapilan_islem:kart.querySelector('.f-islem').value};
      if(durum==='Tamamlandı / Hazır'){ if(k.durum!==durum || !k.hazir_tarihi) upd.hazir_tarihi = new Date().toISOString(); } else upd.hazir_tarihi = null;
      for(const t of ['once','sonra']){ const key=k.id+'_'+t, fl=bek[key]||[];
        if(fl.length){ const yeni = [...liste(k,t), ...await yukleHepsi(fl,k.takip_kodu,t)];
          upd[t==='once'?'fotolar_once':'fotolar_sonra']=yeni; upd[t==='once'?'onceki_foto_url':'sonraki_foto_url']=yeni[0]; delete bek[key]; } }
      const {error} = await sb.from('servis_kayitlari').update(upd).eq('id',k.id);
      if(error) throw error; await yukle();
    }catch(err){ alert('Hata: '+err.message); b.disabled=false; }
  }
  if(b.classList.contains('b-wa')||b.classList.contains('b-hat')){
    const m = b.classList.contains('b-hat')
      ? `Merhaba ${k.musteri_adi},\n\n*${k.cihaz_modeli}* cihazınız hazır ve teslim almanızı bekliyor.\nÜcret: ${tl(k.ucret)}\n${AYAR.saat?'Çalışma saatlerimiz: '+AYAR.saat+'\n':''}\nDetay: ${takipLinki(k.takip_kodu)}\n\n${AYAR.servis_adi}`
      : `Merhaba ${k.musteri_adi},\n\n*${k.cihaz_modeli}* cihazınızın durumu: *${k.durum}*\nÜcret: ${tl(k.ucret)}\n\nCihazınızı anlık takip edin:\n${takipLinki(k.takip_kodu)}\n\n${AYAR.servis_adi}`;
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
    x.textAlign='right'; x.globalAlpha=.8; x.font='bold 36px sans-serif'; x.fillText(AYAR.servis_adi,W-40,H-40); x.globalAlpha=1;
    c.toBlob(bl=>{const l=document.createElement('a');l.href=URL.createObjectURL(bl);l.download=`${k.takip_kodu}-oncesi-sonrasi.jpg`;l.click()},'image/jpeg',.92);
  }catch(err){ alert('Görsel oluşturulamadı: '+err.message); }
}
oturumKontrol();
