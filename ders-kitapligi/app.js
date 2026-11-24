/* Ders Kitaplığı — kitaplık, PDF ile eş zamanlı soru görünümü, konu çekmecesi.
   Adres biçimi (hepsi paylaşılabilir, tarayıcının Geri tuşu çalışır):
     #                         kitaplık
     #mto342e                  kitabın son bakılan sorusu
     #mto342e/S3               soru
     #mto342e/bol/K1-THETA-TV  bölümün konu sayfaları
     #mto342e/S3/k/theta/ispat soru açıkken konu çekmecesi (kavram · parça)  */
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
  /* telefonda şekil ekrana sığınca yazılar küçülür: «büyüt» şekli okunur genişliğe çıkarır, yatay kaydırılır (tercih hatırlanır) */
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
      return bl(K.id + '/' + b.id, kac(b.ad), sorular.length, `${konu ? `<a href="#${K.id}/bol/${b.id}" class="${simdi === 'bol/' + b.id ? 'simdi' : ''}">Konu özeti ve formüller<span class="pdf"></span></a>` : ''}${sorular.map((q) => `<a href="#${K.id}/${q.id}" class="${simdi === q.id ? 'simdi' : ''}" ${simdi === q.id ? 'aria-current="page"' : ''}><span>${q.id} · ${kac(q.baslik)}</span><span class="pdf">s. ${q.pdf_soru ?? '—'}</span></a>`).join('')}`, burada);
    }).join('')}${(K.kavramlar || []).length ? bl(K.id + '/kavram', 'Kavram atlası', K.kavramlar.length, K.kavramlar.map((k) => `<a href="#${K.id}/${simdi && simdi.startsWith('S') ? simdi + '/' : ''}k/${k.id}/tanim"><span>${kac(k.sembol)} · ${kac(k.ad)}</span><span class="pdf">${k.sorular.length} soru</span></a>`).join(''), false) : ''}</div></details>`;
  }
  function takipHTML(K, q) {
    const sira = soruSirasi(K), i = q ? sira.indexOf(q) : -1;
    return `<div class="takip"><label for="git">PDF sayfası ya da soru</label><input id="git" inputmode="text" placeholder="37 ya da S12" autocomplete="off">
      <span class="bilgi" id="git-bilgi">${q ? `PDF'te: soru s. <b>${q.pdf_soru ?? '—'}</b> · çözüm s. <b>${q.pdf_cozum ?? '—'}</b>` : `${kac(K.kod)} · ${K.pdf_sayfa} sayfa`}</span>
      <span class="sag">${i > 0 ? `<a class="kucuk" href="#${K.id}/${sira[i - 1].id}">‹ ${sira[i - 1].id}</a>` : ''}${i >= 0 && i < sira.length - 1 ? `<a class="kucuk" href="#${K.id}/${sira[i + 1].id}">${sira[i + 1].id} ›</a>` : ''}<a class="kucuk" href="${kac(K.pdf)}" target="_blank" rel="noopener">PDF ↗</a><button type="button" class="kucuk tam-ac" title="Tam ekran (F)">Tam ekran</button></span></div>`;
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
    const w = document.createTreeWalker(kok, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement.closest('svg,button,code,pre,.en-ip,summary,.dizin,.takip,a') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
    const dugumler = []; while (w.nextNode()) dugumler.push(w.currentNode);
    for (const d of dugumler) {
      const t = d.nodeValue; ipRx.rx.lastIndex = 0;
      if (!ipRx.rx.test(t)) continue;
      const span = document.createElement('span');
      span.innerHTML = kac(t).replace(ipRx.rx, (m) => `<span class="en-ip" tabindex="0" lang="en" data-tr="${kac(ipRx.tr.get(m.toLowerCase()) || '')}">${m}</span>`);
      d.replaceWith(...span.childNodes);
    }
  }
  document.addEventListener('click', (e) => { const t = e.target.closest('.en-ip'); $$('.en-ip.acik').forEach((x) => { if (x !== t) x.classList.remove('acik'); }); if (t) t.classList.toggle('acik'); });
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
    document.title = `${b.ad} · ${K.kod}`;
    const kv = (K.kavramlar || []).filter((k) => k.bolum === bid);
    ana.innerHTML = `<div class="kitap-yer"><nav class="dizin" aria-label="Bölümler ve sorular">${dizinHTML(K, 'bol/' + bid)}</nav><div>${takipHTML(K, null)}
      <h1>${kac(b.ad)}</h1>
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
      if (m && K.sorular[`S${+m[1]}`]) { location.hash = `#${K.id}/S${+m[1]}`; return; }
      m = v.match(/^(\d+)$/);
      if (m) {
        const s = +m[1], sira = soruSirasi(K);
        const tam = sira.find((q) => q.pdf_soru === s || q.pdf_cozum === s);
        const once = [...sira].reverse().find((q) => (q.pdf_soru ?? 1e9) <= s);
        const hedef = tam || once;
        if (hedef) { location.hash = `#${K.id}/${hedef.id}`; return; }
        $('#git-bilgi').textContent = `s. ${s} kapak/özet sayfası; ilk soru s. ${sira[0]?.pdf_soru}`;
        return;
      }
      $('#git-bilgi').textContent = 'Sayfa numarası (37) ya da soru numarası (S12) yaz.';
    });
  }

  /* ---------- konu çekmecesi ---------- */
  const ck = $('#cekmece'), perde = $('#perde');
  let ckDurum = null, ckAdim = 0;
  function cekmeceKapat() {
    if (animTutucu && animTutucu.dur) animTutucu.dur(); animTutucu = null;
    ck.hidden = true; perde.hidden = true; ck.setAttribute('aria-hidden', 'true'); ckDurum = null; document.body.classList.remove('ck-acik');
  }
  function cekmeceAc(K, kid, parca, qid) {
    const k = kavramBul(K, kid);
    if (!k) return cekmeceKapat();
    const yeni = !ckDurum || ckDurum.kid !== kid || ckDurum.parca !== parca;
    ckDurum = { kid, parca, qid };
    if (animTutucu && animTutucu.dur) animTutucu.dur(); animTutucu = null;
    ck.hidden = false; perde.hidden = false; ck.setAttribute('aria-hidden', 'false'); document.body.classList.add('ck-acik');
    const donHedef = qid ? `#${K.id}/${qid}` : `#${K.id}`;
    $('#ck-don').textContent = qid ? `← ${qid}'e dön` : '← Kitaba dön';
    $('#ck-don').onclick = () => { location.hash = donHedef; };
    $('#kirinti').innerHTML = `${qid ? `<a href="${donHedef}">${kac(K.kod)} · ${qid}</a> ›` : `<a href="#${K.id}">${kac(K.kod)}</a> ›`} <a href="#${K.id}/${qid ? qid + '/' : ''}k/${k.id}/tanim">${kac(k.sembol)} ${kac(k.ad)}</a> › <span>${PAD[parca] || 'Sorular'}</span>`;
    $('#ck-baslik').innerHTML = `${kac(k.sembol)} · ${kac(k.ad)}<small>${kac(k.en || '')}</small>`;
    const parcalar = PARCA.filter(([p]) => k.parcalar && k.parcalar[p]);
    const taban = `#${K.id}/${qid ? qid + '/' : ''}k/${k.id}/`;
    $('#ck-sekme').innerHTML = parcalar.map(([p, ad]) => `<button type="button" role="tab" aria-selected="${p === parca}" data-git="${taban}${p}">${ad}</button>`).join('') + `<button type="button" role="tab" aria-selected="${parca === 'sorular'}" data-git="${taban}sorular">Sorular (${k.sorular.length})</button>`;
    const ic = $('#ck-ic');
    const P = k.parcalar[parca] || {};
    if (yeni) ckAdim = 1;
    if (parca === 'tanim') ic.innerHTML = P.html || '';
    else if (parca === 'diyagram') { ic.innerHTML = `<div class="sekil-kap" id="ck-sekil"></div>${P.html || ''}`; if (window.Sekil[P.sekil]) window.Sekil[P.sekil]($('#ck-sekil'), P.ayar || {}); buyutDugmesi(); }
    else if (parca === 'formul') {
      ic.innerHTML = `<div class="formul-kap" data-tex="${P.tex}"></div><p class="yok" style="margin:10px 0 0">Bir terime bas: formülde yanar, anlamı aşağıda.</p><div class="terim-list">${(P.terimler || []).map((t, i) => `<button type="button" aria-pressed="false" data-t="${i}">${kac(t.sembol)}</button>`).join('')}</div><div class="terim-kart" id="terim-kart" hidden></div>${P.html || ''}`;
      texDoldur(ic, K);
      const sec = (i) => {
        const t = P.terimler[i];
        $$('.terim-list button', ic).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.t === i)));
        $$('.formul-kap .on', ic).forEach((e) => e.classList.remove('on'));
        $$(`.formul-kap .${CSS.escape(t.id)}`, ic).forEach((e) => e.classList.add('on'));
        const kk = $('#terim-kart'); kk.hidden = false;
        kk.innerHTML = `<b style="font-size:20px">${kac(t.sembol)}</b> — ${kac(t.ad)}<dl><dt>Birim</dt><dd>${kac(t.birim)}</dd><dt>Anlamı</dt><dd>${t.anlam || ''}</dd>${t.tipik ? `<dt>Tipik değer</dt><dd>${kac(t.tipik)}</dd>` : ''}</dl>`;
      };
      $$('.terim-list button', ic).forEach((b) => b.addEventListener('click', () => sec(+b.dataset.t)));
      if ((P.terimler || []).length) sec(0);
    } else if (parca === 'ispat') {
      const n = (P.adimlar || []).length;
      ic.innerHTML = `${P.html || ''}<ol class="ispat">${P.adimlar.map((a, i) => `<li data-i="${i}" ${i >= ckAdim ? 'hidden' : ''}><div class="tex-blok" data-tex="${a.tex}"></div>${a.html || ''}</li>`).join('')}</ol><div class="kare-gez"><button type="button" class="dugme" id="isp-sonraki">Sonraki adım</button><button type="button" class="dugme ikincil" id="isp-hepsi">Hepsini göster</button><span class="yok" id="isp-say"></span></div>`;
      texDoldur(ic, K);
      const guncel = (yeniLi) => { $$('ol.ispat li', ic).forEach((li, i) => { const ac = i < ckAdim; if (ac && li.hidden && yeniLi) li.classList.add('yeni'); li.hidden = !ac; }); $('#isp-say').textContent = `${Math.min(ckAdim, n)} / ${n}`; $('#isp-sonraki').hidden = $('#isp-hepsi').hidden = ckAdim >= n; };
      $('#isp-sonraki').addEventListener('click', () => { ckAdim++; guncel(true); $$('ol.ispat li', ic)[ckAdim - 1]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
      $('#isp-hepsi').addEventListener('click', () => { ckAdim = n; guncel(true); });
      guncel(false);
    } else if (parca === 'anim') {
      if (P.modul) { ic.innerHTML = `<div class="sekil-kap" id="ck-sekil"></div>${P.html || ''}`; if (window.Anim[P.modul]) animTutucu = window.Anim[P.modul]($('#ck-sekil'), P.ayar || {}); buyutDugmesi(); }
      else if (P.kareler) {
        const n = P.kareler.length;
        const kare = (i) => { ic.innerHTML = `${P.html || ''}<div class="kare-gez"><button type="button" class="kucuk" id="kr-geri" ${i === 0 ? 'disabled' : ''}>‹ Önceki</button><b>${i + 1} / ${n}</b><button type="button" class="dugme" id="kr-ileri" ${i === n - 1 ? 'disabled' : ''}>Sonraki ›</button></div><div class="sekil-kap" id="ck-sekil"></div>${P.kareler[i].html || ''}`; const kk = P.kareler[i]; if (window.Sekil[kk.sekil]) window.Sekil[kk.sekil]($('#ck-sekil'), kk.ayar || {}); buyutDugmesi(); $('#kr-geri').onclick = () => kare(i - 1); $('#kr-ileri').onclick = () => kare(i + 1); };
        kare(0);
      }
    } else if (parca === 'kod') {
      const sat = P.kod.split('\n');
      ic.innerHTML = `${P.html || ''}<pre class="kod" style="border-radius:12px">${sat.map((s, i) => `<span class="sat" data-s="${i + 1}"><span class="no">${i + 1}</span>${kac(s)}</span>`).join('')}</pre><h3>Satır satır</h3><ol class="ispat" style="counter-reset:none">${(P.satirlar || []).map(([no, a]) => `<li data-s="${no}" style="cursor:pointer"><b>Satır ${no}:</b> ${kac(a)}</li>`).join('')}</ol>`;
      $$('ol.ispat li', ic).forEach((li) => { li.style.setProperty('--x', 1); li.addEventListener('click', () => { $$('pre.kod .sat', ic).forEach((s) => s.classList.toggle('on', s.dataset.s === li.dataset.s)); }); });
      $$('ol.ispat li', ic).forEach((li) => li.classList.add('kod-satir'));
    } else if (parca === 'sorular') {
      ic.innerHTML = `<p>Bu kavramın geçtiği sorular (PDF sayfasıyla):</p><div class="ilgili">${k.sorular.map((s) => `<a class="soru-bag" href="#${K.id}/${s}">${s} · ${kac(K.sorular[s]?.baslik)} <span class="yok">s. ${K.sorular[s]?.pdf_soru ?? '—'}</span></a>`).join('')}</div>`;
    }
    if ((k.dis || []).length) ic.insertAdjacentHTML('beforeend', `<h3>Akademi'de etkileşimli hâli</h3><div class="ilgili">${k.dis.map((d) => `<a class="soru-bag" href="${kac(d.url)}" target="_blank" rel="noopener">${kac(d.ad)} ↗</a>`).join('')}</div>`);
    const bag = (k.bag || []).map((id) => kavramBul(K, id)).filter(Boolean);
    if (bag.length) ic.insertAdjacentHTML('beforeend', `<h3>İlgili kavramlar</h3><div class="ilgili">${bag.map((b) => `<button type="button" data-git="#${K.id}/${qid ? qid + '/' : ''}k/${b.id}/tanim">${kac(b.sembol)} · ${kac(b.ad)}</button>`).join('')}</div>`);
    $$('[data-tex]', ic).length && texDoldur(ic, K);
    if (yeni) ic.scrollTop = 0;
    $('#ck-geri').disabled = history.length <= 1;
    (yeni ? $('#ck-don') : null)?.focus({ preventScroll: true });
  }
  $('#ck-geri').addEventListener('click', () => history.back());
  $('#ck-ileri').addEventListener('click', () => history.forward());
  perde.addEventListener('click', () => { if (ckDurum) location.hash = ckDurum.qid ? location.hash.split('/k/')[0] : location.hash.split('/k/')[0]; });
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-git]'); if (b) { e.preventDefault(); location.hash = b.dataset.git; } });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ckDurum) { location.hash = location.hash.split('/k/')[0]; return; }
    if (/INPUT|TEXTAREA/.test(document.activeElement?.tagName) || ckDurum) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const a = $(`.takip .sag a:${e.key === 'ArrowLeft' ? 'first-of-type' : 'nth-last-of-type(2)'}`); if (a && a.textContent.trim().match(e.key === 'ArrowLeft' ? /^‹/ : /›$/)) location.hash = a.getAttribute('href'); }
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
    else if (k === 'once' || k === 'sonra') { const a = takipBag(k === 'once' ? -1 : 1); if (a) location.hash = a.getAttribute('href'); }
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
          if (hedef) { hedef.classList.add('vurgu'); setTimeout(() => hedef.scrollIntoView({ block: 'start', behavior: 'smooth' }), 60); sonSayfa = sayfa; return kPart ? cekmeceAc(K, ...kPart.split('/').slice(0, 2), parca[1]) : cekmeceKapat(); }
        }
      }
      window.scrollTo({ top: 0 });
    }
    if (kPart) { const [kid, p] = kPart.split('/'); cekmeceAc(K, kid, p || 'tanim', parca[1] && parca[1].startsWith('S') ? parca[1] : null); }
    else cekmeceKapat();
  }
  window.addEventListener('hashchange', yonlendir);
  yonlendir();
})();
