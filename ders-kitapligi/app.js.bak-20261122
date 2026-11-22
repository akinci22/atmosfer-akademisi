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
  function dizinHTML(K, simdi) {
    return `<button type="button" class="dizin-ac" aria-expanded="false">☰ Bölümler ve sorular</button><div class="dizin-ic">${K.bolumler.map((b) => {
      const sorular = b.ogeler.filter((o) => o.tur === 'soru').map((o) => K.sorular[o.id]).filter(Boolean);
      const konu = b.ogeler.some((o) => o.tur !== 'soru');
      return `<h4>${kac(b.ad)}</h4>${konu ? `<a href="#${K.id}/bol/${b.id}" class="${simdi === 'bol/' + b.id ? 'simdi' : ''}">Konu özeti ve formüller<span class="pdf"></span></a>` : ''}${sorular.map((q) => `<a href="#${K.id}/${q.id}" class="${simdi === q.id ? 'simdi' : ''}" ${simdi === q.id ? 'aria-current="page"' : ''}><span>${q.id} · ${kac(q.baslik)}</span><span class="pdf">s. ${q.pdf_soru ?? '—'}</span></a>`).join('')}`;
    }).join('')}${(K.kavramlar || []).length ? `<h4>Kavram atlası</h4>${K.kavramlar.map((k) => `<a href="#${K.id}/${simdi && simdi.startsWith('S') ? simdi + '/' : ''}k/${k.id}/tanim"><span>${kac(k.sembol)} · ${kac(k.ad)}</span><span class="pdf">${k.sorular.length} soru</span></a>`).join('')}` : ''}</div>`;
  }
  function takipHTML(K, q) {
    const sira = soruSirasi(K), i = q ? sira.indexOf(q) : -1;
    return `<div class="takip"><label for="git">PDF sayfası ya da soru</label><input id="git" inputmode="text" placeholder="37 ya da S12" autocomplete="off">
      <span class="bilgi" id="git-bilgi">${q ? `PDF'te: soru s. <b>${q.pdf_soru ?? '—'}</b> · çözüm s. <b>${q.pdf_cozum ?? '—'}</b>` : `${kac(K.kod)} · ${K.pdf_sayfa} sayfa`}</span>
      <span class="sag">${i > 0 ? `<a class="kucuk" href="#${K.id}/${sira[i - 1].id}">‹ ${sira[i - 1].id}</a>` : ''}${i >= 0 && i < sira.length - 1 ? `<a class="kucuk" href="#${K.id}/${sira[i + 1].id}">${sira[i + 1].id} ›</a>` : ''}<a class="kucuk" href="${kac(K.pdf)}" target="_blank" rel="noopener">PDF ↗</a></span></div>`;
  }
  function bagHTML(K, idler, qid) {
    const benzersiz = [...new Set(idler || [])].map((id) => kavramBul(K, id)).filter(Boolean);
    if (!benzersiz.length) return '';
    return `<div class="baglar">${benzersiz.map((k) => `<div class="bag"><b>${kac(k.sembol)} · ${kac(k.ad)}</b>${PARCA.filter(([p]) => k.parcalar && k.parcalar[p]).map(([p, ad]) => `<button type="button" data-git="#${K.id}/${qid}/k/${k.id}/${p}">${ad}</button>`).join('')}</div>`).join('')}</div>`;
  }
  const acikAdim = {};
  function soruGoster(K, q) {
    document.title = `${q.id} · ${q.baslik} · ${K.kod}`;
    sakla(`dk:son:${K.id}`, q.id);
    const n = (q.adimlar || []).length;
    ana.innerHTML = `<div class="kitap-yer"><nav class="dizin" aria-label="Bölümler ve sorular">${dizinHTML(K, q.id)}</nav><div>
      ${takipHTML(K, q)}
      <article class="soru-kart" aria-labelledby="soru-h"><div class="soru-ust"><span class="no">${kac(K.kod)} · ${q.id}</span><span class="pdf-etiket">PDF s. ${q.pdf_soru ?? '—'}</span></div>
      <h1 id="soru-h">${kac(q.baslik)}</h1>
      <div class="soru-govde">${q.soru || ''}</div>
      ${q.ipucu ? `<details class="ipucu"><summary>İpucu</summary>${q.ipucu}</details>` : ''}
      <h2 style="margin-top:22px">Çözüm <small class="yok" style="font-size:15px;font-weight:500">PDF s. ${q.pdf_cozum ?? '—'} · ${n} adım</small></h2>
      ${q.giris ? `<div id="cozum-giris" hidden>${q.giris}</div>` : ''}
      <ol class="adimlar" id="adimlar">${(q.adimlar || []).map((a, i) => `<li data-i="${i}" hidden>${a.html}${bagHTML(K, a.kavram, q.id)}</li>`).join('')}</ol>
      <div class="cozum-bas"><button type="button" class="dugme" id="adim-ac">1. adımı aç</button><button type="button" class="dugme ikincil" id="hepsi">Hepsini aç</button><button type="button" class="kucuk" id="kapat" hidden>Çözümü kapat</button></div>
      <div id="cozum-son" hidden>${q.oz ? `<div class="oz"><b>💎 Öz:</b> ${q.oz.replace(/^<p>|<\/p>$/g, '')}</div>` : ''}
      ${q.kod ? `<details class="kod-kutu"><summary>💻 Bu sonucu hesaplayan Python kodu</summary><pre class="kod">${kac(q.kod).split('\n').map((s, i) => `<span class="sat"><span class="no">${i + 1}</span>${s}</span>`).join('')}</pre></details>` : ''}
      ${(q.kavram || []).length ? `<h3>Bu sorudaki kavramlar</h3>${bagHTML(K, q.kavram, q.id)}` : `<p class="yok">Bu sorunun kavram bağları hazırlanıyor; kitabın bölüm özetine <a href="#${K.id}/bol/${q.bolum}">buradan</a> bakabilirsin.</p>`}</div>
      </article></div></div>`;
    texDoldur(ana, K);
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
      ${b.ogeler.filter((o) => o.tur !== 'soru').map((o) => `<section class="konu-sayfa"><h3>${kac(o.baslik)}</h3>${o.html}${o.oz ? `<div class="oz"><b>💎 Öz:</b> ${o.oz.replace(/^<p>|<\/p>$/g, '')}</div>` : ''}</section>`).join('')}
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
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const a = $(`.takip .sag a:${e.key === 'ArrowLeft' ? 'first-child' : 'nth-last-child(2)'}`); if (a && a.textContent.trim().match(e.key === 'ArrowLeft' ? /^‹/ : /›$/)) location.hash = a.getAttribute('href'); }
  });

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
        soruGoster(K, K.sorular[sid] || soruSirasi(K)[0]);
      }
      window.scrollTo({ top: 0 });
    }
    if (kPart) { const [kid, p] = kPart.split('/'); cekmeceAc(K, kid, p || 'tanim', parca[1] && parca[1].startsWith('S') ? parca[1] : null); }
    else cekmeceKapat();
  }
  window.addEventListener('hashchange', yonlendir);
  yonlendir();
})();
