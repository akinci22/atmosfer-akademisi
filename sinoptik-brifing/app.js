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

  // ───────── sahne: değişen görsel ile kontroller tek ekranda
  // Geniş ekran (YAN): görsel solda, kontroller + açıklama sağda; sahne ekrana sığar, sağ panel kendi içinde kayar.
  // Telefon: görsel üstte yapışkan; bir öğeye basınca açıklama görselin hemen altına gelecek kadar kaydırılır.
  const YAN = matchMedia('(min-width: 900px), (orientation: landscape) and (min-width: 600px) and (max-height: 500px)');
  const YAPISKAN = '.sahne-gorsel';
  const ustYuk = () => { const u = $('#ust'); return u ? u.getBoundingClientRect().height : 0; };
  function olc() { // üst çubuk yüksekliği + sahnenin metin sütunundan taşma payı → CSS
    const kok = document.documentElement;
    kok.style.setProperty('--ust-h', ustYuk() + 'px');
    // geniş ekranda sahne metin sütunundan taşar: genişlik min(sayfa − 32, 1600), ortada (yan İçindekiler sütununun üstüne biner)
    const ana = $('#ana');
    if (ana) { const cw = kok.clientWidth, W = Math.min(cw - 32, 1600), sol = (cw - W) / 2, r = ana.getBoundingClientRect(); kok.style.setProperty('--tas-sol', Math.max(0, Math.round(r.left - sol)) + 'px'); kok.style.setProperty('--tas-sag', Math.max(0, Math.round(sol + W - r.right)) + 'px'); }
  }
  // panel içinde yapışkan şerit (üstte) ve adım düğmeleri (altta) içeriği örter: görünür bant onların arası
  const yapisikYuk = (el) => (el && el.offsetParent && getComputedStyle(el).position === 'sticky' ? el.offsetHeight : 0);
  function odakla(kap, el) { // kap: sahnenin kökü · el: değişen açıklama (yoksa yalnız görsel)
    if (!kap) return;
    requestAnimationFrame(() => {
      const tam = kap.classList.contains('tam'), kay = AZ ? 'auto' : 'smooth', kr = kap.getBoundingClientRect();
      const ust = tam ? kr.top : ustYuk(), alt = tam ? kr.bottom : innerHeight;
      const yap = kap.querySelector(YAPISKAN), yapisik = yap && getComputedStyle(yap).position === 'sticky';
      let d = 0;
      if (!yapisik) {
        // geniş ekran: sahnenin tamamı görünsün (üstü çubuğun hemen altında), açıklama sağ panelin içinde görünsün
        if (!tam && (kr.top < ust - 1 || kr.bottom > alt + 1)) d = kr.height > alt - ust - 8 ? kr.top - ust : kr.top - ust - 8;
        const p = el && el.closest('.sahne-panel');
        if (p && p.scrollHeight > p.clientHeight + 1) {
          const pr = p.getBoundingClientRect(), r = el.getBoundingClientRect(), bas = p.querySelector('.secim-serit');
          const ust2 = pr.top + (bas && !bas.contains(el) && bas.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING ? yapisikYuk(bas) : 0);
          const alt2 = pr.bottom - yapisikYuk(p.querySelector('.adim-gez'));
          let e = 0;
          if (r.top < ust2) e = r.top - ust2 - 8; else if (r.bottom > alt2) e = Math.min(r.bottom - alt2 + 8, r.top - ust2 - 8);
          if (Math.abs(e) > 2) p.scrollBy({ top: e, behavior: kay });
        } else if (el && !tam && !kap.contains(el)) { const r = el.getBoundingClientRect(), t = r.top - d, b = r.bottom - d; if (t < ust) d += t - ust - 12; else if (b > alt) d += Math.min(b - alt + 12, t - ust - 12); }
      } else {
        // telefon: görsel tepeye yapışık ve tam görünür; açıklama onun hemen altında
        const yr = yap.getBoundingClientRect();
        if (yr.top < ust - 1 || yr.bottom > alt + 1) { yap.style.position = 'static'; d = yap.getBoundingClientRect().top - ust; yap.style.position = ''; }
        if (el && !yap.contains(el)) { const r = el.getBoundingClientRect(), t = r.top - d, b = r.bottom - d, s = ust + yr.height; if (t < s + 4) d += t - s - 8; else if (b > alt - 4) d += Math.min(b - alt + 12, t - s - 8); }
      }
      // mutlak hedef: üst üste gelen iki odaklama (ya da yarıda kesilen yumuşak kaydırma) aynı yere varır
      if (Math.abs(d) > 2) { if (tam) kap.scrollBy({ top: d, behavior: kay }); else scrollTo({ top: Math.round(scrollY + d), behavior: kay }); }
    });
  }
  // sahneye git: sahnenin üstü çubuğun hemen altına gelir (çapa, İçindekiler, ‹ önceki · sonraki › harita)
  function sahneyeGit(id, anlik) {
    const a = document.getElementById(id), s = a && a.querySelector('.sahne'); if (!s) return false;
    const y = scrollY + s.getBoundingClientRect().top - ustYuk() - (YAN.matches ? 8 : 0);
    scrollTo({ top: Math.max(0, Math.round(y)), behavior: anlik || AZ ? 'instant' : 'smooth' });
    return true;
  }
  const parla = (t) => { t.classList.remove('parla'); void t.offsetWidth; t.classList.add('parla'); };
  // telefonda kategori/öğe şeridi yapışkan sahnenin içine (görselin hemen altına) taşınır; geniş ekranda panelin üstünde durur
  function seritKur(kart, gorsel) {
    const s = kart.querySelector('.sahne-panel .secim-serit'); if (!s) return;
    const yer = document.createComment('şerit'); s.parentNode.insertBefore(yer, s);
    const f = () => { if (YAN.matches) yer.parentNode.insertBefore(s, yer.nextSibling); else gorsel.appendChild(s); };
    f(); YAN.addEventListener('change', f);
  }

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
  // sahne sırası: 15 harita + 3 araç; kategoriler = İçindekiler bölümleri
  const SIRA = BOLUM.filter((b) => b.adim).flatMap((b) => b.adim.map((id) => ({ id, b })));
  function gezinti(id) { // sahne içinde «‹ önceki harita · seçici · sonraki harita ›»
    const i = SIRA.findIndex((x) => x.id === id), o = SIRA[i - 1], s = SIRA[i + 1];
    const kap = h('div', 'sahne-gez'); kap.setAttribute('role', 'group'); kap.setAttribute('aria-label', 'Haritalar arasında gez');
    const git = (x) => () => { history.replaceState(null, '', '#' + x.id); sahneyeGit(x.id); if (YAN.matches) { const k = document.querySelector(`#${x.id} .sahne`); if (k) k.focus({ preventScroll: true }); } };
    const b1 = btn('gez-b', '‹', o && git(o)), b2 = btn('gez-b', '›', s && git(s));
    const etk = (b, x, ad) => { if (x) { b.title = ad + ': ' + ADIM_AD[x.id]; b.setAttribute('aria-label', b.title); } else b.disabled = true; };
    etk(b1, o, 'Önceki harita'); etk(b2, s, 'Sonraki harita');
    const et = h('label', 'gez-et'); et.innerHTML = `<span class="gez-ust">Harita ${i + 1} / ${SIRA.length} · ${kac(SIRA[i].b.ad)}</span>`;
    const sec = h('select', 'gez-sec'); sec.setAttribute('aria-label', 'Haritaya git');
    BOLUM.filter((b) => b.adim).forEach((b) => { const g = h('optgroup'); g.label = `${b.no} · ${b.ad}`; b.adim.forEach((x) => { const op = h('option', null, kac(ADIM_AD[x])); op.value = x; if (x === id) op.selected = true; g.appendChild(op); }); sec.appendChild(g); });
    sec.addEventListener('change', () => { const x = SIRA.find((y) => y.id === sec.value); sec.value = id; if (x && x.id !== id) git(x)(); });
    et.appendChild(sec); kap.append(b1, et, b2); return kap;
  }

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
    const sec = (i) => {
      bar.querySelectorAll('button').forEach((b, k) => { b.setAttribute('aria-selected', String(k === i)); b.tabIndex = k === i ? 0 : -1; }); govde.querySelectorAll('.sekme-panel').forEach((p, k) => (p.hidden = k !== i));
      // seçili sekme çubukta görünsün (haritadaki numaraya dokununca «Gördüklerim» seçilir)
      const b = bar.children[i]; if (b) { const br = bar.getBoundingClientRect(), r = b.getBoundingClientRect(); if (r.left < br.left || r.right > br.right) bar.scrollBy({ left: r.left < br.left ? r.left - br.left - 8 : r.right - br.right + 8, behavior: AZ ? 'auto' : 'smooth' }); }
    };
    liste.forEach(([ad, icerik, n], i) => {
      const b = btn('sekme-b', `<span>${ad}</span>${n ? `<span class="kat-n">${n}</span>` : ''}`, () => sec(i)); b.setAttribute('role', 'tab'); bar.appendChild(b);
      const p = h('div', 'sekme-panel'); p.setAttribute('role', 'tabpanel'); p.appendChild(icerik); govde.appendChild(p);
    });
    bar.addEventListener('keydown', (e) => { const bs = [...bar.querySelectorAll('button')], i = bs.indexOf(document.activeElement); if (i < 0) return; if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const j = (i + (e.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length; sec(j); bs[j].focus(); } });
    sec(0); kap.sec = sec; return kap;
  }
  const maddeler = (arr) => { const ul = h('ul', 'madde'); arr.forEach((m) => ul.appendChild(h('li', null, kac(m)))); return ul; };
  function soruPanel(arr, ac) { // ac(i, acik): bir soru açılınca/kapanınca (sahne içindeyse seçim şeridi eşitlenir)
    const d = h('div', 'satirlar');
    arr.forEach(([s, c], i) => { const x = h('details', 'satir'); x.innerHTML = `<summary><span>${kac(s)}</span></summary><p>${kac(c)}</p>`; if (ac) x.addEventListener('toggle', () => { if (x.open) d.querySelectorAll('details').forEach((y) => y !== x && (y.open = false)); ac(i, x.open, x); }); d.appendChild(x); });
    return d;
  }
  function denePanel(q) {
    const d = h('div', 'dene'); d.appendChild(h('p', 'dene-s', kac(q.s))); const sec = h('div', 'dene-sec'); const geri = h('p', 'dene-geri'); geri.setAttribute('aria-live', 'polite');
    q.c.forEach((c, i) => { const b = btn('dene-b', kac(c), () => { sec.querySelectorAll('button').forEach((x, k) => { x.disabled = true; x.classList.toggle('dogru', k === q.d); x.classList.toggle('yanlis', k === i && i !== q.d); }); geri.innerHTML = (i === q.d ? '<b>Doğru.</b> ' : '<b>Tam değil.</b> ') + kac(q.a); tekrar.hidden = false; odakla(d.closest('.sahne, .arac-kart'), tekrar); }); sec.appendChild(b); });
    const tekrar = btn('cip', 'Yeniden dene', () => { sec.querySelectorAll('button').forEach((x) => { x.disabled = false; x.classList.remove('dogru', 'yanlis'); }); geri.textContent = ''; tekrar.hidden = true; }); tekrar.hidden = true;
    d.append(sec, geri, tekrar); return d;
  }

  // ───────── harita adımı
  // Sahne = harita (değişen kısım) + panel (seçim listesi). Panel: harita gezintisi → sunum/tam ekran/lejant → kategori satırı
  // (yapışkan; sekmeler = kategoriler, sayılı) → o kategorinin öğeleri ve açıklaması → «‹ Önceki · Sonraki ›» (yapışkan, altta).
  // Telefonda kategori + öğe şeridi yapışkan haritanın hemen altına taşınır; açıklama altında akar.
  const HARITA_NESNE = {};
  const lejTur = (tur) => (tur === 'renk' ? 'renk' : tur === 'kesik' ? 'kesik' : tur === 'harf' ? 'harf' : tur === 'ist' || tur === 'ok' ? 'ist' : 'cizgi');
  function haritaAdim(id) {
    const v = V.H[id], m = HR[id], rol = V.ROL[v.rol]; m.id = id;
    const a = h('article', 'adim'); a.id = id; a.style.setProperty('--rol', rol.renk);
    a.innerHTML = `<header class="adim-bas"><p class="adim-etiket"><span class="rol-nokta"></span>${rol.ad} · ${rol.is} · ${v.sure}</p><h3>${kac(v.baslik)}</h3><p class="adim-kisa">${kac(v.kisa)}</p></header>`;
    const kart = h('figure', 'harita-kart sahne sahne-harita');
    kart.innerHTML = `<figcaption class="harita-ust"><b>${kac(v.ad)}</b><span>${kac(v.tur)} · ${kac(v.gecerli)}</span><span class="harita-kaynak">Kaynak: ${kac(v.kaynak)} · sadeleştirilmiş çizim</span></figcaption>`;
    const gorsel = h('div', 'sahne-gorsel'); const cer = h('div', 'sahne-cer'); const alan = h('div', 'harita-alan'); cer.appendChild(alan); gorsel.appendChild(cer); kart.appendChild(gorsel);
    const H = window.Motor.ciz(alan, m); HARITA_NESNE[id] = H; const ar = (H.g.w / H.g.h).toFixed(4); alan.style.setProperty('--ar', ar); kart.style.setProperty('--ar', ar); kart.classList.toggle('genis-gorsel', ar >= 1.6);
    const altyazi = h('div', 'sunum-alt'); altyazi.hidden = true; altyazi.setAttribute('aria-live', 'polite');
    const panel = h('div', 'sahne-panel'); kart.appendChild(panel);
    panel.appendChild(gezinti(id));
    const arac = h('div', 'harita-arac'); panel.appendChild(arac);
    // lejant: kapalıyken tek satır (örnek çizgiler + sayı); açınca katman düğmeleri
    const lejK = h('details', 'lejant-kap'); const lej = h('div', 'lejant'); lej.setAttribute('aria-label', 'Katmanlar');
    const L = m.lejant || [];
    const ozet = h('summary', 'lejant-ozet'); ozet.innerHTML = `<span class="lejant-et">Lejant</span><span class="lejant-mini" aria-hidden="true">${L.map(([, tur, renk]) => `<span class="lej-ornek lej-${lejTur(tur)}" style="--c:${renk}"></span>`).join('')}</span><span class="kat-n">${L.length}</span>`;
    lejK.append(ozet, lej); if (!L.length) lejK.hidden = true;
    lejK.addEventListener('toggle', () => { if (lejK.open) odakla(kart, lej); });
    L.forEach(([k, tur, renk, ad]) => {
      const b = btn('lej', `<span class="lej-ornek lej-${lejTur(tur)}" style="--c:${renk}"></span><span>${kac(ad)}</span>`);
      b.setAttribute('aria-pressed', 'true'); b.dataset.k = k;
      b.addEventListener('click', () => { const acik = b.getAttribute('aria-pressed') !== 'true'; lej.querySelectorAll(`[data-k="${k}"]`).forEach((x) => x.setAttribute('aria-pressed', String(acik))); const g = H.katman[k]; if (g) g.style.display = acik ? '' : 'none'; odakla(kart); });
      b.addEventListener('mouseenter', () => { if (!H.katman[k]) return; H.svg.classList.add('vurgu-kip'); Object.entries(H.katman).forEach(([ad2, g]) => g.classList.toggle('one', ad2 === k)); });
      b.addEventListener('mouseleave', () => { H.svg.classList.remove('vurgu-kip'); Object.values(H.katman).forEach((g) => g.classList.remove('one')); });
      lej.appendChild(b);
    });
    // sunum modu
    let sira = -1, madde = 0, zam = null, oynuyor = false;
    const durdur = () => { clearTimeout(zam); zam = null; oynuyor = false; oynat.textContent = 'Sunum modu'; };
    const goster = () => {
      const b = v.bolgeler[sira]; altyazi.hidden = false;
      altyazi.innerHTML = `<p class="sa-bas"><span class="sa-no">${sira + 1}/${v.bolgeler.length}</span>${kac(b.ad)}</p><ul>${b.m.map((x, i) => `<li class="${i < madde ? 'gor' : ''}">${kac(x)}</li>`).join('')}</ul>`;
      // telefonda alt yazı sabit yükseklikte: son gelen madde görünsün
      if (!YAN.matches) setTimeout(() => (altyazi.scrollTop = altyazi.scrollHeight), AZ ? 0 : 380);
    };
    // sunum adımı sonrası: harita tam görünür, alt yazı (geniş ekran) ya da düğmeler (telefon) görünür
    const sunumOdak = () => odakla(kart, YAN.matches ? altyazi : kontrol);
    const ileri = () => {
      if (sira >= v.bolgeler.length) return false; // öz gösteriliyor: ileri yok
      if (sira < 0) { sira = 0; madde = 0; window.Motor.odak(H, 0); goster(); return true; }
      const b = v.bolgeler[sira];
      if (madde < b.m.length) { madde++; goster(); return true; }
      if (sira < v.bolgeler.length - 1) { sira++; madde = 0; window.Motor.odak(H, sira); goster(); return true; }
      window.Motor.odak(H, -1); altyazi.hidden = false; altyazi.innerHTML = `<p class="sa-bas"><span class="sa-no">ÖZ</span>${kac(v.oz)}</p>`; sira = v.bolgeler.length; return false;
    };
    const geri = () => { if (sira <= 0 && madde <= 1) { bitir(); return; } if (sira >= v.bolgeler.length) { sira = v.bolgeler.length - 1; madde = v.bolgeler[sira].m.length; window.Motor.odak(H, sira); goster(); return; } if (madde > 0) { madde--; goster(); } else { sira--; madde = v.bolgeler[sira].m.length; window.Motor.odak(H, sira); goster(); } };
    const adimla = () => { if (!oynuyor) return; const devam = ileri(); if (devam) zam = setTimeout(adimla, madde === 0 ? 1300 : 2400); else durdur(); };
    const bitir = () => { durdur(); sira = -1; madde = 0; window.Motor.odak(H, -1); altyazi.hidden = true; kontrol.hidden = true; kart.classList.remove('sunumda'); };
    const oynat = btn('dugme', 'Sunum modu', () => { if (oynuyor) { durdur(); return; } kart.classList.add('sunumda'); kontrol.hidden = false; oynuyor = true; oynat.textContent = 'Duraklat'; if (sira >= v.bolgeler.length) { sira = -1; madde = 0; } adimla(); sunumOdak(); });
    const kontrol = h('div', 'sunum-kontrol'); kontrol.hidden = true;
    kontrol.append(btn('cip', 'Önceki', () => { durdur(); geri(); sunumOdak(); }), btn('cip', 'Sonraki', () => { durdur(); kart.classList.add('sunumda'); ileri(); sunumOdak(); }), btn('cip', 'Bitir', bitir));
    const tam = btn('dugme ikincil', 'Tam ekran', () => { const acik = kart.classList.toggle('tam'); tam.textContent = acik ? 'Küçült' : 'Tam ekran'; document.body.classList.toggle('kilit', acik); olc(); });
    arac.append(oynat, kontrol, tam, lejK);
    kart.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (kart.classList.contains('tam')) tam.click(); else bitir(); return; } if (e.target.closest('.sekme, .secim-serit, .sahne-gez')) return; if (e.key === 'ArrowRight') { durdur(); kart.classList.add('sunumda'); kontrol.hidden = false; ileri(); sunumOdak(); } if (e.key === 'ArrowLeft') { durdur(); geri(); sunumOdak(); } });
    kart.tabIndex = -1;
    a.appendChild(kart);
    // kategoriler (eski sekmeler) ve öğeleri
    const gordum = h('div', 'bolge-liste');
    const bolgeD = v.bolgeler.map((b, i) => {
      const d = h('details', 'bolge'); d.innerHTML = `<summary><span class="b-no">${i + 1}</span><span>${kac(b.ad)}</span></summary>`; d.appendChild(maddeler(b.m));
      d.addEventListener('toggle', () => {
        if (d.open) { bolgeD.forEach((x) => x !== d && (x.open = false)); durdur(); sira = i; madde = b.m.length; window.Motor.odak(H, i); ks.ayarla(0, i); odakla(kart, d); }
        else if (!bolgeD.some((x) => x.open)) { window.Motor.odak(H, -1); sira = -1; if (ks.durum()[0] === 0) ks.ayarla(0, -1); }
      });
      gordum.appendChild(d); return d;
    });
    gordum.appendChild(h('p', 'ipucu', 'Haritadaki turuncu numaralara da dokunabilirsin.'));
    const soyle = h('div', 'soyle'); soyle.appendChild(h('blockquote', 'konusma', kac(v.soyle))); soyle.appendChild(dinleBtn(v.soyle, 'tr-TR', 'Sesli dinle'));
    const okuP = h('div'); okuP.appendChild(maddeler(v.oku)); okuP.appendChild(h('p', 'ipucu', 'Lejantı aç ve bir katmanın üstüne gel: o katman öne çıkar; dokununca gizlenir.'));
    const nereden = h('div', 'nereden'); nereden.innerHTML = `<p class="site">${kac(v.nereden.site)}</p>` + (v.nereden.url ? `<p><a href="${v.nereden.url}" target="_blank" rel="noopener">${kac(v.nereden.url.replace('https://', ''))} ↗</a></p>` : ''); nereden.appendChild(maddeler(v.nereden.adim));
    const en = h('div', 'en'); en.appendChild(h('p', 'en-cumle', kac(v.en))); en.appendChild(dinleBtn(v.en, 'en-US', 'Listen'));
    const soruP = soruPanel(v.soru, (i, acik, d) => { if (acik) { ks.ayarla(4, i); odakla(kart, d); } else if (ks.durum()[0] === 4 && ![...soruP.querySelectorAll('details')].some((x) => x.open)) ks.ayarla(4, -1); });
    const soruD = [...soruP.querySelectorAll('details')];
    const dene = denePanel(v.dene);
    // [ad, içerik, öğe kutuları (details), öğe adları, gösterilen sayı, öğesiz kategoride şerit notu]
    const KAT = [
      ['Gördüklerim', gordum, bolgeD, v.bolgeler.map((b, i) => `<span class="b-no">${i + 1}</span>${kac(b.ad)}`)],
      ['Söylediğim', soyle, [], [], 0, 'Konuşma metni aşağıda'],
      ['Neden?', maddeler(v.neden), [], [], v.neden.length, `${v.neden.length} gerekçe aşağıda`],
      ['Nasıl okunur', okuP, [], [], v.oku.length, 'Okuma ipuçları aşağıda'],
      ['Soru gelirse', soruP, soruD, v.soru.map(([q]) => kac(q))],
      ['Nereden?', nereden, [], [], 0, 'Kaynak ve indirme adımları aşağıda'],
      ['İngilizce', en, [], [], 0, 'İngilizce cümle aşağıda'],
      ['Kendini dene', dene, [], [], 0, 'Soru aşağıda'],
    ];
    const sk = h('div', 'sekme'); const govde = h('div', 'sekme-govde');
    const paneller = KAT.map(([, icerik]) => { const p = h('div', 'sekme-panel'); p.setAttribute('role', 'tabpanel'); p.appendChild(icerik); govde.appendChild(p); return p; });
    const ks = window.Araclar.katSecim(KAT.map(([ad, , , adlar, n]) => ({ ad, n: n != null ? n : adlar.length, ogeler: adlar.map((x) => ({ ad: x })) })), (k, i, kd) => {
      paneller.forEach((p, j) => (p.hidden = j !== k));
      const ds = KAT[k][2];
      if (i >= 0 && ds[i]) { if (!ds[i].open) ds[i].open = true; else odakla(kart, ds[i]); } // açılınca toggle → odakla
      else if (!kd) ds.forEach((d) => (d.open = false)); // seçili öğeye yeniden basıldı: kapat
      else odakla(kart, paneller[k]);
    }, { ad: 'Kategoriler', ilk: (k) => KAT[k][2].findIndex((d) => d.open), bos: (k) => KAT[k][5] || 'Aşağıda', sinif: 'serit-harita', kapanir: true });
    ks.bar.querySelectorAll('.sekme-b').forEach((b, j) => b.setAttribute('aria-controls', paneller[j].id = `${id}-k${j}`));
    paneller.forEach((p, j) => (p.hidden = j !== 0));
    sk.append(ks.serit, govde, ks.gez); panel.appendChild(sk);
    // haritadaki numaralı işaret → «Gördüklerim»deki bölge
    H.bolgeler.forEach((b, i) => { const ac = () => { if (bolgeD[i].open && ks.durum()[0] === 0) bolgeD[i].open = false; else ks.git(0, i); }; b.el.addEventListener('click', ac); b.el.addEventListener('keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), ac())); });
    // alt yazı: geniş ekranda paneldeki düğmelerin altında (harita örtülmez), telefonda haritanın hemen altında
    seritKur(kart, gorsel);
    const yerlestir = () => { if (YAN.matches) arac.insertBefore(altyazi, lejK); else gorsel.appendChild(altyazi); };
    yerlestir(); YAN.addEventListener('change', yerlestir);
    const alt = h('div', 'adim-alt'); alt.innerHTML = `<p class="oz"><b>ÖZ</b>${kac(v.oz)}</p>`; alt.appendChild(bittiDugme(id)); a.appendChild(alt);
    return a;
  }

  // ───────── araç adımı (SYNOP, Skew-T, meteogram): sahne = görsel; panel = gezinti + aracın kendi seçim listesi
  function aracAdim(id) {
    const v = V.ARAC[id], rol = V.ROL[v.rol];
    const a = h('article', 'adim adim-arac'); a.id = id; a.style.setProperty('--rol', rol.renk);
    a.innerHTML = `<header class="adim-bas"><p class="adim-etiket"><span class="rol-nokta"></span>${rol.ad} · ${rol.is} · ${v.sure}</p><h3>${kac(v.baslik)}</h3><p class="adim-kisa">${kac(v.kisa)}</p></header>`;
    const kart = h('figure', `arac-kart sahne sahne-arac sahne-${id}`); kart.innerHTML = `<figcaption class="harita-ust"><b>${kac(v.ad)}</b><span>${kac(v.tur)} · ${kac(v.gecerli)}</span><span class="harita-kaynak">Kaynak: ${kac(v.kaynak)}</span></figcaption>`;
    const gorsel = h('div', 'sahne-gorsel'), panel = h('div', 'sahne-panel'); kart.append(gorsel, panel);
    panel.appendChild(gezinti(id));
    const ic = h('div', 'arac-ic arac-' + id); panel.appendChild(ic); a.appendChild(kart);
    window.Araclar[id](ic, gorsel);
    const vb = gorsel.querySelector('svg').viewBox.baseVal; kart.style.setProperty('--ar', (vb.width / vb.height).toFixed(4));
    seritKur(kart, gorsel);
    // bir düğmeye basınca görsel ve açıklaması aynı ekranda kalsın
    const aciklama = { synop: '.syn-tablo', skewt: '.skt-aciklama' }[id];
    kart.addEventListener('click', (e) => { const b = e.target.closest('button, [role=button]'); if (b && !b.closest('.sahne-gez')) odakla(kart, aciklama ? kart.querySelector(aciklama) : b.closest('.mg-kart')); });
    const soyle = h('div', 'soyle'); soyle.appendChild(h('blockquote', 'konusma', kac(v.soyle))); soyle.appendChild(dinleBtn(v.soyle, 'tr-TR', 'Sesli dinle'));
    const en = h('div', 'en'); en.appendChild(h('p', 'en-cumle', kac(v.en))); en.appendChild(dinleBtn(v.en, 'en-US', 'Listen'));
    a.appendChild(sekmeler([['Söylediğim', soyle], ['Neden?', maddeler(v.neden), v.neden.length], ['Soru gelirse', soruPanel(v.soru), v.soru.length], ['İngilizce', en]]));
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
    // saat aracı da bir sahne: zaman çizelgesi (değişen kısım) + girdiler ve sonuç (panel)
    const saatK = h('figure', 'arac-kart sahne sahne-arac sahne-saat'); saatK.innerHTML = '<figcaption class="harita-ust"><b>Saat hesaplayıcı</b><span>Analiz anı → sunum günü · UTC ↔ TSİ</span></figcaption>';
    const saatG = h('div', 'sahne-gorsel'), saatP = h('div', 'sahne-panel'), saatI = h('div', 'arac-ic arac-saat saat'); saatP.appendChild(saatI); saatK.append(saatG, saatP);
    window.Araclar.saat(saatI, saatG); { const vb = saatG.querySelector('svg').viewBox.baseVal; saatK.style.setProperty('--ar', (vb.width / vb.height).toFixed(4)); }
    saatK.querySelectorAll('input[type=date], input[type=time]').forEach((i) => i.addEventListener('change', () => odakla(saatK, saatK.querySelector('.saat-sonuc'))));
    saatK.querySelector('.saat-kay').addEventListener('change', () => odakla(saatK, saatK.querySelector('.saat-cevir-t')));
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
    olc(); addEventListener('resize', olc, { passive: true }); if (document.fonts) document.fonts.ready.then(olc);
    $('#alt').innerHTML = `<div class="alt-ic"><p><b>Sinoptik Brifing Atölyesi</b> · Atmosfer Akademisi · MTO 302E.</p><p>Haritalar gerçek analiz ve tahminlerin sadeleştirilmiş çizimleridir; sayılar örnek brifingde okunan değerlerdir. Kıyı ve sınır çizgileri: Natural Earth (kamu malı). Sondaj: University of Wyoming. SYNOP: Ogimet. Model haritaları: ECMWF Open Charts (CC BY 4.0), GFS (wetter3), DWD analizi. Yazı tipi: Inter (SIL OFL).</p><p><a href="../">Atmosfer Akademisi</a> · <a href="../harita-okulu/">Harita Okulu</a> · <a href="../hava-analizi-proje-rehberi/">Proje Rehberi</a></p></div>`;
    // çapa: sahnesi olan adımda sahnenin üstü çubuğun hemen altına gelir; diğerlerinde başlık
    const hedef = () => { try { return document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (e) { return null; } };
    if (location.hash) { const t = hedef(); if (t) { const git = () => sahneyeGit(t.id, true) || t.scrollIntoView(); setTimeout(git, 60); if (document.fonts) document.fonts.ready.then(() => setTimeout(git, 30)); } }
    addEventListener('hashchange', () => { const t = hedef(); if (t) { sahneyeGit(t.id); parla(t); } });
    document.addEventListener('click', (e) => {
      const l = e.target.closest('a[href^="#"]'); if (!l || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      let t = null; try { t = document.getElementById(decodeURIComponent(l.getAttribute('href').slice(1))); } catch (x) { /* bozuk çapa */ }
      if (!t || !t.querySelector('.sahne')) return;
      e.preventDefault(); history.pushState(null, '', '#' + t.id); sahneyeGit(t.id); parla(t);
    });
    // sahne ekranın ortasındayken yan İçindekiler çekilir; üst çubuktaki «İçindekiler» onu çekmece olarak açar
    const gorunen = new Set();
    const io = new IntersectionObserver((es) => {
      es.forEach((x) => (x.isIntersecting ? gorunen.add(x.target) : gorunen.delete(x.target)));
      const m = gorunen.size > 0; if (m !== document.body.classList.contains('sahne-modu')) { document.body.classList.toggle('sahne-modu', m); if (innerWidth >= 1100) document.body.classList.remove('toc-acik'); }
    }, { rootMargin: '-30% 0px -30% 0px' });
    document.querySelectorAll('.sahne').forEach((x) => io.observe(x));
    document.addEventListener('click', (e) => { if (document.body.classList.contains('toc-acik') && !e.target.closest('#toc, .ust-toc')) document.body.classList.remove('toc-acik'); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') document.body.classList.remove('toc-acik'); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kur); else kur();
})();
