/* Ders Kitaplığı — kitaplık, PDF ile eş zamanlı soru görünümü, konu çekmecesi.
   Adres biçimi (hepsi paylaşılabilir, tarayıcının Geri tuşu çalışır):
     #                         kitaplık
     #mto342e                  kitabın son bakılan sorusu
     #mto342e/S3               soru
     #mto342e/bol/K1-THETA-TV  bölümün konu sayfaları
     #mto342e/S3/k/theta/ispat soru açıkken konu çekmecesi (kavram · parça)
     #mto342e/S3/k/_atlas      çekmecede kitabın atlası (· /k/_bol/<id> bölüm · /k/_sozluk[/<en>[~<en2>]] sözlük)  */
(function () {
  const $ = (s, k = document) => k.querySelector(s);
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
  const kavramBul = (K, id) => (K.kavramlar || []).find((k) => k.id === id);

  /* ---------- kitaplık ---------- */
  function kitaplik() {
    document.title = 'Ders Kitaplığı · Atmosfer Akademisi';
    const kat = window.DK_KATALOG || [];
    ana.innerHTML = `<p class="kod" style="color:var(--acc);font-weight:700;letter-spacing:.06em;font-size:14px;margin:0">BU DÖNEMİN METEOROLOJİ DERSLERİ</p>
      <h1>Ders Kitaplığı</h1>
      <p class="alt">reMarkable'daki soru-çözüm kitaplarının çevrimiçi eşi. PDF'te hangi sayfadaysan buraya o sayfayı yaz: aynı soru açılır. Her çözüm adımının altındaki düğmelerle o adımdaki kavramın <b>tanımına, diyagramına, formülündeki terimlere, türetimine, animasyonuna ve koduna</b> tek tıkla geçersin; «← Soruya dön» seni hep geri getirir.</p>
      <div class="kitaplar">${kat.map((k) => `<article class="kitap"><span class="kod">${kac(k.kod)} · ${kac(k.sinav)}</span><h2>${kac(k.ad)}</h2>
        <span class="sayi">${k.soru} soru · PDF ${k.pdf_sayfa} sayfa · ${k.kavram ? `${k.kavram} kavram` : 'kavram atlası hazırlanıyor'}</span>
        <div class="dugmeler"><a class="dugme" href="#${k.id}">Eş zamanlı takip</a><a class="dugme ikincil" href="${kac(k.pdf)}" target="_blank" rel="noopener">PDF'i aç ↗</a>${k.id === 'mto302e' ? '<a class="dugme ikincil" href="../sinoptik-brifing/#soru-cozum">Katmanlı haritalar ↗</a>' : ''}</div></article>`).join('')}
        ${kat.some((k) => k.id === 'mto302e') ? '' : `<article class="kitap"><span class="kod">MTO302E · HARİTA ANALİZİ</span><h2>Sinoptik soru çözümleri</h2><span class="sayi">9 soru · adım adım katmanlı çözüm, kendi haritalarımızla</span>
        <div class="dugmeler"><a class="dugme" href="../sinoptik-brifing/#soru-cozum">Etkileşimli çözüm</a><a class="dugme ikincil" href="pdf/MTO302E_SORU-COZUM.pdf" target="_blank" rel="noopener">PDF'i aç ↗</a></div></article>`}
      </div>
      <section class="nasil"><h2>Nasıl kullanılır?</h2><ol>
        <li><b>PDF ile yan yana:</b> kitabı reMarkable'da aç, burada aynı kitabın «Eş zamanlı takip»ine gir. Üstteki kutuya PDF sayfa numarasını (ör. <b>37</b>) ya da soru numarasını (<b>S12</b>) yaz.</li>
        <li><b>Önce kendin çöz:</b> çözüm kapalı gelir; «1. adımı aç» ile tek tek aç, takıldığın adımda dur.</li>
        <li><b>Takıldığın kavrama git:</b> adımın altındaki mavi şeritte «Tanım · Diyagram · Formül · Türetim · Animasyon · Kod» düğmeleri var. Sayfa değişmez, yandan konu paneli açılır.</li>
        <li><b>Kaybolma:</b> panelin üstünde nerede olduğun yazar; «← Soruya dön» seni soruya, ‹ › bir önceki/sonraki konuya götürür. Adres çubuğundaki bağlantı tam o noktayı gösterir.</li></ol></section>`;
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
    return `<details class="ic" ${icAcik && !tam ? 'open' : ''}><summary>İçindekiler <span class="say">(${say})</span></summary><div class="dizin-ic">${K.bolumler.map((b) => {
      const sorular = b.ogeler.filter((o) => o.tur === 'soru').map((o) => K.sorular[o.id]).filter(Boolean);
      const konu = b.ogeler.some((o) => o.tur !== 'soru');
      const burada = simdi === 'bol/' + b.id || sorular.some((q) => q.id === simdi);
      return bl(K.id + '/' + b.id, kac(bolumAd(K, b)), sorular.length, `${konu ? `<a href="#${K.id}/bol/${b.id}" class="${simdi === 'bol/' + b.id ? 'simdi' : ''}">Konu özeti ve formüller<span class="pdf"></span></a>` : ''}${sorular.map((q) => `<a href="#${K.id}/${q.id}" class="${simdi === q.id ? 'simdi' : ''}" ${simdi === q.id ? 'aria-current="page"' : ''}><span>${q.id} · ${kac(q.baslik)}</span><span class="pdf">s. ${q.pdf_soru ?? '—'}</span></a>`).join('')}`, burada);
    }).join('')}${(K.kavramlar || []).length ? bl(K.id + '/kavram', 'Kavram atlası', K.kavramlar.length, `<a href="#${K.id}/${simdi ? simdi + '/' : ''}k/_atlas" class="atlas-ac"><span>Atlası ve sözlüğü yan çekmecede aç</span><span class="pdf">›</span></a>` + K.kavramlar.map((k) => `<a href="#${K.id}/${simdi ? simdi + '/' : ''}k/${k.id}/tanim"><span>${kac(k.sembol)} · ${kac(k.ad)}</span><span class="pdf">${k.sorular.length} soru</span></a>`).join(''), false) : ''}</div></details>`;
  }
  function takipHTML(K, q) {
    const sira = soruSirasi(K), i = q ? sira.indexOf(q) : -1;
    return `<div class="takip"><label for="git">PDF sayfası ya da soru</label><input id="git" inputmode="text" placeholder="37 ya da S12" autocomplete="off">
      <span class="bilgi" id="git-bilgi">${q ? `PDF'te: soru s. <b>${q.pdf_soru ?? '—'}</b> · çözüm s. <b>${q.pdf_cozum ?? '—'}</b>` : `${kac(K.kod)} · ${K.pdf_sayfa} sayfa`}</span>
      <span class="sag">${i > 0 ? `<a class="kucuk" href="#${K.id}/${sira[i - 1].id}">‹ ${sira[i - 1].id}</a>` : ''}${i >= 0 && i < sira.length - 1 ? `<a class="kucuk" href="#${K.id}/${sira[i + 1].id}">${sira[i + 1].id} ›</a>` : ''}<button type="button" class="kucuk atlas-dugme" data-git="#${kac(decodeURIComponent(location.hash.slice(1)).split('/k/')[0] || K.id)}/k/_atlas" title="Kavram atlası ve sözlük (yan çekmecede)">Atlas</button><a class="kucuk" href="${kac(K.pdf)}" target="_blank" rel="noopener">PDF ↗</a><button type="button" class="kucuk tam-ac" title="Tam ekran (F)">Tam ekran</button></span></div>`;
  }
  function bagHTML(K, idler, qid) {
    const benzersiz = [...new Set(idler || [])].map((id) => kavramBul(K, id)).filter(Boolean);
    if (!benzersiz.length) return '';
    return `<div class="baglar">${benzersiz.map((k) => `<div class="bag"><b>${kac(k.sembol)} · ${kac(k.ad)}</b>${PARCA.filter(([p]) => k.parcalar && k.parcalar[p]).map(([p, ad]) => `<button type="button" data-git="#${K.id}/${qid}/k/${k.id}/${p}">${ad}</button>`).join('')}</div>`).join('')}</div>`;
  }
  function yolHTML(K, q) {
    const R = q.rehber;
    return `<section class="yol" id="yol" aria-labelledby="yol-h"><h2 id="yol-h">Yol haritası ${q.pdf_yol ? `<small class="yok">PDF s. ${q.pdf_yol}</small>` : ''}</h2>
      <p><b>Ne istiyor?</b> ${R.istiyor}</p><p><b>Soru tipi:</b> ${kac(R.tip)}</p>
      ${R.kalip.length ? `<p class="yol-alt">Soruda bu ifadeyi görünce:</p><ul class="kalip">${R.kalip.map((k) => `<li><span class="en-k" lang="en">${kac(k.en)}</span> → ${kac(k.tr)}${k.ipucu ? ` · <b>${kac(k.ipucu)}</b>` : ''}</li>`).join('')}</ul>` : ''}
      ${(R.eslesme || []).length ? `<details class="esles"><summary>Sorudan formüle: hangi ifadeden ne anladık?</summary><p class="yol-alt">Soru metnindeki altı çizili ifadelere dokun (bilgisayarda imleci üstüne getir): ne anlaşıldığı ve formülde nereye girdiği açılır.</p><div class="tablo-kap"><table class="esles-t"><thead><tr><th>Sorudaki ifade</th><th>Ne anladık?</th><th>Formülde</th></tr></thead><tbody>${R.eslesme.map((e) => `<tr><td><span class="es-k">${kac(e.ifade)}</span></td><td>${kac(e.anlam)}</td><td><b>${kac(e.sembol)}</b>${e.deger ? ` = ${kac(e.deger)}` : ''}</td></tr>`).join('')}</tbody></table></div></details>` : ''}
      <details><summary>Verilenler ne demek?</summary><ul>${R.veriler.map((v) => `<li><b>${kac(v.ne)}</b> → ${kac(v.anlam)}</li>`).join('')}</ul></details>
      ${R.formul.length ? `<details><summary>Hangi formül, neden?</summary>${R.formul.map((f) => `<p><b>${kac(f.ad)}</b> — ${f.neden}</p>${f.tex}${f.terimler.length ? `<ul class="terim">${f.terimler.map((t) => `<li><b>${kac(t[0])}</b>: ${kac(t[1])}</li>`).join('')}</ul>` : ''}${bagHTML(K, f.kavram ? [f.kavram] : [], q.id)}`).join('')}</details>` : ''}
      ${R.kural ? `<p><b>Kullanılacak bilgi:</b> ${R.kural}</p>` : ''}
      <p class="plan"><b>Plan:</b> ${R.adimlar.map((a, i) => `<a href="#${K.id}/${q.id}/a${i + 1}">${i + 1} · ${kac(a.kisa)}</a>`).join(' → ')}</p>
      ${R.tuzak ? `<p class="tuzak"><b>Tuzak:</b> ${R.tuzak}</p>` : ''}
      ${(R.oz || []).length ? `<div class="oz-cozum" id="oz"><h3>Sınav kâğıdına yaz — en kısa çözüm</h3><ol>${R.oz.map((x) => `<li>${x}</li>`).join('')}</ol></div>` : ''}</section>`;
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
    const w = document.createTreeWalker(kok, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement.closest('svg,button,code,pre,.en-ip,summary,.dizin,.takip,a,.es,.kr,.dil-terim,.ip-kart,.sz-kart,.kendin') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
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
    const R = q.rehber, n = R ? R.adimlar.length : (q.adimlar || []).length;
    ana.innerHTML = `<div class="kitap-yer"><nav class="dizin" aria-label="Bölümler ve sorular">${dizinHTML(K, q.id)}</nav><div>
      ${takipHTML(K, q)}
      <article class="soru-kart" aria-labelledby="soru-h"><div class="soru-ust"><span class="no">${kac(K.kod)} · ${q.id}</span><span class="pdf-etiket">PDF s. ${q.pdf_soru ?? '—'}</span></div>
      <h1 id="soru-h">${kac(q.baslik)}</h1>
      <div class="soru-govde">${q.soru || ''}</div>
      ${q.ipucu ? `<details class="ipucu"><summary>İpucu</summary>${q.ipucu}</details>` : ''}
      ${R ? yolHTML(K, q) : ''}
      <h2 style="margin-top:22px">Çözüm <small class="yok" style="font-size:15px;font-weight:500">PDF s. ${q.pdf_cozum ?? '—'} · ${n} adım</small></h2>
      ${q.giris ? `<div id="cozum-giris" hidden>${q.giris}</div>` : ''}
      <ol class="adimlar${R ? ' rehberli' : ''}" id="adimlar">${R ? R.adimlar.map((a, i) => rehberAdim(K, q, a, i)).join('') : (q.adimlar || []).map((a, i) => `<li data-i="${i}" hidden>${a.html}${bagHTML(K, a.kavram, q.id)}</li>`).join('')}</ol>
      <div class="cozum-bas"><button type="button" class="dugme" id="adim-ac">1. adımı aç</button><button type="button" class="dugme ikincil" id="hepsi">Hepsini aç</button><button type="button" class="kucuk" id="kapat" hidden>Çözümü kapat</button></div>
      <div id="cozum-son" hidden>${R ? `<details class="pdf-metin"><summary>PDF'teki çözüm metni (aynı sayılar)</summary>${q.giris || ''}${(q.adimlar || []).map((a) => a.html).join('')}</details>` : ''}${q.oz ? `<div class="oz"><b>Öz:</b> ${q.oz.replace(/^<p>|<\/p>$/g, '')}</div>` : ''}
      ${q.kod ? `<details class="kod-kutu"><summary>Bu sonucu hesaplayan Python kodu</summary><pre class="kod">${kac(q.kod).split('\n').map((s, i) => `<span class="sat"><span class="no">${i + 1}</span>${s}</span>`).join('')}</pre></details>` : ''}
      ${(q.kavram || []).length ? `<h3>Bu sorudaki kavramlar</h3>${bagHTML(K, q.kavram, q.id)}` : `<p class="yok">Bu sorunun kavram bağları hazırlanıyor; kitabın bölüm özetine <a href="#${K.id}/bol/${q.bolum}">buradan</a> bakabilirsin.</p>`}</div>
      </article></div></div>`;
    texDoldur(ana, K);
    dilSoruEkle(K, q);
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
    btn.addEventListener('click', () => { const m = (acikAdim[`${K.id}/${q.id}`] || 0) + 1; goster(m, true); lis[m - 1]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
    $('#hepsi').addEventListener('click', () => goster(n, true));
    $('#kapat').addEventListener('click', () => goster(0, false));
    takipBagla(K);
  }
  function bolumGoster(K, bid) {
    const b = K.bolumler.find((x) => x.id === bid);
    if (!b) return soruGoster(K, soruSirasi(K)[0]);
    document.title = `${bolumAd(K, b)} · ${K.kod}`;
    const kv = (K.kavramlar || []).filter((k) => k.bolum === bid);
    ana.innerHTML = `<div class="kitap-yer"><nav class="dizin" aria-label="Bölümler ve sorular">${dizinHTML(K, 'bol/' + bid)}</nav><div>${takipHTML(K, null)}
      <h1>${kac(bolumAd(K, b))}</h1>
      ${kv.length ? `<h3>Bu bölümün kavramları</h3>${bagHTML(K, kv.map((k) => k.id), 'bol-' + bid)}` : ''}
      ${b.ogeler.filter((o) => o.tur !== 'soru').map((o) => `<section class="konu-sayfa"><h3>${kac(o.baslik)}</h3>${o.html}${o.oz ? `<div class="oz"><b>Öz:</b> ${o.oz.replace(/^<p>|<\/p>$/g, '')}</div>` : ''}</section>`).join('')}
      <h3>Bu bölümün soruları</h3><div class="ilgili">${b.ogeler.filter((o) => o.tur === 'soru').map((o) => `<a class="soru-bag" href="#${K.id}/${o.id}">${o.id} · ${kac(K.sorular[o.id]?.baslik)}</a>`).join('')}</div></div></div>`;
    texDoldur(ana, K);
    $$('.bag button', ana).forEach((bt) => { bt.dataset.git = bt.dataset.git.replace(`/bol-${bid}/`, '/'); });
    takipBagla(K);
  }
  function takipBagla(K) {
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
  const parcaVar = (K, k, p) => p === 'sorular' || (p === 'dil' ? !!dilK(K, k.id) : !!(k.parcalar && k.parcalar[p]));
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
      const li = D.kalip.map((k) => `<li class="kalip-dil"><span class="en-k" lang="en">${kac(k.en)}</span> → ${kac(k.tr)}${k.ipucu ? ` · <b>${kac(k.ipucu)}</b>` : ''}</li>`).join('');
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
    const kv = (s.kavram || []).map((id) => kavramBul(K, id)).filter(Boolean);
    ipKart.innerHTML = `<div class="ip-bas"><b lang="en">${kac(s.en)}</b>${s.tur ? `<span class="tur">${kac(s.tur)}</span>` : ''}${s.oku ? `<span class="oku">${kac(s.oku)}</span>` : ''}${s.ipa ? `<span class="ipa" lang="en">/${kac(s.ipa)}/</span>` : ''}<button type="button" class="ip-x" aria-label="Kapat">×</button></div>
      <p class="ip-tr"><i>${kac(s.tr)}</i></p>${(s.es || []).length ? `<p><span class="yok">Birlikte:</span> <span lang="en">${s.es.map(kac).join(' · ')}</span></p>` : ''}
      ${s.fark ? `<p class="sz-fark"><b>Fark:</b> ${kac(s.fark)}</p>` : ''}${s.ornek ? ciftHTML(s.ornek) : ''}
      <div class="ip-dug">${(s.bak || []).map((b) => git(`_sozluk/${s.en}~${b}`, `Karşılaştır: <span lang="en">${kac(b)}</span>`)).join('')}${kv.map((k) => git(`${k.id}/tanim`, `Kavrama git: ${kac(k.sembol)} · ${kac(k.ad)}`)).join('')}${git(`_sozluk/${s.en}`, 'Sözlükte aç')}</div>`;
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
  const ustSekme = (K, sec) => [['_atlas', 'Atlas', 'atlas'], ['_sozluk', `Sözlük (${(K.sozluk || []).length})`, 'sozluk']].map(([kp, ad, id]) => `<button type="button" role="tab" aria-selected="${sec === id}" data-ck="${kp}">${ad}</button>`).join('');
  function soruCip(K, sid, uzun) {
    const q = K.sorular[sid]; if (!q) return '';
    const simdi = ckDurum && ckDurum.qid === sid, s = simdi ? ' simdi' : '', ac = simdi ? ' aria-current="page"' : '';
    return uzun ? `<a class="soru-bag${s}" href="#${K.id}/${sid}" data-soru="${sid}"${ac}>${sid} · ${kac(q.baslik)} <span class="yok">s. ${q.pdf_soru ?? '—'}</span></a>`
      : `<a class="soru-cip${s}" href="#${K.id}/${sid}" data-soru="${sid}" title="${kac(q.baslik)} · PDF s. ${q.pdf_soru ?? '—'}" aria-label="${sid} · ${kac(q.baslik)}"${ac}>${sid}</a>`;
  }
  const kavramSatir = (K, k) => `<li>${ckBag(`${k.id}/tanim`, `<span class="sem">${kac(k.sembol)}</span><span class="ad">${kac(k.ad)}</span>${k.en ? `<span class="en" lang="en">${kac(k.en)}</span>` : ''}${dilK(K, k.id) ? '<span class="dil-rozet" title="TR ↔ EN katmanı var">TR↔EN</span>' : ''}`, 'kv-sat')}</li>`;
  const bolumSorulari = (K, b) => b.ogeler.filter((o) => o.tur === 'soru').map((o) => o.id).filter((id) => K.sorular[id]);

  function atlasCk(K, ayni) {
    kirintiYaz(K, [['Kavram atlası', null]]);
    $('#ck-baslik').innerHTML = `${kac(K.kod)} · kavram atlası<small>${kac(K.ad)} · ${(K.kavramlar || []).length} kavram · ${Object.keys(K.sorular).length} soru</small>`;
    $('#ck-sira').innerHTML = ''; $('#ck-sekme').innerHTML = ustSekme(K, 'atlas');
    if (ayni) return;
    ckIc.innerHTML = `<p class="ck-not">Bir bölüme, kavrama ya da soruya dokun; çekmece açık kalır. Kavram satırı: sembol · Türkçe ad · İngilizce ad.</p>${K.bolumler.filter((b) => bolumDolu(K, b)).map((b) => {
      const kv = (K.kavramlar || []).filter((k) => k.bolum === b.id), sq = bolumSorulari(K, b);
      return `<section class="at-bol"><h3>${ckBag(`_bol/${b.id}`, kac(bolumAd(K, b)))} <span class="say">${kv.length} kavram · ${sq.length} soru</span></h3>${kv.length ? `<ul class="kv-liste">${kv.map((k) => kavramSatir(K, k)).join('')}</ul>` : ''}${sq.length ? `<div class="soru-cipler"><span class="yok">Sorular:</span> ${sq.map((s) => soruCip(K, s)).join('')}</div>` : ''}</section>`;
    }).join('')}`;
  }
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
    const kv = (s.kavram || []).map((id) => kavramBul(K, id)).filter(Boolean);
    return `<article class="sz-kart"><h3><span lang="en">${kac(s.en)}</span> ${s.tur ? `<span class="tur">${kac(s.tur)}</span>` : ''}</h3>
      ${s.oku || s.ipa ? `<p class="oku-sat">${s.oku ? `<span class="oku">${kac(s.oku)}</span>` : ''}${s.ipa ? ` <span class="ipa" lang="en">/${kac(s.ipa)}/</span>` : ''}</p>` : ''}
      <p class="sz-tr"><i>${kac(s.tr)}</i></p>
      ${(s.es || []).length ? `<p><span class="yok">Birlikte kullanılır:</span> <span lang="en">${s.es.map(kac).join(' · ')}</span></p>` : ''}
      ${s.fark ? `<p class="sz-fark"><b>Fark:</b> ${kac(s.fark)}</p>` : ''}${s.ornek ? ciftHTML(s.ornek) : ''}
      ${(s.bak || []).length ? `<p class="sz-dug"><span class="yok">Karşılaştır:</span> ${s.bak.map((x) => ckBag(`_sozluk/${s.en}~${x}`, `<span lang="en">${kac(s.en)} ↔ ${kac(x)}</span>`, 'soru-bag')).join(' ')}</p>` : ''}
      ${kv.length ? `<p class="sz-dug"><span class="yok">Kavram:</span> ${kv.map((k) => ckBag(`${k.id}/${dilK(K, k.id) ? 'dil' : 'tanim'}`, `${kac(k.sembol)} · ${kac(k.ad)}`, 'soru-bag')).join(' ')}</p>` : ''}
      ${s.kaynak ? `<p class="yok sz-kaynak">Kaynak: ${kac(s.kaynak)}</p>` : ''}
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
  function kavramCk(K, kid, parca, ayni) {
    const k = kavramBul(K, kid);
    if (!k) return atlasCk(K, false);
    if (!parcaVar(K, k, parca)) parca = 'tanim';
    const D = dilK(K, k.id), b = K.bolumler.find((x) => x.id === k.bolum);
    const parcaAd = parca === 'sorular' ? 'Sorular' : parca === 'dil' ? 'TR ↔ EN' : (PAD[parca] || 'Tanım');
    kirintiYaz(K, [...(b ? [[kac(bolumAd(K, b)), `_bol/${b.id}`]] : []), [`${kac(k.sembol)} ${kac(k.ad)}`, `${k.id}/tanim`], [parcaAd, `${k.id}/${parca}`]]);
    $('#ck-baslik').innerHTML = `${kac(k.sembol)} · ${kac(k.ad)}<small lang="en">${kac(k.en || '')}</small>`;
    const L = K.kavramlar || [], i = L.indexOf(k), o = L[i - 1], s = L[i + 1], kp = (x) => `${x.id}/${parcaVar(K, x, parca) ? parca : 'tanim'}`;
    $('#ck-sira').innerHTML = siraHTML(o && [kp(o), `${kac(o.sembol)} ${kac(o.ad)}`], `kavram ${i + 1} / ${L.length}`, s && [kp(s), `${kac(s.sembol)} ${kac(s.ad)}`]);
    const parcalar = PARCA.filter(([p]) => k.parcalar && k.parcalar[p]), taban = `#${ckDurum.onEk}/k/${k.id}/`;
    const sekme = ([p, ad]) => `<button type="button" role="tab" aria-selected="${p === parca}" data-git="${kac(taban + p)}">${ad}</button>`;
    $('#ck-sekme').innerHTML = [...parcalar.slice(0, 1), ...(D ? [['dil', 'TR ↔ EN']] : []), ...parcalar.slice(1), ['sorular', `Sorular (${k.sorular.length})`]].map(sekme).join('');
    if (ayni) return;
    const ic = ckIc, P = k.parcalar[parca] || {};
    ckAdim = 1;
    if (parca === 'tanim') ic.innerHTML = P.html || '';
    else if (parca === 'dil') ic.innerHTML = dilKavramHTML(K, k);
    else if (parca === 'diyagram') { ic.innerHTML = `<div class="sekil-kap" id="ck-sekil"></div>${P.html || ''}`; if (window.Sekil[P.sekil]) window.Sekil[P.sekil]($('#ck-sekil'), P.ayar || {}); buyutDugmesi(); }
    else if (parca === 'formul') {
      ic.innerHTML = `<div class="formul-kap" data-tex="${P.tex}"></div><p class="yok" style="margin:10px 0 0">Bir terime bas: formülde yanar, anlamı aşağıda.</p><div class="terim-list">${(P.terimler || []).map((t, j) => `<button type="button" aria-pressed="false" data-t="${j}">${kac(t.sembol)}</button>`).join('')}</div><div class="terim-kart" id="terim-kart" hidden></div>${P.html || ''}`;
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
      $('#isp-sonraki').addEventListener('click', () => { ckAdim++; guncel(true); $$('ol.ispat li', ic)[ckAdim - 1]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
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
    if ((k.dis || []).length) ic.insertAdjacentHTML('beforeend', `<h3>Akademi'de etkileşimli hâli</h3><div class="ilgili">${k.dis.map((d) => `<a class="soru-bag" href="${kac(d.url)}" target="_blank" rel="noopener">${kac(d.ad)} ↗</a>`).join('')}</div>`);
    const bag = (k.bag || []).map((id) => kavramBul(K, id)).filter(Boolean);
    if (bag.length) ic.insertAdjacentHTML('beforeend', `<h3>İlgili kavramlar</h3><div class="ilgili">${bag.map((x) => ckBag(`${x.id}/tanim`, `${kac(x.sembol)} · ${kac(x.ad)}`, 'soru-bag')).join('')}</div>`);
    if (D && parca !== 'dil') ic.insertAdjacentHTML('beforeend', `<p class="dil-cagri">${ckBag(`${k.id}/dil`, 'TR ↔ EN: bu kavramın İngilizcesi, karşılaştırma ve sınav kalıpları →', 'soru-bag')}</p>`);
    $$('[data-tex]', ic).length && texDoldur(ic, K);
  }

  /* --- aç / kapat / yönlendir --- */
  function cekmeceKapat() {
    if (animTutucu && animTutucu.dur) animTutucu.dur(); animTutucu = null;
    ipKapat(); araKapat();
    ck.hidden = true; perde.hidden = true; ck.setAttribute('aria-hidden', 'true'); ckDurum = null; document.body.classList.remove('ck-acik');
  }
  function ckGoster(K, kPart, onEk) {
    const ilk = !ckDurum, ayni = !ilk && ckDurum.K === K && ckDurum.kPart === kPart;
    const qm = /^[^/]+\/(S\d+)(?:\/|$)/.exec(onEk), qid = qm ? qm[1] : null;
    ckDurum = { K, kPart, onEk, qid };
    ck.hidden = false; perde.hidden = true; ck.setAttribute('aria-hidden', 'false'); document.body.classList.add('ck-acik');
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
    else kavramCk(K, bas, kalan[0] || 'tanim', ayni);
    if (ayni) { $$('[data-soru]', ckIc).forEach((a) => { const on = a.dataset.soru === qid; a.classList.toggle('simdi', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }); return; }
    krKur(ckIc);
    ipucuEkle(ckIc, K);
    ckIc.scrollTop = 0;
    if (ilk) don.focus({ preventScroll: true });
    else if (!document.activeElement || document.activeElement === document.body || !document.activeElement.isConnected) $('#ck-baslik').focus({ preventScroll: true });
  }
  // ana sayfaya giden bağ: çekmece açık kalsın mı? (geniş ekranda Sabitle; dar ekranda çekmeceden basılan bağ)
  function anaGit(hedef, icten) {
    if (ckDurum && (ckGenis() ? sabit : !!icten)) location.hash = `${hedef}/k/${ckDurum.kPart}`;
    else location.hash = hedef;
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
    if (!ckDurum || !ckGenis() || !sabit) return;
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

  /* --- Sabitle + genişlik (kenardan sürükle; 360 px – 60 vw; hatırlanır) --- */
  const sabitBtn = $('#ck-sabit');
  function sabitYaz() { sabitBtn.setAttribute('aria-pressed', String(sabit)); sabitBtn.title = sabit ? 'Sabit: soru değişince çekmece açık kalır. Dokun: soruya geçince kapansın.' : 'Sabitle: soru değişince çekmece açık kalsın.'; }
  sabitBtn.addEventListener('click', () => { sabit = !sabit; sakla('dk:sabit', sabit ? '1' : '0'); sabitYaz(); });
  const tutamak = $('#ck-tutamak');
  let ckGen = +oku('dk:ckgen') || 0;
  const genSinir = (g) => Math.round(Math.max(360, Math.min(innerWidth * 0.6, g)));
  function genUygula() { if (ckGen) document.documentElement.style.setProperty('--ck-gen', `${genSinir(ckGen)}px`); else document.documentElement.style.removeProperty('--ck-gen'); }
  genUygula();
  addEventListener('resize', genUygula, { passive: true });
  tutamak.addEventListener('pointerdown', (e) => { if (!ckGenis()) return; e.preventDefault(); tutamak.setPointerCapture(e.pointerId); document.body.classList.add('ck-surukle'); });
  tutamak.addEventListener('pointermove', (e) => { if (!tutamak.hasPointerCapture(e.pointerId)) return; ckGen = document.documentElement.clientWidth - e.clientX; genUygula(); });
  const surBit = (e) => { if (tutamak.hasPointerCapture(e.pointerId)) tutamak.releasePointerCapture(e.pointerId); document.body.classList.remove('ck-surukle'); if (ckGen) { ckGen = genSinir(ckGen); sakla('dk:ckgen', String(ckGen)); } };
  tutamak.addEventListener('pointerup', surBit); tutamak.addEventListener('pointercancel', surBit);
  tutamak.addEventListener('dblclick', () => { ckGen = 0; genUygula(); sakla('dk:ckgen', ''); });
  tutamak.addEventListener('keydown', (e) => { if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return; e.preventDefault(); ckGen = genSinir((ckGen || ck.getBoundingClientRect().width) + (e.key === 'ArrowLeft' ? 40 : -40)); genUygula(); sakla('dk:ckgen', String(ckGen)); });

  /* --- süzgeç: yazdıkça süzer (Türkçe harf ve boşluk duyarsız; TR, EN, sembol); ↑ ↓ Enter; Esc temizler --- */
  const araInp = $('#ck-ara'), araSonuc = $('#ck-sonuc');
  let araDizin = null, araKitap = null, araSec = 0, araListe = [];
  function araDizinKur(K) {
    if (araKitap === K && araDizin) return araDizin;
    araKitap = K; araDizin = [];
    const ekle = (o) => araDizin.push({ ...o, n: norm(o.n) });
    ekle({ t: 'Atlas', ad: `${K.kod} · kavram atlası`, ck: '_atlas', n: `atlas kavram atlası ${K.kod} ${K.ad}` });
    ekle({ t: 'Sözlük', ad: `Sözlük · ${(K.sozluk || []).length} terim`, ck: '_sozluk', n: 'sözlük glossary terimler tr en' });
    K.bolumler.filter((b) => bolumDolu(K, b)).forEach((b) => ekle({ t: 'Bölüm', ad: bolumAd(K, b), ck: `_bol/${b.id}`, n: `${bolumAd(K, b)} ${b.ad}` }));
    (K.kavramlar || []).forEach((k) => ekle({ t: 'Kavram', ad: `${k.sembol} · ${k.ad}`, alt: k.en, ck: `${k.id}/tanim`, n: `${k.ad} ${k.en || ''} ${k.sembol} ${k.id}` }));
    (K.sozluk || []).forEach((s) => ekle({ t: 'Terim', ad: s.en, alt: s.tr, ck: `_sozluk/${s.en}`, n: `${s.en} ${s.tr}` }));
    (K.kavramlar || []).forEach((k) => (dilK(K, k.id)?.terim || []).forEach((t) => ekle({ t: 'TR↔EN', ad: t.en, alt: `${t.tr} · ${k.ad}`, ck: `${k.id}/dil`, n: `${t.en} ${t.tr}` })));
    soruSirasi(K).forEach((q) => ekle({ t: 'Soru', ad: `${q.id} · ${q.baslik}`, alt: `PDF s. ${q.pdf_soru ?? '—'}`, soru: q.id, n: `${q.id} ${q.baslik}` }));
    return araDizin;
  }
  function araKapat() { if (!araSonuc) return; araSonuc.hidden = true; araInp.setAttribute('aria-expanded', 'false'); araInp.removeAttribute('aria-activedescendant'); araListe = []; }
  function araYaz() {
    $$('.ck-s', araSonuc).forEach((x, i) => { x.setAttribute('aria-selected', String(i === araSec)); if (i === araSec) { araInp.setAttribute('aria-activedescendant', x.id); x.scrollIntoView({ block: 'nearest' }); } });
  }
  function araSuz() {
    const q = norm(araInp.value);
    if (!q || !ckDurum) { araKapat(); return; }
    const goruldu = new Set();
    araListe = araDizinKur(ckDurum.K).map((o) => ({ o, p: o.n.startsWith(q) ? 0 : o.n.includes(q) ? 1 : 9 })).filter((x) => x.p < 9)
      .sort((a, b) => a.p - b.p).map((x) => x.o).filter((o) => { const a = o.ck || o.soru; if (goruldu.has(a + o.ad)) return false; goruldu.add(a + o.ad); return true; }).slice(0, 14);
    araSec = 0;
    araSonuc.innerHTML = araListe.length ? araListe.map((o, i) => `<div class="ck-s" role="option" id="ck-s-${i}" data-i="${i}" aria-selected="false"><span class="t">${kac(o.t)}</span><span class="a">${kac(o.ad)}</span>${o.alt ? `<span class="b">${kac(o.alt)}</span>` : ''}</div>`).join('') : '<p class="yok ck-s-yok">Eşleşen yok. Başka bir yazımı dene (Türkçe harf gerekmez).</p>';
    araSonuc.hidden = false; araInp.setAttribute('aria-expanded', 'true'); araYaz();
  }
  function araGit(o) {
    if (!o || !ckDurum) return;
    araInp.value = ''; araKapat();
    if (o.soru) anaGit(`#${ckDurum.K.id}/${o.soru}`, true); else location.hash = `#${ckDurum.onEk}/k/${o.ck}`;
  }
  araInp.addEventListener('input', araSuz);
  araInp.addEventListener('focus', () => { if (araInp.value) araSuz(); });
  araInp.addEventListener('keydown', (e) => {
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
    if (ckDurum && (!ckGenis() || ck.contains(document.activeElement))) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const a = $(`.takip .sag a:${e.key === 'ArrowLeft' ? 'first-of-type' : 'nth-last-of-type(2)'}`); if (a && a.textContent.trim().match(e.key === 'ArrowLeft' ? /^‹/ : /›$/)) anaGit(a.getAttribute('href')); }
  });

  /* ---------- tam ekran: sade okuma, tek ince üst şerit ---------- */
  const H = document.documentElement;
  const hud = document.createElement('div');
  hud.className = 'hud'; hud.id = 'hud'; hud.hidden = true;
  hud.innerHTML = '<div class="hud-ic"><button type="button" data-k="ic" aria-label="İçindekiler" title="İçindekiler (T)"><svg class="hs" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01"/></svg><span class="he">İçindekiler</span></button><button type="button" data-k="once" aria-label="Önceki soru" title="Önceki soru"><svg class="hs" viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button><span class="hud-ad" aria-live="polite"><span class="hud-ders"></span><span class="hud-kisa"></span></span><button type="button" data-k="sonra" aria-label="Sonraki soru" title="Sonraki soru"><svg class="hs" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button><button type="button" data-k="kalem" aria-pressed="false" aria-label="Kalem" title="Kalem (P)"><svg class="hs" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"/><path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg><span class="he">Kalem</span></button><a data-k="pdf" target="_blank" rel="noopener" aria-label="PDF" title="PDF"><svg class="hs" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M8.5 13h7M8.5 16.5h4.5"/></svg><span class="he">PDF</span></a><button type="button" data-k="kapat" aria-label="Tam ekranı kapat" title="Kapat (Esc)"><svg class="hs" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg><span class="he">Kapat</span></button></div>';
  document.body.appendChild(hud);
  let tamMi = false, hudZaman = 0;
  const takipBag = (yon) => { const a = $(`.takip .sag a:${yon < 0 ? 'first-of-type' : 'nth-last-of-type(2)'}`); return a && a.textContent.trim().match(yon < 0 ? /^‹/ : /›$/) ? a : null; };
  function hudYaz() {
    if (!tamMi) return;
    const t = $('#soru-h') || $('main h1'), no = $('.soru-ust .no');
    const nt = no ? no.textContent : '', ki = nt.lastIndexOf('·');
    $('.hud-ders', hud).textContent = ki > 0 ? nt.slice(0, ki).trim() + ' · ' : '';
    $('.hud-kisa', hud).textContent = (ki > 0 ? nt.slice(ki + 1).trim() : nt) + (t ? (nt ? ' · ' : '') + t.textContent : '');
    $('[data-k=once]', hud).disabled = !takipBag(-1); $('[data-k=sonra]', hud).disabled = !takipBag(1);
    const pdf = $('.takip .sag a[target=_blank]'); const hp = $('[data-k=pdf]', hud); if (pdf) { hp.href = pdf.href; hp.hidden = false; } else hp.hidden = true;
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
    if (!kitapId) { cekmeceKapat(); sonSayfa = ''; return kitaplik(); }
    let K;
    try { K = await yukle(kitapId); } catch (e) { ana.innerHTML = `<p>Bu kitap bulunamadı. <a href="#">Kitaplığa dön</a></p>`; return; }
    simdiK = K;
    const sayfa = onEk;
    if (sayfa !== sonSayfa) {
      sonSayfa = sayfa;
      if (parca[1] === 'bol') bolumGoster(K, parca[2]);
      else {
        const sid = parca[1] || oku(`dk:son:${K.id}`);
        const am = /^a(\d+)$/.exec(parca[2] || '');
        if (am) acikAdim[`${K.id}/${sid}`] = +am[1];
        soruGoster(K, K.sorular[sid] || soruSirasi(K)[0]);
        if (am || parca[2] === 'yol' || parca[2] === 'oz') {
          const hedef = $(am ? `#a${am[1]}` : parca[2] === 'oz' ? ($('#oz') ? '#oz' : '#yol') : '#yol');
          if (hedef) { hedef.classList.add('vurgu'); setTimeout(() => hedef.scrollIntoView({ block: 'start', behavior: 'smooth' }), 60); sonSayfa = sayfa; return kPart ? ckGoster(K, kPart, onEk) : cekmeceKapat(); }
        }
      }
      window.scrollTo({ top: 0 });
    }
    if (kPart) ckGoster(K, kPart, onEk);
    else cekmeceKapat();
  }
  window.addEventListener('hashchange', yonlendir);
  yonlendir();
})();
