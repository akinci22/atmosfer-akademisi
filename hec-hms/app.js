/* HEC-HMS Okulu — sayfa: üst çubuk, büyük sahne (benzetim) + panel (keşif / rehberli ödev / adım adım izle),
   kategori kategori seçim (keşif: programın bölümleri; ödevler: aşamalar), telefonda odak yakınlaştırma, Türkçe ödev adımları. */
(function () {
  'use strict';
  const { AC, ODEV, IMG, KESIF } = window.OKUL;
  const $ = (s, k) => (k || document).querySelector(s);
  const kac = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const RESMI = new Set(['hw1-fig1', 'hw1-fig2', 'hw1-fig3', 'hw1-area', 'hw1-area-menu', 'hw1-baseflow-menu', 'hw1-loss-menu', 'hw1-loss', 'hw1-transform-menu', 'hw1-clark', 'hw1-loss-tab']);
  const genis = () => window.innerWidth >= 900;
  const ustH = () => { const u = $('#ust'); return u ? u.getBoundingClientRect().height : 0; };
  /* keşif öğeleri düz liste: «‹ Önceki · Sonraki ›» kategoriler arasında da geçer */
  const KOGE = [];
  KESIF.forEach((c, ci) => c.ogeler.forEach((o) => { o.kat = ci; o.i = KOGE.length; KOGE.push(o); }));

  /* ---------------------------------------------------------------- tema */
  const TEMA = ['sistem', 'acik', 'koyu'];
  let tema = 'sistem';
  try { tema = localStorage.getItem('hms-tema') || 'sistem'; } catch (e) { /* depolama kapalı */ }
  function temaUygula() {
    const r = document.documentElement;
    if (tema === 'acik') r.setAttribute('data-theme', 'light'); else if (tema === 'koyu') r.setAttribute('data-theme', 'dark'); else r.removeAttribute('data-theme');
    const b = $('#tema'); if (b) b.textContent = { sistem: 'Tema: sistem', acik: 'Tema: açık', koyu: 'Tema: koyu' }[tema];
  }

  /* ---------------------------------------------------------------- iskelet */
  const IMLEC = '<svg viewBox="0 0 20 24" aria-hidden="true"><path d="M2.5 1.8v17.6l4.3-4.1 3 6.6 3.1-1.4-3-6.5h6z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  function iskelet() {
    $('#ust').innerHTML = `<div class="ust-ic"><a class="ust-marka" href="../">Atmosfer Akademisi</a><span class="ust-ayrac">/</span><span class="ust-ders">MTO 316 · HEC-HMS Okulu</span><nav class="ust-nav" aria-label="Bölümler"><a href="#benzetim">Benzetim</a><a href="#odevler">Ödevler</a></nav><button type="button" class="ust-tema" id="tema"></button><a class="ust-don" href="../">Atmosfer Akademisi'ne dön</a></div>`;
    $('#tema').addEventListener('click', () => { tema = TEMA[(TEMA.indexOf(tema) + 1) % 3]; try { localStorage.setItem('hms-tema', tema); } catch (e) { /* yok */ } temaUygula(); });
    temaUygula();
    $('#ana').innerHTML = `
      <section class="hero">
        <div class="hero-ic">
          <div class="hero-sol">
            <p class="hero-ust">MTO 316 · Hidrometeoroloji</p>
            <h1>HEC-HMS Okulu</h1>
            <p class="hero-alt">Programı burada tıklayarak tanı, ödevi kendin yap ya da programın adım adım yapışını izle. Her adım Türkçe açıklamalı.</p>
            <div class="hero-d"><button type="button" class="dugme" data-gir>Programı aç</button><a class="dugme ikincil" href="#odevler">Ödevler, Türkçe</a></div>
          </div>
          <dl class="hero-kunye"><div><dt>Program</dt><dd>HEC-HMS 4.14</dd></div><div><dt>Örnek havza</dt><dd>Punxsutawney, ABD · 158 mi²</dd></div><div><dt>Fırtına</dt><dd>28 Nisan – 4 Mayıs 1996</dd></div><div><dt>Ödevler</dt><dd>HW#1 · HW#2</dd></div></dl>
        </div>
      </section>
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
      <section id="odevler" class="odevler" aria-label="Ödevler"></section>`;
    $('#alt').innerHTML = `<p>Öğretici içeriği: HEC-HMS kılavuzları (U.S. Army Corps of Engineers, Hydrologic Engineering Center). Ekranlar HEC-HMS 4.14; grafiklerdeki sayılar programın bu projedeki gerçek çıktısı.</p><p><a href="../">Atmosfer Akademisi'ne dön</a></p>`;
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
      const oran = mod === 'izle' ? 0.35 : mod === 'odev' ? 0.41 : 0.44; // izlemede panelin «şimdi + ekranda» kısmı da sığsın
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
  const HMS = () => window.HMS;
  function ileriSar(liste) { liste.forEach((m) => { if (m.oto) m.oto.forEach((x) => HMS().yap(x.yap || x.hd, { doldur: true, sag: x.sag, cizme: true })); else HMS().yap(m.yap || m.hd, { doldur: true, sag: m.sag, cizme: true }); }); }
  const tumMikro = (o, kadar) => o.adimlar.slice(0, kadar == null ? o.adimlar.length : kadar).flatMap((a) => a.mikro);
  function sadele() { const S = HMS().durum(); HMS().temizle(); S.secili = null; S.ce = null; S.arac = 'arrow'; S.xsekme = 'Components'; S.log = []; HMS().projeAcikLog(); }
  /* keşif tabanı: iki ödevin son hâli, hesap yapılmış, pencereler kapalı */
  function kesifTaban() { HMS().bosalt(true); ileriSar(tumMikro(ODEV[0])); ileriSar(tumMikro(ODEV[1])); sadele(); HMS().yap('tb:compute', { cizme: true }); HMS().temizle(); }
  function kur(yeniMod, odevId, baslangicAdim) {
    const izdeydi = mod === 'izle', eskiMod = mod;
    if (iz) izKapat();
    mod = yeniMod; odev = odevId ? ODEV.find((o) => o.id === odevId) : null; adim = baslangicAdim || 0; mik = 0; sonAc = null;
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
      return { kat, oge, et: 'Programın bölümleri' };
    }
    const o = mod === 'izle' ? (iz && iz.o) : odev; if (!o) return null;
    const N = o.adimlar.length;
    const simdi = mod === 'izle' ? (iz.kareler[iz.f].t === 'son' ? N : iz.kareler[iz.f].adim) : adim;
    const fs = o.fazlar, aktif = simdi >= N ? fs.length - 1 : o.adimlar[simdi].faz;
    const gf = fazGor != null && fs[fazGor] ? fazGor : aktif;
    const kat = fs.map((f, i) => `<button type="button" class="sk${i === gf ? ' secik' : ''}${i === aktif ? ' aktif' : ''}" data-faz="${i}" aria-pressed="${i === gf}">${kac(f.ad)}<span>${f.son - f.bas}</span></button>`).join('');
    let oge = '';
    for (let i = fs[gf].bas; i < fs[gf].son; i++) {
      const a = o.adimlar[i], d = i < simdi ? ' bitti' : i === simdi ? ' simdi' : '';
      oge += `<button type="button" class="so so-adim${d}" data-faz-adim="${i}" title="${i + 1}. ${kac(a.baslik)}" aria-label="Adım ${i + 1}: ${kac(a.baslik)}"${i === simdi ? ' aria-current="step"' : ''}><b>${i + 1}</b>${kac(a.kisa)}</button>`;
    }
    return { kat, oge, et: `${o.ad} aşamaları` };
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
      ps.innerHTML = v ? `<div class="sec-kat" role="group" aria-label="${kac(v.et)}">${v.kat}</div><div class="sec-oge" role="group" aria-label="Seçenekler">${v.oge}</div>` : '';
      const s = ps.querySelector('.so.secik, .so.simdi');
      if (s) {
        /* seçili öğe görünsün; mümkünse üstündeki grup adıyla birlikte (yapışkan kategori satırının altında yarım kalmasın) */
        const kh = ps.querySelector('.sec-kat').offsetHeight, gor = ps.clientHeight - kh;
        let g = s.previousElementSibling; while (g && !g.classList.contains('so-g')) g = g.previousElementSibling;
        const ust = g && s.offsetTop + s.offsetHeight - g.offsetTop < gor - 8 ? g.offsetTop - 4 : s.offsetTop - 6;
        if (ust - kh < ps.scrollTop) ps.scrollTop = ust - kh;
        else if (s.offsetTop + s.offsetHeight > ps.scrollTop + ps.clientHeight) ps.scrollTop = Math.min(ust - kh, s.offsetTop + s.offsetHeight - ps.clientHeight + 8);
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
    return `<div class="pn-ust"><div class="pn-mods" role="group" aria-label="Benzetim modu">${b('kesif', 'Keşif', mod === 'kesif')}${b('hw1', 'HW#1 rehberli', mod === 'odev' && odev.id === 'hw1')}${b('hw2', 'HW#2 rehberli', mod === 'odev' && odev.id === 'hw2')}${b('izle', 'İzle', mod === 'izle', ' title="Adım adım izle: program ödevi kendisi yapar"')}</div></div>`;
  }
  const satir = (eti, deger) => `<div class="pn-satir"><p class="pn-eti">${eti}</p><button type="button" class="pn-bas" data-mod="${deger}">Baştan</button></div>`;
  const liste = (a, cls) => (a && a.length ? `<ul class="pn-m${cls ? ' ' + cls : ''}">${a.map((x) => `<li>${kac(x)}</li>`).join('')}</ul>` : '');
  function degerTablo(t) { return t ? `<table class="deger"><tbody>${t.map(([a, b]) => `<tr><th>${kac(a)}</th><td>${kac(b)}</td></tr>`).join('')}</tbody></table>` : ''; }
  function katman(a, idk) {
    return `<div class="katman" data-k="${idk}"><button type="button" class="kt-b" aria-expanded="false">Ne yapıyorum?</button><div class="kt-ic" hidden>${liste(a.ne)}<button type="button" class="kt-b" aria-expanded="false">Programda nerede?</button><div class="kt-ic" hidden>${liste(a.nerede)}<button type="button" class="kt-b" aria-expanded="false">Neden bu değer?</button><div class="kt-ic" hidden>${liste(a.neden)}</div></div></div></div>`;
  }
  const soruHTML = (a) => (a.soru ? `<div class="soru"><b>Öğreticinin sorusu</b><p>${kac(a.soru[0])}</p><button type="button" class="kt-b" aria-expanded="false">Cevap</button><div class="kt-ic" hidden><p>${kac(a.soru[1])}</p></div></div>` : '');
  const panelKabuk = (ic, kontrol) => `${modSecici()}<div class="pn-sec" id="pnsec"></div><div class="pn-ic"${kontrol ? '' : ' aria-live="polite"'}>${ic}</div>${kontrol || ''}`;
  function kesifIc() {
    if (!sonAc || !AC[sonAc]) {
      return `${satir('Keşif', 'kesif')}<h2 class="pn-h">Bir parça seç.</h2><p class="pn-t">${genis() ? 'Yukarıdaki' : 'Programın altındaki'} kategorilerden seç ya da programda istediğin yere bas: program o parçayı açıp işaretler, ne işe yaradığı burada yazar.</p><p class="pn-not">Proje hazır: iki ödevin son hâli yüklü. Sağ tık (telefonda basılı tut) eleman menüsünü açar.${genis() ? '' : ' «Tümü» programın bütününü gösterir.'}</p><p class="pn-eti2">Ödevi izle</p><p class="pn-t">Program ödevi kendisi yapar; her tıkta ne olduğunu ve nedenini anlatır.</p><div class="pn-dugmeler"><button type="button" class="dugme ikincil" data-mod="izle-hw1">HW#1'i adım adım izle</button></div>`;
    }
    const a = AC[sonAc], o = kesSec != null ? KOGE[kesSec] : null;
    const ust = o
      ? `<div class="kes-ust"><button type="button" class="kes-y" data-kes-yon="-1" aria-label="Önceki parça">‹ Önceki</button><p class="kes-yer">${kac(KESIF[o.kat].ad)} · ${KESIF[o.kat].ogeler.indexOf(o) + 1}/${KESIF[o.kat].ogeler.length}</p><button type="button" class="kes-y" data-kes-yon="1" aria-label="Sonraki parça">Sonraki ›</button></div>`
      : satir('Bu ne işe yarar?', 'kesif');
    return `${ust}<h2 class="pn-h">${kac(a.b)}</h2><p class="pn-t">${kac(a.t)}</p>${liste(a.m)}${a.d ? `<button type="button" class="kt-b pn-daha" aria-expanded="false">Daha fazla</button><div class="kt-ic" hidden>${liste(a.d)}</div>` : ''}`;
  }
  function panelCiz() {
    const p = $('#panel');
    if (mod === 'izle') { p.innerHTML = panelKabuk('', izKontrolHTML()); izPanel(false); return; }
    let ic = '';
    if (mod === 'kesif') ic = kesifIc();
    else {
      const toplam = odev.adimlar.length;
      if (adim >= toplam) {
        ic = `${satir(`${odev.ad} · bitti`, odev.id)}<h2 class="pn-h">${odev.ad} tamam.</h2><p class="pn-t">Benzetimdeki proje öğreticinin son hâliyle aynı.</p>${liste(odev.id === 'hw1' ? ['3 alt havza, 1 kanal, 2 birleşim bağlı.', 'Bütün parametreler girildi; proje diske yazıldı.', 'Gerçek programda her adımın ekran görüntüsünü tek PDF yap.'] : ['Koşu hesaplandı; gözlenen akım bağlı.', 'Nash-Sutcliffe 0,952: model gözlemi çok iyi yakalıyor.', 'Gerçek programda her adımın ekran görüntüsünü tek PDF yap.'])}<div class="pn-dugmeler">${odev.id === 'hw1' ? '<button type="button" class="dugme" data-mod="hw2">HW#2\'ye geç</button>' : ''}<button type="button" class="dugme ikincil" data-mod="kesif">Keşfe dön</button></div>`;
      } else {
        const a = odev.adimlar[adim], m = a.mikro[mik];
        const bol = odev.bolumler && a.bolum ? `<p class="pn-bol">${a.bolum} · ${kac(odev.bolumler[a.bolum - 1])}</p>` : '';
        ic = `${satir(`${odev.ad} · adım ${adim + 1}/${toplam}`, odev.id)}<div class="pn-ilerleme" aria-hidden="true"><i style="width:${Math.round((adim / toplam) * 100)}%"></i></div>${bol}<h2 class="pn-h">${kac(a.baslik)}</h2>
          <div class="pn-simdi"><span>Şimdi${a.mikro.length > 1 ? ` · ${mik + 1}/${a.mikro.length}` : ''}</span><b>${kac(m.ip)}</b>${m.oto ? '<button type="button" class="dugme" data-hd="oto:olcerler">İki ölçeri de ekle</button>' : ''}</div>
          <p class="pn-ipucu" id="ipucu"></p>${degerTablo(a.tablo)}${katman(a, 'p')}${soruHTML(a)}
          <div class="pn-dugmeler"><button type="button" class="dugme" id="goster">Bu tıklamayı göster</button><button type="button" class="dugme ikincil" id="atla">Adımı benim yerime bitir</button></div>`;
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
    if (mod === 'izle') { izNot('İzleme modunda program kendisi tıklıyor. Kendin denemek için «HW#1 rehberli» ya da «HW#2 rehberli»ye geç.'); return; }
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
    const o = ODEV.find((x) => x.id === id) || ODEV[0];
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
    const ust = (konum) => `<div class="iz-ust"><div class="iz-odev" role="group" aria-label="İzlenen ödev">${ODEV.map((x) => `<button type="button" data-mod="izle-${x.id}" aria-pressed="${x.id === o.id}">${x.ad}</button>`).join('')}</div><p class="iz-konum">${konum}</p><button type="button" class="pn-bas" data-iz="bas">Baştan</button></div>`;
    const not = '<p class="iz-not" id="iz-not" role="status" hidden></p>';
    if (kr.t === 'son') {
      return ust(`${N} adım · <b>bitti</b>`) + izSerit() + not + `<h2 class="pn-h">${o.ad} izlendi.</h2><p class="pn-t">Benzetimdeki proje öğreticinin son hâliyle aynı.</p><div class="pn-dugmeler iz-son-d"><button type="button" class="dugme" data-mod="${o.id}">Şimdi kendin yap (rehberli mod)</button>${o.id === 'hw1' ? '<button type="button" class="dugme ikincil" data-mod="izle-hw2">HW#2\'yi izle</button>' : '<button type="button" class="dugme ikincil" data-mod="kesif">Keşfe dön</button>'}</div><p class="iz-k iz-son-k">Özet</p>${liste(o.izleSon)}`;
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
    return ust(konum) + izSerit() + not + bol + `<h2 class="pn-h iz-h${giris ? '' : ' tikte'}">${kac(a.baslik)}</h2>` + govde;
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

  /* ---------------------------------------------------------------- ödevler bölümü */
  function odevlerCiz() {
    const k = $('#odevler');
    k.innerHTML = `<header class="odev-bas"><p class="hero-ust">Ninova · MTO 316</p><h2>Ödevler, Türkçe</h2><p class="hero-alt">Hocanın istediği ve öğreticinin her adımı. Değerler tabloda, program alan adları İngilizce.</p></header>` + ODEV.map((o) => {
      let adimlar = '', sonBol = 0;
      o.adimlar.forEach((a, i) => {
        if (o.bolumler && a.bolum !== sonBol) { sonBol = a.bolum; adimlar += `<li class="odev-bol"><h3>${a.bolum} · ${kac(o.bolumler[a.bolum - 1])}</h3></li>`; }
        const resim = [].concat(a.img || []);
        adimlar += `<li class="adim" id="${o.id}-${i + 1}"><span class="adim-no">${i + 1}</span><div class="adim-ic"><h4>${kac(a.baslik)}</h4>${degerTablo(a.tablo)}${resim.length ? `<div class="adim-res r${Math.min(resim.length, 3)}">${resim.map((r) => `<figure title="Büyütmek için bas"><img src="img/${r}.webp" alt="${kac(IMG[r])}" loading="lazy" decoding="async"><figcaption>${kac(IMG[r])} · ${RESMI.has(r) ? 'öğreticideki ekran' : 'HEC-HMS 4.14 ekranı'}</figcaption></figure>`).join('')}</div>` : ''}${katman(a, o.id + i)}${soruHTML(a)}<button type="button" class="adim-git" data-git="${o.id}:${i}">Benzetimde bu adıma git</button><button type="button" class="adim-izle" data-git="izle:${o.id}:${i}">Bu adımı izle</button></div></li>`;
      });
      return `<article class="odev" id="${o.id}"><header class="odev-ust"><p class="odev-eti">${o.ad} · teslim ${kac(o.teslim)}</p><h3 class="odev-h">${kac(o.konu)}</h3><div class="odev-iki"><div><p class="odev-k">Hoca ne istiyor?</p><ol class="istenen">${o.istenen.map((x) => `<li>${kac(x)}</li>`).join('')}</ol></div><div><p class="odev-k">Resmî öğretici (İngilizce)</p><ul class="baglar">${o.bag.map(([a, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${kac(a)} ↗</a></li>`).join('')}</ul>${o.tuzak ? `<p class="odev-k">Labda görülen tuzaklar</p><ul class="tuzak">${o.tuzak.map((x) => `<li>${kac(x)}</li>`).join('')}</ul>` : ''}</div></div><div class="pn-dugmeler"><button type="button" class="dugme" data-git="${o.id}:0">${o.ad} rehberli benzetimi başlat</button><button type="button" class="dugme ikincil" data-git="izle:${o.id}:0">${o.ad}'i adım adım izle</button></div></header><ol class="adimlar">${adimlar}</ol></article>`;
    }).join('');
  }

  /* ---------------------------------------------------------------- olaylar */
  const sahneEkranda = () => { const r = $('#benzetim').getBoundingClientRect(); return r.bottom >= ustH() + 40 && r.top <= window.innerHeight - 40; };
  function olaylar() {
    document.addEventListener('click', (e) => {
      const fg = e.target.closest('.adim-res figure');
      if (fg) { fg.classList.toggle('buyuk'); return; }
      const kb = e.target.closest('.kt-b');
      if (kb) { const ic = kb.nextElementSibling; const ac = kb.getAttribute('aria-expanded') !== 'true'; kb.setAttribute('aria-expanded', String(ac)); if (ic) ic.hidden = !ac; if (kb.dataset.izKat) izAcik[kb.dataset.izKat] = ac; return; }
      if (e.target.closest('[data-gir], #ust a[href="#benzetim"]')) { e.preventDefault(); benzetimeIn(); return; }
      const md = e.target.closest('[data-mod]');
      if (md) {
        const v = md.dataset.mod;
        if (v === 'kesif') kur('kesif');
        else if (v === 'izle') izBasla(iz ? iz.o.id : 'hw1', 0);
        else if (v.startsWith('izle-')) izBasla(v.slice(5), 0);
        else kur('odev', v, 0);
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
        if (p[0] === 'izle') { const o = ODEV.find((x) => x.id === p[1]); izBasla(o.id, izAdimKare(o, +p[2])); }
        else kur('odev', p[0], +p[1]);
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
