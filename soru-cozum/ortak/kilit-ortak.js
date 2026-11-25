// Atmosfer Akademisi · ortak parola kilidi (soru-cozum/ortak/kilit-ortak.js, 25 Kas 2026). Sınav atölyeleri ve çözüm
// sayfalarındaki «Sınav için» blokları parolalı: veri <ad>.json.kilit (PBKDF2-SHA256 → AES-GCM 256, tarayıcıda çözülür;
// parola sitede yok). Anahtar Defterler kilidiyle AYNI (aynı tuz, aynı yerel depo adı): birinde parolayı yazan ötekinde
// yeniden yazmaz. Bu dosya ereader-studio/tools/sc_sinav/_motor/sinav_kilit.mjs ile tuz doldurularak kopyalanır.
(() => {
  'use strict';
  if (window.akKilit) return;
  const TUZ = 'R/45QgKU0DXAa0mUW6z0CQ==', TUR = 250000, ANAHTAR = 'ak-defter-anahtar';
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  const b64e = (u) => btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(u))));
  const duzle = (s) => s.normalize('NFC').trim().toLocaleLowerCase('tr');

  async function turet(parola) {
    const ham = await crypto.subtle.importKey('raw', new TextEncoder().encode(duzle(parola)), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(TUZ), iterations: TUR, hash: 'SHA-256' }, ham,
      { name: 'AES-GCM', length: 256 }, true, ['decrypt']);
  }
  async function coz(anahtar, bayt) {
    return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bayt.slice(0, 12) }, anahtar, bayt.slice(12)));
  }
  function sakla(ham, uzun) {
    try { localStorage.setItem(ANAHTAR, JSON.stringify({ k: b64e(ham), t: Date.now() + (uzun ? 30 * 864e5 : 12 * 36e5) })); } catch (e) { /* özel pencere */ }
  }
  async function saklanan() {
    try {
      const x = JSON.parse(localStorage.getItem(ANAHTAR) || 'null');
      if (!x || x.t < Date.now()) return null;
      return await crypto.subtle.importKey('raw', b64(x.k), 'AES-GCM', false, ['decrypt']);
    } catch (e) { return null; }
  }
  const unut = () => { try { localStorage.removeItem(ANAHTAR); } catch (e) { /* yok */ } };
  async function getir(url) {
    const r = await fetch(url, { cache: 'no-cache' });
    if (!r.ok) throw new Error(url + ' ' + r.status);
    return new Uint8Array(await r.arrayBuffer());
  }
  const jsonCoz = async (k, bayt) => JSON.parse(new TextDecoder().decode(await coz(k, bayt)));

  const STIL = `.akk{position:fixed;inset:0;z-index:2147483100;background:rgba(255,255,255,.97);display:grid;place-items:center;padding:16px}
.akk form{width:min(420px,100%);display:grid;gap:12px;font:inherit}
.akk h2{margin:0;font-size:1.6em}
.akk p{margin:0;color:#4b5563}
.akk input[type=password]{font:inherit;padding:12px 14px;border:1px solid #cbd3de;border-radius:12px}
.akk input[type=password]:focus{outline:2px solid #1d4ed8;outline-offset:1px}
.akk-h{display:flex;gap:8px;align-items:center;font-size:.92em;color:#4b5563}
.akk button{font:inherit;font-weight:650;padding:11px 16px;border-radius:12px;border:0;background:#1d4ed8;color:#fff;cursor:pointer;justify-self:start}
.akk-x{color:#b91c1c}
.akk a{color:#1d4ed8}`;
  function formAc(bayt, sec) {
    return new Promise((tamam) => {
      if (!document.getElementById('akk-stil')) { const st = document.createElement('style'); st.id = 'akk-stil'; st.textContent = STIL; document.head.appendChild(st); }
      const kap = document.createElement('div');
      kap.className = 'akk';
      kap.innerHTML = '<form autocomplete="on"><h2></h2><p>Bu bölüm parolayla açılır.</p>'
        + '<label for="akk-p">Parola</label><input id="akk-p" type="password" autocomplete="current-password" autocapitalize="none" spellcheck="false" required>'
        + '<label class="akk-h"><input type="checkbox" id="akk-hat"> Bu cihazda hatırla</label>'
        + '<button type="submit">Aç</button><p class="akk-x" role="alert" hidden>Parola yanlış.</p>'
        + (sec.geri ? '<p><a></a></p>' : '') + '</form>';
      kap.querySelector('h2').textContent = sec.ad || 'Parola';
      if (sec.geri) { const a = kap.querySelector('a'); a.href = sec.geri; a.textContent = sec.geriAd || 'Geri dön'; }
      document.body.appendChild(kap);
      const form = kap.querySelector('form'), inp = kap.querySelector('#akk-p'), hat = kap.querySelector('#akk-hat'), hata = kap.querySelector('.akk-x'), dg = kap.querySelector('button');
      inp.focus();
      form.addEventListener('submit', async (e) => {
        e.preventDefault(); hata.hidden = true; dg.disabled = true;
        try {
          const k = await turet(inp.value);
          const v = await jsonCoz(k, bayt);
          sakla(await crypto.subtle.exportKey('raw', k), hat.checked);
          kap.remove();
          tamam(v);
        } catch (err) { hata.hidden = false; inp.select(); } finally { dg.disabled = false; }
      });
    });
  }
  /** Şifreli JSON'u getirir ve çözer. Saklanan anahtar yoksa: sec.iste → parola formu (doğru parolaya dek), değilse null. */
  async function jsonAl(url, sec = {}) {
    let bayt;
    try { bayt = await getir(url); } catch (e) { return null; }
    const k = await saklanan();
    if (k) { try { return await jsonCoz(k, bayt); } catch (e) { unut(); } }
    if (!sec.iste) return null;
    return formAc(bayt, sec);
  }
  window.akKilit = { jsonAl, saklanan, unut };
})();
