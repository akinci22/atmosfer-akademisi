/* HEC-HMS Okulu — sayfa: üst çubuk, benzetim + açıklama paneli (keşif / rehberli ödev), Türkçe ödev adımları. */
(function () {
  'use strict';
  const { AC, ODEV, IMG } = window.OKUL;
  const $ = (s, k) => (k || document).querySelector(s);
  const kac = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const RESMI = new Set(['hw1-fig1', 'hw1-fig2', 'hw1-fig3', 'hw1-area', 'hw1-area-menu', 'hw1-baseflow-menu', 'hw1-loss-menu', 'hw1-loss', 'hw1-transform-menu', 'hw1-clark', 'hw1-loss-tab']);
  const genis = () => window.innerWidth >= 900;
  const ustH = () => { const u = $('#ust'); return u ? u.getBoundingClientRect().height : 0; };

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
  function iskelet() {
    $('#ust').innerHTML = `<div class="ust-ic"><a class="ust-marka" href="../">Atmosfer Akademisi</a><span class="ust-ayrac">/</span><span class="ust-ders">MTO 316 · HEC-HMS Okulu</span><nav class="ust-nav" aria-label="Bölümler"><a href="#benzetim">Benzetim</a><a href="#odevler">Ödevler</a></nav><button type="button" class="ust-tema" id="tema"></button><a class="ust-don" href="../">Atmosfer Akademisi'ne dön</a></div>`;
    $('#tema').addEventListener('click', () => { tema = TEMA[(TEMA.indexOf(tema) + 1) % 3]; try { localStorage.setItem('hms-tema', tema); } catch (e) { /* yok */ } temaUygula(); });
    temaUygula();
    $('#ana').innerHTML = `
      <section class="hero">
        <p class="hero-ust">MTO 316 · Hidrometeoroloji</p>
        <h1>HEC-HMS Okulu</h1>
        <p class="hero-alt">Programı burada tıklayarak tanı. Ödevlerin adımları Türkçe, her adım benzetimde bir tık uzakta.</p>
        <dl class="hero-kunye"><div><dt>Program</dt><dd>HEC-HMS 4.14</dd></div><div><dt>Örnek havza</dt><dd>Punxsutawney, ABD · 158 mi²</dd></div><div><dt>Fırtına</dt><dd>28 Nisan – 4 Mayıs 1996</dd></div><div><dt>Ödevler</dt><dd>HW#1 · HW#2</dd></div></dl>
      </section>
      <section id="benzetim" class="sim-bolum" aria-label="HEC-HMS benzetimi">
        <div class="sim-alan">
          <div class="sim-sahne"><div class="sim-kap"><div class="hms" id="hms"></div></div><button type="button" class="sim-buyut" id="buyut">1:1 büyüt</button></div>
          <aside class="sim-panel" id="panel" aria-live="polite"></aside>
        </div>
      </section>
      <section id="odevler" class="odevler" aria-label="Ödevler"></section>`;
    $('#alt').innerHTML = `<p>Öğretici içeriği: HEC-HMS kılavuzları (U.S. Army Corps of Engineers, Hydrologic Engineering Center). Ekranlar HEC-HMS 4.14; grafiklerdeki sayılar programın bu projedeki gerçek çıktısı.</p><p><a href="../">Atmosfer Akademisi'ne dön</a></p>`;
  }

  /* ---------------------------------------------------------------- ölçek */
  let buyut = false;
  function olcekle() {
    const kap = $('.sim-kap'), h = $('#hms'); if (!kap) return;
    const cw = kap.clientWidth;
    let W, H, s;
    if (genis()) {
      W = Math.max(cw, 660); s = cw / W; H = Math.round(kap.clientHeight / s);
      kap.style.height = ''; kap.classList.remove('buyuk');
    } else {
      const maxH = Math.round((window.visualViewport ? window.visualViewport.height : window.innerHeight) * 0.5) - 36;
      if (buyut) { W = 600; s = 1; H = Math.max(maxH, 520); kap.style.height = maxH + 'px'; kap.classList.add('buyuk'); }
      else { W = Math.max(600, cw); s = cw / W; H = Math.round(maxH / s); kap.style.height = Math.round(H * s) + 'px'; kap.classList.remove('buyuk'); }
    }
    h.style.width = W + 'px'; h.style.height = H + 'px'; h.style.transform = s === 1 ? 'none' : `scale(${s})`;
    h.classList.toggle('dar', W < 760); h.classList.toggle('alcak', H < 620); h.style.setProperty('--hms-h', H + 'px');
    window.HMS.olcek(s);
    document.documentElement.style.setProperty('--ust-h', ustH() + 'px');
    window.HMS.ciz();
  }

  /* ---------------------------------------------------------------- mod ve durum */
  let mod = 'kesif', odev = null, adim = 0, mik = 0, sonAc = null;
  const HMS = () => window.HMS;
  function ileriSar(liste) { liste.forEach((m) => { if (m.oto) m.oto.forEach((x) => HMS().yap(x.yap || x.hd, { doldur: true, sag: x.sag, cizme: true })); else HMS().yap(m.yap || m.hd, { doldur: true, sag: m.sag, cizme: true }); }); }
  const tumMikro = (o, kadar) => o.adimlar.slice(0, kadar == null ? o.adimlar.length : kadar).flatMap((a) => a.mikro);
  function sadele() { const S = HMS().durum(); HMS().temizle(); S.secili = null; S.ce = null; S.arac = 'arrow'; S.xsekme = 'Components'; S.log = []; HMS().projeAcikLog(); }
  function kur(yeniMod, odevId, baslangicAdim) {
    mod = yeniMod; odev = odevId ? ODEV.find((o) => o.id === odevId) : null; adim = baslangicAdim || 0; mik = 0; sonAc = null;
    HMS().bosalt(true);
    if (mod === 'kesif') {
      ileriSar(tumMikro(ODEV[0])); ileriSar(tumMikro(ODEV[1])); sadele();
      HMS().yap('tb:compute', { cizme: true }); HMS().temizle();
    } else if (odev.id === 'hw1') {
      if (adim === 0) HMS().bosalt(false); else { ileriSar(tumMikro(odev, adim)); HMS().temizle(); }
    } else {
      ileriSar(tumMikro(ODEV[0])); sadele();
      if (adim > 0) { ileriSar(tumMikro(odev, adim)); HMS().temizle(); }
    }
    hedefAyarla(); HMS().ciz(); panelCiz();
  }
  const simdiki = () => (odev && odev.adimlar[adim] ? odev.adimlar[adim].mikro[mik] : null);
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

  /* ---------------------------------------------------------------- panel */
  const ONERI = [
    ['Components menüsü', ['m:Components']], ['Subbasin aracı', ['tb:subbasin']], ['Watershed Explorer', ['bolge:agac']],
    ['Loss sekmesi', ['harita:el:Stump Creek', 'ce:sekme:Loss']], ['Compute düğmesi', ['tb:compute']], ['Junction-2 grafiği', ['harita:el:Junction-2', 'tb:graph']], ['Message Log', ['bolge:log']],
  ];
  function modSecici() {
    const b = (id, et, sec) => `<button type="button" class="pn-mod${sec ? ' secik' : ''}" data-mod="${id}" aria-pressed="${sec}">${et}</button>`;
    return `<div class="pn-ust"><div class="pn-mods" role="group" aria-label="Benzetim modu">${b('kesif', 'Keşif', mod === 'kesif')}${b('hw1', 'HW#1 rehberli', mod === 'odev' && odev.id === 'hw1')}${b('hw2', 'HW#2 rehberli', mod === 'odev' && odev.id === 'hw2')}</div><button type="button" class="pn-bas" data-mod="${mod === 'kesif' ? 'kesif' : odev.id}">Baştan</button></div>`;
  }
  const liste = (a) => (a && a.length ? `<ul class="pn-m">${a.map((x) => `<li>${kac(x)}</li>`).join('')}</ul>` : '');
  function degerTablo(t) { return t ? `<table class="deger"><tbody>${t.map(([a, b]) => `<tr><th>${kac(a)}</th><td>${kac(b)}</td></tr>`).join('')}</tbody></table>` : ''; }
  function katman(a, idk) {
    return `<div class="katman" data-k="${idk}"><button type="button" class="kt-b" aria-expanded="false">Ne yapıyorum?</button><div class="kt-ic" hidden>${liste(a.ne)}<button type="button" class="kt-b" aria-expanded="false">Programda nerede?</button><div class="kt-ic" hidden>${liste(a.nerede)}<button type="button" class="kt-b" aria-expanded="false">Neden bu değer?</button><div class="kt-ic" hidden>${liste(a.neden)}</div></div></div></div>`;
  }
  function panelCiz() {
    const p = $('#panel');
    let ic = '';
    if (mod === 'kesif') {
      if (!sonAc || !AC[sonAc]) {
        ic = `<p class="pn-eti">Keşif</p><h2 class="pn-h">Bir parçaya bas.</h2><p class="pn-t">Program gibi açılır; ne işe yaradığı burada yazar.</p><p class="pn-eti2">Buradan başla</p><div class="pn-oneri">${ONERI.map(([a], i) => `<button type="button" class="cip" data-oneri="${i}">${kac(a)}</button>`).join('')}</div><p class="pn-not">Proje hazır: iki ödevin son hâli yüklü. Sağ tık (telefonda basılı tut) eleman menüsünü açar.</p>`;
      } else {
        const a = AC[sonAc];
        ic = `<p class="pn-eti">Bu ne işe yarar?</p><h2 class="pn-h">${kac(a.b)}</h2><p class="pn-t">${kac(a.t)}</p>${liste(a.m)}${a.d ? `<button type="button" class="kt-b pn-daha" aria-expanded="false">Daha fazla</button><div class="kt-ic" hidden>${liste(a.d)}</div>` : ''}<p class="pn-eti2">Başka bir yere bak</p><div class="pn-oneri">${ONERI.map(([x], i) => `<button type="button" class="cip" data-oneri="${i}">${kac(x)}</button>`).join('')}</div>`;
      }
    } else {
      const toplam = odev.adimlar.length;
      if (adim >= toplam) {
        ic = `<p class="pn-eti">${odev.ad} · bitti</p><h2 class="pn-h">${odev.ad} tamam.</h2><p class="pn-t">Benzetimdeki proje öğreticinin son hâliyle aynı.</p>${liste(odev.id === 'hw1' ? ['3 alt havza, 1 kanal, 2 birleşim bağlı.', 'Bütün parametreler girildi; proje diske yazıldı.', 'Gerçek programda her adımın ekran görüntüsünü tek PDF yap.'] : ['Koşu hesaplandı; gözlenen akım bağlı.', 'Nash-Sutcliffe 0,952: model gözlemi çok iyi yakalıyor.', 'Gerçek programda her adımın ekran görüntüsünü tek PDF yap.'])}<div class="pn-dugmeler">${odev.id === 'hw1' ? '<button type="button" class="dugme" data-mod="hw2">HW#2\'ye geç</button>' : ''}<button type="button" class="dugme ikincil" data-mod="kesif">Keşfe dön</button></div>`;
      } else {
        const a = odev.adimlar[adim], m = a.mikro[mik];
        const bol = odev.bolumler && a.bolum ? `<p class="pn-bol">${a.bolum} · ${kac(odev.bolumler[a.bolum - 1])}</p>` : '';
        ic = `<p class="pn-eti">${odev.ad} · adım ${adim + 1}/${toplam}</p><div class="pn-ilerleme" aria-hidden="true"><i style="width:${Math.round((adim / toplam) * 100)}%"></i></div>${bol}<h2 class="pn-h">${kac(a.baslik)}</h2>
          <div class="pn-simdi"><span>Şimdi${a.mikro.length > 1 ? ` · ${mik + 1}/${a.mikro.length}` : ''}</span><b>${kac(m.ip)}</b>${m.oto ? '<button type="button" class="dugme" data-hd="oto:olcerler">İki ölçeri de ekle</button>' : ''}</div>
          <p class="pn-ipucu" id="ipucu"></p>${degerTablo(a.tablo)}${katman(a, 'p')}${a.soru ? `<div class="soru"><b>Öğreticinin sorusu</b><p>${kac(a.soru[0])}</p><button type="button" class="kt-b" aria-expanded="false">Cevap</button><div class="kt-ic" hidden><p>${kac(a.soru[1])}</p></div></div>` : ''}
          <div class="pn-dugmeler"><button type="button" class="dugme" id="goster">Bu tıklamayı göster</button><button type="button" class="dugme ikincil" id="atla">Adımı benim yerime bitir</button></div>`;
      }
    }
    p.innerHTML = modSecici() + `<div class="pn-ic">${ic}</div>`;
  }

  /* ---------------------------------------------------------------- tıklama */
  function tik(hd, o, girdi) {
    if (mod === 'kesif') {
      if (!girdi && !/^(satir|f):/.test(hd)) HMS().yap(hd, o);
      const k = acAnahtar(hd); if (k && AC[k]) { sonAc = k; panelCiz(); }
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
    if (mik >= odev.adimlar[adim].mikro.length) { adim++; mik = 0; }
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

  /* hedef ve açıklama görünür kalsın */
  function odakla() {
    const alan = $('.sim-alan'), panel = $('#panel'), u = ustH();
    if (genis()) {
      const r = alan.getBoundingClientRect();
      if (r.top < u - 2 || r.bottom > window.innerHeight + 2) window.scrollTo(0, window.scrollY + r.top - u - 12);
      const pi = $('.pn-ic', panel); if (pi) pi.scrollTop = 0;
    } else {
      const sahne = $('.sim-sahne');
      const hedef = window.scrollY + panel.getBoundingClientRect().top - (u + sahne.offsetHeight) - 6;
      if (Math.abs(panel.getBoundingClientRect().top - (u + sahne.offsetHeight)) > 8) window.scrollTo(0, Math.max(0, hedef));
    }
    if (buyut && !genis() && HMS().durum()) { const m = mod === 'odev' && simdiki(); const he = m && HMS().hedefEl(m.hd); if (he) he.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  }

  /* ---------------------------------------------------------------- ödevler bölümü */
  function odevlerCiz() {
    const k = $('#odevler');
    k.innerHTML = `<header class="odev-bas"><p class="hero-ust">Ninova · MTO 316</p><h2>Ödevler, Türkçe</h2><p class="hero-alt">Hocanın istediği ve öğreticinin her adımı. Değerler tabloda, program alan adları İngilizce.</p></header>` + ODEV.map((o) => {
      let adimlar = '', sonBol = 0;
      o.adimlar.forEach((a, i) => {
        if (o.bolumler && a.bolum !== sonBol) { sonBol = a.bolum; adimlar += `<li class="odev-bol"><h3>${a.bolum} · ${kac(o.bolumler[a.bolum - 1])}</h3></li>`; }
        const resim = [].concat(a.img || []);
        adimlar += `<li class="adim" id="${o.id}-${i + 1}"><span class="adim-no">${i + 1}</span><div class="adim-ic"><h4>${kac(a.baslik)}</h4>${degerTablo(a.tablo)}${resim.length ? `<div class="adim-res r${Math.min(resim.length, 3)}">${resim.map((r) => `<figure title="Büyütmek için bas"><img src="img/${r}.webp" alt="${kac(IMG[r])}" loading="lazy" decoding="async"><figcaption>${kac(IMG[r])} · ${RESMI.has(r) ? 'öğreticideki ekran' : 'HEC-HMS 4.14 ekranı'}</figcaption></figure>`).join('')}</div>` : ''}${katman(a, o.id + i)}${a.soru ? `<div class="soru"><b>Öğreticinin sorusu</b><p>${kac(a.soru[0])}</p><button type="button" class="kt-b" aria-expanded="false">Cevap</button><div class="kt-ic" hidden><p>${kac(a.soru[1])}</p></div></div>` : ''}<button type="button" class="adim-git" data-git="${o.id}:${i}">Benzetimde bu adıma git</button></div></li>`;
      });
      return `<article class="odev" id="${o.id}"><header class="odev-ust"><p class="odev-eti">${o.ad} · teslim ${kac(o.teslim)}</p><h3 class="odev-h">${kac(o.konu)}</h3><div class="odev-iki"><div><p class="odev-k">Hoca ne istiyor?</p><ol class="istenen">${o.istenen.map((x) => `<li>${kac(x)}</li>`).join('')}</ol></div><div><p class="odev-k">Resmî öğretici (İngilizce)</p><ul class="baglar">${o.bag.map(([a, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${kac(a)} ↗</a></li>`).join('')}</ul>${o.tuzak ? `<p class="odev-k">Labda görülen tuzaklar</p><ul class="tuzak">${o.tuzak.map((x) => `<li>${kac(x)}</li>`).join('')}</ul>` : ''}</div></div><button type="button" class="dugme" data-git="${o.id}:0">${o.ad} rehberli benzetimi başlat</button></header><ol class="adimlar">${adimlar}</ol></article>`;
    }).join('');
  }

  /* ---------------------------------------------------------------- olaylar */
  function olaylar() {
    document.addEventListener('click', (e) => {
      const fg = e.target.closest('.adim-res figure');
      if (fg) { fg.classList.toggle('buyuk'); return; }
      const kb = e.target.closest('.kt-b');
      if (kb) { const ic = kb.nextElementSibling; const ac = kb.getAttribute('aria-expanded') !== 'true'; kb.setAttribute('aria-expanded', String(ac)); if (ic) ic.hidden = !ac; return; }
      const md = e.target.closest('[data-mod]');
      if (md) { const v = md.dataset.mod; if (v === 'kesif') kur('kesif'); else kur('odev', v, 0); odakla(); return; }
      const on = e.target.closest('[data-oneri]');
      if (on) { const [, dizi] = ONERI[+on.dataset.oneri]; HMS().temizle(); dizi.forEach((hd) => { if (!hd.startsWith('bolge:')) HMS().yap(hd, { cizme: true }); }); HMS().ciz(); const son = dizi[dizi.length - 1]; sonAc = acAnahtar(son === 'tb:graph' ? 'dlg:x' : son) || acAnahtar(son); if (son === 'tb:graph') sonAc = 'dlg:grafik'; panelCiz(); odakla(); return; }
      const git = e.target.closest('[data-git]');
      if (git) { const [id, i] = git.dataset.git.split(':'); kur('odev', id, +i); const b = $('#benzetim'); window.scrollTo(0, window.scrollY + b.getBoundingClientRect().top - ustH() - 4); setTimeout(odakla, 30); return; }
      if (e.target.closest('#goster')) { goster(); return; }
      if (e.target.closest('#atla')) { atla(); return; }
      const ot = e.target.closest('#panel [data-hd]');
      if (ot && mod === 'odev') { tik(ot.dataset.hd, { el: ot }); }
    });
    $('#buyut').addEventListener('click', () => { buyut = !buyut; $('#buyut').textContent = buyut ? 'Sığdır' : '1:1 büyüt'; olcekle(); odakla(); });
    let z; window.addEventListener('resize', () => { clearTimeout(z); z = setTimeout(olcekle, 80); });
  }

  /* ---------------------------------------------------------------- başlat */
  iskelet();
  window.HMS.kur($('#hms'), { tik, rehberli: () => mod === 'odev' });
  odevlerCiz();
  olaylar();
  kur('kesif');
  olcekle();
  window.OKUL_SAYFA = { kur, goster, atla, durum: () => ({ mod, odev: odev && odev.id, adim, mik }), simdiki, acAnahtar, odakla };
})();
