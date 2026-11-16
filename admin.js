const $ = id => document.getElementById(id);
let kayitlar = [];
async function oturumKontrol(){
  const {data:{session}} = await sb.auth.getSession();
  $('giris').classList.toggle('hidden', !!session); $('panel').classList.toggle('hidden', !session);
  if(session) yukle();
}
$('girisForm').onsubmit = async e=>{
  e.preventDefault();
  const {error} = await sb.auth.signInWithPassword({email:$('email').value, password:$('sifre').value});
  if(error) $('girisHata').textContent = 'Giriş başarısız: e-posta veya şifre hatalı.'; else oturumKontrol();
};
$('cikis').onclick = async()=>{await sb.auth.signOut(); oturumKontrol()};

async function yukle(){
  const {data,error} = await sb.from('servis_kayitlari').select('*').order('olusturma_tarihi',{ascending:false});
  if(error) return alert('Liste yüklenemedi: '+error.message);
  kayitlar = data; ciz();
}
function ciz(){
  const q = $('ara').value.toLowerCase();
  const l = kayitlar.filter(k=>[k.musteri_adi,k.musteri_tel,k.cihaz_modeli,k.takip_kodu].join(' ').toLowerCase().includes(q));
  $('liste').innerHTML = l.map(k=>`
  <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4" data-id="${k.id}">
    <div class="flex justify-between"><b>${esc(k.cihaz_modeli)}</b><span class="text-xs text-indigo-300">${esc(k.takip_kodu)}</span></div>
    <div class="text-sm text-slate-400">${esc(k.musteri_adi)} · ${esc(k.musteri_tel)}</div>
    <div class="text-sm mt-1">${esc(k.ariza_aciklamasi)}</div>
    <div class="grid sm:grid-cols-2 gap-2 mt-3">
      <select class="inp f-durum">${DURUMLAR.map(d=>`<option ${d===k.durum?'selected':''}>${d}</option>`).join('')}</select>
      <input type="number" step="0.01" class="inp f-ucret" value="${k.ucret||0}">
      <textarea class="inp f-islem sm:col-span-2" rows="2" placeholder="Yapılan işlem">${esc(k.yapilan_islem)}</textarea>
      <label class="text-xs text-slate-400 sm:col-span-2">Tamir sonrası fotoğraf ${k.sonraki_foto_url?'(yüklü ✓)':''}<input type="file" accept="image/*" capture="environment" class="f-foto block mt-1"></label>
    </div>
    <div class="flex flex-wrap gap-2 mt-3">
      <button class="b-kaydet bg-indigo-600 rounded-lg px-3 py-2 text-sm">Güncelle</button>
      <button class="b-wa bg-green-600 rounded-lg px-3 py-2 text-sm">WhatsApp'tan Gönder</button>
      ${k.onceki_foto_url&&k.sonraki_foto_url?'<button class="b-gorsel bg-pink-600 rounded-lg px-3 py-2 text-sm">Sosyal Medya Görseli İndir</button>':''}
      <button class="b-sil bg-slate-700 rounded-lg px-3 py-2 text-sm ml-auto">Sil</button>
    </div>
  </div>`).join('') || '<p class="text-center text-slate-500">Kayıt yok.</p>';
}
$('ara').oninput = ciz;

$('yeniForm').onsubmit = async e=>{
  e.preventDefault(); const btn=$('n_btn'); btn.disabled=true; btn.textContent='Kaydediliyor...';
  try{
    let kod, hata;
    for(let i=0;i<8;i++){
      kod = kodUret();
      const f = $('n_foto').files[0];
      const foto = f ? await fotoYukle(f,kod,'once') : null;
      ({error:hata} = await sb.from('servis_kayitlari').insert({takip_kodu:kod,musteri_adi:$('n_ad').value.trim(),musteri_tel:$('n_tel').value.trim(),cihaz_modeli:$('n_model').value.trim(),ariza_aciklamasi:$('n_ariza').value.trim(),ucret:+$('n_ucret').value||0,onceki_foto_url:foto}));
      if(!hata || hata.code!=='23505') break;
    }
    if(hata) throw hata;
    e.target.reset(); await yukle();
  }catch(err){ alert('Hata: '+err.message); }
  btn.disabled=false; btn.textContent='Kaydet';
};

