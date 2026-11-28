/* Ders Kitaplığı — kitaplık, PDF ile eş zamanlı soru görünümü, konu çekmecesi.
   Adres biçimi (hepsi paylaşılabilir, tarayıcının Geri tuşu çalışır):
     #                         kitaplık
     #mto342e                  kitabın son bakılan sorusu
     #mto342e/S3               soru
     #mto342e/bol/K1-THETA-TV  bölümün konu sayfaları
     #mto342e/S3/k/theta/ispat soru açıkken konu çekmecesi (kavram · parça)
     #mto342e/S3/k/_atlas      çekmecede kitabın atlası (· /k/_bol/<id> bölüm · /k/_sozluk[/<en>[~<en2>]] sözlük)
     DK323 (kimya / hesap verisi olan kitapta): /k/_tur[/<id>] · /k/_tepkime[/<id>] · /k/_dongu[/<id>] · /k/_hesap[/<araç>[/<hazır>]]
                               · kavram parçaları /k/<kavram>/kimya · /k/<kavram>/hesap[/<araç>]  */
(function () {
  const $ = (s, k = document) => k.querySelector(s);
  const GOMULU = (() => { try { return new URLSearchParams(location.search).has('gomulu'); } catch (e) { return false; } })(); // ETK4 BALON: gömülü kip
  if (GOMULU) document.documentElement.classList.add('dk-gomulu');
  const $$ = (s, k = document) => [...k.querySelectorAll(s)];
  const kac = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const PARCA = [['tanim', 'Tanım'], ['diyagram', 'Diyagram'], ['formul', 'Formül · terimler'], ['ispat', 'Türetim'], ['anim', 'Animasyon'], ['kod', 'Kod']];
  const PAD = Object.fromEntries(PARCA);
  const sakla = (a, v) => { try { localStorage.setItem(a, v); } catch (e) { /* depolama kapalı */ } };
  const oku = (a) => { try { return localStorage.getItem(a); } catch (e) { return null; } };
  const ana = $('#ana');
  let animTutucu = null;

  /* ---------- tema ---------- */
  const temaBtn = $('#tema');
  const temaYaz = () => { temaBtn.textContent = document.documentElement.dataset.theme === 'dark' ? 'Açık' : 'Koyu'; };
  temaBtn.addEventListener('click', () => {
    const koyu = document.documentElement.dataset.theme !== 'dark';
    if (koyu) document.documentElement.dataset.theme = 'dark'; else delete document.documentElement.dataset.theme;
    sakla('dk:tema', koyu ? 'koyu' : 'acik'); temaYaz();
  });
  temaYaz();

  /* ---------- veri yükleme ---------- */
  const bekleyen = {};
  function yukle(kid) {
    if (window.DK && window.DK[kid]) return Promise.resolve(window.DK[kid]);
    if (bekleyen[kid]) return bekleyen[kid];
    bekleyen[kid] = new Promise((ok, red) => {
      const s = document.createElement('script'); s.src = `veri/${kid}.js`;
      s.onload = () => (window.DK && window.DK[kid] ? ok(window.DK[kid]) : red(new Error('veri yok')));
      s.onerror = () => red(new Error('veri yüklenemedi'));
      document.head.append(s);
    });
    return bekleyen[kid];
  }
  /* telefonda şekil ekrana sığınca yazılar küçülür: «büyüt» şekli okunur genişliğe çıkarır, yana ötelenerek gezilir (tercih hatırlanır) */
  function buyutDugmesi() {
    const kap = $('#ck-sekil');
    if (!kap || !kap.querySelector('svg') || !matchMedia('(max-width:760px)').matches) return;
    let acik = false;
    try { acik = localStorage.getItem('dk:buyut') === '1'; } catch (e) { /* depolama kapalı */ }
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'kucuk buyut';
    const uygula = () => { kap.classList.toggle('buyuk', acik); b.textContent = acik ? '⤡ Ekrana sığdır' : '⤢ Şekli büyüt (yazılar okunur)'; b.setAttribute('aria-pressed', String(acik)); };
    b.addEventListener('click', () => { acik = !acik; try { localStorage.setItem('dk:buyut', acik ? '1' : '0'); } catch (e) { /* depolama kapalı */ } uygula(); });
    kap.before(b); uygula();
  }
  const texDoldur = (kok, K) => $$('[data-tex]', kok).forEach((e) => { const v = K.svg[+e.dataset.tex]; e.innerHTML = (typeof v === 'number' ? K.svg[v] : v) || ''; });
  // ETK3 MOBIL: geniş formül telefonda kutunun içinde yana gezilmesin — her MathJax SVG'sine doğal genişliği --w yazılır; CSS kutuya sığacak kadar
  // (en az %72, satır içinde %82) küçültür, daha genişi kutuda yana gezilir. Bütün eklemeler (sayfa, çekmece, kart, mercek, arama) tek gözcüyle.
  const mjGen = (kok) => { if (!kok || !kok.querySelectorAll) return; const L = kok.matches && kok.matches('svg.mj') ? [kok] : kok.querySelectorAll('svg.mj:not([data-w])'); for (const s of L) { const w = s.getAttribute('width'); if (w && /^[\d.]+ex$/.test(w) && !s.hasAttribute('data-w')) { s.style.setProperty('--w', w); s.setAttribute('data-w', ''); } } };
  new MutationObserver((M) => { for (const m of M) for (const n of m.addedNodes) if (n.nodeType === 1) mjGen(n); }).observe(document.body, { childList: true, subtree: true });
  const kavramBul = (K, id) => (K.kavramlar || []).find((k) => k.id === id);

  /* ---------- kitaplık ---------- */
  function kitaplik() {
    document.title = 'Ders Kitaplığı · Atmosfer Akademisi';
    ana.dataset.sayfa = '';
    const kat = window.DK_KATALOG || [];
    ana.innerHTML = `<p class="kod" style="color:var(--acc);font-weight:700;letter-spacing:.06em;font-size:14px;margin:0">BU DÖNEMİN METEOROLOJİ DERSLERİ</p>
      <h1>Ders Kitaplığı</h1>
      <p class="alt">reMarkable'daki soru-çözüm kitaplarının çevrimiçi eşi. PDF'te hangi sayfadaysan buraya o sayfayı yaz: aynı soru açılır. Her çözüm adımının altındaki düğmelerle o adımdaki kavramın <b>tanımına, diyagramına, formülündeki terimlere, türetimine, animasyonuna ve koduna</b> tek tıkla geçersin; «← Soruya dön» seni hep geri getirir.</p>
      <div class="kitaplar">${kat.map((k) => `<article class="kitap"><span class="kod">${kac(k.kod)} · ${kac(k.sinav)}</span><h2>${kac(k.ad)}</h2>
        <span class="sayi">${k.soru} soru · PDF ${k.pdf_sayfa} sayfa · ${k.kavram ? `${k.kavram} kavram` : 'kavram atlası hazırlanıyor'}</span>
        <div class="dugmeler"><a class="dugme" href="#${k.id}">Eş zamanlı takip</a>${k.pusula ? `<a class="dugme ikincil pu-dugme" href="#${k.id}/k/_pusula">${kac(k.pusula)}</a>` : ''}<a class="dugme ikincil" href="${kac(k.pdf)}" target="_blank" rel="noopener">PDF'i aç ↗</a>${k.id === 'mto302e' ? '<a class="dugme ikincil" href="../sinoptik-brifing/#soru-cozum">Katmanlı haritalar ↗</a>' : ''}</div></article>`).join('')}
        ${kat.some((k) => k.id === 'mto302e') ? '' : `<article class="kitap"><span class="kod">MTO302E · HARİTA ANALİZİ</span><h2>Sinoptik soru çözümleri</h2><span class="sayi">9 soru · adım adım katmanlı çözüm, kendi haritalarımızla</span>
        <div class="dugmeler"><a class="dugme" href="../sinoptik-brifing/#soru-cozum">Etkileşimli çözüm</a><a class="dugme ikincil" href="pdf/MTO302E_SORU-COZUM.pdf" target="_blank" rel="noopener">PDF'i aç ↗</a></div></article>`}
      </div>
      <section class="nasil"><h2>Nasıl kullanılır?</h2><ol>
        <li><b>PDF ile yan yana:</b> kitabı reMarkable'da aç, burada aynı kitabın «Eş zamanlı takip»ine gir. Üstteki kutuya PDF sayfa numarasını (ör. <b>37</b>) ya da soru numarasını (<b>S12</b>) yaz.</li>
        <li><b>Önce kendin çöz:</b> çözüm kapalı gelir; «1. adımı aç» ile tek tek aç, takıldığın adımda dur.</li>
        <li><b>Takıldığın kavrama git:</b> adımın altındaki mavi şeritte «Tanım · Diyagram · Formül · Türetim · Animasyon · Kod» düğmeleri var. Sayfa değişmez: geniş ekranda yanda, telefonda alttan konu paneli açılır; panelin tutamağını sürükleyerek boyunu ayarlarsın, soru üstte görünür kalır.</li>
        <li><b>Ara:</b> üstteki büyüteç ya da <b>/</b> tuşu. Kavram, terim (Türkçe ya da İngilizce), formül, sembol (ΔS, CN), birim (mm/h, hPa) yaz; ekleri ve küçük yazım hatalarını da tanır, eşleşen yeri vurgular.</li>
        <li><b>İşaretler:</b> çözüm adımlarında ve açıklamalarda küçük simgeli etiketler puanın geldiği yeri gösterir: <b>Kesin bil</b> (yıldız), <b>Tuzak</b>, <b>Ezberle</b>, <b>Sınavda yaz</b>, <b>Denetle</b>, <b>Kısa yol</b>; sınav pusulası açıkken <b>Sık çıkar</b>. «Yalnız kesin bil» düğmesi adım oynatıcıda yalnız kesin adımları öne çıkarır; yan paneldeki «Kesin bil» sekmesi bölüm bölüm hızlı tekrar listesidir.</li><li><b>Kaybolma:</b> panelin üstünde nerede olduğun yazar; «← Soruya dön» seni soruya, ‹ › bir önceki/sonraki konuya götürür. Adres çubuğundaki bağlantı tam o noktayı gösterir.</li></ol></section>`;
  }

  /* ---------- kitap görünümü ---------- */
  function soruSirasi(K) { return Object.values(K.sorular).sort((a, b) => a.no - b.no); }
  let icAcik = (() => { if (location.hash.length > 1) return false; try { return localStorage.getItem('dk:ic') === '1'; } catch (e) { return false; } })();
  const blAcik = (() => { try { return new Set(JSON.parse(localStorage.getItem('dk:bl') || '[]')); } catch (e) { return new Set(); } })();
  document.addEventListener('toggle', (e) => {
    const d = e.target; if (!d.matches || !d.closest('.dizin')) return;
    if (d.classList.contains('ic')) { if (!document.documentElement.classList.contains('tam')) { icAcik = d.open; sakla('dk:ic', d.open ? '1' : '0'); } }
    else if (d.dataset.bl) { if (d.open) blAcik.add(d.dataset.bl); else blAcik.delete(d.dataset.bl); sakla('dk:bl', JSON.stringify([...blAcik])); }
    if (window.__hudGoster) window.__hudGoster();
  }, true);
  function dizinHTML(K, simdi) {
    const tam = document.documentElement.classList.contains('tam');
    const say = Object.keys(K.sorular).length;
    const bl = (anah, ad, adet, ic, simdiBurada) => `<details class="bl" data-bl="${kac(anah)}" ${simdiBurada || blAcik.has(anah) ? 'open' : ''}><summary>${ad}${adet ? ` <span class="say">${adet}</span>` : ''}</summary><div class="bl-ic">${ic}</div></details>`;
    return `${puVar(K) ? `<a class="pu-serit" href="#${K.id}/${simdi ? simdi + '/' : ''}k/_pusula"><span>${PUSULA_SVG}<b>${kac(K.pusula.ad)}</b><span>${kac(K.pusula.alt)}</span></span><span class="pdf" aria-hidden="true">›</span></a>` : ''}<details class="ic" ${icAcik && !tam ? 'open' : ''}><summary>İçindekiler <span class="say">(${say})</span></summary><div class="dizin-ic"><a href="#${K.id}/akis" class="ak-gir${simdi === 'akis' ? ' simdi' : ''}"><span>Kitap akışı · yalnız başlıklar</span><span class="pdf">›</span></a><a href="#${K.id}/kavram" class="ka-gir${simdi === 'kavram' ? ' simdi' : ''}"><span>Konu atlası · konular, kavramlar, sorular</span><span class="pdf">›</span></a>${K.bolumler.map((b) => {
      const sorular = b.ogeler.filter((o) => o.tur === 'soru').map((o) => K.sorular[o.id]).filter(Boolean);
      const konu = b.ogeler.some((o) => o.tur !== 'soru');
      const burada = simdi === 'bol/' + b.id || sorular.some((q) => q.id === simdi);
      return bl(K.id + '/' + b.id, kac(bolumAd(K, b)), sorular.length, `${konu ? `<a href="#${K.id}/bol/${b.id}" class="${simdi === 'bol/' + b.id ? 'simdi' : ''}">Konu özeti ve formüller<span class="pdf"></span></a>` : ''}${sorular.map((q) => `<a href="#${K.id}/${q.id}" class="${simdi === q.id ? 'simdi' : ''}" ${simdi === q.id ? 'aria-current="page"' : ''}><span>${q.id} · ${kac(q.baslik)}</span><span class="pdf">s. ${q.pdf_soru ?? '—'}</span></a>`).join('')}`, burada);
    }).join('')}${(K.kavramlar || []).length ? bl(K.id + '/kavram', 'Kavram atlası', K.kavramlar.length, `<a href="#${K.id}/${simdi ? simdi + '/' : ''}k/_atlas" class="atlas-ac"><span>Atlası ve sözlüğü yan çekmecede aç</span><span class="pdf">›</span></a>` + K.kavramlar.map((k) => `<a href="#${K.id}/${simdi ? simdi + '/' : ''}k/${k.id}/tanim"><span>${kac(k.sembol)} · ${kac(k.ad)}</span><span class="pdf">${k.sorular.length} soru</span></a>`).join(''), false) : ''}</div></details>`;
  }
  function takipHTML(K, q) {
    const sira = soruSirasi(K), i = q ? sira.indexOf(q) : -1;
    return `<div class="takip"><label for="git">PDF sayfası ya da soru</label><input id="git" inputmode="text" placeholder="37 ya da S12" autocomplete="off">
      <span class="bilgi" id="git-bilgi">${q ? `<span class="tk-uzun">PDF'te: </span>soru s. <b>${q.pdf_soru ?? '—'}</b> · çözüm s. <b>${q.pdf_cozum ?? '—'}</b>` : `${kac(K.kod)} · ${K.pdf_sayfa} sayfa`}</span>
      <span class="sag"><span class="sn-yer"></span>${i > 0 ? `<a class="kucuk tk-once" href="#${K.id}/${sira[i - 1].id}">‹ ${sira[i - 1].id}</a>` : ''}${i >= 0 && i < sira.length - 1 ? `<a class="kucuk tk-sonra" href="#${K.id}/${sira[i + 1].id}">${sira[i + 1].id} ›</a>` : ''}<span class="tk-dah"><button type="button" class="kucuk tk-dah-dug" aria-expanded="false" aria-controls="tk-dah-ic" aria-label="Öbür düğmeler" title="Öbür düğmeler">${IK('<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>')}</button><span class="tk-dah-ic" id="tk-dah-ic"><span class="sn-yer sn-yer2"></span><button type="button" class="kucuk atlas-dugme" data-git="#${kac(decodeURIComponent(location.hash.slice(1)).split('/k/')[0] || K.id)}/k/_atlas" title="Kavram atlası ve sözlük (yan çekmecede)">Atlas</button><a class="kucuk tk-pdf" href="${kac(K.pdf)}" target="_blank" rel="noopener">PDF ↗</a><button type="button" class="kucuk tam-ac" title="Tam ekran (F)">Tam ekran</button></span></span></span></div>`;
  }
  /* ---------- ETK-UI-2 (26 Kas): takip çubuğu — telefonda tek satır («⋯» açılır liste) + yapışkan çubuk payı ----------
     Telefonda (≤ 600 px) çubukta ‹ önceki · sonraki › · pusula · «⋯»; Sınava çalış, Strateji, Atlas, PDF, Tam ekran
     alt alta açılan listede. Masada liste görünmez (display:contents), düğmeler eski sırasıyla tek satırda.
     Yapışkan üst çubuk + takip çubuğu yüksekliği --takip-h → html scroll-padding-top: bütün atlama hedefleri
     (soru, adım, derin bağ, j / k, akış kartı) çubuğun altında kalmaz. */
  const tkDahKapat = (kok = document) => { $$('.tk-dah.acik', kok).forEach((d) => { d.classList.remove('acik'); $('.tk-dah-dug', d)?.setAttribute('aria-expanded', 'false'); }); };
  document.addEventListener('click', (e) => {
    const dug = e.target.closest('.tk-dah-dug');
    if (dug) { const d = dug.closest('.tk-dah'), ac = !d.classList.contains('acik'); tkDahKapat(); d.classList.toggle('acik', ac); dug.setAttribute('aria-expanded', String(ac)); if (ac) $('.tk-dah-ic button, .tk-dah-ic a', d)?.focus({ preventScroll: true }); return; }
    if (!e.target.closest('.tk-dah-ic') || e.target.closest('button, a')) tkDahKapat();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const d = $('.tk-dah.acik'); if (!d) return;
    e.preventDefault(); e.stopImmediatePropagation(); tkDahKapat(); $('.tk-dah-dug', d)?.focus({ preventScroll: true });
  }, true);
  let takipRO = null;
  // ETK3 MOBIL: masada / tablette (çekmece yanda açıkken) takip çubuğu iki satıra taşıyorsa düğmeler «⋯» listesine toplanır (.takip.tk-dar)
  let tkGen = -1;
  function takipSigdir(t) {
    const W = Math.round(t.clientWidth); if (W === tkGen) return; tkGen = W;
    t.classList.remove('tk-dar'); if (innerWidth <= 600) return;
    const T = [...t.querySelectorAll('input, a, button, .bilgi')].filter((e) => e.getClientRects().length && !e.closest('.tk-dah-ic')).map((e) => { const r = e.getBoundingClientRect(); return r.top + r.height / 2; }).sort((a, b) => a - b);
    if (T.some((y, i) => i && y - T[i - 1] > 18)) { t.classList.add('tk-dar'); tkDahKapat(t); }
  }
  function takipOlc() {
    const t0 = $('.takip', ana); if (t0 && t0.getClientRects().length) takipSigdir(t0);
    const t = $('.takip', ana), st = t && t.getClientRects().length ? getComputedStyle(t) : null;
    document.documentElement.style.setProperty('--takip-h', `${st && st.position === 'sticky' ? Math.ceil(t.getBoundingClientRect().height) : 0}px`);
  }
  function takipIzle() {
    tkGen = -1;
    if (takipRO) takipRO.disconnect();
    const t = $('.takip', ana);
    if (t && typeof ResizeObserver !== 'undefined') { takipRO = new ResizeObserver(takipOlc); takipRO.observe(t); }
    takipOlc();
  }
  // yapışkan bölgenin alt kenarı (ekran koordinatı): bu çizginin üstündeki her şey çubukların altında kalır
  const yapisAlt = () => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  // derin bağ hedefi: oynatıcıda başlık («Çözüm · PDF s. · n adım») + şimdiki adım aynı ekrana sığıyorsa başlıktan,
  // sığmıyorsa şimdiki adımdan başlar; ikisi de yapışkan çubuğun altında (scroll-padding-top)
  function hedefeOtele(hedef, bas) {
    sabitBirak();
    let el = hedef;
    if (bas) { const s = $('.oyn-a.simdi', hedef) || hedef; el = s.getBoundingClientRect().bottom - bas.getBoundingClientRect().top <= innerHeight - yapisAlt() - altPay() - 12 ? bas : s; }
    el.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  function bagHTML(K, idler, qid, mk) {
    const benzersiz = [...new Set(idler || [])].map((id) => kavramBul(K, id)).filter(Boolean);
    if (!benzersiz.length) return '';
    return `<div class="baglar">${benzersiz.map((k) => `<div class="bag"><b>${kac(k.sembol)} · ${kac(k.ad)}</b>${mk ? mkGrupHTML(K, `kavram:${k.id}`, true) : ''}${PARCA.filter(([p]) => k.parcalar && k.parcalar[p]).map(([p, ad]) => `<button type="button" data-git="#${K.id}/${qid}/k/${k.id}/${p}">${ad}</button>`).join('')}</div>`).join('')}</div>`;
  }
  function yolHTML(K, q) {
    const R = q.rehber;
    return `<section class="yol" id="yol" aria-labelledby="yol-h"><h2 id="yol-h">Yol haritası ${q.pdf_yol ? `<small class="yok">PDF s. ${q.pdf_yol}</small>` : ''}</h2>
      <p><b>Ne istiyor?</b> ${R.istiyor}</p><p><b>Soru tipi:</b> ${kac(R.tip)}</p>
      ${R.kalip.length ? `<p class="yol-alt">Soruda bu ifadeyi görünce:</p><ul class="kalip">${R.kalip.map((k) => `<li><span class="en-k" lang="en">${kac(k.en)}</span> → ${kac(k.tr)}${k.ipucu ? ` · ${isr('kisa', { kucuk: true })}<b>${kac(k.ipucu)}</b>` : ''}</li>`).join('')}</ul>` : ''}
      ${(R.eslesme || []).length ? `<details class="esles"><summary>Sorudan formüle: hangi ifadeden ne anladık?</summary><p class="yol-alt">Soru metnindeki altı çizili ifadelere dokun (bilgisayarda imleci üstüne getir): ne anlaşıldığı ve formülde nereye girdiği açılır.</p><div class="tablo-kap"><table class="esles-t"><thead><tr><th>Sorudaki ifade</th><th>Ne anladık?</th><th>Formülde</th></tr></thead><tbody>${R.eslesme.map((e) => `<tr><td><span class="es-k">${kac(e.ifade)}</span></td><td>${kac(e.anlam)}</td><td><b>${kac(e.sembol)}</b>${e.deger ? ` = ${kac(e.deger)}` : ''}</td></tr>`).join('')}</tbody></table></div></details>` : ''}
      <details><summary>Verilenler ne demek?</summary><ul>${R.veriler.map((v) => `<li><b>${kac(v.ne)}</b> → ${kac(v.anlam)}</li>`).join('')}</ul></details>
      ${R.formul.length ? `<details><summary>Hangi formül, neden?</summary>${R.formul.map((f) => `<p><b>${kac(f.ad)}</b> — ${f.neden}</p>${f.tex}${f.terimler.length ? `<ul class="terim">${f.terimler.map((t) => `<li><b>${kac(t[0])}</b>: ${kac(t[1])}</li>`).join('')}</ul>` : ''}${bagHTML(K, f.kavram ? [f.kavram] : [], q.id)}`).join('')}</details>` : ''}
      ${R.kural ? `<p><b>Kullanılacak bilgi:</b> ${R.kural}</p>` : ''}
      <p class="plan"><b>Plan:</b> ${R.adimlar.map((a, i) => `<a href="#${K.id}/${q.id}/a${i + 1}">${i + 1} · ${kac(a.kisa)}</a>`).join(' → ')}</p>
      ${R.tuzak ? `<p class="tuzak isr-blok isr-tz">${isr('tuzak')}${R.tuzak}</p>` : ''}
      ${(R.oz || []).length ? `<div class="oz-cozum isr-y" id="oz"><h3>${isr('yaz')}Sınav kâğıdına yaz — en kısa çözüm</h3><ol>${R.oz.map((x) => `<li>${x}</li>`).join('')}</ol></div>` : ''}</section>`;
  }
  function rehberAdim(K, q, a, i) {
    return `<li data-i="${i}" id="a${i + 1}" hidden><p class="adim-bas"><b>${i + 1} · ${kac(a.kisa)}</b></p>
      <p><b>Ne yapıyoruz?</b> ${a.ne}</p>${a.nasil ? `<p class="nasil">${a.nasil}</p>` : ''}${a.sonuc ? `<p class="sonuc">→ <b>${a.sonuc}</b></p>` : ''}
      ${a.neden ? `<details class="neden"><summary>Neden böyle?</summary><p>${a.neden}</p></details>` : ''}${bagHTML(K, a.kavram ? [a.kavram] : [], q.id)}</li>`;
  }
  function esleIsaretle(kok, liste) {
    if (!kok) return;
    for (const e of liste) {
      const ifade = (e.ifade || '').trim(); if (!ifade) continue;
      const tip = `${e.anlam} → ${e.sembol}${e.deger ? ' = ' + e.deger : ''}`;
      const w = document.createTreeWalker(kok, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement.closest('svg,.katex,.en-ip,button') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
      let d; while ((d = w.nextNode())) {
        let i = d.nodeValue.indexOf(ifade); if (i < 0) i = d.nodeValue.toLocaleLowerCase('tr').indexOf(ifade.toLocaleLowerCase('tr')); if (i + ifade.length > d.nodeValue.length) i = -1;
        if (i < 0) continue;
        const orta = d.splitText(i); orta.splitText(ifade.length);
        const s = document.createElement('span'); s.className = 'en-ip es-ip'; s.tabIndex = 0; s.dataset.tr = tip; s.textContent = orta.nodeValue;
        orta.replaceWith(s); break;
      }
    }
  }
  let ipRx = null, ipKitap = '';
  function ipucuEkle(kok, K) {
    const sz = K.sozluk || [];
    if (!sz.length) return;
    if (ipKitap !== K.id) {
      ipKitap = K.id;
      const tr = new Map(sz.map((x) => [x.en.toLowerCase(), x.tr]));
      const kel = [...tr.keys()].sort((a, b) => b.length - a.length).map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      ipRx = { rx: new RegExp(`(?<![\\p{L}\\p{N}])(${kel.join('|')})(?![\\p{L}\\p{N}])`, 'giu'), tr };
    }
    const w = document.createTreeWalker(kok, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement.closest('svg,button,code,pre,.en-ip,summary,.dizin,.takip,a,.es,.kr,.dil-terim,.ip-kart,.sz-kart,.kendin,.hs,.dg,.tk-bas,.tk-denk,.soru-ek,.ag-lejant') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    const dugumler = []; while (w.nextNode()) dugumler.push(w.currentNode);
    for (const d of dugumler) {
      const t = d.nodeValue; ipRx.rx.lastIndex = 0;
      if (!ipRx.rx.test(t)) continue;
      const span = document.createElement('span');
      span.innerHTML = kac(t).replace(ipRx.rx, (m) => `<span class="en-ip" tabindex="0" lang="en" data-en="${kac(m.toLowerCase())}" data-tr="${kac(ipRx.tr.get(m.toLowerCase()) || '')}">${m}</span>`);
      d.replaceWith(...span.childNodes);
    }
  }
  document.addEventListener('click', (e) => {
    const t = e.target.closest('.en-ip');
    $$('.en-ip.acik').forEach((x) => { if (x !== t) x.classList.remove('acik'); });
    if (ipAcik() && !ipKart.contains(e.target) && t !== ipHedef) ipKapat();
    if (!t) return;
    if (t.dataset.en && !t.classList.contains('es-ip') && simdiK) { if (ipHedef === t) ipKapat(); else ipAc(t, simdiK); return; }
    t.classList.toggle('acik');
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key !== 'Enter' && e.key !== ' ') || !e.target.classList) return;
    const t = e.target;
    if (t.classList.contains('en-ip') && t.dataset.en && !t.classList.contains('es-ip') && simdiK) { e.preventDefault(); if (ipHedef === t) ipKapat(); else ipAc(t, simdiK); }
    else if (t.classList.contains('es') && t.closest('.cift')) { e.preventDefault(); esYak(t, true, !t.classList.contains('kilit')); }
  });
  const acikAdim = {};
  function soruGoster(K, q) {
    document.title = `${q.id} · ${q.baslik} · ${K.kod}`;
    sakla(`dk:son:${K.id}`, q.id);
    delete ana.dataset.cozkip;
    const R = q.rehber, n = R ? R.adimlar.length : (q.adimlar || []).length;
    ana.innerHTML = `<div class="kitap-yer"><nav class="dizin" aria-label="Bölümler ve sorular">${dizinHTML(K, q.id)}</nav><div>
      ${takipHTML(K, q)}
      <article class="soru-kart" aria-labelledby="soru-h"><div class="soru-ust"><span class="no">${kac(K.kod)} · ${q.id}</span><span class="pdf-etiket">PDF s. ${q.pdf_soru ?? '—'}</span></div>
      <h1 id="soru-h">${kac(q.baslik)}</h1>
      <div class="mk-soru">${mkGrupHTML(K, `soru:${q.id}`, true)}</div>
      <div class="soru-govde">${q.soru || ''}</div>
      ${q.ipucu ? `<details class="ipucu"><summary>${isr('kisa')}<span>İpucu</span></summary>${q.ipucu}</details>` : ''}
      ${R ? yolHTML(K, q) : ''}
      <h2 class="coz-h" id="coz-h" style="margin-top:22px">Çözüm <small class="yok" style="font-size:15px;font-weight:500">PDF s. ${q.pdf_cozum ?? '—'} · <span class="coz-say" data-kitap="${n}">${n} adım</span></small></h2>
      ${cozKipHTML(K, q)}${kesinSay(K) ? isrLejantHTML(K, 'soru') : ''}${oynHTML(K, q)}
      ${q.giris ? `<div id="cozum-giris" hidden>${q.giris}</div>` : ''}
      <ol class="adimlar${R ? ' rehberli' : ''}" id="adimlar">${R ? R.adimlar.map((a, i) => rehberAdim(K, q, a, i)).join('') : (q.adimlar || []).map((a, i) => `<li data-i="${i}" hidden>${a.html}${bagHTML(K, a.kavram, q.id)}</li>`).join('')}</ol>
      <div class="cozum-bas"><button type="button" class="dugme" id="adim-ac">1. adımı aç</button><button type="button" class="dugme ikincil" id="hepsi">Hepsini aç</button><button type="button" class="kucuk" id="kapat" hidden>Çözümü kapat</button></div>
      ${syHTML(K, q)}
      <div id="cozum-son" hidden>${R ? `<details class="pdf-metin"><summary>PDF'teki çözüm metni (aynı sayılar)</summary>${q.giris || ''}${(q.adimlar || []).map((a) => a.html).join('')}</details>` : ''}${q.oz ? ozHTML(q.oz) : ''}
      ${q.kod ? `<details class="kod-kutu"><summary>Bu sonucu hesaplayan Python kodu</summary><pre class="kod">${kac(q.kod).split('\n').map((s, i) => `<span class="sat"><span class="no">${i + 1}</span>${s}</span>`).join('')}</pre></details>` : ''}
      ${(q.kavram || []).length ? `<h3>Bu sorudaki kavramlar</h3>${bagHTML(K, q.kavram, q.id, true)}` : `<p class="yok">Bu sorunun kavram bağları hazırlanıyor; kitabın bölüm özetine <a href="#${K.id}/bol/${q.bolum}">buradan</a> bakabilirsin.</p>`}</div>
      </article></div></div>`;
    ana.dataset.sayfa = `soru:${q.id}`;
    texDoldur(ana, K);
    glifDuzelt(ana); isrSusle(ana);
    dilSoruEkle(K, q);
    soruEkEkle(K, q);
    if (R && (R.eslesme || []).length) esleIsaretle($('.soru-govde', ana), R.eslesme);
    ipucuEkle(ana.querySelector('.soru-kart'), K);
    $$('table', ana).forEach((t) => { if (!t.parentElement.classList.contains('tablo-kap')) { const k = document.createElement('div'); k.className = 'tablo-kap'; t.before(k); k.append(t); } });
    const lis = $$('#adimlar > li'), btn = $('#adim-ac');
    const goster = (m, yeni) => {
      lis.forEach((li, i) => { const ac = i < m; if (ac && li.hidden && yeni) li.classList.add('yeni'); li.hidden = !ac; });
      btn.hidden = m >= n; btn.textContent = `${m + 1}. adımı aç`;
      $('#hepsi').hidden = m >= n; $('#kapat').hidden = m === 0; $('#cozum-son').hidden = m < n;
      if ($('#cozum-giris')) $('#cozum-giris').hidden = m === 0; // «önce kendin çöz»: giriş de ilk adımla açılır
      acikAdim[`${K.id}/${q.id}`] = m;
    };
    goster(acikAdim[`${K.id}/${q.id}`] || 0, false);
    btn.addEventListener('click', () => { const m = (acikAdim[`${K.id}/${q.id}`] || 0) + 1; goster(m, true); sbYeniGoster(m === 1 && $('#cozum-giris', ana) ? $('#cozum-giris', ana) : lis[m - 1]); });
    $('#hepsi').addEventListener('click', () => goster(n, true));
    $('#kapat').addEventListener('click', () => goster(0, false));
    oynKur(K, q, () => goster(acikAdim[`${K.id}/${q.id}`] || 0, false));
    takipBagla(K);
    katBlokKur(K);
    sinavSusle(K);
  }
  function bolumGoster(K, bid) {
    const b = K.bolumler.find((x) => x.id === bid);
    if (!b) return soruGoster(K, soruSirasi(K)[0]);
    document.title = `${bolumAd(K, b)} · ${K.kod}`;
    const kv = (K.kavramlar || []).filter((k) => k.bolum === bid);
    ana.innerHTML = `<div class="kitap-yer"><nav class="dizin" aria-label="Bölümler ve sorular">${dizinHTML(K, 'bol/' + bid)}</nav><div>${takipHTML(K, null)}
      <h1>${kac(bolumAd(K, b))}</h1>${b === K.bolumler[0] && kesinSay(K) ? isrLejantHTML(K, 'bol') : ''}
      ${kv.length ? `<h3>Bu bölümün kavramları</h3>${bagHTML(K, kv.map((k) => k.id), 'bol-' + bid, true)}` : ''}
      ${b.ogeler.filter((o) => o.tur !== 'soru').map((o) => `<section class="konu-sayfa"><h3 class="mk-sat"><span>${kac(o.baslik)}</span>${o.tur === 'konu' || o.tur === 'formul' ? mkGrupHTML(K, `${o.tur}:${o.id}`, true) : ''}</h3>${o.html}${o.oz ? ozHTML(o.oz) : ''}</section>`).join('')}
      <h3>Bu bölümün soruları</h3><div class="ilgili">${b.ogeler.filter((o) => o.tur === 'soru').map((o) => `<a class="soru-bag" href="#${K.id}/${o.id}">${o.id} · ${kac(K.sorular[o.id]?.baslik)}</a>`).join('')}</div></div></div>`;
    ana.dataset.sayfa = `bol:${bid}`;
    texDoldur(ana, K);
    glifDuzelt(ana); isrSusle(ana);
    $$('.bag button[data-git]', ana).forEach((bt) => { bt.dataset.git = bt.dataset.git.replace(`/bol-${bid}/`, `/bol/${bid}/`); });
    takipBagla(K);
    sinavSusle(K);
  }
  function takipBagla(K) {
    takipIzle();
    const inp = $('#git');
    $('.dizin-ac', ana)?.addEventListener('click', (e) => { const d = e.target.closest('.dizin'); d.classList.toggle('acik'); e.target.setAttribute('aria-expanded', d.classList.contains('acik')); });
    inp.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const v = inp.value.trim().toUpperCase().replace(/\s/g, '');
      let m = v.match(/^[SÇ](\d+)$/);
      if (m && K.sorular[`S${+m[1]}`]) { anaGit(`#${K.id}/S${+m[1]}`); return; }
      m = v.match(/^(\d+)$/);
      if (m) {
        const s = +m[1], sira = soruSirasi(K);
        const tam = sira.find((q) => q.pdf_soru === s || q.pdf_cozum === s);
        const once = [...sira].reverse().find((q) => (q.pdf_soru ?? 1e9) <= s);
        const hedef = tam || once;
        if (hedef) { anaGit(`#${K.id}/${hedef.id}`); return; }
        $('#git-bilgi').textContent = `s. ${s} kapak/özet sayfası; ilk soru s. ${sira[0]?.pdf_soru}`;
        return;
      }
      $('#git-bilgi').textContent = 'Sayfa numarası (37) ya da soru numarası (S12) yaz.';
    });
  }

  /* ---------- ETK3 SABIT (27 Kas): okunan yer yerinde kalır ----------
     Açılır-kapanır bir değişimden hemen önce çapa seçilir (sabitTut): dokunulan denetim (özet, «Katla», kip / oynatıcı / süzgeç
     düğmesi) ya da — yerinde açılan içerikte (Tümünü göster, Hepsi), alt panel açılıp kapanınca, boyu değişince, tembel içerik
     gelince — ekrandaki ilk blok. Değişimden sonra ~700 ms boyunca (her kare + ResizeObserver) çapanın ekran konumu korunur: sayfa
     ya da çekmece içi anında ötelenir, yumuşak gezinme yarışmaz. Belge kısalınca (sayfa sonunda blok kapanınca, panel küçülünce)
     sona geçici boşluk (#sb-ek) eklenir; kullanıcı gezindikçe kendiliğinden erir. Koruma süresince yerel overflow-anchor kapalı
     (html.sb-tut); kullanıcı dokunup gezinirse (wheel / touchmove / gezinme tuşu) koruma hemen biter. Yeni gösterilen adımın
     (oynatıcı, «n. adımı aç», türetim) başı ekranda değilse oraya bilinçli götürülür (260 ms). Yerel çapası olmayan tarayıcıda
     (Safari) tembel içerik için de son okunan blok korunur (dk:sbjs = 1 sınamada bu yolu zorlar). Ölçüm: tools/sabit_olc.cjs. */
  const SB = { el: null, y: 0, kab: window, bitis: 0, raf: 0, ro: null, yeni: null, anim: null, yedek: null, son: null, erit: 0, sonGez: 0, sonT: 0 };
  const sbEk = document.createElement('div'); sbEk.id = 'sb-ek'; sbEk.setAttribute('aria-hidden', 'true'); ana.after(sbEk);
  const sbEkH = () => parseFloat(sbEk.style.height) || 0;
  const sbEkYaz = (h) => { sbEk.style.height = h > 0.5 ? `${Math.ceil(h)}px` : ''; };
  const YEREL_CAPA = (() => { try { return oku('dk:sbjs') !== '1' && !!(window.CSS && CSS.supports && CSS.supports('overflow-anchor', 'auto')); } catch (e) { return false; } })();
  const SB_BLOK = 'h1,h2,h3,h4,p,li,figure,table,tr,summary,pre,blockquote,dt,dd,.cift,.tex-blok,.formul-kap,.oyn-a,.oyn-ust,.oyn-dug,.coz-kip,.cozum-bas,.isr-lejant,.bag,.ak-s,.ak-b'; // tablo satırı / TR-EN çifti: uzun tablonun ortasında okurken satır yerinde kalır
  // görünür alanın üst çizgisi: üst şerit + (yapışmışsa) takip çubuğunun alt kenarı; çekmece içinde kutunun üstü
  function sbUstB(kab) {
    if (kab !== window) return { y: kab.getBoundingClientRect().top, yap: false };
    const u = $('#ust'), t = $('.takip', ana); let y = u ? Math.max(0, u.getBoundingClientRect().bottom) : 0, yap = false;
    if (t && getComputedStyle(t).position === 'sticky') { const r = t.getBoundingClientRect(); if (r.height && r.top <= y + 12) { y = Math.max(y, r.bottom); yap = true; } }
    return { y, yap };
  }
  const sbUst = (kab) => sbUstB(kab).y;
  const sbAlt = (kab) => (kab === window ? innerHeight - altPay() : kab.getBoundingClientRect().bottom);
  // kapalı <details> içi (content-visibility) de görünmez sayılır: checkVisibility
  const sbGorunur = (el) => !!el && el.isConnected && el.getClientRects().length > 0 && (!el.checkVisibility || el.checkVisibility());
  const sbYapiskan = (el, dur) => { for (let x = el; x && x !== dur && x !== document.body; x = x.parentElement) { const p = getComputedStyle(x).position; if (p === 'sticky' || p === 'fixed') return true; } return false; };
  // ekrandaki ilk blok: görünür alanda başlayan ilk blok (DOM sırası; genişlik değişince satırları yeniden dizilse de başı yerinde kalır);
  // yoksa yapışkan çubukların altına uzanan ilk blok. Yapışkan kutuların (takip çubuğu, masadaki dizin) içi sayılmaz.
  function sbIlkBlok(kab) {
    const kok = kab === window ? ana : kab, u = sbUst(kab), a = sbAlt(kab), dz = kab === window ? $('.dizin', ana) : null, dzY = !!dz && getComputedStyle(dz).position === 'sticky';
    let yedek = null;
    for (const el of kok.querySelectorAll(SB_BLOK)) {
      if (kab === window && (el.closest('.takip') || (dzY && dz.contains(el)))) continue;
      const r = el.getBoundingClientRect();
      if (!(r.height > 0 && r.bottom > u + 1) || (el.checkVisibility && !el.checkVisibility())) continue;
      if (r.top >= u - 0.5) return r.top < a - 24 || !yedek ? el : yedek;
      if (!yedek) yedek = el;
    }
    return yedek;
  }
  function sabitTut(capa, { kab = null, sure = 700, yeni = null, hedefY = null, yumusak = 0 } = {}) {
    const k = kab || (capa && ckIc.contains(capa) ? ckIc : window);
    if (capa && (!sbGorunur(capa) || sbYapiskan(capa, k === window ? null : k))) capa = null;
    const yedek = sbIlkBlok(k), el = capa || yedek;
    if (!el) return;
    const y = el.getBoundingClientRect().top, simdi = performance.now();
    Object.assign(SB, { el, kab: k, y, u0: sbUstB(k), sc: k === window ? scrollY : k.scrollTop, yeni, bitis: simdi + sure, basta: !capa && hedefY == null && (k === window ? scrollY < 1 : k.scrollTop < 1), yedek: yedek && yedek !== el ? { el: yedek, y: yedek.getBoundingClientRect().top } : null, anim: hedefY == null ? null : { t0: simdi, sure: Math.max(1, yumusak), y0: y, y1: hedefY } });
    document.documentElement.classList.add('sb-tut');
    if (!SB.ro && typeof ResizeObserver !== 'undefined') { SB.ro = new ResizeObserver(sbBoy); for (const x of [ana, ckIc]) SB.ro.observe(x, { box: 'border-box' }); }
    if (!SB.raf) SB.raf = requestAnimationFrame(sbKare);
  }
  function sabitBirak() { if (SB.raf) cancelAnimationFrame(SB.raf); Object.assign(SB, { raf: 0, el: null, yeni: null, anim: null, yedek: null }); document.documentElement.classList.remove('sb-tut'); }
  const sbYeniGoster = (el) => { if (SB.el && el) SB.yeni = el; };
  window.__dkSabit = { durum: () => ({ el: SB.el ? `${SB.el.tagName}.${SB.el.className}` : null, y: SB.y, kab: SB.kab === window ? 'window' : 'ck', ek: sbEkH(), yerel: YEREL_CAPA }), tut: (el, o) => sabitTut(el, o), birak: () => sabitBirak() }; // sınama kancası (tools/sabit_olc.cjs)
  // panel boyu / açılıp kapanma: koruma sürüyorsa uzat, yoksa ilk blokla başlat (ana akış görünmüyorsa da konum korunur)
  const sbPanel = (sure = 700) => { if (SB.el && SB.kab === window) SB.bitis = Math.max(SB.bitis, performance.now() + sure); else sabitTut(null, { kab: window, sure }); };
  function sbOtele(kab, d) {
    if (kab !== window) { kab.scrollTop += d; SB.sc = kab.scrollTop; return; }
    const max = document.documentElement.scrollHeight - innerHeight;
    if (d > 0 && scrollY + d > max + 0.5) sbEkYaz(sbEkH() + (scrollY + d - max) + 1); // belge kısaldı: sona geçici boşluk
    window.scrollTo({ top: scrollY + d, behavior: 'instant' });
    SB.sc = scrollY;
  }
  // korumanın dışında gezinildi mi (kullanıcı / kod)? İçerik kısalınca tarayıcının kenetlemesi (en sonda, yukarı) sayılmaz, düzeltilir.
  function sbDisGezinti() {
    const k = SB.kab, sc = k === window ? scrollY : k.scrollTop;
    if (SB.sc == null || Math.abs(sc - SB.sc) <= 1.5) return false;
    const max = k === window ? document.documentElement.scrollHeight - innerHeight : k.scrollHeight - k.clientHeight;
    if (sc < SB.sc && sc >= max - 1.5) { SB.sc = sc; return false; }
    return true;
  }
  function sbDuzelt() {
    let el = SB.el; if (!el) return;
    if (SB.kab !== window && sbDisGezinti()) { sabitBirak(); return; } // çekmece içinde (yerel çapa kapalı) dışarıdan gezinme korumayı bitirir; sayfada tarayıcının kendi çapası da düzeltilir
    if (!sbGorunur(el)) { // dokunulan öğe gizlendi / yeniden çizildi → baştaki ilk blok
      if (SB.yedek && sbGorunur(SB.yedek.el)) { SB.el = el = SB.yedek.el; SB.y = SB.yedek.y; SB.yedek = null; SB.anim = null; } else { sabitBirak(); return; } // (u0 başlangıçtaki kalır)
    }
    let hedef = SB.y;
    if (SB.anim) { const t = Math.min(1, (performance.now() - SB.anim.t0) / SB.anim.sure); hedef = SB.anim.y0 + (SB.anim.y1 - SB.anim.y0) * (1 - (1 - t) ** 3); if (t >= 1) { SB.y = SB.anim.y1; SB.anim = null; } }
    if (SB.kab === window && SB.u0 && SB.u0.yap && !SB.anim) { const un = sbUstB(window); if (un.yap) hedef += un.y - SB.u0.y; } // yapışık çubuk uzadı / kısaldı: blok çubuğun altında aynı aralıkta kalır
    const d = el.getBoundingClientRect().top - hedef;
    if (Math.abs(d) >= 0.5 && !(SB.basta && SB.kab === window && scrollY < 1)) sbOtele(SB.kab, d);
    const yn = SB.yeni; // yeni gösterilen adımın başı görünür alanda değilse oraya götür (bilinçli)
    if (yn && !SB.anim && sbGorunur(yn)) {
      const r = yn.getBoundingClientRect(), u = sbUst(SB.kab), a = sbAlt(SB.kab);
      SB.yeni = null;
      if (r.top < u + 4 || r.top > a - 56) Object.assign(SB, { el: yn, y: u + 8, u0: sbUstB(SB.kab), sc: SB.kab === window ? scrollY : SB.kab.scrollTop, yedek: null, anim: { t0: performance.now(), sure: 260, y0: r.top, y1: u + 8 }, bitis: Math.max(SB.bitis, performance.now() + 500) });
    }
  }
  function sbKare() {
    SB.raf = 0; if (!SB.el) return;
    sbDuzelt(); if (!SB.el) return;
    if (performance.now() < SB.bitis || SB.anim) SB.raf = requestAnimationFrame(sbKare);
    else { const k = SB.kab; sabitBirak(); if (!YEREL_CAPA && k === window) sbSonYaz(); }
  }
  // ResizeObserver: koruma sürerken boyut değişimi aynı karede düzeltilir; yerel çapası olmayan tarayıcıda boşta da son okunan blok korunur
  function sbBoy() {
    if (SB.el) { sbDuzelt(); return; }
    if (YEREL_CAPA || !SB.son || performance.now() - SB.sonGez < 250) return;
    const { el, y } = SB.son; if (!sbGorunur(el)) { SB.son = null; return; }
    const d = el.getBoundingClientRect().top - y; if (Math.abs(d) >= 0.5) sbOtele(window, d);
  }
  // yeniden çizimde (sınav kipinden çıkış) okunan yer: ilk bloğun imzası (kimlik ya da tür + metin) → çizimden sonra aynı blok aynı yere
  function sbImza() { const el = sbIlkBlok(window); return el ? { y: el.getBoundingClientRect().top, id: el.id || '', tag: el.tagName, m: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80), sY: scrollY } : { sY: scrollY }; }
  function sbImzaGit(im) {
    if (!im) return;
    let el = im.id ? document.getElementById(im.id) : null;
    if (!el && im.tag) for (const x of ana.querySelectorAll(im.tag)) if ((x.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80) === im.m && sbGorunur(x)) { el = x; break; }
    if (!el) { window.scrollTo({ top: im.sY, behavior: 'instant' }); return; }
    window.scrollTo({ top: Math.max(0, scrollY + el.getBoundingClientRect().top - im.y), behavior: 'instant' });
    sabitTut(el, { kab: window, sure: 500 });
  }
  function sbSonYaz() { if (SB.el) return; const el = sbIlkBlok(window); SB.son = el ? { el, y: el.getBoundingClientRect().top } : null; }
  // kullanıcı gezinirse koruma biter (panelde sürükleme / panel içi gezinme ana akışın korumasını bozmaz)
  const sbKes = (e) => { if (!SB.el) return; const panelde = !!(e.target && e.target.closest && e.target.closest('#cekmece')); if (SB.kab === window ? !panelde : panelde) sabitBirak(); };
  addEventListener('wheel', sbKes, { passive: true, capture: true });
  addEventListener('touchmove', sbKes, { passive: true, capture: true });
  addEventListener('keydown', (e) => { if (/^(PageUp|PageDown|ArrowUp|ArrowDown|Home|End| |j|k)$/.test(e.key) && !/INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '')) sbKes(e); }, true);
  addEventListener('scroll', () => {
    if (!SB.el && sbEkH() && !SB.erit) SB.erit = requestAnimationFrame(() => { SB.erit = 0; if (SB.el) return; const kalan = document.documentElement.scrollHeight - (scrollY + innerHeight); if (kalan > 0.5) sbEkYaz(sbEkH() - kalan); });
    if (!YEREL_CAPA && !SB.el) { SB.sonGez = performance.now(); clearTimeout(SB.sonT); SB.sonT = setTimeout(sbSonYaz, 180); }
  }, { passive: true });
  // dokunulan denetim: değişimden önce (yakalama evresi) çapa; bağlar (gezinme) ve yapışkan kutular hariç
  document.addEventListener('click', (e) => {
    if (e.button) return;
    const t = e.target && e.target.closest && e.target.closest('summary, button, [role="button"], h2.kat-bas, .oyn-a');
    if (!t || t.closest('[data-git], [data-ck], [data-soru], [data-ana], a[href], .ck-ust, .kirinti, #ck-sekme, .ck-tutamak')) return;
    const kab = ana.contains(t) ? window : ckIc.contains(t) ? ckIc : null; if (!kab) return;
    if (t.matches('.dil-tumu, .oyn-hepsi, #hepsi, [data-ak="ac"]')) sabitTut(null, { kab }); // yerinde açılan içerik: okunan yer (ilk blok)
    else if (t.matches('#kapat')) sabitTut(t.closest('.cozum-bas'), { kab });
    else sabitTut(t, { kab });
  }, true);

  /* ---------- konu çekmecesi (DK316: kapanmadan gezinme) ----------
     Çekmece adresi ana sayfanın arkasına eklenir: #<ana sayfa>/k/<çekmece>
       <kavram>/<parça>           kavram (tanim · diyagram · formul · ispat · anim · kod · sorular · dil)
       _atlas                     kitabın kavram atlası: bölümler, kavramlar, sorular
       _bol/<bölüm-id>            bölüm görünümü
       _sozluk · _sozluk/<en> · _sozluk/<en>~<en2>   sözlük, terim, iki terim yan yana
     Geniş ekranda (≥ 1100 px) çekmece yana yerleşir; «Sabitle» açıkken soru değişince kapanmaz (/k/ eki korunur).
     Dar ekranda tam ekran açılır; çekmecedeki soru bağı ana sayfayı değiştirir, çekmece açık kalır. */
  const ck = $('#cekmece'), perde = $('#perde'), ckIc = $('#ck-ic');
  let ckDurum = null, ckAdim = 0, simdiK = null;
  const genisMq = matchMedia('(min-width:1100px)');
  const ckGenis = () => genisMq.matches;
  /* ETK2 DKM (26 Kas): bölünmüş görünüm her ekranda. Çekmece kipi (html[data-ckmod]):
     genis ≥ 1100 px yanda (sürüklenir) · yan = küçük tablet / yatay telefon, yan yana ≈ %50 (sürüklenir)
     · alt = dikey telefon: alttan açılan, tutamakla boyu değişen panel (%35 / %55 / %85 / tam); üstte ana akış ayrıca kayar. */
  const yanMq = matchMedia('(max-width:1099.98px) and (min-width:900px), (max-width:1099.98px) and (orientation:landscape) and (min-width:560px)');
  // ETK3 YUZEN: yüzen pencere açıksa kip «yuzen» (alt / yan / geniş kipin üstüne); dk:ckyuz = {acik, dikey, yatay}
  let ckYuz = (() => { try { return !!(JSON.parse(oku('dk:ckyuz') || 'null') || {}).acik; } catch (e) { return false; } })();
  const ckMod = () => (GOMULU ? 'genis' : ckYuz ? 'yuzen' : genisMq.matches ? 'genis' : yanMq.matches ? 'yan' : 'alt');
  const ckSabitSorar = () => ckMod() === 'genis' || ckMod() === 'yan'; // Sabitle düğmesi yalnız yanda; alt panel ve yüzen pencere hep açık kalır
  const ckYanda = () => ckMod() !== 'alt';
  const BOY = [0.35, 0.55, 0.85, 1];
  let ckBoy = (() => { const v = oku('dk:ckboy'); return v !== null && /^[0-3]$/.test(v) ? +v : 1; })();
  let ckBoyOnce = null, tikYut = false; // arama odağında geçici tam boy (sonra eski boy) · sürüklemenin ardından gelen tık yutulur
  const ckAnaGorunur = () => ckYanda() || ckBoy < 3; // ana akış çekmeceyle birlikte görünüyor mu?
  const altPay = () => (ckDurum && ckMod() === 'alt' ? BOY[ckBoy] * innerHeight : 0); // alttaki panelin örttüğü yükseklik
  let sabit = oku('dk:sabit') !== '0';
  const BOLUM_AD = {
    mto316: { '00-HARITA': 'Vize nasıl bir sınav?', '01-A-SU-BUTCESI': 'A · Su bütçesi', '02-B-YAGIS-OLCUM': 'B · Yağış ve ölçüm', '03-C-EKSTREM-PMP': 'C · Ekstremler ve PMP', '04-D-HAZNE-BUHARLASMA': 'D · Hazne ve buharlaşma', '05-E-AKIS-HECHMS': 'E · Akış ve HEC-HMS', '06-F-EK-HESAPLAR': 'F · Ek hesaplar', '07-Z-SON-30-DAKIKA': 'Z · Son 30 dakika' },
    mto323: { '00-harita': 'Kapsam', '01-birimler': '1 · Birimler', '02-sera-bulut': '2 · Sera etkisi ve bulutlar', '03-aerosol': '3 · Aerosol', '04-asit-pinatubo-enso': '4 · Asit yağmuru, Pinatubo, ENSO', '05-omur-kinetik': '5 · Ömür ve kinetik (ek)', '06-ozon': '6 · Ozon', '07-son': 'Son 30 dakika' },
    mto303e: { '00-GIRIS': 'Nasıl çalışılır', 'A-TEMELLER-ODE': 'A · Temeller ve ODE', 'B-FARK-PDE-ELIPTIK': 'B · Fark yaklaşımı ve eliptik PDE', 'C-ZAMAN-SEMALARI': 'C · Zaman şemaları', 'D-CFD-PRATIK': 'D · CFD pratiği', 'E-SON-30-DAKIKA': 'E · Son 30 dakika' },
  };
  const bolumAd = (K, b) => (BOLUM_AD[K.id] || {})[b.id] || b.ad;
  const bolumDolu = (K, b) => (K.kavramlar || []).some((k) => k.bolum === b.id) || b.ogeler.some((o) => o.tur === 'soru');
  const TRH = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
  const norm = (s) => String(s ?? '').toLocaleLowerCase('tr').replace(/[çğıöşüâîû]/g, (c) => TRH[c]).normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}]+/gu, '');
  // «S10'a dön», «S2'ye dön», «S6'ya dön»: sayının okunuşuna göre yönelme eki
  const yonelme = (id) => { const m = /(\d+)$/.exec(id || ''), n = m ? +m[1] : 0, b = n % 10, o = Math.floor(n / 10) % 10; return `${id}'${b ? ['', 'e', 'ye', 'e', 'e', 'e', 'ya', 'ye', 'e', 'a'][b] : ['e', 'a', 'ye', 'a', 'a', 'ye', 'a', 'e', 'e', 'a'][o]}`; };
  const dilK = (K, id) => (K && K.dil && K.dil.kavram && K.dil.kavram[id]) || null;
  const dilS = (K, id) => (K && K.dil && K.dil.soru && K.dil.soru[id]) || null;
  const szBul = (K, en) => (K.sozluk || []).find((x) => x.en.toLowerCase() === String(en || '').trim().toLowerCase());
  const parcaVar = (K, k, p) => p === 'sorular' || (p === 'sinav' ? !!snKv(K, k.id) : p === 'dil' ? !!dilK(K, k.id) : p === 'kimya' ? kimyaVar(K, k.id) : p === 'hesap' ? kavramHesap(K, k.id).length > 0 : !!(k.parcalar && k.parcalar[p]));
  // çekmece içi bağ: ana sayfa değişse de doğru yere gider (tıklamada o anki ana sayfaya eklenir)
  const ckBag = (kp, ic, sinif = '') => `<a href="#${kac(ckDurum ? ckDurum.onEk : '')}/k/${kac(kp)}" data-ck="${kac(kp)}"${sinif ? ` class="${sinif}"` : ''}>${ic}</a>`;

  /* --- TR ↔ EN gösterimi: cümle çifti, eşleşen ifadeler aynı renk; dokun ya da imleci getir → ikisi birlikte parlar --- */
  const ES_RENK = 6;
  function esIsle(metin, ifadeler, tr) {
    const t = String(metin ?? ''), kucuk = tr ? t.toLocaleLowerCase('tr') : t.toLowerCase(), aralik = [];
    for (const [s0, i] of ifadeler) {
      const s = String(s0 || '').trim(); if (!s) continue;
      let p = t.indexOf(s);
      if (p < 0) p = kucuk.indexOf(tr ? s.toLocaleLowerCase('tr') : s.toLowerCase());
      if (p < 0 || aralik.some(([a, b]) => p < b && p + s.length > a)) continue;
      aralik.push([p, p + s.length, i]);
    }
    aralik.sort((x, y) => x[0] - y[0]);
    let out = '', son = 0;
    for (const [a, b, i] of aralik) { out += `${kac(t.slice(son, a))}<span class="es es${i % ES_RENK}" data-es="${i}" tabindex="0">${kac(t.slice(a, b))}</span>`; son = b; }
    return out + kac(t.slice(son));
  }
  function ciftHTML(c, sinif = '') {
    const es = (c.es || []).filter((x) => Array.isArray(x) && x.length >= 2);
    return `<div class="cift${sinif ? ' ' + sinif : ''}"><p class="tr" lang="tr">${esIsle(c.tr, es.map((x, i) => [x[0], i]), true)}</p><p class="en" lang="en">${esIsle(c.en, es.map((x, i) => [x[1], i]), false)}</p></div>`;
  }
  const esYak = (el, on, kilit) => { const c = el.closest('.cift'); if (!c) return; $$(`.es[data-es="${el.dataset.es}"]`, c).forEach((x) => { if (kilit !== undefined) x.classList.toggle('kilit', kilit); x.classList.toggle('yan', on || x.classList.contains('kilit')); }); };
  const esHedef = (e) => e.target.closest && e.target.closest('.cift .es');
  document.addEventListener('mouseover', (e) => { const s = esHedef(e); if (s) esYak(s, true); });
  document.addEventListener('mouseout', (e) => { const s = esHedef(e); if (s) esYak(s, false); });
  document.addEventListener('focusin', (e) => { const s = esHedef(e); if (s) esYak(s, true); });
  document.addEventListener('focusout', (e) => { const s = esHedef(e); if (s) esYak(s, false); });
  document.addEventListener('click', (e) => { const s = esHedef(e); if (s) esYak(s, true, !s.classList.contains('kilit')); });

  /* --- karşılaştırma bloğu (Mihenk gibi): sütun başlığı → sütun öne çıkar + not; satır adı → satır parlar; Şunu bil; Kendini dene --- */
  const KR = [];
  function karsilastirHTML(kr) {
    const n = KR.push(kr) - 1, sut = kr.sutun || [], sat = kr.satir || [];
    return `<section class="kr" data-kr="${n}"><h3>${kac(kr.baslik || 'Karşılaştır')}</h3>
      <p class="kr-ipucu">Bir sütun başlığına dokun: o terim öne çıkar, notu açılır. Bir satır adına dokun: o özellik yan yana parlar.</p>
      <div class="tablo-kap"><table class="kr-t"><thead><tr><th scope="col"><span class="yok">Özellik</span></th>${sut.map((s, i) => `<th scope="col"><button type="button" class="kr-sut es${i % ES_RENK}" data-k="${i}" aria-pressed="false"><span lang="en">${kac(s.en)}</span><small>${kac(s.tr)}</small></button></th>`).join('')}</tr></thead>
      <tbody>${sat.map((r, j) => `<tr data-r="${j}"><th scope="row"><button type="button" class="kr-sat" data-r="${j}" aria-pressed="false">${kac(r.ad)}</button></th>${sut.map((s, i) => `<td data-k="${i}">${kac((r.h || [])[i] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <div class="kr-not" aria-live="polite" hidden></div>
      ${(kr.bil || []).length ? `<div class="kr-bil"><h4>Şunu bil</h4><ul>${kr.bil.map((b) => `<li>${kac(b)}</li>`).join('')}</ul></div>` : ''}
      ${(kr.dene || []).length ? `<div class="kr-dene" data-i="0"><h4>Kendini dene <small class="yok">· cümleye uyan terimi seç</small></h4><p class="kr-s" lang="en"></p><div class="kr-sec">${sut.map((s, i) => `<button type="button" class="kucuk" data-k="${i}" lang="en">${kac(s.en)}</button>`).join('')}</div><p class="kr-sonuc" aria-live="polite"></p><button type="button" class="kucuk kr-sonraki" hidden>Sonraki soru ›</button></div>` : ''}</section>`;
  }
  function deneYaz(kok) {
    const kr = KR[+kok.dataset.kr], d = $('.kr-dene', kok); if (!kr || !d) return;
    const i = (+d.dataset.i || 0) % kr.dene.length, q = kr.dene[i];
    $('.kr-s', d).textContent = `${i + 1}/${kr.dene.length} · ${q.s}`;
    const so = $('.kr-sonuc', d); so.textContent = ''; so.className = 'kr-sonuc';
    $$('.kr-sec button', d).forEach((x) => { x.disabled = false; x.classList.remove('dogru', 'yanlis'); });
    $('.kr-sonraki', d).hidden = true;
  }
  const krKur = (kok) => $$('.kr', kok).forEach(deneYaz);
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.kr button'); if (!b) return;
    const kok = b.closest('.kr'), kr = KR[+kok.dataset.kr]; if (!kr) return;
    if (b.classList.contains('kr-sut')) {
      const k = +b.dataset.k, on = b.getAttribute('aria-pressed') !== 'true';
      $$('.kr-sut', kok).forEach((x) => x.setAttribute('aria-pressed', String(on && +x.dataset.k === k)));
      $$('td[data-k]', kok).forEach((td) => { td.classList.toggle('on', on && +td.dataset.k === k); td.classList.toggle('sonuk', on && +td.dataset.k !== k); });
      const s = kr.sutun[k], not = $('.kr-not', kok);
      not.hidden = !on; not.innerHTML = on ? `<b lang="en">${kac(s.en)}</b> · <i>${kac(s.tr)}</i>${s.not ? ` — ${kac(s.not)}` : ''}` : '';
    } else if (b.classList.contains('kr-sat')) {
      const r = +b.dataset.r, on = b.getAttribute('aria-pressed') !== 'true';
      $$('.kr-sat', kok).forEach((x) => x.setAttribute('aria-pressed', String(on && +x.dataset.r === r)));
      $$('tbody tr', kok).forEach((tr) => tr.classList.toggle('on', on && +tr.dataset.r === r));
    } else if (b.classList.contains('kr-sonraki')) {
      const d = $('.kr-dene', kok); d.dataset.i = (+d.dataset.i || 0) + 1; deneYaz(kok);
    } else if (b.closest('.kr-sec')) {
      const d = $('.kr-dene', kok), q = kr.dene[(+d.dataset.i || 0) % kr.dene.length], dogru = +b.dataset.k === +q.c;
      $$('.kr-sec button', d).forEach((x) => { x.disabled = true; if (+x.dataset.k === +q.c) x.classList.add('dogru'); });
      if (!dogru) b.classList.add('yanlis');
      const so = $('.kr-sonuc', d); so.className = `kr-sonuc ${dogru ? 'dogru' : 'yanlis'}`;
      so.textContent = `${dogru ? 'Doğru.' : `Yanlış — doğrusu: ${(kr.sutun[q.c] || {}).en || ''}.`} ${q.neden || ''}`;
      const sn = $('.kr-sonraki', d); sn.hidden = false; sn.textContent = kr.dene.length > 1 ? 'Sonraki soru ›' : 'Baştan';
    }
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.kendin-ac, .dil-tumu'); if (!b) return;
    if (b.classList.contains('dil-tumu')) { const s = b.closest('.dil-blok'), ac = !s.classList.contains('tum'); s.classList.toggle('tum', ac); b.setAttribute('aria-expanded', String(ac)); b.textContent = ac ? 'Daha az göster' : `Tümünü göster (${$$('.cift', s).length})`; return; }
    const en = b.nextElementSibling, ac = en.hidden; en.hidden = !ac; b.setAttribute('aria-expanded', String(ac)); b.textContent = ac ? 'Cevabı gizle' : 'Cevabı göster';
  });

  function dilKavramHTML(K, k) {
    const D = dilK(K, k.id);
    if (!D) return '<p class="yok">Bu kavram için TR ↔ EN katmanı hazırlanıyor.</p>';
    const T = D.terim || [], szler = (K.sozluk || []).filter((s) => (s.kavram || []).includes(k.id));
    let h = '<p class="dil-ipucu">Türkçe satır küçük ve eğik, İngilizcesi hemen altında. Aynı renkli ifadeler birbirinin karşılığı: birine dokun ya da imleci getir, ikisi birlikte parlar.</p>';
    if (T.length) h += `<h3>Terimler</h3><div class="dil-kap"><table class="dil-terim"><thead><tr><th>TR</th><th>EN</th><th>Tür</th><th>Okunuş</th><th>Birlikte kullanılır</th></tr></thead><tbody>${T.map((t) => `<tr><td data-b="TR"><i>${kac(t.tr)}</i></td><td data-b="EN" lang="en"><b>${kac(t.en)}</b></td><td data-b="Tür">${kac(t.tur || '')}</td><td data-b="Okunuş">${t.oku ? `<span class="oku">${kac(t.oku)}</span>` : ''}${t.ipa ? ` <span class="ipa" lang="en">/${kac(t.ipa)}/</span>` : ''}</td><td data-b="Birlikte" lang="en">${(t.es || []).map(kac).join(' · ')}</td></tr>`).join('')}</tbody></table></div>`;
    for (const kr of D.karsilastir || []) h += karsilastirHTML(kr);
    if ((D.cumle || []).length) h += `<h3>Cümle cümle</h3>${D.cumle.map((c) => ciftHTML(c)).join('')}`;
    if ((D.sinav || []).length) h += `<h3>Sınav kâğıdına İngilizce şöyle yaz</h3>${D.sinav.map((c) => ciftHTML(c, 'sinav')).join('')}`;
    if ((D.kendin || []).length) h += `<h3>Kendin çevir</h3><p class="yok">Önce kendin düşün (ya da kâğıda yaz), sonra dokun.</p>${D.kendin.map((c) => `<div class="kendin"><p class="tr" lang="tr">${kac(c.tr)}</p><button type="button" class="kucuk kendin-ac" aria-expanded="false">Cevabı göster</button><p class="en" lang="en" hidden>${kac(c.en)}</p></div>`).join('')}`;
    if (szler.length) h += `<h3>Sözlükte</h3><div class="ilgili">${szler.map((s) => ckBag(`_sozluk/${s.en}`, `<span lang="en">${kac(s.en)}</span> · ${kac(s.tr)}`, 'soru-bag')).join('')}</div>`;
    return h;
  }
  // soru sayfası: soru metninin altında TR ↔ EN, yol haritasına kalıp eki, çözüm sonunda «Sınav kâğıdına İngilizce»
  function dilSoruEkle(K, q) {
    const D = dilS(K, q.id); if (!D) return;
    const c = D.cift || [], govde = $('.soru-govde', ana);
    let h = '';
    if (c.length) h += `<section class="dil-blok" id="dil-cift" aria-labelledby="dil-cift-h"><h2 id="dil-cift-h">TR ↔ EN <small>soru cümle cümle</small></h2><p class="dil-ipucu">Aynı renkli ifadeler birbirinin karşılığı: birine dokun ya da imleci getir.</p>${c.map((x, i) => ciftHTML(x, i >= 2 ? 'fazla' : '')).join('')}${c.length > 2 ? `<button type="button" class="kucuk dil-tumu" aria-expanded="false">Tümünü göster (${c.length})</button>` : ''}</section>`;
    for (const kr of D.karsilastir || []) h += karsilastirHTML(kr);
    if (h && govde) govde.insertAdjacentHTML('afterend', h);
    if ((D.kalip || []).length) {
      const li = D.kalip.map((k) => `<li class="kalip-dil"><span class="en-k" lang="en">${kac(k.en)}</span> → ${kac(k.tr)}${k.ipucu ? ` · ${isr('kisa', { kucuk: true })}<b>${kac(k.ipucu)}</b>` : ''}</li>`).join('');
      const ul = $('.yol ul.kalip', ana), yol = $('.yol', ana);
      if (ul) ul.insertAdjacentHTML('beforeend', li);
      else if (yol) $('h2', yol).insertAdjacentHTML('afterend', `<p class="yol-alt">Soruda bu ifadeyi görünce:</p><ul class="kalip">${li}</ul>`);
      else if (govde) govde.insertAdjacentHTML('afterend', `<section class="dil-blok"><p class="yol-alt">Soruda bu ifadeyi görünce:</p><ul class="kalip">${li}</ul></section>`);
    }
    if ((D.yaz || []).length) $('#cozum-son', ana)?.insertAdjacentHTML('afterbegin', `<section class="dil-blok dil-yaz" id="dil-yaz"><h3>Sınav kâğıdına İngilizce</h3><p class="dil-ipucu">Çözümün kilit satırları; sayılar kitaptakiyle aynı.</p>${D.yaz.map((x) => ciftHTML(x, 'sinav')).join('')}</section>`);
    krKur(ana);
  }

  /* --- zengin sözlük kartı: terime dokun → TR, tür, okunuş, fark, örnek, Karşılaştır, Kavrama git --- */
  const ipKart = document.createElement('div');
  ipKart.className = 'ip-kart'; ipKart.id = 'ip-kart'; ipKart.hidden = true; ipKart.setAttribute('role', 'dialog'); ipKart.setAttribute('aria-label', 'Terim');
  document.body.append(ipKart);
  let ipHedef = null;
  const ipAcik = () => !ipKart.hidden;
  function ipKapat() { ipKart.hidden = true; ipHedef = null; }
  function ipAc(el, K) {
    const s = szBul(K, el.dataset.en || el.textContent); if (!s) return false;
    const taban = location.hash.split('/k/')[0] || `#${K.id}`;
    const git = (kp, ad) => `<button type="button" data-git="${kac(`${taban}/k/${kp}`)}">${ad}</button>`;
    const kv = kvSira(K, s.kavram), tu = turEn(K, s.en);
    ipKart.innerHTML = `<div class="ip-bas"><b lang="en">${kac(s.en)}</b>${s.tur ? `<span class="tur">${kac(s.tur)}</span>` : ''}${s.oku ? `<span class="oku">${kac(s.oku)}</span>` : ''}${s.ipa ? `<span class="ipa" lang="en">/${kac(s.ipa)}/</span>` : ''}<button type="button" class="ip-x" aria-label="Kapat">×</button></div>
      <p class="ip-tr"><i>${kac(s.tr)}</i></p>${(s.es || []).length ? `<p><span class="yok">Birlikte:</span> <span lang="en">${s.es.map(kac).join(' · ')}</span></p>` : ''}
      ${s.fark ? `<p class="sz-fark"><b>Fark:</b> ${kac(s.fark)}</p>` : ''}${s.ornek ? ciftHTML(s.ornek) : ''}
      <div class="ip-dug">${(s.bak || []).map((b) => git(`_sozluk/${s.en}~${b}`, `Karşılaştır: <span lang="en">${kac(b)}</span>`)).join('')}${tu ? git(`_tur/${tu.id}`, `Türü aç: ${kac(tu.f)}`) : ''}${kv.map((k) => git(`${k.id}/tanim`, `Kavrama git: ${kac(k.sembol)} · ${kac(k.ad)}`)).join('')}${git(`_sozluk/${s.en}`, 'Sözlükte aç')}</div>`;
    ipKart.hidden = false; ipHedef = el;
    const r = el.getBoundingClientRect(), w = Math.min(380, innerWidth - 16);
    ipKart.style.width = `${w}px`; ipKart.style.left = `${Math.min(Math.max(8, r.left), innerWidth - w - 8)}px`; ipKart.style.top = '0px';
    const h = ipKart.offsetHeight; let y = r.bottom + 6;
    if (y + h > innerHeight - 8 && r.top - h - 6 > 8) y = r.top - h - 6;
    ipKart.style.top = `${Math.max(8, Math.min(y, innerHeight - h - 8))}px`;
    return true;
  }
  ipKart.addEventListener('click', (e) => { if (e.target.closest('.ip-x')) { const h = ipHedef; ipKapat(); h?.focus?.(); } else if (e.target.closest('[data-git]')) ipKapat(); });
  addEventListener('scroll', (e) => { if (ipAcik() && !ipKart.contains(e.target)) ipKapat(); }, true);
  addEventListener('resize', () => { if (ipAcik()) ipKapat(); }, { passive: true });

  /* --- çekmece görünümleri --- */
  function kirintiYaz(K, parcalar) {
    $('#kirinti').innerHTML = [[kac(K.kod), '_atlas'], ...parcalar].map(([ad, kp]) => (kp ? ckBag(kp, ad) : `<span>${ad}</span>`)).join(' <span class="ayrac" aria-hidden="true">›</span> ');
  }
  const siraHTML = (o, orta, s) => `${o ? ckBag(o[0], `‹ <span class="sira-ad">${o[1]}</span>`, 'sira-bag') : '<span class="sira-bos"></span>'}<span class="sira-orta yok">${orta}</span>${s ? ckBag(s[0], `<span class="sira-ad">${s[1]}</span> ›`, 'sira-bag sag') : '<span class="sira-bos"></span>'}`;
  const ustSekme = (K, sec) => [['_atlas', 'Atlas', 'atlas'], ...(snVar(K) ? [[snHedef(K), 'Sınav', 'sinav']] : []), ...(puVar(K) ? [['_pusula', 'Vize pusulası', 'pusula']] : []), ...(kesinSay(K) ? [['_kesin', 'Kesin bil', 'kesin']] : []), ...((K.kavramlar || []).length > 1 ? [['_ag', 'Ağ', 'ag']] : []), ...(turlar(K).length ? [['_tur', 'Türler', 'tur']] : []), ...(tepkimeler(K).length ? [['_tepkime', 'Tepkimeler', 'tepkime']] : []), ...(donguler(K).length ? [['_dongu', 'Çevrimler', 'dongu']] : []), ...(HS(K).length ? [['_hesap', 'Hesap', 'hesap']] : []), ...((K.kavramlar || []).length > 1 || czKars(K).length ? [['_kars', 'Karşılaştır', 'kars']] : []), ...(terimVar(K) ? [['_terim', `Terimler (${K.terim.n || (K.terim.terim || []).length})`, 'terim']] : []), ['_sozluk', `Sözlük (${(K.sozluk || []).length})`, 'sozluk']].map(([kp, ad, id]) => `<button type="button" role="tab" aria-selected="${sec === id}" data-ck="${kp}">${ad}</button>`).join('');
  function soruCip(K, sid, uzun) {
    const q = K.sorular[sid]; if (!q) return '';
    const simdi = ckDurum && ckDurum.qid === sid, s = simdi ? ' simdi' : '', ac = simdi ? ' aria-current="page"' : '';
    return uzun ? `<a class="soru-bag${s}" href="#${K.id}/${sid}" data-soru="${sid}"${ac}>${sid} · ${kac(q.baslik)} <span class="yok">s. ${q.pdf_soru ?? '—'}</span></a>`
      : `<a class="soru-cip${s}" href="#${K.id}/${sid}" data-soru="${sid}" title="${kac(q.baslik)} · PDF s. ${q.pdf_soru ?? '—'}" aria-label="${sid} · ${kac(q.baslik)}"${ac}>${sid}</a>`;
  }
  const kavramSatir = (K, k) => `<li class="kv-li">${ckBag(`${k.id}/tanim`, `<span class="sem">${kac(k.sembol)}</span><span class="ad">${kac(k.ad)}</span>${k.en ? `<span class="en" lang="en">${kac(k.en)}</span>` : ''}${rozetHTML(K, k)}`, 'kv-sat')}${(K.kavramlar || []).length > 1 ? krEkleDug(K, k, true) : ''}</li>`;
  // TR↔EN rozeti (DK316) aynen; kimya / hesap verisi olan kitapta rozetler bir kapta toplanır
  const rozetHTML = (K, k) => {
    const d = dilK(K, k.id) ? '<span class="dil-rozet" title="TR ↔ EN katmanı var">TR↔EN</span>' : '';
    const km = kimyaVar(K, k.id) ? '<span class="dil-rozet kim-rozet" title="Kimya: türler, tepkimeler, çevrim">Kimya</span>' : '';
    const hs = kavramHesap(K, k.id).length ? '<span class="dil-rozet hs-rozet" title="Hesap aracı var">Hesapla</span>' : '';
    const sv = SV(K), sn = sv && (sv.kavram || {})[k.id] ? snNokta(sv.kavram[k.id].olasilik, true) : '';
    return km || hs || sn ? `<span class="rozetler">${sn}${d}${km}${hs}</span>` : d;
  };
  const bolumSorulari = (K, b) => b.ogeler.filter((o) => o.tur === 'soru').map((o) => o.id).filter((id) => K.sorular[id]);

  function atlasCk(K, ayni) {
    kirintiYaz(K, [['Kavram atlası', null]]);
    $('#ck-baslik').innerHTML = `${kac(K.kod)} · kavram atlası<small>${kac(K.ad)} · ${(K.kavramlar || []).length} kavram · ${Object.keys(K.sorular).length} soru</small>`;
    $('#ck-sira').innerHTML = ''; $('#ck-sekme').innerHTML = ustSekme(K, 'atlas');
    if (ayni) return;
    const sv = SV(K);
    ckIc.innerHTML = `<p class="ck-not">Bir bölüme, kavrama ya da soruya dokun; çekmece açık kalır. Kavram satırı: sembol · Türkçe ad · İngilizce ad.</p>${atlasGirisHTML(K)}${K.bolumler.filter((b) => bolumDolu(K, b)).map((b) => {
      const kv = (K.kavramlar || []).filter((k) => k.bolum === b.id), sq = bolumSorulari(K, b);
      return `<section class="at-bol"><h3>${ckBag(`_bol/${b.id}`, kac(bolumAd(K, b)))} <span class="say">${kv.length} kavram · ${sq.length} soru</span>${sv && (sv.bolum || {})[b.id] ? snNokta(sv.bolum[b.id].olasilik) : ''}</h3>${kv.length ? `<ul class="kv-liste">${kv.map((k) => kavramSatir(K, k)).join('')}</ul>` : ''}${sq.length ? `<div class="soru-cipler"><span class="yok">Sorular:</span> ${sq.map((s) => soruCip(K, s)).join('')}</div>` : ''}</section>`;
    }).join('')}`;
  }
  /* ---------- ETK4 ONARIM (27 Kas): Konu atlası tam sayfa · sınava özgü pusula · kavram ağı listesi ----------
     #<kitap>/kavram (takma ad #<kitap>/atlas): eskiden sessizce ilk soruya düşüyordu → konu (bölüm) → kavramlar → sorular; kavram
     yan çekmecede (telefonda alt panelde) açılır, sayfa yerinde kalır.
     Sınav özgüllüğü: çekmecedeki «Sınav» sekmesi bulunulan parçanın pusulasını açar (snHedef): kavram → _sinav/kavram/<id>,
     terim kartı / sözlük → bağlı üst kavram (terim işaretli: _sinav/kavram/<id>/<terim>), kendi notu olmayan kavram → bölümün notu
     (_sinav/bol/<bölüm>/<kavram>), konu / bölüm → _sinav/bol/<bölüm>, soru → _sinav/soru/<S>; «Bütün sınav pusulası →» bağı her zaman. */
  function snHedef(K, kPart) {
    if (kPart == null) kPart = ckDurum && ckDurum.K === K ? ckDurum.kPart : '';
    const V = SV(K);
    if (!V) return '_sinav';
    const [bas, ...kalan] = String(kPart || '').split('/');
    if (bas === '_sinav') return kPart || '_sinav';
    const kv = (kid, vz) => { const k = kavramBul(K, kid); if (!k) return null; if (snKv(K, kid)) return `_sinav/kavram/${kid}${vz ? '/' + vz : ''}`; return k.bolum && (V.bolum || {})[k.bolum] ? `_sinav/bol/${k.bolum}/${kid}` : null; };
    const terimden = (t) => { for (const x of ((t && t.bag) || {}).kavram || []) { const r = kv(x, t.id); if (r) return r; } return null; };
    if (bas === '_terim' && kalan[0]) return terimden(terimBul(K, kalan[0])) || '_sinav';
    if (bas === '_sozluk' && kalan[0]) {
      const en = enNorm(kalan.join('/').split('~')[0]);
      const tv = TV[K.id], t = tv ? [...tv.bul.values()].find((x) => enNorm(x.en) === en) : null;
      const k = (K.kavramlar || []).find((x) => enNorm(x.en) === en);
      return (t && terimden(t)) || (k && kv(k.id)) || '_sinav';
    }
    if (bas === '_bol' && kalan[0]) return (V.bolum || {})[kalan[0]] ? `_sinav/bol/${kalan[0]}` : '_sinav';
    if (bas === '_konu' && kalan[0]) { const x = ogeBul(K, kalan[0]); return x && (V.bolum || {})[x.b.id] ? `_sinav/bol/${x.b.id}` : '_sinav'; }
    if (bas === '_soru' && kalan[0]) return (V.soru || {})[kalan[0]] ? `_sinav/soru/${kalan[0]}` : '_sinav';
    if (bas === '_hesap' && kalan[0]) { const h = hesapBul(K, kalan[0]); return (h && (h.kavram || []).map((x) => kv(x)).find(Boolean)) || '_sinav'; }
    if (bas && !bas.startsWith('_')) return kv(bas) || '_sinav';
    return '_sinav';
  }
  // metindeki adları işaretle (yalnız düz metin; formül / SVG / düğme içi atlanır)
  function snVurgula(kok, adlar) {
    const A = [...new Set((adlar || []).map((x) => String(x || '').trim()).filter((x) => x.length >= 3))].sort((a, b) => b.length - a.length);
    if (!kok || !A.length) return 0;
    const kacRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(`(${A.map(kacRx).join('|')})`, 'iu');
    const L = [], yuru = document.createTreeWalker(kok, NodeFilter.SHOW_TEXT);
    for (let n = yuru.nextNode(); n; n = yuru.nextNode()) { const p = n.parentElement; if (p && !p.closest('svg, mark, button, .tex-blok, .mk-f, .sn-ust-kv') && rx.test(n.data)) L.push(n); }
    let say = 0;
    for (const n of L) {
      const parca = n.data.split(new RegExp(`(${A.map(kacRx).join('|')})`, 'giu'));
      const f = document.createDocumentFragment();
      parca.forEach((s, i) => { if (!s) return; if (i % 2) { const m = document.createElement('mark'); m.className = 'sn-vurgu'; m.textContent = s; f.append(m); say++; } else f.append(s); });
      n.replaceWith(f);
    }
    return say;
  }
  // _sinav/kavram/<id>[/<terim>] · _sinav/bol/<bölüm>[/<kavram>] · _sinav/soru/<S> → true (çizildi) ya da false (bütün pusula)
  function snOzelCk(K, ne, ayni) {
    const V = SV(K); if (!V || !ne) return false;
    const [tur, id, vz] = String(ne).split('/');
    const tum = (ek = '') => `<p class="sn-tum">${ek}${ckBag('_sinav', 'Bütün sınav pusulası →', 'soru-bag')}</p>`;
    if (tur === 'kavram') {
      const k = kavramBul(K, id), X = k && snKv(K, id); if (!X) return false;
      const t = vz ? terimBul(K, vz) : null;
      kirintiYaz(K, [['Sınav pusulası', '_sinav'], [`${kac(k.sembol)} · ${kac(k.ad)}`, null]]);
      $('#ck-baslik').innerHTML = `Sınav · ${kac(k.ad)}<small>${t ? `${kac(t.tr)} · en yakın üst kavramın notu` : 'yalnız bu kavram'}</small>`;
      if (ayni) return true;
      const ust = t ? `<div class="sn-ust-kv"><p><b>${kac(t.tr)}</b>${t.en ? ` <span class="yok" lang="en">${kac(t.en)}</span>` : ''}${(t.tanim || [])[0] ? `: ${kac(t.tanim[0])}` : ''}</p><p class="yok">Bu terimin ayrı sınav notu yok. Aşağıdaki not en yakın üst kavramın (${kac(k.sembol)} · ${kac(k.ad)}); terim geçtiği yerde işaretli.</p><p>${ckBag(`_terim/${t.id}`, 'Terim kartına dön →', 'soru-bag')}</p></div>` : '';
      ckIc.innerHTML = `${ust}${sinavKavramHTML(K, k)}${tum(ckBag(`${k.id}/tanim`, 'Kavramın tanımı →', 'soru-bag') + ' ')}`;
      if (t) snVurgula(ckIc, [t.tr, t.kisa, ...(t.es || []).filter((x) => /[a-zçğıöşü]/i.test(x))]);
      return true;
    }
    if (tur === 'bol') {
      const b = K.bolumler.find((x) => x.id === id); if (!b || !(V.bolum || {})[b.id]) return false;
      const vk = vz ? kavramBul(K, vz) : null, kv = (K.kavramlar || []).filter((k) => k.bolum === b.id && snKv(K, k.id)), sq = bolumSorulari(K, b).filter((s) => (V.soru || {})[s]);
      kirintiYaz(K, [['Sınav pusulası', '_sinav'], [kac(bolumAd(K, b)), null]]);
      $('#ck-baslik').innerHTML = `Sınav · ${kac(bolumAd(K, b))}<small>${vk ? `${kac(vk.ad)} · bölümün notu` : 'yalnız bu bölüm'}</small>`;
      if (ayni) return true;
      let h = vk ? `<div class="sn-ust-kv"><p><b>${kac(vk.sembol)} · ${kac(vk.ad)}</b>: bu kavramın ayrı sınav notu yok. Aşağıdaki not en yakın üst başlığın (bölüm); kavram geçtiği yerde işaretli.</p></div>` : '';
      h += snSeritHTML(K, V, b, false) + (V.akis || []).filter((a) => a.yer === `bol:${b.id}`).map((a) => snAkisHTML(K, a, true)).join('');
      if (kv.length) h += `<h3>Bu bölümün kavramları</h3><ul class="sn-sira sn-dz">${kv.map((k) => `<li${vk && vk.id === k.id ? ' class="sn-vurgu-li"' : ''}>${ckBag(`_sinav/kavram/${k.id}`, `${snNokta(snKv(K, k.id).olasilik, true)} <b>${kac(k.sembol)}</b> ${kac(k.ad)}`, 'soru-bag')}</li>`).join('')}</ul>`;
      if (sq.length) h += `<h3>Bu bölümün soruları</h3><ul class="sn-sira sn-dz">${sq.map((s) => `<li>${ckBag(`_sinav/soru/${s}`, `${snNokta(V.soru[s].olasilik, true)} <b>${s}</b> ${kac(kisalt(K.sorular[s].baslik, 60))}`, 'soru-bag')}</li>`).join('')}</ul>`;
      ckIc.innerHTML = h + tum();
      if (vk) snVurgula(ckIc, [vk.ad]);
      return true;
    }
    if (tur === 'soru') {
      const q = K.sorular[id], S = q && (V.soru || {})[id]; if (!S) return false;
      const b = K.bolumler.find((x) => x.ogeler.some((o) => o.tur === 'soru' && o.id === q.id));
      kirintiYaz(K, [['Sınav pusulası', '_sinav'], ...(b && (V.bolum || {})[b.id] ? [[kac(bolumAd(K, b)), `_sinav/bol/${b.id}`]] : []), [q.id, null]]);
      $('#ck-baslik').innerHTML = `Sınav · ${q.id}<small>${kac(kisalt(q.baslik, 60))} · yalnız bu soru</small>`;
      if (ayni) return true;
      ckIc.innerHTML = snNotHTML(K, S) + (V.akis || []).filter((a) => a.yer === `soru:${q.id}`).map((a) => snAkisHTML(K, a, true)).join('') + mkKesinAdimlar(K, (x) => x.id === q.id, 8) + tum(soruCip(K, q.id, true) + ' ');
      return true;
    }
    return false;
  }
  // Konu atlası tam sayfa
  function atlasSayfa(K) {
    const L = K.kavramlar || [], B = K.bolumler.filter((b) => bolumDolu(K, b)), on = `#${K.id}/kavram/k/`;
    document.title = `Konu atlası · ${K.kod}`;
    const git = [['_ag', 'Kavram ağı', L.length > 1], ['_sozluk', `Sözlük (${(K.sozluk || []).length})`, (K.sozluk || []).length], ['_terim', 'Terimler', terimVar(K)], ['_kars', 'Karşılaştır', L.length > 1 || czKars(K).length], ['_kesin', 'Kesin bil', kesinSay(K)], ['_sinav', 'Sınav pusulası', snVar(K)], ['_atlas', 'Yan çekmecede atlas', true]].filter((x) => x[2]);
    const satir = (k) => `<li class="kv-li"><a class="kv-sat" href="${on}${kac(k.id)}/tanim"><span class="sem">${kac(k.sembol)}</span><span class="ad">${kac(k.ad)}</span>${k.en ? `<span class="en" lang="en">${kac(k.en)}</span>` : ''}${rozetHTML(K, k)}</a></li>`;
    ana.innerHTML = `<div class="kitap-yer"><nav class="dizin" aria-label="Bölümler ve sorular">${dizinHTML(K, 'kavram')}</nav><div class="ka-sayfa">${takipHTML(K, null)}
      <h1>Konu atlası</h1><p class="ka-alt">${kac(K.kod)} · ${B.length} konu · ${L.length} kavram · ${Object.keys(K.sorular).length} soru</p>
      <ul class="ka-nasil"><li>Konu adına dokun: konu özeti ve formüller.</li><li>Kavrama dokun: yanda açılır (telefonda altta); bu sayfa yerinde kalır.</li></ul>
      <nav class="ka-git" aria-label="Atlas görünümleri">${git.map(([kp, ad]) => `<a class="ka-cip" href="${on}${kp}">${ad}</a>`).join('')}</nav>
      ${B.map((b) => { const kv = L.filter((k) => k.bolum === b.id), sq = bolumSorulari(K, b); return `<section class="at-bol ka-bol" data-bol="${kac(b.id)}"><h2><a href="#${K.id}/bol/${kac(b.id)}">${kac(bolumAd(K, b))}</a> <span class="say">${kv.length} kavram · ${sq.length} soru</span></h2>${kv.length ? `<ul class="kv-liste">${kv.map(satir).join('')}</ul>` : ''}${sq.length ? `<div class="soru-cipler"><span class="yok">Sorular:</span> ${sq.map((s) => soruCip(K, s)).join('')}</div>` : ''}</section>`; }).join('')}
    </div></div>`;
    ana.dataset.sayfa = 'kavram';
    glifDuzelt(ana); isrSusle(ana);
    takipBagla(K);
    sinavSusle(K);
  }
  // kavram ağı: liste görünümü (telefonda açık ve şeklin önünde; masada katlı, şeklin altında)
  function agListeHTML(K, L, E, bolIds, renk, kisa, dar) {
    const komsu = L.map(() => []); E.forEach(([i, j]) => { komsu[i].push(j); komsu[j].push(i); });
    return `<details class="ag-liste"${dar ? ' open' : ''}><summary>Liste: kavram kavram bağlar</summary>${bolIds.map((bid) => {
      const b = K.bolumler.find((x) => x.id === bid), I = L.map((k, i) => (k.bolum === bid ? i : -1)).filter((i) => i >= 0);
      return `<section class="ag-l-bol"><h4><span class="ag-l-nokta" style="background:${renk(bid)}"></span>${kac(b ? bolumAd(K, b) : bid)}</h4><ul>${I.map((i) => `<li>${ckBag(`${L[i].id}/tanim`, `<b>${kac(L[i].sembol)}</b> ${kac(L[i].ad)}`, 'ag-l-ad')}${komsu[i].length ? `<span class="ag-l-bag">${komsu[i].map((j) => ckBag(`${L[j].id}/tanim`, kac(kisa(L[j].ad)), 'ag-l-cip')).join('')}</span>` : ''}</li>`).join('')}</ul></section>`;
    }).join('')}</details>`;
  }
  window.__dkOnarim = { snHedef: (K, kp) => snHedef(K || simdiK, kp), vurgula: snVurgula }; // sınama kancası
  function bolumCk(K, bid, ayni) {
    const b = K.bolumler.find((x) => x.id === bid);
    if (!b) return atlasCk(K, false);
    const kv = (K.kavramlar || []).filter((k) => k.bolum === b.id), sq = bolumSorulari(K, b);
    kirintiYaz(K, [[kac(bolumAd(K, b)), `_bol/${b.id}`]]);
    $('#ck-baslik').innerHTML = `${kac(bolumAd(K, b))}<small>${kv.length} kavram · ${sq.length} soru</small>`;
    const dolu = K.bolumler.filter((x) => bolumDolu(K, x)), i = dolu.indexOf(b), o = dolu[i - 1], s = dolu[i + 1];
    $('#ck-sira').innerHTML = siraHTML(o && [`_bol/${o.id}`, kac(bolumAd(K, o))], `${i + 1} / ${dolu.length} bölüm`, s && [`_bol/${s.id}`, kac(bolumAd(K, s))]);
    $('#ck-sekme').innerHTML = ustSekme(K, '');
    if (ayni) return;
    const idler = new Set(kv.map((k) => k.id)), sz = (K.sozluk || []).filter((t) => (t.kavram || []).some((id) => idler.has(id)));
    ckIc.innerHTML = `${kv.length ? `<h3>Kavramlar</h3><ul class="kv-liste">${kv.map((k) => kavramSatir(K, k)).join('')}</ul>` : ''}
      ${sq.length ? `<h3>Sorular</h3><div class="ilgili">${sq.map((x) => soruCip(K, x, true)).join('')}</div>` : ''}
      ${b.ogeler.some((x) => x.tur !== 'soru') ? `<p><a class="soru-bag" href="#${K.id}/bol/${b.id}" data-ana="bol/${b.id}">Bölümün konu özeti ve formülleri (ana sayfada) →</a></p>` : ''}
      ${sz.length ? `<h3>Bu bölümün terimleri · TR ↔ EN</h3><div class="ilgili">${sz.map((t) => ckBag(`_sozluk/${t.en}`, `<span lang="en">${kac(t.en)}</span> · ${kac(t.tr)}`, 'soru-bag')).join('')}</div>` : ''}
      ${b.ogeler.filter((x) => x.tur === 'terim').map((x) => `<section class="bol-terim"><h3>${kac(x.baslik)}</h3>${x.html}</section>`).join('')}`;
    texDoldur(ckIc, K);
  }
  function szKart(K, s, ad) {
    if (!s) return `<div class="sz-kart"><p class="yok"><span lang="en">${kac(ad)}</span> sözlükte yok.</p></div>`;
    const kv = kvSira(K, s.kavram), tu = turEn(K, s.en);
    return `<article class="sz-kart"><h3><span lang="en">${kac(s.en)}</span> ${s.tur ? `<span class="tur">${kac(s.tur)}</span>` : ''}</h3>
      ${s.oku || s.ipa ? `<p class="oku-sat">${s.oku ? `<span class="oku">${kac(s.oku)}</span>` : ''}${s.ipa ? ` <span class="ipa" lang="en">/${kac(s.ipa)}/</span>` : ''}</p>` : ''}
      <p class="sz-tr"><i>${kac(s.tr)}</i></p>
      ${(s.es || []).length ? `<p><span class="yok">Birlikte kullanılır:</span> <span lang="en">${s.es.map(kac).join(' · ')}</span></p>` : ''}
      ${s.fark ? `<p class="sz-fark"><b>Fark:</b> ${kac(s.fark)}</p>` : ''}${s.ornek ? ciftHTML(s.ornek) : ''}
      ${(s.bak || []).length ? `<p class="sz-dug"><span class="yok">Karşılaştır:</span> ${s.bak.map((x) => ckBag(`_sozluk/${s.en}~${x}`, `<span lang="en">${kac(s.en)} ↔ ${kac(x)}</span>`, 'soru-bag')).join(' ')}</p>` : ''}
      ${tu ? `<p class="sz-dug"><span class="yok">Tür:</span> ${ckBag(`_tur/${tu.id}`, `Türü aç: <b>${kac(tu.f)}</b> · ${kac(iki(tu.ad).tr)}`, 'soru-bag')}</p>` : ''}
      ${kv.length ? `<p class="sz-dug"><span class="yok">Kavram:</span> ${kv.map((k) => ckBag(`${k.id}/${dilK(K, k.id) ? 'dil' : 'tanim'}`, `${kac(k.sembol)} · ${kac(k.ad)}`, 'soru-bag')).join(' ')}</p>` : ''}
      ${szTerimHTML(K, s)}${s.kaynak ? `<p class="yok sz-kaynak">Kaynak: ${kac(s.kaynak)}</p>` : ''}
      ${!s.tur && !s.fark && !s.ornek ? '<p class="yok">Bu terimin okunuşu, farkı ve örneği hazırlanıyor.</p>' : ''}</article>`;
  }
  function sozlukCk(K, ne, ayni) {
    const sz = [...(K.sozluk || [])].sort((a, b) => a.en.localeCompare(b.en, 'en'));
    $('#ck-sekme').innerHTML = ustSekme(K, ne ? '' : 'sozluk');
    if (!ne) {
      kirintiYaz(K, [['Sözlük', null]]);
      $('#ck-baslik').innerHTML = `Sözlük · TR ↔ EN<small>${sz.length} terim · dokun: anlamı, okunuşu, karıştırılan terimle farkı</small>`;
      $('#ck-sira').innerHTML = '';
      if (ayni) return;
      ckIc.innerHTML = `<ul class="sz-liste">${sz.map((s) => `<li>${ckBag(`_sozluk/${s.en}`, `<span class="en" lang="en">${kac(s.en)}</span>${s.tur ? `<span class="tur">${kac(s.tur)}</span>` : ''}<span class="tr">${kac(s.tr)}</span>`, 'sz-sat')}</li>`).join('')}</ul>`;
      return;
    }
    const [a, b] = ne.split('~'), A = szBul(K, a), B = b ? szBul(K, b) : null;
    kirintiYaz(K, [['Sözlük', '_sozluk'], [b ? `${kac(a)} ↔ ${kac(b)}` : kac(a), null]]);
    $('#ck-baslik').innerHTML = b ? `<span lang="en">${kac(a)}</span> ↔ <span lang="en">${kac(b)}</span><small>iki terim yan yana</small>` : `<span lang="en">${kac(A ? A.en : a)}</span><small>${kac(A ? A.tr : 'sözlükte yok')}</small>`;
    const i = A && !b ? sz.indexOf(A) : -1, o = sz[i - 1], s = i >= 0 ? sz[i + 1] : null;
    $('#ck-sira').innerHTML = i >= 0 ? siraHTML(o && [`_sozluk/${o.en}`, kac(o.en)], `${i + 1} / ${sz.length}`, s && [`_sozluk/${s.en}`, kac(s.en)]) : '';
    if (ayni) return;
    ckIc.innerHTML = b ? `<div class="sz-yan">${szKart(K, A, a)}${szKart(K, B, b)}</div>` : szKart(K, A, a);
  }
  function kavramCk(K, kid, parca, ayni, ek) {
    const k = kavramBul(K, kid);
    if (!k) return atlasCk(K, false);
    if (!parcaVar(K, k, parca)) parca = 'tanim';
    const D = dilK(K, k.id), b = K.bolumler.find((x) => x.id === k.bolum);
    const parcaAd = parca === 'sorular' ? 'Sorular' : parca === 'sinav' ? 'Sınav' : parca === 'dil' ? 'TR ↔ EN' : parca === 'kimya' ? 'Kimya' : parca === 'hesap' ? 'Hesapla' : (PAD[parca] || 'Tanım');
    kirintiYaz(K, [...(b ? [[kac(bolumAd(K, b)), `_bol/${b.id}`]] : []), [`${kac(k.sembol)} ${kac(k.ad)}`, `${k.id}/tanim`], [parcaAd, `${k.id}/${parca}`]]);
    const X = snKv(K, k.id);
    $('#ck-baslik').innerHTML = `${kac(k.sembol)} · ${kac(k.ad)}${X ? snNokta(X.olasilik, true) : ''}<small lang="en">${kac(k.en || '')}</small><span class="ck-dar-sekme"> · ${kac(parcaAd)}</span>`;
    const L = K.kavramlar || [], i = L.indexOf(k), o = L[i - 1], s = L[i + 1], kp = (x) => `${x.id}/${parcaVar(K, x, parca) ? parca : 'tanim'}`;
    $('#ck-sira').innerHTML = siraHTML(o && [kp(o), `${kac(o.sembol)} ${kac(o.ad)}`], `kavram ${i + 1} / ${L.length}`, s && [kp(s), `${kac(s.sembol)} ${kac(s.ad)}`]);
    const parcalar = PARCA.filter(([p]) => k.parcalar && k.parcalar[p]), taban = `#${ckDurum.onEk}/k/${k.id}/`;
    const sekme = ([p, ad]) => `<button type="button" role="tab" aria-selected="${p === parca}" data-git="${kac(taban + p)}">${ad}</button>`;
    $('#ck-sekme').innerHTML = [...parcalar.slice(0, 1), ...(X ? [['sinav', 'Sınav']] : []), ...(D ? [['dil', 'TR ↔ EN']] : []), ...(kimyaVar(K, k.id) ? [['kimya', 'Kimya']] : []), ...(kavramHesap(K, k.id).length ? [['hesap', 'Hesapla']] : []), ...parcalar.slice(1), ['sorular', `Sorular (${k.sorular.length})`]].map(sekme).join('');
    if (ayni) return;
    const ic = ckIc, P = k.parcalar[parca] || {};
    ckAdim = 1;
    if (parca === 'tanim') ic.innerHTML = (SV(K) ? (SV(K).akis || []).filter((a) => a.yer === `kavram:${k.id}`).map((a) => snAkisHTML(K, a, true)).join('') : '') + (P.html || '');
    else if (parca === 'sinav') ic.innerHTML = sinavKavramHTML(K, k);
    else if (parca === 'dil') ic.innerHTML = dilKavramHTML(K, k);
    else if (parca === 'kimya') { ic.innerHTML = kimyaKavramHTML(K, k); const d = kavramKimya(K, k.id).dongu[0]; if (d) donguKur(ic, K, d); }
    else if (parca === 'hesap') {
      const L = kavramHesap(K, k.id), h = L.find((x) => x.id === ek) || L[0];
      ic.innerHTML = `${L.length > 1 ? `<div class="hs-secim" role="group" aria-label="Araç seç"><span class="yok">Araç:</span>${L.map((x) => ckBag(`${k.id}/hesap/${x.id}`, kac(iki(x.ad).tr), `kucuk${x === h ? ' simdi' : ''}`)).join('')}</div>` : ''}${h.tur === 'eklenti' ? eklentiHTML(K, h, true) : hesapHTML(K, h, true)}<p class="dil-cagri">${ckBag('_hesap', 'Bütün araçlar: Hesap laboratuvarı →', 'soru-bag')}</p>`;
      if (h.tur === 'eklenti') eklentiKur(ic, K, h); else hesapKur(ic, h, null);
    }
    else if (parca === 'diyagram') { ic.innerHTML = `<div class="sekil-kap" id="ck-sekil"></div>${P.html || ''}`; if (window.Sekil[P.sekil]) window.Sekil[P.sekil]($('#ck-sekil'), P.ayar || {}); buyutDugmesi(); }
    else if (parca === 'formul') {
      ic.innerHTML = `<p class="isr-bas">${isr('kesin')}<span class="isr-neden">ana formül</span>${X && snN(X.olasilik) === 3 ? isr('ezber') : ''}</p><div class="formul-kap isr-k" data-tex="${P.tex}"></div><p class="yok" style="margin:10px 0 0">Bir terime bas: formülde yanar, anlamı aşağıda.</p><div class="terim-list">${(P.terimler || []).map((t, j) => `<button type="button" aria-pressed="false" data-t="${j}">${kac(t.sembol)}</button>`).join('')}</div><div class="terim-kart" id="terim-kart" hidden></div>${P.html || ''}`;
      texDoldur(ic, K);
      const sec = (j) => {
        const t = P.terimler[j];
        $$('.terim-list button', ic).forEach((x) => x.setAttribute('aria-pressed', String(+x.dataset.t === j)));
        $$('.formul-kap .on', ic).forEach((e) => e.classList.remove('on'));
        $$(`.formul-kap .${CSS.escape(t.id)}`, ic).forEach((e) => e.classList.add('on'));
        const kk = $('#terim-kart'); kk.hidden = false;
        kk.innerHTML = `<b style="font-size:20px">${kac(t.sembol)}</b> — ${kac(t.ad)}<dl><dt>Birim</dt><dd>${kac(t.birim)}</dd><dt>Anlamı</dt><dd>${t.anlam || ''}</dd>${t.tipik ? `<dt>Tipik değer</dt><dd>${kac(t.tipik)}</dd>` : ''}</dl>`;
      };
      $$('.terim-list button', ic).forEach((x) => x.addEventListener('click', () => sec(+x.dataset.t)));
      if ((P.terimler || []).length) sec(0);
    } else if (parca === 'ispat') {
      const n = (P.adimlar || []).length;
      ic.innerHTML = `${P.html || ''}<ol class="ispat">${P.adimlar.map((a, j) => `<li data-i="${j}" ${j >= ckAdim ? 'hidden' : ''}><div class="tex-blok" data-tex="${a.tex}"></div>${a.html || ''}</li>`).join('')}</ol><div class="kare-gez"><button type="button" class="dugme" id="isp-sonraki">Sonraki adım</button><button type="button" class="dugme ikincil" id="isp-hepsi">Hepsini göster</button><span class="yok" id="isp-say"></span></div>`;
      texDoldur(ic, K);
      const guncel = (yeniLi) => { $$('ol.ispat li', ic).forEach((li, j) => { const ac = j < ckAdim; if (ac && li.hidden && yeniLi) li.classList.add('yeni'); li.hidden = !ac; }); $('#isp-say').textContent = `${Math.min(ckAdim, n)} / ${n}`; $('#isp-sonraki').hidden = $('#isp-hepsi').hidden = ckAdim >= n; };
      $('#isp-sonraki').addEventListener('click', () => { ckAdim++; guncel(true); sbYeniGoster($$('ol.ispat li', ic)[ckAdim - 1]); });
      $('#isp-hepsi').addEventListener('click', () => { ckAdim = n; guncel(true); });
      guncel(false);
    } else if (parca === 'anim') {
      if (P.modul) { ic.innerHTML = `<div class="sekil-kap" id="ck-sekil"></div>${P.html || ''}`; if (window.Anim[P.modul]) animTutucu = window.Anim[P.modul]($('#ck-sekil'), P.ayar || {}); buyutDugmesi(); }
      else if (P.kareler) {
        const n = P.kareler.length;
        const kare = (j) => { ic.innerHTML = `${P.html || ''}<div class="kare-gez"><button type="button" class="kucuk" id="kr-geri" ${j === 0 ? 'disabled' : ''}>‹ Önceki</button><b>${j + 1} / ${n}</b><button type="button" class="dugme" id="kr-ileri" ${j === n - 1 ? 'disabled' : ''}>Sonraki ›</button></div><div class="sekil-kap" id="ck-sekil"></div>${P.kareler[j].html || ''}`; const kk = P.kareler[j]; if (window.Sekil[kk.sekil]) window.Sekil[kk.sekil]($('#ck-sekil'), kk.ayar || {}); buyutDugmesi(); $('#kr-geri').onclick = () => kare(j - 1); $('#kr-ileri').onclick = () => kare(j + 1); };
        kare(0);
      }
    } else if (parca === 'kod') {
      const sat = P.kod.split('\n');
      ic.innerHTML = `${P.html || ''}<pre class="kod" style="border-radius:12px">${sat.map((x, j) => `<span class="sat" data-s="${j + 1}"><span class="no">${j + 1}</span>${kac(x)}</span>`).join('')}</pre><h3>Satır satır</h3><ol class="ispat" style="counter-reset:none">${(P.satirlar || []).map(([no, a]) => `<li data-s="${no}" style="cursor:pointer"><b>Satır ${no}:</b> ${kac(a)}</li>`).join('')}</ol>`;
      $$('ol.ispat li', ic).forEach((li) => { li.style.setProperty('--x', 1); li.addEventListener('click', () => { $$('pre.kod .sat', ic).forEach((x) => x.classList.toggle('on', x.dataset.s === li.dataset.s)); }); });
      $$('ol.ispat li', ic).forEach((li) => li.classList.add('kod-satir'));
    } else if (parca === 'sorular') {
      ic.innerHTML = `<p>Bu kavramın geçtiği sorular (PDF sayfasıyla). Dokun: ana sayfada o soru açılır.</p><div class="ilgili">${k.sorular.map((x) => soruCip(K, x, true)).join('')}</div>`;
    }
    if ((K.kavramlar || []).length > 1) ic.insertAdjacentHTML('afterbegin', `<p class="kr-ekle-sat">${krEkleDug(K, k, false)}<span class="yok">yan yana görmek için 2–4 kavram seç</span></p>`);
    if ((k.dis || []).length) ic.insertAdjacentHTML('beforeend', `<h3>Akademi'de etkileşimli hâli</h3><div class="ilgili">${k.dis.map((d) => `<a class="soru-bag" href="${kac(d.url)}" target="_blank" rel="noopener">${kac(d.ad)} ↗</a>`).join('')}</div>`);
    const bag = (k.bag || []).map((id) => kavramBul(K, id)).filter(Boolean);
    if (bag.length) ic.insertAdjacentHTML('beforeend', `<h3>İlgili kavramlar</h3><div class="ilgili">${bag.map((x) => ckBag(`${x.id}/tanim`, `${kac(x.sembol)} · ${kac(x.ad)}`, 'soru-bag')).join('')}</div>`);
    if (D && parca !== 'dil') ic.insertAdjacentHTML('beforeend', `<p class="dil-cagri">${ckBag(`${k.id}/dil`, 'TR ↔ EN: bu kavramın İngilizcesi, karşılaştırma ve sınav kalıpları →', 'soru-bag')}</p>`);
    if (TV[K.id]) ic.insertAdjacentHTML('beforeend', kavramTerimHTML(K, k));
    $$('[data-tex]', ic).length && texDoldur(ic, K);
  }

  /* ---------- DK323: hesap laboratuvarı + kimya gezgini ----------
     Veri (tools/ek_birlestir.mjs): K.hesap = {hesap: [araç]}, K.kimya = {aile, tur, tepkime, dongu}. Veri yoksa hiçbir şey görünmez.
     Çekmece: _hesap · _hesap/<araç>[/<hazır sırası | soru>] · _tur · _tur/<id> · _tepkime · _tepkime/<id> · _dongu · _dongu/<id>
     Kavram parçaları: <kavram>/kimya · <kavram>/hesap[/<araç>] */
  const HS = (K) => (K && K.hesap && Array.isArray(K.hesap.hesap) ? K.hesap.hesap : []);
  const KM = (K) => (K && K.kimya && typeof K.kimya === 'object' ? K.kimya : {});
  const turlar = (K) => KM(K).tur || [];
  const tepkimeler = (K) => KM(K).tepkime || [];
  const donguler = (K) => KM(K).dongu || [];
  const aileler = (K) => KM(K).aile || [];
  const turBul = (K, id) => turlar(K).find((t) => t.id === id);
  const tepkimeBul = (K, id) => tepkimeler(K).find((r) => r.id === id);
  const donguBul = (K, id) => donguler(K).find((d) => d.id === id);
  const hesapBul = (K, id) => HS(K).find((h) => h.id === id);
  const icer = (o, alan, id) => Array.isArray(o[alan]) && o[alan].includes(id);
  const kavramHesap = (K, kid) => HS(K).filter((h) => icer(h, 'kavram', kid));
  const soruHesap = (K, sid) => HS(K).filter((h) => icer(h, 'soru', sid) || (h.hazir || []).some((z) => z.soru === sid));
  const kavramKimya = (K, kid) => ({ tur: turlar(K).filter((t) => icer(t, 'kavram', kid)), tepkime: tepkimeler(K).filter((r) => icer(r, 'kavram', kid)), dongu: donguler(K).filter((d) => icer(d, 'kavram', kid)) });
  const kimyaVar = (K, kid) => { const x = kavramKimya(K, kid); return x.tur.length + x.tepkime.length + x.dongu.length > 0; };
  const iki = (o) => (o && typeof o === 'object' ? { tr: o.tr || '', en: o.en || '' } : { tr: String(o ?? ''), en: '' });
  const ikiSat = (o) => { const x = iki(o); return `<span class="iki-tr">${kac(x.tr)}</span>${x.en ? ` <span class="iki-en" lang="en">${kac(x.en)}</span>` : ''}`; };
  // kavram düğmeleri atlas sırasında (sözlük kartı, tür kartı, araçlar)
  const kvSira = (K, ids) => { const L = K.kavramlar || []; return [...new Set(ids || [])].map((id) => kavramBul(K, id)).filter(Boolean).sort((a, b) => L.indexOf(a) - L.indexOf(b)); };
  const enNorm = (s) => String(s || '').toLowerCase().replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
  const turEn = (K, en) => { const a = enNorm(en); return a ? turlar(K).find((t) => enNorm(iki(t.ad).en) === a) || null : null; };
  const TIP_AD = { fotoliz: ['fotoliz', 'photolysis'], 'iki-cisim': ['iki cisimli', 'bimolecular'], 'uc-cisim': ['üç cisimli (M)', 'termolecular (M)'], heterojen: ['heterojen', 'heterogeneous'], 'sulu-denge': ['sulu denge', 'aqueous equilibrium'], cozunme: ['çözünme', 'dissolution'], notrlesme: ['nötrleşme', 'neutralization'], net: ['net tepkime', 'net reaction'] };
  const tipAd = (t) => (TIP_AD[t] || [t || ''])[0];

  /* sembol ve sayı yazımı: k_B → k<sub>B</sub>; TR'de ondalık virgül; bilim biçimi a × 10ⁿ */
  const UST = { '-': '⁻', '+': '⁺', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
  const ALT_UST = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+' };
  const ustYaz = (n) => String(n).replace(/[-+0-9]/g, (c) => UST[c]);
  const semHTML = (s) => kac(s).replace(/_\{([^}]*)\}|_([\p{L}\p{N}]+)/gu, (m, a, b) => `<sub>${a ?? b}</sub>`).replace(/\^\{([^}]*)\}|\^(-?[\p{L}\p{N}.]+)/gu, (m, a, b) => `<sup>${a ?? b}</sup>`);
  const ondalik = (v, b) => { const s = Math.abs(v).toFixed(Math.max(0, Math.min(10, b))); return (v < 0 && +s !== 0 ? '−' : '') + s.replace('.', ','); };
  // bicim: bilim → «basamak» anlamlı basamak (a × 10ⁿ) · ondalik → «basamak» ondalık · yuzde → f kesir verir, %·100 yazılır
  function sayiBicim(v, bicim, basamak) {
    if (typeof v !== 'number' || !isFinite(v)) return '—';
    const a = Math.abs(v);
    if (bicim === 'yuzde') return `%${ondalik(v * 100, basamak ?? 1)}`;
    if (bicim === 'bilim' || (bicim !== 'ondalik' && a !== 0 && (a >= 1e5 || a < 1e-3))) {
      if (a === 0) return '0';
      const b = Math.max(1, Math.min(8, basamak ?? 3));
      let us = Math.floor(Math.log10(a)), m = (a / 10 ** us).toFixed(b - 1);
      if (+m >= 10) { us++; m = (a / 10 ** us).toFixed(b - 1); }
      return `${v < 0 ? '−' : ''}${m.replace('.', ',')}${us ? ` × 10${ustYaz(us)}` : ''}`;
    }
    return ondalik(v, basamak ?? (a === 0 ? 0 : Math.min(6, Math.max(0, 2 - Math.floor(Math.log10(a))))));
  }
  // oran: üç anlamlı basamak (2,00 · 0,500 · 40,0)
  const oranYaz = (x) => { if (typeof x !== 'number' || !isFinite(x)) return '—'; const a = Math.abs(x); if (a === 0) return '0'; if (a >= 1e5 || a < 1e-3) return sayiBicim(x, 'bilim', 3); return ondalik(x, Math.max(0, 2 - Math.floor(Math.log10(a)))); };
  const kisaSayi = (v) => { if (typeof v !== 'number' || !isFinite(v)) return String(v ?? ''); const a = Math.abs(v); return a !== 0 && (a >= 1e5 || a < 1e-3) ? sayiBicim(v, 'bilim', 4).replace(/(,\d*?)0+( ×|$)/, '$1$2').replace(/,( ×|$)/, '$1') : String(+v.toPrecision(6)).replace('.', ',').replace('-', '−'); };
  const girdiYaz = (v) => { if (typeof v !== 'number' || !isFinite(v)) return ''; const a = Math.abs(v); if (a !== 0 && (a >= 1e5 || a < 1e-3)) { const [m, e] = v.toExponential(3).split('e'); return `${String(+m).replace('.', ',')}e${+e}`; } return String(+v.toPrecision(6)).replace('.', ','); };
  // «2,45e-12», «2.45E-12», «2,45 × 10⁻¹²», «2,45x10^-12» hepsi okunur
  function sayiOku(s) {
    const t = String(s ?? '').trim().replace(/[−–]/g, '-').replace(/\s+/g, '').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]/g, (c) => ALT_UST[c]).replace(',', '.');
    const m = /^([+-]?(?:\d+\.?\d*|\.\d+))(?:[eE]([+-]?\d+)|[×x*·]10\^?([+-]?\d+))?$/.exec(t);
    return m ? +`${m[1]}e${m[2] ?? m[3] ?? 0}` : NaN;
  }

  /* --- hesap laboratuvarı: f = JS ifadesi (girdi, sabit, önceki çıktı kimlikleri + aşağıdaki adlar; Math.* de geçer) --- */
  const MATEMATIK = { exp: Math.exp, log: Math.log, ln: Math.log, log10: Math.log10, log2: Math.log2, sqrt: Math.sqrt, cbrt: Math.cbrt, pow: Math.pow, abs: Math.abs, min: Math.min, max: Math.max, round: Math.round, floor: Math.floor, ceil: Math.ceil, sin: Math.sin, cos: Math.cos, tan: Math.tan, PI: Math.PI, E: Math.E };
  const HFN = new WeakMap(), HDEG = {};
  const nesneli = (g) => (g.secenek || []).some((s) => s && s.deger && typeof s.deger === 'object');
  function hesapFn(h) {
    let F = HFN.get(h); if (F) return F;
    const ek = new Set();
    (h.girdi || []).forEach((g) => { if (nesneli(g)) g.secenek.forEach((s) => { if (s && s.deger && typeof s.deger === 'object') Object.keys(s.deger).forEach((a) => ek.add(a)); }); });
    const adlar = [...new Set([...Object.keys(MATEMATIK), ...(h.sabit || []).map((s) => s.id), ...(h.girdi || []).map((g) => g.id), ...ek, ...(h.cikti || []).map((o) => o.id)])];
    const fns = (h.cikti || []).map((o) => { try { return new Function(...adlar, `"use strict";return (${o.f});`); } catch (e) { return () => NaN; } });
    F = { adlar, fns }; HFN.set(h, F); return F;
  }
  function hesapCalis(h, v) {
    const { adlar, fns } = hesapFn(h), c = { ...MATEMATIK }, out = {};
    (h.sabit || []).forEach((s) => { c[s.id] = s.deger; });
    (h.girdi || []).forEach((g) => { const x = v[g.id]; if (nesneli(g)) { const s = g.secenek[x] || g.secenek[0]; if (s && s.deger && typeof s.deger === 'object') Object.assign(c, s.deger); } c[g.id] = x; });
    (h.cikti || []).forEach((o, i) => { let r; try { r = fns[i](...adlar.map((a) => c[a])); } catch (e) { r = NaN; } c[o.id] = out[o.id] = typeof r === 'number' ? r : NaN; });
    return out;
  }
  const girdiVars = (g) => (g.vars ?? (nesneli(g) ? 0 : ((g.secenek || [])[0] || {}).deger ?? g.min ?? 0));
  function hesapDurum(h) {
    if (!HDEG[h.id]) HDEG[h.id] = { v: Object.fromEntries((h.girdi || []).map((g) => [g.id, girdiVars(g)])), A: null, hz: -1, son: null };
    return HDEG[h.id];
  }
  function hazirUygula(h, d, i) {
    const z = (h.hazir || [])[i]; if (!z) return;
    (h.girdi || []).forEach((g) => { d.v[g.id] = (z.deger || {})[g.id] ?? girdiVars(g); });
    d.hz = i;
  }
  const hazirSira = (h, x) => { if (x == null || x === '') return null; if (/^\d+$/.test(x)) return +x < (h.hazir || []).length ? +x : null; const i = (h.hazir || []).findIndex((z) => z.soru === x); return i >= 0 ? i : null; };
  const esitMi = (a, b) => a === b || (typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= 1e-9 * Math.max(Math.abs(a), Math.abs(b)));
  const hazirEtkin = (h, d) => { const z = (h.hazir || [])[d.hz]; return !!z && (h.girdi || []).every((g) => esitMi(d.v[g.id], (z.deger || {})[g.id] ?? girdiVars(g))); };
  const girdiDeger = (g, v) => ((g.secenek || []).length ? kac(iki((nesneli(g) ? g.secenek[v] : g.secenek.find((s) => esitMi(s.deger, v)))?.ad).tr || String(v)) : `${kisaSayi(v)}${g.birim ? ' ' + kac(g.birim) : ''}`);
  // formül metni: girdi / sabit / çıktı sembolleri terim olarak işaretlenir (değişen girdi parlar)
  function formulHTML(h) {
    const S = [...(h.cikti || []).map((o) => [o.sembol || o.id, o.id, 'c']), ...(h.girdi || []).map((g) => [g.sembol || g.id, g.id, 'g']), ...(h.sabit || []).map((s) => [s.sembol || s.id, s.id, 's'])].filter((x) => x[0]).sort((a, b) => b[0].length - a[0].length);
    const t = String(h.formul || ''), sinir = (c) => !c || !/[\p{L}\p{N}_₀-₉ₐ-ₜ]/u.test(c);
    let out = '', duz = '';
    for (let i = 0; i < t.length;) {
      const m = S.find(([s]) => t.startsWith(s, i) && sinir(t[i - 1]) && sinir(t[i + s.length]));
      if (m) { out += semHTML(duz); duz = ''; out += `<span class="hf-t hf-${m[2]}" data-s="${kac(m[1])}">${semHTML(m[0])}</span>`; i += m[0].length; } else { duz += t[i]; i++; }
    }
    return out + semHTML(duz);
  }
  function girdiHTML(h, g) {
    const uid = `hs-${h.id}-${g.id}`, ad = iki(g.ad);
    const etiket = `<label for="${kac(uid)}"><span class="hs-sem">${semHTML(g.sembol || g.id)}</span> <span class="hs-gad">${kac(ad.tr)}</span>${ad.en ? ` <i class="hs-gen" lang="en">${kac(ad.en)}</i>` : ''}</label>`;
    if ((g.secenek || []).length) return `<div class="hs-g" data-g="${kac(g.id)}">${etiket}<div class="hs-g-sat"><select id="${kac(uid)}" class="hs-sec">${g.secenek.map((s, i) => { const x = iki(s.ad); return `<option value="${i}">${kac(x.tr)}${x.en ? ` · ${kac(x.en)}` : ''}</option>`; }).join('')}</select>${g.birim ? `<span class="hs-birim">${kac(g.birim)}</span>` : ''}</div></div>`;
    const lg = !!g.log && g.min > 0 && g.max > 0, a = lg ? Math.log10(g.min) : +g.min, b = lg ? Math.log10(g.max) : +g.max;
    const adim = lg ? (b - a) / 400 : (+g.adim > 0 ? +g.adim : (b - a) / 200);
    return `<div class="hs-g" data-g="${kac(g.id)}">${etiket}<div class="hs-g-sat"><input type="range" class="hs-sur" min="${a}" max="${b}" step="${adim}" aria-label="${kac(ad.tr)}: sürgü${lg ? ' (logaritmik ölçek)' : ''}"${lg ? ' data-log="1"' : ''}><input type="text" id="${kac(uid)}" class="hs-sayi" inputmode="decimal" autocomplete="off" spellcheck="false"><span class="hs-birim">${kac(g.birim || '')}</span></div><span class="hs-ara yok">${kisaSayi(+g.min)} – ${kisaSayi(+g.max)}${lg ? ' · log ölçek' : ''}</span></div>`;
  }
  function hesapHTML(K, h, baslik) {
    const ad = iki(h.ad), kv = kvSira(K, h.kavram);
    const sq = [...new Set([...(h.soru || []), ...(h.hazir || []).map((z) => z.soru).filter(Boolean)])].filter((s) => K.sorular[s]);
    return `<section class="hs" data-hs="${kac(h.id)}" aria-label="Hesap aracı: ${kac(ad.tr)}">
      ${baslik ? `<h3 class="hs-bas">${kac(ad.tr)}${ad.en ? ` <small lang="en">${kac(ad.en)}</small>` : ''}</h3>` : ''}
      <div class="hs-ust"><div class="hs-formul">${formulHTML(h)}</div>
        <div class="hs-cikti">${(h.cikti || []).map((o) => `<div class="hs-c" data-c="${kac(o.id)}"><span class="hs-cust"><span class="hs-csem">${semHTML(o.sembol || o.id)}</span> = <output class="hs-deger"></output> <span class="hs-birim">${kac(o.birim || '')}</span></span><span class="hs-cad">${kac(iki(o.ad).tr)}${iki(o.ad).en ? ` · <i lang="en">${kac(iki(o.ad).en)}</i>` : ''}</span><span class="hs-kitap" hidden></span><span class="hs-oran" hidden></span></div>`).join('')}</div></div>
      ${(h.hazir || []).length ? `<div class="hs-hazir" role="group" aria-label="Hazır değerler: kitaptaki sorular"><span class="yok">Hazır:</span>${h.hazir.map((z, i) => `<button type="button" class="kucuk" data-hz="${i}" aria-pressed="false">${kac(z.ad)}</button>`).join('')}</div>` : ''}
      <div class="hs-girdiler">${(h.girdi || []).map((g) => girdiHTML(h, g)).join('')}</div>
      <div class="hs-ab"><button type="button" class="kucuk hs-sabitle" aria-pressed="false">A'yı sabitle → B ile karşılaştır</button><button type="button" class="kucuk hs-basa">Başa al</button></div>
      <div class="hs-kars" aria-live="polite" hidden></div>
      ${(h.sabit || []).length ? `<p class="hs-sabitler"><span class="yok">Sabitler:</span> ${h.sabit.map((s) => `<span class="hs-sb">${semHTML(s.sembol || s.id)} = ${kisaSayi(s.deger)} ${kac(s.birim || '')} <i class="yok">(${kac(iki(s.ad).tr)})</i></span>`).join(' · ')}</p>` : ''}
      ${(h.yorum || []).length ? `<h4 class="hs-h4">Ne değişirse ne olur?</h4>${h.yorum.map((y) => ciftHTML(iki(y))).join('')}` : ''}
      ${kv.length || sq.length ? `<div class="ilgili">${kv.map((k) => ckBag(`${k.id}/tanim`, `${kac(k.sembol)} · ${kac(k.ad)}`, 'soru-bag')).join('')}${sq.map((s) => soruCip(K, s)).join('')}</div>` : ''}
    </section>`;
  }
  function hesapKur(kok, h, hz, ovr) {
    const sek = $$('.hs', kok).find((x) => x.dataset.hs === h.id); if (!sek) return;
    const d = hesapDurum(h), G = h.girdi || [];
    if (hz != null) { hazirUygula(h, d, hz); d.son = null; }
    // ETK Ö5 «Şöyle olsaydı?»: /_hesap/<araç>/<hazır|->/<girdi>=<değer>,… → A = sorunun değerleri, B = değişen değerler (B/A görünür)
    if (ovr) {
      if (hz == null) { G.forEach((g) => { d.v[g.id] = girdiVars(g); }); d.hz = -1; }
      const deg = {};
      String(ovr).split(',').forEach((p) => { const [g, v] = p.split('='), x = sayiOku(v); if (g && isFinite(x) && G.some((y) => y.id === g)) deg[g] = x; });
      if (Object.keys(deg).length) { d.A = { ...d.v }; Object.assign(d.v, deg); d.son = Object.keys(deg)[0]; }
    }
    const kutu = (gid) => $$('.hs-g', sek).find((x) => x.dataset.g === gid);
    let ilk = true;
    function girdiGoster(g, kaynak) {
      const k = kutu(g.id); if (!k) return;
      const v = d.v[g.id], sur = $('.hs-sur', k), say = $('.hs-sayi', k), sec = $('.hs-sec', k);
      if (sec) { sec.value = String(nesneli(g) ? v : Math.max(0, g.secenek.findIndex((s) => esitMi(s.deger, v)))); return; }
      if (sur && kaynak !== sur) sur.value = String(sur.dataset.log ? Math.log10(Math.max(v, 1e-300)) : v);
      if (say && kaynak !== say) { say.value = girdiYaz(v); say.removeAttribute('aria-invalid'); }
    }
    const yak = (gid) => $$('.hf-t', sek).forEach((x) => x.classList.toggle('on', !!gid && x.dataset.s === gid));
    function guncelle() {
      const c = hesapCalis(h, d.v), etkin = hazirEtkin(h, d), z = etkin ? h.hazir[d.hz] : null, Ac = d.A ? hesapCalis(h, d.A) : null;
      (h.cikti || []).forEach((o) => {
        const k = $$('.hs-c', sek).find((x) => x.dataset.c === o.id); if (!k) return;
        const yeni = sayiBicim(c[o.id], o.bicim, o.basamak), out = $('.hs-deger', k);
        if (out.textContent !== yeni) { out.textContent = yeni; if (!ilk) { k.classList.remove('yeni'); void k.offsetWidth; k.classList.add('yeni'); } }
        const kt = $('.hs-kitap', k), b = z && z.beklenen ? z.beklenen[o.id] : undefined;
        if (typeof b === 'number') { const ok = Math.abs(c[o.id] - b) <= 0.005 * Math.abs(b); kt.hidden = false; kt.className = `hs-kitap ${ok ? 'dogru' : 'yanlis'}`; kt.textContent = `kitapta: ${sayiBicim(b, o.bicim, o.basamak)} ${ok ? '✓' : '✗'}`; } else kt.hidden = true;
        const or = $('.hs-oran', k);
        if (Ac) { const a = Ac[o.id]; or.hidden = false; or.textContent = `B/A = ${a ? oranYaz(c[o.id] / a) : '—'}`; } else or.hidden = true;
      });
      $$('.hs-hazir button', sek).forEach((x) => x.setAttribute('aria-pressed', String(etkin && +x.dataset.hz === d.hz)));
      const kars = $('.hs-kars', sek), sb = $('.hs-sabitle', sek);
      sb.setAttribute('aria-pressed', String(!!d.A)); sb.textContent = d.A ? 'A’yı bırak' : 'A’yı sabitle → B ile karşılaştır';
      if (Ac) {
        const deg = G.filter((g) => !esitMi(d.A[g.id], d.v[g.id]));
        kars.hidden = false;
        kars.innerHTML = `<p class="hs-kars-b"><b>A</b> sabitlenen · <b>B</b> şimdiki değerler${deg.length ? ` · değişen: ${deg.map((g) => `${semHTML(g.sembol || g.id)} ${girdiDeger(g, d.A[g.id])} → ${girdiDeger(g, d.v[g.id])}`).join(', ')}` : ' · bir girdiyi değiştir, B/A oranı görünür'}</p><div class="tablo-kap"><table class="hs-kt"><thead><tr><th scope="col">Çıktı</th><th scope="col">A</th><th scope="col">B</th><th scope="col">B/A</th></tr></thead><tbody>${(h.cikti || []).map((o) => `<tr><th scope="row">${semHTML(o.sembol || o.id)}</th><td>${sayiBicim(Ac[o.id], o.bicim, o.basamak)}</td><td>${sayiBicim(c[o.id], o.bicim, o.basamak)}</td><td><b>${Ac[o.id] ? oranYaz(c[o.id] / Ac[o.id]) : '—'}</b></td></tr>`).join('')}</tbody></table></div>`;
      } else { kars.hidden = true; kars.innerHTML = ''; }
      ilk = false;
    }
    G.forEach((g) => {
      const k = kutu(g.id); if (!k) return;
      const sur = $('.hs-sur', k), say = $('.hs-sayi', k), sec = $('.hs-sec', k);
      const degisti = (kaynak) => { d.son = g.id; girdiGoster(g, kaynak); yak(g.id); guncelle(); };
      if (sur) sur.addEventListener('input', () => { const x = +sur.value; let v = sur.dataset.log ? 10 ** x : x; v = sur.dataset.log ? +v.toPrecision(3) : (+g.adim > 0 ? +(Math.round(v / g.adim) * g.adim).toPrecision(12) : +v.toPrecision(6)); d.v[g.id] = v; degisti(sur); });
      if (say) {
        say.addEventListener('input', () => { const v = sayiOku(say.value); if (!isFinite(v) || (sur && sur.dataset.log && v <= 0)) { say.setAttribute('aria-invalid', 'true'); return; } say.removeAttribute('aria-invalid'); d.v[g.id] = v; degisti(say); });
        say.addEventListener('change', () => girdiGoster(g, null));
        say.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); girdiGoster(g, null); } });
      }
      if (sec) sec.addEventListener('change', () => { const i = +sec.value; d.v[g.id] = nesneli(g) ? i : g.secenek[i].deger; degisti(sec); });
      [sur, say, sec].forEach((x) => x && x.addEventListener('focus', () => yak(g.id)));
    });
    const hzKap = $('.hs-hazir', sek);
    if (hzKap) hzKap.addEventListener('click', (e) => { const b = e.target.closest('[data-hz]'); if (!b) return; hazirUygula(h, d, +b.dataset.hz); d.son = null; G.forEach((g) => girdiGoster(g, null)); yak(null); guncelle(); });
    $('.hs-sabitle', sek).addEventListener('click', () => { d.A = d.A ? null : { ...d.v }; guncelle(); });
    $('.hs-basa', sek).addEventListener('click', () => { G.forEach((g) => { d.v[g.id] = girdiVars(g); }); d.hz = -1; d.son = null; G.forEach((g) => girdiGoster(g, null)); yak(null); guncelle(); });
    G.forEach((g) => girdiGoster(g, null)); yak(d.son); guncelle();
  }
  function hesapCk(K, ne, ayni) {
    const L = HS(K);
    if (!L.length) return atlasCk(K, ayni);
    $('#ck-sekme').innerHTML = ustSekme(K, ne ? '' : 'hesap');
    const [id, hz, ovr] = String(ne || '').split('/'), h = id ? hesapBul(K, id) : null;
    if (!h) {
      kirintiYaz(K, [['Hesap laboratuvarı', null]]);
      $('#ck-baslik').innerHTML = `Hesap laboratuvarı<small>${L.length} araç · sürgüyle oyna, kitaptaki değerle karşılaştır</small>`;
      $('#ck-sira').innerHTML = '';
      if (ayni) return;
      const bolOf = (x) => { const k = kvSira(K, x.kavram)[0]; return k ? k.bolum : ''; };
      const gruplar = [...K.bolumler.map((b) => [bolumAd(K, b), L.filter((x) => bolOf(x) === b.id)]), ['Genel araçlar', L.filter((x) => !bolOf(x))]].filter(([, l]) => l.length);
      ckIc.innerHTML = `<p class="ck-not">Bir araca dokun: girdiyi sürgüyle ya da kutuya yazarak değiştir, çıktı anında güncellenir. «Hazır» düğmeleri kitaptaki sorunun değerlerini getirir ve sonucu kitapla karşılaştırır.</p>${gruplar.map(([bas, l]) => `<section class="at-bol"><h3>${kac(bas)} <span class="say">${l.length} araç</span></h3><ul class="kv-liste">${l.map((x) => `<li>${ckBag(`_hesap/${x.id}`, `<span class="ad">${kac(iki(x.ad).tr)}</span><span class="en" lang="en">${kac(iki(x.ad).en)}</span><span class="hs-lf">${x.tur === 'eklenti' ? kac(iki(x.aciklama).tr || 'etkileşimli araç') : semHTML(x.formul || '')}</span>`, 'kv-sat')}</li>`).join('')}</ul></section>`).join('')}`;
      return;
    }
    kirintiYaz(K, [['Hesap laboratuvarı', '_hesap'], [kac(iki(h.ad).tr), null]]);
    $('#ck-baslik').innerHTML = `${kac(iki(h.ad).tr)}<small lang="en">${kac(iki(h.ad).en)}</small>`;
    const i = L.indexOf(h), o = L[i - 1], s = L[i + 1];
    $('#ck-sira').innerHTML = siraHTML(o && [`_hesap/${o.id}`, kac(iki(o.ad).tr)], `araç ${i + 1} / ${L.length}`, s && [`_hesap/${s.id}`, kac(iki(s.ad).tr)]);
    if (ayni) return;
    if (h.tur === 'eklenti') { ckIc.innerHTML = eklentiHTML(K, h, false); eklentiKur(ckIc, K, h); return; }
    ckIc.innerHTML = hesapHTML(K, h, false);
    hesapKur(ckIc, h, hazirSira(h, hz), ovr);
  }

  /* --- kimya gezgini: tür kartı, tepkime kartı, çevrim çizimi (SVG; düğüm = tür, ok = tepkime; adım adım) --- */
  function turEsle(K) { // formül ve «ara» yazımı → tür (önce f)
    if (turEsle.K === K) return turEsle.m;
    const m = new Map();
    turlar(K).forEach((t) => { if (t.f && !m.has(t.f)) m.set(t.f, t); });
    turlar(K).forEach((t) => (t.ara || []).forEach((a) => { if (a && !m.has(a)) m.set(a, t); }));
    turEsle.K = K; turEsle.m = m; return m;
  }
  // denklem: içindeki türler tür kartına bağlanır (katsayı ve faz eki korunur; hν, M düz yazı)
  function denkHTML(K, r) {
    const m = turEsle(K), ic = [...(r.sol || []), ...(r.sag || [])].map((id) => turBul(K, id)).filter(Boolean);
    return String(r.denk || '').split(/(\s*(?:→|⟶|⇌|⇄|↔|=)\s*)/).map((yan, j) => (j % 2 ? `<span class="dk-ok">${kac(yan.trim())}</span>` : yan.split(/(\s\+\s)/).map((p, i) => {
      if (i % 2) return ' + ';
      const x = /^(\s*\d+(?:[.,]\d+)?\s*)?(.*?)(\s*\((?:g|aq|s|l|k)\))?\s*$/u.exec(p) || [];
      const kat = x[1] || '', ad = (x[2] || '').trim(), faz = x[3] || '';
      const t = ic.find((u) => u.f === ad || (u.ara || []).includes(ad)) || m.get(ad);
      const govde = `${kac(kat)}${kac(ad)}${kac(faz)}`;
      return t ? ckBag(`_tur/${t.id}`, govde, 'dk-tur') : `<span class="dk-p">${govde}</span>`;
    }).join(''))).join(' ');
  }
  const turCip = (K, t, simdi) => ckBag(`_tur/${t.id}`, `<span class="f">${kac(t.f)}</span><span class="ad">${kac(iki(t.ad).tr)}</span>`, `tur-cip${simdi ? ' simdi' : ''}`);
  const tepkimeSatir = (K, r, rol) => `<li data-r="${kac(r.id)}">${ckBag(`_tepkime/${r.id}`, `<span class="tp-id">${kac(r.id)}</span><span class="tp-denk">${kac(r.denk)}</span><span class="tp-alt">${kac(iki(r.ad).tr)}${r.tip ? ` · ${kac(tipAd(r.tip))}` : ''}${rol ? ` · <b>${kac(rol)}</b>` : ''}${r.kitapta === false ? ' · <i>kitap dışı adım</i>' : ''}</span>`, 'tp-sat')}</li>`;
  const kavramCipleri = (K, ids, parca) => { const kv = kvSira(K, ids); return kv.length ? `<h3>Kavramlar</h3><div class="ilgili">${kv.map((k) => ckBag(`${k.id}/${parca && parcaVar(K, k, parca) ? parca : 'tanim'}`, `${kac(k.sembol)} · ${kac(k.ad)}`, 'soru-bag')).join('')}</div>` : ''; };
  const soruCipleri = (K, ids) => { const s = (ids || []).filter((x) => K.sorular[x]); return s.length ? `<h3>Sorular</h3><p class="ck-not">Dokun: ana sayfada o soru açılır, çekmece açık kalır.</p><div class="ilgili">${s.map((x) => soruCip(K, x, true)).join('')}</div>` : ''; };
  function turKartHTML(K, t) {
    const ad = iki(t.ad), sn = iki(t.sinif);
    const ail = (t.aile || []).map((a) => aileler(K).find((x) => x.id === a)).filter(Boolean);
    const icTp = tepkimeler(K).filter((r) => icer(r, 'sol', t.id) || icer(r, 'sag', t.id));
    const dg = donguler(K).filter((d) => (d.dugum || []).some((x) => x.tur === t.id));
    const sz = (K.sozluk || []).find((s) => turEn(K, s.en) === t);
    const tpCip = (ids) => (ids || []).map((id) => tepkimeBul(K, id)).filter(Boolean).map((r) => ckBag(`_tepkime/${r.id}`, `<b>${kac(r.id)}</b> ${kac(r.denk)}`, 'tp-cip')).join('');
    const yol = (liste, bas) => ((liste || []).length ? `<h3>${bas}</h3><ul class="tk-liste">${liste.map((u) => `<li>${ciftHTML(iki(u))}${(u.tepkime || []).length ? `<div class="tp-cipler">${tpCip(u.tepkime)}</div>` : ''}</li>`).join('')}</ul>` : '');
    const rolu = (r) => (icer(r, 'sol', t.id) && icer(r, 'sag', t.id) ? 'iki yanda' : icer(r, 'sol', t.id) ? 'harcanır' : 'oluşur');
    return `<article class="tk">
      <div class="tk-bas"><span class="tk-f">${kac(t.f)}</span><div class="tk-adlar"><p class="tk-ad"><b>${kac(ad.tr)}</b>${ad.en ? ` <span lang="en">${kac(ad.en)}</span>` : ''}</p>${t.oku || t.ipa ? `<p class="oku-sat">${t.oku ? `<span class="oku">${kac(t.oku)}</span>` : ''}${t.ipa ? ` <span class="ipa" lang="en">/${kac(t.ipa)}/</span>` : ''}</p>` : ''}${sn.tr ? `<p class="tk-sinif"><span class="tur">${kac(sn.tr)}</span>${sn.en ? ` <span class="tur" lang="en">${kac(sn.en)}</span>` : ''}</p>` : ''}</div></div>
      ${t.emin === false ? '<p class="tk-emin">Bu kartın bazı bilgileri denetimde.</p>' : ''}
      ${ail.map((a) => `<div class="tk-aile"><p><span class="yok">Aile:</span> <b>${kac(iki(a.ad).tr)}</b>${iki(a.ad).en ? ` <i lang="en">${kac(iki(a.ad).en)}</i>` : ''}</p><div class="tur-cipler">${(a.uye || []).map((id) => turBul(K, id)).filter(Boolean).map((u) => turCip(K, u, u === t)).join('')}</div>${a.not ? ciftHTML(iki(a.not)) : ''}</div>`).join('')}
      ${(t.omur || []).length ? `<h3>Ömür</h3><div class="tablo-kap"><table class="tk-omur"><thead><tr><th scope="col">Nerede</th><th scope="col">Ömür</th><th scope="col">Kaynak</th></tr></thead><tbody>${t.omur.map((o) => `<tr><td>${ikiSat(o.yer)}</td><td><b>${kac(iki(o.deger).tr)}</b>${iki(o.deger).en ? ` <span class="iki-en" lang="en">${kac(iki(o.deger).en)}</span>` : ''}</td><td class="yok">${kac(o.kaynak || '')}</td></tr>`).join('')}</tbody></table></div>` : ''}
      ${yol(t.uretim, 'Üretim · nereden gelir?')}${yol(t.yutak, 'Yutak · nereye gider?')}
      ${(t.bilgi || []).length ? `<h3>Bilgi</h3>${t.bilgi.map((b) => ciftHTML(iki(b))).join('')}` : ''}
      ${icTp.length ? `<h3>İçinde geçtiği tepkimeler <span class="say">${icTp.length}</span></h3><ul class="tp-liste">${icTp.map((r) => tepkimeSatir(K, r, rolu(r))).join('')}</ul>` : ''}
      ${dg.length ? `<h3>Çevrimler</h3><div class="ilgili">${dg.map((d) => ckBag(`_dongu/${d.id}`, `${kac(iki(d.ad).tr)} · çizim →`, 'soru-bag')).join('')}</div>` : ''}
      ${kavramCipleri(K, t.kavram, 'kimya')}${soruCipleri(K, t.soru)}
      ${(t.bak || []).length ? `<h3>Yan yana bak</h3><div class="tur-cipler">${t.bak.map((id) => turBul(K, id)).filter(Boolean).map((u) => turCip(K, u)).join('')}</div>` : ''}
      ${sz ? `<p>${ckBag(`_sozluk/${sz.en}`, `Sözlükte: <span lang="en">${kac(sz.en)}</span> · ${kac(sz.tr)}`, 'soru-bag')}</p>` : ''}
      ${t.kaynak ? `<p class="yok sz-kaynak">Kaynak: ${kac(t.kaynak)}</p>` : ''}</article>`;
  }
  function tepkimeKartHTML(K, r) {
    const ad = iki(r.ad), rol = iki(r.rol), T = TIP_AD[r.tip];
    const tl = (ids) => (ids || []).map((id) => turBul(K, id)).filter(Boolean).map((u) => turCip(K, u)).join('');
    const dg = (r.dongu || []).map((id) => donguBul(K, id)).filter(Boolean);
    const kEt = r.tip === 'fotoliz' ? 'Fotoliz hızı' : /denge|cozunme/.test(r.tip || '') ? 'Sabit' : 'Hız sabiti';
    return `<article class="tk tp-kart">
      <div class="tk-denk" aria-label="Denklem">${denkHTML(K, r)}</div>
      <p class="tk-ad"><b>${kac(ad.tr)}</b>${ad.en ? ` <span lang="en">${kac(ad.en)}</span>` : ''}</p>
      <p class="tk-sinif">${T ? `<span class="tur">${kac(T[0])}</span> <span class="tur" lang="en">${kac(T[1])}</span>` : r.tip ? `<span class="tur">${kac(r.tip)}</span>` : ''}${rol.tr ? ` <span class="tur">${kac(rol.tr)}</span>${rol.en ? ` <span class="tur" lang="en">${kac(rol.en)}</span>` : ''}` : ''}</p>
      <dl class="tp-dl">${r.k ? `<dt>${kEt}</dt><dd>${kac(r.k)}</dd>` : ''}<dt>Kitapta</dt><dd>${r.kitapta === false ? `yok: çevrimi kapatan standart adım${r.kaynak ? ` (kaynak: ${kac(r.kaynak)})` : ''}` : 'var'}</dd></dl>
      ${r.not ? ciftHTML(iki(r.not)) : ''}
      ${(r.sol || []).length ? `<h3>Harcanan türler</h3><div class="tur-cipler">${tl(r.sol)}</div>` : ''}
      ${(r.sag || []).length ? `<h3>Oluşan türler</h3><div class="tur-cipler">${tl(r.sag)}</div>` : ''}
      ${dg.length ? `<h3>Çevrimler</h3><div class="ilgili">${dg.map((d) => ckBag(`_dongu/${d.id}`, `${kac(iki(d.ad).tr)} · çizim →`, 'soru-bag')).join('')}</div>` : ''}
      ${kavramCipleri(K, r.kavram, 'kimya')}${soruCipleri(K, r.soru)}</article>`;
  }
  const f1 = (x) => (Math.round(x * 10) / 10).toString();
  const dgAdim = {};
  function donguSVG(K, d) {
    const W = 640, OL = 6.4, dug = d.dugum || [];
    const ymax = Math.max(40, ...dug.map((x) => +x.y || 0)), H = Math.round(ymax * OL + 112);
    const P = new Map();
    dug.forEach((x) => { const t = turBul(K, x.tur), f = t ? t.f : x.tur; P.set(x.tur, { x: Math.max(8, Math.min(92, +x.x || 0)) * OL, y: (+x.y || 0) * OL + 44, hw: Math.max(40, 14 + 9 * [...f].length), hh: 30, t, f, ust: (+x.y || 0) < 35 }); });
    const grup = new Map(), anah = (o) => [o.den, o.ya].sort().join('|');
    (d.ok || []).forEach((o, i) => { const a = anah(o); if (!grup.has(a)) grup.set(a, []); grup.get(a).push(i); });
    const sinir = (N, ux, uy) => Math.min(ux ? N.hw / Math.abs(ux) : 1e9, uy ? N.hh / Math.abs(uy) : 1e9);
    const uc = (N, hx, hy, pay) => { const vx = hx - N.x, vy = hy - N.y, l = Math.hypot(vx, vy) || 1, ux = vx / l, uy = vy / l, s = sinir(N, ux, uy) + pay; return [N.x + ux * s, N.y + uy * s]; };
    const oklar = (d.ok || []).map((o, i) => {
      const A = P.get(o.den), B = P.get(o.ya); if (!A || !B || A === B) return '';
      const g = grup.get(anah(o)), j = g.indexOf(i), n = g.length, kanon = [o.den, o.ya].sort()[0] === o.den ? 1 : -1;
      const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1, px = -dy / L, py = dx / L;
      const kay = n === 1 ? 0 : (j - (n - 1) / 2) * 44 * kanon;
      const cx = (A.x + B.x) / 2 + px * kay * 2, cy = (A.y + B.y) / 2 + py * kay * 2;
      const [x1, y1] = uc(A, cx, cy, 4), [x2, y2] = uc(B, cx, cy, 5);
      const tx = x2 - cx, ty = y2 - cy, tl = Math.hypot(tx, ty) || 1, ax = tx / tl, ay = ty / tl, bx = x2 - ax * 15, by = y2 - ay * 15;
      const yol = kay ? `M${f1(x1)} ${f1(y1)} Q${f1(cx)} ${f1(cy)} ${f1(bx)} ${f1(by)}` : `M${f1(x1)} ${f1(y1)} L${f1(bx)} ${f1(by)}`;
      const lx = 0.25 * x1 + 0.5 * cx + 0.25 * x2, ly = 0.25 * y1 + 0.5 * cy + 0.25 * y2, et = String(o.tepkime || ''), ew = 22 + 12 * et.length, r = tepkimeBul(K, et);
      return `<g class="dg-ok" data-r="${kac(et)}" data-ck="_tepkime/${kac(et)}" role="link" tabindex="0" aria-label="${kac(`${et}: ${r ? r.denk : ''} (tepkime kartı)`)}"><path class="dg-vur" d="${yol}"/><path class="dg-yol" d="${yol}"/><polygon class="dg-uc" points="${f1(x2)},${f1(y2)} ${f1(bx - ay * 8)},${f1(by + ax * 8)} ${f1(bx + ay * 8)},${f1(by - ax * 8)}"/><g class="dg-et"><rect x="${f1(lx - ew / 2)}" y="${f1(ly - 17)}" width="${f1(ew)}" height="34" rx="17"/><text x="${f1(lx)}" y="${f1(ly)}">${kac(et)}</text></g></g>`;
    }).join('');
    const dugumler = [...P.entries()].map(([id, N]) => `<g class="dg-dugum" data-tur="${kac(id)}" data-ck="_tur/${kac(id)}" role="link" tabindex="0" aria-label="${kac(`${N.f}${N.t ? ' · ' + iki(N.t.ad).tr : ''} (tür kartı)`)}"><rect x="${f1(N.x - N.hw)}" y="${f1(N.y - N.hh)}" width="${f1(2 * N.hw)}" height="${f1(2 * N.hh)}" rx="${f1(N.hh)}"/><text class="dg-f" x="${f1(N.x)}" y="${f1(N.y)}">${kac(N.f)}</text>${N.t ? `<text class="dg-ad" x="${f1(N.x)}" y="${f1(N.ust ? N.y - N.hh - 18 : N.y + N.hh + 18)}">${kac(iki(N.t.ad).tr)}</text>` : ''}</g>`).join('');
    return `<svg class="dg-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="${kac(iki(d.ad).tr)}: çevrim çizimi">${oklar}${dugumler}</svg>`;
  }
  function donguHTML(K, d) {
    const sira = [...new Set([...(d.adim || []).flatMap((s) => s.tepkime || []), ...(d.ok || []).map((o) => o.tepkime)])].map((id) => tepkimeBul(K, id)).filter(Boolean);
    const n = (d.adim || []).length;
    return `<section class="dg" data-dg="${kac(d.id)}"><div class="dg-kap">${donguSVG(K, d)}</div>
      ${n ? `<div class="dg-kontrol" role="group" aria-label="Adım adım"><button type="button" class="kucuk dg-geri" aria-label="Önceki adım" title="Önceki adım (←)">◀</button><button type="button" class="dugme dg-oynat" aria-pressed="false">Oynat</button><button type="button" class="kucuk dg-ileri" aria-label="Sonraki adım" title="Sonraki adım (→)">▶</button><span class="dg-say yok" aria-live="polite"></span></div>` : ''}
      <div class="dg-aciklama"></div>
      ${sira.length ? `<h4 class="dg-h4">Bu çevrimin tepkimeleri</h4><ul class="tp-liste dg-tp">${sira.map((r) => tepkimeSatir(K, r)).join('')}</ul>` : ''}
      ${d.net ? `<div class="dg-net"><p class="dg-net-d"><span class="yok">Net:</span> <b>${kac(d.net.denk || '')}</b></p>${d.net.tr || d.net.en ? ciftHTML(iki(d.net)) : ''}</div>` : ''}</section>`;
  }
  function donguKur(kok, K, d) {
    const sek = $$('.dg', kok).find((x) => x.dataset.dg === d.id); if (!sek) return;
    const A = d.adim || [], geri = $('.dg-geri', sek), ileri = $('.dg-ileri', sek), oyn = $('.dg-oynat', sek);
    let i = Math.min(dgAdim[d.id] ?? -1, A.length - 1), zaman = 0;
    const turSet = (ids) => { const s = new Set(); ids.forEach((id) => { const r = tepkimeBul(K, id); if (r) [...(r.sol || []), ...(r.sag || [])].forEach((t) => s.add(t)); }); return s; };
    function ciz() {
      const R = i >= 0 ? new Set(A[i].tepkime || []) : null, T = R ? turSet([...R]) : null;
      $$('.dg-ok', sek).forEach((g) => { const on = !!R && R.has(g.dataset.r); g.classList.toggle('on', on); g.classList.toggle('sonuk', !!R && !on); });
      $$('.dg-dugum', sek).forEach((g) => { const on = !!T && T.has(g.dataset.tur); g.classList.toggle('on', on); g.classList.toggle('sonuk', !!T && !on); });
      $$('.dg-tp li', sek).forEach((li) => li.classList.toggle('on', !!R && R.has(li.dataset.r)));
      $('.dg-aciklama', sek).innerHTML = i < 0
        ? `<p class="dg-genel">${A.length ? `${A.length} adım: ◀ ▶ ile adım adım ilerle ya da «Oynat»a bas. ` : ''}Düğüme dokun: tür kartı; oka ya da etikete dokun: tepkime kartı.</p>`
        : `<p class="dg-adim-d"><span class="dg-no">${i + 1}</span>${(A[i].tepkime || []).map((id) => { const r = tepkimeBul(K, id); return `<b>${kac(id)}</b> ${kac(r ? r.denk : '')}`; }).join(' · ')}</p>${ciftHTML(iki(A[i]))}`;
      if (A.length) { $('.dg-say', sek).textContent = i < 0 ? 'Genel bakış' : `Adım ${i + 1} / ${A.length}`; geri.disabled = i < 0; ileri.disabled = i >= A.length - 1; }
      dgAdim[d.id] = i;
    }
    const dur = () => { if (zaman) clearInterval(zaman); zaman = 0; if (oyn) { oyn.textContent = 'Oynat'; oyn.setAttribute('aria-pressed', 'false'); } };
    if (A.length) {
      geri.addEventListener('click', () => { dur(); if (i > -1) { i--; ciz(); } });
      ileri.addEventListener('click', () => { dur(); if (i < A.length - 1) { i++; ciz(); } });
      oyn.addEventListener('click', () => {
        if (zaman) { dur(); return; }
        if (i >= A.length - 1) i = -1;
        oyn.textContent = 'Durdur'; oyn.setAttribute('aria-pressed', 'true');
        i++; ciz();
        zaman = setInterval(() => { if (!sek.isConnected || i >= A.length - 1) { dur(); return; } i++; ciz(); }, 2600);
      });
      sek.addEventListener('keydown', (e) => { if (e.altKey || e.ctrlKey || e.metaKey) return; if (e.key === 'ArrowRight') { e.preventDefault(); ileri.click(); } else if (e.key === 'ArrowLeft') { e.preventDefault(); geri.click(); } });
    }
    animTutucu = { dur };
    ciz();
  }
  function kimyaKavramHTML(K, k) {
    const x = kavramKimya(K, k.id), d = x.dongu[0];
    let h = '';
    if (d) h += `<h3 class="dg-bas">${kac(iki(d.ad).tr)}${iki(d.ad).en ? ` <small lang="en">${kac(iki(d.ad).en)}</small>` : ''}</h3>${donguHTML(K, d)}${x.dongu.length > 1 ? `<p class="ilgili"><span class="yok">Öbür çevrimler:</span> ${x.dongu.slice(1).map((y) => ckBag(`_dongu/${y.id}`, kac(iki(y.ad).tr), 'soru-bag')).join('')}</p>` : ''}`;
    if (x.tur.length) h += `<h3>Bu kavramın türleri</h3><div class="tur-cipler">${x.tur.map((t) => turCip(K, t)).join('')}</div>`;
    if (x.tepkime.length) h += `<h3>Bu kavramın tepkimeleri</h3><ul class="tp-liste">${x.tepkime.map((r) => tepkimeSatir(K, r)).join('')}</ul>`;
    return `${h}<p class="dil-cagri">${ckBag('_tur', 'Bütün türler →', 'soru-bag')} ${ckBag('_tepkime', 'Bütün tepkimeler →', 'soru-bag')}</p>`;
  }
  function turCk(K, id, ayni) {
    const T = turlar(K);
    if (!T.length) return atlasCk(K, ayni);
    $('#ck-sekme').innerHTML = ustSekme(K, id ? '' : 'tur');
    const t = id ? turBul(K, id) : null;
    if (!t) {
      kirintiYaz(K, [['Türler', null]]);
      $('#ck-baslik').innerHTML = `Türler<small>${T.length} tür · aileye göre · formül · Türkçe · İngilizce</small>`;
      $('#ck-sira').innerHTML = '';
      if (ayni) return;
      const gruplar = aileler(K).map((a) => [a, T.filter((u) => icer(u, 'aile', a.id))]).filter(([, l]) => l.length);
      const aileli = new Set(gruplar.flatMap(([, l]) => l)), diger = T.filter((u) => !aileli.has(u));
      const bolum = (bas, not, l) => `<section class="at-bol"><h3>${bas} <span class="say">${l.length}</span></h3>${not}<ul class="kv-liste">${l.map((u) => `<li>${ckBag(`_tur/${u.id}`, `<span class="sem tur-f">${kac(u.f)}</span><span class="ad">${kac(iki(u.ad).tr)}</span><span class="en" lang="en">${kac(iki(u.ad).en)}</span>`, 'kv-sat')}</li>`).join('')}</ul></section>`;
      ckIc.innerHTML = `<p class="ck-not">Bir türe dokun: kartı açılır (ömür, üretim, yutak, tepkimeler, çevrimler). Çekmece açık kalır.</p>${gruplar.map(([a, l]) => bolum(`${kac(iki(a.ad).tr)}${iki(a.ad).en ? ` <i class="yok" lang="en">${kac(iki(a.ad).en)}</i>` : ''}`, a.not ? `<p class="tk-not">${kac(iki(a.not).tr)}</p>` : '', l)).join('')}${diger.length ? bolum(gruplar.length ? 'Öbür türler' : 'Türler', '', diger) : ''}`;
      return;
    }
    kirintiYaz(K, [['Türler', '_tur'], [kac(t.f), null]]);
    $('#ck-baslik').innerHTML = `${kac(t.f)} · ${kac(iki(t.ad).tr)}<small lang="en">${kac(iki(t.ad).en)}</small>`;
    const i = T.indexOf(t), o = T[i - 1], s = T[i + 1];
    $('#ck-sira').innerHTML = siraHTML(o && [`_tur/${o.id}`, kac(o.f)], `tür ${i + 1} / ${T.length}`, s && [`_tur/${s.id}`, kac(s.f)]);
    if (ayni) return;
    ckIc.innerHTML = turKartHTML(K, t);
  }
  const tpSuz = { tip: '', aile: '' };
  function tepkimeListeHTML(K) {
    const L = tepkimeler(K), turAile = (id) => (turBul(K, id) || {}).aile || [];
    const uy = L.filter((r) => (!tpSuz.tip || r.tip === tpSuz.tip) && (!tpSuz.aile || [...(r.sol || []), ...(r.sag || [])].some((id) => turAile(id).includes(tpSuz.aile))));
    return `<p class="tp-say yok" aria-live="polite">${uy.length} / ${L.length} tepkime</p><ul class="tp-liste">${uy.map((r) => tepkimeSatir(K, r)).join('') || '<li class="yok">Bu süzgeçle tepkime yok.</li>'}</ul>`;
  }
  function tepkimeCk(K, id, ayni) {
    const L = tepkimeler(K);
    if (!L.length) return atlasCk(K, ayni);
    $('#ck-sekme').innerHTML = ustSekme(K, id ? '' : 'tepkime');
    const r = id ? tepkimeBul(K, id) : null;
    if (!r) {
      kirintiYaz(K, [['Tepkimeler', null]]);
      $('#ck-baslik').innerHTML = `Tepkimeler<small>${L.length} tepkime · tipe ve aileye göre süz</small>`;
      $('#ck-sira').innerHTML = '';
      if (ayni) return;
      const tipler = Object.keys(TIP_AD).filter((t) => L.some((x) => x.tip === t)).concat([...new Set(L.map((x) => x.tip).filter((t) => t && !TIP_AD[t]))]);
      const ail = aileler(K).filter((a) => L.some((x) => [...(x.sol || []), ...(x.sag || [])].some((u) => icer(turBul(K, u) || {}, 'aile', a.id))));
      const grup = (alan, ad, liste) => `<div class="tp-suz" role="group" aria-label="${ad}"><span class="yok">${ad}:</span>${[['', 'Tümü'], ...liste].map(([v, a]) => `<button type="button" class="kucuk" data-tp="${alan}" data-v="${kac(v)}" aria-pressed="${tpSuz[alan] === v}">${kac(a)}</button>`).join('')}</div>`;
      ckIc.innerHTML = `${grup('tip', 'Tip', tipler.map((t) => [t, tipAd(t)]))}${ail.length ? grup('aile', 'Aile', ail.map((a) => [a.id, iki(a.ad).tr])) : ''}<div class="tp-sonuc">${tepkimeListeHTML(K)}</div>`;
      return;
    }
    kirintiYaz(K, [['Tepkimeler', '_tepkime'], [kac(r.id), null]]);
    $('#ck-baslik').innerHTML = `${kac(r.id)} · ${kac(iki(r.ad).tr)}<small lang="en">${kac(iki(r.ad).en)}</small>`;
    const i = L.indexOf(r), o = L[i - 1], s = L[i + 1];
    $('#ck-sira').innerHTML = siraHTML(o && [`_tepkime/${o.id}`, kac(o.id)], `tepkime ${i + 1} / ${L.length}`, s && [`_tepkime/${s.id}`, kac(s.id)]);
    if (ayni) return;
    ckIc.innerHTML = tepkimeKartHTML(K, r);
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.tp-suz button[data-tp]'); if (!b || !ckDurum) return;
    const alan = b.dataset.tp; tpSuz[alan] = b.dataset.v === tpSuz[alan] ? '' : b.dataset.v;
    $$(`.tp-suz button[data-tp="${alan}"]`, ckIc).forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.v === tpSuz[alan])));
    const s = $('.tp-sonuc', ckIc); if (s) s.innerHTML = tepkimeListeHTML(ckDurum.K);
  });
  function donguCk(K, id, ayni) {
    const L = donguler(K);
    if (!L.length) return atlasCk(K, ayni);
    $('#ck-sekme').innerHTML = ustSekme(K, id ? '' : 'dongu');
    const d = id ? donguBul(K, id) : null;
    if (!d) {
      kirintiYaz(K, [['Çevrimler', null]]);
      $('#ck-baslik').innerHTML = `Çevrimler<small>${L.length} çevrim · adım adım çizim</small>`;
      $('#ck-sira').innerHTML = '';
      if (ayni) return;
      ckIc.innerHTML = `<p class="ck-not">Bir çevrime dokun: çizimi açılır (düğüm = tür, ok = tepkime); «Oynat» ile adım adım izle.</p><ul class="kv-liste">${L.map((x) => `<li>${ckBag(`_dongu/${x.id}`, `<span class="ad">${kac(iki(x.ad).tr)}</span><span class="en" lang="en">${kac(iki(x.ad).en)}</span><span class="say">${(x.dugum || []).length} tür · ${new Set((x.ok || []).map((o) => o.tepkime)).size} tepkime · ${(x.adim || []).length} adım</span>`, 'kv-sat')}</li>`).join('')}</ul>`;
      return;
    }
    kirintiYaz(K, [['Çevrimler', '_dongu'], [kac(iki(d.ad).tr), null]]);
    $('#ck-baslik').innerHTML = `${kac(iki(d.ad).tr)}<small lang="en">${kac(iki(d.ad).en)}</small>`;
    const i = L.indexOf(d), o = L[i - 1], s = L[i + 1];
    $('#ck-sira').innerHTML = siraHTML(o && [`_dongu/${o.id}`, kac(iki(o.ad).tr)], `çevrim ${i + 1} / ${L.length}`, s && [`_dongu/${s.id}`, kac(iki(s.ad).tr)]);
    if (ayni) return;
    ckIc.innerHTML = `${donguHTML(K, d)}${kavramCipleri(K, d.kavram, 'kimya')}`;
    donguKur(ckIc, K, d);
  }
  // atlasın üstünde giriş kutuları (yalnız kimya / hesap verisi olan kitapta)
  function atlasGirisHTML(K) {
    const kutu = (kp, ad, n, alt, sinif = '') => ckBag(kp, `<b>${ad}</b><span class="say">${n}</span><span class="at-alt">${alt}</span>`, `at-kutu${sinif}`);
    const pu = puVar(K) ? kutu('_pusula', 'Vize pusulası', `${K.pusula.akis.length} akış`, 'el hesabı: verilenler → formül → adımlar → denetim', ' pu-kutu') : ''; // VIZE-316
    const sn = (snVar(K) ? kutu('_sinav', 'Sınav pusulası', SN[K.id].d === 'acik' ? 'açık' : 'kilitli', SN[K.id].d === 'acik' ? 'strateji · olasılık · son gün' : 'parolayla açılır', ' sn-kutu') : '')
      + (czKars(K).length ? kutu('_kars', 'Karşılaştırmalar', czKars(K).length, 'karıştırılan kavramlar yan yana') : '') + (kesinSay(K) ? kutu('_kesin', 'Kesin bil', kesinSay(K).adim, 'kesin adımlar · hızlı tekrar', ' ks-kutu') : '');
    if (!turlar(K).length && !tepkimeler(K).length && !donguler(K).length && !HS(K).length) {
      if (sn || pu) return `<div class="at-giris">${pu}${sn}${(K.kavramlar || []).length > 1 ? kutu('_ag', 'Kavram ağı', K.kavramlar.length, 'kavramlar arası bağlar') : ''}${(K.sozluk || []).length ? kutu('_sozluk', 'Sözlük', K.sozluk.length, 'TR ↔ EN terimler') : ''}</div>`;
      return (K.kavramlar || []).length > 1 ? `<p class="ag-gir">${ckBag('_ag', 'Kavram ağı: bütün kavramlar ve aralarındaki bağlar tek çizimde →', 'soru-bag')}</p>` : '';
    }
    return `<div class="at-giris">${pu}${sn}${[turlar(K).length && kutu('_tur', 'Türler', turlar(K).length, 'formül · ad · ömür · tepkimeler'), tepkimeler(K).length && kutu('_tepkime', 'Tepkimeler', tepkimeler(K).length, 'tipe ve aileye göre'), donguler(K).length && kutu('_dongu', 'Çevrimler', donguler(K).length, 'adım adım çizim'), HS(K).length && kutu('_hesap', 'Hesap laboratuvarı', HS(K).length, 'sürgüyle hesapla, kitapla karşılaştır'), (K.kavramlar || []).length > 1 && kutu('_ag', 'Kavram ağı', K.kavramlar.length, 'kavramlar arası bağlar'), (K.sozluk || []).length && kutu('_sozluk', 'Sözlük', K.sozluk.length, 'TR ↔ EN terimler')].filter(Boolean).join('')}</div>`;
  }
  // soru sayfası: «Bu soruda: O₃ · NO» tür çipleri + «Hesapla» düğmeleri (çekmeceyi açar; ana sayfa yerinde kalır)
  function soruEkEkle(K, q) {
    const T = turlar(K).filter((t) => icer(t, 'soru', q.id)), H2 = soruHesap(K, q.id), govde = $('.soru-govde', ana);
    if ((!T.length && !H2.length) || !govde) return;
    const taban = `#${K.id}/${q.id}/k/`;
    govde.insertAdjacentHTML('afterend', `<div class="soru-ek">${T.length ? `<p class="soru-ek-sat"><span class="yok">Bu soruda:</span> ${T.map((t) => `<button type="button" class="tur-cip" data-git="${kac(taban + '_tur/' + t.id)}" title="${kac(iki(t.ad).tr)} · ${kac(iki(t.ad).en)}"><span class="f">${kac(t.f)}</span><span class="ad">${kac(iki(t.ad).tr)}</span></button>`).join('')}</p>` : ''}${H2.length ? `<p class="soru-ek-sat"><span class="yok">Hesapla:</span> ${H2.map((h) => { const n = (h.hazir || []).findIndex((z) => z.soru === q.id); return `<button type="button" class="kucuk hs-ac" data-git="${kac(taban + '_hesap/' + h.id + (n >= 0 ? '/' + n : ''))}">${kac(iki(h.ad).tr)}${n >= 0 ? ` · ${kac(q.id)} değerleri` : ''}</button>`; }).join('')}</p>` : ''}</div>`);
  }
  /* --- kavram ağı (_ag, beş kitap): düğüm = kavram (bölüm rengi), çizgi = «bag»; dokun → kavram; imleç / odak → komşular parlar --- */
  const AG = new Map(), AG_RENK = ['--es0', '--es1', '--es2', '--es3', '--es4', '--es5', '--tur', '--yesil', '--acc'];
  function agYerlesim(K) {
    if (AG.has(K.id)) return AG.get(K.id);
    // bölüm halkası: kavramlar atlas sırasıyla çember üstünde (bölümler arasında bir boşluk), etiketler dışa doğru
    const L = K.kavramlar || [], n = L.length, W = 660, H = 660, R = 196, bolIds = [...new Set(L.map((k) => k.bolum))];
    const ix = new Map(L.map((k, i) => [k.id, i])), yuva = n + bolIds.length;
    let b0 = null, kay = 0;
    const P = L.map((k, i) => { if (k.bolum !== b0) { if (b0 !== null) kay++; b0 = k.bolum; } const a = -Math.PI / 2 + (2 * Math.PI * (i + kay)) / yuva; return { x: W / 2 + R * Math.cos(a), y: H / 2 + R * Math.sin(a), a }; });
    const E = [], g = new Set();
    L.forEach((k, i) => (k.bag || []).forEach((x) => { const j = ix.get(x); if (j == null || j === i) return; const a = `${Math.min(i, j)}-${Math.max(i, j)}`; if (!g.has(a)) { g.add(a); E.push([Math.min(i, j), Math.max(i, j)]); } }));
    const y = { P, E, bolIds, W, H, R }; AG.set(K.id, y); return y;
  }
  // etiket: düğümün dışında, yarıçap doğrultusunda; sol yarıda ters çevrilip sağa yaslanır (okunur kalır)
  const agEtiket = (p, R, W, H, metin) => {
    const sol = Math.cos(p.a) < 0, d = (p.a * 180) / Math.PI + (sol ? 180 : 0), x = W / 2 + (R + 15) * Math.cos(p.a), y = H / 2 + (R + 15) * Math.sin(p.a);
    return `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${sol ? 'end' : 'start'}" dominant-baseline="central" transform="rotate(${f1(d)} ${f1(x)} ${f1(y)})">${kac(metin)}</text>`;
  };
  function agCk(K, ayni) {
    const L = K.kavramlar || [];
    kirintiYaz(K, [['Kavram ağı', null]]);
    $('#ck-baslik').innerHTML = `Kavram ağı<small>${L.length} kavram · çizgi = ilgili kavram · renk = bölüm</small>`;
    $('#ck-sira').innerHTML = ''; $('#ck-sekme').innerHTML = ustSekme(K, 'ag');
    if (ayni) return;
    if (L.length < 2) { ckIc.innerHTML = '<p class="yok">Bu kitabın kavram atlası hazırlanıyor.</p>'; return; }
    const { P, E, bolIds, W, H, R } = agYerlesim(K), renk = (b) => `var(${AG_RENK[Math.max(0, bolIds.indexOf(b)) % AG_RENK.length]})`;
    const kisa = (x) => { const t = String(x || '').replace(/\s*\(.*?\)\s*/g, ' ').trim(); return t.length > 17 ? `${t.slice(0, 16).trim()}…` : t; };
    ckIc.innerHTML = `<p class="ck-not">Bir kavrama dokun: açılır. İmleci getir ya da sekmeyle odakla: bağlı kavramlar parlar.</p><div class="sekil-kap ag-kap" id="ck-sekil"><svg class="ag-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="Kavram ağı">${E.map(([i, j]) => { const mx = (P[i].x + P[j].x) / 2, my = (P[i].y + P[j].y) / 2, cx = W / 2 + (mx - W / 2) * 0.3, cy = H / 2 + (my - H / 2) * 0.3; return `<path class="ag-k" data-a="${i}" data-b="${j}" d="M${f1(P[i].x)} ${f1(P[i].y)} Q${f1(cx)} ${f1(cy)} ${f1(P[j].x)} ${f1(P[j].y)}"/>`; }).join('')}${L.map((k, i) => `<g class="ag-d" data-i="${i}" data-ck="${kac(k.id)}/tanim" role="link" tabindex="0" aria-label="${kac(`${k.ad} (kavram)`)}"><circle class="ag-vur" cx="${f1(P[i].x)}" cy="${f1(P[i].y)}" r="24"/><circle class="ag-n" cx="${f1(P[i].x)}" cy="${f1(P[i].y)}" r="9" style="fill:${renk(k.bolum)}"/>${agEtiket(P[i], R, W, H, kisa(k.ad))}</g>`).join('')}</svg></div><p class="ag-alt" aria-live="polite"></p><div class="ag-lejant">${bolIds.map((b) => { const bo = K.bolumler.find((x) => x.id === b); return `<span><i style="background:${renk(b)}"></i>${kac(bo ? bolumAd(K, bo) : b)}</span>`; }).join('')}</div>`;
    { const dar = ckMod() !== 'genis', fig = $('#ck-sekil', ckIc), h = agListeHTML(K, L, E, bolIds, renk, kisa, dar); if (dar && fig) fig.insertAdjacentHTML('beforebegin', h); else ckIc.insertAdjacentHTML('beforeend', h); }
    buyutDugmesi();
    const svg = $('.ag-svg', ckIc), alt = $('.ag-alt', ckIc);
    const yak = (i) => {
      const s = i == null ? null : new Set([i, ...E.filter(([a, b]) => a === i || b === i).flatMap((x) => x)]);
      $$('.ag-d', svg).forEach((g) => { const j = +g.dataset.i; g.classList.toggle('on', !!s && s.has(j)); g.classList.toggle('sonuk', !!s && !s.has(j)); });
      $$('.ag-k', svg).forEach((l) => { const on = !!s && (+l.dataset.a === i || +l.dataset.b === i); l.classList.toggle('on', on); l.classList.toggle('sonuk', !!s && !on); });
      alt.textContent = i == null ? '' : `${L[i].sembol} · ${L[i].ad} — ${s.size - 1} bağlı kavram`;
    };
    svg.addEventListener('pointerover', (e) => { const g = e.target.closest('.ag-d'); if (g) yak(+g.dataset.i); });
    svg.addEventListener('pointerleave', () => yak(null));
    svg.addEventListener('focusin', (e) => { const g = e.target.closest('.ag-d'); if (g) yak(+g.dataset.i); });
    svg.addEventListener('focusout', () => yak(null));
  }
  // klavye: SVG içindeki bağ (düğüm / ok) Enter ya da boşlukla açılır
  document.addEventListener('keydown', (e) => {
    if ((e.key !== 'Enter' && e.key !== ' ') || !e.target.closest) return;
    const g = e.target.closest('svg [data-ck][role=link]'); if (!g || !ckDurum) return;
    e.preventDefault(); location.hash = `#${ckDurum.onEk}/k/${g.dataset.ck}`;
  });

  /* ---------- ETK Ö1 (26 Kas): sınav pusulası — parolalı katman ----------
     Veri: sinav/<kitap>.json.kilit (AES-GCM 256; anahtar PBKDF2-SHA256 — Sınav Atölyesi ve Defterler ile aynı tuz / tur / parola).
     Çözülen anahtar localStorage «ak-defter-anahtar»da ortak: atölyede açan burada yeniden parola yazmaz (biçim kilit-ortak.js ile aynı).
     Dosya yoksa görünüm hiç değişmez; kilitliyken yalnız «Sınav pusulası · kilitli» düğmesi (→ çekmecede parola kutusu).
     Açıkken: bölüm şeridi, soru rozeti + «Sınav notu», akış yönlendirmeleri (akis), İçindekiler'de rozet + «Yalnız yüksek olasılık»,
     çekmecede _sinav (strateji · sınav · çalışma sırası · son gün · olasılığa göre), kavramda «Sınav» sekmesi. Tercih: dk:sinav. */
  const SN_TUZ = 'R/45QgKU0DXAa0mUW6z0CQ==', SN_TUR = 250000, SN_DEPO = 'ak-defter-anahtar';
  const SN = {};
  let snK = null;
  const snB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const snB64e = (u) => btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(u))));
  async function snSakli() {
    if (snK) return snK;
    try { const x = JSON.parse(localStorage.getItem(SN_DEPO) || 'null'); if (!x || !x.k || x.t < Date.now()) return null; snK = await crypto.subtle.importKey('raw', snB64(x.k), 'AES-GCM', false, ['decrypt']); return snK; } catch (e) { return null; }
  }
  const snCoz = async (k, b) => JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b.slice(0, 12) }, k, b.slice(12))));
  async function snTuret(p) {
    const ham = await crypto.subtle.importKey('raw', new TextEncoder().encode(String(p).normalize('NFC').trim().toLocaleLowerCase('tr')), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: snB64(SN_TUZ), iterations: SN_TUR, hash: 'SHA-256' }, ham, { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
  }
  const snSakla = (k, uzun) => crypto.subtle.exportKey('raw', k).then((ham) => sakla(SN_DEPO, JSON.stringify({ k: snB64e(ham), t: Date.now() + (uzun ? 30 * 864e5 : 12 * 36e5) }))).catch(() => {});
  // sinav/liste.json: pusulası yayımlanmış kitaplar (sinav_yayinla.sh yazar) → dosyası olmayan kitapta istek de 404 de yok
  let snListe = null;
  const snListeAl = () => snListe || (snListe = fetch('sinav/liste.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : [])).then((x) => (Array.isArray(x) ? x : [])).catch(() => []));
  async function sinavYukle(K) {
    const kid = K.id;
    if (!SN[kid]) {
      SN[kid] = { d: 'bekle' };
      let b = null;
      if (window.crypto && crypto.subtle && (await snListeAl()).includes(kid)) { try { const r = await fetch(`sinav/${kid}.json.kilit`, { cache: 'no-cache' }); if (r.ok) b = new Uint8Array(await r.arrayBuffer()); } catch (e) { /* ağ yok */ } }
      if (SN[kid].d !== 'bekle') return; // bu arada sınama verisi geldi
      SN[kid] = b && b.length > 28 ? { d: 'kilitli', b } : { d: 'yok' };
      if (SN[kid].d === 'yok') return;
      snYenile(kid);
    }
    if (SN[kid].d !== 'kilitli') return;
    const k = await snSakli(); if (!k) return;
    try { const v = await snCoz(k, SN[kid].b); SN[kid] = { d: 'acik', b: SN[kid].b, v }; snYenile(kid); } catch (e) { /* bu anahtar bu dosyayı açmıyor */ }
  }
  const SV = (K) => { const s = K && SN[K.id]; return s && s.d === 'acik' && s.v && oku('dk:sinav') !== '0' ? s.v : null; };
  const snVar = (K) => { const s = K && SN[K.id]; return !!s && (s.d === 'kilitli' || s.d === 'acik'); };
  const snKv = (K, id) => { const v = SV(K); return v && v.kavram ? v.kavram[id] || null : null; };
  function ckYenile() { if (!ckDurum) return; const { K, kPart, onEk } = ckDurum; ckDurum.kPart = ''; ckGoster(K, kPart, onEk); }
  function snYenile(kid) {
    araDizin = null;
    if (!simdiK || simdiK.id !== kid) return;
    if (!SB.el) sabitTut(null, { kab: window, sure: 500 });
    sinavSusle(simdiK);
    if (ckDurum && ckDurum.K === simdiK) ckYenile();
  }
  // sınama kancası: yerel önizlemede düz veri (tools/sinav_gez_test.cjs --duz); yayında yalnız tarayıcı belleğine yazar
  window.__dkSinav = { duz: (kid, v) => { SN[kid] = { d: 'acik', v, b: null }; snYenile(kid); }, durum: (kid) => (SN[kid] || {}).d || 'yok' };

  const SN_AD = ['', 'Düşük', 'Orta', 'Yüksek'];
  const snN = (x) => Math.max(0, Math.min(3, Math.round(+x || 0)));
  const snNokta = (x, kisa, sinif = '') => { const n = snN(x); return n ? `<span class="sn-n sn-k${n}${sinif ? ' ' + sinif : ''}" title="Sınavda çıkma olasılığı: ${SN_AD[n].toLocaleLowerCase('tr')}"><i></i><i></i><i></i>${kisa ? `<span class="gizli">Sınav olasılığı: ${SN_AD[n].toLocaleLowerCase('tr')}</span>` : `<b>${SN_AD[n]}</b>`}</span>` : ''; };
  const snUl = (L) => ((L || []).length ? `<ul class="sn-liste">${L.map((x) => `<li>${kac(x)}</li>`).join('')}</ul>` : '');
  const kisalt = (s, n) => { const t = String(s || ''); return t.length > n ? `${t.slice(0, n - 1).trim()}…` : t; };
  const anaOnEk = (K) => { let h = location.hash.slice(1); try { h = decodeURIComponent(h); } catch (e) { /* bozuk adres */ } return h.split('/k/')[0] || K.id; };
  const IK = (d) => `<svg class="ik" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const KILIT_SVG = IK('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>');
  const PUSULA_SVG = IK('<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>');
  const OK_SVG = IK('<path d="M5 12h14M13 6l6 6-6 6"/>');
  // «✍ Önce kendin yaz», «📈», «⚠», «💎 ÖZ» gibi glifler bazı sistemlerde emoji gibi çizilir → satır içi SVG simge (GLIF, Ö2 bölümünde)
  function glifDuzelt(kok) {
    if (!kok) return;
    const w = document.createTreeWalker(kok, NodeFilter.SHOW_TEXT, { acceptNode: (n) => { GLIF_RX.lastIndex = 0; return GLIF_RX.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP; } });
    const L = []; while (w.nextNode()) L.push(w.currentNode);
    for (const d of L) {
      if (d.parentElement && d.parentElement.closest('svg,code,pre,textarea')) continue;
      const s = document.createElement('span');
      s.innerHTML = kac(d.nodeValue).replace(GLIF_RX, (m, g) => (g === '🇬🇧' ? '<span class="glif-en">EN</span> ' : `<svg class="glif" viewBox="0 0 24 24" aria-hidden="true">${GLIF[g]}</svg>`));
      d.replaceWith(...s.childNodes);
    }
  }
  // hedef çipi: soru:S10 · bol:<id> · kavram:<id> · sozluk:<en> (ck = çekmece içinde)
  function snCip(K, g, ck) {
    const t = String(g || ''), i = t.indexOf(':'), tur = t.slice(0, i), id = t.slice(i + 1);
    if (tur === 'soru') { const q = K.sorular[id]; if (!q) return ''; return `<a class="sn-cip" href="#${K.id}/${kac(id)}"${ck ? ` data-soru="${kac(id)}"` : ''}><b>${kac(id)}</b> ${kac(kisalt(q.baslik, 38))}</a>`; }
    if (tur === 'bol') { const b = K.bolumler.find((x) => x.id === id); if (!b) return ''; return `<a class="sn-cip" href="#${K.id}/bol/${kac(id)}"${ck ? ` data-ana="bol/${kac(id)}"` : ''}>${kac(bolumAd(K, b))}</a>`; }
    let kp = '', ad = '';
    if (tur === 'kavram') { const k = kavramBul(K, id); if (!k) return ''; kp = `${id}/${snKv(K, id) ? 'sinav' : 'tanim'}`; ad = `<b>${kac(k.sembol)}</b> ${kac(k.ad)}`; }
    else if (tur === 'sozluk') { const s = szBul(K, id); kp = `_sozluk/${s ? s.en : id}`; ad = `<span lang="en">${kac(s ? s.en : id)}</span>`; }
    else return '';
    return ck ? ckBag(kp, ad, 'sn-cip') : `<button type="button" class="sn-cip" data-git="${kac(`#${anaOnEk(K)}/k/${kp}`)}">${ad}</button>`;
  }
  const SN_AKIS = { yuksek: 'Sınavda çıkma olasılığı yüksek:', az: 'Bu kısım az çıkar; asıl bil:', bag: 'Bunu şununla birlikte çalış:' };
  const snAkisHTML = (K, a, ck) => `<div class="sn-x sn-akis" data-tur="${kac(SN_AKIS[a.tur] ? a.tur : 'yuksek')}">${OK_SVG}<div><p><b>${SN_AKIS[a.tur] || SN_AKIS.yuksek}</b> ${kac(a.metin || '')}</p>${(a.git || []).length ? `<div class="sn-cipler">${a.git.map((g) => snCip(K, g, ck)).join('')}</div>` : ''}</div></div>`;
  function snSeritHTML(K, V, b, kisa) {
    const B = (V.bolum || {})[b.id]; if (!B) return '';
    const n = snN(B.olasilik), azAsil = (B.az || []).length || (B.asil || []).length;
    const isl = typeof B.islev === 'string' ? B.islev.trim() : ''; // olasılık yerine işlev (ör. «Sınav öncesi son tekrar»)
    return `<details class="sn-x sn-serit" data-n="${n}"${isl ? ' data-islev=""' : ''}${kisa ? '' : ' open'}><summary>${isl ? `<span class="sn-islev">${kac(isl)}</span>` : snNokta(n)}${!isl && n === 3 ? isr('sik', { kucuk: true }) : ''}<span class="sn-et">${kisa ? `${kac(bolumAd(K, b))} · ` : ''}Sınav pusulası</span>${kisa && B.neden ? `<span class="sn-ozet">${kac(kisalt(B.neden, 90))}</span>` : ''}</summary>
      ${B.neden ? `<p class="sn-neden">${kac(B.neden)}</p>` : ''}${(B.odak || []).length ? `<p class="sn-alt">Odak:</p>${snUl(B.odak)}` : ''}
      ${azAsil ? `<div class="sn-az">${(B.az || []).length ? `<p><b>Az çıkar:</b> ${B.az.map(kac).join(' · ')}</p>` : ''}${(B.asil || []).length ? `<p class="sn-alt">${isr('kesin', { kucuk: true })}${(B.az || []).length ? 'Asıl bil:' : 'Az çıkar — asıl bil:'}</p>${snUl(B.asil)}` : ''}</div>` : ''}
      ${(B.yol || []).length ? `<div class="sn-cipler"><span class="yok">Çalışma yolu:</span> ${B.yol.map((g) => snCip(K, g)).join('')}</div>` : ''}</details>`;
  }
  function snNotHTML(K, S) {
    const n = snN(S.olasilik), ben = (S.benzer || []).filter((x) => K.sorular[x]), at = (S.atolye || []).filter(Boolean);
    return `<details class="sn-x sn-not" data-n="${n}" open><summary>${snNokta(n)}${n === 3 ? isr('sik') : ''}<span class="sn-et">Sınav notu</span></summary>
      ${S.neden ? `<p class="sn-neden">${kac(S.neden)}</p>` : ''}${S.ipucu ? `<p class="sn-ipucu">${isr('kisa')}<b>Sınavda ilk adım:</b> ${kac(S.ipucu)}</p>` : ''}
      ${(S.varyant || []).length ? `<p class="sn-alt">Sınavda şöyle de gelebilir:</p>${snUl(S.varyant)}` : ''}
      ${ben.length ? `<div class="sn-cipler"><span class="yok">Benzer:</span> ${ben.map((x) => snCip(K, 'soru:' + x)).join('')}</div>` : ''}
      ${at.length ? `<div class="sn-cipler"><span class="yok">Atölyede dene:</span> ${at.map((x, i) => `<a class="sn-cip" href="../soru-cozum/${kac(K.id)}/calis/#${kac(encodeURIComponent(x))}" target="_blank" rel="noopener">${at.length > 1 ? `Atölye ${i + 1}` : 'Sınav Atölyesi'} ↗</a>`).join('')}</div>` : ''}</details>`;
  }
  function sinavSusle(K, yeniden = true) {
    const [tur, id] = String(ana.dataset.sayfa || '').split(':');
    if (tur === 'akis' && yeniden) { akisGoster(K, '', true); return; } // akış sayfası olasılığa göre yeniden kurulur
    $$('.sn-x', ana).forEach((x) => x.remove());
    const yer = $('.sn-yer:not(.sn-yer2)', ana), s = SN[K.id], V = SV(K), ck = `#${anaOnEk(K)}/k/_sinav`;
    document.documentElement.classList.toggle('sn-kip', snKip(K));
    if (yer) yer.innerHTML = !snVar(K) ? '' : s.d === 'kilitli' ? `<button type="button" class="kucuk sn-dug" data-git="${kac(ck)}" aria-label="Sınav pusulası · kilitli" title="Sınav pusulası parolayla açılır">${KILIT_SVG}<span class="sn-uzun">Sınav pusulası · kilitli</span><span class="sn-kisa">Sınav</span></button>`
      : `<button type="button" class="kucuk sn-dug sn-ac" aria-pressed="${!!V}" aria-label="Sınav pusulası" title="Okuma akışındaki sınav işaretleri: aç / kapat">${PUSULA_SVG}<span class="sn-uzun">Sınav pusulası</span><span class="sn-kisa">Pusula</span></button>`;
    // Sınava çalış + Strateji: masada pusulanın yanında, telefonda «⋯» listesinde (ETK-UI-2)
    const yer2 = $('.sn-yer2', ana);
    if (yer2) yer2.innerHTML = snVar(K) && s.d !== 'kilitli' && V ? `<button type="button" class="kucuk sn-dug sn-kipdug" aria-pressed="${snKip(K)}" title="Sınav kipi: olasılığa göre katlanan akış + çalışma yolu">Sınava çalış</button><button type="button" class="kucuk sn-dug" data-git="${kac(ck)}">Strateji</button>` : '';
    const d = $('.dizin', ana);
    if (d) { d.classList.toggle('sn-var', !!V); if (!V) d.classList.remove('sn-yalniz'); }
    if (!V) return;
    if (d) dizinSusle(K, V, d);
    if (snKip(K)) $('.takip', ana)?.insertAdjacentHTML('afterend', snYolHTML(K, V));
    if (tur === 'soru') snSoruSusle(K, V, K.sorular[id]);
    else if (tur === 'bol') snBolSusle(K, V, id);
    const not = $('.sn-not', ana), st = katbOku(K.id);
    if (not) { not.dataset.katSessiz = '1'; not.dataset.katb = 'sinav'; if (st.sinav === 0) not.open = false; delete not.dataset.katSessiz; }
  }
  function dizinSusle(K, V, d) {
    $$('a[href]', d).forEach((a) => {
      const m = /^#[^/]+\/(S\d+)$/.exec(a.getAttribute('href') || ''), n = m && (V.soru || {})[m[1]] ? snN(V.soru[m[1]].olasilik) : 0;
      a.classList.remove('sn-d1', 'sn-d2', 'sn-d3');
      if (n) { a.classList.add(`sn-d${n}`); ($('.pdf', a) || a).insertAdjacentHTML('afterbegin', snNokta(n, true, 'sn-x')); }
    });
    $$('details.bl[data-bl]', d).forEach((x) => { const B = (V.bolum || {})[x.dataset.bl.split('/').slice(1).join('/')]; if (B && B.olasilik) $('summary', x).insertAdjacentHTML('beforeend', snNokta(B.olasilik, true, 'sn-x')); });
    const ic = $('.dizin-ic', d); if (!ic) return;
    const yal = oku(`dk:snsuz:${K.id}`) === '1';
    d.classList.toggle('sn-yalniz', yal);
    ic.insertAdjacentHTML('afterbegin', `<button type="button" class="kucuk sn-x sn-suz" aria-pressed="${yal}">${snNokta(3, true)} Yalnız yüksek olasılık</button>`);
  }
  function snSoruSusle(K, V, q) {
    if (!q) return;
    const S = (V.soru || {})[q.id], b = K.bolumler.find((x) => x.id === q.bolum), ilk = !!b && bolumSorulari(K, b)[0] === q.id;
    if (S && S.olasilik) $('.soru-ust', ana)?.insertAdjacentHTML('beforeend', snNokta(S.olasilik, false, 'sn-x sn-rozet') + (snN(S.olasilik) === 3 ? isr('sik', { sinif: 'sn-x' }) : ''));
    if (ilk && (V.bolum || {})[b.id]) $('.soru-kart', ana)?.insertAdjacentHTML('beforebegin', snSeritHTML(K, V, b, true));
    const ak = (V.akis || []).filter((a) => a.yer === `soru:${q.id}` || (ilk && a.yer === `bol:${q.bolum}`));
    const h = ak.map((a) => snAkisHTML(K, a)).join('') + (S ? snNotHTML(K, S) : '');
    const hedef = $('#yol', ana) || $('.coz-h', ana);
    if (h && hedef) hedef.insertAdjacentHTML('beforebegin', h);
  }
  function snBolSusle(K, V, bid) {
    const b = K.bolumler.find((x) => x.id === bid), h1 = $('.kitap-yer h1', ana); if (!b || !h1) return;
    h1.insertAdjacentHTML('afterend', snSeritHTML(K, V, b, false) + (V.akis || []).filter((a) => a.yer === `bol:${bid}`).map((a) => snAkisHTML(K, a)).join(''));
    $$('.ilgili a.soru-bag', ana).forEach((a) => { const m = /\/(S\d+)$/.exec(a.getAttribute('href') || ''), S = m && (V.soru || {})[m[1]]; if (S && S.olasilik) a.insertAdjacentHTML('beforeend', snNokta(S.olasilik, true, 'sn-x')); });
  }
  // kavram «Sınav» sekmesi
  function sinavKavramHTML(K, k) {
    const X = snKv(K, k.id); if (!X) return '<p class="yok">Bu kavramın sınav notu hazırlanıyor.</p>';
    let h = `<p class="sn-bas">${snNokta(X.olasilik)}${snN(X.olasilik) === 3 ? isr('sik') : ''}${X.neden ? `<span class="sn-neden">${kac(X.neden)}</span>` : ''}</p>${(SV(K).akis || []).filter((a) => a.yer === `kavram:${k.id}`).map((a) => snAkisHTML(K, a, true)).join('')}`;
    if ((X.anlat || []).length) h += `<h3>Anlatım</h3>${snUl(X.anlat)}`;
    for (const kr of X.karsilastir || []) h += karsilastirHTML(kr);
    const hz = (X.kars || []).map((id) => (((K.cozum || {}).kars) || []).find((x) => x.id === id)).filter(Boolean);
    if (hz.length) h += `<h3>Hazır karşılaştırmalar</h3><div class="ilgili">${hz.map((x) => ckBag(`_kars/=${x.id}`, kac(x.baslik), 'soru-bag')).join('')}</div>`;
    if ((X.gercek || []).length) h += `<section class="sn-gercek"><h3>Gerçek hayat köşesi</h3>${X.gercek.map((g) => `<div class="sn-g">${g.baslik ? `<b>${kac(g.baslik)}</b>` : ''}<p>${kac(g.metin || '')}</p></div>`).join('')}</section>`;
    if ((X.sorulus || []).length) h += `<h3>Sınavda nasıl sorulur?</h3>${snUl(X.sorulus)}`;
    if ((X.tuzak || []).length) h += `<h3 class="isr-h">${isr('tuzak')}</h3>${snUl(X.tuzak)}`;
    if ((X.bil || []).length) h += `<div class="sn-bil isr-k"><h3 class="isr-h">${isr('kesin')}<span>Asıl bil</span></h3>${snUl(X.bil)}</div>`;
    if ((X.cift || []).length) h += `<h3>TR ↔ EN <small class="yok">sınav kâğıdına</small></h3>${X.cift.map((c) => ciftHTML(c, 'sinav')).join('')}`;
    return h;
  }
  // çekmece: _sinav
  const snSec = { n: 3 };
  function snOlasHTML(K, V) {
    const n = snSec.n, esit = (o) => !!o && snN(o.olasilik) === n;
    const bl = K.bolumler.filter((b) => esit((V.bolum || {})[b.id])), kv = (K.kavramlar || []).filter((k) => esit((V.kavram || {})[k.id])), sq = soruSirasi(K).filter((q) => esit((V.soru || {})[q.id]));
    const sat = (bag, neden) => `<li>${bag}${neden ? `<span class="sn-sneden">${kac(kisalt(neden, 150))}</span>` : ''}</li>`;
    const grup = (bas, L, f) => (L.length ? `<h4>${bas} <span class="say">${L.length}</span></h4><ul class="sn-sira sn-dz">${L.map(f).join('')}</ul>` : '');
    return grup('Bölümler', bl, (b) => sat(snCip(K, 'bol:' + b.id, true), V.bolum[b.id].neden)) + grup('Kavramlar', kv, (k) => sat(snCip(K, 'kavram:' + k.id, true), V.kavram[k.id].neden)) + grup('Sorular', sq, (q) => sat(snCip(K, 'soru:' + q.id, true), V.soru[q.id].neden)) || '<p class="yok">Bu olasılıkta öğe yok.</p>';
  }
  function sinavCk(K, ne, ayni) {
    const s = SN[K.id] || { d: 'yok' };
    kirintiYaz(K, [['Sınav pusulası', null]]);
    $('#ck-sira').innerHTML = ''; $('#ck-sekme').innerHTML = ustSekme(K, 'sinav');
    if (s.d !== 'acik') {
      $('#ck-baslik').innerHTML = `Sınav pusulası<small>${s.d === 'kilitli' ? 'parolayla açılır · Sınav Atölyesi ile aynı parola' : s.d === 'bekle' ? 'yükleniyor…' : 'bu kitap için hazırlanıyor'}</small>`;
      if (ayni) return;
      ckIc.innerHTML = s.d === 'kilitli' ? `<form class="sn-form" autocomplete="on"><p class="ck-not">Bu kitabın sınav pusulası (olasılıklar, strateji, sınav notları) parolayla açılır. Sınav Atölyesi'nde ya da Defterler'de bu cihazda açtıysan yeniden yazman gerekmez.</p><label for="sn-p">Parola</label><input id="sn-p" type="password" autocomplete="current-password" autocapitalize="none" spellcheck="false" required><label class="sn-hat"><input type="checkbox" id="sn-hat"> Bu cihazda hatırla (30 gün)</label><button type="submit" class="dugme">Aç</button><p class="sn-hata" role="alert" hidden>Parola yanlış.</p></form>`
        : `<p class="ck-not">${s.d === 'bekle' ? 'Yükleniyor…' : 'Bu kitabın sınav pusulası hazırlanıyor.'}</p>`;
      return;
    }
    const V = s.v, on = oku('dk:sinav') !== '0', S = V.sinav || {}, T = V.strateji || {};
    if (snOzelCk(K, ne, ayni)) return;
    $('#ck-baslik').innerHTML = `Sınav pusulası<small>${kac(S.ad || 'Sınav')} · ${kac(K.kod)}</small>`;
    if (ayni) return;
    let gun; try { gun = new Set(JSON.parse(oku(`dk:sngun:${K.id}`) || '[]')); } catch (e) { gun = new Set(); }
    const grup = (bas, L) => ((L || []).length ? `<h4>${bas}</h4>${snUl(L)}` : '');
    const SG = T.son_gun || [];
    ckIc.innerHTML = `<p class="sn-ust"><button type="button" class="kucuk sn-dug sn-ac" aria-pressed="${on}">${PUSULA_SVG}<span>Okuma akışında göster</span></button><span class="yok">${on ? 'Bölüm şeridi, soru rozeti ve sınav notları açık.' : 'Okuma akışındaki işaretler kapalı.'}</span></p>
      ${(T.ozet || []).length ? `<section class="sn-blok"><h3>Puan nereden gelir?</h3>${snUl(T.ozet)}</section>` : ''}${kesinSay(K) ? `<section class="sn-blok"><h3 class="isr-h">${isr('kesin')}<span>Hızlı tekrar</span></h3><p>${ckBag('_kesin', 'Kesin bil listesi: bölüm bölüm kesin adımlar ve asıl bil maddeleri →', 'soru-bag')}</p></section>` : ''}
      ${['bicim', 'kapsam', 'izin', 'not'].some((a) => (S[a] || []).length) ? `<section class="sn-blok"><h3>${kac(S.ad || 'Sınav')}</h3>${grup('Biçim', S.bicim)}${grup('Kapsam', S.kapsam)}${grup('İzin verilenler', S.izin)}${grup('Not', S.not)}</section>` : ''}
      ${(T.sira || []).length ? `<section class="sn-blok sn-yolu"><h3>Çalışma sırası <span class="say">${T.sira.length} adım</span></h3><ol class="sn-sira">${T.sira.map((x) => `<li>${snCip(K, x.git, true)}${x.neden ? `<span class="sn-sneden">${kac(x.neden)}</span>` : ''}</li>`).join('')}</ol></section>` : ''}
      ${SG.length ? `<section class="sn-blok"><h3>Son gün kontrol listesi <span class="say sn-gun-say">${[...gun].filter((i) => i < SG.length).length} / ${SG.length}</span></h3><ul class="sn-gun">${SG.map((x, i) => `<li><label><input type="checkbox" data-i="${i}"${gun.has(i) ? ' checked' : ''}><span>${kac(x)}</span></label></li>`).join('')}</ul></section>` : ''}
      <section class="sn-blok"><h3>Olasılığa göre</h3><div class="sn-sec" role="group" aria-label="Olasılık süzgeci">${[3, 2, 1].map((n) => `<button type="button" class="kucuk" data-n="${n}" aria-pressed="${snSec.n === n}">${snNokta(n, true)} ${SN_AD[n]}</button>`).join('')}</div><div class="sn-olas" aria-live="polite">${snOlasHTML(K, V)}</div></section>`;
  }
  document.addEventListener('click', (e) => {
    const t = e.target.closest('.sn-ac, .sn-suz, .sn-sec button[data-n]'); if (!t || !simdiK) return;
    if (t.classList.contains('sn-ac')) {
      const anada = ana.contains(t);
      sakla('dk:sinav', SV(simdiK) ? '0' : '1'); sinavSusle(simdiK); if (ckDurum) ckYenile();
      if (anada) $('.sn-yer .sn-ac', ana)?.focus({ preventScroll: true }); else $('.sn-ac', ckIc)?.focus({ preventScroll: true });
      return;
    }
    if (t.classList.contains('sn-suz')) { const d = t.closest('.dizin'), on = !d.classList.contains('sn-yalniz'); d.classList.toggle('sn-yalniz', on); t.setAttribute('aria-pressed', String(on)); sakla(`dk:snsuz:${simdiK.id}`, on ? '1' : '0'); return; }
    const s = SN[simdiK.id]; if (!s || s.d !== 'acik') return;
    snSec.n = +t.dataset.n;
    $$('.sn-sec button', ckIc).forEach((x) => x.setAttribute('aria-pressed', String(+x.dataset.n === snSec.n)));
    const o = $('.sn-olas', ckIc); if (o) o.innerHTML = snOlasHTML(simdiK, s.v);
  });
  document.addEventListener('change', (e) => {
    if (!e.target.closest || !e.target.closest('.sn-gun') || !simdiK) return;
    const L = $$('.sn-gun input[type=checkbox]', ckIc), on = L.map((x, i) => (x.checked ? i : -1)).filter((i) => i >= 0);
    sakla(`dk:sngun:${simdiK.id}`, JSON.stringify(on));
    const say = $('.sn-gun-say', ckIc); if (say) say.textContent = `${on.length} / ${L.length}`;
  });
  document.addEventListener('submit', async (e) => {
    const f = e.target.closest && e.target.closest('.sn-form'); if (!f) return;
    e.preventDefault();
    const K = ckDurum && ckDurum.K, s = K && SN[K.id]; if (!s || !s.b) return;
    const inp = $('#sn-p', f), hata = $('.sn-hata', f), dg = $('button[type=submit]', f);
    hata.hidden = true; dg.disabled = true; dg.textContent = 'Açılıyor…';
    try {
      const k = await snTuret(inp.value), v = await snCoz(k, s.b);
      snK = k; snSakla(k, $('#sn-hat', f).checked); sakla('dk:sinav', '1');
      SN[K.id] = { d: 'acik', b: s.b, v };
      Object.keys(SN).filter((x) => x !== K.id && SN[x].d === 'kilitli').forEach((x) => sinavYukle({ id: x }));
      snYenile(K.id);
    } catch (err) { hata.hidden = false; dg.disabled = false; dg.textContent = 'Aç'; inp.select(); }
  });

  /* ---------- ETK Ö5 (26 Kas): adım adım oynatıcı · «Şöyle olsaydı?» · ayrım · hazır karşılaştırma · eklenti kancası ----------
     Veri: cozum/<kitap>.json → K.cozum = {soru: {S: {adim, alternatif, ayrim}}, kars: [...]} (tools/ek_birlestir.mjs). Yoksa oynatıcı
     kitabın kendi adımlarını (rehber / adimlar) gösterir; «Şöyle olsaydı?» ve ayrım bölümü çıkmaz. Görünüm: Adım adım | Liste (dk:cozkip;
     tercih yoksa cozum verisi olan soruda Adım adım). Çekmece: _kars (liste) · _kars/=<id> (hazır karşılaştırma).
     Eklenti: hesap aracında "tur": "eklenti" → _hesap/<id> modülü (eklenti/<ad>.js) ve verisini tembel yükler; modül
     window.DK_EKLENTI['<ad>'] = {ac(kap, {veri, kitap, git})} tanımlar (ac {dur()} döndürürse çekmece değişince çağrılır). */
  const CZ = (K) => (K && K.cozum && typeof K.cozum === 'object' ? K.cozum : {});
  const czSoru = (K, sid) => ((CZ(K).soru || {})[sid]) || null;
  const czKars = (K) => (Array.isArray(CZ(K).kars) ? CZ(K).kars : []);
  const oynAdim = {};
  let cozZorla = '';
  function oynAdimlar(K, q) {
    const C = czSoru(K, q.id);
    if (C && (C.adim || []).length) return C.adim.map((a) => ({ ne: kac(a.ne || ''), en: a.en ? kac(a.en) : '', islem: kac(a.islem || ''), sonuc: kac(a.sonuc || ''), neden: kac(a.neden || ''), kontrol: kac(a.kontrol || ''), dikkat: kac(a.dikkat || ''), kesin: a.kesin === true, kn: kac(a.kesin_neden || ''), fx: a.kesin === true ? isrFormul(K, q, a) : '', kv: a.kavram ? [a.kavram] : [] }));
    const R = q.rehber;
    if (R && (R.adimlar || []).length) return R.adimlar.map((a) => ({ bas: kac(a.kisa || ''), ne: a.ne || '', islemH: a.nasil || '', sonuc: a.sonuc || '', neden: a.neden || '', kv: a.kavram ? [a.kavram] : [] }));
    return (q.adimlar || []).map((a) => ({ html: a.html || '', kv: a.kavram || [] }));
  }
  const czZengin = (K, q) => !!(czSoru(K, q.id) && (czSoru(K, q.id).adim || []).length);
  const cozKipHTML = (K, q) => (oynAdimlar(K, q).length ? `<div class="coz-kip" role="group" aria-label="Çözüm görünümü"><button type="button" data-kip="oyn" aria-pressed="false">${IK('<path d="M7 5v14l11-7z"/>')}<span>Adım adım</span></button><button type="button" data-kip="liste" aria-pressed="false">${IK('<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>')}<span>Liste</span></button></div>` : '');
  function oynHTML(K, q) {
    const A = oynAdimlar(K, q), n = A.length; if (!n) return '';
    const ing = ingDers(K), ksv = A.some((a) => a.kesin);
    const li = (a, i) => `<li class="oyn-a${a.kesin ? ' isr-k' : ''}" data-i="${i}" hidden>${a.html ? a.html : `${a.kesin ? `<p class="isr-bas">${isr('kesin')}${a.kn ? `<span class="isr-neden">${a.kn}</span>` : ''}</p>` : ''}<p class="oyn-ne">${a.bas ? `<b>${a.bas}</b> · ` : ''}${a.ne}</p>${a.en ? `<p class="oyn-en">${ing ? isr('yaz', a.kesin ? {} : { kucuk: true }) : ''}<span lang="en">${a.en}</span></p>` : ''}${a.fx || ''}${a.islem ? `<div class="oyn-islem">${a.islem}</div>` : a.islemH ? `<div class="oyn-islem oyn-tex">${a.islemH}</div>` : ''}${a.sonuc ? `<p class="oyn-sonuc">${isr('sonuc')}<b>${a.sonuc}</b></p>` : ''}${a.neden ? `<details class="oyn-neden"><summary>Neden?</summary><p>${a.neden}</p></details>` : ''}${a.kontrol ? `<p class="oyn-kontrol">${isr('denetle')}${a.kontrol}</p>` : ''}${a.dikkat ? `<p class="oyn-dikkat">${isr('tuzak')}${a.dikkat}</p>` : ''}`}${bagHTML(K, a.kv, q.id)}</li>`;
    return `<section class="oyn${ksv ? ' ks-var' : ''}" id="oyn" aria-label="Adım adım çözüm"><div class="oyn-ust"><div class="oyn-cubuk" role="group" aria-label="Adıma git">${A.map((a, i) => `<button type="button" class="oyn-p${a.kesin ? ' ks' : ''}" data-i="${i}" aria-label="${i + 1}. adım${a.kesin ? ' · kesin bil' : ''}">${a.kesin ? KS_YILDIZ : ''}</button>`).join('')}</div><span class="oyn-say" aria-live="polite"></span>${ksv ? `<button type="button" class="kucuk ks-dug" aria-pressed="${ksYal()}" title="Kesin adımlar öne çıksın; öbür adımlar tek satıra iner">${isr('kesin', { kucuk: true })}<span>Yalnız kesin bil</span></button>` : ''}</div>
      <ol class="oyn-liste">${A.map(li).join('')}</ol>
      <div class="oyn-dug"><button type="button" class="kucuk oyn-geri">‹ Önceki</button><button type="button" class="dugme oyn-ileri">1. adımı göster</button><button type="button" class="kucuk oyn-hepsi">Hepsi</button><button type="button" class="kucuk oyn-basa">Baştan</button></div></section>`;
  }
  function oynKur(K, q, listeGoster) {
    const kok = $('#oyn', ana), kip = $('.coz-kip', ana); if (!kok || !kip) return;
    const L = $$('.oyn-a', kok), n = L.length, anah = `${K.id}/${q.id}`;
    // ISARET: «Yalnız kesin bil» açıkken bütün adımlar görünür (kesin olmayanlar tek satır), ileri / geri kesin adımlar arasında
    const KS = L.map((li, i) => (li.classList.contains('isr-k') ? i : -1)).filter((i) => i >= 0);
    const ksKip = () => KS.length > 0 && document.documentElement.classList.contains('ks-yal');
    const ksSonraki = (m) => KS.find((i) => i > m - 1), ksOnceki = (m) => [...KS].reverse().find((i) => i < m - 1);
    const goster = (m, otele) => {
      m = Math.max(0, Math.min(n, m)); oynAdim[anah] = m;
      const ks = ksKip();
      L.forEach((li, i) => { const ac = ks || i < m; if (ac && li.hidden && otele) li.classList.add('yeni'); li.hidden = !ac; li.classList.toggle('simdi', i === m - 1); });
      $$('.oyn-p', kok).forEach((b, i) => { b.classList.toggle('dolu', ks ? KS.includes(i) : i < m); b.setAttribute('aria-current', String(i === m - 1)); });
      $('.oyn-say', kok).textContent = ks ? (m && KS.includes(m - 1) ? `Kesin adım ${KS.indexOf(m - 1) + 1} / ${KS.length} · adım ${m} / ${n}` : `${KS.length} kesin adım · ${n} adımın içinde`) : m ? `Adım ${m} / ${n}` : `${n} adım · önce kendin dene`;
      const il = $('.oyn-ileri', kok);
      if (ks) { il.hidden = ksSonraki(m) == null; il.textContent = m ? 'Sonraki kesin adım ›' : 'İlk kesin adım ›'; $('.oyn-geri', kok).hidden = ksOnceki(m) == null; $('.oyn-hepsi', kok).hidden = true; }
      else { il.hidden = m >= n; il.textContent = m ? 'Sonraki adım ›' : '1. adımı göster'; $('.oyn-geri', kok).hidden = m === 0; $('.oyn-hepsi', kok).hidden = m >= n; }
      $('.oyn-basa', kok).hidden = m === 0;
      if (ana.dataset.cozkip === 'oyn') { const s = $('#cozum-son', ana); if (s) s.hidden = !ks && m < n; }
      if (otele && m) { if (!SB.el) sabitTut($('.oyn-ileri', kok)); sbYeniGoster(L[m - 1]); }
      if (window.__hudGoster) window.__hudGoster();
    };
    kok.__yenile = () => goster(oynAdim[anah] || 0, false);
    const kipYaz = (k, kullanici) => {
      ana.dataset.cozkip = k;
      $$('button', kip).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.kip === k)));
      // başlıktaki adım sayısı görünen çözümünki: oynatıcıda açıklamalı adımlar, listede kitabın adımları
      const cs = $('.coz-say', ana); if (cs) { const nk = +cs.dataset.kitap || 0; cs.textContent = k === 'oyn' && nk && n !== nk ? `açıklamalı ${n} adım · kitapta ${nk}` : `${k === 'oyn' ? n : nk} adım`; }
      if (k === 'oyn') goster(oynAdim[anah] || 0, false); else listeGoster();
      if (kullanici) sakla('dk:cozkip', k);
    };
    kip.addEventListener('click', (e) => { const b = e.target.closest('button[data-kip]'); if (b) kipYaz(b.dataset.kip, true); });
    kok.addEventListener('click', (e) => {
      const sli = e.target.closest('.oyn-a'); // süzgeç kipinde tek satıra inmiş adım: başlığına dokun → açılır / kapanır
      if (sli && ksKip() && !sli.classList.contains('isr-k') && (!sli.classList.contains('ks-ac') || e.target.closest('.oyn-ne')) && !e.target.closest('button, a, summary, input, select, textarea')) { sli.classList.toggle('ks-ac'); return; }
      const b = e.target.closest('button'); if (!b || !kok.contains(b) || b.closest('.bag')) return;
      const m = oynAdim[anah] || 0;
      if (b.classList.contains('oyn-ileri')) { if (ksKip()) { const i = ksSonraki(m); if (i != null) goster(i + 1, true); } else goster(m + 1, true); }
      else if (b.classList.contains('oyn-geri')) { if (ksKip()) { const i = ksOnceki(m); if (i != null) goster(i + 1, true); } else goster(m - 1, false); }
      else if (b.classList.contains('oyn-hepsi')) goster(n, false);
      else if (b.classList.contains('oyn-basa')) goster(0, false);
      else if (b.classList.contains('oyn-p')) goster(+b.dataset.i + 1, true);
    });
    kok.addEventListener('keydown', (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
      e.preventDefault(); e.stopPropagation(); const m = oynAdim[anah] || 0, sag = e.key === 'ArrowRight';
      if (ksKip()) { const i = sag ? ksSonraki(m) : ksOnceki(m); if (i != null) goster(i + 1, true); } else goster(m + (sag ? 1 : -1), sag);
    });
    const t = oku('dk:cozkip');
    kipYaz(cozZorla || (t === 'oyn' || t === 'liste' ? t : czZengin(K, q) ? 'oyn' : 'liste'), false);
  }
  // «Şöyle olsaydı?» kartları + ayrım + ilgili hazır karşılaştırmalar (çözüm listesinin altında, katlı)
  function syHTML(K, q) {
    const C = czSoru(K, q.id) || {}, A = C.alternatif || [], Y = C.ayrim || [];
    const kr = czKars(K).filter((x) => (x.kavram || []).some((id) => (q.kavram || []).includes(id)));
    if (!A.length && !Y.length && !kr.length) return '';
    return `<section class="sy" aria-label="Şöyle olsaydı ve ayrım">
      ${A.length ? `<details class="sy-blok sy-alt"><summary><span class="sy-bas">Şöyle olsaydı?</span><span class="say">${A.length} kart · önce tahmin et, sonra aç</span></summary><div class="sy-kartlar">${A.map((x, i) => syKart(K, q, x, i)).join('')}</div></details>` : ''}
      ${Y.length ? `<details class="sy-blok sy-ay"><summary><span class="sy-bas">Ayrım</span><span class="say">${Y.length} soru · neden bu, öbürü değil?</span></summary>${Y.map((y) => `<details class="ay"><summary>${kac(y.soru)}</summary><p>${kac(y.cevap)}</p>${y.en ? `<p class="oyn-en" lang="en">${kac(y.en)}</p>` : ''}</details>`).join('')}</details>` : ''}
      ${kr.length ? `<div class="sn-cipler sy-kars"><span class="yok">Karşılaştır:</span> ${kr.map((x) => `<button type="button" class="sn-cip" data-git="${kac(`#${K.id}/${q.id}/k/_kars/=${x.id}`)}">${kac(x.baslik)}</button>`).join('')}</div>` : ''}</section>`;
  }
  const HESAP_SVG = IK('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h1M12 11h1M16 11h0M8 15h1M12 15h1M8 18h1M12 18h4"/>');
  function syKart(K, q, x, i) {
    const ne = String(x.ne || '').replace(/^\s*[ŞşSs]öyle olsaydı\s*[:?…]*\s*/u, '');
    const h = x.hesap && hesapBul(K, x.hesap.id);
    let hs = '';
    if (h && h.tur !== 'eklenti') {
      const hz = (h.hazir || []).findIndex((z) => z.soru === q.id), ovr = Object.entries(x.hesap.deger || {}).filter(([, v]) => isFinite(+v)).map(([g, v]) => `${g}=${+v}`).join(',');
      hs = `<button type="button" class="kucuk sy-hs" data-git="${kac(`#${K.id}/${q.id}/k/_hesap/${h.id}/${hz >= 0 ? hz : '-'}${ovr ? '/' + ovr : ''}`)}">${HESAP_SVG}<span>Hesapla: ${kac(iki(h.ad).tr)}</span></button>`;
    }
    return `<article class="sy-k"><p class="sy-ne"><span class="sy-no">${i + 1}</span>${kac(ne)}</p>${x.en ? `<p class="oyn-en" lang="en">${kac(x.en)}</p>` : ''}<button type="button" class="kucuk sy-ac" aria-expanded="false" data-et="Önce tahmin et · sonucu göster">Önce tahmin et · sonucu göster</button><div class="sy-cevap" hidden><p class="sy-sonuc"><span class="oyn-et">Yeni sonuç</span> <b>${kac(x.sonuc || '')}</b></p>${x.neden ? `<p><span class="oyn-et">Neden</span> ${kac(x.neden)}</p>` : ''}</div>${hs}</article>`;
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.sy-ac'); if (!b) return;
    const c = b.nextElementSibling; if (!c) return;
    const ac = c.hidden; c.hidden = !ac; b.setAttribute('aria-expanded', String(ac)); b.textContent = ac ? 'Gizle' : (b.dataset.et || 'Göster');
  });
  // hazır karşılaştırma: tablo (telefonda satır yığını) · ne zaman hangisi · örnek durumlar · kendini dene
  const sutunAd = (s) => (typeof s === 'string' ? s : (s && (s.tr || s.en)) || '');
  // sut: sütun başlığı HTML'i, ad: düz sütun adı (telefonda hücre etiketi), satir: [{ad (HTML), h: [hücre HTML]}]
  const karsTabloHTML = (sut, ad, satir) => `<div class="kz-kap"><table class="kz-t"><thead><tr><th scope="col"><span class="gizli">Özellik</span></th>${sut.map((s, i) => `<th scope="col" class="kz-s es${i % ES_RENK}">${s}</th>`).join('')}</tr></thead><tbody>${satir.map((r) => `<tr><th scope="row">${r.ad}</th>${sut.map((s, i) => `<td data-b="${kac(ad[i])}">${(r.h || [])[i] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  function karsHazirHTML(K, x) {
    const S = (x.sutun || []).map(sutunAd);
    let h = karsTabloHTML(S.map(kac), S, (x.satir || []).map((r) => ({ ad: kac(r.ad), h: S.map((_, i) => `${kac((r.h || [])[i] ?? '')}${(r.en || [])[i] ? `<span class="kz-en" lang="en">${kac(r.en[i])}</span>` : ''}`) })));
    if ((x.sec || []).length) h += `<h3>Ne zaman hangisi?</h3>${snUl(x.sec)}`;
    if ((x.ornek || []).length) h += `<h3>Örnek durumlar <small class="yok">· önce sen seç</small></h3><div class="sy-kartlar">${x.ornek.map((o, i) => `<article class="sy-k"><p class="sy-ne"><span class="sy-no">${i + 1}</span>${kac(o.durum || '')}</p><button type="button" class="kucuk sy-ac" aria-expanded="false" data-et="Hangisini seçerdin? · cevabı göster">Hangisini seçerdin? · cevabı göster</button><div class="sy-cevap" hidden><p class="sy-sonuc"><span class="oyn-et">Seçim</span> <b>${kac(o.secim || '')}</b></p>${o.neden ? `<p><span class="oyn-et">Neden</span> ${kac(o.neden)}</p>` : ''}</div></article>`).join('')}</div>`;
    if ((x.dene || []).length) h += `<div class="kz-dene" data-kz="${kac(x.id)}" data-i="0"><h3>Kendini dene</h3><div class="kz-soru"></div></div>`;
    const kv = kvSira(K, x.kavram);
    if (kv.length) h += `<h3>Kavramlar</h3><div class="ilgili">${kv.map((k) => ckBag(`${k.id}/tanim`, `${kac(k.sembol)} · ${kac(k.ad)}`, 'soru-bag')).join('')}</div>`;
    return h;
  }
  function kzDeneYaz(d) {
    const x = czKars(simdiK).find((y) => y.id === d.dataset.kz); if (!x || !(x.dene || []).length) return;
    const L = x.dene, i = (+d.dataset.i || 0) % L.length, q = L[i];
    $('.kz-soru', d).innerHTML = `<p class="kr-s">${i + 1}/${L.length} · ${kac(q.s)}</p><div class="kr-sec">${(q.secenek || []).map((s, j) => `<button type="button" class="kucuk" data-j="${j}">${kac(s)}</button>`).join('')}</div><p class="kr-sonuc" aria-live="polite"></p><button type="button" class="kucuk kz-sonraki" hidden>${L.length > 1 ? 'Sonraki soru ›' : 'Baştan'}</button>`;
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.kz-dene button'); if (!b || !simdiK) return;
    const d = b.closest('.kz-dene'), x = czKars(simdiK).find((y) => y.id === d.dataset.kz); if (!x) return;
    if (b.classList.contains('kz-sonraki')) { d.dataset.i = (+d.dataset.i || 0) + 1; kzDeneYaz(d); return; }
    const q = x.dene[(+d.dataset.i || 0) % x.dene.length], ok = +b.dataset.j === +q.c;
    $$('.kr-sec button', d).forEach((y) => { y.disabled = true; if (+y.dataset.j === +q.c) y.classList.add('dogru'); });
    if (!ok) b.classList.add('yanlis');
    const so = $('.kr-sonuc', d); so.className = `kr-sonuc ${ok ? 'dogru' : 'yanlis'}`; so.textContent = `${ok ? 'Doğru.' : `Yanlış — doğrusu: ${(q.secenek || [])[q.c] || ''}.`} ${q.neden || ''}`;
    $('.kz-sonraki', d).hidden = false;
  });
  function karsCk(K, ne, ayni) {
    const L = czKars(K), x = String(ne || '').startsWith('=') ? L.find((y) => y.id === ne.slice(1)) : null;
    $('#ck-sekme').innerHTML = ustSekme(K, x ? '' : 'kars');
    if (x) {
      kirintiYaz(K, [['Karşılaştırmalar', '_kars'], [kac(kisalt(x.baslik, 40)), null]]);
      $('#ck-baslik').innerHTML = `${kac(x.baslik)}<small>${(x.sutun || []).length} seçenek yan yana</small>`;
      const i = L.indexOf(x), o = L[i - 1], s = L[i + 1];
      $('#ck-sira').innerHTML = siraHTML(o && [`_kars/=${o.id}`, kac(kisalt(o.baslik, 30))], `${i + 1} / ${L.length}`, s && [`_kars/=${s.id}`, kac(kisalt(s.baslik, 30))]);
      if (ayni) return;
      ckIc.innerHTML = karsHazirHTML(K, x);
      $$('.kz-dene', ckIc).forEach(kzDeneYaz);
      return;
    }
    const ids = String(ne || '').split('~').filter((id) => kavramBul(K, id)).slice(0, SEPET_EN);
    if (ids.length) {
      const A = ids.map((id) => kavramBul(K, id));
      kirintiYaz(K, [['Karşılaştırmalar', '_kars'], [A.map((k) => kac(k.sembol)).join(' ↔ '), null]]);
      $('#ck-baslik').innerHTML = `${A.map((k) => kac(k.ad)).join(' ↔ ')}<small>${A.length} kavram yan yana</small>`;
      $('#ck-sira').innerHTML = '';
      if (ayni) return;
      ckIc.innerHTML = karsOzelHTML(K, ids);
      $$('.kz-dene', ckIc).forEach(kzDeneYaz); texDoldur(ckIc, K);
      return;
    }
    const sp = sepetOku(K.id).filter((id) => kavramBul(K, id));
    kirintiYaz(K, [['Karşılaştırmalar', null]]);
    $('#ck-baslik').innerHTML = `Karşılaştırmalar<small>${L.length ? `${L.length} hazır karşılaştırma · ` : ''}kavram seç, yan yana gör</small>`;
    $('#ck-sira').innerHTML = '';
    if (ayni) return;
    ckIc.innerHTML = `<p class="ck-not">Kavramları yan yana görmek için atlasta ya da kavram çekmecesinde «＋» düğmesine dokun (2–4 kavram); seçtiklerin aşağıdaki sepette toplanır.</p>${sp.length >= 2 ? `<p>${ckBag(`_kars/${sp.join('~')}`, `Seçtiklerini yan yana gör (${sp.length})`, 'dugme')}</p>` : ''}${L.length ? `<h3>Hazır karşılaştırmalar</h3><ul class="kv-liste">${L.map((y) => `<li>${ckBag(`_kars/=${y.id}`, `<span class="ad">${kac(y.baslik)}</span><span class="say">${(y.sutun || []).map((x) => kac(sutunAd(x))).join(' · ')}</span>`, 'kv-sat')}</li>`).join('')}</ul>` : ''}<h3>Kavramlar</h3><ul class="kv-liste">${(K.kavramlar || []).map((k) => kavramSatir(K, k)).join('')}</ul>`;
  }
  // eklenti kancası (302E SYNOP çözücü gibi; modülü içerik ajanı yazar)
  const EKL = {}, EKV = {};
  function eklentiYukle(h) {
    const m = String(h.modul || ''), ad = (/^eklenti\/([\w-]+)\.js$/.exec(m) || [])[1];
    if (!ad) return Promise.reject(new Error('modül yolu geçersiz'));
    const mp = EKL[m] || (EKL[m] = new Promise((ok, red) => {
      if (window.DK_EKLENTI && window.DK_EKLENTI[ad]) { ok(); return; }
      const s = document.createElement('script'); s.src = m; s.onload = () => ok(); s.onerror = () => { delete EKL[m]; red(new Error('modül yüklenemedi')); }; document.head.append(s);
    }));
    const v = String(h.veri || '');
    const vp = !v ? Promise.resolve(null) : EKV[v] || (EKV[v] = fetch(v, { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error('veri yüklenemedi'); return r.json(); }).catch((e) => { delete EKV[v]; throw e; }));
    return Promise.all([mp, vp]).then(([, veri]) => ({ ad, veri }));
  }
  function ekGit(K, hedef) {
    const t = String(hedef || '');
    if (t.startsWith('#')) { location.hash = t; return; }
    const i = t.indexOf(':'), tur = t.slice(0, i), id = t.slice(i + 1), on = ckDurum ? ckDurum.onEk : K.id;
    if (tur === 'soru') anaGit(`#${K.id}/${id}`, true);
    else if (tur === 'bol') anaGit(`#${K.id}/bol/${id}`, true);
    else if (tur === 'kavram') location.hash = `#${on}/k/${id}/tanim`;
    else if (tur === 'sozluk') location.hash = `#${on}/k/_sozluk/${id}`;
    else if (tur === 'hesap') location.hash = `#${on}/k/_hesap/${id}`;
  }
  function eklentiHTML(K, h, baslik) {
    const ad = iki(h.ad), kv = kvSira(K, h.kavram), sq = (h.soru || []).filter((s) => K.sorular[s]);
    return `<section class="hs ek" data-hs="${kac(h.id)}" aria-label="Etkileşimli araç: ${kac(ad.tr)}">${baslik ? `<h3 class="hs-bas">${kac(ad.tr)}${ad.en ? ` <small lang="en">${kac(ad.en)}</small>` : ''}</h3>` : ''}${h.aciklama ? ciftHTML(iki(h.aciklama)) : ''}<div class="ek-kap" aria-live="polite"><p class="yok">Yükleniyor…</p></div>${kv.length || sq.length ? `<div class="ilgili">${kv.map((k) => ckBag(`${k.id}/tanim`, `${kac(k.sembol)} · ${kac(k.ad)}`, 'soru-bag')).join('')}${sq.map((s) => soruCip(K, s)).join('')}</div>` : ''}</section>`;
  }
  function eklentiKur(kok, K, h) {
    const kap = $$('.hs.ek', kok).find((x) => x.dataset.hs === h.id)?.querySelector('.ek-kap'); if (!kap) return;
    eklentiYukle(h).then(({ ad, veri }) => {
      if (!kap.isConnected) return;
      const E = window.DK_EKLENTI && window.DK_EKLENTI[ad];
      if (!E || typeof E.ac !== 'function') throw new Error('eklenti tanımı yok');
      kap.innerHTML = '';
      const r = E.ac(kap, { veri, kitap: K.id, git: (hedef) => ekGit(K, hedef) });
      if (r && typeof r.dur === 'function') animTutucu = r;
    }).catch((e) => { if (kap.isConnected) kap.innerHTML = `<p class="yok">Bu araç şu an açılamadı (${kac(e.message)}).</p>`; });
  }

  /* ---------- ETK Ö2 (26 Kas): katla / aç ----------
     #<kitap>/akis[/<S>] «Kitap akışı · yalnız başlıklar»: bölümler katlanır; her soru katlı kart (başlık + tek satır öz + rozetler),
     açınca soru metni yerinde (tembel). Araç çubuğu: Tümünü aç · Tümünü kapat · Yalnız başlıklar (+ kilit açıksa Yalnız yüksek olasılık).
     Soru sayfasında Yol haritası, TR ↔ EN, şekil, Sınav notu, Şöyle olsaydı, Ayrım, kod, PDF metni katlanır; durum kitap başına saklanır.
     Durum: dk:kat:<kitap> = {bk: kapalı bölümler, s: açık kartlar} · dk:katb:<kitap> = {yol|dil|sekil|sinav|sy|ay|kod|pdf: 0|1}.
     Klavye: j / k sonraki / önceki soru (akışta kart odağı), o odaktaki ya da ekrandaki ilk bloğu aç / kapat. */
  const katOku = (kid) => { try { const x = JSON.parse(oku(`dk:kat:${kid}`) || 'null') || {}; return { bk: new Set(x.bk || []), s: new Set(x.s || []) }; } catch (e) { return { bk: new Set(), s: new Set() }; } };
  const katYaz = (kid, st) => sakla(`dk:kat:${kid}`, JSON.stringify({ bk: [...st.bk], s: [...st.s] }));
  const katbOku = (kid) => { try { return JSON.parse(oku(`dk:katb:${kid}`) || '{}') || {}; } catch (e) { return {}; } };
  const katbYaz = (kid, tip, v) => { const x = katbOku(kid); x[tip] = v; sakla(`dk:katb:${kid}`, JSON.stringify(x)); };
  const duzMetin = (h) => String(h || '').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<figure[\s\S]*?<\/figure>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').replace(/ ([,.;:)\]])/g, '$1').replace(/([(\[]) /g, '$1').trim(); // etiket yerine konan boşluk noktalamadan önce kalmasın («çizgisi , alt» → «çizgisi, alt»)
  window.__dkMetin = { duz: duzMetin }; // sınama kancası (etk_test: düz metin noktalaması)
  const ozSat = (q) => kisalt(duzMetin(q.oz) || duzMetin(q.rehber && q.rehber.istiyor) || duzMetin(q.soru), 150);
  const asilSatir = (K, V, q) => { const B = (V.bolum || {})[q.bolum] || {}; return ((B.asil || [])[0]) || ((V.soru || {})[q.id] || {}).neden || ozSat(q); };
  // ETK-UI-2: sınav kipinde kitap akışının başında kavramların olasılık listesi (yüksek açık, orta katlı);
  // çipe dokununca kavram çekmecede açılır (sınav notu varsa Sınav sekmesi)
  function snKvListeHTML(K, V) {
    const L = (n) => (K.kavramlar || []).filter((k) => snN(((V.kavram || {})[k.id] || {}).olasilik) === n);
    const y = L(3), o = L(2); if (!y.length && !o.length) return '';
    const cipler = (A) => `<div class="sn-cipler">${A.map((k) => snCip(K, 'kavram:' + k.id)).join('')}</div>`;
    return `<section class="sn-kvl" aria-label="Kavramlar: sınav olasılığı"><h2 class="sn-kvl-bas">Kavramlar <span class="say">olasılığa göre · dokun: yan çekmecede açılır</span></h2>
      ${y.length ? `<div class="sn-kvl-g" data-n="3"><p class="sn-kvl-et">${snNokta(3)} <span class="say">${y.length} kavram</span></p>${cipler(y)}</div>` : ''}
      ${o.length ? `<details class="sn-kvl-g sn-kvl-orta" data-n="2"><summary>${snNokta(2)} <span class="say">${o.length} kavram</span></summary>${cipler(o)}</details>` : ''}</section>`;
  }
  function akisGoster(K, hedef, icten) {
    document.title = `Kitap akışı · ${K.kod}`;
    ana.dataset.sayfa = 'akis:'; delete ana.dataset.cozkip;
    const st = katOku(K.id), V = SV(K), kip = snKip(K), yal = !!V && oku(`dk:snsuz:${K.id}`) === '1';
    const bolN = (b) => (V && (V.bolum || {})[b.id] ? snN(V.bolum[b.id].olasilik) : 0), sN = (q) => (V && (V.soru || {})[q.id] ? snN(V.soru[q.id].olasilik) : 0);
    const kart = (q) => {
      const n = sN(q), acik = kip ? n === 3 : st.s.has(q.id) || q.id === hedef;
      if (kip && n === 1) return `<p class="ak-asil" data-n="1"><a href="#${K.id}/${q.id}"><b>${q.id}</b> ${kac(q.baslik)}</a> <span class="yok">· az çıkar — asıl bil:</span> ${kac(asilSatir(K, V, q))}</p>`;
      const ad = q.rehber ? q.rehber.adimlar.length : (q.adimlar || []).length;
      return `<details class="ak-s" id="ak-${q.id}" data-s="${q.id}" data-n="${n}"${acik ? ' open' : ''}><summary><span class="ak-no">${q.id}</span><span class="ak-ad">${kac(q.baslik)}</span><span class="ak-rz">${n ? snNokta(n, true) : ''}<span class="ak-say">${ad} adım · s. ${q.pdf_soru ?? '—'}</span></span><span class="ak-oz">${kac(ozSat(q))}</span></summary><div class="ak-ic"></div></details>`;
    };
    const bolumler = K.bolumler.filter((b) => bolumSorulari(K, b).length);
    ana.innerHTML = `<div class="kitap-yer"><nav class="dizin" aria-label="Bölümler ve sorular">${dizinHTML(K, 'akis')}</nav><div>${takipHTML(K, null)}
      <h1>Kitap akışı <small class="yok">· yalnız başlıklar</small></h1>
      ${kesinSay(K) ? isrLejantHTML(K, 'akis') : ''}<p class="ak-not yok">Bir soruya dokun: metni burada açılır. <kbd>j</kbd> <kbd>k</kbd> sonraki / önceki soru, <kbd>o</kbd> aç / kapat.</p>
      <div class="ak-arac" role="group" aria-label="Katla / aç"><button type="button" class="kucuk" data-ak="ac">Tümünü aç</button><button type="button" class="kucuk" data-ak="kapat">Tümünü kapat</button><button type="button" class="kucuk" data-ak="baslik">Yalnız başlıklar</button>${V ? `<button type="button" class="kucuk sn-yalak" data-ak="yal" aria-pressed="${yal}">${snNokta(3, true)} Yalnız yüksek olasılık</button>` : ''}</div>
      ${kip && V ? snKvListeHTML(K, V) : ''}
      <div class="ak-liste${yal ? ' sn-yalniz' : ''}">${bolumler.map((b) => {
        const L = bolumSorulari(K, b).map((s) => K.sorular[s]), n = bolN(b);
        const acik = kip ? n !== 1 : !st.bk.has(b.id) || L.some((q) => q.id === hedef);
        return `<section class="ak-b" data-b="${kac(b.id)}" data-n="${n}"><details class="ak-bd"${acik ? ' open' : ''}><summary><span class="ak-bad">${kac(bolumAd(K, b))}</span><span class="say">${L.length} soru</span>${n ? snNokta(n) : ''}</summary>${V && kip && (V.bolum || {})[b.id] ? snSeritHTML(K, V, b, true).replace('class="sn-x sn-serit"', 'class="sn-serit"') : ''}${L.map(kart).join('')}<p class="ak-bag"><a href="#${K.id}/bol/${kac(b.id)}">Bölümün konu sayfası →</a></p></details></section>`;
      }).join('')}</div></div></div>`;
    $$('.ak-s[open]', ana).forEach((d) => akisKartAc(K, d));
    takipBagla(K);
    sinavSusle(K, false);
    if (hedef) { const d = $(`#ak-${CSS.escape(hedef)}`, ana); if (d) setTimeout(() => { d.scrollIntoView({ block: 'start', behavior: icten ? 'auto' : 'smooth' }); $('summary', d).focus({ preventScroll: true }); }, 60); }
  }
  function akisKartAc(K, d) {
    const ic = $('.ak-ic', d); if (!ic || ic.childElementCount) return;
    const q = K.sorular[d.dataset.s]; if (!q) return;
    const S = SV(K) && (SV(K).soru || {})[q.id];
    ic.innerHTML = `<div class="soru-govde">${q.soru || ''}</div>${S ? `<p class="ak-sn">${snNokta(S.olasilik)} ${kac(S.neden || '')}${S.ipucu ? ` · <b>İlk adım:</b> ${kac(S.ipucu)}` : ''}</p>` : ''}<p class="ak-dug"><a class="dugme" href="#${K.id}/${q.id}">Soruyu aç</a>${oynAdimlar(K, q).length ? `<a class="dugme ikincil" href="#${K.id}/${q.id}/o0">Adım adım çöz</a>` : ''}</p>`;
    texDoldur(ic, K); glifDuzelt(ic);
    $$('table', ic).forEach((t) => { if (!t.parentElement.classList.contains('tablo-kap')) { const k = document.createElement('div'); k.className = 'tablo-kap'; t.before(k); k.append(t); } });
  }
  document.addEventListener('toggle', (e) => {
    const d = e.target; if (!d.matches || !simdiK) return;
    const kid = simdiK.id;
    if (d.matches('.ak-s')) { if (d.open) akisKartAc(simdiK, d); if (!snKip(simdiK)) { const st = katOku(kid); if (d.open) st.s.add(d.dataset.s); else st.s.delete(d.dataset.s); katYaz(kid, st); } }
    else if (d.matches('.ak-bd')) { if (!snKip(simdiK)) { const st = katOku(kid), id = d.closest('.ak-b').dataset.b; if (d.open) st.bk.delete(id); else st.bk.add(id); katYaz(kid, st); } }
    else if (d.dataset && d.dataset.katb && !d.dataset.katSessiz) katbYaz(kid, d.dataset.katb, d.open ? 1 : 0);
  }, true);
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.ak-arac button[data-ak]'); if (!b || !simdiK) return;
    const k = b.dataset.ak, L = $('.ak-liste', ana); if (!L) return;
    if (k === 'yal') { const on = !L.classList.contains('sn-yalniz'); L.classList.toggle('sn-yalniz', on); b.setAttribute('aria-pressed', String(on)); sakla(`dk:snsuz:${simdiK.id}`, on ? '1' : '0'); return; }
    $$('.ak-bd', L).forEach((x) => { x.open = k !== 'kapat'; });
    $$('.ak-s', L).forEach((x) => { x.open = k === 'ac'; });
  });
  // soru sayfası blokları: başlığa (ya da «Katla» düğmesine) dokun → katlanır; details blokları açık / kapalı durumu hatırlanır
  function katKapa(s, kapali) {
    s.classList.toggle('kapali', kapali);
    const b = $('.kat-dug', s); if (b) { b.setAttribute('aria-expanded', String(!kapali)); b.lastChild.textContent = kapali ? 'Aç' : 'Katla'; }
  }
  function katBlokKur(K) {
    const st = katbOku(K.id);
    [['yol', $('#yol', ana)], ['dil', $('#dil-cift', ana)]].forEach(([tip, s]) => {
      const h = s && $('h2', s); if (!h || $('.kat-dug', h)) return;
      s.dataset.katb = tip; h.classList.add('kat-bas');
      h.insertAdjacentHTML('beforeend', `<button type="button" class="kat-dug" aria-expanded="true"><span class="gizli">${kac(h.textContent.trim())}: </span>Katla</button>`);
      if (st[tip] === 0) katKapa(s, true);
    });
    $$('figure.pdf-sekil', ana).forEach((f) => {
      const c = $('figcaption', f) || f.appendChild(document.createElement('figcaption'));
      f.dataset.katb = 'sekil';
      c.insertAdjacentHTML('beforeend', ' <button type="button" class="kat-dug kat-sekil" aria-expanded="true">Şekli gizle</button>');
      if (st.sekil === 0) sekilKapa(f, true);
    });
    const ac = (sec, tip, vars) => $$(sec, ana).forEach((d) => { d.dataset.katSessiz = '1'; d.dataset.katb = tip; const v = st[tip]; d.open = v === undefined ? vars : v === 1; delete d.dataset.katSessiz; });
    ac('details.kod-kutu', 'kod', false); ac('details.pdf-metin', 'pdf', false); ac('details.sy-alt', 'sy', false); ac('details.sy-ay', 'ay', false);
  }
  function sekilKapa(f, kapali) { f.classList.toggle('kapali', kapali); const b = $('.kat-sekil', f); if (b) { b.setAttribute('aria-expanded', String(!kapali)); b.textContent = kapali ? 'Şekli göster' : 'Şekli gizle'; } }
  document.addEventListener('click', (e) => {
    if (!simdiK) return;
    const fb = e.target.closest('.kat-sekil');
    if (fb) { const f = fb.closest('figure'), k = !f.classList.contains('kapali'); $$('figure.pdf-sekil', ana).forEach((x) => sekilKapa(x, k)); katbYaz(simdiK.id, 'sekil', k ? 0 : 1); return; }
    const h = e.target.closest('[data-katb] > h2.kat-bas'); if (!h || e.target.closest('a')) return;
    const s = h.parentElement, k = !s.classList.contains('kapali');
    katKapa(s, k); katbYaz(simdiK.id, s.dataset.katb, k ? 0 : 1);
  });
  // «o»: odaktaki blok; yoksa ekranın üst yarısındaki ilk katlanır blok
  function katHedef() {
    const a = document.activeElement, d = a && a.closest && a.closest('details, [data-katb]');
    if (d && ana.contains(d)) return d;
    return $$('details.sn-serit, details.sn-not, [data-katb], .sy-blok', ana).find((x) => { const r = x.getBoundingClientRect(); return r.height && r.bottom > yapisAlt() && r.top < innerHeight * 0.6; }) || null;
  }
  function katCevir(d) {
    if (d.tagName === 'DETAILS') { d.open = !d.open; return; }
    if (d.matches('figure')) { $('.kat-sekil', d)?.click(); return; }
    const h = $('h2.kat-bas', d); if (h) h.click();
  }
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) return;
    const k = e.key; if (k !== 'j' && k !== 'k' && k !== 'o') return;
    if (ckDurum && (!ckAnaGorunur() || ck.contains(document.activeElement))) return;
    const tur = String(ana.dataset.sayfa || '').split(':')[0];
    if (tur === 'akis') {
      if (k === 'o') { const d = document.activeElement && document.activeElement.closest && document.activeElement.closest('details'); if (d) { e.preventDefault(); d.open = !d.open; } return; }
      const S = $$('.ak-s > summary, .ak-asil > a', ana).filter((x) => x.getClientRects().length);
      const i = S.indexOf(document.activeElement), j = i < 0 ? (k === 'j' ? 0 : S.length - 1) : i + (k === 'j' ? 1 : -1);
      if (S[j]) { e.preventDefault(); S[j].focus({ preventScroll: true }); S[j].scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
    } else if (tur === 'soru') {
      if (k === 'o') { const d = katHedef(); if (d) { e.preventDefault(); katCevir(d); } return; }
      const a = takipBag(k === 'j' ? 1 : -1); if (a) { e.preventDefault(); anaGit(a.getAttribute('href')); }
    }
  });
  // site genelinde emoji gibi çizilen glifler → satır içi SVG simge (kitap PDF'i değişmez)
  const GLIF = { '✍': '<path d="M12 20h9"/><path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>', '📈': '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>', '⚠': '<path d="M12 3 2 20h20Z"/><path d="M12 10v4M12 17h.01"/>', '💎': '<path d="M6 3h12l3 6-9 12L3 9Z"/><path d="M3 9h18"/>', '📌': '<path d="M9 3h6l-1 6 3 3H7l3-3Z"/><path d="M12 12v9"/>', '🎯': '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/>', '✔': '<path d="m5 12 5 5 9-10"/>', '📖': '<path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2Z"/><path d="M22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8Z"/>', '📋': '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9z"/>', '🧩': '<path d="M4 8h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4H4z"/>', '🔵': '<circle cx="12" cy="12" r="6"/>', '☔': '<path d="M3 12a9 9 0 0 1 18 0Z"/><path d="M12 12v7a2 2 0 0 0 4 0"/>' };
  const GLIF_RX = /(🇬🇧|[✍📈⚠💎📌🎯✔📖📋🧩🔵☔])️?\s?/gu;

  /* ---------- ISARET (27 Kas): sınava odaklı görsel mini işaretler ----------
     Tek görsel dil: satır içi SVG simge + kısa etiket (emoji yok), .isr .isr-<tür>; blok vurgusu .isr-k (kalın sol şerit + hafif zemin).
     kesin «Kesin bil» (yıldız): cozum adımında "kesin": true, sınav «Asıl bil», kavramın ana formülü, kitabın «Sınavda yaz» satırı
     sik «Sık çıkar» (hedef): yalnız sınav pusulası açıkken, olasılık 3 (soru · bölüm · kavram)
     tuzak «Tuzak» (üçgen): adim.dikkat, sınav tuzak, rehber tuzak, kitabın «Sık hata» satırı
     ezber «Ezberle» (Σ): kesin adımın formülü (kesin_neden «ana formül: <ad>» → rehber formülü), olasılığı yüksek kavramın formülü
     yaz «Sınavda yaz» (kalem): kitap öz, İngilizce derslerde adımın en cümlesi, rehberin «Sınav kâğıdına yaz» kutusu
     denetle «Denetle» (onay): adim.kontrol · kisa «Kısa yol» (şimşek): ipucu, kalıp ipucu, sınavda ilk adım · sonuc «Ara sonuç» (nötr)
     Süzgeç «Yalnız kesin bil» (dk:kesin → html.ks-yal): oynatıcıda bütün adımlar açılır, kesin olmayanlar tek satıra iner (dokun: açılır),
     ileri / geri kesin adımlar arasında atlar. Çekmece _kesin: bölüm bölüm kesin adımlar (+ pusula açıksa kavramların «Asıl bil» maddeleri). */
  const ISR = {
    kesin: ['Kesin bil', '<path d="M12 3.2l2.7 5.5 6 .9-4.4 4.2 1.1 6L12 17l-5.4 2.8 1.1-6-4.4-4.2 6-.9z"/>'],
    sik: ['Sık çıkar', '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>'],
    tuzak: ['Tuzak', '<path d="M12 3.5 2.5 20h19Z"/><path d="M12 10v4.5M12 17.2h.01"/>'],
    ezber: ['Ezberle', '<path d="M17.5 5h-11l6 7-6 7h11"/>'],
    yaz: ['Sınavda yaz', '<path d="M12 20h9"/><path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'],
    denetle: ['Denetle', '<path d="m5 12.5 4.5 4.5L19 7"/>'],
    kisa: ['Kısa yol', '<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"/>'],
    sonuc: ['Ara sonuç', '<path d="M5 9.5h14M5 14.5h14"/>'],
  };
  const ISR_SIRA = ['kesin', 'sik', 'tuzak', 'ezber', 'yaz', 'denetle', 'kisa'];
  const ISR_ACIK = { kesin: 'puanın geldiği yer: kesin adım, asıl bilgi, ana formül', sik: 'sınavda çıkma olasılığı yüksek (sınav pusulası açıkken)', tuzak: 'sık yapılan hata', ezber: 'ezberlenecek formül', yaz: 'sınav kâğıdına yazılacak cümle', denetle: 'sonucu denetleme yolu', kisa: 'ipucu, kısa yol, ilk adım' };
  const KS_YILDIZ = `<svg class="ks-y" viewBox="0 0 24 24" aria-hidden="true">${ISR.kesin[1]}</svg>`;
  // o.kucuk: yalnız simge (role=img + aria-label) · o.ad: etiket metni · o.neden: başlık (title) · o.sinif: ek sınıf
  function isr(t, o = {}) {
    const [ad, d] = ISR[t], et = o.ad || ad, svg = `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`, s = `isr isr-${t}${o.kucuk ? ' isr-kucuk' : ''}${o.sinif ? ' ' + o.sinif : ''}`;
    return o.kucuk ? `<span class="${s}" role="img" aria-label="${kac(et)}" title="${kac(o.neden || et)}">${svg}</span>` : `<span class="${s}"${o.neden ? ` title="${kac(o.neden)}"` : ''}>${svg}<span class="isr-ad">${kac(et)}</span></span>`;
  }
  const ingDers = (K) => /e$/i.test((K && K.id) || '');
  const ksYal = () => oku('dk:kesin') === '1';
  document.documentElement.classList.toggle('ks-yal', ksYal());
  const KS_SAY = new Map();
  function kesinSay(K) {
    if (!K) return null;
    if (KS_SAY.has(K.id)) return KS_SAY.get(K.id);
    let adim = 0, soru = 0;
    for (const s of Object.values(CZ(K).soru || {})) { const n = (s.adim || []).filter((a) => a && a.kesin === true).length; if (n) { adim += n; soru++; } }
    const r = adim ? { adim, soru } : null; KS_SAY.set(K.id, r); return r;
  }
  // kesin adımın «Ezberle» formülü: kesin_neden «ana formül: <ad>» → sorunun rehber formülü; yoksa sorunun kavramının ana formülü
  function isrFormul(K, q, a) {
    const m = /^(?:ana )?formül: (.+)$/.exec(a.kesin_neden || ''); if (!m || !q) return '';
    const ad = m[1].trim(), es = (x) => !!x && (x === ad || x.startsWith(ad));
    const f = ((q.rehber || {}).formul || []).find((x) => es(x.ad));
    if (f && f.tex) return `<div class="isr-ezf">${isr('ezber')}<div class="isr-f">${f.tex}</div></div>`;
    const k = (q.kavram || []).map((id) => kavramBul(K, id)).find((x) => x && es(x.ad) && ((x.parcalar || {}).formul || {}).tex != null);
    return k ? `<div class="isr-ezf">${isr('ezber')}<div class="isr-f"><div class="tex-blok" data-tex="${k.parcalar.formul.tex}"></div></div></div>` : '';
  }
  // kitap öz kutusu → «Sınavda yaz» (öz «Sınavda yaz →» ile başlıyorsa kitabın kendi sınav satırıdır: Kesin bil de)
  function ozHTML(oz) {
    let h = String(oz || '').replace(/^<p>|<\/p>$/g, '');
    const m = /^\s*Sınavda yaz\s*(?:→|:)\s*/i.exec(h); if (m) h = h.slice(m[0].length);
    return `<div class="oz${m ? ' isr-blok isr-k' : ' isr-y'}">${m ? isr('kesin') : ''}${isr('yaz')}${h}</div>`;
  }
  // kitabın kendi metnindeki «Sınavda yaz:» satırı → Kesin bil + Sınavda yaz bloğu; «Sık hata:» → Tuzak (kitap PDF'i değişmez)
  function isrSusle(kok) {
    if (!kok) return;
    for (const s of $$('strong, b', kok)) {
      if (!s.isConnected || s.closest('.isr, .isr-blok, svg, button, summary, a, .sn-x, .ks-soru')) continue;
      const t = s.textContent.trim().replace(/:$/, '').toLocaleLowerCase('tr'), yaz = t === 'sınavda yaz', tz = t === 'sık hata';
      if (!yaz && !tz) continue;
      const p = s.parentElement; if (!p || (p.tagName !== 'P' && p.tagName !== 'LI')) continue;
      // etiket satırın başında mı (önünde yalnız boşluk ya da uyarı simgesi)
      let x = s.previousSibling, bas = true;
      while (x) { if (x.nodeType === 3 ? x.nodeValue.trim() : !(x.matches && x.matches('svg.glif'))) { bas = false; break; } x = x.previousSibling; }
      if (!bas) continue;
      while (s.previousSibling) s.previousSibling.remove();
      if (tz) { s.insertAdjacentHTML('beforebegin', isr('tuzak')); s.remove(); p.classList.add('isr-tz'); continue; }
      s.insertAdjacentHTML('beforebegin', isr('kesin') + isr('yaz')); s.remove();
      if (p.tagName === 'LI') { p.classList.add('isr-blok', 'isr-k', 'isr-yz'); continue; }
      // yalnız etiketten oluşan satırın altındaki liste / alıntı / paragraf aynı bloğa alınır
      const bos = !$$('.isr', p).reduce((m, c) => m.replace(c.textContent, ''), p.textContent).trim(), sonra = p.nextElementSibling;
      const d = document.createElement('div'); d.className = 'isr-blok isr-k isr-yz';
      p.before(d); d.append(p);
      if (bos && sonra && (/^(UL|OL|BLOCKQUOTE)$/.test(sonra.tagName) || (sonra.tagName === 'P' && !sonra.querySelector('strong, b')))) d.append(sonra);
      // düz paragrafta kalmış markdown listesi («\n- madde») maddelere ayrılır
      if (/\n-\s/.test(p.innerHTML)) { const parca = p.innerHTML.split(/\n-\s+/); p.innerHTML = parca[0]; p.insertAdjacentHTML('afterend', `<ul>${parca.slice(1).map((m) => `<li>${m.trim()}</li>`).join('')}</ul>`); }
    }
  }
  // «İşaretler» açıklaması (açılır; durum dk:isrlej) + «Yalnız kesin bil» süzgeci + _kesin listesi
  function isrLejantHTML(K, yer) {
    const nk = kesinSay(K), acik = oku('dk:isrlej') === '1';
    return `<details class="isr-lejant" data-yer="${yer}"${acik ? ' open' : ''}><summary><span class="isr-lej-bas">İşaretler</span><span class="isr-lej-mini" aria-hidden="true">${ISR_SIRA.map((t) => isr(t, { kucuk: true })).join('')}</span></summary>
      <ul class="isr-lej-liste">${ISR_SIRA.map((t) => `<li>${isr(t)}<span>${ISR_ACIK[t]}</span></li>`).join('')}</ul>
      <p class="isr-lej-mk"><b>Mercekler</b> <span class="yok">· her parçada aynı konu başka gözle (simgeye dokun; basılı tut: adı)</span></p><ul class="mk-lej-liste mk-lej">${MK.map(([k, ad]) => `<li><span class="mk-lej-ik">${mkSvg(k)}</span><span>${ad}</span></li>`).join('')}</ul>
      ${nk ? `<p class="isr-lej-dug"><button type="button" class="kucuk ks-dug" aria-pressed="${ksYal()}">${isr('kesin', { kucuk: true })}<span>Yalnız kesin bil</span></button><button type="button" class="kucuk ks-git" data-git="${kac(`#${anaOnEk(K)}/k/_kesin`)}">Kesin bil listesi · ${nk.adim} adım</button></p>` : ''}</details>`;
  }
  document.addEventListener('toggle', (e) => { if (e.target.matches && e.target.matches('.isr-lejant')) sakla('dk:isrlej', e.target.open ? '1' : '0'); }, true);
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.ks-dug'); if (!b) return;
    const on = !ksYal(); sakla('dk:kesin', on ? '1' : '0');
    document.documentElement.classList.toggle('ks-yal', on);
    $$('.ks-dug').forEach((x) => x.setAttribute('aria-pressed', String(on)));
    const o = $('#oyn', ana);
    if (on && o && ana.dataset.cozkip === 'liste') $('.coz-kip button[data-kip="oyn"]', ana)?.click(); // süzgeç oynatıcıda çalışır
    if (o && o.__yenile) o.__yenile();
  });
  // çekmece _kesin: bölüm bölüm kesin adımlar (hızlı tekrar); pusula açıksa kavramların «Asıl bil» maddeleri
  function kesinCk(K, ne, ayni) {
    const V = SV(K), say = kesinSay(K);
    kirintiYaz(K, [['Kesin bil', null]]);
    $('#ck-sira').innerHTML = ''; $('#ck-sekme').innerHTML = ustSekme(K, 'kesin');
    $('#ck-baslik').innerHTML = `Kesin bil · hızlı tekrar<small>${say ? `${say.adim} kesin adım · ${say.soru} soru` : 'bu kitapta işaretli adım yok'}${V ? ' · pusula açık' : ''}</small>`;
    if (ayni) return;
    const sat = (q, a, i) => `<li><a class="ks-sat" href="#${K.id}/${q.id}/o${i + 1}" data-ana="${q.id}/o${i + 1}"><span class="ks-no">${i + 1}</span><span class="ks-ne">${kac(a.ne || '')}${a.kesin_neden ? ` <small class="isr-neden">· ${kac(a.kesin_neden)}</small>` : ''}</span></a>${a.islem ? `<span class="ks-islem">${kac(kisalt(a.islem, 150))}</span>` : ''}${a.sonuc ? `<span class="ks-sonuc">${isr('sonuc', { kucuk: true })}<b>${kac(kisalt(a.sonuc, 110))}</b></span>` : ''}</li>`;
    let h = `<p class="ck-not">Puanın geldiği yerler, bölüm bölüm: her sorunun kesin adımları (ana formülün yerine konduğu adım ve kâğıda yazılacak sonuç)${V ? ', altında kavramların «Asıl bil» maddeleri' : ''}. Bir adıma dokun: soru o adımda açılır.</p>`;
    if (say) h += `<p class="isr-lej-dug"><button type="button" class="kucuk ks-dug" aria-pressed="${ksYal()}">${isr('kesin', { kucuk: true })}<span>Oynatıcıda yalnız kesin bil</span></button></p>`;
    for (const b of K.bolumler) {
      const qs = bolumSorulari(K, b).map((s) => K.sorular[s]).filter(Boolean);
      const sq = qs.map((q) => {
        const A = (czSoru(K, q.id) || {}).adim || [], L = A.map((a, i) => (a && a.kesin === true ? sat(q, a, i) : '')).filter(Boolean); if (!L.length) return '';
        const S = V && (V.soru || {})[q.id];
        return `<section class="ks-soru"><h4><a href="#${K.id}/${q.id}" data-soru="${q.id}"><b>${q.id}</b> ${kac(kisalt(q.baslik, 70))}</a>${S && snN(S.olasilik) === 3 ? isr('sik', { kucuk: true }) : ''}${mkGrupHTML(K, `soru:${q.id}`, true)}</h4><ol class="ks-liste">${L.join('')}</ol></section>`;
      }).join('');
      const kv = V ? (K.kavramlar || []).filter((k) => k.bolum === b.id && (((V.kavram || {})[k.id] || {}).bil || []).length).map((k) => `<section class="ks-kv isr-k">${snCip(K, 'kavram:' + k.id, true)}${snUl(V.kavram[k.id].bil)}</section>`).join('') : '';
      if (sq || kv) h += `<h3 class="ks-bol">${kac(bolumAd(K, b))}</h3>${sq}${kv ? `<p class="sn-alt ks-kv-bas">${isr('kesin', { kucuk: true })}Asıl bil · kavramlar</p>${kv}` : ''}`;
    }
    ckIc.innerHTML = h;
  }

  /* ---------- ETK Ö3 (26 Kas): sınav kipi — «Sınava çalış» (kilit açıksa) ----------
     Açınca: kitap akışında olasılık 3 açık, 2 katlı, 1 yalnız «Asıl bil» satırı; her sayfanın üstünde strateji.sira çalışma yolu
     (adım n / N, Önceki / Sonraki, Bitti, ilerleme çubuğu; dk:snyol:<kitap>). Kipten çıkınca katlama durumu eski hâline döner (kip kendi
     açık / kapalı seçimini saklamaz). Tercih: dk:snkip:<kitap>. */
  const snKip = (K) => !!SV(K) && oku(`dk:snkip:${K.id}`) === '1';
  const snYolOku = (kid) => { try { const x = JSON.parse(oku(`dk:snyol:${kid}`) || 'null') || {}; return { i: +x.i || 0, b: new Set(x.b || []) }; } catch (e) { return { i: 0, b: new Set() }; } };
  const snYolYaz = (kid, y) => sakla(`dk:snyol:${kid}`, JSON.stringify({ i: y.i, b: [...y.b] }));
  function snHedefGit(K, g) {
    const t = String(g || ''), i = t.indexOf(':'), tur = t.slice(0, i), id = t.slice(i + 1);
    if (tur === 'soru') anaGit(`#${K.id}/${id}`);
    else if (tur === 'bol') anaGit(`#${K.id}/bol/${id}`);
    else if (tur === 'kavram') location.hash = `#${anaOnEk(K)}/k/${id}/${snKv(K, id) ? 'sinav' : 'tanim'}`;
    else if (tur === 'sozluk') location.hash = `#${anaOnEk(K)}/k/_sozluk/${id}`;
  }
  function snYolHTML(K, V) {
    const L = (V.strateji || {}).sira || []; if (!L.length) return '';
    const y = snYolOku(K.id), i = Math.max(0, Math.min(y.i, L.length - 1)), x = L[i], bit = L.filter((_, j) => y.b.has(j)).length;
    return `<section class="sn-x sn-yol" aria-label="Sınav çalışma yolu"><div class="sn-yol-ust"><b>Çalışma yolu</b><span class="say">adım ${i + 1} / ${L.length} · bitti ${bit}</span>${kesinSay(K) ? `<button type="button" class="kucuk ks-git" data-git="${kac(`#${anaOnEk(K)}/k/_kesin`)}">${isr('kesin', { kucuk: true })}Kesin bil listesi</button>` : ''}<button type="button" class="kucuk sn-kipdug" aria-pressed="true">Kipten çık</button></div>
      <div class="sn-ilerle" role="progressbar" aria-label="Biten adımlar" aria-valuemin="0" aria-valuemax="${L.length}" aria-valuenow="${bit}"><i style="width:${Math.round((bit / L.length) * 100)}%"></i></div>
      <div class="sn-yol-adim"><span class="sn-yol-no">${i + 1}</span>${snCip(K, x.git)}${x.neden ? `<span class="sn-sneden">${kac(x.neden)}</span>` : ''}</div>
      <div class="sn-yol-dug"><button type="button" class="kucuk" data-yol="geri"${i ? '' : ' disabled'}>‹ Önceki</button><button type="button" class="kucuk sn-bitti" data-yol="bitti" aria-pressed="${y.b.has(i)}">${y.b.has(i) ? 'Bitti ✓' : 'Bitti olarak işaretle'}</button><button type="button" class="dugme" data-yol="ileri"${i < L.length - 1 ? '' : ' disabled'}>Sonraki ›</button></div></section>`;
  }
  // dar ekranda çekmece ana akışı örter: sınav kipinde çalışma yolu çekmecenin başında da görünür (Bitti / Sonraki ulaşılır kalsın)
  function snYolCk() {
    $$('.sn-yol', ckIc).forEach((x) => x.remove());
    if (!ckDurum || ckYanda() || !snKip(ckDurum.K)) return;
    const h = snYolHTML(ckDurum.K, SV(ckDurum.K)); if (h) ckIc.insertAdjacentHTML('afterbegin', h.replace('class="sn-x sn-yol"', 'class="sn-yol sn-yol-ck"'));
  }
  function snKipAyarla(K, on) {
    sakla(`dk:snkip:${K.id}`, on ? '1' : '0');
    document.documentElement.classList.toggle('sn-kip', on);
    if (on && !String(ana.dataset.sayfa || '').startsWith('akis')) { anaGit(`#${K.id}/akis`); return; }
    const im = sbImza(); sonSayfa = ''; yonlendir().then(() => sbImzaGit(im)); // kipten çıkınca sayfa yeniden çizilir: okunan yer korunur
  }
  document.addEventListener('click', (e) => {
    if (!simdiK) return;
    const kb = e.target.closest('.sn-kipdug');
    if (kb) { snKipAyarla(simdiK, kb.getAttribute('aria-pressed') !== 'true'); return; }
    const b = e.target.closest('.sn-yol [data-yol]'); if (!b) return;
    const V = SV(simdiK), L = ((V || {}).strateji || {}).sira || []; if (!L.length) return;
    const y = snYolOku(simdiK.id); y.i = Math.max(0, Math.min(y.i, L.length - 1));
    const k = b.dataset.yol;
    if (k === 'bitti') { const ckte = ckIc.contains(b); if (y.b.has(y.i)) y.b.delete(y.i); else y.b.add(y.i); snYolYaz(simdiK.id, y); sinavSusle(simdiK, false); snYolCk(); $('.sn-yol .sn-bitti', ckte ? ckIc : ana)?.focus({ preventScroll: true }); return; }
    y.i = Math.max(0, Math.min(L.length - 1, y.i + (k === 'ileri' ? 1 : -1))); snYolYaz(simdiK.id, y);
    sinavSusle(simdiK, false); snHedefGit(simdiK, L[y.i].git);
  });

  /* ---------- ETK Ö4 (26 Kas): akışta arama — çekmecede _ara ----------
     «/» · Ctrl+K · üst çubukta «Ara» → #…/k/_ara/<sorgu>: ana akış yerinde kalır, odak çekmecedeki kutuda (yazdıkça adres yerinde
     güncellenir; Geri / İleri çalışır). Sonuçlar gruplu; satıra dokun → önizleme YERİNDE (tanım, formül, ilk adımlar, bağlar); eylemler
     Çekmecede aç · Akışta göster · ＋ Karşılaştır. Türkçe harf duyarsız; sözlükle TR ↔ EN eş anlam; sembol ve birim (ΔS, CN, mm/h, hPa);
     son aramalar dk:arason. Dizin tarayıcıda kitap verisinden kurulur; öbür kitaplar isteğe bağlı (ilk çapraz aramada tembel yüklenir). */
  /* ---------- ETK2 DKM (26 Kas): arama motoru (Ö2) ----------
     Tam metin dizin, kitap başına tarayıcıda tembel kurulur (ARD): kavram (ad · tanım · TR ↔ EN cümleleri), kavramın içi (formül terimleri,
     türetim, diyagram / animasyon / kod açıklaması), formül TeX'i (SVG etiketinden), soru (metin, ipucu, rehber, EN çevirisi, şöyle olsaydı,
     ayrım), çözüm adımları (cozum ya da kitap), konu sayfaları, sözlük (TR, EN, fark, örnek), hesap araçları (girdi / çıktı sembolleri),
     kimya (tür, tepkime, çevrim), karşılaştırmalar, terim kartları (yüklenince), sınav notları (kilit açıksa).
     Eşleşme: Türkçe katlama (büyük-küçük, şapka / nokta), Türkçe ek budama + İngilizce basit kök, önek, TR ↔ EN eş anlam (sözlük, kavram,
     hesap, kimya, terim + çekirdek sözlük), sembol / birim belirteçleri (ΔS, CN, tᶜ, mm/h, m³/s, hPa, dBZ), yazım hatası hoşgörüsü
     (1–2 harf). Sıralama: ad > tanım > gövde; tam > kök > önek > yakın; tür önceliği; kitap içi önce. Vurgulu kesit.
     Sonuç yoksa en yakın öneriler; «bulunamayan aramalar» yalnız bu cihazda (dk:arayok; içerik tamamlamak için, dışa gönderilmez). */
  const ARA_GRUP = [['terim', 'Terim kartı'], ['kavram', 'Kavram'], ['formul', 'Formül · sembol'], ['soru', 'Soru'], ['adim', 'Çözüm adımı'], ['konu', 'Konu sayfası'], ['parca', 'Kavramın içinde'], ['sozluk', 'Sözlük TR ↔ EN'], ['hesap', 'Hesap aracı'], ['kimya', 'Kimya'], ['kars', 'Karşılaştırma'], ['sinav', 'Sınav notu']];
  const GRUP_AD = Object.fromEntries(ARA_GRUP);
  const GRUP_ON = { kavram: 0.8, terim: 0.7, sozluk: 0.4, formul: 0.35, soru: 0.3, hesap: 0.25, kimya: 0.25, kars: 0.15, adim: 0, konu: 0.05, sinav: 0, parca: -0.2 };
  const ALAN_W = [3, 2, 1];
  const ARD = new Map();
  let arSon = null, arCapraz = false, arZaman = 0, arTur = '', arYokZaman = 0;
  // katlama: küçük harf (tr), şapka / nokta / Türkçe harf → ASCII; NFKD üst / alt simgeyi düz harfe indirir (m³ → m3, tᶜ → tc, P̄ → p)
  const katla = (s) => String(s ?? '').toLocaleLowerCase('tr').replace(/[çğıöşüâîû]/g, (c) => TRH[c]).normalize('NFKD').replace(/[̀-ͯ]/g, '');
  const TOK = /[\p{L}\p{N}]+(?:[/·\-.,][\p{L}\p{N}]+)*/gu;
  function toklar(s) {
    const o = [];
    for (const m of katla(s).matchAll(TOK)) {
      const w = m[0];
      if (/[/·\-.,]/.test(w)) { o.push(w.replace(/·/g, '/')); for (const p of w.split(/[/·\-.,]+/)) if (p) o.push(p); } else o.push(w);
    }
    return o;
  }
  // Türkçe ek budama (katlanmış biçim; uzundan kısaya) + son ünsüz yumuşaması geri (kitabı → kitap, rengi → renk)
  const EK_TR = ['larindan', 'lerinden', 'larinin', 'lerinin', 'larinda', 'lerinde', 'larina', 'lerine', 'larini', 'lerini', 'sindan', 'sinden', 'sundan', 'larla', 'lerle', 'ndaki', 'ndeki', 'sinin', 'sunun', 'sinda', 'sinde', 'sunda', 'siyla', 'siyle', 'suyla', 'masi', 'mesi', 'lari', 'leri', 'daki', 'deki', 'taki', 'teki', 'ndan', 'nden', 'sina', 'sine', 'suna', 'sini', 'sunu', 'nin', 'nun', 'dan', 'den', 'tan', 'ten', 'nda', 'nde', 'yla', 'yle', 'lar', 'ler', 'dir', 'dur', 'tir', 'tur', 'mak', 'mek', 'si', 'su', 'in', 'un', 'da', 'de', 'ta', 'te', 'na', 'ne', 'ya', 'ye', 'yi', 'yu', 'ni', 'nu', 'la', 'le', 'ma', 'me'];
  function trKok(w) {
    if (w.length < 4 || /\d/.test(w) || !/^[a-z]+$/.test(w)) return w;
    let s = w, sesli = false;
    for (let tur = 0; tur < 3; tur++) {
      let kes = false;
      for (const e of EK_TR) {
        if (!s.endsWith(e)) continue;
        const kalan = s.length - e.length, min = e.length >= 3 ? 3 : (e === 'ma' || e === 'me') ? 5 : 4;
        if (kalan < min) continue;
        s = s.slice(0, kalan); sesli = /^[aeiou]/.test(e); kes = true; break;
      }
      if (!kes) { if (/[aeiu]$/.test(s) && s.length > 4) { s = s.slice(0, -1); sesli = true; } else break; }
    }
    if (sesli && s !== w) s = s.replace(/b$/, 'p').replace(/g$/, 'k').replace(/d$/, 't');
    return s;
  }
  function enKok(w) {
    if (w.length < 4 || !/^[a-z]+$/.test(w)) return w;
    if (w.endsWith('ies') && w.length > 4) return `${w.slice(0, -3)}y`;
    if (/(sses|xes|ches|shes|zes)$/.test(w)) return w.slice(0, -2);
    if (/(ss|us|is)$/.test(w)) return w;
    if (w.endsWith('s')) return w.slice(0, -1);
    if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
    if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
    return w;
  }
  const kokler = (w) => { const a = trKok(w), b = enKok(w); return a === b ? [a] : [a, b]; };
  // en çok k uzaklık (yer değiştirme dahil; aşınca k + 1)
  function mesafe(a, b, k) {
    const n = a.length, m = b.length; if (Math.abs(n - m) > k) return k + 1;
    let o2 = null, o1 = Array.from({ length: m + 1 }, (_, j) => j);
    for (let i = 1; i <= n; i++) {
      const c = [i]; let enaz = i;
      for (let j = 1; j <= m; j++) {
        let v = Math.min(o1[j] + 1, c[j - 1] + 1, o1[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (o2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, o2[j - 2] + 1);
        c[j] = v; if (v < enaz) enaz = v;
      }
      if (enaz > k) return k + 1;
      o2 = o1; o1 = c;
    }
    return o1[m];
  }
  // TeX → düz metin (sembol araması için): \Delta S → ΔS, \frac{a}{b} → a/b, Q_{p} → Qp
  const TEXK = { alpha: 'α', beta: 'β', gamma: 'γ', Gamma: 'Γ', delta: 'δ', Delta: 'Δ', epsilon: 'ε', varepsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ', Theta: 'Θ', kappa: 'κ', lambda: 'λ', Lambda: 'Λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', Pi: 'Π', rho: 'ρ', sigma: 'σ', Sigma: 'Σ', tau: 'τ', phi: 'φ', varphi: 'φ', Phi: 'Φ', chi: 'χ', psi: 'ψ', Psi: 'Ψ', omega: 'ω', Omega: 'Ω', partial: '∂', nabla: '∇', infty: '∞', pm: '±', times: '×', cdot: '·', approx: '≈', le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠', sum: 'Σ', int: '∫', to: '→', rightarrow: '→', propto: '∝', circ: '°' };
  const texDuz = (t) => String(t || '').replace(/\\(?:mathrm|text|textrm|mathit|mathbf|operatorname|mbox|bar|overline|hat|vec|tilde|dot|boldsymbol)\{([^{}]*)\}/g, '$1')
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1/$2').replace(/\\([A-Za-z]+)/g, (m, a) => TEXK[a] || ' ').replace(/[_^]\{([^{}]*)\}/g, '$1').replace(/[_^{}]/g, '')
    .replace(/\\[,;:! ]/g, ' ').replace(/([α-ωΑ-Ω∂∇])\s+(?=[A-Za-z0-9])/g, '$1').replace(/\s+/g, ' ').trim();
  const svgTex = (K, i) => { let v = (K.svg || [])[+i]; if (typeof v === 'number') v = K.svg[v]; const m = /aria-label="([^"]*)"/.exec(String(v || '')); return m ? texDuz(m[1].replace(/&amp;/g, '&')) : ''; };
  const htmlTex = (K, h) => [...String(h || '').matchAll(/data-tex="(\d+)"/g)].map((m) => svgTex(K, m[1])).join(' · ');
  const semKat = (s) => katla(s).replace(/\s+/g, '');
  const metin = (...L) => L.flat(3).filter((x) => x != null && x !== '').map((x) => (typeof x === 'string' ? (/[<&]/.test(x) ? duzMetin(x) : x) : String(x))).join(' · ');
  // çekirdek TR ↔ EN eş anlam (kitap sözlüğünde olmasa da iki dilde aranır)
  const CEKIRDEK = [['yağış', 'precipitation'], ['yağmur', 'rain|rainfall'], ['yağış şiddeti', 'rainfall intensity|precipitation intensity'], ['kar', 'snow'], ['dolu', 'hail'], ['çisenti', 'drizzle'], ['sis', 'fog'], ['bulut', 'cloud'], ['bulutluluk', 'cloud cover'], ['rüzgâr|rüzgar', 'wind'], ['rüzgâr hızı', 'wind speed'], ['basınç', 'pressure'], ['deniz seviyesi basıncı', 'sea level pressure'], ['sıcaklık', 'temperature'], ['çiy noktası', 'dew point'], ['nem', 'humidity|moisture'], ['bağıl nem', 'relative humidity'], ['özgül nem', 'specific humidity'], ['karışma oranı', 'mixing ratio'], ['buhar basıncı', 'vapour pressure|vapor pressure'], ['doyma buhar basıncı', 'saturation vapour pressure'], ['yoğuşma|yoğunlaşma', 'condensation'], ['buharlaşma', 'evaporation'], ['terleme', 'transpiration'], ['evapotranspirasyon|buharlaşma terleme', 'evapotranspiration|et'], ['sızma|infiltrasyon', 'infiltration'], ['süzülme', 'percolation'], ['yüzey akışı', 'surface runoff|overland flow'], ['akış', 'runoff|flow'], ['debi', 'discharge|flow rate'], ['akım', 'streamflow'], ['taban akışı', 'baseflow|base flow'], ['yeraltı suyu', 'groundwater'], ['havza', 'catchment|basin|watershed'], ['taşkın', 'flood'], ['kuraklık', 'drought'], ['hidrograf', 'hydrograph'], ['dönüş aralığı|dönüş periyodu|tekerrür süresi', 'return period'], ['olasılık', 'probability'], ['frekans|sıklık', 'frequency'], ['eğim', 'slope|gradient'], ['alan', 'area'], ['hacim', 'volume'], ['derinlik', 'depth'], ['yükseklik', 'height'], ['yoğunluk', 'density'], ['kütle', 'mass'], ['ısı', 'heat'], ['gizli ısı', 'latent heat'], ['duyulur ısı', 'sensible heat'], ['ışınım|radyasyon', 'radiation'], ['güneş ışınımı', 'solar radiation'], ['yansıtabilirlik|albedo', 'albedo'], ['troposfer', 'troposphere'], ['stratosfer', 'stratosphere'], ['tropopoz', 'tropopause'], ['inversiyon|sıcaklık terselmesi', 'inversion'], ['kararlılık', 'stability'], ['kararsızlık', 'instability'], ['adyabatik', 'adiabatic'], ['potansiyel sıcaklık', 'potential temperature'], ['eşdeğer potansiyel sıcaklık', 'equivalent potential temperature'], ['sanal sıcaklık', 'virtual temperature'], ['sıcaklık azalma oranı', 'lapse rate'], ['cephe', 'front'], ['soğuk cephe', 'cold front'], ['sıcak cephe', 'warm front'], ['oklüzyon|kapanmış cephe', 'occlusion|occluded front'], ['alçak basınç', 'low pressure|depression'], ['yüksek basınç', 'high pressure|anticyclone'], ['siklon', 'cyclone'], ['oluk', 'trough'], ['sırt', 'ridge'], ['jet akımı', 'jet stream'], ['jeostrofik rüzgâr', 'geostrophic wind'], ['girdaplık|vortisite', 'vorticity'], ['ıraksama|diverjans', 'divergence'], ['yakınsama|konverjans', 'convergence'], ['adveksiyon|taşınım', 'advection'], ['konveksiyon', 'convection'], ['türbülans', 'turbulence'], ['sınır tabaka', 'boundary layer'], ['yansıtıcılık', 'reflectivity'], ['uydu', 'satellite'], ['yağış ölçer|plüviyometre', 'rain gauge'], ['gözlem', 'observation'], ['tahmin', 'forecast'], ['sayısal hava tahmini', 'numerical weather prediction|nwp'], ['ızgara', 'grid|mesh'], ['çözünürlük', 'resolution'], ['zaman adımı', 'time step'], ['sonlu fark', 'finite difference'], ['kesme hatası', 'truncation error'], ['yuvarlama hatası', 'round-off error'], ['sınır koşulu', 'boundary condition'], ['başlangıç koşulu', 'initial condition'], ['hazne|rezervuar', 'reservoir'], ['göl', 'lake'], ['nehir|akarsu', 'river|stream'], ['öteleme', 'routing'], ['kalibrasyon', 'calibration'], ['doğrulama', 'validation|verification'], ['ortalama', 'mean|average'], ['standart sapma', 'standard deviation'], ['dağılım', 'distribution'], ['ozon', 'ozone'], ['sera etkisi', 'greenhouse effect'], ['asit yağmuru', 'acid rain'], ['tepkime', 'reaction'], ['hız sabiti', 'rate constant'], ['ömür|yaşam süresi', 'lifetime'], ['kalış süresi', 'residence time'], ['derişim|konsantrasyon', 'concentration'], ['mol kesri', 'mole fraction'], ['bulut yoğunlaşma çekirdeği', 'cloud condensation nucleus|ccn'], ['damla', 'droplet|drop'], ['çarpışma', 'collision'], ['birleşme', 'coalescence'], ['aşırı doyma', 'supersaturation'], ['kaldırma kuvveti', 'buoyancy'], ['kararlı hâl|kararlı durum', 'steady state'], ['izobar|eş basınç çizgisi', 'isobar'], ['izoterm', 'isotherm'], ['izohiyet|eş yağış çizgisi', 'isohyet'], ['eğri numarası', 'curve number|cn'], ['birim hidrograf', 'unit hydrograph'], ['akış katsayısı', 'runoff coefficient'], ['toplanma süresi|konsantrasyon süresi', 'time of concentration|tc'], ['gecikme süresi', 'lag time'], ['tepe debisi', 'peak discharge|peak flow'], ['su bütçesi|su dengesi', 'water balance|water budget'], ['hidrolojik döngü|su döngüsü', 'hydrological cycle|water cycle'], ['olası en büyük yağış', 'probable maximum precipitation|pmp'], ['şiddet süre sıklık', 'intensity duration frequency|idf'], ['hektopaskal', 'hpa'], ['milibar', 'mb'], ['santigrat', 'celsius'], ['milimetre', 'mm'], ['saat', 'hour|h'], ['saniye', 'second|s']];
  // eş anlam ağı (doğrudan komşuluk; geçişli birleştirme yok ki gruplar şişmesin)
  function esKur(K) {
    const G = new Map(), es1 = (x) => katla(x).replace(/\s+/g, ' ').trim();
    const bag = (...L) => { const A = [...new Set(L.map(es1).filter((x) => x.length > 1 && x.length < 60))]; if (A.length < 2 || A.length > 10) return; for (const a of A) { let s = G.get(a); if (!s) G.set(a, (s = new Set())); for (const b of A) if (b !== a) s.add(b); } };
    const parca = (s) => { const t = String(s || ''), P = []; for (const x of t.replace(/\([^)]*\)/g, ' ').split(/[,;/|]| ya da | veya | or /)) if (x.trim()) P.push(x.trim()); for (const m of t.matchAll(/\(([^)]{2,40})\)/g)) for (const y of m[1].split(/[,;/]/)) if (y.trim().length > 1) P.push(y.trim()); return P; };
    for (const [tr, en] of CEKIRDEK) bag(...parca(tr), ...parca(en));
    (K.sozluk || []).forEach((s) => bag(...parca(s.en), ...parca(s.tr)));
    (K.kavramlar || []).forEach((k) => { if (k.en && k.en.split(/\s+/).length <= 5 && !/[(,]/.test(k.en)) bag(k.ad, k.en); });
    HS(K).forEach((h) => { const a = iki(h.ad); [...(h.girdi || []), ...(h.cikti || [])].forEach((g) => { const b = iki(g.ad); if (b.tr && b.en && b.en.split(/\s+/).length <= 5) bag(b.tr, b.en); }); if (a.tr && a.en && a.en.split(/\s+/).length <= 5) bag(a.tr, a.en); });
    turlar(K).forEach((t) => bag(iki(t.ad).tr, iki(t.ad).en, t.f, ...(t.ara || [])));
    terimler(K).forEach((t) => bag(t.tr, t.en, ...(t.es || []), ...(t.kisa && t.kisa.length > 1 ? [t.kisa] : [])));
    return G;
  }
  /* dizin: D = belgeler ({g, ad, alt, m: [ad, tanım, gövde], hedef…}), P = belirteç → [belge*3 + alan], V = sözcük dağarcığı, KK = belirteç → kökler */
  function araDizin2(K) {
    const anah = `${(SN[K.id] || {}).d || ''}|${oku('dk:sinav')}|${K.cozum ? 1 : 0}|${TV[K.id] ? 1 : 0}`, x = ARD.get(K.id);
    if (x && x.anah === anah) return x.IX;
    const D = [], P = new Map();
    const ekle = (o, ad, tanim, govde, adlar) => {
      const d = D.length; o.m = [metin(ad), metin(tanim), metin(govde)]; o.adlar = (adlar || [o.ad]).map((a) => katla(a).replace(/\s+/g, ' ').trim()).filter(Boolean); D.push(o);
      o.m.forEach((s, f) => { if (!s) return; for (const t of new Set(toklar(s))) { let L = P.get(t); if (!L) P.set(t, (L = [])); L.push(d * 3 + f); } });
    };
    const szEn = new Set(terimler(K).map((t) => enNorm(t.en)));
    terimler(K).forEach((t) => {
      const sz = szBul(K, t.en);
      ekle({ g: 'terim', ad: t.tr, alt: `${t.en}${t.kisa ? ` · ${t.kisa}` : ''}`, ck: `_terim/${t.id}`, tid: t.id, sem: semKat(t.kisa) }, [t.tr, t.en, t.kisa, t.es], [t.tanim, t.tanim_en], [(t.ornek || {}).baslik, (t.ornek || {}).metin, (t.fark || []).map((f) => f.fark), (t.formul || []).map((f) => [f.rol, texDuz(f.tex)]), sz ? [sz.fark, (sz.ornek || {}).en, (sz.ornek || {}).tr] : []], [t.tr, t.en, ...(t.es || [])]);
    });
    (K.kavramlar || []).forEach((k) => {
      const pr = k.parcalar || {}, D2 = dilK(K, k.id) || {};
      ekle({ g: 'kavram', ad: `${k.sembol} · ${k.ad}`, alt: k.en, ck: `${k.id}/tanim`, kv: k.id, sem: semKat(k.sembol) }, [k.ad, k.en, k.sembol, k.id.replace(/-/g, ' ')], (pr.tanim || {}).html, [(D2.cumle || []).map((c) => [c.tr, c.en]), (D2.terim || []).map((t) => [t.tr, t.en])], [k.ad, k.en, k.id.replace(/-/g, ' ')]);
      const P2 = pr.formul;
      if (P2) {
        ekle({ g: 'parca', ad: `Formül · ${k.ad}`, alt: k.sembol, ck: `${k.id}/formul`, kv: k.id }, [`${k.ad} formülü`], (P2.terimler || []).map((t) => [t.sembol, t.ad, t.birim]), [P2.html, (P2.terimler || []).map((t) => [t.anlam, t.tipik]), P2.tex != null ? svgTex(K, P2.tex) : '']);
        (P2.terimler || []).forEach((t) => ekle({ g: 'formul', ad: `${t.sembol} · ${t.ad}`, alt: `${k.ad}${t.birim ? ` · ${t.birim}` : ''}`, ck: `${k.id}/formul`, kv: k.id, tsem: t.sembol, sem: semKat(t.sembol) }, [t.sembol, t.ad], [t.anlam, t.birim], [t.tipik, k.ad], [t.ad]));
      }
      if (pr.ispat) ekle({ g: 'parca', ad: `Türetim · ${k.ad}`, alt: k.sembol, ck: `${k.id}/ispat`, kv: k.id }, [`${k.ad} türetim`], pr.ispat.html, (pr.ispat.adimlar || []).map((a) => [a.html, a.tex != null ? svgTex(K, a.tex) : '']));
      if (pr.diyagram) ekle({ g: 'parca', ad: `Diyagram · ${k.ad}`, alt: k.sembol, ck: `${k.id}/diyagram`, kv: k.id }, [`${k.ad} diyagram`], pr.diyagram.html, []);
      if (pr.anim) ekle({ g: 'parca', ad: `Animasyon · ${k.ad}`, alt: k.sembol, ck: `${k.id}/anim`, kv: k.id }, [`${k.ad} animasyon`], pr.anim.html, (pr.anim.kareler || []).map((x) => x.html));
      if (pr.kod) ekle({ g: 'parca', ad: `Kod · ${k.ad}`, alt: pr.kod.dil || '', ck: `${k.id}/kod`, kv: k.id }, [`${k.ad} kod ${pr.kod.dil || ''}`], pr.kod.html, (pr.kod.satirlar || []).map((s) => s[1]));
    });
    soruSirasi(K).forEach((q) => {
      const R = q.rehber || {}, C = czSoru(K, q.id), DS = dilS(K, q.id) || {};
      ekle({ g: 'soru', ad: `${q.id} · ${q.baslik}`, alt: `PDF s. ${q.pdf_soru ?? '—'}`, soru: q.id, ana: q.id }, [q.id, q.baslik], [q.soru, R.istiyor], [q.ipucu, q.giris, q.oz, R.tip, R.tuzak, R.kural, R.kalip, R.veriler, (R.formul || []).map((f) => [f.ad, f.neden, htmlTex(K, f.tex), (f.terimler || []).map((t) => t.join(' '))]), htmlTex(K, q.soru), (DS.cift || []).map((c) => [c.tr, c.en]), (DS.yaz || []).map((c) => [c.tr, c.en]), C ? [(C.alternatif || []).map((a) => [a.ne, a.sonuc]), (C.ayrim || []).map((a) => [a.soru, a.cevap])] : []], [q.baslik]);
      const A = C && (C.adim || []).length ? C.adim.map((a) => ({ ne: a.ne, s: a.sonuc, t: [a.ne, a.sonuc], g: [a.islem, a.neden, a.kontrol, a.dikkat, a.en], o: 1 }))
        : (R.adimlar || []).length ? R.adimlar.map((a) => ({ ne: `${a.kisa} · ${duzMetin(a.ne)}`, s: duzMetin(a.sonuc), t: [a.kisa, a.ne, a.sonuc], g: [a.nasil, a.neden, htmlTex(K, a.nasil)] }))
          : (q.adimlar || []).map((a) => ({ ne: kisalt(duzMetin(a.html), 90), s: '', t: [a.html], g: [htmlTex(K, a.html)] }));
      A.forEach((a, i) => ekle({ g: 'adim', ad: `${q.id} · ${i + 1}. adım: ${kisalt(a.ne, 90)}`, alt: kisalt(a.s, 60), soru: q.id, adim: i, oyn: !!a.o, ana: `${q.id}/${a.o ? 'o' : 'a'}${i + 1}` }, [`${q.id} ${i + 1}. adım`], a.t, a.g, [a.ne]));
    });
    if (puVar(K)) { // VIZE-316: Vize pusulası + beş akış
      ekle({ g: 'konu', tl: 'Vize pusulası', ad: K.pusula.ad, alt: K.pusula.alt, ck: '_pusula' }, [K.pusula.ad, K.pusula.alt, 'vize pusulası el hesabı', K.pusula.en], K.pusula.giris, K.pusula.akis.map((x) => [x.ad, x.alt]));
      K.pusula.akis.forEach((x) => ekle({ g: 'konu', tl: 'Vize pusulası', ad: `${x.ad} · ${x.alt}`, alt: K.pusula.ad, ck: `_pusula/${x.id}` }, [x.ad, x.alt, x.en], [x.ne, x.verilen], [x.adim, x.denetle, x.tuzak, x.yaz, x.kisa, (x.ornek || []).map((o) => o.metin)]));
    }
    K.bolumler.forEach((b) => b.ogeler.filter((o) => o.tur !== 'soru' && o.html).forEach((o) => ekle({ g: 'konu', ad: o.baslik, alt: bolumAd(K, b), ana: `bol/${b.id}`, bol: b.id }, [o.baslik], o.html, [o.oz, htmlTex(K, o.html)])));
    (K.sozluk || []).forEach((s) => { if (szEn.has(enNorm(s.en))) return; ekle({ g: 'sozluk', ad: s.en, alt: s.tr, ck: `_sozluk/${s.en}`, en: s.en }, [s.en, s.tr], [s.fark], [(s.ornek || {}).en, (s.ornek || {}).tr, s.es, s.bak], [s.en, s.tr]); });
    HS(K).forEach((h) => {
      const a = iki(h.ad);
      ekle({ g: 'hesap', ad: a.tr, alt: h.formul || iki(h.aciklama).tr, ck: `_hesap/${h.id}`, hs: h.id }, [a.tr, a.en], [iki(h.aciklama).tr, h.formul], [iki(h.aciklama).en, (h.hazir || []).map((z) => z.ad)], [a.tr, a.en]);
      [...(h.girdi || []), ...(h.cikti || [])].forEach((g) => ekle({ g: 'formul', ad: `${g.sembol || g.id} · ${iki(g.ad).tr}`, alt: `${a.tr}${g.birim ? ` · ${g.birim}` : ''}`, ck: `_hesap/${h.id}`, hs: h.id, sem: semKat(g.sembol || g.id) }, [g.sembol || g.id, iki(g.ad).tr, iki(g.ad).en], [g.birim, iki(g.yorum).tr], [], [iki(g.ad).tr, iki(g.ad).en]));
    });
    turlar(K).forEach((t) => ekle({ g: 'kimya', tl: 'Tür', ad: `${t.f} · ${iki(t.ad).tr}`, alt: iki(t.ad).en, ck: `_tur/${t.id}`, sem: semKat(t.f) }, [t.f, iki(t.ad).tr, iki(t.ad).en, t.ara], [iki(t.sinif).tr, iki(t.aciklama).tr], [iki(t.aciklama).en, iki(t.sinif).en], [iki(t.ad).tr, iki(t.ad).en]));
    tepkimeler(K).forEach((r) => ekle({ g: 'kimya', tl: 'Tepkime', ad: `${r.id} · ${r.denk}`, alt: iki(r.ad).tr, ck: `_tepkime/${r.id}` }, [r.denk, iki(r.ad).tr, iki(r.ad).en, r.id], [tipAd(r.tip), iki(r.aciklama).tr], [iki(r.aciklama).en], [iki(r.ad).tr]));
    donguler(K).forEach((d) => ekle({ g: 'kimya', tl: 'Çevrim', ad: iki(d.ad).tr, alt: iki(d.ad).en, ck: `_dongu/${d.id}` }, [iki(d.ad).tr, iki(d.ad).en, 'çevrim döngü cycle'], [iki(d.aciklama).tr], (d.adim || []).map((s) => iki(s.ne).tr)));
    czKars(K).forEach((y) => ekle({ g: 'kars', ad: y.baslik, alt: (y.sutun || []).map(sutunAd).join(' · '), ck: `_kars/=${y.id}`, kz: y.id }, [y.baslik, (y.sutun || []).map((s) => (typeof s === 'string' ? s : [s.tr, s.en]))], (y.satir || []).map((r) => [r.ad, r.h]), [(y.sec || []), (y.satir || []).map((r) => r.en)]));
    (K.kavramlar || []).forEach((k) => ((dilK(K, k.id) || {}).karsilastir || []).forEach((kr) => ekle({ g: 'kars', ad: kr.baslik || 'Karşılaştır', alt: k.ad, ck: `${k.id}/dil` }, [kr.baslik], (kr.sutun || []).map((s) => [s.en, s.tr]), (kr.sutun || []).map((s) => s.not))));
    const V = SV(K);
    if (V) {
      Object.entries(V.kavram || {}).forEach(([id, X]) => { const k = kavramBul(K, id); if (k) ekle({ g: 'sinav', ad: `${k.sembol} · ${k.ad}`, alt: kisalt(X.neden, 70), ck: `${id}/sinav`, kv: id, sn: X }, [k.ad, k.en], [X.neden], [X.bil, X.sorulus, X.tuzak]); });
      Object.entries(V.soru || {}).forEach(([sid, S]) => { const q = K.sorular[sid]; if (q) ekle({ g: 'sinav', ad: `${sid} · ${q.baslik}`, alt: kisalt(S.neden, 70), soru: sid, ana: sid, sn: S }, [sid, q.baslik], [S.neden, S.ipucu], [S.varyant]); });
    }
    const KK = new Map(); for (const t of P.keys()) KK.set(t, kokler(t));
    const IX = { D, P, V: [...P.keys()], KK, ES: esKur(K) };
    ARD.set(K.id, { anah, IX });
    return IX;
  }
  // bir sorgu belirtecinin dağarcıktaki karşılıkları: tam 1 · kök 0,85 · önek 0,72 · kök önek 0,62 (· w eş anlam katsayısı)
  function eslesen(IX, q, w, m = new Map()) {
    const koy = (v, k) => { k *= w; if (!(m.get(v) >= k)) m.set(v, k); };
    if (IX.P.has(q)) koy(q, 1);
    if (q.length < 3 && !/[^\x00-\x7f]/.test(q)) return m; // kısa belirteç (p, cn, et): yalnız tam
    const qk = kokler(q);
    for (const v of IX.V) {
      if (v === q) continue;
      const vk = IX.KK.get(v);
      if (qk.some((x) => vk.includes(x))) koy(v, 0.85);
      else if (q.length >= 3 && v.startsWith(q)) koy(v, 0.72);
      else if (qk.some((x) => x.length >= 4 && x !== q && v.startsWith(x))) koy(v, 0.62);
    }
    return m;
  }
  // yazım hatası: ilk harf aynı, uzaklık ≤ 1 (4–7 harf) ya da ≤ 2 (8+ harf)
  function bulanik(IX, q) {
    const m = new Map(), k = q.length >= 8 ? 2 : 1;
    for (const v of IX.V) { if (v[0] !== q[0] || Math.abs(v.length - q.length) > k || v.length < 3) continue; const d = mesafe(q, v, k); if (d <= k) m.set(v, d === 1 ? 0.5 : 0.4); }
    return m;
  }
  function esBul(IX, ifade) { const a = katla(ifade).replace(/\s+/g, ' ').trim(); const s = IX.ES.get(a); if (s) return [...s]; for (const k of kokler(a)) { const t = IX.ES.get(k); if (t) return [...t]; } return []; }
  // belge puanı: her sorgu belirteci için en iyi (kalite × alan ağırlığı) toplamı + ad / sembol / tür artısı; eksik belirteç cezası
  function puanla(IX, M, q) {
    const N = M.length, S = new Map();
    M.forEach((m, i) => { for (const [v, k] of m) { const L = IX.P.get(v); if (!L) continue; for (const x of L) { const d = (x / 3) | 0, p = k * ALAN_W[x % 3]; let s = S.get(d); if (!s) S.set(d, (s = new Float32Array(N))); if (p > s[i]) s[i] = p; } } });
    const qn = katla(q).replace(/\s+/g, ' ').trim(), qc = qn.replace(/\s+/g, ''), R = new Map();
    for (const [d, s] of S) {
      let top = 0, n = 0; for (const v of s) if (v > 0) { n++; top += v; }
      const o = IX.D[d];
      let p = top;
      if (o.adlar.some((a) => a === qn)) p += 5; else if (o.adlar.some((a) => a.startsWith(qn))) p += 2.5; else if (qn.length > 2 && o.adlar.some((a) => a.includes(qn))) p += 1.2;
      if (o.sem && qc && (o.sem === qc || o.sem.split(/[=/·,()]/).includes(qc))) p += 6;
      p += GRUP_ON[o.g] || 0;
      R.set(d, { d, o, p: p * (n / N) ** 2, tam: n === N, n });
    }
    return R;
  }
  // arama: {L: [{o, p, tam}], E: vurgulanacak belirteçler, es: eş anlamla aranan ifadeler, duz: [[yazılan, düzeltme]]}
  function araBul2(K, q) {
    const IX = araDizin2(K), qt = [...new Set(toklar(q))].slice(0, 8);
    if (!qt.length) return { L: [], E: new Set(), es: [], duz: [] };
    const esKull = new Set(), duz = [];
    const M = qt.map((t) => {
      const m = eslesen(IX, t, 1);
      for (const a of esBul(IX, t)) if (!/\s/.test(a)) { const n0 = m.size; eslesen(IX, a, 0.85, m); if (m.size > n0) esKull.add(a); }
      if (!m.size && t.length >= 4 && /\p{L}/u.test(t)) { const f = bulanik(IX, t); if (f.size) { for (const [v, k] of f) m.set(v, k); duz.push([t, [...f.entries()].sort((a, b) => b[1] - a[1] || (IX.P.get(b[0]) || []).length - (IX.P.get(a[0]) || []).length)[0][0]]); } }
      return m;
    });
    const R = puanla(IX, M, q), Eek = new Set();
    // bütün ifadenin eş anlamları (su bütçesi ↔ water balance; tek sözcükte yalnız çok sözcüklü karşılıklar)
    for (const a of esBul(IX, q).filter((x) => qt.length > 1 || /\s/.test(x)).slice(0, 4)) {
      const at = [...new Set(toklar(a))]; if (!at.length) continue;
      const AM = at.map((t) => eslesen(IX, t, 0.85));
      let kat = false;
      for (const [d, r] of puanla(IX, AM, a)) { if (!r.tam) continue; kat = true; const x = R.get(d); if (!x || !x.tam || x.p < r.p) R.set(d, r); }
      if (kat) { esKull.add(a); AM.forEach((m) => m.forEach((k, v) => { if (k >= 0.6) Eek.add(v); })); }
    }
    // bitişik yazım (subutcesi, waterbalance): sonuç yoksa boşluksuz ad içinde ara
    if (!R.size) { const qc = katla(q).replace(/[^\p{L}\p{N}]+/gu, ''); if (qc.length >= 4) IX.D.forEach((o, d) => { if (o.adlar.some((a) => a.replace(/[^\p{L}\p{N}]+/gu, '').includes(qc))) R.set(d, { d, o, p: 2 + (GRUP_ON[o.g] || 0), tam: true, n: 1 }); }); }
    const E = new Set(Eek); M.forEach((m) => m.forEach((_, v) => E.add(v)));
    const L = [...R.values()].sort((a, b) => (b.tam - a.tam) || b.p - a.p);
    const tam = L.filter((x) => x.tam);
    return { L: tam.length ? tam : L.filter((x) => x.n >= Math.ceil(qt.length / 2)).map((x) => ({ ...x, kismi: true })), E, es: [...esKull].filter((a) => !qt.includes(a)).slice(0, 4), duz, qt };
  }
  // eski arayüzün çağırdığı ad (önizleme, sınamalar): yalnız belgeler
  const araBul = (K, q) => araBul2(K, q).L.map((x) => x.o);
  // sınama kancası (tools/dkm_test.cjs --o a): sorgu → ilk 10 sonuç özeti; dizin kurma süresi
  window.__dkAra = {
    ara: (kid, q) => { const K = (window.DK || {})[kid]; if (!K) return null; const A = araBul2(K, q); return { n: A.L.length, kismi: A.L.some((x) => x.kismi), es: A.es, duz: A.duz, L: A.L.slice(0, 10).map((x) => ({ g: x.o.g, ad: x.o.ad, ck: x.o.ck || '', ana: x.o.ana || '', p: Math.round(x.p * 100) / 100 })) }; },
    dizin: (kid) => { const K = (window.DK || {})[kid]; if (!K) return null; ARD.delete(kid); const t = performance.now(); const IX = araDizin2(K); return { ms: Math.round(performance.now() - t), belge: IX.D.length, sozcuk: IX.V.length, es: IX.ES.size }; },
    yukle: (kid) => yukle(kid).then((K) => terimYukle(K).then(() => terimTam(K))).then(() => true),
  };
  // vurgulu kesit: eşleşen sözcükler <mark>; ilk eşleşmenin çevresinden ~uz karakter
  function kesit(s0, E, uz = 170) {
    const s = String(s0 || ''); if (!s) return '';
    const W = [...s.matchAll(TOK)].filter((m) => { const f = katla(m[0]); return E.has(f) || f.split(/[/·\-.,]+/).some((x) => x.length > 1 && E.has(x)); });
    let bas = 0;
    if (W.length && W[0].index > 40 && s.length > uz) { bas = Math.max(0, W[0].index - 45); const b = s.indexOf(' ', bas); if (b > 0 && b < W[0].index) bas = b + 1; }
    const son = Math.min(s.length, bas + uz);
    let h = '', j = bas;
    for (const m of W) { if (m.index < bas) continue; if (m.index + m[0].length > son) break; h += kac(s.slice(j, m.index)) + `<mark>${kac(m[0])}</mark>`; j = m.index + m[0].length; }
    h += kac(s.slice(j, son));
    return (bas > 0 ? '…' : '') + h.trim() + (son < s.length ? '…' : '');
  }
  const kesitSec = (o, E, uz) => { for (const f of [1, 2, 0]) { const s = o.m[f]; if (s && [...s.matchAll(TOK)].some((m) => E.has(katla(m[0])))) return kesit(s, E, uz); } return kac(kisalt(o.m[1] || o.m[2] || '', uz || 140)); };
  const arSonOku = () => { try { return JSON.parse(oku('dk:arason') || '[]').filter((x) => typeof x === 'string').slice(0, 8); } catch (e) { return []; } };
  const arSonYaz = (q) => { const t = String(q || '').trim(); if (t.length < 2) return; sakla('dk:arason', JSON.stringify([t, ...arSonOku().filter((x) => x !== t)].slice(0, 8))); };
  // bulunamayan aramalar: yalnız bu cihazda (içerik tamamlamak için; dışa gönderilmez)
  const arYokOku = () => { try { const x = JSON.parse(oku('dk:arayok') || '[]'); return Array.isArray(x) ? x.filter((y) => y && typeof y.q === 'string').slice(0, 60) : []; } catch (e) { return []; } };
  const arYokYaz = (q, kid) => { const t = String(q || '').trim(); if (t.length < 3) return; const L = arYokOku(), i = L.findIndex((x) => katla(x.q) === katla(t) && x.k === kid); const x = i >= 0 ? L.splice(i, 1)[0] : { q: t, k: kid, n: 0 }; x.n++; x.t = Date.now(); sakla('dk:arayok', JSON.stringify([x, ...L].slice(0, 60))); };
  const arGorunum = () => !!ckDurum && /^_ara(\/|$)/.test(ckDurum.kPart || '');
  function araSatir(x, i, E, kid) {
    const o = x.o;
    return `<li class="ar-o"><button type="button" class="ar-sat" data-i="${i}" aria-expanded="false"><span class="ar-t">${kac(o.tl || GRUP_AD[o.g] || '')}${kid ? ` · ${kac(kid)}` : ''}</span><span class="a">${kesit(o.ad, E, 200)}</span>${o.alt ? `<span class="b">${kesit(o.alt, E, 90)}</span>` : ''}<span class="ar-kesit">${kesitSec(o, E, 170)}</span></button><div class="ar-on" hidden></div></li>`;
  }
  /* ---------- ETK4 SITE (27 Kas): arama sonuçlarında «Sitede» kümesi ----------
     ../ortak/ara-dizin.json (tools/ara_dizin.mjs): Akademi öğeleri (ders kartı, ispat, simülasyon, kavram, 3B şekil, canlı hava, araç),
     alt site çapaları (Harita Okulu, HEC-HMS Okulu, Brifing, CBS …), soru çözümü / sınav atölyesi konu başlıkları, ders notu bölümleri,
     alt site sayfaları. İlk kitap kümesinin altına en iyi 8 eşleşme; bağ ana pencerede açılır (gömülüde üst pencere). Dosya yoksa küme çıkmaz. */
  let SITE = null;
  const SITE_HARF = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'â': 'a', 'î': 'i', 'û': 'u' };
  const siteNorm = (s) => String(s || '').toLocaleLowerCase('tr').replace(/[çğıöşüâîû]/g, (c) => SITE_HARF[c]).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const siteYukle = () => SITE || (SITE = fetch(new URL('../ortak/ara-dizin.json', location.href).href, { cache: 'force-cache' }).then((r) => (r.ok ? r.json() : null)).then((j) => ((j && j.o) || []).map(([tur, ad, kisa, url]) => ({ tur, ad, kisa, url, n: siteNorm(ad), k: siteNorm(kisa) }))).catch(() => []));
  function siteBul(L, q) {
    const qn = siteNorm(q), T = qn.split(' ').filter((x) => x.length >= 2);
    if (!T.length) return [];
    const kok = (t) => (t.length > 5 ? t.slice(0, Math.max(4, t.length - 2)) : t); // basit ek budama (yağışın → yağı…)
    const R = [];
    for (const x of L) {
      let p = 0;
      for (const t of T) { const k = kok(t); if (x.n.includes(t)) p += x.n.startsWith(t) || x.n.includes(' ' + t) ? 3 : 2; else if (x.n.includes(k)) p += 1.5; else if (x.k.includes(k)) p += 0.6; else { p = -1; break; } }
      if (p > 0) R.push([p + (x.n === qn ? 4 : 0) - x.n.length / 400, x]);
    }
    return R.sort((a, b) => b[0] - a[0]).slice(0, 8).map((y) => y[1]);
  }
  function siteEkle(q) {
    const s0 = String(q || '').trim(); if (s0.length < 2) return;
    siteYukle().then((L) => {
      if (!arGorunum() || araInp.value.trim() !== s0 || !L || !L.length) return;
      $$('.ar-site', ckIc).forEach((x) => x.remove());
      if (arTur) return; // tür süzgeci açıkken yalnız o tür
      const R = siteBul(L, s0); if (!R.length) return;
      const kok = new URL('../', location.href).href;
      const h = `<section class="ar-g ar-site" data-g="_site"><h3 class="ar-h">Sitede <span class="say">${R.length}</span></h3><ul class="ar-l ar-site-l">${R.map((x) => `<li><a class="ar-site-sat" href="${kac(new URL(x.url, kok).href)}"><span class="ar-t">${kac(x.tur)}</span><span class="a">${kac(x.ad)}</span>${x.kisa ? `<span class="b">${kac(x.kisa)}</span>` : ''}</a></li>`).join('')}</ul></section>`;
      const ilk = $('.ar-g', ckIc);
      if (ilk) ilk.insertAdjacentHTML('afterend', h); else ckIc.insertAdjacentHTML('beforeend', h);
    });
  }
  window.__dkSite = { yukle: siteYukle, bul: (q) => siteYukle().then((L) => siteBul(L, q)) }; // sınama kancası
  function araTamYaz(K, q) {
    const V = SV(K), ipucu = 'Kavram, terim (TR ya da EN), formül, sembol (ΔS, CN, tc), birim (mm/h, hPa, dBZ), soru (S12) ya da çözüm adımı ara. Türkçe harf ve ek gerekmez; küçük yazım hataları da bulunur.';
    if (!katla(q).trim()) {
      const son = arSonOku(), yok = arYokOku().filter((x) => x.k === K.id);
      arSon = { K, q, L: [] };
      ckIc.innerHTML = `<p class="ck-not">${ipucu}</p>${son.length ? `<h3 class="ar-h">Son aramalar</h3><div class="ar-cipler">${son.map((x) => `<button type="button" class="kucuk ar-son" data-q="${kac(x)}">${kac(x)}</button>`).join('')}</div>` : ''}<h3 class="ar-h">Örnekler</h3><div class="ar-cipler">${[...(K.kavramlar || []).slice(0, 2).map((k) => k.ad), (K.kavramlar || [])[0] && K.kavramlar[0].en, (K.kavramlar || []).map((k) => k.sembol).find((s) => s && s.length <= 4), 'S1'].filter(Boolean).map((x) => `<button type="button" class="kucuk ar-son" data-q="${kac(x)}">${kac(x)}</button>`).join('')}</div>${yok.length ? `<details class="ar-yok"><summary>Bulunamayan aramaların · ${yok.length} <span class="yok">(yalnız bu cihazda)</span></summary><p class="yok">İçerik tamamlarken bakmak için tutulur; hiçbir yere gönderilmez.</p><ul>${yok.map((x) => `<li><button type="button" class="kucuk ar-son" data-q="${kac(x.q)}">${kac(x.q)}</button>${x.n > 1 ? ` <span class="yok">${x.n} kez</span>` : ''}</li>`).join('')}</ul><button type="button" class="kucuk ar-yok-sil">Listeyi temizle</button></details>` : ''}`;
      return;
    }
    const A = araBul2(K, q), L = [];
    const kat = (window.DK_KATALOG || []).map((k) => k.id).filter((id) => id !== K.id);
    const obur = arCapraz ? kat.filter((id) => window.DK && window.DK[id]).map((id) => [window.DK[id], araBul2(window.DK[id], q)]) : [];
    const RB = A.L.map((x) => ({ ...x, K })), RO = obur.flatMap(([K2, B]) => B.L.filter((x) => x.tam || !A.L.length).slice(0, 40).map((x) => ({ ...x, K: K2 }))).sort((a, b) => b.p - a.p);
    const R = [...RB, ...RO];
    const say = {}; R.forEach((x) => { say[x.o.g] = (say[x.o.g] || 0) + 1; });
    if (arTur && !say[arTur]) arTur = '';
    // kitap içi önce: tür grupları yalnız bu kitabın sonuçları; öbür kitaplar en sonda ayrı listede (kitap etiketiyle)
    const gruplar = ARA_GRUP.filter(([g]) => (g !== 'sinav' || V) && RB.some((x) => x.o.g === g) && (!arTur || arTur === g)).map(([g, ad]) => [g, ad, RB.filter((x) => x.o.g === g).sort((a, b) => b.p - a.p)]);
    const RO2 = RO.filter((x) => !arTur || x.o.g === arTur);
    const E = new Set([...A.E, ...obur.flatMap(([, B]) => [...B.E])]);
    let h = `<div class="ar-ust"><p class="ar-ozet"><b>${R.length}</b> sonuç${A.L.some((x) => x.kismi) ? ' <span class="yok">(kısmi eşleşme: sözcüklerin bir kısmı)</span>' : ''}</p>
      <div class="ar-kapsam" role="group" aria-label="Kapsam"><button type="button" class="kucuk ar-kap" data-kap="bu" aria-pressed="${!arCapraz}">Bu kitap</button><button type="button" class="kucuk ar-kap" data-kap="tum" aria-pressed="${arCapraz}">Tüm kitaplar</button></div>
      ${R.length ? `<div class="ar-suz" role="group" aria-label="Türe göre süz"><button type="button" class="kucuk" data-tur="" aria-pressed="${!arTur}">Tümü <span class="say">${R.length}</span></button>${ARA_GRUP.filter(([g]) => say[g]).map(([g, ad]) => `<button type="button" class="kucuk" data-tur="${g}" aria-pressed="${arTur === g}">${ad} <span class="say">${say[g]}</span></button>`).join('')}</div>` : ''}</div>`;
    if (A.es.length) h += `<p class="ar-bilgi">Eş anlamlarıyla da arandı: ${A.es.map((x) => `<b>${kac(x)}</b>`).join(' · ')}</p>`;
    if (A.duz.length && R.length) h += `<p class="ar-bilgi">Yazım hoşgörüsü: ${A.duz.map(([a, b]) => `«${kac(a)}» → <b>${kac(b)}</b>`).join(' · ')}</p>`;
    h += gruplar.map(([g, ad, l]) => `<section class="ar-g" data-g="${g}"><h3 class="ar-h">${ad} <span class="say">${l.length}</span></h3><ul class="ar-l">${l.map((x, j) => { L.push(x); return j < (arTur ? 40 : 6) ? araSatir(x, L.length - 1, E, x.K === K ? '' : x.K.kod) : ''; }).join('')}</ul>${l.length > (arTur ? 40 : 6) ? `<button type="button" class="kucuk ar-daha" data-g="${g}">${l.length - (arTur ? 40 : 6)} sonuç daha</button>` : ''}</section>`).join('');
    if (R.length && !RB.length) h += `<p class="ar-bilgi">«${kac(q)}» bu kitapta yok; öbür kitaplarda:</p>`;
    if (arCapraz && RO2.length) h += `<section class="ar-g ar-obur" data-g="_obur"><h3 class="ar-h">Öbür kitaplarda <span class="say">${RO2.length}</span></h3><ul class="ar-l">${RO2.map((x, j) => { L.push(x); return j < 8 ? araSatir(x, L.length - 1, E, x.K.kod) : ''; }).join('')}</ul>${RO2.length > 8 ? `<button type="button" class="kucuk ar-daha" data-g="_obur">${RO2.length - 8} sonuç daha</button>` : ''}</section>`;
    if (!R.length) {
      const oneri = arOneri(K, q, A);
      h += `<div class="ar-bos"><p><b>«${kac(q)}»</b> ${arCapraz ? 'hiçbir kitapta' : 'bu kitapta'} bulunamadı.</p>${oneri}${arCapraz ? '' : '<p><button type="button" class="kucuk ar-capraz">Öbür kitaplarda da ara</button></p>'}<p class="yok">Bu arama «bulunamayan aramalar» listesine eklenir (yalnız bu cihazda; içerik tamamlamak için).</p></div>`;
      clearTimeout(arYokZaman); arYokZaman = setTimeout(() => { if (arGorunum() && araInp.value.trim() === String(q).trim()) arYokYaz(q, K.id); }, 1500);
    } else if (!arCapraz) h += '<section class="ar-g ar-obur" data-g="obur"><h3 class="ar-h">Öbür kitaplar</h3><button type="button" class="kucuk ar-capraz">Öbür kitaplarda da ara</button></section>';
    arSon = { K, q, L, E };
    ckIc.innerHTML = h;
    siteEkle(q);
  }
  // sonuç yoksa: yazım düzeltmesi + adı en çok benzeyen kavram / terim / sözlük girdileri
  function arOneri(K, q, A) {
    const IX = araDizin2(K), qk = katla(q).replace(/\s+/g, ' ').trim();
    const duz = A.duz.length ? A.qt.map((t) => (A.duz.find(([a]) => a === t) || [t, t])[1]).join(' ') : '';
    const tri = (s) => { const t = `  ${s} `, S = new Set(); for (let i = 0; i < t.length - 2; i++) S.add(t.slice(i, i + 3)); return S; };
    const qs = tri(qk);
    const benz = IX.D.filter((o) => ['terim', 'kavram', 'sozluk', 'formul'].includes(o.g)).map((o) => { let b = 0; for (const a of o.adlar) { const s = tri(a); let n = 0; for (const x of qs) if (s.has(x)) n++; b = Math.max(b, n / (qs.size + s.size - n || 1)); } return [o, b]; }).filter(([, b]) => b > 0.18).sort((a, b) => b[1] - a[1]).slice(0, 6);
    return `${duz && duz !== qk ? `<p>Bunu mu demek istedin: <button type="button" class="kucuk ar-son" data-q="${kac(duz)}">${kac(duz)}</button></p>` : ''}${benz.length ? `<p class="yok">Yakın adlar:</p><div class="ar-cipler">${benz.map(([o]) => `<button type="button" class="kucuk ar-son" data-q="${kac(o.ad.replace(/^.*? · /, ''))}">${kac(o.ad)}</button>`).join('')}</div>` : ''}`;
  }
  // önizleme: tanım / formül / ilk adımlar / bağlar — yerinde açılır
  function araOnizle(K, o) {
    const ayni = K === simdiK, kb = ayni ? '' : K.id;
    const dug = (ad, veri, sinif = 'kucuk') => `<button type="button" class="${sinif} ar-eylem" ${veri}>${ad}</button>`;
    const ckDug = (ck) => dug('Çekmecede aç', `data-ar="ck" data-ck2="${kac(ck)}" data-kb="${kac(kb)}"`);
    const akDug = (h, ad = 'Akışta göster') => dug(ad, `data-ar="ak" data-h="${kac(h)}" data-kb="${kac(kb)}"`, 'kucuk ar-ak');
    const krDug = (id) => (ayni ? dug('＋ Karşılaştır', `data-ar="kr" data-kv="${kac(id)}"`) : '');
    let h = '';
    if (o.g === 'terim') {
      const t = terimBul(K, o.tid);
      if (t && TV[K.id] && !TV[K.id].tam) terimTam(K);
      if (t) { const f = (t.formul || []).find((x) => x && x.s != null), tv = TV[K.id]; h += terimKartHTML(K, t, true).replace(/<p class="ar-dug">[\s\S]*$/, ''); if (f && tv) h += `<div class="ar-formul">${tv.svg[f.s] || ''}</div>${f.rol ? `<p class="ar-terim">${kac(f.rol)}</p>` : ''}`; if (t.ornek && t.ornek.metin) h += `<p class="ar-terim"><b>Örnek:</b> ${kac(kisalt(t.ornek.metin, 200))}</p>`; }
      return h + `<p class="ar-dug">${ckDug(o.ck)}</p>`;
    }
    if (o.g === 'parca' || o.g === 'konu' || o.g === 'kimya') {
      h += `<p>${kesitSec(o, (arSon && arSon.E) || new Set(), 320)}</p>`;
      return h + `<p class="ar-dug">${o.ck ? ckDug(o.ck) : ''}${o.ana ? akDug(o.ana, o.g === 'konu' ? 'Konu sayfasını aç' : 'Akışta göster') : ''}${o.kv && o.g === 'parca' ? ckDug(`${o.kv}/tanim`).replace('Çekmecede aç', 'Kavramın tanımı') : ''}</p>`;
    }
    if (o.kv && (o.g === 'kavram' || o.g === 'formul' || o.g === 'sinav')) {
      const k = kavramBul(K, o.kv), P = (k.parcalar || {}).formul;
      const t = o.tsem && P ? (P.terimler || []).find((x) => x.sembol === o.tsem) : null;
      h += `<p>${kac(kisalt(duzMetin(((k.parcalar || {}).tanim || {}).html), 320))}</p>`;
      if (P && P.tex != null) h += `<div class="ar-formul" data-tex="${P.tex}"></div>`;
      if (t) h += `<p class="ar-terim"><b>${kac(t.sembol)}</b> — ${kac(t.ad)}${t.birim ? ` · <span class="yok">${kac(t.birim)}</span>` : ''}${t.anlam ? `<br>${kac(kisalt(duzMetin(t.anlam), 200))}` : ''}</p>`;
      else if (P && (P.terimler || []).length) h += `<p class="ar-terimler">${P.terimler.slice(0, 6).map((x) => `<span><b>${kac(x.sembol)}</b> ${kac(x.ad)}</span>`).join('')}</p>`;
      if (o.sn) h += `<p class="ar-sn">${snNokta(o.sn.olasilik)} ${kac(o.sn.neden || '')}</p>${snUl((o.sn.bil || []).slice(0, 3))}`;
      if ((k.sorular || []).length) h += `<div class="ar-cipler">${k.sorular.slice(0, 8).map((s) => dug(kac(s), `data-ar="ak" data-h="${kac(`${s}`)}" data-kb="${kac(kb)}"`, 'kucuk ar-ak ar-sq')).join('')}</div>`;
      h += `<p class="ar-dug">${ckDug(o.ck)}${krDug(k.id)}</p>`;
    } else if (o.soru) {
      const q = K.sorular[o.soru], A = oynAdimlar(K, q);
      if (o.g === 'adim') {
        const C = czSoru(K, q.id), a = o.oyn && C ? C.adim[o.adim] : null, r = !a ? ((q.rehber || {}).adimlar || [])[o.adim] : null;
        h += a ? `${a.kesin ? `<p class="isr-bas">${isr('kesin')}</p>` : ''}<p class="oyn-ne">${kac(a.ne)}</p>${a.islem ? `<div class="oyn-islem">${kac(a.islem)}</div>` : ''}${a.sonuc ? `<p class="oyn-sonuc">${isr('sonuc')}<b>${kac(a.sonuc)}</b></p>` : ''}${a.neden ? `<p><span class="oyn-et">Neden</span> ${kac(a.neden)}</p>` : ''}`
          : r ? `<p class="oyn-ne"><b>${kac(r.kisa)}</b> · ${r.ne || ''}</p>${r.sonuc ? `<p class="oyn-sonuc">${isr('sonuc')}<b>${r.sonuc}</b></p>` : ''}` : '';
        h += `<p class="ar-dug">${akDug(`${q.id}/${o.oyn ? 'o' : 'a'}${o.adim + 1}`, 'Bu adımı akışta göster')}</p>`;
      } else {
        h += `<p>${kac(kisalt(duzMetin(q.soru), 300))}</p>`;
        if (o.sn) h += `<p class="ar-sn">${snNokta(o.sn.olasilik)} ${kac(o.sn.neden || '')}${o.sn.ipucu ? ` · <b>İlk adım:</b> ${kac(o.sn.ipucu)}` : ''}</p>`;
        if (A.length && !A[0].html) h += `<ol class="ar-adim">${A.slice(0, 2).map((a) => `<li>${a.bas ? `<b>${a.bas}</b> · ` : ''}${a.ne}${a.sonuc ? ` → <b>${a.sonuc}</b>` : ''}</li>`).join('')}</ol>`;
        h += `<p class="ar-dug">${akDug(q.id, 'Soruyu akışta aç')}${A.length ? akDug(`${q.id}/o0`, 'Adım adım çöz') : ''}</p>`;
      }
    } else if (o.g === 'sozluk') {
      h += szKart(K, szBul(K, o.en), o.en).replace(/<a [^>]*data-ck="[^"]*"[^>]*>/g, '<span class="ar-pas">').replace(/<\/a>/g, '</span>');
      h += `<p class="ar-dug">${ckDug(o.ck)}</p>`;
    } else if (o.hs) {
      const hh = hesapBul(K, o.hs);
      h += hh && hh.tur !== 'eklenti' ? `<div class="hs-formul">${formulHTML(hh)}</div>` : hh && hh.aciklama ? `<p>${kac(iki(hh.aciklama).tr)}</p>` : '';
      h += `<p class="ar-dug">${ckDug(o.ck)}</p>`;
    } else if (o.g === 'kars') {
      const y = o.kz ? czKars(K).find((z) => z.id === o.kz) : null;
      if (y) h += `<p><b>${(y.sutun || []).map((s) => kac(sutunAd(s))).join(' · ')}</b></p>${snUl((y.sec || []).slice(0, 3))}`;
      h += `<p class="ar-dug">${ckDug(o.ck)}</p>`;
    } else h += `<p class="ar-dug">${ckDug(o.ck)}</p>`;
    return h;
  }
  document.addEventListener('click', (e) => {
    if (!arGorunum()) return;
    const b = e.target.closest('#ck-ic .ar-sat, #ck-ic .ar-son, #ck-ic .ar-daha, #ck-ic .ar-capraz, #ck-ic .ar-eylem, #ck-ic .ar-kap, #ck-ic .ar-suz button, #ck-ic .ar-yok-sil'); if (!b || !arSon) return;
    e.preventDefault(); e.stopPropagation();
    if (b.classList.contains('ar-son')) { araInp.value = b.dataset.q; araSuz(); if (ckMod() !== 'alt') araInp.focus(); return; }
    if (b.classList.contains('ar-yok-sil')) { sakla('dk:arayok', JSON.stringify(arYokOku().filter((x) => x.k !== arSon.K.id))); araTamYaz(arSon.K, ''); return; }
    if (b.closest('.ar-suz')) { arTur = b.dataset.tur || ''; araTamYaz(arSon.K, araInp.value); return; }
    if (b.classList.contains('ar-daha')) {
      const g = b.dataset.g, ul = $(`.ar-g[data-g="${g}"] .ar-l`, ckIc), var_ = $$('.ar-sat', ul).map((x) => +x.dataset.i);
      ul.insertAdjacentHTML('beforeend', arSon.L.map((x, i) => [x, i]).filter(([x, i]) => (g === '_obur' ? x.K !== arSon.K : x.o.g === g && x.K === arSon.K) && !var_.includes(i)).map(([x, i]) => araSatir(x, i, arSon.E, x.K === arSon.K ? '' : x.K.kod)).join(''));
      b.hidden = true; return;
    }
    if (b.classList.contains('ar-capraz') || (b.classList.contains('ar-kap') && b.dataset.kap === 'tum' && !arCapraz)) {
      b.disabled = true; b.textContent = 'Kitaplar yükleniyor…';
      Promise.all((window.DK_KATALOG || []).map((k) => yukle(k.id).then((K2) => terimYukle(K2)).catch(() => null))).then(() => { arCapraz = true; if (arGorunum()) araTamYaz(arSon.K, araInp.value); });
      return;
    }
    if (b.classList.contains('ar-kap')) { arCapraz = b.dataset.kap === 'tum'; araTamYaz(arSon.K, araInp.value); return; }
    if (b.classList.contains('ar-sat')) {
      const x = arSon.L[+b.dataset.i], on = b.nextElementSibling; if (!x || !on) return;
      const ac = on.hidden;
      if (ac && !on.childElementCount) { on.innerHTML = araOnizle(x.K, x.o); texDoldur(on, x.K); glifDuzelt(on); }
      on.hidden = !ac; b.setAttribute('aria-expanded', String(ac));
      if (ac) arSonYaz(araInp.value);
      return;
    }
    // eylemler
    const k = b.dataset.ar, kb = b.dataset.kb;
    arSonYaz(araInp.value);
    if (k === 'kr') { sepetEkle(simdiK, b.dataset.kv); return; }
    if (kb) { location.hash = k === 'ck' ? `#${kb}/k/${b.dataset.ck2}` : `#${kb}/${b.dataset.h}`; return; }
    if (k === 'ck') location.hash = `#${ckDurum.onEk}/k/${b.dataset.ck2}`;
    else if (k === 'ak') anaGit(`#${ckDurum.K.id}/${b.dataset.h}`, true);
  }, true);
  function araCk(K, q, ayni) {
    kirintiYaz(K, [['Ara', null]]);
    $('#ck-baslik').innerHTML = `Ara<small>kavram · soru · çözüm adımı · terim · formül · hesap${SV(K) ? ' · sınav notu' : ''} · öbür kitaplar</small>`;
    $('#ck-sira').innerHTML = ''; $('#ck-sekme').innerHTML = ustSekme(K, '');
    if (araInp.value !== q) araInp.value = q;
    araKapat();
    if (ayni) return;
    araTamYaz(K, q);
    if (terimVar(K) && !TV[K.id]) terimYukle(K).then(() => { if (arGorunum() && ckDurum.K === K) araTamYaz(K, araInp.value); });
  }
  function araAc() {
    const K = simdiK; if (!K) return;
    if (!arGorunum()) location.hash = `#${ckDurum ? ckDurum.onEk : anaOnEk(K)}/k/_ara${araInp.value.trim() ? '/' + araInp.value.trim() : ''}`;
    setTimeout(() => { araInp.focus(); araInp.select(); }, 80);
  }
  document.addEventListener('keydown', (e) => {
    if (!simdiK || e.altKey) return;
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); araAc(); return; }
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) { e.preventDefault(); araAc(); }
  });
  $('#ust-ara')?.addEventListener('click', araAc);
  $('#ust-akis')?.addEventListener('click', () => { if (simdiK) anaGit(`#${simdiK.id}/akis`); });
  // _ara görünümünde ↓ ilk sonuca; sonuçlarda ↑ ↓ gezinme
  ckIc.addEventListener('keydown', (e) => {
    if (!arGorunum() || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
    const S = $$('.ar-sat', ckIc), i = S.indexOf(document.activeElement); if (i < 0) return;
    e.preventDefault(); const j = i + (e.key === 'ArrowDown' ? 1 : -1);
    if (j < 0) araInp.focus(); else if (S[j]) S[j].focus();
  });

  /* ---------- ETK Ö6 (26 Kas): kavram karşılaştırma ----------
     «＋ Karşılaştır» kavram çekmecesinde, atlas satırında ve arama önizlemesinde → çekmecenin altında sepet (2–4 kavram, dk:sepet:<kitap>)
     → #…/k/_kars/<a>~<b>[~<c>~<d>]: sütun başına kavram; satırlar sembol, İngilizce, tanımın ilk maddesi, formül, birim, ne zaman,
     sorular, sınav olasılığı (kilit açıksa). Seçilenleri içeren hazır karşılaştırma (cozum.kars) üstte. Telefonda satır yığını. */
  const SEPET_EN = 4;
  const sepetOku = (kid) => { try { const x = JSON.parse(oku(`dk:sepet:${kid}`) || '[]'); return Array.isArray(x) ? x.filter((y) => typeof y === 'string').slice(0, SEPET_EN) : []; } catch (e) { return []; } };
  const sepetYaz = (kid, L) => sakla(`dk:sepet:${kid}`, JSON.stringify(L.slice(0, SEPET_EN)));
  const sepetEl = document.createElement('div');
  sepetEl.className = 'sepet'; sepetEl.id = 'sepet'; sepetEl.hidden = true; sepetEl.setAttribute('aria-label', 'Karşılaştırma sepeti');
  ck.append(sepetEl);
  function sepetYazdir() {
    const K = ckDurum && ckDurum.K; if (!K) { sepetEl.hidden = true; return; }
    const L = sepetOku(K.id).map((id) => kavramBul(K, id)).filter(Boolean);
    sepetEl.hidden = !L.length;
    if (!L.length) { sepetEl.innerHTML = ''; return; }
    sepetEl.innerHTML = `<span class="sepet-et">Karşılaştır</span><span class="sepet-l">${L.map((k) => `<span class="sepet-cip" title="${kac(k.ad)}"><b>${kac(k.sembol)}</b><span class="sepet-ad">${kac(kisalt(k.ad, 22))}</span><button type="button" class="sepet-x" data-kv="${kac(k.id)}" aria-label="Sepetten çıkar: ${kac(k.ad)}">×</button></span>`).join('')}</span><span class="sepet-dug">${L.length >= 2 ? ckBag(`_kars/${L.map((k) => k.id).join('~')}`, `Yan yana (${L.length})`, 'dugme sepet-git') : `<span class="yok sepet-not">bir kavram daha seç</span>`}<button type="button" class="kucuk sepet-sil">Temizle</button></span>`;
  }
  function sepetEkle(K, id) {
    if (!K || !kavramBul(K, id)) return;
    const L = sepetOku(K.id), i = L.indexOf(id);
    if (i >= 0) L.splice(i, 1); else { L.push(id); if (L.length > SEPET_EN) L.shift(); }
    sepetYaz(K.id, L); sepetYazdir();
    $$('.kr-ekle', ck).forEach((b) => { if (b.dataset.kv) b.setAttribute('aria-pressed', String(L.includes(b.dataset.kv))); });
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.kr-ekle, .sepet-x, .sepet-sil'); if (!b || !ckDurum) return;
    e.preventDefault();
    if (b.classList.contains('sepet-sil')) { sepetYaz(ckDurum.K.id, []); sepetYazdir(); $$('.kr-ekle', ck).forEach((x) => x.setAttribute('aria-pressed', 'false')); return; }
    sepetEkle(ckDurum.K, b.dataset.kv);
  });
  const krEkleDug = (K, k, mini) => `<button type="button" class="kr-ekle${mini ? ' kr-mini' : ' kucuk'}" data-kv="${kac(k.id)}" aria-pressed="${sepetOku(K.id).includes(k.id)}" ${mini ? `aria-label="Karşılaştırmaya ekle: ${kac(k.ad)}" title="Karşılaştırmaya ekle"` : ''}>${mini ? '＋' : '＋ Karşılaştır'}</button>`;
  const ilkMadde = (k) => { const h = String(((k.parcalar || {}).tanim || {}).html || ''); const m = /<li[^>]*>([\s\S]*?)<\/li>/.exec(h) || /<p[^>]*>([\s\S]*?)<\/p>/.exec(h); return kisalt(duzMetin(m ? m[1] : h).replace(/^(Tanım|Tanim)\s*:\s*/u, ''), 170); };
  const kvTerim = (k) => { const T = (((k.parcalar || {}).formul || {}).terimler) || []; return T.find((t) => t.sembol === k.sembol) || T[0] || null; };
  const neZaman = (K, k) => { const X = snKv(K, k.id); if (X && (X.sorulus || []).length) return X.sorulus[0]; const t = duzMetin(((k.parcalar || {}).tanim || {}).html); const c = t.split(/(?<=[.;])\s+/).find((x) => /kullan|seçil|uygula|gerekir/i.test(x)); return c ? kisalt(c, 170) : ''; };
  function karsOzelHTML(K, ids) {
    const L = ids.map((id) => kavramBul(K, id)).filter(Boolean), V = SV(K);
    if (L.length < 2) return `<p class="yok">Karşılaştırmak için en az iki kavram seç (atlasta ya da kavram çekmecesinde «＋ Karşılaştır»).</p>`;
    const sat = [['Sembol', (k) => `<b class="kz-sem">${kac(k.sembol)}</b>`], ['İngilizce', (k) => `<span lang="en">${kac(k.en || '—')}</span>`], ['Tanım', (k) => kac(ilkMadde(k) || '—')],
      ['Formül', (k) => { const P = (k.parcalar || {}).formul; return P && P.tex != null ? `<div class="kz-formul" data-tex="${P.tex}"></div>` : '—'; }],
      ['Birim', (k) => { const t = kvTerim(k); return t && t.birim ? kac(t.birim) : '—'; }], ['Ne zaman?', (k) => kac(neZaman(K, k) || '—')],
      ['Sorular', (k) => ((k.sorular || []).length ? `<span class="kz-sq">${k.sorular.slice(0, 6).map((s) => soruCip(K, s)).join('')}</span>` : '—')],
      ...(V ? [['Sınav olasılığı', (k) => { const X = snKv(K, k.id); return X ? `${snNokta(X.olasilik)}${X.neden ? `<span class="kz-en">${kac(kisalt(X.neden, 90))}</span>` : ''}` : '—'; }]] : [])];
    const hazir = czKars(K).map((x) => [x, (x.kavram || []).filter((id) => ids.includes(id)).length]).filter(([, n]) => n).sort((a, b) => b[1] - a[1]).map(([x]) => x);
    return `${hazir.length ? `<section class="kz-hazir"><h3>Hazır karşılaştırma: ${kac(hazir[0].baslik)}</h3>${karsHazirHTML(K, hazir[0])}${hazir.length > 1 ? `<p class="ilgili"><span class="yok">Öbür hazırlar:</span> ${hazir.slice(1, 4).map((x) => ckBag(`_kars/=${x.id}`, kac(x.baslik), 'soru-bag')).join('')}</p>` : ''}</section>` : ''}
      <h3>Seçtiğin kavramlar yan yana</h3>${karsTabloHTML(L.map((k) => `${ckBag(`${k.id}/tanim`, `${kac(k.sembol)} · ${kac(k.ad)}`, 'kz-kv')}`), L.map((k) => `${k.sembol} · ${k.ad}`), sat.map(([ad, f]) => ({ ad: kac(ad), h: L.map(f) })))}`;
  }

  /* ---------- ETK2 DKM (26 Kas): terim kartı ----------
     Veri: terim/<kitap>.json → tools/derle.mjs → src/veri/<kitap>.terim.js (tembel; ana veride yalnız K.terim = {n, v}).
     Çekmece: _terim (bütün terimler, A–Z) · _terim/<id> (kart): tanım TR / EN · formüllerdeki yeri (sembol vurgulu + «bu formülde ne iş görür»)
     · 2–3 görsel (kitap şekli, kavram diyagramı, Akademi / Harita Okulu bağı; tembel) · gerçek meteorolojik örnek · benzer kavramlardan fark
     · bağlar (kavram, soru / adım, hesap aracı, sözlük). Arama sonucunda önizleme (araOnizle). */
  const TV = {};
  const terimVar = (K) => !!(K && K.terim && (K.terim.n || Array.isArray(K.terim.terim)));
  const tvKur = (d) => ({ terim: Array.isArray(d.terim) ? d.terim : [], svg: d.svg || [], bul: new Map((d.terim || []).map((t) => [t.id, t])) });
  /* ETK3 MOBIL (27 Kas): ilk açılışta hafif dizin (veri/<kitap>.terim-dizin.js ~0,2 MB: ad · kısaltma · tür · eş anlam · tanım · bağ; 316'da tam dosya
     1,8 MB). Dizinin sürümü ana veriyle (K.terim.v) tutmazsa ya da dosya yoksa tam dosya. Tam dosya (formül, görsel, örnek, fark) terim kartı
     açılınca, arama kutusuna odaklanınca ve arama ön izlemesinde yüklenir (terimTam); gelince arama dizini tam metinle yeniden kurulur. */
  const betikYukle = (src) => new Promise((ok) => { const s = document.createElement('script'); s.src = src; s.onload = () => ok(true); s.onerror = () => ok(false); document.head.append(s); });
  function terimYukle(K) {
    if (!terimVar(K)) return Promise.resolve(null);
    if (TV[K.id]) return Promise.resolve(TV[K.id]);
    if (Array.isArray(K.terim.terim)) { TV[K.id] = tvKur(K.terim); TV[K.id].tam = true; return Promise.resolve(TV[K.id]); }
    const a = `t:${K.id}`;
    if (!bekleyen[a]) {
      bekleyen[a] = betikYukle(`veri/${K.id}.terim-dizin.js?v=${encodeURIComponent(K.terim.v || '')}`).then(() => {
        const d = (window.DK_TERIM_DIZIN || {})[K.id];
        if (d && d.v === K.terim.v && Array.isArray(d.terim)) { if (!TV[K.id]) { TV[K.id] = tvKur(d); TV[K.id].tam = false; ARD.delete(K.id); } return TV[K.id]; }
        return terimTam(K);
      });
    }
    return bekleyen[a];
  }
  function terimTam(K) {
    if (!terimVar(K)) return Promise.resolve(null);
    if (TV[K.id] && TV[K.id].tam) return Promise.resolve(TV[K.id]);
    if (Array.isArray(K.terim.terim)) return terimYukle(K);
    const a = `tt:${K.id}`;
    if (!bekleyen[a]) bekleyen[a] = betikYukle(`veri/${K.id}.terim.js?v=${encodeURIComponent(K.terim.v || '')}`).then(() => { const d = (window.DK_TERIM || {})[K.id]; if (d) { TV[K.id] = tvKur(d); TV[K.id].tam = true; ARD.delete(K.id); } return TV[K.id] || null; });
    return bekleyen[a];
  }
  const terimler = (K) => (K && TV[K.id] ? TV[K.id].terim : []);
  const terimBul = (K, id) => (K && TV[K.id] ? TV[K.id].bul.get(id) || null : null);
  const terimSira = (K) => [...terimler(K)].sort((a, b) => String(a.tr).localeCompare(String(b.tr), 'tr'));
  const terimEn = (K, en) => { const a = enNorm(en); return a ? terimler(K).find((t) => enNorm(t.en) === a) || null : null; };
  const kavramTerim = (K, kid) => terimler(K).filter((t) => ((t.bag || {}).kavram || []).includes(kid));
  const TERIM_TUR_AD = { kavram: 'kavram', olcu: 'büyüklük', birim: 'birim', yontem: 'yöntem', surec: 'süreç', cihaz: 'cihaz', kod: 'kod' };
  const GORSEL_AD = { sekil: 'Kitap şekli', diyagram: 'Kavram diyagramı', sim: 'Akademi simülasyonu', lab: 'Harita Okulu laboratuvarı', dis: 'Kaynak' };
  const semNorm = (s) => norm(String(s || '').replace(/[\s{}_^\\]/g, ''));
  const kisaUrl = (u) => String(u || '').replace(/^https:\/\/akinci22\.github\.io\/atmosfer-akademisi\//, '').replace(/^https?:\/\//, '').replace(/^\.\.\//, '');
  // terimin kitaptaki formülleri: kavram formül terimlerinde sembolü terimin kısaltmasıyla eşleşenler (en çok 3)
  function kitapFormulleri(K, t) {
    const k0 = semNorm(t.kisa); if (!k0) return [];
    const L = [];
    for (const k of K.kavramlar || []) { const P = (k.parcalar || {}).formul; if (!P || P.tex == null) continue; const x = (P.terimler || []).find((y) => semNorm(y.sembol) === k0); if (x) L.push({ k, P, x }); }
    return L.slice(0, 3);
  }
  const terimAdHTML = (K, id) => { const t = terimBul(K, id); if (t) return ckBag(`_terim/${t.id}`, kac(t.tr), 'tk-ad'); const k = kavramBul(K, id); return k ? ckBag(`${k.id}/tanim`, `${kac(k.sembol)} · ${kac(k.ad)}`, 'tk-ad') : kac(id); };
  function terimGorselHTML(K, g) {
    const bas = kac(g.baslik || GORSEL_AD[g.tur] || '');
    if (g.tur === 'sekil') return `<figure class="tk-g"><a class="tk-g-res" href="${kac(g.ref)}" target="_blank" rel="noopener"><img src="${kac(g.ref)}" alt="${bas}" loading="lazy" decoding="async"></a><figcaption><span class="tk-g-tur">${GORSEL_AD.sekil}</span>${bas}</figcaption></figure>`;
    if (g.tur === 'diyagram') {
      const id = String(g.ref).replace(/\/diyagram$/, ''), k = kavramBul(K, id), P = k && (k.parcalar || {}).diyagram;
      return P ? `<figure class="tk-g tk-g-dy" data-tk-dy="${kac(id)}"><div class="tk-g-kap"></div><figcaption><span class="tk-g-tur">${GORSEL_AD.diyagram}</span>${ckBag(`${id}/diyagram`, `${bas} ›`, 'tk-g-bag')}</figcaption></figure>` : '';
    }
    return `<a class="tk-g tk-g-dis" href="${kac(g.ref)}" target="_blank" rel="noopener"><span class="tk-g-tur">${GORSEL_AD[g.tur] || 'Bağ'}</span><b>${bas}</b><span class="tk-g-url">${kac(kisaUrl(g.ref))} ↗</span></a>`;
  }
  // kavram diyagramı küçük resmi: görününce çizilir (IntersectionObserver), çizim kitabın kendi Sekil işlevi
  let tkGozcu = null;
  function terimDiyagramKur(kok, K) {
    const L = $$('.tk-g-dy', kok); if (!L.length) return;
    const ciz = (f) => { if (f.dataset.cizildi) return; f.dataset.cizildi = '1'; const k = kavramBul(K, f.dataset.tkDy), P = k && k.parcalar.diyagram, kap = $('.tk-g-kap', f); try { if (P && window.Sekil && window.Sekil[P.sekil]) window.Sekil[P.sekil](kap, P.ayar || {}); } catch (e) { kap.textContent = ''; } };
    if (tkGozcu) tkGozcu.disconnect();
    if (typeof IntersectionObserver === 'undefined') { L.forEach(ciz); return; }
    tkGozcu = new IntersectionObserver((G) => G.forEach((x) => { if (x.isIntersecting) { ciz(x.target); tkGozcu.unobserve(x.target); } }), { root: ckIc, rootMargin: '200px 0px' });
    L.forEach((f) => tkGozcu.observe(f));
  }
  const soruBagHTML = (K, s) => { const m = /^(S\d+)(?:\/([ao])(\d+))?$/.exec(String(s)); if (!m || !K.sorular[m[1]]) return ''; const q = K.sorular[m[1]]; return m[2] ? `<a class="soru-bag" href="#${K.id}/${kac(s)}" data-soru="${kac(s)}">${m[1]} · ${m[3]}. adım <span class="yok">${kac(kisalt(q.baslik, 40))}</span></a>` : soruCip(K, m[1], true); };
  function terimKartHTML(K, t, kisa) {
    const tv = TV[K.id], F = (t.formul || []).filter((f) => f && f.tex), G = (t.gorsel || []).filter((g) => g && g.ref), b = t.bag || {};
    const kf = kitapFormulleri(K, t), sz = szBul(K, t.en);
    let h = `<div class="tk-ust">${t.kisa ? `<span class="tk-kisa">${semHTML(t.kisa)}</span>` : ''}${t.tur ? `<span class="tk-tur">${kac(TERIM_TUR_AD[t.tur] || t.tur)}</span>` : ''}${(t.es || []).length ? `<span class="tk-es"><span class="yok">Öbür adları:</span> ${t.es.slice(0, 5).map(kac).join(' · ')}</span>` : ''}</div>`;
    h += `<section class="tk-b tk-tanim"><h3>Tanım</h3>${(t.tanim || []).length ? `<ul>${t.tanim.map((x) => `<li>${kac(x)}</li>`).join('')}</ul>` : ''}${t.tanim_en ? `<p class="tk-en" lang="en">${kac(t.tanim_en)}</p>` : ''}</section>`;
    if (kisa) return h + `<p class="ar-dug">${ckBag(`_terim/${t.id}`, 'Terim kartını aç', 'kucuk')}</p>`;
    if (F.length || kf.length) {
      h += `<section class="tk-b tk-formul"><h3>Formüllerdeki yeri</h3>${F.map((f) => `<figure class="tk-f"><div class="tk-f-svg">${tv && f.s != null ? tv.svg[f.s] || '' : `<code>${kac(f.tex)}</code>`}</div>${f.rol ? `<figcaption><b>Bu formülde ne iş görür?</b> ${kac(f.rol)}</figcaption>` : ''}</figure>`).join('')}`;
      if (kf.length) h += `<p class="tk-alt">Kitaptaki formüllerde:</p>${kf.map(({ k, P, x }) => `<figure class="tk-f tk-f-kitap"><div class="tk-f-svg" data-tex="${P.tex}"></div><figcaption><b>${kac(x.sembol)}</b> — ${kac(x.ad)}${x.birim ? ` <span class="yok">(${kac(x.birim)})</span>` : ''} · ${ckBag(`${k.id}/formul`, `${kac(k.ad)} ›`, 'tk-ad')}</figcaption></figure>`).join('')}`;
      h += '</section>';
    }
    if (G.length) h += `<section class="tk-b tk-gorsel"><h3>Görseller</h3><div class="tk-g-liste">${G.slice(0, 4).map((g) => terimGorselHTML(K, g)).join('')}</div></section>`;
    if (t.ornek && t.ornek.metin) h += `<section class="tk-b tk-ornek"><h3>Gerçek meteorolojik örnek</h3><div class="tk-ornek-kutu">${t.ornek.baslik ? `<b>${kac(t.ornek.baslik)}</b>` : ''}<p>${kac(t.ornek.metin)}</p></div></section>`;
    if ((t.fark || []).length) h += `<section class="tk-b tk-fark"><h3>Benzer kavramlardan farkı</h3><div class="tk-fark-kap"><table class="tk-fark-t"><thead><tr><th scope="col">Bununla</th><th scope="col">Farkı</th></tr></thead><tbody>${t.fark.map((f) => `<tr><th scope="row">${terimAdHTML(K, f.ile)}</th><td>${kac(f.fark)}</td></tr>`).join('')}</tbody></table></div></section>`;
    const kv = kvSira(K, b.kavram), sq = (b.soru || []).map((s) => soruBagHTML(K, s)).filter(Boolean), hs = (b.hesap || []).map((id) => hesapBul(K, id)).filter(Boolean);
    if (kv.length || sq.length || hs.length || sz) {
      h += `<section class="tk-b tk-bag"><h3>Bağlar</h3>`;
      if (kv.length) h += `<div class="tk-bag-sat"><span class="yok">Kavram</span>${kv.map((k) => ckBag(`${k.id}/tanim`, `${kac(k.sembol)} · ${kac(k.ad)}`, 'soru-bag')).join('')}</div>`;
      if (sq.length) h += `<div class="tk-bag-sat"><span class="yok">Soru · adım</span>${sq.join('')}</div>`;
      if (hs.length) h += `<div class="tk-bag-sat"><span class="yok">Hesapla</span>${hs.map((x) => ckBag(`_hesap/${x.id}`, kac(iki(x.ad).tr), 'soru-bag')).join('')}</div>`;
      if (sz) h += `<div class="tk-bag-sat"><span class="yok">Sözlük</span>${ckBag(`_sozluk/${sz.en}`, `<span lang="en">${kac(sz.en)}</span> · okunuş, örnek cümle`, 'soru-bag')}</div>`;
      h += '</section>';
    }
    h += `<p class="yok tk-kaynak">Kaynak: ${kac(t.kaynak || 'kitap')}${t.emin === false ? ' · <span class="tk-taslak">doğrulaması sürüyor</span>' : ''}</p>`;
    return h;
  }
  const kavramTerimHTML = (K, k) => { const L = kavramTerim(K, k.id); return L.length ? `<section class="tk-ilgili"><h3>Terim kartları</h3><div class="ilgili">${L.map((t) => ckBag(`_terim/${t.id}`, `${kac(t.tr)} <span class="yok" lang="en">${kac(t.en)}</span>`, 'soru-bag')).join('')}</div></section>` : ''; };
  const szTerimHTML = (K, s) => { const t = s && terimEn(K, s.en); return t ? `<p class="sz-dug tk-sz-bag"><span class="yok">Terim kartı:</span> ${ckBag(`_terim/${t.id}`, `${kac(t.tr)} · formül, görsel, gerçek örnek ›`, 'soru-bag')}</p>` : ''; };
  // terim verisi çekmece açıkken gelirse: kavramda «Terim kartları», sözlük kartında terim kartı bağı (yeniden çizmeden eklenir)
  function terimSusle(K) {
    if (!ckDurum || ckDurum.K !== K || $('.tk-ilgili, .tk-sz-bag', ckIc)) return;
    const [bas, p] = String(ckDurum.kPart || '').split('/');
    if (bas === '_sozluk' && p && !p.includes('~')) { const kart = $('.sz-kart', ckIc); if (kart) kart.insertAdjacentHTML('beforeend', szTerimHTML(K, szBul(K, p))); }
    else if (bas && !bas.startsWith('_')) { const k = kavramBul(K, bas); if (k) ckIc.insertAdjacentHTML('beforeend', kavramTerimHTML(K, k)); }
  }
  function terimCk(K, ne, ayni) {
    $('#ck-sekme').innerHTML = ustSekme(K, ne ? '' : 'terim');
    const tv = TV[K.id];
    if (!tv) {
      kirintiYaz(K, [['Terimler', null]]);
      $('#ck-baslik').innerHTML = `Terimler<small>${terimVar(K) ? 'yükleniyor…' : 'bu kitapta terim kartı yok'}</small>`; $('#ck-sira').innerHTML = '';
      ckIc.innerHTML = `<p class="ck-not">${terimVar(K) ? 'Terim kartları yükleniyor…' : 'Bu kitabın terim kartları hazırlanıyor. Sözlük ve kavram atlası açık.'}</p>`;
      if (terimVar(K)) terimYukle(K).then(() => { if (ckDurum && ckDurum.K === K && /^_terim(\/|$)/.test(ckDurum.kPart)) ckYenile(); });
      return;
    }
    const L = terimSira(K);
    if (!ne) {
      kirintiYaz(K, [['Terimler', null]]);
      $('#ck-baslik').innerHTML = `Terimler · ${L.length}<small>dokun: tanım, formüllerdeki yeri, görseller, gerçek örnek, benzerlerinden farkı</small>`; $('#ck-sira').innerHTML = '';
      if (ayni) return;
      const harf = (t) => String(t.tr || '?').charAt(0).toLocaleUpperCase('tr');
      const gr = []; L.forEach((t) => { const hf = harf(t); if (!gr.length || gr[gr.length - 1][0] !== hf) gr.push([hf, []]); gr[gr.length - 1][1].push(t); });
      ckIc.innerHTML = `<p class="ck-not">Türkçe ada göre sıralı. Üstteki kutuya yazarak da bulursun (TR ya da EN).</p>${gr.map(([hf, T]) => `<section class="tk-harf"><h3>${kac(hf)}</h3><ul class="tk-liste">${T.map((t) => `<li>${ckBag(`_terim/${t.id}`, `<span class="tk-l-tr">${kac(t.tr)}</span>${t.kisa ? `<span class="tk-l-kisa">${semHTML(t.kisa)}</span>` : ''}<span class="tk-l-en" lang="en">${kac(t.en)}</span>`, 'tk-sat')}</li>`).join('')}</ul></section>`).join('')}`;
      return;
    }
    const t = terimBul(K, ne);
    if (!t) { kirintiYaz(K, [['Terimler', '_terim'], [kac(ne), null]]); $('#ck-baslik').innerHTML = `${kac(ne)}<small>bu kitapta böyle bir terim yok</small>`; $('#ck-sira').innerHTML = ''; ckIc.innerHTML = `<p class="yok">Terim bulunamadı. ${ckBag('_terim', 'Bütün terimler →', 'soru-bag')}</p>`; return; }
    kirintiYaz(K, [['Terimler', '_terim'], [kac(t.tr), null]]);
    $('#ck-baslik').innerHTML = `${kac(t.tr)}<small lang="en">${kac(t.en)}</small><span class="ck-dar-sekme"> · Terim</span>`;
    const i = L.indexOf(t), o = L[i - 1], s = L[i + 1];
    $('#ck-sira').innerHTML = siraHTML(o && [`_terim/${o.id}`, kac(o.tr)], `terim ${i + 1} / ${L.length}`, s && [`_terim/${s.id}`, kac(s.tr)]);
    if (ayni) return;
    ckIc.innerHTML = `<article class="tk-kart">${terimKartHTML(K, t)}</article>`;
    texDoldur(ckIc, K);
    terimDiyagramKur(ckIc, K);
    if (!tv.tam) terimTam(K).then(() => { if (ckDurum && ckDurum.K === K && ckDurum.kPart === `_terim/${ne}`) ckYenile(); });
  }

  /* ---------- ETK3 MERCEK-UI (27 Kas): her parçada 4 mercek, yalnız simge ----------
     Çekmecede açılan görünümün başlık satırında 4 simge (role=radiogroup; yazı yok, aria-label + title; telefonda basılı tut → küçük
     ad ipucu): ① Sınav (kronometre) ② Akademik (kep, varsayılan) ③ Çok basit (ampul) ④ Gerçek olay (bulut + büyüteç). Seçim dk-mercek
     (localStorage) → parçadan parçaya korunur. Veri: mercek/<kitap>.json → tools/derle.mjs → src/veri/<kitap>.mercek.js (tembel; ana
     veride K.mercek = {n, v, m: {anahtar: bit}} → simgeler dosya gelmeden doğru çizilir). Birim: kavram:<id> · konu:<öğe> · formul:<öğe>
     · soru:<S> · terim:<id> (hesap / karşılaştır görünümünde bağlı ilk kavram). Veri yoksa: Sınav ← kesin adımlar + «Sınavda yaz» +
     ezber formülü + tuzak (+ pusula açıksa «Asıl bil»); Akademik ← var olan tam içerik; Çok basit / Gerçek olay simgesi görünmez.
     Ana akışta konu başlıklarında, kavram kutularında, soru başlığında ve Kesin bil listesinde de aynı simgeler: dokun → çekmece o
     birimi o mercekle açar (_konu/<öğe>, <kavram>/tanim, _soru/<S>). Sınama: tools/dkm_test.cjs --o m. */
  const MK = [
    ['sinav', 'Sınav için', '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.6M9.6 2.6h4.8M12 2.6v3.4M18.4 6.6l1.6-1.6"/>'],
    ['akademik', 'Teknik-akademik', '<path d="M2 9.6 12 5l10 4.6-10 4.6z"/><path d="M6.2 11.6v4.1c0 1.5 2.6 2.8 5.8 2.8s5.8-1.3 5.8-2.8v-4.1"/><path d="M22 9.6v4.8"/>'],
    ['basit', 'Çok basit, kolay anlaşılır', '<path d="M9.2 18.2h5.6M10.2 21h3.6"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.1v.3h5v-.3c0-.8.4-1.6 1.1-2.1A6 6 0 0 0 12 3z"/>'],
    ['olay', 'Gerçek meteorolojik olay', '<path d="M6.8 16.6a4.1 4.1 0 0 1-.5-8.2 5.6 5.6 0 0 1 10.8 1.1 3.6 3.6 0 0 1 2.4 5.6"/><circle cx="13.6" cy="15.4" r="3.1"/><path d="m15.9 17.7 3.1 3.1"/>'],
  ];
  const MK_AD = Object.fromEntries(MK.map(([k, ad]) => [k, ad])), MK_D = Object.fromEntries(MK.map(([k, , d]) => [k, d]));
  const MK_BIT = { sinav: 1, akademik: 2, basit: 4, olay: 8 };
  const IZ_AD = { uydu: 'Uydu', radar: 'Radar', sondaj: 'Sondaj', istasyon: 'İstasyon', harita: 'Harita', yagis: 'Yağış', akim: 'Akım', hasar: 'Hasar' };
  let mkSec = (() => { const v = oku('dk-mercek'); return MK_BIT[v] ? v : 'akademik'; })();
  const MV = {};
  const mkVar = (K) => !!(K && K.mercek && (K.mercek.n || K.mercek.birim));
  const mkSvg = (k, sinif = '') => `<svg class="mk-ik${sinif ? ' ' + sinif : ''}" viewBox="0 0 24 24" aria-hidden="true">${MK_D[k]}</svg>`;
  function mercekYukle(K) {
    if (!mkVar(K)) return Promise.resolve(null);
    if (MV[K.id]) return Promise.resolve(MV[K.id]);
    if (K.mercek.birim) { MV[K.id] = K.mercek; return Promise.resolve(MV[K.id]); } // sınama: ana veride tam katman
    const a = `m:${K.id}`;
    if (!bekleyen[a]) {
      bekleyen[a] = new Promise((ok) => {
        const s = document.createElement('script'); s.src = `veri/${K.id}.mercek.js?v=${encodeURIComponent(K.mercek.v || '')}`;
        s.onload = () => { const d = (window.DK_MERCEK || {})[K.id]; if (d) MV[K.id] = d; ok(MV[K.id] || null); };
        s.onerror = () => ok(null);
        document.head.append(s);
      });
    }
    return bekleyen[a];
  }
  const mkBit = (K, anah) => (K && K.mercek && K.mercek.m ? K.mercek.m[anah] || 0 : K && K.mercek && K.mercek.birim && K.mercek.birim[anah] ? MK.reduce((t, [k]) => t | (K.mercek.birim[anah][k] ? MK_BIT[k] : 0), 0) : 0);
  // birimde görünen mercekler: Sınav + Akademik her zaman (veri yoksa kitabın kendi içeriği); Çok basit / Gerçek olay yalnız veride
  const mkVarlar = (K, anah) => MK.map(([k]) => k).filter((k) => k === 'sinav' || k === 'akademik' || (mkBit(K, anah) & MK_BIT[k]));
  function mkGrupHTML(K, anah, bag = false) {
    const V = mkVarlar(K, anah), s = V.includes(mkSec) ? mkSec : 'akademik';
    return `<span class="mk-grup${bag ? ' mk-bag' : ''}" role="radiogroup" aria-label="Mercek: aynı konuyu başka gözle oku" data-mk-birim="${kac(anah)}">${MK.filter(([k]) => V.includes(k)).map(([k, ad]) => `<button type="button" class="mk-dug mk-${k}" role="radio" aria-checked="${k === s}" aria-label="${ad}" title="${ad}" data-mk="${k}" tabindex="${k === s ? 0 : -1}">${mkSvg(k)}</button>`).join('')}</span>`;
  }
  const ogeBul = (K, id) => { for (const b of K.bolumler || []) for (const o of b.ogeler || []) if (o.id === id && (o.tur === 'konu' || o.tur === 'formul')) return { o, b }; return null; };
  // çekmece görünümünün birimi (anahtar) ve «ana görünüm» mü (öbür mercekte kitabın içeriği gizlenir; sekme / araç görünümünde gizlenmez)
  function mkBirimBul(K, kPart) {
    const [bas, ...kalan] = String(kPart || '').split('/');
    if (bas === '_konu') { const x = ogeBul(K, kalan[0]); return x ? { anah: `${x.o.tur}:${x.o.id}`, ana: true } : null; }
    if (bas === '_soru') return K.sorular[kalan[0]] ? { anah: `soru:${kalan[0]}`, ana: true } : null;
    if (bas === '_terim') return kalan[0] ? { anah: `terim:${kalan[0]}`, ana: true } : null;
    if (bas === '_hesap') { const h = hesapBul(K, kalan[0]), kv = h && (h.kavram || [])[0]; return kv && kavramBul(K, kv) ? { anah: `kavram:${kv}`, ana: false } : null; }
    if (bas === '_kars') { const r = kalan.join('/'); let kv = null; if (r.startsWith('=')) { const x = czKars(K).find((y) => y.id === r.slice(1)); kv = x && (x.kavram || [])[0]; } else kv = r.split('~')[0]; return kv && kavramBul(K, kv) ? { anah: `kavram:${kv}`, ana: false } : null; }
    if (!bas || bas.startsWith('_')) return null;
    return kavramBul(K, bas) ? { anah: `kavram:${bas}`, ana: !kalan[0] || kalan[0] === 'tanim' } : null;
  }
  // dokunulan simgenin birimi için çekmece adresi
  const mkRota = (K, anah) => { const i = anah.indexOf(':'), t = anah.slice(0, i), id = anah.slice(i + 1); return t === 'kavram' ? `${id}/tanim` : t === 'konu' || t === 'formul' ? `_konu/${id}` : t === 'soru' ? `_soru/${id}` : t === 'terim' ? `_terim/${id}` : null; };
  // mercek metni: düz metin ya da derlenmiş parçalar ["metin", {s|k, b?}] (s: mercek dosyasının SVG'si, k: kitabın SVG'si)
  function mkMetin(K, M, x) {
    if (x == null) return '';
    if (!Array.isArray(x)) return kac(x);
    return x.map((p) => {
      if (typeof p === 'string') return kac(p);
      let s = '';
      if (p && p.s != null) s = (M.svg || [])[p.s] || '';
      else if (p && p.k != null) { const v = K.svg[p.k]; s = (typeof v === 'number' ? K.svg[v] : v) || ''; }
      return p && p.b ? `<span class="mk-tb">${s}</span>` : s;
    }).join('');
  }
  // tek metin (düz ya da TeX parçalı) ya da metin listesi → liste (parçalı metin: en az bir {s|k} nesnesi taşıyan dizi)
  const mkCoklu = (x) => (Array.isArray(x) ? (x.some((p) => p && typeof p === 'object' && !Array.isArray(p)) ? [x] : x) : x ? [x] : []);
  const mkListe = (K, M, L, sinif = '') => ((L || []).length ? `<ul class="mk-liste${sinif ? ' ' + sinif : ''}">${L.map((x) => `<li>${mkMetin(K, M, x)}</li>`).join('')}</ul>` : '');
  const mkFormul = (K, M, L) => (L || []).map((f) => { let s = ''; if (f && f.s != null) s = (M.svg || [])[f.s] || ''; else if (f && f.k != null) { const v = K.svg[f.k]; s = (typeof v === 'number' ? K.svg[v] : v) || ''; } return s ? `<div class="mk-f">${s}</div>` : ''; }).join('');
  function mkVeriHTML(K, M, x, lens) {
    if (lens === 'sinav') {
      let h = mkListe(K, M, x.madde) + mkFormul(K, M, x.tex);
      if (x.yaz || x.yaz_en) h += `<div class="isr-blok isr-k mk-yaz">${isr('yaz')}${x.yaz ? `<p>${mkMetin(K, M, x.yaz)}</p>` : ''}${x.yaz_en ? `<p lang="en">${mkMetin(K, M, x.yaz_en)}</p>` : ''}</div>`;
      const T = mkCoklu(x.tuzak);
      if (T.length) h += `<div class="mk-tuzak">${isr('tuzak')}${T.map((t) => `<p>${mkMetin(K, M, t)}</p>`).join('')}</div>`;
      if (x.kalip) h += `<p class="mk-kalip">${isr('kisa', { kucuk: true })} ${mkMetin(K, M, x.kalip)}</p>`;
      return h;
    }
    if (lens === 'akademik') return mkListe(K, M, x.madde) + mkFormul(K, M, x.tex) + (x.kaynak ? `<p class="mk-kaynak">${mkMetin(K, M, x.kaynak)}</p>` : '');
    if (lens === 'basit') return mkListe(K, M, x.madde) + (x.benzetme ? `<p class="mk-benzetme">${mkSvg('basit', 'mk-ik-k')}<span>${mkMetin(K, M, x.benzetme)}</span></p>` : '');
    const o = (M.olay || {})[x.olay];
    if (!o) return '';
    let h = `<div class="mk-olay-kart"><b>${kac(o.ad)}</b>${o.ad_en ? ` <span class="mk-en" lang="en">${kac(o.ad_en)}</span>` : ''}<span class="mk-olay-kunye">${[o.tarih, o.yer].filter(Boolean).map(kac).join(' · ')}</span></div>`;
    if ((x.iz || []).length) h += `<h4 class="mk-alt">İzler</h4><ul class="mk-liste mk-iz">${x.iz.map((z) => (z && typeof z === 'object' && !Array.isArray(z) ? `<li><span class="mk-iz-tur">${kac(IZ_AD[z.tur] || z.tur || '')}</span>${mkMetin(K, M, z.metin)}</li>` : `<li>${mkMetin(K, M, z)}</li>`)).join('')}</ul>`;
    if ((x.madde || []).length) h += mkListe(K, M, x.madde);
    if ((x.elestiri || []).length) h += `<h4 class="mk-alt">Eleştiri</h4>${mkListe(K, M, x.elestiri, 'mk-elestiri')}`;
    if (x.ders) h += `<p class="mk-ders"><b>Ders:</b> ${mkMetin(K, M, x.ders)}${x.ders_en ? ` <span class="mk-en" lang="en">${mkMetin(K, M, x.ders_en)}</span>` : ''}</p>`;
    const kay = (o.kaynak || []).filter((y) => y && y.ad);
    if (kay.length) h += `<p class="mk-kaynak">Kaynak: ${kay.map((y) => (y.url ? `<a href="${kac(y.url)}" target="_blank" rel="noopener">${kac(y.ad)} ↗</a>` : kac(y.ad))).join(' · ')}</p>`;
    return h;
  }
  // veri yoksa Sınav merceği kitabın kendi içeriğinden: pusula «Asıl bil» (kilit açıksa) + ezber formülü + «Sınavda yaz» / «Sık hata» satırları + kesin adımlar
  const mkSatirlar = (html) => { const d = document.createElement('div'); d.innerHTML = html || ''; return $$('li, p', d).map((x) => x.textContent.replace(/\s+/g, ' ').trim()).filter((t) => /^(Sınavda yaz|Sık hata|Dikkat|Tuzak)\b/i.test(t)).slice(0, 4); };
  function mkKesinAdimlar(K, filtre, sinir = 5) {
    const L = [];
    for (const q of soruSirasi(K)) {
      const A = (czSoru(K, q.id) || {}).adim || [];
      A.forEach((a, i) => { if (a && a.kesin === true && filtre(q, a) && L.length < sinir) L.push(`<li><a class="soru-bag ks-sat" href="#${K.id}/${q.id}/o${i + 1}" data-ana="${q.id}/o${i + 1}"><b>${q.id} · ${i + 1}</b> ${kac(kisalt(a.ne || '', 70))}</a>${a.sonuc ? ` <span class="ks-sonuc">${isr('sonuc', { kucuk: true })}<b>${kac(kisalt(a.sonuc, 90))}</b></span>` : ''}</li>`); });
      if (L.length >= sinir) break;
    }
    return L.length ? `<h4 class="mk-alt">${isr('kesin', { kucuk: true })} Kesin adımlar</h4><ol class="mk-liste mk-ks">${L.join('')}</ol>` : '';
  }
  function mkSinavYedek(K, anah) {
    const i = anah.indexOf(':'), t = anah.slice(0, i), id = anah.slice(i + 1);
    let h = '';
    const satir = (L) => (L.length ? L.map((s) => (/^Sık hata|^Dikkat|^Tuzak/i.test(s) ? `<div class="mk-tuzak">${isr('tuzak')}<p>${kac(s.replace(/^(Sık hata|Dikkat|Tuzak)\s*[:→-]?\s*/i, ''))}</p></div>` : `<div class="isr-blok isr-k mk-yaz">${isr('yaz')}<p>${kac(s.replace(/^Sınavda yaz\s*[:→-]?\s*/i, ''))}</p></div>`)).join('') : '');
    if (t === 'kavram') {
      const k = kavramBul(K, id); if (!k) return '';
      const X = snKv(K, k.id), P = (k.parcalar || {}).formul;
      if (X && (X.bil || []).length) h += `<h4 class="mk-alt">${isr('kesin', { kucuk: true })} Asıl bil</h4>${snUl(X.bil)}`;
      if (P && P.tex != null) h += `<div class="isr-ezf">${isr('ezber')}<div class="isr-f"><div class="tex-blok" data-tex="${P.tex}"></div></div></div>${(P.terimler || []).length ? `<ul class="mk-liste mk-terim">${P.terimler.slice(0, 8).map((x) => `<li><b>${kac(x.sembol)}</b> — ${kac(x.ad)}${x.birim ? ` <span class="yok">(${kac(x.birim)})</span>` : ''}</li>`).join('')}</ul>` : ''}`;
      h += satir(mkSatirlar(((k.parcalar || {}).tanim || {}).html));
      h += mkKesinAdimlar(K, (q, a) => (a.kavram || []).includes(k.id) || ((q.kavram || []).includes(k.id) && /formül/.test(a.kesin_neden || '')));
    } else if (t === 'konu' || t === 'formul') {
      const x = ogeBul(K, id); if (!x) return '';
      const m = /data-tex="(\d+)"/.exec(x.o.html || '');
      if (t === 'formul' && m) h += `<div class="isr-ezf">${isr('ezber')}<div class="isr-f"><div class="tex-blok" data-tex="${m[1]}"></div></div></div>`;
      h += satir(mkSatirlar(`${x.o.html || ''}${x.o.oz || ''}`));
      const sq = new Set((x.b.ogeler || []).filter((o) => o.tur === 'soru').map((o) => o.id));
      h += mkKesinAdimlar(K, (q) => sq.has(q.id), 4);
    } else if (t === 'soru') {
      const q = K.sorular[id]; if (!q) return '';
      const S = SV(K) && (SV(K).soru || {})[q.id];
      if (S && (S.neden || S.ipucu)) h += `<p class="mk-kalip">${S.neden ? kac(S.neden) : ''}${S.ipucu ? ` · <b>İlk adım:</b> ${kac(S.ipucu)}` : ''}</p>`;
      h += mkKesinAdimlar(K, (x) => x.id === q.id, 8);
      h += satir(mkSatirlar(`${q.oz || ''}${(q.adimlar || []).map((a) => a.html).join('')}`));
    } else if (t === 'terim') {
      const tr = terimBul(K, id); if (!tr) return '';
      if ((tr.tanim || []).length) h += `<div class="isr-blok isr-k mk-yaz">${isr('yaz')}<p>${kac(tr.tanim[0])}</p>${tr.tanim_en ? `<p lang="en">${kac(tr.tanim_en)}</p>` : ''}</div>`;
      const tv = TV[K.id], F = (tr.formul || []).filter((f) => f && f.tex && f.s != null);
      if (F.length && tv) h += `<div class="isr-ezf">${isr('ezber')}<div class="isr-f">${F.map((f) => tv.svg[f.s] || '').join('')}</div></div>`;
      if ((tr.fark || []).length) h += `<div class="mk-tuzak">${isr('tuzak')}${tr.fark.slice(0, 3).map((f) => `<p><b>${terimAdHTML(K, f.ile)}</b>: ${kac(f.fark)}</p>`).join('')}</div>`;
      { const kb = (((tr.bag || {}).kavram) || []).map((x) => kavramBul(K, x)).find((x) => x && snKv(K, x.id)), X = kb && snKv(K, kb.id); if (X) { h += `<h4 class="mk-alt">Üst kavram: ${ckBag(`_sinav/kavram/${kb.id}/${tr.id}`, `${kac(kb.sembol)} · ${kac(kb.ad)}`, 'tk-ad')}</h4>`; if ((X.bil || []).length) h += snUl(X.bil.slice(0, 4)); if ((X.tuzak || []).length) h += `<div class="mk-tuzak">${isr('tuzak')}${X.tuzak.slice(0, 2).map((x) => `<p>${kac(x)}</p>`).join('')}</div>`; } } // ETK4: terimin üst kavramının sınav notu
    }
    return h;
  }
  function mkBlokHTML(K, anah, lens) {
    const M = MV[K.id], x = M && M.birim && M.birim[anah] && M.birim[anah][lens];
    const ic = x ? mkVeriHTML(K, M, x, lens) : lens === 'sinav' ? mkSinavYedek(K, anah) : '';
    return ic ? `<section class="mk-blok mk-b-${lens}" aria-label="${kac(MK_AD[lens])}"><div class="mk-bas" role="img" aria-label="${kac(MK_AD[lens])}">${mkSvg(lens)}</div>${ic}</section>` : '';
  }
  // başlık satırındaki grup + merceğin içeriği (Akademik + veri yoksa kitabın içeriği aynen)
  function mkUygula(K) {
    const kap = $('#ck-mercek'); if (!kap) return;
    $$('.mk-blok', ckIc).forEach((x) => x.remove()); ckIc.classList.remove('mk-odak');
    const B = ckDurum && ckDurum.K === K ? mkBirimBul(K, ckDurum.kPart) : null;
    if (!B) { kap.innerHTML = ''; kap.hidden = true; return; }
    kap.hidden = false; kap.innerHTML = mkGrupHTML(K, B.anah);
    const V = mkVarlar(K, B.anah), lens = V.includes(mkSec) ? mkSec : 'akademik', veri = !!(mkBit(K, B.anah) & MK_BIT[lens]);
    if (lens === 'akademik' && !veri) return;
    const ciz = () => {
      if (!ckDurum || ckDurum.K !== K || (mkBirimBul(K, ckDurum.kPart) || {}).anah !== B.anah) return;
      const h = mkBlokHTML(K, B.anah, lens); if (!h) return;
      $$('.mk-blok', ckIc).forEach((x) => x.remove());
      ckIc.insertAdjacentHTML('afterbegin', h);
      const bl = $('.mk-blok', ckIc); texDoldur(bl, K); glifDuzelt(bl);
      ckIc.classList.toggle('mk-odak', lens !== 'akademik' && B.ana);
    };
    if (veri) mercekYukle(K).then(ciz); else ciz();
  }
  function mkSecYap(k, grup) {
    mkSec = k; sakla('dk-mercek', k);
    if (grup && grup.closest('#ck-mercek') && simdiK) {
      const st = ckIc.scrollTop; mkUygula(simdiK); if (!ckIc.classList.contains('mk-odak') && !$('.mk-blok', ckIc)) ckIc.scrollTop = st; else ckIc.scrollTop = 0;
      const b = $(`#ck-mercek .mk-dug[data-mk="${k}"]`); if (b) b.focus({ preventScroll: true });
      return;
    }
    const anah = grup && grup.dataset.mkBirim, rota = anah && simdiK && mkRota(simdiK, anah);
    if (rota) location.hash = `#${anaOnEk(simdiK)}/k/${rota}`;
  }
  // basılı tut (dokunmatik) → küçük ad ipucu; dokunuş seçmez
  const mkIp = document.createElement('div'); mkIp.className = 'mk-ip'; mkIp.hidden = true; mkIp.setAttribute('role', 'tooltip'); document.body.append(mkIp);
  let mkIpZam = 0, mkUzun = false;
  document.addEventListener('pointerdown', (e) => {
    const b = e.target && e.target.closest && e.target.closest('.mk-dug'); clearTimeout(mkIpZam); mkUzun = false;
    if (!b || e.pointerType === 'mouse') return;
    mkIpZam = setTimeout(() => {
      mkUzun = true; mkIp.textContent = b.getAttribute('aria-label'); mkIp.hidden = false;
      const r = b.getBoundingClientRect(), w = mkIp.offsetWidth, h = mkIp.offsetHeight;
      mkIp.style.left = `${Math.max(6, Math.min(innerWidth - w - 6, r.left + r.width / 2 - w / 2))}px`; mkIp.style.top = `${r.top - h - 8 > 6 ? r.top - h - 8 : r.bottom + 8}px`;
      try { if (navigator.vibrate) navigator.vibrate(8); } catch (x) { /* yok */ }
    }, 450);
  }, true);
  const mkIpBit = () => { clearTimeout(mkIpZam); if (!mkIp.hidden) setTimeout(() => { mkIp.hidden = true; }, 1100); };
  document.addEventListener('pointerup', mkIpBit, true); document.addEventListener('pointercancel', mkIpBit, true);
  document.addEventListener('contextmenu', (e) => { if (e.target && e.target.closest && e.target.closest('.mk-dug')) e.preventDefault(); }, true);
  document.addEventListener('click', (e) => {
    const b = e.target && e.target.closest && e.target.closest('.mk-dug'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (mkUzun) { mkUzun = false; return; }
    mkSecYap(b.dataset.mk, b.closest('.mk-grup'));
  }, true);
  // radiogroup klavyesi: ← → seç, Home / End
  document.addEventListener('keydown', (e) => {
    const b = e.target && e.target.closest && e.target.closest('.mk-dug'); if (!b) return;
    const L = $$('.mk-dug', b.closest('.mk-grup')), i = L.indexOf(b);
    const j = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? (i + 1) % L.length : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? (i - 1 + L.length) % L.length : e.key === 'Home' ? 0 : e.key === 'End' ? L.length - 1 : -1;
    if (j < 0) return;
    e.preventDefault(); e.stopPropagation();
    if (b.closest('#ck-mercek')) mkSecYap(L[j].dataset.mk, b.closest('.mk-grup')); else { L.forEach((x, n) => { x.tabIndex = n === j ? 0 : -1; }); L[j].focus(); }
  }, true);
  window.__dkMercek = { sec: () => mkSec, yukle: (kid) => mercekYukle(window.DK[kid]), birim: (kp) => (simdiK ? mkBirimBul(simdiK, kp) : null) }; // sınama kancası
  // çekmece: tek konu / formül öğesi (ana akıştaki konu başlığının simgesinden) — _konu/<öğe>
  function konuCk(K, oid, ayni) {
    const x = ogeBul(K, oid); if (!x) return atlasCk(K, false);
    const { o, b } = x, L = (K.bolumler || []).flatMap((y) => (y.ogeler || []).filter((z) => z.tur === 'konu' || z.tur === 'formul')), i = L.indexOf(o), on = L[i - 1], so = L[i + 1];
    kirintiYaz(K, [[kac(bolumAd(K, b)), `_bol/${b.id}`], [kac(kisalt(o.baslik, 40)), `_konu/${o.id}`]]);
    $('#ck-baslik').innerHTML = `${kac(o.baslik)}<small>${o.tur === 'formul' ? 'formül' : 'konu'} · ${kac(bolumAd(K, b))}</small>`;
    $('#ck-sira').innerHTML = siraHTML(on && [`_konu/${on.id}`, kac(kisalt(on.baslik, 32))], `${i + 1} / ${L.length}`, so && [`_konu/${so.id}`, kac(kisalt(so.baslik, 32))]);
    $('#ck-sekme').innerHTML = ustSekme(K, '');
    if (ayni) return;
    ckIc.innerHTML = `<section class="konu-sayfa ck-konu">${o.html || ''}${o.oz ? ozHTML(o.oz) : ''}</section><p><a class="soru-bag" href="#${K.id}/bol/${b.id}" data-ana="bol/${b.id}">Bölümün konu sayfası (ana akışta) →</a></p>`;
    texDoldur(ckIc, K);
    $$('table', ckIc).forEach((t) => { if (!t.parentElement.classList.contains('tablo-kap')) { const k = document.createElement('div'); k.className = 'tablo-kap'; t.before(k); k.append(t); } });
  }
  // çekmece: soru · çözüm (soru başlığının ve Kesin bil listesinin simgesinden) — _soru/<S>
  function soruCk(K, sid, ayni) {
    const q = K.sorular[sid]; if (!q) return atlasCk(K, false);
    const L = soruSirasi(K), i = L.indexOf(q), on = L[i - 1], so = L[i + 1], b = K.bolumler.find((x) => x.id === q.bolum);
    kirintiYaz(K, [...(b ? [[kac(bolumAd(K, b)), `_bol/${b.id}`]] : []), [q.id, `_soru/${q.id}`]]);
    $('#ck-baslik').innerHTML = `${q.id} · ${kac(q.baslik)}<small>soru · çözüm · PDF s. ${q.pdf_soru ?? '—'}</small>`;
    $('#ck-sira').innerHTML = siraHTML(on && [`_soru/${on.id}`, on.id], `soru ${i + 1} / ${L.length}`, so && [`_soru/${so.id}`, so.id]);
    $('#ck-sekme').innerHTML = ustSekme(K, '');
    if (ayni) return;
    const A = (czSoru(K, q.id) || {}).adim || [];
    const adim = A.length ? A.map((a, j) => `<li${a.kesin ? ' class="isr-k"' : ''}><a class="soru-bag" href="#${K.id}/${q.id}/o${j + 1}" data-ana="${q.id}/o${j + 1}"><b>${j + 1}.</b> ${kac(a.ne || '')}</a>${a.islem ? `<div class="ck-coz-islem">${kac(a.islem)}</div>` : ''}${a.sonuc ? `<p class="oyn-sonuc">${isr('sonuc')}<b>${kac(a.sonuc)}</b></p>` : ''}</li>`).join('')
      : (q.adimlar || []).map((a) => `<li>${a.html || ''}</li>`).join('');
    ckIc.innerHTML = `<div class="soru-govde">${q.soru || ''}</div><p><a class="soru-bag" href="#${K.id}/${q.id}" data-soru="${q.id}">Soruyu ana akışta aç →</a></p>${adim ? `<h3>Çözüm</h3><ol class="ck-coz">${adim}</ol>` : ''}`;
    texDoldur(ckIc, K);
    $$('table', ckIc).forEach((t) => { if (!t.parentElement.classList.contains('tablo-kap')) { const k = document.createElement('div'); k.className = 'tablo-kap'; t.before(k); k.append(t); } });
  }

  /* --- aç / kapat / yönlendir --- */
  function cekmeceKapat() {
    if (window.__dkKenar && window.__dkKenar.gizli()) window.__dkKenar.getir(false, true); // ETK5-B: kenardaysa anında geri (sonraki açılışta görünür)
    if (animTutucu && animTutucu.dur) animTutucu.dur(); animTutucu = null;
    ipKapat(); araKapat();
    ck.hidden = true; perde.hidden = true; ck.setAttribute('aria-hidden', 'true'); ckDurum = null; document.body.classList.remove('ck-acik'); sepetEl.hidden = true; $$('.sn-yol', ckIc).forEach((x) => x.remove());
    document.documentElement.classList.remove('ck-acik');
    if (ckBoyOnce !== null) { ckBoy = ckBoyOnce; ckBoyOnce = null; boyUygula(); }
  }
  /* ---------- VIZE-316 (28 Kas): «Vize pusulası» — çekmece _pusula (liste) · _pusula/<akış> (kart) ----------
     Veri: K.pusula = pusula/<kitap>.json (HERKESE AÇIK: beş el hesabı akışı; olasılık yok). Kilit açıkken SN[K.id].v.pusula
     (sinav/<kitap>.json) en üste «Sınavda en çok çıkacak 5 şey» + «Çalışma yolu» ekler; akış listesinde olasılık noktaları.
     Formül = kavramın kendi formülü (K.svg); terim düğmesi formülde yakar (\hl eşi). Çalışma yolu işaretleri dk:puyol:<kitap>. */
  const puVar = (K) => !!(K && K.pusula && (K.pusula.akis || []).length);
  const puSV = (K) => { const s = K && SN[K.id]; return s && s.d === 'acik' && s.v && s.v.pusula ? s.v : null; };
  const puAkis = (K, id) => (K.pusula.akis || []).find((a) => a.id === id) || null;
  const puOlas = (V, a) => Math.max(0, ...(a.kavram || []).map((id) => snN(((V.kavram || {})[id] || {}).olasilik)));
  function puHedef(K, g) {
    const s = String(g || ''), i = s.indexOf(':'), t = s.slice(0, i), id = s.slice(i + 1);
    if (t === 'pusula') { const a = puAkis(K, id); return a ? { ck: `_pusula/${id}`, ad: a.ad } : null; }
    if (t === 'kavram') { const k = kavramBul(K, id); return k ? { ck: `${id}/tanim`, ad: k.ad } : null; }
    if (t === 'soru') { const q = K.sorular[id]; return q ? { soru: id, ad: `${id} · ${q.baslik}` } : null; }
    if (t === 'ck') return { ck: id, ad: id === '_kesin' ? 'Kesin bil listesi' : id === '_sinav' ? 'Sınav pusulası' : id };
    return null;
  }
  const puBag = (K, g, sinif = 'pu-hedef') => { const h = puHedef(K, g); if (!h) return ''; return h.ck ? ckBag(h.ck, `${kac(h.ad)} ›`, sinif) : `<a href="#${kac(K.id)}/${kac(h.soru)}" data-soru="${kac(h.soru)}" class="${sinif}">${kac(h.ad)} ›</a>`; };
  const puYol = (K) => { try { return new Set(JSON.parse(oku(`dk:puyol:${K.id}`) || '[]')); } catch (e) { return new Set(); } };
  const puUl = (L, sinif = 'pu-ul') => ((L || []).length ? `<ul class="${sinif}">${L.map((x) => `<li>${kac(x)}</li>`).join('')}</ul>` : '');
  function puUstHTML(K) {
    const P = K.pusula, V = puSV(K), s = SN[K.id] || { d: 'yok' };
    if (V) {
      const X = V.pusula, Y = X.yol || [], g = puYol(K), bit = [...g].filter((i) => i < Y.length).length;
      return `<section class="pu-blok pu-kilit" aria-label="Sınavda en çok çıkacak 5 şey"><h3>${PUSULA_SVG}<span>Sınavda en çok çıkacak 5 şey</span></h3><ol class="pu-bes">${(X.bes || []).map((b) => `<li><span class="pu-m">${kac(b.metin)}</span><span class="pu-git">${(b.git || []).map((x) => puBag(K, x)).join('')}</span></li>`).join('')}</ol>${X.not ? `<p class="pu-not">${kac(X.not)}</p>` : ''}</section>
        <section class="pu-blok pu-kilit pu-yolu" aria-label="Çalışma yolu"><h3><span>Çalışma yolu</span><span class="say pu-yol-say">${bit} / ${Y.length}</span></h3><ol class="pu-yol">${Y.map((y, i) => `<li><label class="pu-yk"><input type="checkbox" data-i="${i}"${g.has(i) ? ' checked' : ''}><span class="gizli">${i + 1}. adım bitti</span></label><span class="pu-m">${kac(y.metin)}</span>${puBag(K, y.git)}</li>`).join('')}</ol></section>`;
    }
    return `<section class="pu-blok pu-acik"><p class="pu-bas"><b>${kac(P.ad)}</b> · ${kac(P.alt)} <span class="yok" lang="en">${kac(P.en || '')}</span></p>${puUl(P.giris)}${s.d === 'kilitli' || s.d === 'bekle' ? `<p class="pu-kilitli">${KILIT_SVG}<span>Sınav pusulası parolayla açılınca bu sayfanın en üstünde «Sınavda en çok çıkacak 5 şey» ve sıralı çalışma yolu da görünür.</span> ${ckBag('_sinav', 'Parolayla aç ›', 'pu-hedef')}</p>` : ''}</section>`;
  }
  function puListeHTML(K) {
    const V = puSV(K);
    return `<section class="pu-blok"><h3><span>Beş el hesabı akışı</span><span class="say">${K.pusula.akis.length} akış</span></h3><ol class="pu-liste">${K.pusula.akis.map((a, i) => `<li>${ckBag(`_pusula/${a.id}`, `<span class="pu-no">${i + 1}</span><span class="pu-ad"><b>${kac(a.ad)}</b><span class="pu-alt">${kac(a.alt)}</span><span class="pu-ne">${kac(a.ne)}</span></span>${V ? snNokta(puOlas(V, a), true, 'pu-n') : ''}<span class="pu-ok" aria-hidden="true">›</span>`, 'pu-kart')}</li>`).join('')}</ol></section>`;
  }
  function puKartHTML(K, a) {
    const V = puSV(K), n = V ? puOlas(V, a) : 0, D = a.dene || {}, kid = encodeURIComponent(K.id);
    const F = (a.formul || []).map((f, j) => {
      const k = kavramBul(K, f.kavram), P = k && k.parcalar && k.parcalar.formul;
      if (!P || P.tex == null) return '';
      return `<div class="pu-f" data-j="${j}"><p class="pu-fad">${isr('kesin', { kucuk: true, neden: 'ana formül' })}<b>${kac(f.ad)}</b>${f.ezber ? isr('ezber') : ''}${ckBag(`${k.id}/formul`, 'formül sayfası ›', 'pu-hedef')}</p><div class="formul-kap" data-tex="${P.tex}"></div><div class="terim-list pu-tl" role="group" aria-label="Terimler: formülde yakmak için bas">${(P.terimler || []).map((t, i) => `<button type="button" aria-pressed="false" data-t="${i}">${kac(t.sembol)}</button>`).join('')}</div><p class="pu-tk" aria-live="polite"></p></div>`;
    }).join('');
    const HL = HS(K), hs = (D.hesap || []).map((h) => HL.find((x) => x.id === h)).filter(Boolean);
    const ornek = (a.ornek || []).map((o) => { const k = o.kavram && kavramBul(K, o.kavram); return `<p class="pu-ornek"><span class="pu-ky">${o.soru ? `<a href="#${kac(K.id)}/${kac(o.soru)}" data-soru="${kac(o.soru)}">Kitapta ${kac(o.soru)}</a>` : k ? ckBag(`${k.id}/tanim`, `Kitapta: ${kac(k.ad)}`) : 'Kitapta'}</span> ${kac(o.metin)}</p>`; }).join('');
    const h3 = (no, ic) => `<h3><span class="pu-h-no" aria-hidden="true">${no}</span>${ic}</h3>`;
    return `${n ? `<p class="pu-olas">${snNokta(n)}<span class="yok">sınav olasılığı · pusula açık</span></p>` : ''}<p class="pu-ne">${kac(a.ne)}</p>
      <section class="pu-blok">${h3(1, '<span>Verilenler</span>')}${puUl(a.verilen)}</section>
      <section class="pu-blok">${h3(2, '<span>Formül</span>')}${F}</section>
      <section class="pu-blok">${h3(3, '<span>Adımlar</span>')}<ol class="pu-adim">${(a.adim || []).map((x) => `<li>${kac(x)}</li>`).join('')}</ol>${ornek}${a.yaz ? `<p class="pu-yaz">${isr('yaz')}<span>${kac(a.yaz)}</span></p>` : ''}${a.kisa ? `<p class="pu-kisa">${isr('kisa')}<span>${kac(a.kisa)}</span></p>` : ''}</section>
      <section class="pu-blok">${h3(4, isr('denetle', { ad: 'Denetim: birim ve mantık' }))}${puUl(a.denetle)}</section>
      <section class="pu-blok">${h3(5, isr('tuzak', { ad: 'Tipik tuzak' }))}${puUl(a.tuzak)}</section>
      <section class="pu-blok pu-dene">${h3(6, '<span>Kendini dene</span>')}<ul class="pu-dl">${(D.soru || []).filter((s) => K.sorular[s]).map((s) => `<li><a class="pu-d" href="#${kac(K.id)}/${kac(s)}" data-soru="${kac(s)}"><b>Çözümlü soru · ${kac(s)}</b><span>${kac(K.sorular[s].baslik)}: önce kendin çöz, sonra adım adım bak</span></a></li>`).join('')}${hs.map((h) => `<li>${ckBag(`_hesap/${h.id}`, `<b>Hesap aracı</b><span>${kac(iki(h.ad).tr)}: sayıları değiştir, sonucu kitapla karşılaştır</span>`, 'pu-d')}</li>`).join('')}${(D.atolye || []).map((x) => `<li><a class="pu-d" href="../soru-cozum/${kid}/#${encodeURIComponent(x.id)}"><b>Sınav Atölyesi ↗</b><span>${kac(x.ad)}</span></a></li>`).join('')}${(D.atlas || [])[0] ? `<li><a class="pu-d" href="../soru-cozum/${kid}/#atlas/${encodeURIComponent(D.atlas[0])}"><b>Formül atlası ↗</b><span>terimler, birimler ve ne zaman hangi alternatif</span></a></li>` : ''}</ul>${(a.kavram || [])[0] ? `<p class="pu-mk"><span class="yok">Konuyu başka gözle oku:</span>${mkGrupHTML(K, `kavram:${a.kavram[0]}`, true)}</p>` : ''}</section>`;
  }
  function puKur(kok, K, a) {
    $$('.pu-f', kok).forEach((el) => {
      const f = a.formul[+el.dataset.j], k = kavramBul(K, f.kavram), T = (k.parcalar.formul.terimler || []), kap = $('.formul-kap', el), tk = $('.pu-tk', el);
      const yak = (L) => { $$('.on', kap).forEach((e) => e.classList.remove('on')); L.forEach((c) => $$(`.${CSS.escape(c)}`, kap).forEach((e) => e.classList.add('on'))); };
      const sec = (i) => {
        const t = T[i]; $$('.pu-tl button', el).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.t === i)));
        yak([t.id]); tk.innerHTML = `<b>${kac(t.sembol)}</b> · ${kac(t.ad)}${t.birim ? ` · ${kac(t.birim)}` : ''}${t.tipik ? ` <span class="yok">(${kac(t.tipik)})</span>` : ''}`;
      };
      $$('.pu-tl button', el).forEach((b) => b.addEventListener('click', () => sec(+b.dataset.t)));
      const i0 = T.findIndex((t) => (f.hl || []).includes(t.id));
      if (i0 >= 0) sec(i0); else yak(f.hl || []);
    });
  }
  function pusulaCk(K, ne, ayni) {
    const P = K.pusula, L = P.akis, a = ne ? puAkis(K, ne) : null;
    $('#ck-sekme').innerHTML = ustSekme(K, 'pusula');
    if (!a) {
      kirintiYaz(K, [[kac(P.ad), null]]);
      $('#ck-baslik').innerHTML = `${kac(P.ad)}<small>${kac(P.alt)} · ${kac(K.kod)}</small>`;
      $('#ck-sira').innerHTML = '';
      if (ayni) return;
      ckIc.innerHTML = `${puUstHTML(K)}${puListeHTML(K)}${puSV(K) ? `<p class="pu-dip">${ckBag('_sinav', 'Bütün sınav pusulası: strateji, son gün listesi →', 'soru-bag')}</p>` : ''}`;
      return;
    }
    const i = L.indexOf(a), o = L[i - 1], s = L[i + 1];
    kirintiYaz(K, [[kac(P.ad), '_pusula'], [kac(a.ad), null]]);
    $('#ck-baslik').innerHTML = `${kac(a.ad)}<small>${kac(a.alt)} · <span lang="en">${kac(a.en || '')}</span></small>`;
    $('#ck-sira').innerHTML = siraHTML(o && [`_pusula/${o.id}`, kac(o.ad)], `akış ${i + 1} / ${L.length}`, s && [`_pusula/${s.id}`, kac(s.ad)]);
    if (ayni) return;
    ckIc.innerHTML = `${puKartHTML(K, a)}<p class="pu-dip">${ckBag('_pusula', '← Beş akışın listesi', 'soru-bag')}${s ? ckBag(`_pusula/${s.id}`, `Sonraki akış: ${kac(s.ad)} →`, 'soru-bag') : ''}</p>`;
    texDoldur(ckIc, K);
    puKur(ckIc, K, a);
  }
  document.addEventListener('change', (e) => {
    const t = e.target; if (!t.matches || !t.matches('.pu-yol input[type=checkbox]') || !ckDurum) return;
    const K = ckDurum.K, g = puYol(K), i = +t.dataset.i;
    if (t.checked) g.add(i); else g.delete(i);
    sakla(`dk:puyol:${K.id}`, JSON.stringify([...g].sort((x, y) => x - y)));
    const say = $('.pu-yol-say', ckIc), n = $$('.pu-yol input[type=checkbox]', ckIc).length; if (say) say.textContent = `${[...g].filter((x) => x < n).length} / ${n}`;
  });

  function ckGoster(K, kPart, onEk) {
    const ilk = !ckDurum, ayni = !ilk && ckDurum.K === K && ckDurum.kPart === kPart;
    const qm = /^[^/]+\/(S\d+)(?:\/|$)/.exec(onEk), qid = qm ? qm[1] : null;
    ckDurum = { K, kPart, onEk, qid };
    ck.hidden = false; perde.hidden = true; ck.setAttribute('aria-hidden', 'false'); document.body.classList.add('ck-acik');
    document.documentElement.classList.add('ck-acik');
    // aramaya odaklanınca geçici tam boy: aramadan başka bir görünüme geçince eski boy
    if (!ayni && ckBoyOnce !== null && !/^_ara(\/|$)/.test(kPart)) { ckBoy = ckBoyOnce; ckBoyOnce = null; boyUygula(); }
    const don = $('#ck-don');
    don.textContent = qid ? `← ${yonelme(qid)} dön` : /\/bol\//.test(onEk) ? '← Bölüme dön' : '← Kitaba dön';
    don.onclick = () => { location.hash = `#${onEk}`; };
    $('#ck-geri').disabled = history.length <= 1;
    sabitYaz();
    if (!ayni) { if (animTutucu && animTutucu.dur) animTutucu.dur(); animTutucu = null; ipKapat(); araKapat(); }
    const [bas, ...kalan] = kPart.split('/');
    if (bas === '_atlas') atlasCk(K, ayni);
    else if (bas === '_bol') bolumCk(K, kalan[0], ayni);
    else if (bas === '_sozluk') sozlukCk(K, kalan.join('/'), ayni);
    else if (bas === '_tur') turCk(K, kalan[0] || '', ayni);
    else if (bas === '_tepkime') tepkimeCk(K, kalan[0] || '', ayni);
    else if (bas === '_dongu') donguCk(K, kalan[0] || '', ayni);
    else if (bas === '_hesap') hesapCk(K, kalan.join('/'), ayni);
    else if (bas === '_ag') agCk(K, ayni);
    else if (bas === '_sinav') sinavCk(K, kalan.join('/'), ayni);
    else if (bas === '_kars') karsCk(K, kalan.join('/'), ayni);
    else if (bas === '_ara') araCk(K, kalan.join('/'), ayni);
    else if (bas === '_terim') terimCk(K, kalan.join('/'), ayni);
    else if (bas === '_kesin') kesinCk(K, kalan.join('/'), ayni);
    else if (bas === '_konu') konuCk(K, kalan[0] || '', ayni);
    else if (bas === '_soru') soruCk(K, kalan[0] || '', ayni);
    else if (bas === '_pusula' && puVar(K)) pusulaCk(K, kalan[0] || '', ayni); // VIZE-316
    else kavramCk(K, bas, kalan[0] || 'tanim', ayni, kalan[1]);
    if (ilk && terimVar(K) && !TV[K.id]) terimYukle(K).then(() => { if (ckDurum && ckDurum.K === K && !/^_terim(\/|$)/.test(ckDurum.kPart)) terimSusle(K); });
    // arama dizini boşta önceden kurulur (ilk aramada bekleme olmasın; telefonda dizin kurmak ~0,1–0,5 sn)
    if (ilk && !ARD.has(K.id) && typeof requestIdleCallback === 'function') requestIdleCallback(() => { try { araDizin2(K); } catch (e) { /* sonra kurulur */ } }, { timeout: 5000 });
    sepetYazdir();
    if (ayni) { $$('[data-soru]', ckIc).forEach((a) => { const on = a.dataset.soru === qid; a.classList.toggle('simdi', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }); snYolCk(); return; }
    snYolCk();
    glifDuzelt(ckIc); isrSusle(ckIc);
    krKur(ckIc);
    ipucuEkle(ckIc, K);
    mkUygula(K);
    ckIc.scrollTop = 0; basUygula(); sekmeOrtala();
    if (ilk && ckMod() === 'alt') altGorunurTut();
    if (GOMULU) { /* odak üst pencerede kalır */ }
    else if (ilk) don.focus({ preventScroll: true });
    else if (!document.activeElement || document.activeElement === document.body || !document.activeElement.isConnected) $('#ck-baslik').focus({ preventScroll: true });
  }
  // ana sayfaya giden bağ: çekmece açık kalsın mı? (yan yana kipte Sabitle; telefonda alttaki panel hep açık kalır —
  // panelden basılan bağ ana akışı değiştirince panel %85 / tam boydaysa %55'e iner ki yeni sayfa görünsün)
  function anaGit(hedef, icten) {
    if (ckDurum && (ckSabitSorar() ? sabit : true)) {
      if (icten && ckMod() === 'alt' && ckBoy >= 2) boyAyarla(1, false);
      location.hash = `${hedef}/k/${ckDurum.kPart}`;
    } else location.hash = hedef;
  }
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const t = e.target.closest('[data-ck],[data-soru],[data-ana]');
    if (t && ckDurum) {
      e.preventDefault();
      if (t.dataset.ck) location.hash = `#${ckDurum.onEk}/k/${t.dataset.ck}`;
      else anaGit(`#${ckDurum.K.id}/${t.dataset.soru || t.dataset.ana}`, true);
      return;
    }
    if (!ckDurum || (ckSabitSorar() && !sabit)) return;
    const a = e.target.closest('a[href^="#"]');
    if (!a || ck.contains(a) || ipKart.contains(a)) return;
    const h = a.getAttribute('href'), kid = ckDurum.K.id;
    if (h.includes('/k/') || !(h === `#${kid}` || h.startsWith(`#${kid}/`))) return;
    e.preventDefault(); location.hash = `${h}/k/${ckDurum.kPart}`;
  });
  // ‹ › kavram komşusu (atlas sırası); aynı parça varsa orada kalır
  function kavramKomsu(yon) {
    if (!ckDurum) return null;
    const [bas, p = 'tanim'] = ckDurum.kPart.split('/'), K = ckDurum.K, L = K.kavramlar || [];
    const i = L.findIndex((k) => k.id === bas); if (i < 0) return null;
    const k = L[i + yon]; if (!k) return null;
    return `${k.id}/${parcaVar(K, k, p) ? p : 'tanim'}`;
  }

  /* --- dar ekranda küçülen başlık: içerik aşağı inince kırıntı · sıra · sekmeler gizlenir (başlık ≤ ekranın ~%30'u); başlığa dokun → başa --- */
  // ETK2 DKM: kısa çekmecede (alttaki panelin küçük boyları, yatay telefon) başlık baştan sıkı —
  // < 340 px yalnız başlık satırı (ck-dar; dokun → panel %85'e büyür) · 340–560 px kırıntı, sıra ve alt yazı gizli, sekmeler görünür (ck-orta)
  const ckYuk = () => (ckMod() === 'alt' ? BOY[ckBoy] * innerHeight : ckMod() === 'yan' ? innerHeight : ckMod() === 'yuzen' ? (ck.getBoundingClientRect().height || 400) : 1e4);
  const zorunluDar = () => (ckMod() === 'alt' && ckBoy === 0) || (ckMod() !== 'genis' && ckYuk() < 340);
  // sıkı başlıkta (ck-orta) sekmeler tek satır, yana kayar: seçili sekme görünür ortada
  function sekmeOrtala() {
    const sek = $('#ck-sekme'), s = sek && $('[aria-selected=true]', sek);
    if (s && sek.scrollWidth > sek.clientWidth + 2) sek.scrollLeft = Math.max(0, s.offsetLeft - sek.offsetLeft - (sek.clientWidth - s.offsetWidth) / 2);
  }
  function basUygula() {
    const m = ckMod(), h = ckYuk();
    ck.classList.toggle('ck-orta', m !== 'genis' && h >= 340 && h < 560);
    if (zorunluDar()) ck.classList.add('ck-dar'); else if (m === 'genis' || ckIc.scrollTop < 6) ck.classList.remove('ck-dar');
  }
  ckIc.addEventListener('scroll', () => {
    if (ckGenis()) { ck.classList.remove('ck-dar'); return; }
    const y = ckIc.scrollTop, dar = ck.classList.contains('ck-dar');
    if (!dar && y > 56) {
      const gizli = ['#kirinti', '#ck-sira', '#ck-sekme', '#ck-baslik small'].reduce((t, s) => t + (($(s, ck) || {}).offsetHeight || 0), 0);
      if (ckIc.scrollHeight - ckIc.clientHeight - gizli > 80) ck.classList.add('ck-dar');
    } else if (dar && y < 6 && !zorunluDar()) ck.classList.remove('ck-dar');
  }, { passive: true });
  $('#ck-baslik').addEventListener('click', () => {
    if (tikYut || !ck.classList.contains('ck-dar')) return;
    if (ckMod() === 'alt' && ckBoy < 2) { boyAyarla(2, true); return; }
    sabitBirak(); ck.classList.remove('ck-dar'); ckIc.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* --- Sabitle + genişlik (kenardan sürükle; 360 px – 60 vw; hatırlanır) · yan kipte oran %35–%65 (dk:ckyan) · alt kipte boy durağı (dk:ckboy) --- */
  const sabitBtn = $('#ck-sabit');
  function sabitYaz() { sabitBtn.setAttribute('aria-pressed', String(sabit)); sabitBtn.title = sabit ? 'Sabit: soru değişince çekmece açık kalır. Dokun: soruya geçince kapansın.' : 'Sabitle: soru değişince çekmece açık kalsın.'; }
  sabitBtn.addEventListener('click', () => { sabit = !sabit; sakla('dk:sabit', sabit ? '1' : '0'); sabitYaz(); });
  const tutamak = $('#ck-tutamak');
  let ckGen = +oku('dk:ckgen') || 0;
  const yanSinir = (o) => Math.max(0.35, Math.min(0.65, +o || 0.5));
  let ckYan = yanSinir(oku('dk:ckyan'));
  const genSinir = (g) => Math.round(Math.max(360, Math.min(innerWidth * 0.6, g)));
  /* --- ETK3 YUZEN (27 Kas): basılı tut → yüzen pencere ---
     Alt panelin (ya da yan çekmecenin) tutamağına / başlık şeridine ~450 ms basılı tut (varsa 10 ms titreşim) ya da başlıktaki simge
     (yazı yok) → yüzen pencere (html[data-ckmod=yuzen]): tutamak / başlıktan sürükle-taşı, köşeden boyutlandır (en küçük 240×200,
     ekrana sığar), içerik kendi içinde gezilir, pencere dışındaki dokunuşlar kitaba gider. Simge («yerleştir») ya da başlığa çift
     dokunuş → eski yerine. Kip, konum, boyut yönlendirmeye (dikey / yatay) göre dk:ckyuz'da (oran); klavye açılınca pencere görünür
     alanda kalır (visualViewport; istenen konum değişmez). Tutamakta ok tuşları taşır, Shift + ok boyutlandırır, Enter yerleştirir. */
  const YZ_MIN_W = 240, YZ_MIN_H = 200;
  const yzOku = () => { try { const x = JSON.parse(oku('dk:ckyuz') || 'null'); return x && typeof x === 'object' ? x : {}; } catch (e) { return {}; } };
  const yzYon = () => (innerWidth > innerHeight ? 'yatay' : 'dikey');
  let yzKonum = null, yzSonYon = '';
  function yzVarsayilan() {
    const W = innerWidth, H = innerHeight, ustH = ($('#ust') || {}).offsetHeight || 56;
    if (yzYon() === 'yatay') { const w = Math.round(Math.min(Math.max(W * 0.42, YZ_MIN_W), 460)), h = Math.max(YZ_MIN_H, H - ustH - 16); return { x: W - w - 8, y: ustH + 8, w, h }; }
    const w = Math.min(W - 16, 460), h = Math.round(Math.min(Math.max(H * 0.46, YZ_MIN_H), 560)); return { x: Math.round((W - w) / 2), y: H - h - 12, w, h };
  }
  // görünür alana sığdır (klavye açıkken visualViewport); en küçük boy ekrandan büyükse ekran
  function yzSinirla(r) {
    const vv = window.visualViewport, ox = vv ? vv.offsetLeft : 0, oy = vv ? vv.offsetTop : 0, W = vv ? vv.width : innerWidth, H = vv ? vv.height : innerHeight;
    const w = Math.max(Math.min(YZ_MIN_W, W - 8), Math.min(r.w, W - 8)), h = Math.max(Math.min(YZ_MIN_H, H - 8), Math.min(r.h, H - 8));
    return { x: Math.round(Math.max(ox + 4, Math.min(r.x, ox + W - w - 4))), y: Math.round(Math.max(oy + 4, Math.min(r.y, oy + H - h - 4))), w: Math.round(w), h: Math.round(h) };
  }
  function yzYaz() {
    if (!yzKonum || yzSonYon !== yzYon()) yzYukle();
    const r = yzSinirla(yzKonum), st = document.documentElement.style;
    st.setProperty('--yz-x', `${r.x}px`); st.setProperty('--yz-y', `${r.y}px`); st.setProperty('--yz-w', `${r.w}px`); st.setProperty('--yz-h', `${r.h}px`);
  }
  function yzSakla() {
    const x = yzOku(), W = innerWidth, H = innerHeight, r = yzKonum;
    if (r) x[yzYon()] = { x: +(r.x / W).toFixed(4), y: +(r.y / H).toFixed(4), w: +(r.w / W).toFixed(4), h: +(r.h / H).toFixed(4) };
    x.acik = ckYuz; sakla('dk:ckyuz', JSON.stringify(x));
  }
  function yzYukle() { yzSonYon = yzYon(); const o = yzOku()[yzSonYon]; yzKonum = o && o.w > 0 && o.h > 0 ? { x: o.x * innerWidth, y: o.y * innerHeight, w: o.w * innerWidth, h: o.h * innerHeight } : yzVarsayilan(); }
  const yzDug = $('#ck-yz');
  const YZ_IK = { yuz: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><rect x="11" y="10" width="8" height="7" rx="1.2" fill="currentColor" stroke="none"/>', yer: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 14h18"/><path d="M12 7v4M10 9.5l2 2 2-2"/>' };
  function yzDugYaz() {
    if (!yzDug) return;
    const ad = ckYuz ? 'Yerine yerleştir' : 'Yüzen pencere (başlığa basılı tutarak da)';
    yzDug.setAttribute('aria-pressed', String(ckYuz)); yzDug.setAttribute('aria-label', ad); yzDug.title = ad;
    yzDug.innerHTML = `<svg class="ik" viewBox="0 0 24 24" aria-hidden="true">${ckYuz ? YZ_IK.yer : YZ_IK.yuz}</svg>`;
  }
  function yuzenAyarla(on, { r = null } = {}) {
    if (on === ckYuz) { if (on && r) { yzKonum = r; yzYaz(); yzSakla(); } return; }
    if (ckDurum) sbPanel(); // ana akışın payı (alttaki boşluk / yandaki pay) değişir: okunan yer korunsun
    ckYuz = on;
    if (on) { if (r) { yzKonum = r; yzSonYon = yzYon(); } else yzYukle(); }
    genUygula(); yzDugYaz(); yzSakla();
    if (ckDurum) { basUygula(); sekmeOrtala(); }
  }
  if (yzDug) { yzDugYaz(); yzDug.addEventListener('click', () => yuzenAyarla(!ckYuz)); }
  // basılı tut / taşı / boyutlandır: tutamak ya da başlık şeridi (düğme, bağ, kutu dışı); köşe tutamağı boyut
  let yzBas = null, yzTas = null, yzSonTik = 0, yzSonXY = [0, 0];
  const yzHedef = (t) => !!(t && t.closest) && (!!t.closest('.ck-tutamak') || (!!t.closest('.ck-ust, #ck-baslik') && !t.closest('button, a, input, select, textarea, label, .ck-sonuc')));
  function yzBasiliTut() {
    const b = yzBas; yzBas = null; if (!b || !ckDurum || ckMod() === 'yuzen') return;
    sur = null; document.body.classList.remove('ck-surukle'); boyUygula(); // alt kipin boy sürüklemesi iptal (parmak kalkmadan pencereye geçer)
    try { if (navigator.vibrate) navigator.vibrate(10); } catch (x) { /* titreşim yok */ }
    const v = yzVarsayilan(), r0 = ck.getBoundingClientRect(), h = Math.max(YZ_MIN_H, Math.min(v.h, r0.height || v.h));
    const r = yzSinirla({ x: Math.round(b.x0 - v.w / 2), y: Math.round(b.y0 - 22), w: v.w, h });
    yuzenAyarla(true, { r });
    yzTas = { id: b.id, x0: b.x0, y0: b.y0, r0: { ...r }, kose: false, basladi: true, tut: false, iz: [] };
    try { ck.setPointerCapture(b.id); } catch (x) { /* yakalanamadı */ }
    tikYut = true; setTimeout(() => { tikYut = false; }, 600);
  }
  ck.addEventListener('pointerdown', (e) => {
    if (!ckDurum || (e.pointerType === 'mouse' && e.button)) return;
    const t = e.target;
    if (ckMod() === 'yuzen') {
      const kose = !!t.closest('.ck-yz-kose');
      if (!kose && !yzHedef(t)) return;
      e.preventDefault();
      const r = ck.getBoundingClientRect();
      yzTas = { id: e.pointerId, x0: e.clientX, y0: e.clientY, r0: { x: r.left, y: r.top, w: r.width, h: r.height }, kose, basladi: false, tut: !kose && !!t.closest('.ck-tutamak'), iz: [[e.clientX, e.clientY, e.timeStamp]] };
      try { ck.setPointerCapture(e.pointerId); } catch (x) { /* yakalanamadı */ }
      return;
    }
    if (!yzHedef(t)) return;
    if (yzBas) clearTimeout(yzBas.zam);
    yzBas = { id: e.pointerId, x0: e.clientX, y0: e.clientY, zam: setTimeout(yzBasiliTut, 450) };
  });
  ck.addEventListener('pointermove', (e) => {
    if (yzBas && e.pointerId === yzBas.id && Math.hypot(e.clientX - yzBas.x0, e.clientY - yzBas.y0) > 8) { clearTimeout(yzBas.zam); yzBas = null; }
    const s = yzTas; if (!s || e.pointerId !== s.id) return;
    const dx = e.clientX - s.x0, dy = e.clientY - s.y0;
    s.iz.push([e.clientX, e.clientY, e.timeStamp]); if (s.iz.length > 8) s.iz.shift();
    if (!s.basladi) { if (Math.hypot(dx, dy) < 6) return; s.basladi = true; }
    document.body.classList.add('ck-surukle');
    yzKonum = s.kose ? { x: s.r0.x, y: s.r0.y, w: s.r0.w + dx, h: s.r0.h + dy } : { ...s.r0, x: s.r0.x + dx, y: s.r0.y + dy };
    yzYaz();
    const A = s.tut && AO(); if (A) A.ipucu(A.gizlemeYonu({ eksen: 'serbest' }, e.clientX, dx, A.hiz(s.iz), dy)); // ETK5-B: kenara bırak / fırlat → gizle
  });
  const yzBit = (e) => {
    if (yzBas && e.pointerId === yzBas.id) { clearTimeout(yzBas.zam); yzBas = null; }
    const s = yzTas; if (!s || e.pointerId !== s.id) return;
    yzTas = null; document.body.classList.remove('ck-surukle');
    const A = AO();
    if (s.basladi) {
      const yon = A && s.tut && e.type === 'pointerup' ? A.gizlemeYonu({ eksen: 'serbest' }, e.clientX, e.clientX - s.x0, A.hiz(s.iz), e.clientY - s.y0) : null;
      if (A && s.tut) A.ipucu(null);
      tikYut = true; setTimeout(() => { tikYut = false; }, 320);
      if (yon) { // ETK5-B: eski yerine dönerek kenara gizlenir (geri gelince orada açılır)
        const r1 = ck.getBoundingClientRect(); yzKonum = { ...s.r0 }; yzYaz(); yzSakla();
        const r0 = ck.getBoundingClientRect(); ck.style.transition = 'none'; ck.style.transform = `translate3d(${Math.round(r1.left - r0.left)}px,${Math.round(r1.top - r0.top)}px,0)`; void ck.offsetWidth;
        ckGizle(yon); return;
      }
      yzKonum = yzSinirla(yzKonum); yzYaz(); yzSakla(); if (ckDurum) basUygula(); return;
    }
    const t = performance.now(); // taşımadan dokunma: çift dokunuş → yerine yerleştir · tutamakta tek dokunuş → seçenek menüsü (ETK5-B)
    if (e.type === 'pointerup' && !s.kose && t - yzSonTik < 340 && Math.hypot(e.clientX - yzSonXY[0], e.clientY - yzSonXY[1]) < 24) { yzSonTik = 0; ckMenuYut = performance.now(); if (A) A.menuKapat(false); yuzenAyarla(false); return; }
    yzSonTik = t; yzSonXY = [e.clientX, e.clientY];
  };
  ck.addEventListener('pointerup', yzBit); ck.addEventListener('pointercancel', yzBit);
  ck.addEventListener('contextmenu', (e) => { if (yzHedef(e.target)) e.preventDefault(); });
  if (window.visualViewport) { const f = () => { if (ckMod() === 'yuzen') yzYaz(); }; visualViewport.addEventListener('resize', f); visualViewport.addEventListener('scroll', f); }
  window.__dkYuzen = { ayarla: (on) => yuzenAyarla(!!on), konum: () => (yzKonum ? { ...yzKonum } : null), acik: () => ckYuz }; // sınama kancası
  /* --- ETK5-B (28 Kas): tutma çubuğu = arama paneliyle AYNI davranış (ortak/ara-balon.js window.__abOrtak: menü + kenar hapı) ---
     Dokun / tıkla / Enter → seçenek menüsü: Yüzen · Sağda / Solda böl (telefonda Alt panel) · alt kipte Büyüt / Küçült (boy durakları) ·
     Sağa / Sola gizle · Balona küçült · Kapat. Alt ve yüzen kipte tutamağı sağa / sola sürükle ya da fırlat → o kenara gizlenir; kenarda
     yalnız ince dikey hap (44 px) kalır, dokun / içeri sürükle → yaylı geri gelir (html.ck-kenarda: ana akış payı kalkar, okunan yer korunur).
     Alt kipte yukarı-aşağı sürükleme boyu değiştirmeye devam eder. «Solda böl» = html[data-ckyon=sol] (dk:ckyon). Kabuk yoksa eski davranış. */
  const AO = () => window.__abOrtak || null;
  let ckYon = oku('dk:ckyon') === 'sol' ? 'sol' : 'sag', ckKB = null, ckSonMod = '';
  const ckYerlesik = () => (genisMq.matches ? 'genis' : yanMq.matches ? 'yan' : 'alt');
  const ckYonUygula = () => { document.documentElement.dataset.ckyon = ckYon; };
  ckYonUygula();
  const ckGizliMi = () => !!(ckKB && ckKB.yon());
  function ckKenar() {
    const A = AO(); if (!A) return null;
    if (!ckKB) ckKB = A.kenar({ el: () => ck, tx: (y) => (y === 'sag' ? Math.round(innerWidth - ck.offsetLeft + 24) : Math.round(-(ck.offsetLeft + ck.offsetWidth + 24))), yer: () => ({ top: ck.offsetTop, h: ck.offsetHeight }), getir: (odak) => ckGetir(odak), ad: 'Çekmeceyi geri getir', title: 'Çekmece · dokun ya da içeri sürükle', kimlik: 'cekmece' });
    return ckKB;
  }
  function ckGizle(yon) {
    const K = ckKenar(); if (!K || !ckDurum) return;
    AO().menuKapat(false);
    sbPanel(); document.documentElement.classList.add('ck-kenarda');
    K.gizle(yon);
  }
  function ckGetir(odak, hemen) {
    if (!ckGizliMi()) return;
    const hapOdak = odak && document.activeElement === ckKB.hap();
    if (ckDurum) sbPanel();
    document.documentElement.classList.remove('ck-kenarda');
    ckKB.getir(!!hemen);
    if (hapOdak && ckDurum) tutamak.focus({ preventScroll: true });
  }
  window.__dkKenar = { gizli: ckGizliMi, getir: (odak, hemen) => ckGetir(odak, hemen), gizle: (y) => ckGizle(y) }; // ara-balon (basılı tut) + sınama kancası
  addEventListener('hashchange', () => { if (ckGizliMi()) ckGetir(false); }); // yeni görünüm istendi → çekmece geri gelir
  const BOY_KISA = ['%35', '%55', '%85', 'Tam'];
  const IK_BOY = { buyut: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>', kucult: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>' };
  function ckMenuOgeler() {
    const I = AO().IK, m = ckMod(), yz = m === 'yuzen';
    const L = [{ id: 'yuzen', ad: 'Yüzen pencere', ik: I.yuz, rol: 'menuitemradio', secili: yz }];
    if (ckYerlesik() === 'alt') L.push({ id: 'alt', ad: 'Alt panel', ik: I.alt, rol: 'menuitemradio', secili: !yz });
    else L.push({ id: 'bolSag', ad: 'Sağda böl', ik: I.bol, rol: 'menuitemradio', secili: !yz && ckYon !== 'sol' }, { id: 'bolSol', ad: 'Solda böl', ik: I.bolSol, rol: 'menuitemradio', secili: !yz && ckYon === 'sol' });
    if (m === 'alt') { // boy durakları (eski «tutamağa dokun = bir boy büyüt»)
      L.push('-');
      if (ckBoy < 3) L.push({ id: 'buyut', ad: 'Büyüt', ik: IK_BOY.buyut, kisa: BOY_KISA[ckBoy + 1] });
      if (ckBoy > 0) L.push({ id: 'kucult', ad: 'Küçült', ik: IK_BOY.kucult, kisa: BOY_KISA[ckBoy - 1] });
    }
    L.push('-', { id: 'gizSag', ad: 'Sağa gizle', ik: I.gizSag }, { id: 'gizSol', ad: 'Sola gizle', ik: I.gizSol }, '-', { id: 'balon', ad: 'Balona küçült', ik: I.balon }, { id: 'kapat', ad: 'Kapat', ik: I.x, kisa: 'Esc' });
    return L;
  }
  function ckMenuSec(id) {
    const A = AO(); if (A) A.menuKapat(false);
    if (id === 'gizSag' || id === 'gizSol') { ckGizle(id === 'gizSag' ? 'sag' : 'sol'); return; }
    if (id === 'buyut' || id === 'kucult') { boyAyarla(ckBoy + (id === 'buyut' ? 1 : -1), true); tutamak.focus({ preventScroll: true }); return; }
    ckGetir(false, true);
    if (id === 'balon' || id === 'kapat') { if (id === 'kapat') araInp.value = ''; kapatAlt(); return; }
    if (id === 'bolSag' || id === 'bolSol') { const y = id === 'bolSol' ? 'sol' : 'sag'; if (y !== ckYon) { if (ckDurum) sbPanel(); ckYon = y; sakla('dk:ckyon', y === 'sol' ? 'sol' : ''); ckYonUygula(); } }
    yuzenAyarla(id === 'yuzen');
    tutamak.focus({ preventScroll: true });
  }
  // dokunuş / tık → menü: pointerup'ta değil click'te açılır (dokunmatikte menü parmağın altına açılırsa «hayalet tık» öğeyi seçerdi);
  // sürükleme / basılı tutma sonrası tık tikYut ile, yüzen pencerede çift dokunuşun ikinci tıkı ckMenuYut ile yutulur
  // (fareyle yüzen / alt kipte imleç çekmeceye yakalandığından tık hedefi #cekmece olur → basış tutamakta başladıysa o da sayılır)
  let ckMenuYut = 0, ckTutBas = 0;
  tutamak.addEventListener('pointerdown', () => { ckTutBas = performance.now(); }, true);
  ck.addEventListener('click', (e) => {
    const t = e.target, tut = !!(t.closest && t.closest('.ck-tutamak')) || (t === ck && performance.now() - ckTutBas < 1200);
    if (!tut || tikYut || performance.now() - ckMenuYut < 450) return;
    const m = ckMod();
    ckMenuAc(false, m === 'alt' || m === 'yuzen' ? null : [e.clientX, e.clientY]);
  });
  function ckMenuAc(klavye, nokta) { // false: kabuk yok (eski davranış sürer)
    const A = AO(); if (!A || !ckDurum) return false;
    if (A.menuAcik()) { A.menuKapat(false); return true; } // açıkken ikinci dokunuş kapatır
    A.menu(tutamak, ckMenuOgeler(), ckMenuSec, klavye, { ad: 'Çekmece seçenekleri', odak: () => !!ckDurum && !ckGizliMi(), nokta });
    return true;
  }
  const BOY_AD = ['küçük (%35)', 'orta (%55)', 'büyük (%85)', 'tam ekran'];
  function boyUygula() {
    const kok = document.documentElement;
    if (ckDurum && ckMod() === 'alt') sbPanel(); // değişimden önce: okunan yer ölçülsün
    kok.style.setProperty('--ck-oran', String(BOY[ckBoy]));
    kok.dataset.ckboy = String(ckBoy);
    if (ckMod() === 'alt') { tutamak.setAttribute('aria-valuenow', String(ckBoy)); tutamak.setAttribute('aria-valuetext', `Panel ${BOY_AD[ckBoy]}`); }
    if (ckDurum) basUygula();
  }
  function boyAyarla(i, kalici) {
    ckBoy = Math.max(0, Math.min(3, i));
    if (kalici) { ckBoyOnce = null; sakla('dk:ckboy', String(ckBoy)); }
    boyUygula();
  }
  function genUygula() {
    const kok = document.documentElement, m = ckMod();
    kok.dataset.ckmod = m;
    if (ckGizliMi()) { if (m !== ckSonMod) ckGetir(false, true); else ckKB.yerle(); } // ETK5-B: kip değişince kenardan anında geri
    ckSonMod = m;
    if (m === 'yuzen') yzYaz();
    if (ckGen) kok.style.setProperty('--ck-gen', `${genSinir(ckGen)}px`); else kok.style.removeProperty('--ck-gen');
    kok.style.setProperty('--ck-yan', `${(ckYan * 100).toFixed(1)}vw`);
    const alt = m === 'alt', yz = m === 'yuzen';
    tutamak.setAttribute('aria-orientation', alt || yz ? 'horizontal' : 'vertical');
    tutamak.setAttribute('aria-haspopup', 'menu'); if (!tutamak.hasAttribute('aria-expanded')) tutamak.setAttribute('aria-expanded', 'false');
    tutamak.setAttribute('aria-label', yz ? 'Pencere seçenekleri: dokun ya da Enter · sürükle ya da ok tuşları: taşı (Shift + ok: boyut) · kenara at: gizle · çift dokun: yerine yerleştir' : alt ? 'Panel seçenekleri: dokun ya da Enter · yukarı-aşağı sürükle ya da ↑ ↓: boy · aşağı atınca kapanır · sağa / sola sürükle: gizle · basılı tut: yüzen pencere' : 'Çekmece genişliği: sürükle ya da ← → (çift tık: varsayılan) · dokun ya da Enter: seçenekler · basılı tut: yüzen pencere');
    tutamak.title = yz ? 'Dokun: seçenekler · sürükle: taşı · kenara at: gizle · çift dokun: yerine yerleştir' : alt ? 'Dokun: seçenekler · yukarı-aşağı sürükle: boy · sağa / sola sürükle: gizle · basılı tut: yüzen pencere' : 'Sürükle: genişlik · dokun: seçenekler · çift tık: varsayılan · basılı tut: yüzen pencere';
    if (alt) { tutamak.setAttribute('aria-valuemin', '0'); tutamak.setAttribute('aria-valuemax', '3'); } else ['aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-valuetext'].forEach((a) => tutamak.removeAttribute(a));
    boyUygula();
  }
  genUygula();
  addEventListener('resize', genUygula, { passive: true });
  // yanda (genis / yan): sol kenardan sürükle → genişlik
  let yanSur = null; // ETK5-B: yanda kıpırdamadan dokunuş → seçenek menüsü (dokunulan yerde); sürükleme → genişlik
  tutamak.addEventListener('pointerdown', (e) => { if (ckMod() === 'alt' || ckMod() === 'yuzen') return; e.preventDefault(); tutamak.setPointerCapture(e.pointerId); yanSur = { x0: e.clientX, y0: e.clientY, oyn: false }; });
  tutamak.addEventListener('pointermove', (e) => {
    if (!tutamak.hasPointerCapture(e.pointerId) || ckMod() === 'alt' || ckMod() === 'yuzen') return;
    if (yanSur && !yanSur.oyn) { if (Math.hypot(e.clientX - yanSur.x0, e.clientY - yanSur.y0) < 4) return; yanSur.oyn = true; document.body.classList.add('ck-surukle'); }
    const W = document.documentElement.clientWidth, g = ckYon === 'sol' ? e.clientX : W - e.clientX;
    if (ckMod() === 'yan') ckYan = yanSinir(g / W); else ckGen = g;
    genUygula();
  });
  const surBit = (e) => {
    if (tutamak.hasPointerCapture(e.pointerId)) tutamak.releasePointerCapture(e.pointerId);
    document.body.classList.remove('ck-surukle');
    const s = yanSur; yanSur = null;
    if (s && !s.oyn) return; // dokunuş: menü tutamağın click'inde açılır
    if (s) { tikYut = true; setTimeout(() => { tikYut = false; }, 320); } // genişlik sürüklemesinden sonraki tık menü açmasın
    if (ckMod() === 'yan') sakla('dk:ckyan', ckYan.toFixed(3)); else if (ckGen) { ckGen = genSinir(ckGen); sakla('dk:ckgen', String(ckGen)); }
  };
  tutamak.addEventListener('pointerup', surBit); tutamak.addEventListener('pointercancel', surBit);
  tutamak.addEventListener('dblclick', () => { if (ckMod() === 'yuzen') return; const A = AO(); if (A) A.menuKapat(false); if (ckMod() === 'yan') { ckYan = 0.5; sakla('dk:ckyan', ''); } else { ckGen = 0; sakla('dk:ckgen', ''); } genUygula(); });
  const kapatAlt = () => { if (ckDurum) location.hash = `#${ckDurum.onEk}`; };
  tutamak.addEventListener('keydown', (e) => {
    const m = ckMod(), k = e.key;
    if ((k === 'Enter' || k === ' ') && !e.repeat && ckMenuAc(true)) { e.preventDefault(); return; } // ETK5-B: Enter / boşluk → seçenek menüsü
    if (m === 'yuzen') { // ok: taşı · Shift + ok: boyut · (kabuk yoksa) Enter / boşluk: yerine yerleştir
      const ad = 16, dx = k === 'ArrowLeft' ? -ad : k === 'ArrowRight' ? ad : 0, dy = k === 'ArrowUp' ? -ad : k === 'ArrowDown' ? ad : 0;
      if (dx || dy) { e.preventDefault(); const r = yzKonum || yzVarsayilan(); yzKonum = e.shiftKey ? { ...r, w: r.w + dx, h: r.h + dy } : { ...r, x: r.x + dx, y: r.y + dy }; yzKonum = yzSinirla(yzKonum); yzYaz(); yzSakla(); }
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); yuzenAyarla(false); }
      return;
    }
    if (m === 'alt') {
      if (k === 'ArrowUp' || k === 'ArrowDown') { e.preventDefault(); if (k === 'ArrowDown' && ckBoy === 0) kapatAlt(); else boyAyarla(ckBoy + (k === 'ArrowUp' ? 1 : -1), true); }
      else if (k === 'Home' || k === 'End') { e.preventDefault(); boyAyarla(k === 'End' ? 3 : 0, true); }
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); boyAyarla(ckBoy < 3 ? ckBoy + 1 : 1, true); }
      return;
    }
    if (k !== 'ArrowLeft' && k !== 'ArrowRight') return;
    e.preventDefault();
    const buyu = (k === 'ArrowLeft') !== (ckYon === 'sol'); // solda böl: → genişletir
    if (m === 'yan') { ckYan = yanSinir(ckYan + (buyu ? 0.05 : -0.05)); sakla('dk:ckyan', ckYan.toFixed(3)); }
    else { ckGen = genSinir((ckGen || ck.getBoundingClientRect().width) + (buyu ? 40 : -40)); sakla('dk:ckgen', String(ckGen)); }
    genUygula();
  });
  // alt kip: tutamaktan ya da başlık şeridinden (düğme / kutu dışı) yukarı-aşağı sürükle → boy; bırakınca en yakın durağa oturur,
  // hızlı atış bir sonraki durağa gider, en küçüğün altına atınca panel kapanır; tutamağa dokunmak bir boy büyütür (tamdan sonra ortaya döner)
  let sur = null;
  ck.addEventListener('pointerdown', (e) => {
    if (ckMod() !== 'alt' || !ckDurum || (e.pointerType === 'mouse' && e.button)) return;
    const t = e.target, tut = !!t.closest('.ck-tutamak');
    if (!tut && (!t.closest('.ck-ust, #ck-baslik') || t.closest('button, a, input, select, textarea, label, .ck-sonuc'))) return;
    sur = { id: e.pointerId, y0: e.clientY, x0: e.clientX, h0: ck.getBoundingClientRect().height, iz: [[e.timeStamp, e.clientY]], izx: [[e.clientX, e.clientY, e.timeStamp]], basladi: false, eksen: null, tut };
    e.preventDefault(); // yazı seçimi / yerel sürükle-bırak başlamasın (pointercancel)
    if (tut) { try { ck.setPointerCapture(e.pointerId); } catch (x) { /* yakalanamadı */ } }
  });
  ck.addEventListener('pointermove', (e) => {
    if (!sur || e.pointerId !== sur.id) return;
    const dy = e.clientY - sur.y0, dx = e.clientX - sur.x0, A = AO();
    sur.izx.push([e.clientX, e.clientY, e.timeStamp]); if (sur.izx.length > 8) sur.izx.shift();
    if (!sur.basladi) {
      const yatay = !!A && sur.tut && Math.abs(dx) >= 7 && Math.abs(dx) >= Math.abs(dy) * 0.8; // ETK5-B: tutamağı sağa / sola sürükle → kenara gizle
      if (!yatay && Math.abs(dy) < 7) return;
      sur.basladi = true; sur.eksen = yatay ? 'x' : 'y'; document.body.classList.add('ck-surukle');
      try { ck.setPointerCapture(e.pointerId); } catch (x) { /* yakalanamadı */ }
      if (yatay) ck.style.transition = 'none';
    }
    if (sur.eksen === 'x') { ck.style.transform = `translate3d(${Math.round(dx)}px,0,0)`; ck.style.opacity = String(1 - Math.min(0.3, Math.abs(dx) / innerWidth)); A.ipucu(A.gizlemeYonu({ eksen: 'x' }, e.clientX, dx, A.hiz(sur.izx))); return; }
    sbPanel(400);
    document.documentElement.style.setProperty('--ck-oran', String(Math.max(0.12, Math.min(1, (sur.h0 - dy) / innerHeight))));
    sur.iz.push([e.timeStamp, e.clientY]); if (sur.iz.length > 6) sur.iz.shift();
  });
  const surAltBit = (e) => {
    if (!sur || e.pointerId !== sur.id) return;
    const s = sur; sur = null;
    if (!s.basladi) { if (s.tut && e.type === 'pointerup' && !AO()) boyAyarla(ckBoy < 3 ? ckBoy + 1 : 1, true); return; } // ETK5-B: dokun → menü (tutamağın click'inde; boy durakları menüde) · kabuk yoksa eski davranış
    document.body.classList.remove('ck-surukle');
    tikYut = true; setTimeout(() => { tikYut = false; }, 320);
    if (s.eksen === 'x') { // ETK5-B: eşik / fırlatma → o kenara gizlen; yoksa yaylı geri
      const A = AO(), yon = e.type === 'pointercancel' ? null : A.gizlemeYonu({ eksen: 'x' }, e.clientX, e.clientX - s.x0, A.hiz(s.izx));
      A.ipucu(null);
      if (yon) { ckGizle(yon); return; }
      ck.style.transition = A.azHareket() ? 'none' : 'transform .34s cubic-bezier(.22,1.16,.36,1),opacity .2s ease'; ck.style.transform = ''; ck.style.opacity = '';
      setTimeout(() => { if (!ckGizliMi() && !sur) ck.style.transition = ''; }, 420);
      return;
    }
    // atış hızı: son ~100 ms'lik hareket (px/ms; + = aşağı); pencerede tek örnek varsa bir öncekiyle
    const [t1, y1] = s.iz[s.iz.length - 1];
    let j = s.iz.findIndex(([t]) => t >= t1 - 100); if (j >= s.iz.length - 1) j = Math.max(0, s.iz.length - 2);
    const [t0, y0] = s.iz[j], v = t1 > t0 ? (y1 - y0) / (t1 - t0) : 0;
    const oran = ck.getBoundingClientRect().height / innerHeight;
    if (oran < 0.2 || (v > 0.8 && oran < BOY[0] + 0.04)) { boyUygula(); kapatAlt(); return; }
    let i = BOY.reduce((b, x, j) => (Math.abs(x - oran) < Math.abs(BOY[b] - oran) ? j : b), 0);
    if (v > 0.55) { i = -1; BOY.forEach((x, j) => { if (x < oran - 0.02) i = j; }); if (i < 0) { boyUygula(); kapatAlt(); return; } }
    else if (v < -0.55) { i = BOY.findIndex((x) => x > oran + 0.02); if (i < 0) i = 3; }
    boyAyarla(i, true);
  };
  ck.addEventListener('pointerup', surAltBit); ck.addEventListener('pointercancel', surAltBit);
  ck.addEventListener('click', (e) => { if (tikYut) { e.preventDefault(); e.stopPropagation(); } }, true);
  // telefonda panel ilk açılınca dokunulan öğe (adımdaki kavram düğmesi) panelin altında kalmasın: ana akış hafifçe yukarı kayar
  let sonDokunus = null;
  document.addEventListener('pointerdown', (e) => { if (ana.contains(e.target)) sonDokunus = { el: e.target.closest('button, a, summary, [data-git]') || e.target, t: Date.now() }; }, true);
  function altGorunurTut() {
    const s = sonDokunus; sonDokunus = null;
    if (!s || Date.now() - s.t > 1500 || !sbGorunur(s.el) || ckMod() !== 'alt') return;
    const r = s.el.getBoundingClientRect(), u = sbUst(window), sinir = innerHeight * (1 - BOY[ckBoy]) - 16;
    if (!r.height || r.top < u - 1 || r.top > innerHeight || r.bottom <= sinir) return; // ekranda değildi ya da zaten panelin üstünde
    sabitTut(s.el, { kab: window, hedefY: Math.max(u + 8, sinir - r.height - 8), yumusak: 260 });
  }

  /* --- süzgeç: yazdıkça süzer (Türkçe harf ve boşluk duyarsız; TR, EN, sembol); ↑ ↓ Enter; Esc temizler --- */
  const araInp = $('#ck-ara'), araSonuc = $('#ck-sonuc');
  let araDizin = null, araKitap = null, araSec = 0, araListe = [];
  function araDizinKur(K) {
    if (araKitap === K && araDizin) return araDizin;
    araKitap = K; araDizin = [];
    const ekle = (o) => araDizin.push({ ...o, n: norm(o.n) });
    ekle({ t: 'Atlas', ad: `${K.kod} · kavram atlası`, ck: '_atlas', n: `atlas kavram atlası ${K.kod} ${K.ad}` });
    if (puVar(K)) ekle({ t: 'Pusula', ad: `${K.kod} · ${K.pusula.ad}`, alt: K.pusula.alt, ck: '_pusula', n: `vize pusulası pusula el hesabı akış ${K.pusula.akis.map((x) => `${x.ad} ${x.alt} ${x.en}`).join(' ')}` }); // VIZE-316
    ekle({ t: 'Sözlük', ad: `Sözlük · ${(K.sozluk || []).length} terim`, ck: '_sozluk', n: 'sözlük glossary terimler tr en' });
    if ((K.kavramlar || []).length > 1) ekle({ t: 'Atlas', ad: 'Kavram ağı', ck: '_ag', n: 'kavram ağı ag graf bağlar network' });
    if (snVar(K)) ekle({ t: 'Sınav', ad: 'Sınav pusulası', alt: 'strateji · olasılık · son gün', ck: '_sinav', n: 'sınav pusulası vize quiz strateji olasılık son gün' });
    if (terimVar(K)) ekle({ t: 'Terimler', ad: `Terim kartları · ${K.terim.n || (K.terim.terim || []).length}`, ck: '_terim', n: 'terimler terim kartları terms glossary cards' });
    K.bolumler.filter((b) => bolumDolu(K, b)).forEach((b) => ekle({ t: 'Bölüm', ad: bolumAd(K, b), ck: `_bol/${b.id}`, n: `${bolumAd(K, b)} ${b.ad}` }));
    (K.kavramlar || []).forEach((k) => ekle({ t: 'Kavram', ad: `${k.sembol} · ${k.ad}`, alt: k.en, ck: `${k.id}/tanim`, n: `${k.ad} ${k.en || ''} ${k.sembol} ${k.id}` }));
    (K.sozluk || []).forEach((s) => ekle({ t: 'Terim', ad: s.en, alt: s.tr, ck: `_sozluk/${s.en}`, n: `${s.en} ${s.tr}` }));
    (K.kavramlar || []).forEach((k) => (dilK(K, k.id)?.terim || []).forEach((t) => ekle({ t: 'TR↔EN', ad: t.en, alt: `${t.tr} · ${k.ad}`, ck: `${k.id}/dil`, n: `${t.en} ${t.tr}` })));
    // DK323: türler (ad, formül, yazımlar), tepkimeler (denklem, ad, tip), çevrimler, hesap araçları
    if (turlar(K).length) ekle({ t: 'Kimya', ad: `Türler · ${turlar(K).length}`, ck: '_tur', n: 'türler tür species kimya' });
    turlar(K).forEach((t) => ekle({ t: 'Tür', ad: `${t.f} · ${iki(t.ad).tr}`, alt: iki(t.ad).en, ck: `_tur/${t.id}`, n: `${iki(t.ad).tr} ${iki(t.ad).en} ${t.f} ${(t.ara || []).join(' ')} ${t.id} ${iki(t.sinif).tr} ${iki(t.sinif).en}` }));
    if (tepkimeler(K).length) ekle({ t: 'Kimya', ad: `Tepkimeler · ${tepkimeler(K).length}`, ck: '_tepkime', n: 'tepkimeler reactions kimya' });
    tepkimeler(K).forEach((r) => ekle({ t: 'Tepkime', ad: `${r.id} · ${r.denk}`, alt: iki(r.ad).tr, ck: `_tepkime/${r.id}`, n: `${iki(r.ad).tr} ${iki(r.ad).en} ${r.id} ${r.denk} ${tipAd(r.tip)} ${r.tip || ''}` }));
    donguler(K).forEach((d) => ekle({ t: 'Çevrim', ad: iki(d.ad).tr, alt: iki(d.ad).en, ck: `_dongu/${d.id}`, n: `${iki(d.ad).tr} ${iki(d.ad).en} ${d.id} çevrim döngü cycle` }));
    if (HS(K).length) ekle({ t: 'Hesap', ad: `Hesap laboratuvarı · ${HS(K).length} araç`, ck: '_hesap', n: 'hesap laboratuvarı hesapla calculator' });
    HS(K).forEach((h) => ekle({ t: 'Hesap', ad: iki(h.ad).tr, alt: h.formul, ck: `_hesap/${h.id}`, n: `${iki(h.ad).tr} ${iki(h.ad).en} ${h.formul || ''} ${h.id}` }));
    czKars(K).forEach((x) => ekle({ t: 'Karşılaştır', ad: x.baslik, alt: (x.sutun || []).map((s) => (typeof s === 'string' ? s : s.tr || s.en || '')).join(' · '), ck: `_kars/=${x.id}`, n: `${x.baslik} ${(x.sutun || []).map((s) => (typeof s === 'string' ? s : `${s.tr || ''} ${s.en || ''}`)).join(' ')} karşılaştır fark` }));
    soruSirasi(K).forEach((q) => ekle({ t: 'Soru', ad: `${q.id} · ${q.baslik}`, alt: `PDF s. ${q.pdf_soru ?? '—'}`, soru: q.id, n: `${q.id} ${q.baslik}` }));
    return araDizin;
  }
  function araKapat() { if (!araSonuc) return; araSonuc.hidden = true; araInp.setAttribute('aria-expanded', 'false'); araInp.removeAttribute('aria-activedescendant'); araListe = []; }
  function araYaz() {
    $$('.ck-s', araSonuc).forEach((x, i) => { x.setAttribute('aria-selected', String(i === araSec)); if (i === araSec) { araInp.setAttribute('aria-activedescendant', x.id); x.scrollIntoView({ block: 'nearest' }); } });
  }
  function araSuz() {
    if (arGorunum()) {
      clearTimeout(arZaman);
      arZaman = setTimeout(() => { if (!arGorunum()) return; const v = araInp.value; ckDurum.kPart = `_ara/${v}`; try { history.replaceState(null, '', `#${ckDurum.onEk}/k/_ara/${encodeURIComponent(v)}`); } catch (e) { /* dosya kipi */ } araTamYaz(ckDurum.K, v); }, 140);
      return;
    }
    const q0 = araInp.value.trim(), q = norm(q0);
    if (!q || !ckDurum) { araKapat(); return; }
    // ETK2 DKM: gezinme girdileri (atlas, sözlük, ağ, sınav, bölüm, kimya, hesap laboratuvarı, terimler) ad önekiyle + arama motorunun en iyi sonuçları;
    // açık görünümün türü öne çıkar (Tepkimeler açıkken «ozon» önce tepkimeleri getirir)
    const K = ckDurum.K, one = { _tur: '_tur/', _tepkime: '_tepkime/', _dongu: '_dongu/', _hesap: '_hesap/' }[String(ckDurum.kPart || '').split('/')[0]];
    const NAV = new Set(['Atlas', 'Sözlük', 'Sınav', 'Bölüm', 'Kimya', 'Terimler']);
    const nav = araDizinKur(K).filter((o) => (NAV.has(o.t) || o.ck === '_hesap') && (o.n.startsWith(q) || o.n.includes(q))).slice(0, 3);
    const A = araBul2(K, q0);
    const R = A.L.slice(0, 40), satir = (x) => ({ t: x.o.tl || GRUP_AD[x.o.g] || '', ad: x.o.ad, alt: x.o.alt, ck: x.o.ck, ana: x.o.ana, E: A.E });
    const onde = one ? R.filter((x) => String(x.o.ck || '').startsWith(one)) : [];
    const goruldu = new Set();
    // eski süzgeç (Türkçe harf ve boşluk duyarsız ad içinde) motorun bulamadığını tamamlar
    const eski = R.length >= 9 ? [] : araDizinKur(K).filter((o) => !NAV.has(o.t) && o.ck !== '_hesap' && o.n.includes(q)).slice(0, 9 - R.length);
    const navBas = nav.filter((o) => o.n.startsWith(q)), navIc = nav.filter((o) => !o.n.startsWith(q));
    araListe = [...onde.map(satir), ...navBas, ...R.filter((x) => !onde.includes(x)).map(satir), ...navIc, ...eski]
      .filter((o) => { const a = `${o.ck || o.ana || o.soru}|${o.ad}`; if (goruldu.has(a)) return false; goruldu.add(a); return true; }).slice(0, 12);
    araListe.push({ t: 'Ara', ad: `Tüm sonuçlar: «${q0}» (gruplu, önizlemeli)`, ck: `_ara/${q0}` });
    araSec = 0;
    araSonuc.innerHTML = araListe.map((o, i) => `<div class="ck-s" role="option" id="ck-s-${i}" data-i="${i}" aria-selected="false"><span class="t">${kac(o.t)}</span><span class="a">${o.E ? kesit(o.ad, o.E, 200) : kac(o.ad)}</span>${o.alt ? `<span class="b">${o.E ? kesit(o.alt, o.E, 80) : kac(o.alt)}</span>` : ''}</div>`).join('') + (araListe.length > 1 ? '' : '<p class="yok ck-s-yok">Eşleşen yok. «Tüm sonuçlar» yakın adları ve yazım önerisini gösterir.</p>');
    araSonuc.hidden = false; araInp.setAttribute('aria-expanded', 'true'); araYaz();
  }
  function araGit(o) {
    if (!o || !ckDurum) return;
    if (String(o.ck || '').startsWith('_ara/')) { araKapat(); location.hash = `#${ckDurum.onEk}/k/${o.ck}`; return; }
    araInp.value = ''; araKapat();
    if (ckMod() === 'alt') araInp.blur(); // telefonda sonuç seçilince klavye kapansın
    if (o.ck) location.hash = `#${ckDurum.onEk}/k/${o.ck}`;
    else if (o.ana || o.soru) anaGit(`#${ckDurum.K.id}/${o.ana || o.soru}`, true);
  }
  araInp.addEventListener('input', araSuz);
  araInp.addEventListener('focus', () => {
    // telefonda (alttaki panel) klavye açılınca kutu ve sonuçlar görünür kalsın: panel geçici olarak tam boy
    if (ckMod() === 'alt' && ckDurum && ckBoy < 3) { if (ckBoyOnce === null) ckBoyOnce = ckBoy; ckBoy = 3; boyUygula(); }
    if (ckDurum && terimVar(ckDurum.K) && !(TV[ckDurum.K.id] && TV[ckDurum.K.id].tam)) terimTam(ckDurum.K).then(() => { if (document.activeElement === araInp && araInp.value) araSuz(); });
    if (araInp.value) araSuz();
  });
  araInp.addEventListener('blur', () => setTimeout(() => {
    if (ckBoyOnce === null || document.activeElement === araInp || arGorunum()) return;
    ckBoy = ckBoyOnce; ckBoyOnce = null; boyUygula();
  }, 260));
  araInp.addEventListener('keydown', (e) => {
    if (arGorunum()) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') { const b = $('#ck-ic .ar-sat'); if (b) { e.preventDefault(); arSonYaz(araInp.value); b.focus(); if (e.key === 'Enter' && b.getAttribute('aria-expanded') !== 'true') b.click(); } }
      else if (e.key === 'Escape' && araInp.value) { e.preventDefault(); e.stopPropagation(); araInp.value = ''; araSuz(); }
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { if (!araListe.length) return; e.preventDefault(); araSec = (araSec + (e.key === 'ArrowDown' ? 1 : -1) + araListe.length) % araListe.length; araYaz(); }
    else if (e.key === 'Enter') { e.preventDefault(); araGit(araListe[araSec]); }
    else if (e.key === 'Escape') { if (araInp.value || !araSonuc.hidden) { e.preventDefault(); e.stopPropagation(); araInp.value = ''; araKapat(); } }
  });
  araSonuc.addEventListener('mousedown', (e) => e.preventDefault());
  araSonuc.addEventListener('click', (e) => { const x = e.target.closest('.ck-s'); if (x) araGit(araListe[+x.dataset.i]); });
  document.addEventListener('click', (e) => { if (!araSonuc.hidden && !e.target.closest('.ck-ust')) araKapat(); });

  $('#ck-geri').addEventListener('click', () => history.back());
  $('#ck-ileri').addEventListener('click', () => history.forward());
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-git]'); if (b) { e.preventDefault(); location.hash = b.dataset.git; } });
  document.addEventListener('keydown', (e) => {
    const yaziyor = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
    if (e.key === 'Escape') {
      if (ipAcik()) { const h = ipHedef; ipKapat(); h?.focus?.(); return; }
      if (ckDurum) { location.hash = `#${ckDurum.onEk}`; return; }
    }
    if (yaziyor) return;
    if (ckDurum && (e.key === '[' || e.key === ']') && !e.metaKey) { const kp = kavramKomsu(e.key === ']' ? 1 : -1); if (kp) { e.preventDefault(); location.hash = `#${ckDurum.onEk}/k/${kp}`; } return; }
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (ckDurum && (!ckAnaGorunur() || ck.contains(document.activeElement))) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const a = takipBag(e.key === 'ArrowLeft' ? -1 : 1); if (a) anaGit(a.getAttribute('href')); }
  });

  /* ---------- tam ekran: sade okuma, tek ince üst şerit ---------- */
  const H = document.documentElement;
  const hud = document.createElement('div');
  hud.className = 'hud'; hud.id = 'hud'; hud.hidden = true;
  hud.innerHTML = '<div class="hud-ic"><button type="button" data-k="ic" aria-label="İçindekiler" title="İçindekiler (T)"><svg class="hs" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01"/></svg><span class="he">İçindekiler</span></button><button type="button" data-k="once" aria-label="Önceki soru" title="Önceki soru"><svg class="hs" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button><span class="hud-ad" aria-live="polite"><span class="hud-ders"></span><span class="hud-kisa"></span></span><button type="button" data-k="sonra" aria-label="Sonraki soru" title="Sonraki soru"><svg class="hs" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button><button type="button" data-k="kalem" aria-pressed="false" aria-label="Kalem" title="Kalem (P)"><svg class="hs" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg><span class="he">Kalem</span></button><a data-k="pdf" target="_blank" rel="noopener" aria-label="PDF" title="PDF"><svg class="hs" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M8.5 13h7M8.5 16.5h4.5"/></svg><span class="he">PDF</span></a><button type="button" data-k="kapat" aria-label="Tam ekranı kapat" title="Kapat (Esc)"><svg class="hs" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg><span class="he">Kapat</span></button></div>';
  document.body.appendChild(hud);
  let tamMi = false, hudZaman = 0;
  const takipBag = (yon) => $(`.takip .${yon < 0 ? 'tk-once' : 'tk-sonra'}`); // ‹ önceki · sonraki › (telefonda da çubukta)
  function hudYaz() {
    if (!tamMi) return;
    const t = $('#soru-h') || $('main h1'), no = $('.soru-ust .no');
    const nt = no ? no.textContent : '', ki = nt.lastIndexOf('·');
    $('.hud-ders', hud).textContent = ki > 0 ? nt.slice(0, ki).trim() + ' · ' : '';
    $('.hud-kisa', hud).textContent = (ki > 0 ? nt.slice(ki + 1).trim() : nt) + (t ? (nt ? ' · ' : '') + t.textContent : '');
    $('[data-k=once]', hud).disabled = !takipBag(-1); $('[data-k=sonra]', hud).disabled = !takipBag(1);
    const pdf = $('.takip .tk-pdf'); const hp = $('[data-k=pdf]', hud); if (pdf) { hp.href = pdf.href; hp.hidden = false; } else hp.hidden = true;
  }
  // 3 sn sonra sade hap (simgeler + kısa başlık); imleç üste gelince, dokununca ya da klavyeyle açılır
  function hudSadele() {
    const ic = $('.dizin details.ic'), ustte = matchMedia('(hover:hover)').matches && hud.matches(':hover');
    if (tamMi && !(ic && ic.open) && !ustte && !hud.querySelector(':focus-visible') && !ckDurum) hud.classList.add('sakin');
    else if (tamMi) hudZaman = setTimeout(hudSadele, 1500);
  }
  function hudGoster() {
    if (!tamMi) return;
    hud.classList.remove('sakin'); clearTimeout(hudZaman);
    hudZaman = setTimeout(hudSadele, 3000);
  }
  // kalem: tam ekranla birlikte; çizgiler soru (rota) başına ayrı
  const kalem = () => window.__kalem;
  window.__kalemKolon = () => ana;
  window.__kalemAnahtar = () => location.hash.split('/k/')[0];
  document.addEventListener('kalem', (e) => { const b = $('[data-k=kalem]', hud); if (b) b.setAttribute('aria-pressed', String(!!(e.detail && e.detail.acik))); });
  window.__hudGoster = hudGoster;
  function tamAc() {
    if (tamMi) return;
    tamMi = true; H.classList.add('tam'); hud.hidden = false;
    const ic = $('.dizin details.ic'); if (ic) ic.open = false;
    if (H.requestFullscreen && !document.fullscreenElement) H.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
    requestAnimationFrame(() => { hudYaz(); hudGoster(); if (kalem()) kalem().goster(true); });
  }
  function tamKapat() {
    if (!tamMi) return;
    tamMi = false; H.classList.remove('tam'); hud.hidden = true; hud.classList.remove('sakin'); clearTimeout(hudZaman);
    if (kalem()) kalem().goster(false);
    const ic = $('.dizin details.ic'); if (ic) ic.open = icAcik;
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  }
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && tamMi) tamKapat(); });
  const icCevir = () => { const ic = $('.dizin details.ic'); if (ic) ic.open = !ic.open; };
  hud.addEventListener('click', (e) => {
    const b = e.target.closest('[data-k]'); if (!b) return;
    const k = b.dataset.k;
    if (k === 'ic') icCevir();
    else if (k === 'once' || k === 'sonra') { const a = takipBag(k === 'once' ? -1 : 1); if (a) anaGit(a.getAttribute('href')); }
    else if (k === 'kapat') tamKapat();
    else if (k === 'kalem' && kalem()) kalem().cevir();
    hudGoster();
  });
  hud.addEventListener('pointerenter', hudGoster);
  hud.addEventListener('pointerdown', hudGoster);
  hud.addEventListener('focusin', hudGoster);
  document.addEventListener('click', (e) => {
    if (e.target.closest('.tam-ac')) { tamAc(); return; }
    if (!tamMi) return;
    const ic = $('.dizin details.ic');
    if (ic && ic.open && (e.target.closest('.dizin a') || (!ic.contains(e.target) && !hud.contains(e.target)))) ic.open = false;
  });
  // imleç üst kenara yaklaşınca açılır; dokunmatikte içeriğe kısa dokunuş açar (parmakla çekme ve çizim açmaz)
  addEventListener('mousemove', (e) => { if (tamMi && e.clientY < 72) hudGoster(); }, { passive: true });
  let dokun = null;
  addEventListener('pointerdown', (e) => { dokun = e.pointerType === 'mouse' ? null : { x: e.clientX, y: e.clientY, t: Date.now() }; }, { passive: true });
  addEventListener('pointerup', (e) => {
    const b = dokun; dokun = null;
    if (!tamMi || !b || Date.now() - b.t > 350 || Math.abs(e.clientX - b.x) + Math.abs(e.clientY - b.y) > 12) return;
    if (e.target.closest && e.target.closest('a,button,summary,input,textarea,select,.kalem-katman,.kalem-panel,.en-ip')) return;
    hudGoster();
  }, { passive: true });
  new MutationObserver(() => { hudYaz(); }).observe(ana, { childList: true });
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) return;
    const k = e.key;
    if ((k === 'f' || k === 'F') && !ckDurum) { e.preventDefault(); if (tamMi) tamKapat(); else tamAc(); return; }
    if (!tamMi || ckDurum) return;
    if (k === 'Escape' || k === 't' || k === 'T' || k === 'Tab') hudGoster();
    if (k === 'Escape') { e.preventDefault(); const ic = $('.dizin details.ic'); if (ic && ic.open) ic.open = false; else tamKapat(); }
    else if (k === 't' || k === 'T') { e.preventDefault(); icCevir(); }
  });
  window.__okuma = { ac: tamAc, kapat: tamKapat, durum: () => ({ tam: tamMi, hud: !hud.hidden && !hud.classList.contains('sakin'), ic: !!$('.dizin details.ic')?.open, soru: location.hash }) };

  /* ---------- yönlendirme ---------- */
  let sonSayfa = '';
  async function yonlendir() {
    const h = decodeURIComponent(location.hash.slice(1));
    const [onEk, kPart] = h.split('/k/');
    const parca = onEk.split('/');
    const kitapId = parca[0];
    document.body.classList.toggle('kitapta', !!kitapId);
    if (!kitapId && GOMULU && (window.DK_KATALOG || [])[0]) { location.replace(`#${window.DK_KATALOG[0].id}/k/_ara`); return; }
    if (!kitapId) { cekmeceKapat(); sonSayfa = ''; return kitaplik(); }
    let K;
    try { K = await yukle(kitapId); } catch (e) { ana.innerHTML = `<p>Bu kitap bulunamadı. <a href="#">Kitaplığa dön</a></p>`; return; }
    simdiK = K;
    sinavYukle(K);
    if (GOMULU) { sonSayfa = onEk; if (!kPart) { location.replace(`#${onEk}/k/_ara`); return; } ckGoster(K, kPart, onEk); gomuluBildir(); return; }
    const sayfa = onEk;
    const ayniSayfa = sayfa === sonSayfa;
    if (!ayniSayfa) { sabitBirak(); sbEkYaz(0); SB.son = null; }
    if (sayfa !== sonSayfa) {
      sonSayfa = sayfa;
      if (parca[1] === 'kavram' || parca[1] === 'atlas') atlasSayfa(K);
      else if (parca[1] === 'bol') bolumGoster(K, parca[2]);
      else if (parca[1] === 'akis') { akisGoster(K, parca[2] || ''); if (parca[2]) { sonSayfa = sayfa; return kPart ? ckGoster(K, kPart, onEk) : cekmeceKapat(); } }
      else {
        const sid = parca[1] || oku(`dk:son:${K.id}`);
        const am = /^a(\d+)$/.exec(parca[2] || ''), om = /^o(\d+)$/.exec(parca[2] || '');
        if (am) acikAdim[`${K.id}/${sid}`] = +am[1];
        if (om) oynAdim[`${K.id}/${(K.sorular[sid] || soruSirasi(K)[0]).id}`] = +om[1];
        cozZorla = am ? 'liste' : om ? 'oyn' : ''; // #…/S10/a3 → liste görünümünde 3. adım · #…/S10/o2 → oynatıcıda 2. adım
        soruGoster(K, K.sorular[sid] || soruSirasi(K)[0]);
        cozZorla = '';
        if (parca[2] === 'yol' || parca[2] === 'oz') { const y = $('#yol', ana); if (y) katKapa(y, false); }
        if (am || om || parca[2] === 'yol' || parca[2] === 'oz') {
          const hedef = $(am ? `#a${am[1]}` : om ? ($('#oyn .oyn-a.simdi', ana) || $('#oyn', ana) ? '#oyn' : '#adimlar') : parca[2] === 'oz' ? ($('#oz') ? '#oz' : '#yol') : '#yol');
          if (hedef) { hedef.classList.add('vurgu'); setTimeout(() => hedefeOtele(hedef, om && hedef.id === 'oyn' ? $('#coz-h', ana) : null), 60); sonSayfa = sayfa; return kPart ? ckGoster(K, kPart, onEk) : cekmeceKapat(); }
        }
      }
      window.scrollTo({ top: 0 });
    }
    if (ayniSayfa && (kPart || ckDurum)) sbPanel();
    if (kPart) ckGoster(K, kPart, onEk);
    else cekmeceKapat();
  }
  /* ---------- ETK4 BALON (27 Kas): gömülü kip — ders-kitapligi/?gomulu=1#<kitap>/k/<görünüm> ----------
     Site geneli arama balonu (../ortak/ara-balon.js) bu sayfayı iframe'de açar: yalnız çekmece (arama, kavram, terim, sözlük,
     mercekler, pusula); üst çubuk, kitap akışı, tutamak yok. Ana sayfaya giden bağ (soru, bölüm, akış, başka alt site) üst
     pencerede açılır (postMessage {ab:'git'}), çekmece içi bağlar iframe'de kalır. Esc → üst pencere balonu kapatır.
     Kanca: window.__dkGomulu = { ara(q), git(kitap, kp), kitap(), ilk(), odak(), geri() }. */
  function gomuluBildir() {
    if (!GOMULU || window.parent === window || !ckDurum) return;
    try { window.parent.postMessage({ ab: 'durum', kitap: ckDurum.K.id, kp: ckDurum.kPart, baslik: (($('#ck-baslik') || {}).textContent || '').slice(0, 120) }, location.origin); } catch (e) { /* yok */ }
  }
  function gomuluDis(url, yeni) {
    const u = new URL(url, location.href); u.searchParams.delete('gomulu');
    if (window.parent !== window) { try { window.parent.postMessage({ ab: 'git', url: u.href, yeni: !!yeni }, location.origin); return; } catch (e) { /* yok */ } }
    location.href = u.href;
  }
  if (GOMULU) {
    document.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button) return;
      const s = e.target.closest('[data-soru],[data-ana]'), g = e.target.closest('[data-git]'), a = e.target.closest('a[href]');
      let hedef = null;
      if (s && ckDurum) hedef = `#${ckDurum.K.id}/${s.dataset.soru || s.dataset.ana}`;
      else if (g && !String(g.dataset.git).includes('/k/')) hedef = g.dataset.git;
      else if (a && !s && !g) { const h = a.getAttribute('href') || ''; if (h.startsWith('#')) { if (!h.includes('/k/')) hedef = h; } else if (a.target !== '_blank') hedef = a.href; }
      if (!hedef) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (hedef.startsWith('#')) { const kp = ckDurum ? ckDurum.kPart : ''; hedef = `${location.pathname}${hedef}${kp && !/^_ara(\/|$)/.test(kp) ? '/k/' + kp : ''}`; }
      gomuluDis(hedef, e.ctrlKey || e.metaKey);
    }, true);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); try { window.parent.postMessage({ ab: 'kapat' }, location.origin); } catch (x) { /* yok */ } }
      else if ((e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName)) || ((e.ctrlKey || e.metaKey) && /^k$/i.test(e.key))) { e.preventDefault(); e.stopImmediatePropagation(); try { window.parent.postMessage({ ab: 'odak' }, location.origin); } catch (x) { /* yok */ } }
    }, true);
    window.__dkGomulu = {
      ara: (q) => { const K = simdiK || (window.DK_KATALOG || [])[0]; if (!K) return; const h = `#${K.id}/k/_ara${q ? '/' + q : ''}`; let su = location.hash; try { su = decodeURIComponent(su); } catch (e) { /* bozuk */ } if (su !== h) location.replace(location.href.split('#')[0] + h); }, // mutlak adres: göreli adres çağıran (üst) pencereye göre çözülür
      git: (kitap, kp) => { location.replace(location.href.split('#')[0] + `#${kitap}/k/${kp}`); },
      kitap: () => (simdiK ? simdiK.id : null),
      ilk: () => { const a = $('#ck-ic .ar-sat'); if (a) a.click(); return !!a; },
      odak: () => { const a = $('#ck-ic .ar-sat'); if (a) a.focus({ preventScroll: false }); return !!a; },
      geri: () => history.back(),
    };
    window.addEventListener('hashchange', () => setTimeout(gomuluBildir, 60));
  }
  window.addEventListener('hashchange', yonlendir);
  yonlendir();
})();
