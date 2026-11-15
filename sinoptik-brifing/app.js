// Sinoptik Brifing Atölyesi — arayüz. Veri: veri.js · haritalar.js · araclar.js · motor.js
(function () {
  'use strict';
  const V = window.VERI, HR = window.HARITALAR;
  const $ = (s, k) => (k || document).querySelector(s);
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const btn = (cls, metin, f) => { const b = h('button', cls, metin); b.type = 'button'; if (f) b.addEventListener('click', f); return b; };
  const kac = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const depo = { al(k, v) { try { const x = localStorage.getItem(k); return x == null ? v : JSON.parse(x); } catch (e) { return v; } }, koy(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* tarayıcı izin vermiyor */ } } };
  const bitti = new Set(depo.al('sb:bitti', []));
  const AZ = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ───────── seslendirme (tarayıcı destekliyorsa)
  const SES = 'speechSynthesis' in window;
  function oku(metin, dil, b) {
    if (!SES) return; const s = window.speechSynthesis;
    if (s.speaking) { s.cancel(); if (b && b.dataset.calan === '1') { b.dataset.calan = '0'; b.textContent = b.dataset.ad; return; } }
    document.querySelectorAll('[data-calan="1"]').forEach((x) => { x.dataset.calan = '0'; x.textContent = x.dataset.ad; });
    const u = new SpeechSynthesisUtterance(metin); u.lang = dil; u.rate = dil === 'en-US' ? 0.9 : 1;
    const ses = s.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith(dil.slice(0, 2))); if (ses) u.voice = ses;
    if (b) { b.dataset.calan = '1'; b.textContent = 'Durdur'; u.onend = u.onerror = () => { b.dataset.calan = '0'; b.textContent = b.dataset.ad; }; }
    s.speak(u);
  }
  const dinleBtn = (metin, dil, ad) => { if (!SES) return h('span'); const b = btn('cip dinle', ad || 'Dinle'); b.dataset.ad = ad || 'Dinle'; b.addEventListener('click', () => oku(metin, dil, b)); return b; };

  // ───────── bölüm planı
  const BOLUM = [
    { id: 'giris', no: '0', ad: 'Brifing nedir?' },
    { id: 'hazirlik', no: '1', ad: 'Hazırlık' },
    { id: 'yer', no: '2', ad: 'Yer sistemleri', rol: 1, adim: ['yer-eu', 'yer-tr', 'ec-mslp850'] },
    { id: 'ustsev', no: '3', ad: 'Üst seviyeler', rol: 2, adim: ['h850', 'h700', 'h500', 'h300'] },
    { id: 'dinamik', no: '4', ad: 'Model dinamiği', rol: 3, adim: ['gfs-500', 'gfs-vort', 'gfs-jet', 'gfs-nem'] },
    { id: 'gozlem', no: '5', ad: 'Gözlemler', rol: 4, adim: ['uydu', 'radar', 'ppi', 'yagis'] },
    { id: 'istanbul', no: '6', ad: 'İstanbul’a iniş', rol: 5, adim: ['synop', 'skewt', 'meteogram'] },
    { id: 'sonuc', no: '7', ad: 'Sonuç ve tahmin', rol: 5 },
    { id: 'gun', no: '8', ad: 'Sunum günü' },
    { id: 'sss', no: '?', ad: 'Sık sorulanlar' },
  ];
  const ADIM_AD = {}; Object.entries(V.H).forEach(([k, v]) => (ADIM_AD[k] = v.ad)); Object.entries(V.ARAC).forEach(([k, v]) => (ADIM_AD[k] = v.ad));

  // ───────── üst çubuk + içindekiler
  function ustCubuk() {
    const u = $('#ust');
    u.innerHTML = `<div class="ust-ic"><a class="ust-marka" href="../">Atmosfer Akademisi</a><span class="ust-ayrac">/</span><span class="ust-ders">MTO 302E · Brifing Atölyesi</span><nav class="ust-nav"><a href="../harita-okulu/">Harita Okulu</a><a href="../hava-analizi-proje-rehberi/">Proje Rehberi</a><a class="ust-portfoy" href="https://akinci22.github.io/hakkimda/" target="_blank" rel="noopener">Portföyüm ↗</a></nav></div>`;
    const ic = u.querySelector('.ust-ic'); const tb = btn('ust-toc', 'İçindekiler', () => document.body.classList.toggle('toc-acik')); ic.insertBefore(tb, ic.querySelector('.ust-nav'));
    const ilerleme = h('div', 'ust-ilerleme'); u.appendChild(ilerleme);
    addEventListener('scroll', () => { const d = document.documentElement; ilerleme.style.transform = `scaleX(${Math.min(1, d.scrollTop / (d.scrollHeight - d.clientHeight || 1))})`; }, { passive: true });
  }
  function icindekiler() {
    const t = $('#toc'); t.innerHTML = '<p class="toc-baslik">İçindekiler</p>';
    const ol = h('ol', 'toc-liste');
    BOLUM.forEach((b) => {
      const li = h('li'); const a = h('a', 'toc-bolum', `<span class="toc-no">${b.no}</span>${b.ad}`); a.href = '#' + b.id; li.appendChild(a);
      if (b.rol) li.style.setProperty('--rol', V.ROL[b.rol].renk);
      if (b.adim) { const ul = h('ul', 'toc-adimlar'); b.adim.forEach((id) => { const x = h('li'); const aa = h('a', 'toc-adim', kac(ADIM_AD[id])); aa.href = '#' + id; aa.dataset.id = id; if (bitti.has(id)) aa.classList.add('bitti'); x.appendChild(aa); ul.appendChild(x); }); li.appendChild(ul); }
      ol.appendChild(li);
    });
    t.appendChild(ol);
    t.addEventListener('click', (e) => { if (e.target.closest('a')) document.body.classList.remove('toc-acik'); });
    const sayac = h('p', 'toc-sayac'); t.appendChild(sayac); tocSay();
    // görünür bölümü işaretle
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { t.querySelectorAll('a.aktif').forEach((x) => x.classList.remove('aktif')); const a = t.querySelector(`a[href="#${e.target.id}"]`); if (a) a.classList.add('aktif'); } }), { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('section[id], article[id]').forEach((s) => io.observe(s));
  }
  function tocSay() { const n = BOLUM.reduce((s, b) => s + (b.adim ? b.adim.length : 0), 0); const k = $('.toc-sayac'); if (k) k.textContent = `${[...bitti].filter((x) => ADIM_AD[x]).length} / ${n} adım çalışıldı`; }
  function bittiDugme(id) {
    const b = btn('cip bitti-d', bitti.has(id) ? 'Çalıştım' : 'Çalıştım olarak işaretle'); b.setAttribute('aria-pressed', String(bitti.has(id)));
    b.addEventListener('click', () => { if (bitti.has(id)) bitti.delete(id); else bitti.add(id); depo.koy('sb:bitti', [...bitti]); b.setAttribute('aria-pressed', String(bitti.has(id))); b.textContent = bitti.has(id) ? 'Çalıştım' : 'Çalıştım olarak işaretle'; const a = document.querySelector(`.toc-adim[data-id="${id}"]`); if (a) a.classList.toggle('bitti', bitti.has(id)); tocSay(); });
    return b;
  }

  // ───────── sekme kümesi
  function sekmeler(liste) {
    const kap = h('div', 'sekme'); const bar = h('div', 'sekme-bar'); bar.setAttribute('role', 'tablist'); const govde = h('div', 'sekme-govde');
    kap.append(bar, govde);
    const sec = (i) => { bar.querySelectorAll('button').forEach((b, k) => { b.setAttribute('aria-selected', String(k === i)); b.tabIndex = k === i ? 0 : -1; }); govde.querySelectorAll('.sekme-panel').forEach((p, k) => (p.hidden = k !== i)); };
    liste.forEach(([ad, icerik], i) => {
      const b = btn('sekme-b', ad, () => sec(i)); b.setAttribute('role', 'tab'); bar.appendChild(b);
      const p = h('div', 'sekme-panel'); p.setAttribute('role', 'tabpanel'); p.appendChild(icerik); govde.appendChild(p);
    });
    bar.addEventListener('keydown', (e) => { const bs = [...bar.querySelectorAll('button')], i = bs.indexOf(document.activeElement); if (i < 0) return; if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const j = (i + (e.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length; sec(j); bs[j].focus(); } });
    sec(0); kap.sec = sec; return kap;
  }
  const maddeler = (arr) => { const ul = h('ul', 'madde'); arr.forEach((m) => ul.appendChild(h('li', null, kac(m)))); return ul; };
  function soruPanel(arr) { const d = h('div', 'satirlar'); arr.forEach(([s, c]) => { const x = h('details', 'satir'); x.innerHTML = `<summary><span>${kac(s)}</span></summary><p>${kac(c)}</p>`; d.appendChild(x); }); return d; }
  function denePanel(q) {
    const d = h('div', 'dene'); d.appendChild(h('p', 'dene-s', kac(q.s))); const sec = h('div', 'dene-sec'); const geri = h('p', 'dene-geri'); geri.setAttribute('aria-live', 'polite');
    q.c.forEach((c, i) => { const b = btn('dene-b', kac(c), () => { sec.querySelectorAll('button').forEach((x, k) => { x.disabled = true; x.classList.toggle('dogru', k === q.d); x.classList.toggle('yanlis', k === i && i !== q.d); }); geri.innerHTML = (i === q.d ? '<b>Doğru.</b> ' : '<b>Tam değil.</b> ') + kac(q.a); tekrar.hidden = false; }); sec.appendChild(b); });
    const tekrar = btn('cip', 'Yeniden dene', () => { sec.querySelectorAll('button').forEach((x) => { x.disabled = false; x.classList.remove('dogru', 'yanlis'); }); geri.textContent = ''; tekrar.hidden = true; }); tekrar.hidden = true;
    d.append(sec, geri, tekrar); return d;
  }

  // ───────── harita adımı
  const HARITA_NESNE = {};
  function haritaAdim(id) {
    const v = V.H[id], m = HR[id], rol = V.ROL[v.rol]; m.id = id;
    const a = h('article', 'adim'); a.id = id; a.style.setProperty('--rol', rol.renk);
    a.innerHTML = `<header class="adim-bas"><p class="adim-etiket"><span class="rol-nokta"></span>${rol.ad} · ${rol.is} · ${v.sure}</p><h3>${kac(v.baslik)}</h3><p class="adim-kisa">${kac(v.kisa)}</p></header>`;
    const govde = h('div', 'adim-govde'); a.appendChild(govde);
    // harita kartı
    const kart = h('figure', 'harita-kart');
    kart.innerHTML = `<figcaption class="harita-ust"><b>${kac(v.ad)}</b><span>${kac(v.tur)} · ${kac(v.gecerli)}</span><span class="harita-kaynak">Kaynak: ${kac(v.kaynak)} · sadeleştirilmiş çizim</span></figcaption>`;
    const alan = h('div', 'harita-alan'); kart.appendChild(alan);
    const H = window.Motor.ciz(alan, m); HARITA_NESNE[id] = H;
    const altyazi = h('div', 'sunum-alt'); altyazi.hidden = true; altyazi.setAttribute('aria-live', 'polite'); alan.appendChild(altyazi);
    const arac = h('div', 'harita-arac'); kart.appendChild(arac);
    // katmanlar (lejant)
    const lej = h('div', 'lejant'); lej.setAttribute('aria-label', 'Katmanlar');
    const katlar = [...new Set((m.lejant || []).map((l) => l[0]))];
    (m.lejant || []).forEach(([k, tur, renk, ad]) => {
      const b = btn('lej', `<span class="lej-ornek lej-${tur === 'renk' ? 'renk' : tur === 'kesik' ? 'kesik' : tur === 'harf' ? 'harf' : tur === 'ist' || tur === 'ok' ? 'ist' : 'cizgi'}" style="--c:${renk}"></span><span>${kac(ad)}</span>`);
      b.setAttribute('aria-pressed', 'true'); b.dataset.k = k;
      b.addEventListener('click', () => { const acik = b.getAttribute('aria-pressed') !== 'true'; lej.querySelectorAll(`[data-k="${k}"]`).forEach((x) => x.setAttribute('aria-pressed', String(acik))); const g = H.katman[k]; if (g) g.style.display = acik ? '' : 'none'; });
      b.addEventListener('mouseenter', () => { if (!H.katman[k]) return; H.svg.classList.add('vurgu-kip'); Object.entries(H.katman).forEach(([ad, g]) => g.classList.toggle('one', ad === k)); });
      b.addEventListener('mouseleave', () => { H.svg.classList.remove('vurgu-kip'); Object.values(H.katman).forEach((g) => g.classList.remove('one')); });
      lej.appendChild(b);
    });
    void katlar;
    // sunum modu
    let sira = -1, madde = 0, zam = null, oynuyor = false;
    const durdur = () => { clearTimeout(zam); zam = null; oynuyor = false; oynat.textContent = 'Sunum modu'; };
    const goster = () => {
      const b = v.bolgeler[sira]; altyazi.hidden = false;
      altyazi.innerHTML = `<p class="sa-bas"><span class="sa-no">${sira + 1}/${v.bolgeler.length}</span>${kac(b.ad)}</p><ul>${b.m.map((x, i) => `<li class="${i < madde ? 'gor' : ''}">${kac(x)}</li>`).join('')}</ul>`;
    };
    const ileri = () => {
      if (sira < 0) { sira = 0; madde = 0; window.Motor.odak(H, 0); goster(); return true; }
      const b = v.bolgeler[sira];
      if (madde < b.m.length) { madde++; goster(); return true; }
      if (sira < v.bolgeler.length - 1) { sira++; madde = 0; window.Motor.odak(H, sira); goster(); return true; }
      window.Motor.odak(H, -1); altyazi.innerHTML = `<p class="sa-bas"><span class="sa-no">ÖZ</span>${kac(v.oz)}</p>`; sira = v.bolgeler.length; return false;
    };
    const geri = () => { if (sira <= 0 && madde <= 1) { bitir(); return; } if (sira >= v.bolgeler.length) { sira = v.bolgeler.length - 1; madde = v.bolgeler[sira].m.length; window.Motor.odak(H, sira); goster(); return; } if (madde > 0) { madde--; goster(); } else { sira--; madde = v.bolgeler[sira].m.length; window.Motor.odak(H, sira); goster(); } };
    const adimla = () => { if (!oynuyor) return; const devam = ileri(); if (devam) zam = setTimeout(adimla, madde === 0 ? 1300 : 2400); else durdur(); };
    const bitir = () => { durdur(); sira = -1; madde = 0; window.Motor.odak(H, -1); altyazi.hidden = true; kontrol.hidden = true; kart.classList.remove('sunumda'); };
    const oynat = btn('dugme', 'Sunum modu', () => { if (oynuyor) { durdur(); return; } kart.classList.add('sunumda'); kontrol.hidden = false; oynuyor = true; oynat.textContent = 'Duraklat'; if (sira >= v.bolgeler.length) { sira = -1; madde = 0; } adimla(); });
    const kontrol = h('div', 'sunum-kontrol'); kontrol.hidden = true;
    kontrol.append(btn('cip', 'Önceki', () => { durdur(); geri(); }), btn('cip', 'Sonraki', () => { durdur(); kart.classList.add('sunumda'); ileri(); }), btn('cip', 'Bitir', bitir));
    const tam = btn('dugme ikincil', 'Tam ekran', () => { const acik = kart.classList.toggle('tam'); tam.textContent = acik ? 'Küçült' : 'Tam ekran'; document.body.classList.toggle('kilit', acik); });
    arac.append(oynat, kontrol, tam, lej);
    kart.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (kart.classList.contains('tam')) tam.click(); else bitir(); } if (e.key === 'ArrowRight') { durdur(); kart.classList.add('sunumda'); kontrol.hidden = false; ileri(); } if (e.key === 'ArrowLeft') { durdur(); geri(); } });
    kart.tabIndex = -1;
    govde.appendChild(kart);
    // sekmeler
    const gordum = h('div', 'bolge-liste');
    v.bolgeler.forEach((b, i) => {
      const d = h('details', 'bolge'); d.innerHTML = `<summary><span class="b-no">${i + 1}</span><span>${kac(b.ad)}</span></summary>`; d.appendChild(maddeler(b.m));
      d.addEventListener('toggle', () => { if (d.open) { gordum.querySelectorAll('details').forEach((x) => x !== d && (x.open = false)); durdur(); sira = i; madde = b.m.length; window.Motor.odak(H, i); } else if (![...gordum.querySelectorAll('details')].some((x) => x.open)) { window.Motor.odak(H, -1); sira = -1; } });
      gordum.appendChild(d);
    });
    gordum.appendChild(h('p', 'ipucu', 'Haritadaki turuncu numaralara da dokunabilirsin.'));
    H.bolgeler.forEach((b, i) => { const ac = () => { const d = gordum.querySelectorAll('details')[i]; d.open = !d.open; sk.sec(0); }; b.el.addEventListener('click', ac); b.el.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), ac())); });
    const soyle = h('div', 'soyle'); soyle.appendChild(h('blockquote', 'konusma', kac(v.soyle))); soyle.appendChild(dinleBtn(v.soyle, 'tr-TR', 'Sesli dinle'));
    const okuP = h('div'); okuP.appendChild(maddeler(v.oku)); okuP.appendChild(h('p', 'ipucu', 'Haritanın altındaki katman düğmelerinin üstüne gel: o katman öne çıkar; dokununca gizlenir.'));
    const nereden = h('div', 'nereden'); nereden.innerHTML = `<p class="site">${kac(v.nereden.site)}</p>` + (v.nereden.url ? `<p><a href="${v.nereden.url}" target="_blank" rel="noopener">${kac(v.nereden.url.replace('https://', ''))} ↗</a></p>` : ''); nereden.appendChild(maddeler(v.nereden.adim));
    const en = h('div', 'en'); en.appendChild(h('p', 'en-cumle', kac(v.en))); en.appendChild(dinleBtn(v.en, 'en-US', 'Listen'));
    const sk = sekmeler([['Gördüklerim', gordum], ['Söylediğim', soyle], ['Neden?', maddeler(v.neden)], ['Nasıl okunur', okuP], ['Soru gelirse', soruPanel(v.soru)], ['Nereden?', nereden], ['İngilizce', en], ['Kendini dene', denePanel(v.dene)]]);
    const yan = h('div', 'adim-yan'); yan.appendChild(sk); govde.appendChild(yan);
    const alt = h('div', 'adim-alt'); alt.innerHTML = `<p class="oz"><b>ÖZ</b>${kac(v.oz)}</p>`; alt.appendChild(bittiDugme(id)); a.appendChild(alt);
    return a;
  }

  // ───────── araç adımı (SYNOP, Skew-T, meteogram)
  function aracAdim(id) {
    const v = V.ARAC[id], rol = V.ROL[v.rol];
    const a = h('article', 'adim adim-arac'); a.id = id; a.style.setProperty('--rol', rol.renk);
    a.innerHTML = `<header class="adim-bas"><p class="adim-etiket"><span class="rol-nokta"></span>${rol.ad} · ${rol.is} · ${v.sure}</p><h3>${kac(v.baslik)}</h3><p class="adim-kisa">${kac(v.kisa)}</p></header>`;
    const kart = h('figure', 'arac-kart'); kart.innerHTML = `<figcaption class="harita-ust"><b>${kac(v.ad)}</b><span>${kac(v.tur)} · ${kac(v.gecerli)}</span><span class="harita-kaynak">Kaynak: ${kac(v.kaynak)}</span></figcaption>`;
    const ic = h('div', 'arac-ic arac-' + id); kart.appendChild(ic); a.appendChild(kart);
    window.Araclar[id](ic);
    const soyle = h('div', 'soyle'); soyle.appendChild(h('blockquote', 'konusma', kac(v.soyle))); soyle.appendChild(dinleBtn(v.soyle, 'tr-TR', 'Sesli dinle'));
    const en = h('div', 'en'); en.appendChild(h('p', 'en-cumle', kac(v.en))); en.appendChild(dinleBtn(v.en, 'en-US', 'Listen'));
    a.appendChild(sekmeler([['Söylediğim', soyle], ['Neden?', maddeler(v.neden)], ['Soru gelirse', soruPanel(v.soru)], ['İngilizce', en]]));
    const alt = h('div', 'adim-alt'); alt.innerHTML = `<p class="oz"><b>ÖZ</b>${kac(v.oz)}</p>`; alt.appendChild(bittiDugme(id)); a.appendChild(alt);
    return a;
  }

  // ───────── bölüm iskeleti
  function bolum(b, baslik, kisa) {
    const s = h('section', 'bolum'); s.id = b.id; if (b.rol) s.style.setProperty('--rol', V.ROL[b.rol].renk);
    s.innerHTML = `<header class="bolum-bas"><p class="bolum-no">${b.no === '?' ? 'S.S.S.' : 'Bölüm ' + b.no}${b.rol ? ` · ${V.ROL[b.rol].ad}` : ''}</p><h2>${baslik || b.ad}</h2>${kisa ? `<p class="bolum-kisa">${kisa}</p>` : ''}</header>`;
    return s;
  }

  // ───────── giriş
  function giris(s) {
    const akis = h('div', 'akis'); akis.setAttribute('aria-label', 'Brifingin akışı');
    [['yer', 1, 'Ne var?', 'Yerde alçak, yüksek, cephe'], ['ustsev', 2, 'Neden var?', '850 → 300 hPa'], ['dinamik', 3, 'Nereye gidiyor?', 'PVA, diverjans, nem'], ['gozlem', 4, 'Gerçekten oluyor mu?', 'Uydu, radar'], ['istanbul', 5, 'Bize ne olacak?', 'SYNOP, sondaj, meteogram → tahmin']].forEach(([id, r, s1, s2], i) => {
      const a = h('a', 'akis-k', `<span class="akis-no">${i + 1}</span><b>${s1}</b><span>${s2}</span><em>${V.ROL[r].ad} · ${V.ROL[r].is}</em>`); a.href = '#' + id; a.style.setProperty('--rol', V.ROL[r].renk); akis.appendChild(a);
    });
    s.appendChild(akis);
    const iz = h('div', 'kartlar3');
    iz.innerHTML = `<div class="kart"><h3>Ne?</h3><p>Bir analiz anında atmosferi yerden jet seviyesine haritalarla okuyup gözlemlerle doğrulamak ve bir yer için sayılarla tahmin vermek. Meteoroloji ofislerindeki sabah toplantısının ders hâli.</p></div><div class="kart"><h3>Neden bu sıra?</h3><p>Genelden özele: önce kıtada ne var, sonra yukarıda neden var, model nereye götürüyor, gözlem doğruluyor mu, en son İstanbul’a ne olacak. Her bölüm bir öncekine dayanır.</p></div><div class="kart"><h3>Künye</h3><dl class="kunye"><dt>Süre</dt><dd>en çok 20–25 dk</dd><dt>Grup</dt><dd>5 kişi, kişi başı ~4 dk</dd><dt>Not</dt><dd>brifing + rapor + proje sunumu ortalaması</dd><dt>Örnek</dt><dd>9 Kas 12 UTC → 10 Kas İstanbul</dd></dl></div>`;
    s.appendChild(iz);
    // altın kural: 3 cümle kurucu
    const kural = h('div', 'kural');
    kural.innerHTML = '<h3>Altın kural: her haritada üç cümle</h3><p class="bolum-kisa">Gördüğüm → anlamı → beklentim. Her cümlede bir sayı. Bir örnekle dene:</p>';
    const cumleler = [['Gördüğüm', 'Karadeniz üzerinde 1030 hPa’lık kapalı izobarla bir yüksek var; İstanbul’da basınç 3 saatte 2 hPa düşmüş.'], ['Anlamı', 'Yüksek basınç zayıflıyor ve batıdan gelen sisteme yer açıyor.'], ['Beklentim', 'Basınç düşmeye devam edecek; Salı sabahı bulut ve yağış İstanbul’a ulaşacak.']];
    const sira = h('ol', 'kural-sira'); cumleler.forEach(([a, b], i) => { const li = h('li', 'kural-c'); li.innerHTML = `<span class="kural-et">${a}</span><span class="kural-m">${b}</span>`; li.hidden = i > 0; sira.appendChild(li); });
    let n = 1; const ileri = btn('dugme', 'Sonraki cümle', () => { if (n < 3) { sira.children[n].hidden = false; n++; } if (n >= 3) { ileri.hidden = true; sifir.hidden = false; } }); const sifir = btn('cip', 'Baştan', () => { n = 1; [...sira.children].forEach((c, i) => (c.hidden = i > 0)); ileri.hidden = false; sifir.hidden = true; }); sifir.hidden = true;
    kural.append(sira, ileri, sifir); s.appendChild(kural);
  }

  // ───────── hazırlık
  function hazirlik(s) {
    const adim = (id, baslik, kisa, govde) => { const a = h('article', 'adim adim-duz'); a.id = id; a.innerHTML = `<header class="adim-bas"><p class="adim-etiket">Hazırlık</p><h3>${baslik}</h3><p class="adim-kisa">${kisa}</p></header>`; a.appendChild(govde); s.appendChild(a); };
    const saatK = h('div', 'arac-kart saat'); window.Araclar.saat(saatK);
    adim('saat', 'Önce saati sabitledim', 'Bütün analiz haritaları aynı ana ait olmalı: sunumdan önceki günün 12 UTC’si. Tahmin sunum günü için.', saatK);
    // veri listesi
    const isaret = new Set(depo.al('sb:liste', []));
    const lk = h('div', 'liste-k'); const say = h('p', 'liste-say');
    const tabl = h('div', 'liste-tablo');
    V.LISTE.forEach(([id, ad, site]) => { const r = h('label', 'liste-r'); r.innerHTML = `<input type="checkbox" ${isaret.has(id) ? 'checked' : ''}><span class="liste-ad">${ad}</span><span class="liste-site">${site}</span><a href="#${id}" class="liste-git">adıma git</a>`; r.querySelector('input').addEventListener('change', (e) => { if (e.target.checked) isaret.add(id); else isaret.delete(id); depo.koy('sb:liste', [...isaret]); guncel(); }); tabl.appendChild(r); });
    const guncel = () => (say.textContent = `${isaret.size} / ${V.LISTE.length} ürün hazır`);
    guncel(); lk.append(say, tabl);
    const kopya = btn('cip', 'Listeyi panoya kopyala', async () => { const metin = V.LISTE.map(([, ad, site]) => `- ${ad} — ${site}`).join('\n'); try { await navigator.clipboard.writeText(metin); kopya.textContent = 'Kopyalandı'; } catch (e) { const t = h('textarea', 'gizli-metin'); t.value = metin; lk.appendChild(t); t.select(); kopya.textContent = 'Metni seçtim: Ctrl+C'; } setTimeout(() => (kopya.textContent = 'Listeyi panoya kopyala'), 2500); });
    lk.appendChild(kopya);
    adim('liste', 'Haritaları tek listede topladım', '18 ürün, hepsi aynı analiz anına ait. İndirdikçe işaretle; dosya adına saati yaz.', lk);
    // roller
    const rk = h('div', 'rol-k'); const cubuk = h('div', 'rol-cubuk'); const detay = h('div', 'rol-detay', '<p class="ipucu">Bir kişiye dokun: hangi haritaları anlatacağı ve süresi burada.</p>');
    const SURE = { 1: 4, 2: 4.5, 3: 4, 4: 3.5, 5: 4 };
    Object.entries(V.ROL).forEach(([r, o]) => {
      const b = btn('rol-p', `<b>${o.ad}</b><span>${o.is}</span><em>~${String(SURE[r]).replace('.', ',')} dk</em>`); b.style.setProperty('--rol', o.renk); b.style.flexGrow = SURE[r];
      b.addEventListener('click', () => { cubuk.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); const ids = BOLUM.filter((x) => x.rol === +r).flatMap((x) => x.adim || [x.id]); detay.innerHTML = `<p><b>${o.ad} — ${o.is}</b></p><ol>${ids.map((i) => `<li><a href="#${i}">${kac(ADIM_AD[i] || 'Sonuç ve tahmin')}</a></li>`).join('')}</ol>`; });
      b.setAttribute('aria-pressed', 'false'); cubuk.appendChild(b);
    });
    rk.append(cubuk, h('p', 'rol-not', 'Toplam ~20 dk. Girişi Kişi 1, sonucu Kişi 5 yapar; herkes bir bölüm anlatır.'), detay);
    adim('roller', 'İşi beş kişiye böldüm', 'Her kişi bir bölüm: yer, üst seviyeler, dinamik, gözlemler, İstanbul ve sonuç. Sıra = akış.', rk);
    // slayt kalıbı + animasyon tekniği
    const sk = h('div', 'kalip-k');
    sk.innerHTML = `<div class="kalip-slayt"><div class="ks-ust"><b>500 hPa — trof ve sırt</b><span>09.11.2026 00 UTC · Analiz</span></div><div class="ks-harita"><span>harita</span><i class="ks-bolge"></i></div><ul class="ks-madde"><li>1 bölge = 2–3 kısa madde, her birinde bir sayı</li><li>Altta tek satır öz</li></ul><div class="ks-oz">ÖZ: Yeni trof Balkanlar’a iniyor; İstanbul iki trofun arasında.</div><div class="ks-alt">Kaynak · sunan kişi</div></div>
    <ol class="kalip-adim"><li><b>Başlık satırı:</b> harita adı + saat + analiz/tahmin.</li><li><b>Bölge seç:</b> İstanbul’a etki eden 2–3 bölge; haritanın tamamını anlatma.</li><li><b>Karart ve büyüt:</b> PowerPoint’te yarı saydam siyah dikdörtgen + bölgenin kopyası; kopyaya «Görünme» + «Büyüt/Küçült» + «Hareket yolu» ile yerinden büyüme.</li><li><b>Maddeleri sırayla getir:</b> her madde «Görünme», tıklamayla.</li><li><b>Konuşma notu:</b> «Söylediğim» metnini slayt notlarına koy.</li><li><b>Öz şeridi:</b> slaytın altında tek cümle.</li></ol><p class="ipucu">Bu sitedeki her haritada «Sunum modu» düğmesi aynı tekniği canlı gösterir.</p>`;
    const dene = btn('dugme', 'Sunum modunu ilk haritada dene', () => { location.hash = '#yer-eu'; setTimeout(() => { const k = $('#yer-eu .harita-arac .dugme'); if (k) k.click(); }, AZ ? 50 : 700); });
    sk.appendChild(dene);
    adim('kalip', 'Her slaytı aynı kalıpla kurdum', 'Başlık + saat, karartılıp büyüyen bölge, sırayla gelen maddeler, altta tek satır öz.', sk);
  }

  // ───────── sonuç
  function sonuc(s) {
    const S = V.SONUC;
    // kanıt zinciri
    const z = h('div', 'zincir'); z.innerHTML = '<h3>Kanıt zinciri</h3><p class="bolum-kisa">Tahminin her halkası bir haritaya dayanır. Oynat ya da halkaya dokun: o adıma gidersin.</p>';
    const hz = h('ol', 'zincir-l'); S.zincir.forEach(([id, m], i) => { const li = h('li', 'zincir-h'); li.innerHTML = `<a href="#${id}"><span class="z-no">${i + 1}</span><span class="z-m">${kac(m)}</span><span class="z-ad">${kac(ADIM_AD[id])}</span></a>`; hz.appendChild(li); });
    const oyn = btn('dugme', 'Zinciri oynat', () => { hz.querySelectorAll('li').forEach((l) => l.classList.remove('yandi')); [...hz.children].forEach((l, i) => setTimeout(() => l.classList.add('yandi'), AZ ? 0 : i * 650)); });
    z.append(hz, oyn); s.appendChild(z);
    // tablo
    const t = h('div', 'sonuc-t'); t.innerHTML = '<h3>Son slayt: İstanbul için tahmin</h3><p class="bolum-kisa">10 Kasım Salı. Her satırın altındaki adlar o cümlenin kanıtı: dokun, o haritaya git.</p>';
    S.tablo.forEach(([a, m, ids]) => { const r = h('div', 'st-r'); r.innerHTML = `<p class="st-a">${a}</p><div><p>${kac(m)}</p><p class="st-kanit">${ids.map((i) => `<a href="#${i}">${kac(ADIM_AD[i])}</a>`).join('')}</p></div>`; t.appendChild(r); });
    s.appendChild(t);
    const sk = sekmeler([['Söylediğim', (() => { const d = h('div', 'soyle'); d.appendChild(h('blockquote', 'konusma', kac(S.soyle))); d.appendChild(dinleBtn(S.soyle, 'tr-TR', 'Sesli dinle')); return d; })()], ['Modeller ayrışınca', maddeler(S.ayrisma)], ['İngilizce', (() => { const d = h('div', 'en'); d.appendChild(h('p', 'en-cumle', kac(S.en))); d.appendChild(dinleBtn(S.en, 'en-US', 'Listen')); return d; })()]]);
    s.appendChild(sk);
  }

  // ───────── sunum günü
  function gun(s) {
    const k = h('div', 'kalip-t'); k.innerHTML = '<h3>Hazır cümle kalıpları</h3>';
    const tb = h('div', 'tablo-kap'); tb.innerHTML = `<table><thead><tr><th>Ne zaman</th><th>Türkçe</th><th>English</th></tr></thead><tbody>${V.KALIP.map(([a, b, c]) => `<tr><td>${a}</td><td>${kac(b)}</td><td lang="en">${kac(c)}</td></tr>`).join('')}</tbody></table>`;
    k.appendChild(tb); s.appendChild(k);
    const hk = h('div', 'hatalar'); hk.innerHTML = '<h3>Sık yapılan hatalar</h3>'; hk.appendChild(maddeler(V.HATALAR)); s.appendChild(hk);
    // soru kartları
    const kartlar = []; Object.entries(V.H).forEach(([id, v]) => v.soru.forEach(([q, a]) => kartlar.push({ id, rol: v.rol, q, a }))); Object.entries(V.ARAC).forEach(([id, v]) => v.soru.forEach(([q, a]) => kartlar.push({ id, rol: v.rol, q, a })));
    const sk = h('div', 'soru-k'); sk.innerHTML = `<h3>Hoca sorabilir: ${kartlar.length} kart</h3><p class="bolum-kisa">Önce cevabı kendin söyle, sonra karta dokunup çevir. Kişiye göre süz.</p>`;
    const suz = h('div', 'suz'); const izg = h('div', 'kart-izgara');
    const ciz = (r) => { izg.innerHTML = ''; kartlar.filter((x) => !r || x.rol === r).forEach((x) => { const c = btn('cevir', `<span class="cv-on"><em>${kac(ADIM_AD[x.id])}</em>${kac(x.q)}</span><span class="cv-arka">${kac(x.a)}</span>`); c.style.setProperty('--rol', V.ROL[x.rol].renk); c.setAttribute('aria-pressed', 'false'); c.addEventListener('click', () => c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true'))); izg.appendChild(c); }); };
    const sb = (ad, r) => { const b = btn('cip', ad, () => { suz.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); ciz(r); }); b.setAttribute('aria-pressed', r ? 'false' : 'true'); suz.appendChild(b); };
    sb('Hepsi', 0); Object.entries(V.ROL).forEach(([r, o]) => sb(`${o.ad} · ${o.is}`, +r));
    ciz(0); sk.append(suz, izg); s.appendChild(sk);
    // sınav
    const qk = h('div', 'quiz'); qk.innerHTML = `<h3>Kendini dene: ${V.QUIZ.length} soru</h3>`;
    let dogru = 0, cevap = 0; const skor = h('p', 'quiz-skor'); skor.setAttribute('aria-live', 'polite');
    V.QUIZ.forEach(([q, sec, d, aci], i) => {
      const x = h('div', 'quiz-s'); x.innerHTML = `<p class="dene-s"><span class="q-no">${i + 1}</span>${kac(q)}</p>`; const ss = h('div', 'dene-sec'); const g = h('p', 'dene-geri');
      sec.forEach((c, k) => ss.appendChild(btn('dene-b', kac(c), () => { ss.querySelectorAll('button').forEach((b, j) => { b.disabled = true; b.classList.toggle('dogru', j === d); b.classList.toggle('yanlis', j === k && k !== d); }); if (k === d) dogru++; cevap++; g.innerHTML = (k === d ? '<b>Doğru.</b> ' : '<b>Tam değil.</b> ') + kac(aci); skor.textContent = `${cevap} / ${V.QUIZ.length} cevaplandı · ${dogru} doğru`; })));
      x.append(ss, g); qk.appendChild(x);
    });
    qk.appendChild(skor); s.appendChild(qk);
  }

  function sss(s) { s.appendChild(soruPanel(V.SSS)); }

  // ───────── kurulum
  function kur() {
    ustCubuk();
    const ana = $('#ana');
    const hero = h('section', 'hero'); hero.id = 'basla';
    hero.innerHTML = `<p class="hero-ust">MTO 302E · Hava Analizi ve Öngörü I</p><h1>Sinoptik Brifing Atölyesi</h1><p class="hero-alt">Bir brifing, haritadan tahmine adım adım. Her adım gerçek bir örnekle: <b>9 Kasım 2026 12 UTC</b> analizinden <b>10 Kasım</b> İstanbul tahminine.</p><dl class="hero-kunye"><div><dt>Adım</dt><dd>18 harita ve araç</dd></div><div><dt>Süre</dt><dd>en çok 20–25 dk</dd></div><div><dt>Grup</dt><dd>5 kişi</dd></div><div><dt>Etkileşim</dt><dd>sunum modu, katmanlar, çözücüler</dd></div></dl>`;
    const hb = h('div', 'hero-d'); const a1 = h('a', 'dugme', 'Baştan başla'); a1.href = '#giris'; const a2 = h('a', 'dugme ikincil', 'Doğrudan haritalara'); a2.href = '#yer'; hb.append(a1, a2); hero.appendChild(hb);
    ana.appendChild(hero);
    for (const b of BOLUM) {
      const kisa = { giris: 'Ne yapıyoruz, hangi sırayla ve neden. Akışın bir halkasına dokun: o bölüme gidersin.', hazirlik: 'Sunumdan önceki akşam yapılanlar: saat, veri listesi, iş bölümü ve slayt kalıbı.', yer: 'Kıtadaki alçak, yüksek ve cepheler: «ne var?»', ustsev: '850’den 300 hPa’ya: «neden var?» Değerleri aynı saatin sondajıyla doğruladık.', dinamik: 'Model haritalarıyla yükselmenin nedeni: «nereye gidiyor?»', gozlem: 'Uydu ve radar: «gerçekten oluyor mu?»', istanbul: 'Bölgeden noktaya: SYNOP, sondaj, meteogram.', sonuc: 'Bütün haritaları tek tahmine bağla.', gun: 'Konuşma kalıpları, hatalar, soru kartları ve kısa sınav.', sss: '' }[b.id];
      const s = bolum(b, null, kisa); ana.appendChild(s);
      if (b.id === 'giris') giris(s);
      else if (b.id === 'hazirlik') hazirlik(s);
      else if (b.id === 'sonuc') sonuc(s);
      else if (b.id === 'gun') gun(s);
      else if (b.id === 'sss') sss(s);
      else if (b.id === 'istanbul') b.adim.forEach((id) => s.appendChild(aracAdim(id)));
      else b.adim.forEach((id) => s.appendChild(haritaAdim(id)));
    }
    icindekiler();
    $('#alt').innerHTML = `<div class="alt-ic"><p><b>Sinoptik Brifing Atölyesi</b> · Atmosfer Akademisi · MTO 302E.</p><p>Haritalar gerçek analiz ve tahminlerin sadeleştirilmiş çizimleridir; sayılar örnek brifingde okunan değerlerdir. Kıyı ve sınır çizgileri: Natural Earth (kamu malı). Sondaj: University of Wyoming. SYNOP: Ogimet. Model haritaları: ECMWF Open Charts (CC BY 4.0), GFS (wetter3), DWD analizi. Yazı tipi: Inter (SIL OFL).</p><p><a href="../">Atmosfer Akademisi</a> · <a href="../harita-okulu/">Harita Okulu</a> · <a href="../hava-analizi-proje-rehberi/">Proje Rehberi</a></p></div>`;
    if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) setTimeout(() => t.scrollIntoView(), 60); }
    addEventListener('hashchange', () => { const t = document.getElementById(location.hash.slice(1)); if (t) { t.classList.remove('parla'); void t.offsetWidth; t.classList.add('parla'); } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kur); else kur();
})();