$('liste').onclick = async e=>{
  const kart = e.target.closest('[data-id]'); if(!kart) return;
  const k = kayitlar.find(x=>x.id===kart.dataset.id), b = e.target;
  if(b.classList.contains('b-kaydet')){
    b.disabled=true; b.textContent='...';
    try{
      const upd = {durum:kart.querySelector('.f-durum').value, ucret:+kart.querySelector('.f-ucret').value||0, yapilan_islem:kart.querySelector('.f-islem').value};
      const f = kart.querySelector('.f-foto').files[0];
      if(f) upd.sonraki_foto_url = await fotoYukle(f,k.takip_kodu,'sonra');
      const {error} = await sb.from('servis_kayitlari').update(upd).eq('id',k.id);
      if(error) throw error; await yukle();
    }catch(err){ alert('Hata: '+err.message); b.disabled=false; b.textContent='Güncelle'; }
  }
  if(b.classList.contains('b-wa')){
    let t = k.musteri_tel.replace(/\D/g,''); if(t.startsWith('0')) t=t.slice(1); if(!t.startsWith('90')) t='90'+t;
    const m = `Merhaba ${k.musteri_adi},\n\n📱 *${k.cihaz_modeli}* cihazınızın durumu: *${k.durum}*\n💰 Ücret: ${tl(k.ucret)}\n\nCihazınızı anlık takip edin:\n${takipLinki(k.takip_kodu)}\n\n${SERVIS_ADI}`;
    window.open(`https://wa.me/${t}?text=${encodeURIComponent(m)}`,'_blank');
  }
  if(b.classList.contains('b-gorsel')) sosyalGorsel(k);
  if(b.classList.contains('b-sil') && confirm('Bu kayıt silinsin mi?')){
    const {error} = await sb.from('servis_kayitlari').delete().eq('id',k.id);
    if(error) alert(error.message); else yukle();
  }
};

const resimYukle = u => new Promise((res,rej)=>{const i=new Image();i.crossOrigin='anonymous';i.onload=()=>res(i);i.onerror=()=>rej(new Error('Görsel yüklenemedi'));i.src=u+'?t='+Date.now()});
function kapla(ctx,img,x,y,w,h){
  const r=Math.max(w/img.width,h/img.height), sw=w/r, sh=h/r;
  ctx.save(); ctx.beginPath(); ctx.rect(x,y,w,h); ctx.clip();
  ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,x,y,w,h); ctx.restore();
}
async function sosyalGorsel(k){
  try{
    const [a,b] = await Promise.all([resimYukle(k.onceki_foto_url),resimYukle(k.sonraki_foto_url)]);
    const W=1080,H=1350,c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d');
    x.fillStyle='#0f172a'; x.fillRect(0,0,W,H);
    const ph=600; kapla(x,a,0,0,W,ph); kapla(x,b,0,ph+150,W,ph);
    const etiket=(t,y,renk)=>{x.fillStyle=renk;x.fillRect(40,y,260,64);x.fillStyle='#fff';x.font='bold 36px sans-serif';x.textBaseline='middle';x.fillText(t,64,y+33)};
    etiket('ÖNCESİ',30,'rgba(225,29,72,.9)'); etiket('SONRASI',ph+150+30,'rgba(16,185,129,.9)');
    x.fillStyle='#fff'; x.textAlign='center'; x.font='bold 54px sans-serif'; x.fillText(k.cihaz_modeli,W/2,ph+75);
    x.textAlign='right'; x.globalAlpha=.7; x.font='bold 36px sans-serif'; x.fillText('🔧 '+SERVIS_ADI,W-40,H-40); x.globalAlpha=1;
    c.toBlob(bl=>{const l=document.createElement('a');l.href=URL.createObjectURL(bl);l.download=`${k.takip_kodu}-oncesi-sonrasi.jpg`;l.click()},'image/jpeg',.92);
  }catch(err){ alert('Görsel oluşturulamadı: '+err.message); }
}
oturumKontrol();
