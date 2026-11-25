// Araştırma · Defterler kilidi (25 Kas 2026). Defterler sayfasının içeriği ve defter PDF'leri parolayla şifreli:
// PBKDF2-SHA256 → AES-GCM 256, çözme tarayıcıda yapılır; parola sitede hiçbir yerde yok. Şifreleme aracı:
// yolhava/_ATMOSFER-AKADEMI/arastirma/tools/defter_kilit.mjs. Açılan anahtar bu cihazda saklanır (12 saat; «Bu cihazda
// hatırla» ile 30 gün); «Kilitle» siler. Adres defterler/#pdf=<ad>&s=<sayfa> → kilit açıkken o PDF o sayfada açılır.
(() => {
  'use strict';
  const veriEl = document.getElementById('kilit-veri');
  if (!veriEl || !window.crypto || !crypto.subtle) return;
  const V = JSON.parse(veriEl.textContent);
  const ANAHTAR = 'ak-defter-anahtar';
  const ana = document.getElementById('ana');
  const kutu = document.getElementById('kilit-kutu');
  const form = document.getElementById('kilit-form');
  const parolaEl = document.getElementById('kilit-parola');
  const hatirlaEl = document.getElementById('kilit-hatirla');
  const hataEl = document.getElementById('kilit-hata');
  const dugme = form.querySelector('button[type="submit"]');

  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const b64e = (u) => btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(u))));
  const duzle = (s) => s.normalize('NFC').trim().toLocaleLowerCase('tr');

  async function turet(parola) {
    const ham = await crypto.subtle.importKey('raw', new TextEncoder().encode(duzle(parola)), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(V.tuz), iterations: V.tur, hash: 'SHA-256' }, ham,
      { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
  }
  async function coz(anahtar, bayt) {   // bayt = IV (12) + şifreli metin + etiket
    return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bayt.slice(0, 12) }, anahtar, bayt.slice(12)));
  }
  function sakla(ham, uzun) {
    try { localStorage.setItem(ANAHTAR, JSON.stringify({ k: b64e(ham), t: Date.now() + (uzun ? 30 * 864e5 : 12 * 36e5) })); } catch (e) { /* özel pencere: yalnız bu sayfa */ }
  }
  async function saklanan() {
    try {
      const x = JSON.parse(localStorage.getItem(ANAHTAR) || 'null');
      if (!x || x.t < Date.now()) return null;
      return await crypto.subtle.importKey('raw', b64(x.k), 'AES-GCM', false, ['decrypt']);
    } catch (e) { return null; }
  }
  const unut = () => { try { localStorage.removeItem(ANAHTAR); } catch (e) { /* yok */ } };

  let anahtar = null;
  async function ac(k) {
    const html = new TextDecoder().decode(await coz(k, b64(V.d)));
    anahtar = k;
    ana.innerHTML = html;
    const ust = document.createElement('p');
    ust.className = 'kilit-ust';
    ust.innerHTML = '<button type="button" class="kilit-kapat-dugme">Kilitle</button>';
    ust.firstChild.addEventListener('click', () => { unut(); location.hash = ''; location.reload(); });
    ana.prepend(ust);
    const s = document.createElement('script');
    s.src = '../ortak/sayfa.js';
    document.body.appendChild(s);
    hashIsle();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hataEl.hidden = true;
    dugme.disabled = true;
    try {
      const k = await turet(parolaEl.value);
      await ac(k);
      sakla(await crypto.subtle.exportKey('raw', k), hatirlaEl.checked);
    } catch (err) {
      hataEl.hidden = false;
      parolaEl.select();
    } finally { dugme.disabled = false; }
  });

  // ---- PDF görüntüleyici (şifreli PDF tarayıcıda çözülür; blob adresi yalnız bu sekmede yaşar)
  let gorEl = null, sonUrl = null;
  function kapat() {
    if (gorEl) { gorEl.remove(); gorEl = null; }
    if (sonUrl) { URL.revokeObjectURL(sonUrl); sonUrl = null; }
    if (/^#pdf=/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
  }
  async function pdfAc(ad, s) {
    kapat();
    gorEl = document.createElement('div');
    gorEl.className = 'kilit-pdf';
    gorEl.innerHTML = '<div class="kilit-pdf-ust"><b></b><span class="kilit-pdf-sag"></span><button type="button" aria-label="Kapat">Kapat</button></div><div class="kilit-pdf-ic"><p>Açılıyor…</p></div>';
    gorEl.querySelector('b').textContent = ad.replace(/_/g, ' ') + (s ? ' · s. ' + s : '');
    gorEl.querySelector('button').addEventListener('click', kapat);
    document.body.appendChild(gorEl);
    const ic = gorEl.querySelector('.kilit-pdf-ic');
    try {
      const r = await fetch('../defter/' + encodeURIComponent(ad) + '.pdf.kilit', { cache: 'no-cache' });
      if (!r.ok) throw new Error(String(r.status));
      const bayt = await coz(anahtar, new Uint8Array(await r.arrayBuffer()));
      sonUrl = URL.createObjectURL(new Blob([bayt], { type: 'application/pdf' }));
      const adres = sonUrl + (s ? '#page=' + s : '');
      const sag = gorEl.querySelector('.kilit-pdf-sag');
      const a = document.createElement('a');
      a.href = adres; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Yeni sekmede aç ↗';
      sag.appendChild(a);
      if (navigator.pdfViewerEnabled === false) {
        ic.innerHTML = '';
        const indir = document.createElement('a');
        indir.className = 'kilit-pdf-indir'; indir.href = sonUrl; indir.download = ad + '.pdf'; indir.textContent = 'PDF\'i aç';
        ic.appendChild(indir);
      } else {
        ic.innerHTML = '';
        const fr = document.createElement('iframe');
        fr.title = ad; fr.src = adres;
        ic.appendChild(fr);
      }
    } catch (err) {
      ic.innerHTML = '<p>PDF açılamadı.</p>';
    }
  }
  function hashIsle() {
    const m = /^#pdf=([A-Za-z0-9_.-]+)(?:&s=(\d+))?/.exec(location.hash);
    if (m && anahtar) pdfAc(m[1], m[2]);
  }
  window.addEventListener('hashchange', hashIsle);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && gorEl) kapat(); });
  // Bu sayfadaki PDF bağları yeni sekme açmadan görüntüleyicide açılır
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href*="#pdf="]');
    if (!a || !anahtar || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const u = new URL(a.href, location.href);
    if (u.pathname !== location.pathname) return;
    e.preventDefault();
    history.replaceState(null, '', u.hash);
    hashIsle();
  });

  (async () => {
    const k = await saklanan();
    if (k) { try { await ac(k); return; } catch (e) { unut(); } }
    form.hidden = false;
    parolaEl.focus();
  })();

})();
