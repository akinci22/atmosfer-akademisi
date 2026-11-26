/* HEC-HMS Okulu — sayfa: üst çubuk, büyük sahne (benzetim) + panel (keşif / rehberli anlatım / adım adım izle),
   kategori kategori seçim (keşif: programın bölümleri; uygulamalar: aşamalar), telefonda odak yakınlaştırma, Türkçe anlatım adımları. */
(function () {
  'use strict';
  const { AC, ODEV, IMG, KESIF } = window.OKUL;
  /* benzetimi olan anlatımlar (havza modeli, yağış–akış); benzetim: false olan (CBS ile alt havzalar) yalnız uygulamalar bölümünde gerçek ekranlarla */
  const SIM = ODEV.filter((o) => o.benzetim !== false);
  const simOdev = (id) => SIM.find((o) => o.id === id) || null;
  const $ = (s, k) => (k || document).querySelector(s);
  const kac = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const RESMI = new Set(['hw1-fig1', 'hw1-fig2', 'hw1-fig3', 'hw1-area', 'hw1-area-menu', 'hw1-baseflow-menu', 'hw1-loss-menu', 'hw1-loss', 'hw1-transform-menu', 'hw1-clark', 'hw1-loss-tab']);
  const genis = () => window.innerWidth >= 900;
  const ustH = () => { const u = $('#ust'); return u ? u.getBoundingClientRect().height : 0; };
  /* keşif öğeleri düz liste: «‹ Önceki · Sonraki ›» kategoriler arasında da geçer */
  const KOGE = [];
  KESIF.forEach((c, ci) => c.ogeler.forEach((o) => { o.kat = ci; o.i = KOGE.length; KOGE.push(o); }));

  /* ---------------------------------------------------------------- tema: varsayılan her zaman açık (sistem koyu olsa da); koyu yalnız düğmeyle */
  let tema = 'acik';
  try { if (localStorage.getItem('hms-tema') === 'koyu') tema = 'koyu'; } catch (e) { /* depolama kapalı */ }
  const GUNES = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="3.6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M10 1.8v2.4M10 15.8v2.4M1.8 10h2.4M15.8 10h2.4M4.2 4.2l1.7 1.7M14.1 14.1l1.7 1.7M4.2 15.8l1.7-1.7M14.1 5.9l1.7-1.7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  const AY = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M15.6 12.6A6.6 6.6 0 0 1 7.4 4.4a6.6 6.6 0 1 0 8.2 8.2z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';
  function temaUygula() {
    document.documentElement.setAttribute('data-theme', tema === 'koyu' ? 'dark' : 'light');
    const b = $('#tema'); if (!b) return;
    b.innerHTML = `${tema === 'koyu' ? AY : GUNES}<span>${tema === 'koyu' ? 'Koyu' : 'Açık'}</span>`;
    b.setAttribute('aria-pressed', String(tema === 'koyu')); b.setAttribute('aria-label', `Tema: ${tema === 'koyu' ? 'koyu' : 'açık'}. Değiştirmek için bas.`);
  }

  /* ---------------------------------------------------------------- iskelet */
  const IMLEC = '<svg viewBox="0 0 20 24" aria-hidden="true"><path d="M2.5 1.8v17.6l4.3-4.1 3 6.6 3.1-1.4-3-6.5h6z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  function iskelet() {
    /* sayfa başlığı üst çubukta: program sahnesi açılışta çubuğun hemen altında, tümüyle ekranda; giriş içeriği sahnenin altında («Nasıl çalışır») */
    $('#ust').innerHTML = `<div class="ust-ic"><a class="ust-marka" href="../">Atmosfer Akademisi</a><span class="ust-ayrac" aria-hidden="true">/</span><h1 class="ust-baslik">HEC-HMS Okulu <span>MTO 316</span></h1><nav class="ust-nav" aria-label="Bu sayfada"><a href="#benzetim">Benzetim</a><a href="#nasil">Nasıl çalışır</a><a href="#uygulamalar">Uygulamalar</a><a href="../ders-kitapligi/#mto316">Soru çözümü (PDF)</a></nav><button type="button" class="ust-tema" id="tema"></button><a class="ust-don" href="../"><span class="ust-don-u">Atmosfer Akademisi'ne dön</span><span class="ust-don-k">‹ Akademi</span></a></div>`;
    $('#tema').addEventListener('click', () => { tema = tema === 'koyu' ? 'acik' : 'koyu'; try { localStorage.setItem('hms-tema', tema); } catch (e) { /* yok */ } temaUygula(); });
    temaUygula();
    const t1 = ODEV[0].adimlar, t2 = ODEV[1].adimlar, tikSay = (o) => o.adimlar.reduce((n, a) => n + a.mikro.length, 0);
    const modKart = (no, ad, alt, mad, dugme, deger) => `<article class="mk"><div class="mk-ust"><span class="mk-no">${no}</span><div><h3>${ad}</h3><p>${alt}</p></div></div><ul class="pn-m">${mad.map((x) => `<li>${x}</li>`).join('')}</ul><button type="button" class="dugme" data-mod="${deger}">${dugme}</button></article>`;
    $('#ana').innerHTML = `
      <section id="benzetim" class="sim-bolum" aria-label="HEC-HMS benzetimi">
        <div class="sim-alan">
          <div class="sim-sahne">
            <div class="sim-kap"><div class="sim-ic" id="simic"><div class="hms" id="hms"></div><div class="iz-imlec" id="imlec" hidden aria-hidden="true">${IMLEC}<span class="iz-sag">sağ tık</span></div></div></div>
            <div class="sim-serit" id="serit"><div class="srt-r1"><button type="button" class="srt-tumu" id="buyut" aria-pressed="false">Tümü</button><div class="srt-kat" id="srtKat" role="group" aria-label="Kategoriler"></div></div><div class="srt-oge" id="srtOge" role="group" aria-label="Seçenekler"></div></div>
          </div>
          <aside class="sim-panel" id="panel"></aside>
        </div>
        <p class="gizli" id="iz-duyuru" aria-live="polite"></p>
      </section>
      <section id="nasil" class="bolum nasil" aria-labelledby="nasil-h">
        <header class="bolum-bas"><p class="ust-eti">MTO 316 · Hidrometeoroloji</p><h2 id="nasil-h">HEC-HMS Okulu'nda ne yaparsın?</h2><p class="bolum-alt">HEC-HMS 4.14'ü tarayıcıda tıklayarak öğren. Dört yol var; her biri programı yukarıda açar.</p><p class="dk-ez"><a href="../ders-kitapligi/#mto316"><b>Soru çözümü, PDF ile eş zamanlı</b> · Ders Kitaplığı, MTO316 →</a><span>reMarkable'daki sayfa numarasını yaz, aynı soru açılır; her adımdan kavramın tanımına, formülüne, türetimine ve animasyonuna geç.</span></p></header>
        <div class="mod-kartlar">
          ${modKart(1, 'Keşif', 'Programı tanı', [`<b>${KOGE.length} parça, ${KESIF.length} kategori:</b> menüler, araçlar, ağaç, harita, pencereler.`, '<b>Seç ya da bas:</b> program parçayı açar, işaretler ve anlatır.', '<b>Proje hazır:</b> iki anlatımın son hâli yüklü.'], 'Keşfe başla', 'kesif')}
          ${modKart(2, 'Havza modeli · rehberli', 'Havza modelini sen kur', [`<b>${t1.length} adım, ${tikSay(ODEV[0])} tık:</b> sıradaki yer mavi çerçeveyle işaretli.`, '<b>Takılırsan:</b> «Bu tıklamayı göster» ya da «Adımı benim yerime bitir».', '<b>Sonunda:</b> 3 alt havza, 1 kanal, 2 birleşim bağlı.'], 'Havza modeline başla', 'hw1')}
          ${modKart(3, 'Yağış–akış benzetimi · rehberli', 'Meteoroloji, koşu, sonuç', [`<b>${t2.length} adım, ${tikSay(ODEV[1])} tık:</b> havza modelinin bittiği projeden başlar.`, '<b>Gerçek sonuç:</b> Junction-2 tepe 3082,9 cfs.', '<b>Gözlemle kıyas:</b> Nash-Sutcliffe 0,952.'], 'Benzetime başla', 'hw2')}
          ${modKart(4, 'İzle', 'Program kendisi yapar', ['<b>Her tıkta:</b> imleç hedefe gider; ekranda ne değiştiği ve nedeni yazar.', '<b>Kontrol:</b> Geri · Oynat · İleri; klavyede ← → ve boşluk.', '<b>Atla:</b> aşama ve adım listesinden istediğin yere.'], 'Havza modelini izle', 'izle-hw1')}
        </div>
        ${ODEV.filter((o) => o.benzetim === false).map((o) => `<p class="nasil-not"><b>${o.ad}:</b> benzetimde yok; <a href="#${o.capa}">Uygulamalar › ${o.ad}</a> gerçek HEC-HMS 4.14 ekranlarıyla ${o.adimlar.length} adımlık anlatım.</p>`).join('')}
        <dl class="kunye"><div><dt>Program</dt><dd>HEC-HMS 4.14</dd></div><div><dt>Örnek havza</dt><dd>Punxsutawney, ABD · 158 mi²</dd></div><div><dt>Fırtına</dt><dd>28 Nisan – 4 Mayıs 1996</dd></div><div><dt>Uygulamalar</dt><dd>${ODEV.map((o) => o.ad).join(' · ')}</dd></div></dl>
      </section>
      <section id="uygulamalar" class="bolum odevler" aria-labelledby="uygulamalar-h"></section>
      <div class="isik" id="isik" hidden role="dialog" aria-modal="true" aria-label="Ekran görüntüsü"><figure><img alt=""><figcaption></figcaption></figure><button type="button" class="dugme ikincil isik-kapat">Kapat</button></div>`;
    $('#alt').innerHTML = `<div class="alt-ic"><ul class="pn-m"><li><b>Öğretici içeriği:</b> HEC-HMS kılavuzları (U.S. Army Corps of Engineers, Hydrologic Engineering Center).</li><li><b>Ekranlar:</b> HEC-HMS 4.14; grafiklerdeki sayılar programın bu projedeki gerçek çıktısı.</li></ul><a class="dugme ikincil" href="../">Atmosfer Akademisi'ne dön</a></div>`;
  }

  /* ---------------------------------------------------------------- ölçek
     Masaüstü: program penceresi sahne kutusunu tam doldurur; geniş ekranda büyütülür (mantıksal genişlik ≈ 920 px).
     Telefon: mantıksal 780 px genişlik, «Tümü» görünümü kutuya sığar (okunmaz); odak yakınlaştırma etkin parçaya ≥ 0,72 ölçekle yaklaşır. */
  const MASA_W = 920, MIN_W = 780, TEL_W = 780, ZMIN = 0.72, ZMAX = 0.95, ZADIM = [0.72, 0.8, 0.88, 0.95];
  const G = { W: 0, H: 0, s: 1, fit: 1, odakVar: false };
  let tumu = false; // telefonda kullanıcı «Tümü» dedi: listeden yeni seçim yapılana dek bütün görünüm
  function olcekUygula(s) {
    const h = $('#hms'), ic = $('#simic'), kap = $('.sim-kap');
    G.s = s;
    h.style.transform = s === 1 ? 'none' : `scale(${s})`;
    ic.style.width = Math.round(G.W * s) + 'px'; ic.style.height = Math.round(G.H * s) + 'px';
    kap.classList.toggle('odak', s > G.fit + 0.001);
    window.HMS.olcek(s);
    tumuGuncelle();
    if (mod === 'izle' && iz) imlecYerlestir();
  }
  function olcekle() {
    const kap = $('.sim-kap'), h = $('#hms'); if (!kap) return;
    const cw = kap.clientWidth;
    let s;
    if (genis()) {
      kap.style.height = '';
      const kh = kap.clientHeight;
      s = Math.min(1.4, Math.max(1, cw / MASA_W)); if (cw / s < MIN_W) s = cw / MIN_W;
      if (s > 1 && kh / s < 600) s = Math.max(1, kh / 600);
      G.W = Math.round(cw / s); G.H = Math.round(kh / s); G.fit = s; G.odakVar = false;
    } else {
      const oran = mod === 'izle' ? 0.33 : mod === 'odev' ? 0.41 : 0.44; // izlemede panelin «şimdi + ekranda» kısmı da sığsın
      const kh = Math.round((window.visualViewport ? window.visualViewport.height : window.innerHeight) * oran);
      kap.style.height = kh + 'px';
      G.W = Math.max(TEL_W, cw); G.fit = cw / G.W; G.H = Math.round(kh / G.fit);
      G.odakVar = G.fit < 0.8;
      s = G.fit;
    }
    h.style.width = G.W + 'px'; h.style.height = G.H + 'px';
    h.classList.toggle('dar', G.W < 760); h.classList.toggle('alcak', G.H < 620); h.style.setProperty('--hms-h', G.H + 'px');
    olcekUygula(s);
    document.documentElement.style.setProperty('--ust-h', ustH() + 'px');
    window.HMS.ciz();
    if (mod === 'izle' && iz) imlecYerlestir();
    secimCiz();
    odakGuncelle();
  }
  function tumuGuncelle() {
    const b = $('#buyut'); if (!b) return;
    b.hidden = !G.odakVar;
    b.textContent = tumu ? 'Yakınlaş' : 'Tümü';
    b.setAttribute('aria-pressed', String(tumu));
    b.setAttribute('aria-label', tumu ? 'Etkin parçaya yakınlaş' : 'Programın tamamını göster');
    b.disabled = !tumu && G.s <= G.fit + 0.001;
  }

  /* ---------------------------------------------------------------- mod ve durum */
  let mod = 'kesif', odev = null, adim = 0, mik = 0, sonAc = null;
  let kesKat = 0, kesSec = null, odakHd = null, fazGor = null; // seçim listesi durumu
  let secAcik = false; // masaüstü: kategori → öğe açılır kutusu (kapalıyken tek satır)
  const HMS = () => window.HMS;
  function ileriSar(liste) { liste.forEach((m) => { if (m.oto) m.oto.forEach((x) => HMS().yap(x.yap || x.hd, { doldur: true, sag: x.sag, cizme: true })); else HMS().yap(m.yap || m.hd, { doldur: true, sag: m.sag, cizme: true }); }); }
  const tumMikro = (o, kadar) => o.adimlar.slice(0, kadar == null ? o.adimlar.length : kadar).flatMap((a) => a.mikro);
  function sadele() { const S = HMS().durum(); HMS().temizle(); S.secili = null; S.ce = null; S.arac = 'arrow'; S.xsekme = 'Components'; S.log = []; HMS().projeAcikLog(); }
  /* keşif tabanı: iki anlatımın son hâli, hesap yapılmış, pencereler kapalı */
  function kesifTaban() { HMS().bosalt(true); ileriSar(tumMikro(ODEV[0])); ileriSar(tumMikro(ODEV[1])); sadele(); HMS().yap('tb:compute', { cizme: true }); HMS().temizle(); }
  function kur(yeniMod, odevId, baslangicAdim) {
    if (yeniMod === 'odev' && !simOdev(odevId)) return; // benzetimi olmayan anlatım (CBS) rehberli moda girmez
    const izdeydi = mod === 'izle', eskiMod = mod;
    if (iz) izKapat();
    mod = yeniMod; odev = odevId ? simOdev(odevId) : null; adim = baslangicAdim || 0; mik = 0; sonAc = null;
    fazGor = null; tumu = false;
    if (mod === 'kesif') { kesSec = null; odakHd = null; }
    if (izdeydi || eskiMod !== mod) olcekle();
    HMS().bosalt(true);
    if (mod === 'kesif') kesifTaban();
    else if (odev.id === 'hw1') {
      if (adim === 0) HMS().bosalt(false); else { ileriSar(tumMikro(odev, adim)); HMS().temizle(); }
    } else {
      ileriSar(tumMikro(ODEV[0])); sadele();
      if (adim > 0) { ileriSar(tumMikro(odev, adim)); HMS().temizle(); }
    }
    hedefAyarla(); HMS().ciz(); panelCiz();
  }
  const simdiki = () => (mod === 'odev' && odev && odev.adimlar[adim] ? odev.adimlar[adim].mikro[mik] : null);
  function hedefAyarla() { const m = mod === 'odev' ? simdiki() : null; HMS().hedef(m && !m.hd.startsWith('oto:') ? m.hd : null); }

  /* ---------------------------------------------------------------- açıklama anahtarı */
  function acAnahtar(hd) {
    const S = HMS().durum();
    const [tip, ...r] = hd.split(':'); const arg = r.join(':');
    if (tip === 'masaustu') return 'masaustu';
    if (tip === 'bolge' || tip === 'm' || tip === 'xt') return hd;
    if (tip === 'mi') { const p = arg.split('/'); for (let i = p.length; i >= 1; i--) { const k = 'mi:' + p.slice(0, i).join('/'); if (AC[k]) return k; } return 'm:' + p[0]; }
    if (tip === 'tb') return AC[hd] ? hd : 'bolge:arac';
    if (tip === 'agac') {
      const id = arg.replace(/^(sec|ac):/, '').replace(/^adlandir:.*/, 'e:x');
      if (id === 'p') return 'agac:proje';
      if (id.startsWith('h:')) return 'agac:havza';
      if (id.startsWith('e:')) { const e = S.el.find((x) => x.ad === id.slice(2)); return 'agac:' + (e ? e.tur : 'subbasin'); }
      if (id === 'm') return 'agac:met'; if (id === 'hy') return 'agac:hy'; if (id === 'c') return 'agac:kontrol';
      if (id.startsWith('pg:')) return 'agac:pg'; if (id.startsWith('dg:')) return 'agac:dg';
      if (id === 'r' || id === 'k:kosu') return 'agac:kosu';
      if (AC['agac:' + id]) return 'agac:' + id;
      if (/^(rg|rt|rz|rs):|^rgs$|^rr$|^k:sr$/.test(id)) return 'agac:sonuc';
      return 'bolge:agac';
    }
    if (tip === 'ce') return arg.startsWith('sekme:') ? 'ce:' + arg.slice(6) : 'ce:yol';
    if (tip === 'f' || tip === 'satir') { const d = S.dlg[S.dlg.length - 1]; if (d) return 'dlg:' + d.tur; return S.ce ? 'ce:' + S.ce.sekme : 'bolge:ce'; }
    if (tip === 'cb') return 'cb:' + arg.split('.').pop();
    if (tip === 'harita') { if (arg === 'bos') return 'bolge:masa'; if (arg.startsWith('el:')) { const e = S.el.find((x) => x.ad === arg.slice(3)); return 'harita:' + (e ? e.tur : 'subbasin'); } return 'bolge:masa'; }
    if (tip === 'bm') return AC[hd] ? hd : 'bm:View Results';
    if (tip === 'dlg') { const d = S.dlg[S.dlg.length - 1]; return d ? 'dlg:' + d.tur : null; }
    return null;
  }
  const adi = (hd) => { const k = acAnahtar(hd); return k && AC[k] ? AC[k].b : 'bu parça'; };

  /* ---------------------------------------------------------------- seçim listesi: kategori satırı + o kategorinin öğeleri
     Masaüstü: panelin üstünde (.pn-sec; kategori satırı yapışkan). Telefon: yapışkan sahnenin altındaki şerit (iki yatay satır). */
  function secimVeri() {
    if (mod === 'kesif') {
      const kat = KESIF.map((c, i) => `<button type="button" class="sk${i === kesKat ? ' secik' : ''}" data-kat="${c.id}" aria-pressed="${i === kesKat}">${kac(c.ad)}<span>${c.ogeler.length}</span></button>`).join('');
      let g0 = null, oge = '';
      KESIF[kesKat].ogeler.forEach((o) => {
        if (o.g && o.g !== g0) { g0 = o.g; oge += `<span class="so-g">${kac(o.g)}</span>`; }
        oge += `<button type="button" class="so${o.i === kesSec ? ' secik' : ''}" data-oge="${o.i}" data-k="${kac(o.k)}" aria-pressed="${o.i === kesSec}">${kac(o.et)}</button>`;
      });
      const so = kesSec != null && KOGE[kesSec] && KOGE[kesSec].kat === kesKat ? KOGE[kesSec] : null;
      return { kat, oge, et: 'Programın bölümleri', kad: KESIF[kesKat].ad, kn: KESIF[kesKat].ogeler.length, oad: so ? so.et : 'Bir parça seç', bos: !so };
    }
    const o = mod === 'izle' ? (iz && iz.o) : odev; if (!o) return null;
    const N = o.adimlar.length;
    const simdi = mod === 'izle' ? (iz.kareler[iz.f].t === 'son' ? N : iz.kareler[iz.f].adim) : adim;
    const fs = o.fazlar, aktif = simdi >= N ? fs.length - 1 : o.adimlar[simdi].faz;
    const gf = fazGor != null && fs[fazGor] ? fazGor : aktif;
    const kat = fs.map((f, i) => `<button type="button" class="sk${i === gf ? ' secik' : ''}${i === aktif ? ' aktif' : ''}" data-faz="${i}" aria-pressed="${i === gf}" title="${kac(f.ad)}">${kac(f.kisa)}<span>${f.son - f.bas}</span></button>`).join('');
    let oge = '';
    for (let i = fs[gf].bas; i < fs[gf].son; i++) {
      const a = o.adimlar[i], d = i < simdi ? ' bitti' : i === simdi ? ' simdi' : '';
      oge += `<button type="button" class="so so-adim${d}" data-faz-adim="${i}" title="${i + 1}. ${kac(a.baslik)}" aria-label="Adım ${i + 1}: ${kac(a.baslik)}"${i === simdi ? ' aria-current="step"' : ''}><b>${i + 1}</b>${kac(a.kisa)}</button>`;
    }
    const sa = simdi < N && simdi >= fs[gf].bas && simdi < fs[gf].son ? o.adimlar[simdi] : null;
    return { kat, oge, et: `${o.ad} aşamaları`, kad: fs[gf].kisa, kn: fs[gf].son - fs[gf].bas, oad: sa ? `${simdi + 1}. ${sa.kisa}` : (simdi >= N ? 'Bitti' : 'Bir adım seç'), bos: !sa };
  }
  function yatayOrtala(kutu, el) {
    if (!kutu) return;
    if (!el) { kutu.scrollLeft = 0; return; }
    kutu.scrollLeft = el.offsetLeft - kutu.offsetLeft - (kutu.clientWidth - el.offsetWidth) / 2;
  }
  function secimCiz() {
    const v = secimVeri(), ps = $('#pnsec'), sk = $('#srtKat'), so = $('#srtOge');
    if (!sk) return;
    if (genis()) {
      sk.innerHTML = ''; so.innerHTML = '';
      if (!ps) return;
      ps.innerHTML = v ? `<button type="button" class="sec-ac${v.bos ? ' bos' : ''}" aria-expanded="${secAcik}" aria-controls="secpop" title="${kac(v.et)}: kategori ve öğe seç"><span class="sec-k">${kac(v.kad)}<i>${v.kn}</i></span><svg class="sec-ok" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg><span class="sec-o">${kac(v.oad)}</span><svg class="sec-asagi" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>`
        + `<div class="sec-pop" id="secpop"${secAcik ? '' : ' hidden'}><div class="sec-kat" role="group" aria-label="${kac(v.et)}">${v.kat}</div><div class="sec-oge" role="group" aria-label="Seçenekler">${v.oge}</div></div>` : '';
      const s = secAcik && ps.querySelector('.so.secik, .so.simdi');
      if (s) {
        /* seçili öğe görünsün; mümkünse üstündeki grup adıyla birlikte */
        const ko = ps.querySelector('.sec-oge');
        let g = s.previousElementSibling; while (g && !g.classList.contains('so-g')) g = g.previousElementSibling;
        const ust = g && s.offsetTop + s.offsetHeight - g.offsetTop < ko.clientHeight - 8 ? g.offsetTop - 4 : s.offsetTop - 6;
        if (ust < ko.scrollTop || s.offsetTop + s.offsetHeight > ko.scrollTop + ko.clientHeight) ko.scrollTop = Math.max(0, ust);
      }
    } else {
      if (ps) ps.innerHTML = '';
      sk.innerHTML = v ? v.kat : ''; so.innerHTML = v ? v.oge : '';
      sk.setAttribute('aria-label', v ? v.et : 'Kategoriler');
      yatayOrtala(sk, sk.querySelector('.secik')); yatayOrtala(so, so.querySelector('.secik, .simdi'));
    }
  }

  /* ---------------------------------------------------------------- panel */
  function modSecici() {
    const b = (id, et, sec, ek) => `<button type="button" class="pn-mod${sec ? ' secik' : ''}" data-mod="${id}" aria-pressed="${sec}"${ek || ''}>${et}</button>`;
    return `<div class="pn-ust"><div class="pn-mods" role="group" aria-label="Benzetim modu">${b('kesif', 'Keşif', mod === 'kesif', ' title="Keşif: programı tanı"')}${b('hw1', 'Havza', mod === 'odev' && odev.id === 'hw1', ' title="Havza modeli, rehberli: kendin kur" aria-label="Havza modeli, rehberli"')}${b('hw2', 'Akış', mod === 'odev' && odev.id === 'hw2', ' title="Yağış–akış benzetimi, rehberli: kendin yap" aria-label="Yağış–akış benzetimi, rehberli"')}${b('izle', 'İzle', mod === 'izle', ' title="Adım adım izle: program kendisi yapar"')}</div></div>`;
  }
  const satir = (eti, deger) => `<div class="pn-satir"><p class="pn-eti">${eti}</p><button type="button" class="pn-bas" data-mod="${deger}">Baştan</button></div>`;
  /* madde: «Anahtar: açıklama» biçimindeyse anahtar kalın (göz tarasın) */
  const madde = (x) => { const t = String(x), i = t.indexOf(': '); return i > 0 && i <= 34 && !/[.!?]/.test(t.slice(0, i)) ? `<b>${kac(t.slice(0, i + 1))}</b>${kac(t.slice(i + 1))}` : kac(t); };
  const liste = (a, cls) => (a && a.length ? `<ul class="pn-m${cls ? ' ' + cls : ''}">${a.map((x) => `<li>${madde(x)}</li>`).join('')}</ul>` : '');
  function degerTablo(t) { return t ? `<table class="deger"><tbody>${t.map(([a, b]) => `<tr><th>${kac(a)}</th><td>${kac(b)}</td></tr>`).join('')}</tbody></table>` : ''; }
  /* katmanlı ayrıntı: önce kısa madde, «+ Ayrıntı» ile «Ne yapıyorum / Programda nerede / Neden» grupları */
  const grup = (et, a) => (a && a.length ? `<p class="ay-et">${et}</p>${liste(a)}` : '');
  function katman(a, idk, nedensiz, ilkGorunur) {
    const ne = ilkGorunur ? (a.ne || []).slice(1) : a.ne;
    return `<div class="katman" data-k="${idk}"><button type="button" class="kt-b" aria-expanded="false">Ayrıntı: ${ne && ne.length ? 'ne, ' : ''}nerede${nedensiz ? '' : ', neden'}</button><div class="kt-ic" hidden>${grup(ilkGorunur ? 'Ayrıca' : 'Ne yapıyorum?', ne)}${grup('Programda nerede?', a.nerede)}${nedensiz ? '' : grup('Neden bu değer?', a.neden)}</div></div>`;
  }
  /* «Kendini dene»: önce düşün, sonra aç — öğreticinin sorusu */
  const soruHTML = (a) => (a.soru ? `<div class="soru"><p class="soru-et">Kendini dene · öğreticinin sorusu</p><p class="soru-s">${kac(a.soru[0])}</p><button type="button" class="kt-b" aria-expanded="false">Önce düşün, sonra cevabı aç</button><div class="kt-ic" hidden><p>${kac(a.soru[1])}</p></div></div>` : '');
  const panelKabuk = (ic, kontrol) => `${modSecici()}<div class="pn-sec" id="pnsec"></div><div class="pn-ic"${kontrol ? '' : ' aria-live="polite"'}>${ic}</div>${kontrol || ''}`;
  function kesifIc() {
    if (!sonAc || !AC[sonAc]) {
      return `${satir('Keşif · programı tanı', 'kesif')}<h2 class="pn-h">Bir parça seç.</h2><ul class="pn-m"><li><b>Seç:</b> ${genis() ? 'yukarıdaki' : 'programın altındaki'} kategorilerden bir parça; program onu açar ve işaretler.</li><li><b>Bas:</b> programda istediğin yere; ne işe yaradığı burada yazar.</li><li><b>Sağ tık:</b> eleman menüsü (telefonda basılı tut).</li>${genis() ? '' : '<li><b>Tümü:</b> programın bütününü gösterir.</li>'}<li><b>Proje hazır:</b> iki anlatımın son hâli yüklü.</li></ul><p class="pn-eti2">Havza modelini izle ya da kendin kur</p><div class="pn-dugmeler"><button type="button" class="dugme" data-mod="izle-hw1">Adım adım izle</button><button type="button" class="dugme ikincil" data-mod="hw1">Kendin kur</button></div>`;
    }
    const a = AC[sonAc], o = kesSec != null ? KOGE[kesSec] : null;
    const ust = o
      ? `<div class="kes-ust"><button type="button" class="kes-y" data-kes-yon="-1" aria-label="Önceki parça">‹ Önceki</button><p class="kes-yer">${kac(KESIF[o.kat].ad)} · ${KESIF[o.kat].ogeler.indexOf(o) + 1}/${KESIF[o.kat].ogeler.length}</p><button type="button" class="kes-y" data-kes-yon="1" aria-label="Sonraki parça">Sonraki ›</button></div>`
      : satir('Bu ne işe yarar?', 'kesif');
    return `${ust}<h2 class="pn-h">${kac(a.b)}</h2><p class="pn-t">${kac(a.t)}</p>${liste(a.m)}${a.d ? `<button type="button" class="kt-b pn-daha" aria-expanded="false">Ayrıntı</button><div class="kt-ic" hidden>${liste(a.d)}</div>` : ''}`;
  }
  function panelCiz() {
    const p = $('#panel');
    if (mod === 'izle') { p.innerHTML = panelKabuk('', izKontrolHTML()); izPanel(false); return; }
    let ic = '';
    if (mod === 'kesif') ic = kesifIc();
    else {
      const toplam = odev.adimlar.length;
      if (adim >= toplam) {
        ic = `${satir(`${odev.ad} · bitti`, odev.id)}<h2 class="pn-h">${odev.ad} tamam.</h2><p class="pn-t">Benzetimdeki proje öğreticinin son hâliyle aynı.</p>${liste(odev.id === 'hw1' ? ['3 alt havza, 1 kanal, 2 birleşim bağlı.', 'Bütün parametreler girildi; proje diske yazıldı.', 'Yağış–akış benzetimi bu projeden devam eder.'] : ['Koşu hesaplandı; gözlenen akım bağlı.', 'Nash-Sutcliffe 0,952: model gözlemi çok iyi yakalıyor.', 'Sonuçları Results menüsünden tablo ve grafik olarak oku.'])}<div class="pn-dugmeler">${odev.id === 'hw1' ? '<button type="button" class="dugme" data-mod="hw2">Yağış–akış benzetimine geç</button>' : ''}<button type="button" class="dugme ikincil" data-mod="kesif">Keşfe dön</button></div>`;
      } else {
        const a = odev.adimlar[adim], m = a.mikro[mik];
        const bol = odev.bolumler && a.bolum ? `<p class="pn-bol">${a.bolum} · ${kac(odev.bolumler[a.bolum - 1])}</p>` : '';
        ic = `${satir(`${odev.ad} · adım ${adim + 1}/${toplam}`, odev.id)}<div class="pn-ilerleme" aria-hidden="true"><i style="width:${Math.round((adim / toplam) * 100)}%"></i></div>${bol}<h2 class="pn-h">${kac(a.baslik)}</h2>
          <div class="pn-simdi"><span>Şimdi${a.mikro.length > 1 ? ` · ${mik + 1}/${a.mikro.length}` : ''}</span><b>${kac(m.ip)}</b>${m.oto ? '<button type="button" class="dugme" data-hd="oto:olcerler">İki ölçeri de ekle</button>' : ''}</div>
          <p class="pn-ipucu" id="ipucu"></p>
          <div class="pn-dugmeler pn-yardim"><button type="button" class="dugme ikincil" id="goster">Bu tıklamayı göster</button><button type="button" class="dugme ikincil" id="atla">Adımı benim yerime bitir</button></div>${degerTablo(a.tablo)}${katman(a, 'p')}${soruHTML(a)}`;
      }
    }
    p.innerHTML = panelKabuk(ic);
    secimCiz();
  }

  /* ---------------------------------------------------------------- keşif: listeden seçim = programda o parçaya basmak */
  function uygula(x) {
    let hd = x; const o = { cizme: true };
    if (typeof x === 'object') { hd = x.hd; Object.assign(o, x.o); }
    else if (x.endsWith('|sag')) {
      hd = x.slice(0, -4); o.sag = true;
      HMS().ciz(); const he = HMS().hedefEl(hd); if (he) { icGetir(he); Object.assign(o, izMerkez(he)); }
    }
    HMS().yap(hd, o);
  }
  function kesifSec(gi) {
    const o = KOGE[gi]; if (!o || mod !== 'kesif') return;
    HMS().hedef(null);
    kesifTaban();
    o.yol.forEach(uygula);
    HMS().hedef(o.hd); HMS().ciz();
    kesSec = gi; kesKat = o.kat; sonAc = o.k; odakHd = o.hd; tumu = false;
    panelCiz();
    odakla();
  }

  /* ---------------------------------------------------------------- tıklama */
  function tik(hd, o, girdi) {
    if (mod === 'izle') { izNot('İzleme modunda program kendisi tıklıyor. Kendin denemek için rehberli moda geç: «Havza» ya da «Akış».'); return; }
    if (mod === 'kesif') {
      HMS().hedef(null);
      if (!girdi && !/^(satir|f):/.test(hd)) HMS().yap(hd, o);
      const k = acAnahtar(hd);
      if (k && AC[k]) { sonAc = k; const i = KOGE.findIndex((x) => x.k === k); kesSec = i >= 0 ? i : null; if (i >= 0) kesKat = KOGE[i].kat; odakHd = hd; panelCiz(); }
      odakla(); return;
    }
    const m = simdiki(); if (!m) return;
    const he = HMS().hedefEl(m.hd);
    const isabet = hd === m.hd || (he && o && o.el && he.contains(o.el));
    if (!isabet) { ipucu(hd, m); return; }
    ilerle(o || {});
  }
  function ilerle(o) {
    const m = simdiki(); if (!m) return;
    if (m.oto) ileriSar(m.oto);
    else HMS().yap(m.yap || m.hd, Object.assign({}, o, { doldur: true, sag: m.sag || o.sag, cizme: true }));
    mik++;
    if (mik >= odev.adimlar[adim].mikro.length) { adim++; mik = 0; fazGor = null; }
    hedefAyarla(); HMS().ciz(); panelCiz(); odakla();
  }
  function ipucu(hd, m) {
    const p = $('#ipucu'); if (!p) return;
    p.textContent = `Burası ${adi(hd)}. Şimdi: ${m.ip}`;
    const he = HMS().hedefEl(m.hd); if (he) { he.classList.remove('h-sallan'); void he.getBoundingClientRect(); he.classList.add('h-sallan'); }
    odakla();
  }
  function merkez(el) {
    const kr = $('#hms').getBoundingClientRect(), r = el.getBoundingClientRect(), s = kr.width / $('#hms').offsetWidth || 1;
    return { x: Math.round((r.left + r.width / 2 - kr.left) / s), y: Math.round((r.top + r.height / 2 - kr.top) / s) };
  }
  function goster() {
    const m = simdiki(); if (!m) return;
    if (m.oto) { ilerle({}); return; }
    const he = HMS().hedefEl(m.hd);
    ilerle(he ? merkez(he) : {});
  }
  function atla() { const n = odev.adimlar[adim].mikro.length; while (mik < n && adim < odev.adimlar.length) { const a0 = adim; goster(); if (adim !== a0) break; } }

  /* hedef ve açıklama görünür kalsın: masaüstünde sahnenin üstü çubuğun hemen altına; telefonda panelin başı yapışkan bloğun altına
     (izlemede panel içeriğinin başı: mod sekmeleri yukarıda kalır, «şimdi + ekranda» kısmına yer açılır) */
  function odakla() { sayfaHizala(); odakGuncelle(); }
  function sayfaHizala() {
    const alan = $('.sim-alan'), panel = $('#panel'), u = ustH();
    if (genis()) {
      const r = alan.getBoundingClientRect();
      if (Math.abs(r.top - (u + 8)) > 3) window.scrollTo(0, Math.max(0, window.scrollY + r.top - u - 8));
      const pi = $('.pn-ic', panel); if (pi) pi.scrollTop = 0;
    } else {
      const sahne = $('.sim-sahne'), bas = (mod === 'izle' && $('.pn-ic', panel)) || panel, pt = bas.getBoundingClientRect().top, alt = u + sahne.offsetHeight;
      if (Math.abs(pt - alt) > 8) window.scrollTo(0, Math.max(0, window.scrollY + pt - alt - (bas === panel ? 6 : 0)));
    }
  }
  function benzetimeIn() {
    const r = $('.sim-alan').getBoundingClientRect();
    window.scrollTo(0, Math.max(0, window.scrollY + r.top - ustH() - (genis() ? 8 : 0)));
  }

  /* ---------------------------------------------------------------- odak yakınlaştırma (telefon)
     Etkin parça (rehberli hedef, izlemede tıklanacak yer, keşifte seçilen parça) ve içinde durduğu açılır katman
     (pencere, menü, sağ tık menüsü, açılır liste) okunur ölçekte (0,72–0,95) sahneye getirilir. */
  function birlesim(els) {
    let L = Infinity, T = Infinity, R = -Infinity, B = -Infinity;
    els.forEach((e) => { if (!e) return; const r = e.getBoundingClientRect(); if (!r.width && !r.height) return; L = Math.min(L, r.left); T = Math.min(T, r.top); R = Math.max(R, r.right); B = Math.max(B, r.bottom); });
    return L === Infinity ? null : { left: L, top: T, right: R, bottom: B, width: R - L, height: B - T };
  }
  /* el'in içinde durduğu açılır katman(lar); el yoksa açık olan katman */
  function katmanEl(el) {
    const K = $('#hms'), out = [];
    const cl = K.querySelector('.h-cl'), kaynak = cl && cl.dataset.kaynak ? K.querySelector(`[data-hd="${CSS.escape(cl.dataset.kaynak)}"]`) : null;
    const x = cl && el && cl.contains(el) ? kaynak || el : el; // listedeki seçenek = kendi kutusu
    const dk = x ? x.closest('.h-dk') : K.querySelector('.h-dk.ust');
    if (dk) out.push(dk.querySelector('.h-dlg') || dk);
    else {
      let mk = x ? x.closest('.h-mk') : null;
      if (!mk && !x) { const d = K.querySelector('.h-mk > .h-dd'); mk = d && d.parentElement; }
      if (mk && mk.querySelector('.h-dd')) out.push(mk.querySelector('.h-mb'), ...mk.querySelectorAll('.h-dd'));
      else { const bm = x ? x.closest('.h-bm') : K.querySelector('.h-bm'); if (bm) out.push(bm, ...bm.querySelectorAll('.h-dd')); }
    }
    if (cl && (!el || cl.contains(el) || el === kaynak)) out.push(cl, kaynak);
    return out.length ? out : null;
  }
  /* opt.katman: el bir katmanda değilse açık katmanı (sonuç penceresini) göster · opt.nokta: bu mantıksal nokta (imleç) görünür kalsın
     opt.kalsin: katman yoksa görünümü değiştirme */
  function odakYap(el, opt) {
    opt = opt || {};
    if (genis() || !G.odakVar || tumu) return;
    const kap = $('.sim-kap'), hr = $('#hms').getBoundingClientRect(), s0 = G.s;
    let ac = el && el.isConnected ? el : null;
    let kat = katmanEl(ac);
    if (!kat && opt.katman) kat = katmanEl(null); // parça başka yerde bir pencere açtıysa: ikisi birden (sığmazsa parça ortada, pencere kenarda)
    if (!kat && opt.kalsin) return;
    const kw = kap.clientWidth, kh = kap.clientHeight, pay = 14;
    /* katman yoksa bağlam = parçanın bölgesi (Explorer, Component Editor, Message Log) okunur ölçekte sığıyorsa; ör. sekme + yönettiği ağaç */
    let bolge = null;
    if (!kat && ac) { const b = ac.closest('.h-exp, .h-ce, .h-log'); const r = b && b.getBoundingClientRect(); if (r && (r.width / s0) * ZMIN + 2 * pay <= kw && (r.height / s0) * ZMIN + 2 * pay <= kh) bolge = b; }
    const C0 = birlesim((kat || []).concat(bolge ? [bolge] : []).concat(ac ? [ac] : []));
    const nokta = opt.nokta;
    if (!C0 && !nokta) { if (G.s !== G.fit) { olcekUygula(G.fit); kap.scrollLeft = 0; kap.scrollTop = 0; } return; }
    const log = (r) => ({ x: (r.left - hr.left) / s0, y: (r.top - hr.top) / s0, w: r.width / s0, h: r.height / s0 });
    let C = C0 ? log(C0) : { x: nokta.x - 10, y: nokta.y - 10, w: 20, h: 20 };
    if (nokta) { const x1 = Math.min(C.x, nokta.x - 12), y1 = Math.min(C.y, nokta.y - 12), x2 = Math.max(C.x + C.w, nokta.x + 24), y2 = Math.max(C.y + C.h, nokta.y + 28); C = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }; }
    const T = ac ? log(ac.getBoundingClientRect()) : nokta ? { x: nokta.x - 10, y: nokta.y - 10, w: 20, h: 28 } : C;
    let z = Math.min(kw / (C.w + 2 * pay), kh / (C.h + 2 * pay));
    z = Math.max(ZMIN, Math.min(ZMAX, z));
    z = ZADIM.filter((x) => x <= z + 0.001).pop() || ZMIN;
    z = Math.max(z, G.fit);
    if (Math.abs(z - s0) > 0.001) olcekUygula(z);
    let left = (T.x + T.w / 2) * z - kw / 2, top = (T.y + T.h / 2) * z - kh / 2;
    if (C.w * z + 2 * pay <= kw) left = Math.min(Math.max(left, (C.x + C.w) * z + pay - kw), C.x * z - pay);
    if (C.h * z + 2 * pay <= kh) top = Math.min(Math.max(top, (C.y + C.h) * z + pay - kh), C.y * z - pay);
    kap.scrollLeft = Math.round(left); kap.scrollTop = Math.round(top);
  }
  /* moda göre etkin parça */
  function odakGuncelle() {
    if (genis() || !G.odakVar || tumu) {
      /* masaüstünde de: hedef kayan bir kutudaysa (ağaç, tablo) kutu hedefe gelsin */
      const el = mod === 'kesif' ? odakHd && HMS().hedefEl(odakHd) : mod === 'odev' ? simdiki() && !simdiki().oto && HMS().hedefEl(simdiki().hd) : null;
      if (el) icGetir(el);
      return;
    }
    if (mod === 'kesif') {
      const el = odakHd ? HMS().hedefEl(odakHd) : null;
      if (el) icGetir(el);
      odakYap(el, { katman: true });
    } else if (mod === 'odev') {
      const m = simdiki(), el = m && !m.oto ? HMS().hedefEl(m.hd) : null;
      if (el) icGetir(el);
      odakYap(el, { katman: !el });
    } else if (iz && !iz.anim) {
      const kr = iz.kareler[iz.f];
      if (kr.t === 'giris') { const m = iz.o.adimlar[kr.adim].mikro[0]; const el = m.oto ? null : HMS().hedefEl(m.hd); if (el) icGetir(el); odakYap(el, { katman: !el }); }
      else if (iz.imlec) odakYap(null, { katman: true, nokta: iz.imlec });
      else odakYap(null, { katman: true });
    }
  }

  /* ======================================================================== ADIM ADIM İZLE
     Kareler: her büyük adım için bir «giriş» + her mikro için bir «tık» + sonda «son».
     İleri: imleç hedefe gider, nabız, eylem uygulanır. Geri/atlama: baştan kurup o kareye kadar sarılır. */
  const HIZ = {
    normal: { yol: 650, nabiz: 380, oku: 2600, giris: 5600, oto: 240 },
    yavas: { yol: 1050, nabiz: 650, oku: 5200, giris: 10000, oto: 480 },
    test: { yol: 0, nabiz: 0, oku: 0, giris: 0, oto: 0 },
  };
  const IK = {
    geri: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5 5.5 8l4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ileri: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    oynat: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6L12.6 8z" fill="currentColor"/></svg>',
    dur: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 3.2h2.6v9.6H4.5zm4.4 0h2.6v9.6H8.9z" fill="currentColor"/></svg>',
  };
  let iz = null, izHiz = 'normal';
  const izOlcum = []; // test için: her tıkta hedefin görünürlüğü
  try { if (localStorage.getItem('hms-iz-hiz') === 'yavas') izHiz = 'yavas'; } catch (e) { /* yok */ }
  const izAcik = {}; // açılır katmanların durumu, kareler arasında korunur

  function izKareler(o) { const k = []; o.adimlar.forEach((a, i) => { k.push({ t: 'giris', adim: i }); a.mikro.forEach((m, j) => k.push({ t: 'tik', adim: i, mik: j })); }); k.push({ t: 'son' }); return k; }
  const izMikro = (kr) => iz.o.adimlar[kr.adim].mikro[kr.mik];
  const izAdimKare = (o, i) => { let n = 0; for (let j = 0; j < i; j++) n += 1 + o.adimlar[j].mikro.length; return n; };
  function tabanKur(o) { HMS().bosalt(true); if (o.id === 'hw1') HMS().bosalt(false); else { ileriSar(tumMikro(ODEV[0])); sadele(); } }

  /* «Bu parça ne?» anahtarı — eylemden ÖNCEKİ duruma göre */
  function izAnahtar(hd) {
    const S = HMS().durum();
    if (hd.startsWith('oto:')) return 'oto:olcerler';
    if (hd.startsWith('cbo:')) { if (S.combo) { if (S.combo.yol === 'S.secKosu') return 'tb:secKosu'; const k = 'cb:' + S.combo.yol.split('.').pop(); if (AC[k]) return k; } return null; }
    if (hd.startsWith('harita:hayalet:')) return { sb: 'tb:subbasin', r: 'tb:reach', j: 'tb:junction' }[hd.slice(15).replace(/\d/g, '')] || 'bolge:masa';
    if (hd.startsWith('satir:')) { const t = hd.slice(6).split('.')[0]; const k = { alan: 'mi:Parameters/Subbasin Area', kayip: 'mi:Parameters/Loss', clark: 'mi:Parameters/Transform', taban: 'mi:Parameters/Baseflow', atama: 'ce:Specified Hyetograph' }[t]; if (k) return k; }
    return acAnahtar(hd);
  }

  /* geometri: hedefin benzetim içinde gerçekten görünen dikdörtgeni */
  const olcekS = () => { const h = $('#hms'); return h.getBoundingClientRect().width / h.offsetWidth || 1; };
  function gorunurDortgen(el) {
    const r = el.getBoundingClientRect(), kap = $('.sim-kap');
    let L = r.left, T = r.top, R = r.right, B = r.bottom;
    for (let a = el.parentElement; a; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') { const q = a.getBoundingClientRect(); L = Math.max(L, q.left); T = Math.max(T, q.top); R = Math.min(R, q.right); B = Math.min(B, q.bottom); }
      if (a === kap) break;
    }
    return { L, T, R, B, var: R - L >= 2 && B - T >= 2 };
  }
  /* hedef kendi içinde kayan bir kutudaysa (ağaç, tablo, liste) o kutuyu hedefe getir */
  function icGetir(el) {
    const s = olcekS(), kap = $('.sim-kap');
    for (let a = el.parentElement; a && a !== kap; a = a.parentElement) {
      if (a.scrollHeight <= a.clientHeight + 1 && a.scrollWidth <= a.clientWidth + 1) continue;
      const cs = getComputedStyle(a); if (!/(auto|scroll)/.test(cs.overflowX + cs.overflowY)) continue;
      const q = a.getBoundingClientRect(), r = el.getBoundingClientRect();
      if (r.top < q.top) a.scrollTop -= (q.top - r.top) / s + 4; else if (r.bottom > q.bottom) a.scrollTop += Math.min(r.top - q.top, r.bottom - q.bottom) / s + 4;
      if (r.left < q.left) a.scrollLeft -= (q.left - r.left) / s + 4; else if (r.right > q.right) a.scrollLeft += Math.min(r.left - q.left, r.right - q.right) / s + 4;
    }
  }
  /* ve telefonda sahneyi hedefe yaklaştır */
  function gorunurYap(el) { icGetir(el); odakYap(el); }
  function izMerkez(el) {
    const g = gorunurDortgen(el), h = $('#hms').getBoundingClientRect(), s = olcekS();
    let cx, cy;
    if (g.var) { cx = (g.L + g.R) / 2; cy = (g.T + g.B) / 2; } else { const r = el.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
    return { x: Math.round((cx - h.left) / s), y: Math.round((cy - h.top) / s) };
  }
  function izOlcumYaz(hd, el) {
    const g = gorunurDortgen(el), ust = genis() ? ustH() : Math.max(ustH(), $('.sim-sahne').getBoundingClientRect().top);
    const T = Math.max(g.T, ust), B = Math.min(g.B, window.innerHeight), L = Math.max(g.L, 0), R = Math.min(g.R, window.innerWidth);
    izOlcum.push({ odev: iz.o.id, f: iz.f, hd, gor: g.var && B - T >= 2 && R - L >= 2 });
    if (izOlcum.length > 4000) izOlcum.shift();
  }

  /* imleç: #simic içinde, mantıksal konum × ölçek (sahne odakta gezinince birlikte gider) */
  function imlecKoy(c, ms) {
    const im = $('#imlec'); if (!im || !c) return;
    const s = olcekS();
    im.hidden = false; im.classList.remove('sag');
    im.style.transitionDuration = (iz && iz.acele ? 0 : ms || 0) + 'ms';
    im.style.transform = `translate(${Math.round(c.x * s)}px, ${Math.round(c.y * s)}px)`;
  }
  function imlecTik(sag) { const im = $('#imlec'); if (!im) return; im.classList.remove('tik'); im.classList.toggle('sag', !!sag); void im.offsetWidth; im.classList.add('tik'); }
  function imlecYerlestir() { const h = $('#hms'); imlecKoy(iz.imlec || { x: Math.round(h.offsetWidth * 0.62), y: Math.round(h.offsetHeight * 0.7) }, 0); }

  /* bekleme: İleri'ye yeniden basılınca (acele) ya da iptal edilince hemen biter */
  function bekle(ms) { return new Promise((r) => { if (!ms || !iz || iz.acele) { r(); return; } const t = setTimeout(() => { if (iz) iz.uyan = null; r(); }, ms); iz.uyan = () => { clearTimeout(t); r(); }; }); }
  function uyandir() { if (iz && iz.uyan) { const u = iz.uyan; iz.uyan = null; u(); } }
  function izAcele() { if (!iz) return; iz.acele = true; uyandir(); }

  /* durum: f karesine kadar baştan kur (Geri ve atlama). Sağ tıklar ve son tık ölçülerek uygulanır (menü yeri, imleç). */
  function izSar(f, sessiz) {
    const K = iz.kareler; let son = -1;
    for (let i = f; i >= 0; i--) if (K[i].t === 'tik') { son = i; break; }
    tabanKur(iz.o);
    if (!sessiz) iz.imlec = null;
    for (let i = 0; i <= son; i++) {
      const kr = K[i]; if (kr.t !== 'tik') continue;
      const m = izMikro(kr), dizi = m.oto || [m];
      if (i === son && !sessiz) iz.parca[i] = izAnahtar(m.hd);
      dizi.forEach((x, j) => {
        const o = { doldur: true, sag: x.sag, cizme: true }, sonMu = i === son && j === dizi.length - 1;
        if (x.sag || sonMu) {
          HMS().hedef(x.hd); HMS().ciz(); const he = HMS().hedefEl(x.hd);
          if (he) { gorunurYap(he); Object.assign(o, izMerkez(he)); if (sonMu && !sessiz) iz.imlec = { x: o.x, y: o.y }; }
        }
        HMS().yap(x.yap || x.hd, o);
      });
    }
    HMS().hedef(null);
    if (!sessiz) { if (K[f].t === 'giris') izOnizle(); HMS().ciz(); }
  }
  /* giriş karesinde: birazdan tıklanacak ilk parçayı vurgula */
  function izOnizle() { const kr = iz.kareler[iz.f]; if (kr.t !== 'giris') return; const m = iz.o.adimlar[kr.adim].mikro[0]; HMS().hedef(m.oto ? null : m.hd); }

  /* bir tıkı (ya da oto dizisini) canlandır */
  async function izOyna(m, tok) {
    const H = HIZ[iz.hizAd], dizi = m.oto || [m], alt = !!m.oto;
    for (let j = 0; j < dizi.length; j++) {
      const x = dizi[j];
      if (!iz || tok !== iz.tok) return false;
      if (alt) { const a = $('#iz-alt'); if (a) { const ayni = dizi.filter((y) => y.et === x.et); a.textContent = `${x.et} · ${ayni.indexOf(x) + 1}/${ayni.length}: ${x.ip}`; } }
      HMS().hedef(x.hd); HMS().ciz();
      let he = HMS().hedefEl(x.hd);
      if (!he && !alt) { izSar(iz.f - 1, true); HMS().hedef(x.hd); HMS().ciz(); he = HMS().hedefEl(x.hd); } // durum saptıysa eşitle
      let c = null;
      if (he) {
        gorunurYap(he); c = izMerkez(he); izOlcumYaz(x.hd, he);
        const sure = alt ? H.oto : H.yol;
        imlecKoy(c, sure); await bekle(sure); if (!iz || tok !== iz.tok) return false;
        imlecTik(x.sag); await bekle(alt ? H.oto / 2 : H.nabiz); if (!iz || tok !== iz.tok) return false;
      }
      HMS().yap(x.yap || x.hd, Object.assign({ doldur: true, sag: x.sag, cizme: true }, c || {}));
      HMS().hedef(null); HMS().ciz();
      if (c) { iz.imlec = c; odakYap(null, { katman: true, nokta: c, kalsin: true }); } // açılan pencere/menü de görünsün, imleç sahnede kalsın
    }
    return true;
  }

  async function izIleri(elle) {
    if (!iz) return;
    if (elle && iz.oynuyor) izDur();
    if (iz.anim) { izAcele(); return; }
    const f = iz.f + 1; if (f >= iz.kareler.length) return;
    const kr = iz.kareler[f], tok = ++iz.tok;
    iz.f = f;
    if (kr.t === 'tik') {
      iz.anim = true; iz.acele = false;
      HMS().hedef(null); HMS().ciz();
      izPanel(true); odakla(); izDuyur();
      const ok = await izOyna(izMikro(kr), tok);
      if (!ok || !iz || tok !== iz.tok) return;
      iz.anim = false; iz.acele = false;
      const d = $('#panel .iz-degisti'); if (d) d.classList.remove('bekliyor');
      izKontrolGuncelle();
    } else {
      fazGor = null;
      izOnizle(); HMS().ciz(); izPanel(false); odakla(); izDuyur();
    }
  }
  function izGit(f) {
    if (!iz) return;
    f = Math.max(0, Math.min(iz.kareler.length - 1, f));
    iz.tok++; iz.anim = false; iz.acele = false; uyandir();
    iz.f = f; izSar(f); imlecYerlestir(); izPanel(false); odakla(); izDuyur();
  }
  function izGeri() { if (!iz) return; izDur(); izGit(iz.f - 1); }
  function izDur() { if (!iz) return; iz.oynuyor = false; if (iz.oyunUyan) { const u = iz.oyunUyan; iz.oyunUyan = null; u(); } izKontrolGuncelle(); }
  async function izOynat() {
    if (!iz || iz.oynuyor) return;
    if (iz.f >= iz.kareler.length - 1) izGit(0);
    iz.oynuyor = true; const no = ++iz.oyunNo; izKontrolGuncelle();
    while (iz && iz.oynuyor && iz.oyunNo === no && iz.f < iz.kareler.length - 1) {
      await izIleri(false);
      if (!iz || !iz.oynuyor || iz.oyunNo !== no) break;
      const H = HIZ[iz.hizAd], ms = iz.kareler[iz.f].t === 'giris' ? H.giris : H.oku;
      if (iz.f >= iz.kareler.length - 1) break;
      await new Promise((r) => { const t = setTimeout(r, ms); iz.oyunUyan = () => { clearTimeout(t); r(); }; });
    }
    if (iz && iz.oyunNo === no) { iz.oynuyor = false; izKontrolGuncelle(); }
  }
  function izHizDegis(v) {
    izHiz = v || (izHiz === 'normal' ? 'yavas' : 'normal');
    if (izHiz !== 'test') try { localStorage.setItem('hms-iz-hiz', izHiz); } catch (e) { /* yok */ }
    if (iz) iz.hizAd = izHiz; izKontrolGuncelle();
  }

  function izBasla(id, f) {
    const izdeydi = mod === 'izle';
    if (iz) izKapat(true);
    const o = simOdev(id) || SIM[0];
    mod = 'izle'; odev = o; adim = 0; mik = 0; sonAc = null; fazGor = null; tumu = false;
    iz = { o, kareler: izKareler(o), f: 0, tok: 0, anim: false, acele: false, oynuyor: false, oyunNo: 0, hizAd: izHiz, imlec: null, parca: {}, uyan: null, oyunUyan: null };
    $('.sim-alan').classList.add('izle');
    if (!izdeydi) olcekle(); // panel genişliği ve telefondaki sahne yüksekliği değişti
    iz.f = Math.max(0, Math.min(iz.kareler.length - 1, f || 0));
    izSar(iz.f); imlecYerlestir(); panelCiz(); izDuyur();
  }
  function izKapat(yerinde) {
    if (!iz) return;
    iz.tok++; iz.oynuyor = false; uyandir(); if (iz.oyunUyan) iz.oyunUyan();
    iz = null; HMS().hedef(null);
    if (!yerinde) { const im = $('#imlec'); if (im) im.hidden = true; $('.sim-alan').classList.remove('izle'); }
  }
  function izNot(t) { const n = $('#iz-not'); if (!n) return; n.textContent = t; n.hidden = false; clearTimeout(izNot.z); izNot.z = setTimeout(() => { n.hidden = true; }, 4500); }
  function izDuyur() {
    const d = $('#iz-duyuru'); if (!d || !iz) return; const kr = iz.kareler[iz.f];
    d.textContent = kr.t === 'son' ? `${iz.o.ad} izlendi.` : kr.t === 'giris' ? `${iz.o.ad}, adım ${kr.adim + 1}: ${iz.o.adimlar[kr.adim].baslik}` : `Adım ${kr.adim + 1}, tık ${kr.mik + 1}: ${izMikro(kr).iz || izMikro(kr).ip}`;
  }

  /* panel: üst kısım + içerik yeniden yazılır, kontrol çubuğu yerinde kalır (odak kaybolmasın) */
  const izKatAcik = (id, giris) => (izAcik[id] != null ? izAcik[id] : giris && id === 'neden');
  function izKatman(id, baslik, ic, giris) {
    if (!ic) return '';
    const ac = izKatAcik(id, giris);
    return `<div class="iz-kat iz-kat-${id}"><button type="button" class="kt-b" data-iz-kat="${id}" aria-expanded="${ac}">${baslik}</button><div class="kt-ic"${ac ? '' : ' hidden'}>${ic}</div></div>`;
  }
  function izKatmanlar(a, z, key, giris) {
    let h = '';
    if (key && AC[key]) { const p = AC[key]; h += izKatman('parca', `Bu parça ne? · ${kac(p.b)}`, `<p class="iz-pt">${kac(p.t)}</p>${liste(p.m)}${p.d ? liste(p.d) : ''}`, giris); }
    h += izKatman('neden', 'Neden bu adım?', liste(z.neden || a.neden), giris);
    h += izKatman('dikkat', 'Dikkat · sık hata', liste(z.dikkat, 'dikkat'), giris);
    if (z.teori) h += izKatman('teori', `Teori köprüsü · ${kac(z.teori.b)}`, liste(z.teori.m), giris);
    return h;
  }
  /* şerit: her bölüm bir büyük adım; dolu = bitti, çerçeveli = şimdi; aşama sınırında boşluk */
  function izSerit() {
    const o = iz.o, kr = iz.kareler[iz.f], aktif = kr.t === 'son' ? o.adimlar.length : kr.adim;
    return `<div class="iz-serit" role="group" aria-label="Büyük adımlar">${o.adimlar.map((a, i) => {
      const cls = (i < aktif ? 'bitti' : i === aktif ? 'simdi' : '') + (i > 0 && a.faz !== o.adimlar[i - 1].faz ? ' bol' : '');
      const dol = i === aktif && kr.t === 'tik' ? Math.round(((kr.mik + 1) / a.mikro.length) * 100) : 0;
      return `<button type="button" class="${cls.trim()}" data-iz-adim="${i}" title="${i + 1}. ${kac(a.baslik)}" aria-label="Adım ${i + 1}: ${kac(a.baslik)}"${i === aktif ? ' aria-current="step"' : ''}>${i + 1}${dol ? `<i style="width:${dol}%"></i>` : ''}</button>`;
    }).join('')}</div>`;
  }
  function izIc(bekliyor) {
    const o = iz.o, K = iz.kareler, kr = K[iz.f], N = o.adimlar.length;
    const ust = (konum) => `<div class="iz-ust"><div class="iz-odev" role="group" aria-label="İzlenen anlatım">${SIM.map((x) => `<button type="button" data-mod="izle-${x.id}" aria-pressed="${x.id === o.id}" title="${x.ad}">${x.etiket}</button>`).join('')}</div><p class="iz-konum">${konum}</p><button type="button" class="pn-bas" data-iz="bas">Baştan</button></div>`;
    const not = '<p class="iz-not" id="iz-not" role="status" hidden></p>';
    if (kr.t === 'son') {
      return ust(`${N} adım · <b>bitti</b>`) + izSerit() + not + `<h2 class="pn-h">${o.ad} izlendi.</h2><p class="pn-t">Benzetimdeki proje öğreticinin son hâliyle aynı.</p><div class="pn-dugmeler iz-son-d"><button type="button" class="dugme" data-mod="${o.id}">Şimdi kendin yap (rehberli mod)</button>${o.id === 'hw1' ? '<button type="button" class="dugme ikincil" data-mod="izle-hw2">Yağış–akış benzetimini izle</button>' : '<button type="button" class="dugme ikincil" data-mod="kesif">Keşfe dön</button>'}</div><p class="iz-k iz-son-k">Özet</p>${liste(o.izleSon)}`;
    }
    const a = o.adimlar[kr.adim], z = a.izle || {}, giris = kr.t === 'giris';
    const konum = `Adım ${kr.adim + 1}/${N} · <b>${giris ? 'giriş' : `tık ${kr.mik + 1}/${a.mikro.length}`}</b>`;
    const bol = o.bolumler && a.bolum ? `<p class="pn-bol${giris ? '' : ' tikte'}">${a.bolum} · ${kac(o.bolumler[a.bolum - 1])}</p>` : '';
    let govde;
    if (giris) {
      govde = `<div class="iz-giris"><p class="iz-k">Bu adımda</p>${liste(z.giris || a.ne)}${z.sonunda ? `<p class="iz-sonunda"><b>Sonunda:</b> ${kac(z.sonunda)}</p>` : ''}</div>${degerTablo(a.tablo)}${izKatmanlar(a, z, null, true)}${soruHTML(a)}<p class="pn-not">İleri ile ilk tıka geçilir. Benzetimde vurgulu parça, birazdan tıklanacak yer.</p>`;
    } else {
      const m = izMikro(kr);
      if (!iz.parca[iz.f]) iz.parca[iz.f] = izAnahtar(m.hd);
      govde = `<div class="pn-simdi iz-simdi"><span>Şimdi ne yapıyorum${m.sag ? ' · sağ tık' : ''}</span><b>${kac(m.iz || m.ip)}</b>${m.oto ? '<p class="iz-alt" id="iz-alt"></p>' : ''}</div><div class="iz-degisti${bekliyor ? ' bekliyor' : ''}"><span>Ekranda ne değişti</span><p>${kac(m.sonra || '')}</p></div>${m.dikkat ? `<p class="iz-mdikkat">${kac(m.dikkat)}</p>` : ''}${izKatmanlar(a, z, iz.parca[iz.f], false)}${kr.mik === a.mikro.length - 1 ? soruHTML(a) : ''}`;
    }
    const yuzde = Math.round((100 * iz.f) / (K.length - 1));
    return ust(konum) + izSerit() + `<div class="iz-ilerleme" aria-hidden="true"><i style="width:${yuzde}%"></i></div>` + not + bol + `<h2 class="pn-h iz-h${giris ? '' : ' tikte'}">${kac(a.baslik)}</h2>` + govde;
  }
  function izKontrolHTML() {
    return `<div class="iz-kontrol"><button type="button" class="iz-b" data-iz="geri" aria-label="Geri (sol ok)">${IK.geri}<span>Geri</span></button><button type="button" class="iz-b ana" data-iz="oynat" aria-pressed="false"></button><button type="button" class="iz-b" data-iz="ileri" aria-label="İleri (sağ ok)"><span>İleri</span>${IK.ileri}</button><button type="button" class="iz-hiz" data-iz="hiz"></button></div>`;
  }
  function izKontrolGuncelle() {
    const k = $('#panel .iz-kontrol'); if (!k || !iz) return;
    const son = iz.kareler.length - 1;
    $('[data-iz="geri"]', k).disabled = iz.f <= 0;
    $('[data-iz="ileri"]', k).disabled = iz.f >= son;
    const o = $('[data-iz="oynat"]', k);
    o.innerHTML = iz.oynuyor ? `${IK.dur}<span>Durdur</span>` : `${IK.oynat}<span>${iz.f >= son ? 'Baştan' : 'Oynat'}</span>`;
    o.setAttribute('aria-pressed', String(iz.oynuyor)); o.setAttribute('aria-label', iz.oynuyor ? 'Otomatik oynatmayı durdur (boşluk)' : 'Otomatik oynat (boşluk)');
    const h = $('[data-iz="hiz"]', k); h.innerHTML = `<small>Hız</small><b>${iz.hizAd === 'yavas' ? 'Yavaş' : 'Normal'}</b>`; h.setAttribute('aria-label', `Oynatma hızı: ${iz.hizAd === 'yavas' ? 'yavaş' : 'normal'}. Değiştirmek için bas.`);
  }
  function izPanel(bekliyor) {
    const p = $('#panel'); if (!iz) return;
    if (!$('.iz-kontrol', p)) p.innerHTML = panelKabuk('', izKontrolHTML());
    const ic = $('.pn-ic', p); ic.innerHTML = izIc(bekliyor); ic.scrollTop = 0;
    izKontrolGuncelle();
    secimCiz();
  }

  /* ---------------------------------------------------------------- uygulamalar bölümü
     Geniş düzen: anlatım başlığı + bilgi kartları, sonra aşama aşama adım kartları (ızgara). Her kartta: değerler, ekranlar (büyütülür),
     «Ayrıntı» katmanı, «Kendini dene» (önce düşün → aç), «Benzetimde yap» (rehberli), «Bu adımı izle», «Bitirdim» (bu tarayıcıda). */
  let BITTI = new Set();
  try { BITTI = new Set(JSON.parse(localStorage.getItem('hms-bitti') || '[]')); } catch (e) { BITTI = new Set(); }
  const bittiYaz = () => { try { localStorage.setItem('hms-bitti', JSON.stringify([...BITTI])); } catch (e) { /* depolama kapalı */ } };
  const bitSay = (o, bas, son) => { let n = 0; for (let i = bas; i < son; i++) if (BITTI.has(`${o.id}:${i}`)) n++; return n; };
  function ilerlemeGuncelle() {
    ODEV.forEach((o) => {
      const N = o.adimlar.length, n = bitSay(o, 0, N), e = $(`#${o.capa} .od-ilerleme`);
      if (e) { $('b', e).textContent = `${n}/${N}`; $('i', e).style.width = `${Math.round((100 * n) / N)}%`; }
      o.fazlar.forEach((f, fi) => {
        const t = `${bitSay(o, f.bas, f.son)}/${f.son - f.bas}`, c = $(`.bs-c[data-hedef="${o.capa}-f${fi + 1}"] span`), h = $(`#${o.capa}-f${fi + 1} .faz-say`);
        if (c) c.textContent = t; if (h) h.textContent = `${t} bitti`;
      });
    });
  }
  function adimKart(o, a, i) {
    const resim = [].concat(a.img || []), an = `${o.id}:${i}`, bitti = BITTI.has(an);
    const res = resim.length ? `<div class="ak-res r${Math.min(resim.length, 2)}">${resim.map((r) => `<figure><button type="button" class="ak-buyut" data-isik="${r}" aria-label="Büyüt: ${kac(IMG[r])}"><img src="img/${r}.webp" alt="${kac(IMG[r])}" loading="lazy" decoding="async"></button><figcaption>${kac(IMG[r])} · ${RESMI.has(r) ? 'öğreticideki ekran' : 'HEC-HMS 4.14 ekranı'}</figcaption></figure>`).join('')}</div>` : '';
    const dene = a.soru ? soruHTML(a) : `<div class="soru"><p class="soru-et">Kendini dene</p><p class="soru-s">Bu adım neden gerekli? Önce kendin düşün.</p><button type="button" class="kt-b" aria-expanded="false">Cevabı aç</button><div class="kt-ic" hidden>${liste(a.neden)}</div></div>`;
    /* benzetimi olmayan anlatımda (CBS) yalnız gerçek ekran büyütücüsü ve «Bitirdim» */
    const sim = o.benzetim !== false ? `<button type="button" class="dugme adim-git" data-git="${o.id}:${i}">Benzetimde yap</button><button type="button" class="dugme ikincil adim-izle" data-git="izle:${o.id}:${i}">Bu adımı izle</button>` : '';
    return `<li class="ak${bitti ? ' bitti' : ''}" id="${o.capa}-${i + 1}"><div class="ak-ust"><span class="ak-no">${i + 1}</span><h5>${kac(a.baslik)}</h5></div>${a.ne && a.ne.length ? `<p class="ak-ne"><b>Ne:</b> ${kac(a.ne[0])}</p>` : ''}${degerTablo(a.tablo)}${res}${katman(a, o.id + i, !a.soru, true)}${dene}<div class="ak-d">${sim}<button type="button" class="ak-bitti" data-bitti="${an}" aria-pressed="${bitti}">${bitti ? 'Bitti' : 'Bitirdim'}</button></div></li>`;
  }
  function odevlerCiz() {
    const k = $('#uygulamalar');
    const nav = ODEV.map((o) => `<a class="bs-c ana" href="#${o.capa}" data-hedef="${o.capa}">${o.ad}</a>` + o.fazlar.map((f, fi) => `<a class="bs-c" href="#${o.capa}-f${fi + 1}" data-hedef="${o.capa}-f${fi + 1}">${kac(f.kisa)} <span>0/${f.son - f.bas}</span></a>`).join('')).join('');
    k.innerHTML = `<header class="bolum-bas"><p class="ust-eti">MTO 316 · Hidrometeoroloji</p><h2 id="uygulamalar-h">Uygulamalı anlatımlar</h2><p class="bolum-alt">Üç model, adım adım: havza modeli, yağış–akış benzetimi, CBS ile alt havzalar. Değerler tabloda, program alan adları İngilizce.</p></header>
      <nav class="bu-sayfada" aria-label="Uygulamalarda git"><span class="bs-et">Bu sayfada</span>${nav}</nav>` + ODEV.map((o) => {
      const kartlar = `<section class="od-k"><h4>Bu anlatımda öğrendiklerin</h4><ol class="istenen">${o.ogren.map((x) => `<li>${kac(x)}</li>`).join('')}</ol></section><section class="od-k"><h4>Resmî öğretici (İngilizce)</h4><ul class="baglar">${o.bag.map(([a, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${kac(a)} ↗</a></li>`).join('')}</ul></section>${o.tuzak ? `<section class="od-k uyari"><h4>Labda görülen tuzaklar</h4>${liste(o.tuzak, 'dikkat')}</section>` : ''}`;
      const fazlar = o.fazlar.map((f, fi) => {
        const bol = o.bolumler ? [...new Set(o.adimlar.slice(f.bas, f.son).map((a) => a.bolum))].map((b) => `${b} · ${o.bolumler[b - 1]}`).join(' / ') : '';
        const ad = `${o.capa}-f${fi + 1}`;
        return `<section class="faz" id="${ad}" aria-labelledby="${ad}-h"><header class="faz-bas"><h4 id="${ad}-h"><span class="faz-no">${fi + 1}</span>${kac(f.ad)}</h4><p class="faz-alt"><span>${f.son - f.bas} adım</span><span class="faz-say"></span>${bol ? `<span>Öğretici: ${kac(bol)}</span>` : ''}</p></header><ol class="ak-izgara">${o.adimlar.slice(f.bas, f.son).map((a, j) => adimKart(o, a, f.bas + j)).join('')}</ol></section>`;
      }).join('');
      const ekranli = o.benzetim === false;
      const sag = ekranli
        ? `<p class="od-rozet">Gerçek ekranlarla rehber · ${o.adimlar.length} adım, ${o.adimlar.reduce((n, a) => n + [].concat(a.img || []).length, 0)} ekran · benzetim yok</p>`
        : `<div class="pn-dugmeler od-d"><button type="button" class="dugme" data-git="${o.id}:0">Rehberli benzetimi başlat</button><button type="button" class="dugme ikincil" data-git="izle:${o.id}:0">Adım adım izle</button></div>`;
      return `<article class="odev${ekranli ? ' ekranli' : ''}" id="${o.capa}" aria-labelledby="${o.capa}-h"><header class="od-bas"><div class="od-sol"><p class="ust-eti">Uygulamalı anlatım ${ODEV.indexOf(o) + 1} · ${o.adimlar.length} adım</p><h3 class="odev-h" id="${o.capa}-h">${kac(o.konu)}</h3><div class="od-ilerleme"><span>Bitirdim</span><b>0/${o.adimlar.length}</b><span class="od-bar" aria-hidden="true"><i></i></span></div></div>${sag}</header><div class="od-kartlar">${kartlar}</div>${fazlar}</article>`;
    }).join('');
    ilerlemeGuncelle();
  }
  /* «Bu sayfada»: okunan aşamanın çipi vurgulanır ve şeritte görünür */
  function gezintiIzle() {
    const nav = $('.bu-sayfada'); if (!nav) return;
    const alt = ustH() + nav.offsetHeight + 24;
    let simdi = null;
    document.querySelectorAll('#uygulamalar .odev, #uygulamalar .faz').forEach((e) => { if (e.getBoundingClientRect().top <= alt) simdi = e.id; });
    if ($('#uygulamalar').getBoundingClientRect().bottom < alt) simdi = null;
    nav.querySelectorAll('.bs-c').forEach((c) => { const ac = c.dataset.hedef === simdi; c.classList.toggle('simdi', ac); if (ac) c.setAttribute('aria-current', 'location'); else c.removeAttribute('aria-current'); });
    const c = simdi && nav.querySelector(`.bs-c[data-hedef="${simdi}"]`);
    if (c && (c.offsetLeft < nav.scrollLeft || c.offsetLeft + c.offsetWidth > nav.scrollLeft + nav.clientWidth)) nav.scrollLeft = c.offsetLeft - 80;
  }
  /* ekran görüntüsü büyütücü */
  let isikDonus = null;
  function isikAc(r, kaynak) {
    const k = $('#isik'); isikDonus = kaynak || null;
    $('img', k).src = `img/${r}.webp`; $('img', k).alt = IMG[r] || ''; $('figcaption', k).textContent = `${IMG[r] || ''} · ${RESMI.has(r) ? 'öğreticideki ekran' : 'HEC-HMS 4.14 ekranı'}`;
    k.hidden = false; $('.isik-kapat', k).focus();
  }
  function isikKapat() { const k = $('#isik'); if (!k || k.hidden) return; k.hidden = true; $('img', k).removeAttribute('src'); if (isikDonus) isikDonus.focus(); }

  /* ---------------------------------------------------------------- olaylar */
  const sahneEkranda = () => { const r = $('#benzetim').getBoundingClientRect(); return r.bottom >= ustH() + 40 && r.top <= window.innerHeight - 40; };
  function olaylar() {
    document.addEventListener('click', (e) => {
      const sa = e.target.closest('.sec-ac');
      if (sa) { secAcik = !secAcik; secimCiz(); if (secAcik && e.detail === 0) { const b = $('#secpop .sk.secik'); if (b) b.focus({ preventScroll: true }); } return; }
      if (secAcik && !e.target.closest('#secpop')) { secAcik = false; secimCiz(); }
      if (e.target.closest('#secpop [data-oge], #secpop [data-faz-adim]')) secAcik = false;
      const ib0 = e.target.closest('[data-isik]');
      if (ib0) { isikAc(ib0.dataset.isik, ib0); return; }
      if (e.target.closest('.isik-kapat') || e.target.id === 'isik' || e.target.closest('#isik figure')) { isikKapat(); return; }
      const bt = e.target.closest('[data-bitti]');
      if (bt) {
        const an = bt.dataset.bitti, ac = !BITTI.has(an);
        if (ac) BITTI.add(an); else BITTI.delete(an);
        bittiYaz(); bt.setAttribute('aria-pressed', String(ac)); bt.textContent = ac ? 'Bitti' : 'Bitirdim';
        const kart = bt.closest('.ak'); if (kart) kart.classList.toggle('bitti', ac);
        ilerlemeGuncelle(); return;
      }
      const kb = e.target.closest('.kt-b');
      if (kb) { const ic = kb.nextElementSibling; const ac = kb.getAttribute('aria-expanded') !== 'true'; kb.setAttribute('aria-expanded', String(ac)); if (ic) ic.hidden = !ac; if (kb.dataset.izKat) izAcik[kb.dataset.izKat] = ac; return; }
      if (e.target.closest('[data-gir], #ust a[href="#benzetim"]')) { e.preventDefault(); benzetimeIn(); return; }
      const md = e.target.closest('[data-mod]');
      if (md) {
        const v = md.dataset.mod;
        if (v === 'kesif') kur('kesif');
        else if (v === 'izle') izBasla(iz ? iz.o.id : 'hw1', 0);
        else if (v.startsWith('izle-')) { if (!simOdev(v.slice(5))) return; izBasla(v.slice(5), 0); }
        else if (simOdev(v)) kur('odev', v, 0);
        else return;
        odakla(); return;
      }
      /* seçim listesi */
      const kt = e.target.closest('[data-kat]');
      if (kt) { const i = KESIF.findIndex((c) => c.id === kt.dataset.kat); if (i >= 0 && i !== kesKat) { kesKat = i; secimCiz(); } if (genis()) sayfaHizala(); return; }
      const og = e.target.closest('[data-oge]');
      if (og) { kesifSec(+og.dataset.oge); return; }
      const ky = e.target.closest('[data-kes-yon]');
      if (ky) { kesifSec(((kesSec == null ? -1 : kesSec) + +ky.dataset.kesYon + KOGE.length) % KOGE.length); return; }
      const fz = e.target.closest('[data-faz]');
      if (fz) { fazGor = +fz.dataset.faz; secimCiz(); if (genis()) sayfaHizala(); return; }
      const fa = e.target.closest('[data-faz-adim]');
      if (fa) {
        const i = +fa.dataset.fazAdim; fazGor = null; tumu = false;
        if (mod === 'izle' && iz) { izDur(); izGit(izAdimKare(iz.o, i)); } else if (odev) { kur('odev', odev.id, i); odakla(); }
        return;
      }
      const ib = e.target.closest('[data-iz]');
      if (ib && iz) {
        const v = ib.dataset.iz;
        if (v === 'ileri') izIleri(true);
        else if (v === 'geri') izGeri();
        else if (v === 'oynat') { if (iz.oynuyor) izDur(); else izOynat(); }
        else if (v === 'hiz') izHizDegis();
        else if (v === 'bas') { izDur(); izGit(0); }
        return;
      }
      const ia = e.target.closest('[data-iz-adim]');
      if (ia && iz) { izDur(); fazGor = null; izGit(izAdimKare(iz.o, +ia.dataset.izAdim)); return; }
      const git = e.target.closest('[data-git]');
      if (git) {
        const p = git.dataset.git.split(':');
        if (p[0] === 'izle') { const o = simOdev(p[1]); if (!o) return; izBasla(o.id, izAdimKare(o, +p[2])); }
        else { if (!simOdev(p[0])) return; kur('odev', p[0], +p[1]); }
        benzetimeIn(); setTimeout(odakla, 30); return;
      }
      if (e.target.closest('#goster')) { goster(); return; }
      if (e.target.closest('#atla')) { atla(); return; }
      const ot = e.target.closest('#panel [data-hd]');
      if (ot && mod === 'odev') { tik(ot.dataset.hd, { el: ot }); }
    });
    /* klavye (benzetim ekrandayken): izlemede ← geri, → ileri, boşluk oynat/durdur; keşifte ←/→ önceki/sonraki parça */
    document.addEventListener('keydown', (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if (mod === 'kesif' && kesSec != null && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        if (!sahneEkranda()) return;
        e.preventDefault(); kesifSec((kesSec + (e.key === 'ArrowRight' ? 1 : -1) + KOGE.length) % KOGE.length); return;
      }
      if (mod !== 'izle' || !iz || !sahneEkranda()) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); izIleri(true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); izGeri(); }
      else if (e.key === ' ' && !(t && t.closest && t.closest('button, a'))) { e.preventDefault(); if (iz.oynuyor) izDur(); else izOynat(); }
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden && iz && iz.oynuyor) izDur(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { isikKapat(); if (secAcik) { secAcik = false; secimCiz(); const b = $('.sec-ac'); if (b) b.focus(); } } });
    let gz = 0; window.addEventListener('scroll', () => { if (gz) return; gz = requestAnimationFrame(() => { gz = 0; gezintiIzle(); }); }, { passive: true });
    /* telefonda «Tümü» ↔ «Yakınlaş» */
    $('#buyut').addEventListener('click', () => {
      tumu = !tumu;
      if (tumu) { olcekUygula(G.fit); const k = $('.sim-kap'); k.scrollLeft = 0; k.scrollTop = 0; } else odakGuncelle();
      tumuGuncelle();
    });
    let z, sonGenis = genis();
    window.addEventListener('resize', () => { clearTimeout(z); z = setTimeout(() => { if (sonGenis !== genis()) { sonGenis = genis(); if (mod === 'kesif' && !sonAc) panelCiz(); } olcekle(); }, 80); });
  }

  /* ---------------------------------------------------------------- başlat */
  iskelet();
  window.HMS.kur($('#hms'), { tik, rehberli: () => mod === 'odev' || mod === 'izle' });
  odevlerCiz();
  olaylar();
  kur('kesif');
  olcekle();
  if (location.hash === '#benzetim') setTimeout(benzetimeIn, 60);
  /* eski çapalar (26 Kas): #odevler, #hw1…#hw3 (+ -f<n>, -<n>) → #uygulamalar, ODEV[].capa; eski bağlar kırılmaz */
  const ESKI_CAPA = new Map([['odevler', 'uygulamalar'], ...ODEV.map((o) => [o.id, o.capa])]);
  function eskiCapa() {
    let h = ''; try { h = decodeURIComponent(location.hash.slice(1)); } catch (e) { return; }
    const m = /^(odevler|hw\d)(-.*)?$/.exec(h); if (!m || !ESKI_CAPA.has(m[1])) return;
    const yeni = ESKI_CAPA.get(m[1]) + (m[2] || '');
    history.replaceState(null, '', '#' + yeni);
    const el = document.getElementById(yeni); if (el) el.scrollIntoView();
  }
  if (/^#(odevler|hw\d)/.test(location.hash)) setTimeout(eskiCapa, 60);
  window.addEventListener('hashchange', eskiCapa);
  window.OKUL_SAYFA = {
    kur, goster, atla, durum: () => ({ mod, odev: odev && odev.id, adim, mik }), simdiki, acAnahtar, odakla,
    kesif: {
      sec: kesifSec, liste: () => KOGE.map((o) => ({ i: o.i, k: o.k, et: o.et, kat: KESIF[o.kat].id, hd: o.hd })),
      /* test: seçili parçanın vurgusu benzetimde görünüyor mu (kayan kutular ve sahne kırpması düşülür) */
      gorunur: () => { const o = KOGE[kesSec]; if (!o) return null; const el = o.hd ? HMS().hedefEl(o.hd) : $('#hms .h-dk.ust .h-dlg'); if (!el) return { var: false, yok: true }; const g = gorunurDortgen(el); return { var: g.var, w: Math.round(g.R - g.L), h: Math.round(g.B - g.T), baslik: ($('#panel .pn-h') || {}).textContent }; },
    },
    gorus: () => ({ s: G.s, fit: G.fit, W: G.W, H: G.H, odakVar: G.odakVar, tumu }),
    iz: {
      basla: izBasla, git: izGit, ileri: () => izIleri(true), geri: izGeri, oynat: izOynat, dur: izDur, hiz: izHizDegis,
      durum: () => (iz ? { odev: iz.o.id, f: iz.f, toplam: iz.kareler.length, kare: iz.kareler[iz.f], anim: iz.anim, oynuyor: iz.oynuyor, hiz: iz.hizAd } : null),
      olcum: () => izOlcum.slice(),
    },
  };
})();
