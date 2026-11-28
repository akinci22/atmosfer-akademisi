/* Atmosfer Akademisi — site geneli yüzen arama balonu (ETK4 BALON 27 Kas 2026 · ETK5 28 Kas 2026).
   Her sayfaya tek satır: <script src="<köke göre>/ortak/ara-balon.js" defer></script> (tools/ortak_enjekte.mjs ekler).
   Bağımlılıksız; stil bu dosyada (tek istek). Ders Kitaplığı'nın arama / çekmece motorunu (arama, kavram, terim kartı, sözlük,
   mercekler, pusula) gömülü kipte iframe'de açar: ders-kitapligi/?gomulu=1#<kitap>/k/<görünüm>. Ders Kitaplığı'nın kendi
   sayfasında iframe yok: yerel çekmece açılır.
   Tetikler (yazı alanı dışında): boşluğa BASILI TUT (~450 ms) → panel aç / kapa, Esc kapatır; kısa basış sayfayı ilerletir
   (Shift+Boşluk geri — Shift yalnız boşluktan en az 90 ms önce basılmış ve bırakılmamışsa sayılır: TeamViewer'ın Shift fırtınası
   algıyı bozmaz); ÇİFT boşluk → klavyeyle gezinme kipi (ortak/klavye-gez.js, tembel yüklenir). Sayfa boşluğu kendisi işliyorsa
   (preventDefault) dokunulmaz. Balona dokun; teknik sözcük seçimi (fare) / telefonda basılı tutup seçme → bilinen terim / kavram
   ise kartı, değilse seçimin yanında «Ara» düğmesi (seçim silinmez, odak çalınmaz).
   Tutma çubuğu (panelin üstündeki hap): dokun → seçenek menüsü (Yüzen · Sağda / Solda böl ya da Alt panel · Sağa / Sola gizle ·
   Balona küçült · Kapat); sürükle → taşı, sağa / sola fırlat ya da kenara bırak → kenara gizlenir (yalnız ince dikey hap kalır;
   dokun / içeri sürükle → geri gelir). Yüzen pencerede kenar / köşe tutamakları üstüne gelince belirir.
   Gezinme çubukları (masa, ince işaretçi; her belgede, gömülü kitaplık dahil): ince, yuvarlak, yarı saydam, ok düğmesi yok,
   yalnız gezinirken ya da çubuğun üstüne gelince görünür.
   Depo (localStorage, try/catch): ab:durum {kenar, yo, gizli, kip, yan, p, ah, bw}, ab:kitap, ab:basili ('0' = basılı tut kapalı),
   ab:cift ('0' = çift boşluk kapalı), ab:secim ('0' = seçimle arama kapalı), ab:gizli ('1' = balon gizli); sessionStorage ab:kg
   ('1' = klavyeyle gez açık). Hareket: prefers-reduced-motion ve html[data-hareket=az]. */
(function () {
  'use strict';
  if (window.__araBalon) return;
  window.__araBalon = true;
  let UST = true; try { UST = window.self === window.top; } catch (e) { UST = false; }
  const BETIK = document.currentScript;
  const KOK = new URL('..', BETIK && BETIK.src ? BETIK.src : location.href).href;
  const SURUM = '5a';
  const oku = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const yaz = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* özel pencere */ } };
  const okuJ = (k) => { try { const x = JSON.parse(oku(k) || 'null'); return x && typeof x === 'object' ? x : {}; } catch (e) { return {}; } };
  const okuS = (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
  const yazS = (k, v) => { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { /* yok */ } };
  const azHareket = () => (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.documentElement.dataset.hareket === 'az';
  const dar = () => innerWidth < 700;
  const genis = () => document.documentElement.clientWidth || innerWidth;
  const sinir = (v, a, b) => Math.max(a, Math.min(b, v));
  const kalemAcik = () => !!document.querySelector('.t9kalem-yas, .t9kalem-ortu') || document.documentElement.classList.contains('kalem-acik');
  const yaziAlani = (el) => !!(el && el.closest && el.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]'));
  const etkilesimli = (el) => !!(el && el.closest && el.closest('button, a[href], summary, select, [role=button], [role=tab], [role=slider], [role=switch], [role=checkbox], [role=menuitem], [role=menuitemradio], [tabindex]:not([tabindex="-1"]), input, textarea, video, audio'));
  const MODTUS = /^(Shift|Control|Alt|AltGraph|Meta|OS|CapsLock|Fn|NumLock)$/;
  const kgAcik = () => okuS('ab:kg') === '1';

  // ---------- gezinme çubukları: ince, yuvarlak, yalnız gezinirken / üstüne gelince (masa, ince işaretçi) ----------
  // Chrome'da standart scrollbar-width ayarlı öğede ::-webkit-scrollbar yok sayılır → sitelerdeki «thin» öğeler «auto»ya çekilir
  // (özgüllük +1 sınıf; «none» olanlar dokunulmaz). Firefox'ta standart özellikler.
  const SB_INCE = ['.og-cats', '.og-items', '.ak-ency .ep-eq', '.ak-ic ul', '.t9klavye-kart-govde', '.sahne-panel', '.gx-st-side', '.gx-side .gx-toc', '.gx .sbz', '.gx .sbs', '.gx .sba', '.gx .gx-sb-vis', '.gx .gx-sb-pan', '.sim-kap', '.serit', '.sec-oge', '.sec-kat', '.ck-sekme', '#toc', '.ck-ic', '#ck-ic'].map((s) => s + ':not(._ab)').join(',');
  const SB_CSS = `@media (hover:hover) and (pointer:fine){
@supports selector(::-webkit-scrollbar){
${SB_INCE}{scrollbar-width:auto}
::-webkit-scrollbar{width:11px;height:11px;background:transparent}
::-webkit-scrollbar-button{display:none;width:0;height:0}
::-webkit-scrollbar-track,::-webkit-scrollbar-track-piece{background:transparent;border:0;box-shadow:none}
::-webkit-scrollbar-corner,::-webkit-resizer{background:transparent}
::-webkit-scrollbar-thumb{background-color:transparent;border:3px solid transparent;background-clip:padding-box;border-radius:99px;min-height:40px;min-width:40px}
[data-ab-sb]::-webkit-scrollbar-thumb{background-color:var(--ab-sb,rgba(116,124,136,.5))}
::-webkit-scrollbar-thumb:hover{background-color:var(--ab-sb-ust,rgba(96,104,116,.74));border-width:2px}
::-webkit-scrollbar-thumb:active{background-color:var(--ab-sb-ust,rgba(86,94,106,.82));border-width:2px}
}
@supports not selector(::-webkit-scrollbar){
*{scrollbar-width:thin}
:root{scrollbar-color:transparent transparent}
[data-ab-sb]{scrollbar-color:var(--ab-sb,rgba(116,124,136,.55)) transparent}
}
:root[data-theme=dark],:root.dark,:root[data-tema=koyu]{--ab-sb:rgba(176,186,200,.42);--ab-sb-ust:rgba(196,206,220,.66)}
}`;
  function sbKur() {
    if (document.getElementById('ab-sb')) return;
    const st = document.createElement('style'); st.id = 'ab-sb'; st.textContent = SB_CSS; (document.head || document.documentElement).appendChild(st);
    if (!(window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches)) return;
    let webkit = false; try { webkit = CSS.supports('selector(::-webkit-scrollbar)'); } catch (e) { webkit = false; }
    const zam = new Map(), gorulen = new WeakSet();
    const goster = (el, ms) => {
      if (!el || el.nodeType !== 1) return;
      if (webkit && !gorulen.has(el)) { gorulen.add(el); try { if (getComputedStyle(el).scrollbarWidth === 'thin') el.style.scrollbarWidth = 'auto'; } catch (e) { /* eski tarayıcı */ } }
      if (!el.hasAttribute('data-ab-sb')) el.setAttribute('data-ab-sb', '');
      clearTimeout(zam.get(el)); zam.set(el, setTimeout(() => { zam.delete(el); el.removeAttribute('data-ab-sb'); }, ms));
    };
    addEventListener('scroll', (e) => goster(e.target === document ? document.documentElement : e.target, 950), { capture: true, passive: true });
    let raf = 0, sonE = null; // işaretçi bir gezerin çubuk şeridine gelince
    addEventListener('mousemove', (e) => {
      sonE = e; if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0; const ev = sonE; if (!ev) return;
        const R = document.documentElement;
        if (ev.clientX >= R.clientWidth - 1 && R.scrollHeight > innerHeight + 2) { goster(R, 800); return; }
        let n = ev.target;
        for (let i = 0; n && n.nodeType === 1 && n !== document.body && i < 7; i++, n = n.parentElement) {
          if (n.clientWidth && n.offsetWidth - n.clientWidth > 6 && n.scrollHeight > n.clientHeight + 2) {
            const r = n.getBoundingClientRect();
            if (ev.clientX >= r.left + n.clientLeft + n.clientWidth - 1 && ev.clientX <= r.right) { goster(n, 800); return; }
          }
        }
      });
    }, { passive: true });
  }
  sbKur();

  // ---------- klavyeyle gezinme kipi (tembel modül) ----------
  let kgSoz = null;
  function kgYukle(sonra) {
    if (window.__klavyeGez) { if (sonra) sonra(window.__klavyeGez); return; }
    if (!kgSoz) kgSoz = new Promise((coz) => { const s = document.createElement('script'); s.src = `${KOK}ortak/klavye-gez.js?v=${SURUM}`; s.async = true; s.onload = () => coz(window.__klavyeGez || null); s.onerror = () => { kgSoz = null; coz(null); }; (document.head || document.documentElement).appendChild(s); });
    kgSoz.then((K) => { if (K && sonra) sonra(K); });
  }
  window.__abKgYukle = kgYukle;

  // ---------- boşluk: basılı tut (panel) · kısa (ilerlet) · çift (klavyeyle gez) ----------
  let sonTik = null;
  addEventListener('pointerdown', (e) => { sonTik = e.target; }, { capture: true, passive: true });
  function gezerBul(bas) {
    const R = document.scrollingElement || document.documentElement, ae = document.activeElement;
    let n = ae && ae !== document.body && ae !== document.documentElement ? ae : sonTik && sonTik.isConnected ? sonTik : bas;
    const yukari = (x) => { for (let i = 0; x && x.nodeType === 1 && x !== document.body && x !== document.documentElement && i < 40; i++, x = x.parentElement) { if (x.scrollHeight > x.clientHeight + 2) { const o = getComputedStyle(x).overflowY; if (o === 'auto' || o === 'scroll' || o === 'overlay') return x; } } return null; };
    let el = yukari(n);
    if (!el && R.scrollHeight <= R.clientHeight + 2) el = yukari(document.elementFromPoint(innerWidth / 2, innerHeight / 2)); // kök gezinmiyor (gömülü kitaplık): ortadaki gezer
    return el || R;
  }
  function ilerlet(yon, bas) {
    const el = gezerBul(bas), R = document.scrollingElement || document.documentElement, kok = el === R || el === document.body;
    const h = kok ? (window.visualViewport ? visualViewport.height : innerHeight) : el.clientHeight;
    const y0 = kok ? window.scrollY : el.scrollTop;
    (kok ? window : el).scrollBy({ top: yon * Math.max(40, Math.round(h * 0.875)), behavior: azHareket() ? 'auto' : 'smooth' });
    return { el: kok ? null : el, y0 };
  }
  function geriAl(s) { if (!s || s.y0 == null) return; const b = azHareket() ? 'auto' : 'smooth'; if (s.el) s.el.scrollTo({ top: s.y0, behavior: b }); else window.scrollTo({ top: s.y0, behavior: b }); }
  let tut = null, son = null, shiftT = 0, kgBek = 0, P = null;
  const ozelGirdi = (el) => !!el && ((el.classList && el.classList.contains('ab-girdi')) || el.id === 'ck-ara'); // panelin / kitaplığın arama kutusu
  const DUGME = 'button, summary, [role=button], [role=tab], [role=switch], [role=checkbox], [role=menuitem], [role=menuitemradio]';
  function uzunEylem() {
    if (!UST) { try { P.AraBalon.uzun({ devral: true }); } catch (e) { /* üst yok */ } return; }
    dolumBitir();
    if (DK_YEREL) {
      if (document.body.classList.contains('ck-acik')) { const h = location.hash; if (h.includes('/k/')) location.hash = h.split('/k/')[0]; }
      else dkYerel({ odak: true });
      return;
    }
    if (acik && !kenarda) kapat(); else ac({ odak: true });
  }
  function kipCevir(on) {
    if (!UST) { try { P.AraBalon.kip(); } catch (e) { /* üst yok */ } return; }
    const ac2 = on == null ? !kgAcik() : !!on;
    yazS('ab:kg', ac2 ? '1' : null);
    kgYukle((K) => { if (ac2) K.ac(); else K.kapat(); });
    if (ifr) { try { const w = ifr.contentWindow; if (w && w.__abKgYukle) w.__abKgYukle((K) => { if (ac2) K.ac(true); else K.kapat(true); }); } catch (e) { /* başka köken */ } }
  }
  function tutBitir() { if (tut) clearTimeout(tut.zm); tut = null; dolumBitir(); }
  function dolumBasla() { if (UST && balon && !balon.hidden) balon.classList.add('ab-dolum'); }
  function dolumBitir() { if (UST && balon) balon.classList.remove('ab-dolum'); }
  // yakalama evresi: tutulan boşluğun tekrarlarını yut, Shift'i izle, kipe ve menüye tuşları önce ver
  addEventListener('keydown', (e) => {
    if (e.key === 'Shift') { if (!shiftT) shiftT = performance.now(); return; }
    if (e.key === ' ') {
      if (tut) {
        if (!e.repeat && performance.now() - tut.t0 > 120) tutBitir(); // önceki bırakış başka belgeye gitmiş: yeni basış
        else { e.preventDefault(); e.stopImmediatePropagation(); return; }
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (ozelGirdi(e.target)) { // panelin kendi arama kutusu: boşluk yazılır; basılı tutulursa yazılan geri alınıp panel kapanır
        if (e.repeat) { e.preventDefault(); return; }
        if (oku('ab:basili') === '0') return;
        const g = e.target, onu = { v: g.value, s: g.selectionStart, e: g.selectionEnd };
        tut = { t0: performance.now(), girdi: true };
        tut.zm = setTimeout(() => { if (!tut) return; tut.uzun = true; try { g.value = onu.v; g.setSelectionRange(onu.s, onu.e); g.dispatchEvent(new Event('input', { bubbles: true })); } catch (x) { /* yok */ } uzunEylem(); }, 450);
        return;
      }
      if (!e.repeat) { const ilk = e.preventDefault; e.__abBaska = false; e.__abIlk = ilk; e.preventDefault = function () { this.__abBaska = true; return ilk.call(this); }; }
      return;
    }
    if (tut && !MODTUS.test(e.key)) { clearTimeout(tut.zm); tut.uzun = true; dolumBitir(); }
    if (UST && menuAcikMi() && menuTus(e)) return;
    if (e.key === 'Escape' && escTus(e)) return;
    const K = window.__klavyeGez;
    if (K && K.acik() && K.tus(e)) return;
  }, true);
  // kabarma evresi (pencerede en son): sayfa boşluğu kendisi işlemediyse karar
  addEventListener('keydown', (e) => {
    if (e.key !== ' ' || e.repeat || tut || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.__abBaska || e.defaultPrevented) return; // sayfa boşluğu kendisi işledi
    const t = e.target;
    if (yaziAlani(t) || kalemAcik()) return;
    const kip = kgAcik(), K = window.__klavyeGez;
    // odaktaki düğme: kısa basış onu çalıştırır (tarayıcı gibi), uzun basış paneli açar; bağ / sayfa: ilerletilir; ortam öğesi: dokunulmaz
    const dugme = t && t.closest ? t.closest(DUGME) : null;
    if (!kip && !dugme && etkilesimli(t) && !(t.closest && t.closest('a[href], [tabindex]'))) return;
    if (t && t.closest && t.closest('video, audio')) return;
    const basili = oku('ab:basili') !== '0', cift = oku('ab:cift') !== '0';
    if (!basili && !cift && !kip) return;
    const simdi = performance.now(), ilk = e.__abIlk || e.preventDefault;
    if (cift && son && simdi - son.t < 330) { // çift basış → klavyeyle gez
      ilk.call(e); tut = { t0: simdi, cift: true }; clearTimeout(kgBek); geriAl(son.g); son = null; kipCevir(); return;
    }
    ilk.call(e);
    tut = { t0: simdi, yon: shiftT && simdi - shiftT > 90 ? -1 : 1, hedef: t };
    const bu = tut;
    setTimeout(() => { if (tut === bu && e.__abBaska) tutBitir(); }, 0); // sonradan gelen bir işleyici boşluğu üstlendi
    if (basili) { tut.zm = setTimeout(() => { if (tut !== bu) return; bu.uzun = true; uzunEylem(); }, 450); if (UST && !acik) setTimeout(() => { if (tut === bu && !bu.uzun) dolumBasla(); }, 150); }
    if (kip && K && K.varMi()) bu.kipte = true; else if (dugme) bu.dugme = dugme;
  }, false);
  addEventListener('keyup', (e) => {
    if (e.key === 'Shift') { shiftT = 0; return; }
    if (e.key !== ' ' || !tut) return;
    const t = tut; tutBitir();
    if (t.girdi) { if (t.uzun) e.preventDefault(); return; }
    e.preventDefault();
    if (t.uzun || t.cift) return;
    const K = window.__klavyeGez;
    if (t.kipte && K && K.varMi()) { son = { t: performance.now(), g: null }; kgBek = setTimeout(() => { son = null; if (!K.bosluk()) ilerlet(t.yon, t.hedef); }, 300); return; }
    if (t.dugme) { const d = t.dugme; son = { t: performance.now(), g: null }; kgBek = setTimeout(() => { son = null; if (d.isConnected) d.click(); }, 300); return; } // düğmeyi tarayıcı gibi çalıştır (çift basış payı kadar sonra)
    son = { t: performance.now(), g: ilerlet(t.yon, t.hedef) };
  }, true);
  addEventListener('blur', () => { tutBitir(); shiftT = 0; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { tutBitir(); shiftT = 0; } });
  function escTus(e) {
    if (e.defaultPrevented) return false;
    const K = window.__klavyeGez, kip = !!(K && K.acik());
    if (kip && K.birakabilir(e)) { e.preventDefault(); e.stopImmediatePropagation(); K.birak(); return true; }
    if (!UST) return false; // gömülü kitaplık Esc'i kendisi üst pencereye iletir
    if (acik && pencere && !(yaziAlani(e.target) && !pencere.contains(e.target))) { e.preventDefault(); kapat(); return true; }
    if (DK_YEREL && document.body.classList.contains('ck-acik')) return false; // Ders Kitaplığı çekmecesini kendisi kapatır
    if (kip && !yaziAlani(e.target)) { e.preventDefault(); kipCevir(false); return true; }
    return false;
  }

  // ---------- iframe içi (gömülü kitaplık): yalnız gezinme çubuğu + tetiklerin üst pencereye iletilmesi + kip ----------
  if (!UST) {
    try { P = window.parent && window.parent.AraBalon ? window.parent : null; } catch (e) { P = null; }
    if (P && kgAcik()) kgYukle((K) => K.ac(true));
    return;
  }

  const DK_YEREL = !!document.getElementById('cekmece') && !!document.getElementById('ck-ara'); // Ders Kitaplığı'nın kendi sayfası (yerel çekmece)
  const D = Object.assign({ kenar: 'sag', yo: 0.74, gizli: false, kip: 'yuzen', yan: 'sag', p: null, ah: 0.6, bw: 0 }, okuJ('ab:durum'));
  const sakla = () => yaz('ab:durum', JSON.stringify(D));

  // ---------- kitap ipucu (hangi kitabın araması açılsın) ----------
  const YOL = { 'harita-okulu': 'mto302e', 'sinoptik-brifing': 'mto302e', 'hava-analizi-proje-rehberi': 'mto302e', 'hec-hms': 'mto316', 'hidrometeoroloji-quiz': 'mto316', 'cfd-temelleri': 'mto303e', 'bulut-fizigi-rehberi': 'mto342e' };
  const DERS = { 'mto-351': 'mto316', 'mto-316': 'mto316', 'mto-302': 'mto302e', 'mto-229': 'mto342e', 'mto-303': 'mto303e', 'mto-323': 'mto323' };
  function kitapIpucu() {
    const m = document.querySelector('meta[name="ara-kitap"]'); if (m && m.content) return m.content;
    const r = /(mto(?:302e|303e|316|323|342e))/i.exec(location.pathname + ' ' + location.hash); if (r) return r[1].toLowerCase();
    const s = /#\/ders\/(mto-\d+)/.exec(location.hash); if (s && DERS[s[1]]) return DERS[s[1]];
    const y = Object.keys(YOL).find((d) => location.pathname.includes('/' + d + '/')); if (y) return YOL[y]; // alt sitenin dersi
    return oku('ab:kitap') || 'mto316';
  }

  // ---------- stil ----------
  const YAY = 'cubic-bezier(.22,1.16,.36,1)', AKIS = 'cubic-bezier(.2,.8,.2,1)';
  const CSS = `
.ab-balon{position:fixed;left:0;top:0;z-index:2147482000;width:var(--ab-b,54px);height:var(--ab-b,54px);border-radius:50%;border:0;margin:0;padding:0;display:grid;place-items:center;background:#1d5fd6;color:#fff;box-shadow:0 6px 20px #0f2a5c55,0 1px 3px #0003;cursor:pointer;touch-action:none;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;will-change:transform;opacity:.96}
.ab-balon:hover{opacity:1}.ab-balon:focus-visible{outline:3px solid #f59e0b;outline-offset:3px}
.ab-balon svg{width:46%;height:46%;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;pointer-events:none}
.ab-balon::after{content:"";position:absolute;inset:-6px;border-radius:50%;border:3px solid rgba(29,95,214,.5);opacity:0;transform:scale(.84);pointer-events:none}
.ab-balon.ab-dolum::after{animation:abDolum .3s cubic-bezier(.3,.7,.3,1) forwards}
@keyframes abDolum{to{opacity:1;transform:scale(1.04)}}
.ab-balon.ab-tasiniyor{opacity:1;box-shadow:0 12px 32px #0f2a5c66}
.ab-balon.ab-gizle{opacity:0;pointer-events:none}
.ab-pencere{position:fixed;z-index:2147482001;left:0;top:0;display:flex;flex-direction:column;background:#fff;color:#111827;border:1px solid rgba(15,23,42,.11);border-radius:14px;box-shadow:0 28px 70px -18px rgba(15,23,42,.38),0 8px 22px -10px rgba(15,23,42,.2);overflow:hidden;transform-origin:50% 50%;transition:transform .26s ${AKIS},opacity .2s ease;will-change:transform,opacity;font:16px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;contain:layout paint}
.ab-pencere[hidden]{display:none!important}
.ab-pencere.ab-kapali{transform:scale(.06);opacity:0;pointer-events:none}
.ab-tut{flex:none;position:relative;display:block;width:100%;height:20px;margin:0;padding:0;border:0;border-radius:0;background:#f6f8fb;cursor:grab;touch-action:none;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}
.ab-tut::before{content:"";position:absolute;left:50%;top:8px;width:38px;height:5px;margin-left:-19px;border-radius:99px;background:rgba(60,66,78,.26);transition:background .18s,width .2s ${YAY},margin .2s ${YAY}}
.ab-tut:hover::before,.ab-tut:focus-visible::before,.ab-tut[aria-expanded=true]::before,.ab-tutuldu .ab-tut::before{background:rgba(60,66,78,.52);width:50px;margin-left:-25px}
.ab-tut:focus-visible{outline:none;box-shadow:inset 0 0 0 2px #1d5fd6}
.ab-tutuldu .ab-tut{cursor:grabbing}
html.ab-dar .ab-tut{height:26px}html.ab-dar .ab-tut::before{top:11px;width:44px;margin-left:-22px}
@media (pointer:coarse){.ab-tut{height:28px}.ab-tut::before{top:12px;width:46px;margin-left:-23px}}
.ab-ust{display:flex;align-items:center;gap:6px;padding:2px 8px 8px 10px;border-bottom:1px solid #e6eaf0;background:#f6f8fb;touch-action:none;cursor:move}
.ab-girdi{flex:1;min-width:0;height:44px;border:1px solid #d3dbe6;border-radius:12px;padding:0 12px;font:inherit;font-size:17px;color:inherit;background:#fff;cursor:text;touch-action:manipulation;transition:border-color .16s,box-shadow .16s}
.ab-girdi:focus{outline:none;border-color:#1d5fd6;box-shadow:0 0 0 3px rgba(29,95,214,.18)}
.ab-d{flex:none;width:44px;height:44px;border:0;border-radius:12px;background:transparent;color:#374151;display:grid;place-items:center;cursor:pointer;padding:0;text-decoration:none;transition:background .14s}
.ab-d:hover{background:#e8eef7}.ab-d:focus-visible{outline:2px solid #1d5fd6}
.ab-d svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ab-govde{position:relative;flex:1;min-height:0;background:#fff}
.ab-if{position:absolute;inset:0;width:100%;height:100%;border:0;background:#fff}
.ab-kalkan{position:absolute;inset:0;display:none;cursor:move}
.ab-pencere.ab-tutuldu .ab-kalkan{display:block}
.ab-yuk{position:absolute;inset:auto 0 0 0;top:40%;text-align:center;color:#6b7280;margin:0;font-size:15px}
.ab-boy{position:absolute;z-index:4;touch-action:none}
.ab-boy[data-y=r]{top:18px;bottom:18px;right:0;width:5px;cursor:ew-resize}
.ab-boy[data-y=l]{top:18px;bottom:18px;left:0;width:5px;cursor:ew-resize}
.ab-boy[data-y=b]{left:18px;right:18px;bottom:0;height:5px;cursor:ns-resize}
.ab-boy[data-y=br]{right:0;bottom:0;width:18px;height:18px;cursor:nwse-resize}
.ab-boy[data-y=bl]{left:0;bottom:0;width:18px;height:18px;cursor:nesw-resize}
.ab-boy[data-y=br]::after,.ab-boy[data-y=bl]::after{content:"";position:absolute;bottom:4px;width:9px;height:9px;border-bottom:2px solid rgba(90,100,115,.5);opacity:0;transition:opacity .2s}
.ab-boy[data-y=br]::after{right:4px;border-right:2px solid rgba(90,100,115,.5);border-bottom-right-radius:8px}
.ab-boy[data-y=bl]::after{left:4px;border-left:2px solid rgba(90,100,115,.5);border-bottom-left-radius:8px}
.ab-pencere:hover .ab-boy::after,.ab-pencere.ab-boyda .ab-boy::after{opacity:1}
html.ab-dar .ab-boy,html.ab-bol .ab-boy{display:none}
html.ab-bol:not(.ab-dar):not(.ab-sol) .ab-boy[data-y=l],html.ab-bol.ab-sol:not(.ab-dar) .ab-boy[data-y=r]{display:block;top:0;bottom:0}
html.ab-bol .ab-pencere{border-radius:0;box-shadow:-10px 0 40px #0f172a2a}
html.ab-bol.ab-sol .ab-pencere{box-shadow:10px 0 40px #0f172a2a}
html.ab-bol.ab-dar .ab-pencere{border-radius:18px 18px 0 0;box-shadow:0 -10px 40px #0f172a33}
@media (min-width:1100px){html.ab-bol.ab-acik:not(.ab-dar):not(.ab-kenarda):not(.ab-sol) body{margin-right:var(--ab-gen,420px)!important}html.ab-bol.ab-sol.ab-acik:not(.ab-dar):not(.ab-kenarda) body{margin-left:var(--ab-gen,420px)!important}}
.ab-menu{position:fixed;z-index:2147482010;left:0;top:0;min-width:214px;padding:5px;border-radius:12px;background:rgba(250,251,253,.84);-webkit-backdrop-filter:saturate(180%) blur(22px);backdrop-filter:saturate(180%) blur(22px);box-shadow:0 16px 44px -10px rgba(15,23,42,.36),0 0 0 .5px rgba(15,23,42,.18);color:#111827;font:14px/1.2 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;transform-origin:50% 0;transition:transform .2s ${YAY},opacity .14s ease}
.ab-menu[hidden]{display:none!important}
.ab-menu.ab-kapali{opacity:0;transform:scale(.94) translateY(-4px);pointer-events:none}
.ab-mo{display:flex;align-items:center;gap:10px;width:100%;min-height:32px;margin:0;padding:0 10px;border:0;border-radius:7px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:default;-webkit-tap-highlight-color:transparent}
.ab-mo svg{width:17px;height:17px;flex:none;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;opacity:.78}
.ab-mo .ab-mt{flex:1}
.ab-mo .ab-ms{font-size:12px;opacity:.5}
.ab-mo[aria-checked=true]::after{content:"";width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.72}
.ab-mo:hover,.ab-mo:focus{outline:none;background:#1d5fd6;color:#fff}.ab-mo:hover svg,.ab-mo:focus svg{opacity:1}
.ab-ma{height:1px;margin:5px 8px;background:rgba(15,23,42,.1)}
@media (pointer:coarse){.ab-mo{min-height:44px;font-size:16px}.ab-menu{min-width:236px}}
.ab-kulak{position:fixed;z-index:2147482003;left:0;top:0;width:44px;height:120px;margin:0;padding:0;border:0;background:transparent;cursor:pointer;touch-action:none;-webkit-tap-highlight-color:transparent;opacity:0;transition:opacity .2s ease}
.ab-kulak[hidden]{display:none}
.ab-kulak.ab-gor{opacity:1}
.ab-kulak::before{content:"";position:absolute;top:50%;width:6px;height:76px;margin-top:-38px;border-radius:99px;background:rgba(40,46,58,.5);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 4px 16px rgba(15,23,42,.22),0 0 0 .5px rgba(255,255,255,.6);transition:width .2s ${YAY},height .2s ${YAY},margin .2s ${YAY},background .18s}
.ab-kulak[data-yon=sag]::before{right:5px}.ab-kulak[data-yon=sol]::before{left:5px}
.ab-kulak:hover::before,.ab-kulak:focus-visible::before,.ab-kulak.ab-cekiliyor::before{width:8px;height:92px;margin-top:-46px;background:rgba(29,95,214,.9)}
.ab-kulak:focus-visible{outline:none}
.ab-ipucu{position:fixed;z-index:2147481999;top:0;bottom:0;width:14px;pointer-events:none;opacity:0;transition:opacity .16s}
.ab-ipucu[data-yon=sag]{right:0;background:linear-gradient(to left,rgba(29,95,214,.32),transparent)}
.ab-ipucu[data-yon=sol]{left:0;background:linear-gradient(to right,rgba(29,95,214,.32),transparent)}
.ab-ipucu.ab-gor{opacity:1}
.ab-cip{position:fixed;z-index:2147482002;left:0;top:0;display:flex;align-items:center;gap:6px;min-height:40px;padding:0 14px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;color:#1d5fd6;font:600 15px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;box-shadow:0 6px 20px #0f172a2a;cursor:pointer;transition:opacity .16s;max-width:min(80vw,360px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ab-cip[hidden]{display:none}
.ab-cip svg{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round}
:root[data-theme=dark] .ab-pencere,:root[data-theme=dark] .ab-govde,:root[data-theme=dark] .ab-if{background:#0e131b;color:#e8edf4;border-color:#283244}
:root[data-theme=dark] .ab-ust,:root[data-theme=dark] .ab-tut{background:#161d28;border-color:#283244}
:root[data-theme=dark] .ab-tut::before{background:rgba(220,228,240,.3)}
:root[data-theme=dark] .ab-girdi{background:#0e131b;border-color:#3a475c;color:#e8edf4}
:root[data-theme=dark] .ab-d{color:#c9d3e1}:root[data-theme=dark] .ab-d:hover{background:#223047}
:root[data-theme=dark] .ab-cip{background:#161d28;border-color:#3a475c;color:#6ea2ff}
:root[data-theme=dark] .ab-menu{background:rgba(30,36,48,.84);color:#e8edf4;box-shadow:0 16px 44px -10px rgba(0,0,0,.6),0 0 0 .5px rgba(255,255,255,.14)}
:root[data-theme=dark] .ab-ma{background:rgba(255,255,255,.12)}
:root[data-theme=dark] .ab-kulak::before{background:rgba(220,228,240,.55)}
.ck-yz-kose{background:none!important}
.ck-yz-kose::after{content:"";position:absolute;right:7px;bottom:7px;width:11px;height:11px;border-right:2px solid rgba(90,100,115,.5);border-bottom:2px solid rgba(90,100,115,.5);border-bottom-right-radius:9px;opacity:0;transition:opacity .2s;pointer-events:none}
#cekmece:hover .ck-yz-kose::after,body.ck-surukle .ck-yz-kose::after{opacity:1}
.ab-az .ab-pencere,.ab-az .ab-balon,.ab-az .ab-cip,.ab-az .ab-menu,.ab-az .ab-kulak{transition:none!important}
.ab-az .ab-balon.ab-dolum::after{animation:none;opacity:1;transform:none}
@media print{.ab-balon,.ab-pencere,.ab-cip,.ab-menu,.ab-kulak,.ab-ipucu{display:none!important}}`;
  const IK = {
    ara: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.6-4.6"/></svg>',
    geri: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    bol: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M14 4v16"/></svg>',
    bolSol: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M10 4v16"/></svg>',
    alt: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 12.5h18"/></svg>',
    yuz: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.5"/><rect x="11" y="10" width="8" height="7" rx="1.2"/></svg>',
    gizSag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7l5 5-5 5M13 7l5 5-5 5"/></svg>',
    gizSol: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 7l-5 5 5 5M11 7l-5 5 5 5"/></svg>',
    balon: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><circle cx="11.2" cy="11.2" r="3.2"/><path d="m13.6 13.6 2.4 2.4"/></svg>',
    ac: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  };

  let balon = null, pencere = null, girdi = null, ifr = null, cip = null, acBag = null, kipDug = null, yukNot = null, tutEl = null;
  let menu = null, kulak = null, ipucu = null, kenarda = null;
  let acik = false, ifHazir = false, bekleyen = null, sonDurum = null;
  const gom = () => { try { return ifr && ifr.contentWindow && ifr.contentWindow.__dkGomulu; } catch (e) { return null; } };
  // satır içi geçiş: verilen süre sonra sınıf geçişlerine döner
  function gecis(el, deger, ms) { el.style.transition = deger; clearTimeout(el._gz); el._gz = setTimeout(() => { el.style.transition = ''; }, ms || 420); }

  function kur() {
    if (balon) return;
    const st = document.createElement('style'); st.id = 'ab-stil'; st.textContent = CSS; document.head.appendChild(st);
    balon = document.createElement('button');
    balon.type = 'button'; balon.className = 'ab-balon'; balon.innerHTML = IK.ara;
    balon.setAttribute('aria-label', 'Sitede ara (masada boşluğa basılı tut)'); balon.title = 'Ara · masada boşluğa basılı tut';
    if (oku('ab:gizli') === '1') balon.hidden = true;
    document.body.appendChild(balon);
    balonOlay(); balonYerle(false);
    if (DK_YEREL) { // Ders Kitaplığı: çekmece açıkken balon gizlenir (çekmece zaten arama paneli; içeriği örtmesin)
      const g = () => balon.classList.toggle('ab-gizle', document.body.classList.contains('ck-acik'));
      new MutationObserver(g).observe(document.body, { attributes: true, attributeFilter: ['class'] }); g();
    }
    addEventListener('resize', () => { balonYerle(false); if (acik) { pencereYerle(); if (kenarda) kenarYerle(); } menuKapat(false); }, { passive: true });
    if (window.visualViewport) visualViewport.addEventListener('resize', () => { if (acik) pencereYerle(); }, { passive: true });
    if (!DK_YEREL) { const bos = window.requestIdleCallback || ((f) => setTimeout(f, 1500)); bos(() => pencereKur(), { timeout: 5000 }); } // pencere iskeleti boşta: ilk açılış takılmasın
    if (kgAcik()) kgYukle((K) => K.ac('kisa'));
  }

  // ---------- balon: sürükle → kenara yapış; dokun → aç ----------
  const bBoy = () => (dar() ? 56 : 52);
  function balonYerle(anim) {
    if (!balon) return;
    const B = bBoy(), W = genis(), H = innerHeight;
    balon.style.setProperty('--ab-b', B + 'px');
    const y = Math.round(Math.max(64, Math.min(H - B - 12, D.yo * H)));
    const pay = D.gizli ? -Math.round(B * 0.42) : 12;
    const x = D.kenar === 'sol' ? pay : W - B - pay;
    balon.style.transition = anim && !azHareket() ? `transform .24s ${AKIS},opacity .2s` : 'opacity .2s';
    balon.style.transform = `translate3d(${x}px,${y}px,0)`;
    balon.dataset.kenar = D.kenar; balon.classList.toggle('ab-yari', !!D.gizli);
  }
  function balonOlay() {
    let s = null, raf = 0, sonSurukle = 0;
    balon.addEventListener('click', (e) => { e.preventDefault(); if (Date.now() - sonSurukle < 400) return; ac({ odak: true }); });
    balon.addEventListener('pointerdown', (e) => {
      if (e.button) return;
      const r = balon.getBoundingClientRect();
      s = { x0: e.clientX, y0: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, oyn: false, id: e.pointerId, x: r.left, y: r.top };
      try { balon.setPointerCapture(e.pointerId); } catch (x) { /* yok */ }
    });
    balon.addEventListener('pointermove', (e) => {
      if (!s) return;
      if (!s.oyn && Math.hypot(e.clientX - s.x0, e.clientY - s.y0) < 7) return;
      s.oyn = true; balon.classList.add('ab-tasiniyor'); s.x = e.clientX - s.dx; s.y = e.clientY - s.dy;
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (s) { balon.style.transition = 'none'; balon.style.transform = `translate3d(${s.x}px,${s.y}px,0)`; } });
    });
    const birak = (e) => {
      if (!s) return; const t = s; s = null; balon.classList.remove('ab-tasiniyor');
      if (!t.oyn) return; // dokunuş: «click»te açılır (hayalet tık alttaki bağa düşmesin, odak klavyeyi açsın)
      sonSurukle = Date.now();
      const W = genis(), B = bBoy(), cx = t.x + B / 2;
      D.kenar = cx < W / 2 ? 'sol' : 'sag';
      D.gizli = D.kenar === 'sol' ? e.clientX < 26 : e.clientX > W - 26;
      D.yo = Math.max(0.08, Math.min(0.92, t.y / innerHeight));
      sakla(); balonYerle(true);
    };
    balon.addEventListener('pointerup', birak);
    balon.addEventListener('pointercancel', birak);
    balon.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // ---------- pencere ----------
  function pencereKur() {
    if (pencere) return;
    pencere = document.createElement('div');
    pencere.className = 'ab-pencere ab-kapali'; pencere.hidden = true; pencere.id = 'ab-pencere';
    pencere.setAttribute('role', 'dialog'); pencere.setAttribute('aria-label', 'Sitede ara');
    pencere.innerHTML = `<button type="button" class="ab-tut" aria-haspopup="menu" aria-expanded="false" aria-label="Panel seçenekleri · sürükle: taşı, sağa ya da sola gizle" title="Seçenekler · sürükle: sağa / sola gizle"></button><div class="ab-ust"><button type="button" class="ab-d ab-geri" aria-label="Geri" title="Geri">${IK.geri}</button><input class="ab-girdi" type="search" enterkeyhint="search" autocomplete="off" spellcheck="false" placeholder="Ara: kavram, terim, formül, soru" aria-label="Ara: kavram, terim, formül, soru"><button type="button" class="ab-d ab-kip" aria-label="Bölünmüş görünüm" title="Yüzen ↔ bölünmüş">${IK.bol}</button><a class="ab-d ab-ac" href="${KOK}ders-kitapligi/" aria-label="Ders Kitaplığı'nda aç" title="Ders Kitaplığı'nda aç">${IK.ac}</a><button type="button" class="ab-d ab-kapat" aria-label="Kapat" title="Kapat (Esc)">${IK.x}</button></div><div class="ab-govde"><p class="ab-yuk">Yükleniyor…</p><iframe class="ab-if" title="Ders Kitaplığı: arama ve kavramlar" referrerpolicy="same-origin"></iframe><div class="ab-kalkan"></div></div>` + ['l', 'r', 'b', 'bl', 'br'].map((y) => `<div class="ab-boy" data-y="${y}" aria-hidden="true"></div>`).join('');
    document.body.appendChild(pencere);
    girdi = pencere.querySelector('.ab-girdi'); ifr = pencere.querySelector('.ab-if'); acBag = pencere.querySelector('.ab-ac'); kipDug = pencere.querySelector('.ab-kip'); yukNot = pencere.querySelector('.ab-yuk'); tutEl = pencere.querySelector('.ab-tut');
    ifr.addEventListener('load', () => { const G = gom(); if (!G) return; ifHazir = true; yukNot.hidden = true; if (bekleyen) { const b = bekleyen; bekleyen = null; if (b.ck) G.git(b.kitap, b.ck); else G.ara(b.q || ''); } });
    let zm = 0;
    girdi.addEventListener('input', () => { clearTimeout(zm); zm = setTimeout(() => ara(girdi.value.trim()), 110); });
    girdi.addEventListener('keydown', (e) => {
      const G = gom();
      if (e.key === 'Enter') { e.preventDefault(); clearTimeout(zm); ara(girdi.value.trim()); setTimeout(() => { const g = gom(); if (g) g.ilk(); }, 160); }
      else if (e.key === 'ArrowDown' && G) { e.preventDefault(); ifr.focus(); G.odak(); }
      else if (e.key === 'Escape') { e.preventDefault(); kapat(); }
    });
    pencere.querySelector('.ab-kapat').addEventListener('click', () => kapat());
    pencere.querySelector('.ab-geri').addEventListener('click', () => { const G = gom(); if (G) G.geri(); });
    kipDug.addEventListener('click', () => { D.kip = D.kip === 'bol' ? 'yuzen' : 'bol'; sakla(); kipYaz(); pencereYerle(); });
    acBag.addEventListener('click', () => kapat(true));
    tasiOlay(); tutOlay(); kipYaz();
  }
  function kipYaz() {
    const bol = D.kip === 'bol', h = document.documentElement;
    h.classList.toggle('ab-bol', bol); h.classList.toggle('ab-sol', bol && D.yan === 'sol'); h.classList.toggle('ab-dar', dar()); h.classList.toggle('ab-az', azHareket());
    kipDug.innerHTML = bol ? IK.yuz : D.yan === 'sol' && !dar() ? IK.bolSol : IK.bol; kipDug.setAttribute('aria-label', bol ? 'Yüzen pencere' : 'Bölünmüş görünüm');
  }
  // yüzen: D.p {x,y,w,h} ekrana sığdırılır; bölünmüş: masada sağda / solda tam boy, telefonda altta
  function pencereYerle() {
    if (!pencere) return;
    const vv = window.visualViewport, W = genis(), H = vv ? Math.min(innerHeight, vv.height) : innerHeight;
    document.documentElement.classList.toggle('ab-dar', dar());
    let x, y, w, h;
    if (D.kip === 'bol') {
      if (dar()) { w = W; h = Math.round(H * sinir(D.ah || 0.6, 0.3, 0.94)); x = 0; y = H - h; }
      else { w = Math.round(sinir(D.bw || W * 0.32, 340, Math.min(720, W * 0.6))); h = innerHeight; x = D.yan === 'sol' ? 0 : W - w; y = 0; document.documentElement.style.setProperty('--ab-gen', w + 'px'); }
    } else {
      const P0 = D.p || {};
      if (dar()) { w = W - 16; h = Math.round(Math.min(H - 24, P0.h || H * 0.8)); x = 8; y = Math.round(Math.max(8, Math.min(H - h - 8, P0.y != null ? P0.y : H * 0.08))); }
      else {
        w = Math.round(Math.max(320, Math.min(W - 24, P0.w || 440))); h = Math.round(Math.max(280, Math.min(H - 24, P0.h || Math.min(720, H - 96))));
        x = P0.x != null ? P0.x : (D.kenar === 'sol' ? 16 : W - w - 16); y = P0.y != null ? P0.y : Math.max(12, Math.round((H - h) / 2));
        x = Math.round(Math.max(8, Math.min(W - w - 8, x))); y = Math.round(Math.max(8, Math.min(H - h - 8, y)));
      }
    }
    Object.assign(pencere.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
  }
  // üst çubuk boşluğundan taşı (ETK4) + kenar / köşe tutamaklarıyla boyutlandır (yüzen; bölünmüşte iç kenar = genişlik)
  function tasiOlay() {
    const ust = pencere.querySelector('.ab-ust');
    let s = null;
    const bas = (e, tur) => {
      if (e.button || (tur === 'tasi' && (D.kip === 'bol' || e.target.closest('input, button, a')))) return;
      const r = pencere.getBoundingClientRect();
      s = { tur, x0: e.clientX, y0: e.clientY, r, oyn: false };
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (x) { /* yok */ }
    };
    const git = (e) => {
      if (!s) return;
      const dx = e.clientX - s.x0, dy = e.clientY - s.y0;
      if (!s.oyn && Math.hypot(dx, dy) < 4) return;
      if (!s.oyn) { s.oyn = true; pencere.classList.add('ab-tutuldu'); if (s.tur !== 'tasi') pencere.classList.add('ab-boyda'); pencere.style.transition = 'none'; }
      const W = genis(), H = innerHeight, r = s.r, y = s.tur;
      if (y === 'tasi') { pencere.style.left = Math.round(Math.max(8 - r.width + 120, Math.min(W - 120, r.left + dx))) + 'px'; pencere.style.top = Math.round(Math.max(0, Math.min(H - 60, r.top + dy))) + 'px'; return; }
      if (D.kip === 'bol') { const w = Math.round(sinir(D.yan === 'sol' ? e.clientX : W - e.clientX, 340, Math.min(720, W * 0.6))); pencere.style.width = w + 'px'; if (D.yan !== 'sol') pencere.style.left = (W - w) + 'px'; document.documentElement.style.setProperty('--ab-gen', w + 'px'); return; }
      if (y.includes('r')) pencere.style.width = Math.round(Math.max(320, Math.min(W - r.left - 4, r.width + dx))) + 'px';
      if (y.includes('l')) { const w = Math.round(Math.max(320, Math.min(r.right - 4, r.width - dx))); pencere.style.width = w + 'px'; pencere.style.left = Math.round(r.right - w) + 'px'; }
      if (y.includes('b')) pencere.style.height = Math.round(Math.max(260, Math.min(H - r.top - 4, r.height + dy))) + 'px';
    };
    const bit = () => {
      if (!s) return; const t = s; s = null; pencere.classList.remove('ab-tutuldu', 'ab-boyda'); pencere.style.transition = '';
      if (!t.oyn) return;
      const r = pencere.getBoundingClientRect();
      if (D.kip === 'bol') D.bw = Math.round(r.width); else D.p = { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
      sakla(); pencereYerle();
    };
    const bagla = (el, tur) => { el.addEventListener('pointerdown', (e) => bas(e, tur)); el.addEventListener('pointermove', git); el.addEventListener('pointerup', bit); el.addEventListener('pointercancel', bit); };
    bagla(ust, 'tasi');
    pencere.querySelectorAll('.ab-boy').forEach((el) => bagla(el, el.dataset.y));
    ust.addEventListener('dblclick', (e) => { if (!e.target.closest('input, button, a') && D.kip !== 'bol') { D.p = null; sakla(); pencereYerle(); } });
  }

  // ---------- tutma çubuğu: dokun → menü · sürükle → taşı / sağa-sola gizle ----------
  function hiz(iz) { // son ~100 ms'deki yatay hız (px/ms)
    if (iz.length < 2) return 0; const s = iz[iz.length - 1]; let i = iz.length - 2; while (i > 0 && s[2] - iz[i][2] < 100) i--;
    const a = iz[i], dt = Math.max(8, s[2] - a[2]); return (s[0] - a[0]) / dt;
  }
  function gizlemeYonu(t, px, dx, v) {
    const W = genis();
    if (t.eksen === 'x') { if (dx > 44 || (v > 0.32 && dx > 14)) return 'sag'; if (dx < -44 || (v < -0.32 && dx < -14)) return 'sol'; return null; }
    if (t.eksen === 'serbest') { if (px > W - 64 || (v > 0.42 && dx > 24)) return 'sag'; if (px < 64 || (v < -0.42 && dx < -24)) return 'sol'; return null; }
    return null;
  }
  function ipucuGoster(yon) {
    if (!yon) { if (ipucu) ipucu.classList.remove('ab-gor'); return; }
    if (!ipucu) { ipucu = document.createElement('div'); ipucu.className = 'ab-ipucu'; ipucu.setAttribute('aria-hidden', 'true'); document.body.appendChild(ipucu); }
    ipucu.dataset.yon = yon; ipucu.classList.add('ab-gor');
  }
  function tutOlay() {
    let s = null, sonSur = 0;
    tutEl.addEventListener('click', (e) => { if (Date.now() - sonSur < 350) return; if (menuAcikMi()) menuKapat(true); else menuAc(e.detail === 0); });
    tutEl.addEventListener('pointerdown', (e) => {
      if (e.button) return;
      s = { x0: e.clientX, y0: e.clientY, r: pencere.getBoundingClientRect(), oyn: false, eksen: null, iz: [[e.clientX, e.clientY, e.timeStamp]] };
      try { tutEl.setPointerCapture(e.pointerId); } catch (x) { /* yok */ }
    });
    tutEl.addEventListener('pointermove', (e) => {
      if (!s) return;
      const dx = e.clientX - s.x0, dy = e.clientY - s.y0;
      s.iz.push([e.clientX, e.clientY, e.timeStamp]); if (s.iz.length > 8) s.iz.shift();
      if (!s.oyn) {
        if (Math.hypot(dx, dy) < 6) return;
        s.oyn = true; menuKapat(false); pencere.classList.add('ab-tutuldu'); pencere.style.transition = 'none';
        const yatay = Math.abs(dx) >= Math.abs(dy) * 0.8;
        s.eksen = dar() ? (yatay ? 'x' : 'y') : D.kip === 'bol' ? (yatay ? 'x' : 'yok') : 'serbest'; // masada yan panel: yalnız yatay (gizle)
      }
      const W = genis(), H = innerHeight, r = s.r;
      if (s.eksen === 'yok') return;
      if (s.eksen === 'x') { pencere.style.transform = `translate3d(${dx}px,0,0)`; pencere.style.opacity = String(1 - Math.min(0.3, Math.abs(dx) / W)); ipucuGoster(gizlemeYonu(s, e.clientX, dx, hiz(s.iz))); }
      else if (s.eksen === 'y') {
        if (D.kip === 'bol') { const h = Math.round(sinir(r.height - dy, H * 0.3, H * 0.94)); pencere.style.top = (H - h) + 'px'; pencere.style.height = h + 'px'; }
        else pencere.style.top = Math.round(sinir(r.top + dy, 8, H - 120)) + 'px';
      } else {
        pencere.style.left = Math.round(sinir(r.left + dx, 8 - r.width * 0.7, W - r.width * 0.3)) + 'px'; pencere.style.top = Math.round(sinir(r.top + dy, 0, H - 60)) + 'px';
        ipucuGoster(gizlemeYonu(s, e.clientX, dx, hiz(s.iz)));
      }
    });
    const bit = (e) => {
      if (!s) return; const t = s; s = null; pencere.classList.remove('ab-tutuldu'); ipucuGoster(null);
      if (!t.oyn || t.eksen === 'yok') { pencere.style.transition = ''; if (t.oyn) sonSur = Date.now(); return; }
      sonSur = Date.now();
      const dx = e.clientX - t.x0, H = innerHeight, yon = e.type === 'pointercancel' ? null : gizlemeYonu(t, e.clientX, dx, hiz(t.iz));
      if (yon) {
        if (t.eksen === 'serbest') { // eski yerine dönerek gizlenir (geri gelince orada açılır)
          const r2 = pencere.getBoundingClientRect();
          pencere.style.left = Math.round(t.r.left) + 'px'; pencere.style.top = Math.round(t.r.top) + 'px';
          pencere.style.transform = `translate3d(${Math.round(r2.left - t.r.left)}px,${Math.round(r2.top - t.r.top)}px,0)`;
          void pencere.offsetWidth;
        }
        kenaraGizle(yon); return;
      }
      pencere.style.transition = '';
      if (t.eksen === 'x') { gecis(pencere, azHareket() ? 'none' : `transform .34s ${YAY},opacity .2s ease`); pencere.style.transform = ''; pencere.style.opacity = ''; return; }
      const r = pencere.getBoundingClientRect();
      if (t.eksen === 'y') { if (D.kip === 'bol') D.ah = Math.round((r.height / H) * 100) / 100; else D.p = Object.assign({}, D.p || {}, { y: Math.round(r.top), h: Math.round(r.height) }); }
      else D.p = { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
      sakla(); pencereYerle();
    };
    tutEl.addEventListener('pointerup', bit); tutEl.addEventListener('pointercancel', bit);
  }

  // ---------- kenara gizle / geri getir ----------
  function kenarTx(yon) {
    const W = genis(), x = parseFloat(pencere.style.left) || 0, w = parseFloat(pencere.style.width) || pencere.offsetWidth;
    return yon === 'sag' ? Math.round(W - x + 16) : Math.round(-(x + w + 16));
  }
  function kulakKur() {
    if (kulak) return;
    kulak = document.createElement('button'); kulak.type = 'button'; kulak.className = 'ab-kulak'; kulak.hidden = true;
    kulak.setAttribute('aria-label', 'Arama panelini geri getir'); kulak.setAttribute('aria-controls', 'ab-pencere'); kulak.title = 'Arama paneli · dokun ya da içeri sürükle';
    document.body.appendChild(kulak);
    let s = null, sonSur = 0;
    kulak.addEventListener('click', () => { if (Date.now() - sonSur < 350) return; kenardanGetir(true); });
    kulak.addEventListener('pointerdown', (e) => { if (e.button) return; s = { x0: e.clientX, y0: e.clientY, oyn: false, eksen: null, tx: kenarTx(kenarda), ky: parseFloat(kulak.dataset.y) || 0, iz: [[e.clientX, e.clientY, e.timeStamp]] }; try { kulak.setPointerCapture(e.pointerId); } catch (x) { /* yok */ } });
    kulak.addEventListener('pointermove', (e) => {
      if (!s || !kenarda) return;
      const dx = e.clientX - s.x0, dy = e.clientY - s.y0, ice = kenarda === 'sag' ? -dx : dx;
      s.iz.push([e.clientX, e.clientY, e.timeStamp]); if (s.iz.length > 8) s.iz.shift();
      if (!s.oyn) { if (Math.hypot(dx, dy) < 7) return; s.oyn = true; s.eksen = Math.abs(dy) > Math.abs(dx) * 1.2 ? 'y' : 'x'; kulak.classList.add('ab-cekiliyor'); pencere.style.transition = 'none'; }
      if (s.eksen === 'y') { const y = Math.round(sinir(s.ky + dy, 8, innerHeight - 128)); kulak.dataset.y = String(y); kulak.style.transform = `translate3d(${kulak.dataset.x}px,${y}px,0)`; return; }
      const k = Math.max(0, ice), tx = kenarda === 'sag' ? s.tx - k : s.tx + k;
      pencere.style.transform = `translate3d(${Math.round(tx)}px,0,0)`;
    });
    const bit = (e) => {
      if (!s) return; const t = s; s = null; kulak.classList.remove('ab-cekiliyor');
      if (!t.oyn || !kenarda) return;
      sonSur = Date.now();
      if (t.eksen === 'y') { kulak.dataset.oy = '1'; return; }
      const dx = e.clientX - t.x0, ice = kenarda === 'sag' ? -dx : dx, v = hiz(t.iz) * (kenarda === 'sag' ? -1 : 1);
      if (e.type !== 'pointercancel' && (ice > 56 || (v > 0.3 && ice > 12))) kenardanGetir(false);
      else { gecis(pencere, azHareket() ? 'none' : `transform .26s ${AKIS}`); pencere.style.transform = `translate3d(${kenarTx(kenarda)}px,0,0)`; }
    };
    kulak.addEventListener('pointerup', bit); kulak.addEventListener('pointercancel', bit);
  }
  function kenarYerle() {
    if (!kenarda || !kulak) return;
    const H = innerHeight, r = { top: parseFloat(pencere.style.top) || 0, h: parseFloat(pencere.style.height) || 300 };
    const y = kulak.dataset.oy === '1' ? sinir(parseFloat(kulak.dataset.y) || 0, 8, H - 128) : Math.round(sinir(r.top + r.h / 2 - 60, 8, H - 128));
    const x = kenarda === 'sag' ? innerWidth - 44 : 0; // gerçek kenar (görünmez gezinme çubuğu şeridinin üstü)
    kulak.dataset.x = String(x); kulak.dataset.y = String(y); kulak.dataset.yon = kenarda;
    kulak.style.transform = `translate3d(${x}px,${y}px,0)`;
    pencere.style.transform = `translate3d(${kenarTx(kenarda)}px,0,0)`;
  }
  function kenaraGizle(yon) {
    if (!acik || !pencere) return;
    menuKapat(false); kulakKur();
    const odakIcinde = pencere.contains(document.activeElement) || document.activeElement === ifr;
    kenarda = yon;
    gecis(pencere, azHareket() ? 'none' : `transform .28s ${AKIS},opacity .22s ease`, 460);
    pencere.style.opacity = '';
    pencere.style.transform = `translate3d(${kenarTx(yon)}px,0,0)`;
    pencere.setAttribute('aria-hidden', 'true'); pencere.inert = true;
    document.documentElement.classList.add('ab-kenarda');
    kulak.hidden = false; kulak.dataset.oy = ''; kenarYerle();
    requestAnimationFrame(() => kulak.classList.add('ab-gor'));
    if (odakIcinde) kulak.focus({ preventScroll: true });
  }
  function kenardanGetir(odak) {
    if (!kenarda) return;
    kenarda = null;
    pencere.removeAttribute('aria-hidden'); pencere.inert = false;
    document.documentElement.classList.remove('ab-kenarda');
    gecis(pencere, azHareket() ? 'none' : `transform .36s ${YAY},opacity .2s ease`, 480);
    pencere.style.transform = ''; pencere.style.opacity = '';
    if (kulak) { kulak.classList.remove('ab-gor'); const k = kulak; setTimeout(() => { if (!kenarda) k.hidden = true; }, azHareket() ? 0 : 220); }
    if (odak) girdi.focus({ preventScroll: true });
  }

  // ---------- seçenek menüsü (macOS bağlam menüsü gibi) ----------
  const menuAcikMi = () => !!(menu && !menu.hidden && !menu.classList.contains('ab-kapali'));
  function menuOgeler() {
    const bol = D.kip === 'bol';
    return [
      { id: 'yuzen', ad: 'Yüzen pencere', ik: IK.yuz, rol: 'menuitemradio', secili: !bol },
      ...(dar() ? [{ id: 'alt', ad: 'Alt panel', ik: IK.alt, rol: 'menuitemradio', secili: bol }]
        : [{ id: 'bolSag', ad: 'Sağda böl', ik: IK.bol, rol: 'menuitemradio', secili: bol && D.yan !== 'sol' }, { id: 'bolSol', ad: 'Solda böl', ik: IK.bolSol, rol: 'menuitemradio', secili: bol && D.yan === 'sol' }]),
      '-',
      { id: 'gizSag', ad: 'Sağa gizle', ik: IK.gizSag },
      { id: 'gizSol', ad: 'Sola gizle', ik: IK.gizSol },
      '-',
      { id: 'balon', ad: 'Balona küçült', ik: IK.balon },
      { id: 'kapat', ad: 'Kapat', ik: IK.x, kisa: 'Esc' },
    ];
  }
  function menuAc(klavye) {
    if (!acik || !pencere) return;
    if (!menu) {
      menu = document.createElement('div'); menu.className = 'ab-menu ab-kapali'; menu.hidden = true; menu.id = 'ab-menu';
      menu.setAttribute('role', 'menu'); menu.setAttribute('aria-label', 'Panel seçenekleri');
      menu.addEventListener('click', (e) => { const b = e.target.closest('.ab-mo'); if (b) menuSec(b.dataset.id); });
      menu.addEventListener('pointermove', (e) => { const b = e.target.closest('.ab-mo'); if (b && e.pointerType === 'mouse' && document.activeElement !== b) b.focus({ preventScroll: true }); });
      document.body.appendChild(menu);
      document.addEventListener('pointerdown', (e) => { if (menuAcikMi() && !menu.contains(e.target) && e.target !== tutEl) menuKapat(false); }, true);
      tutEl.setAttribute('aria-controls', 'ab-menu');
    }
    menu.innerHTML = '';
    for (const o of menuOgeler()) {
      if (o === '-') { const a = document.createElement('div'); a.className = 'ab-ma'; a.setAttribute('role', 'separator'); menu.appendChild(a); continue; }
      const b = document.createElement('button'); b.type = 'button'; b.className = 'ab-mo'; b.dataset.id = o.id; b.tabIndex = -1;
      b.setAttribute('role', o.rol || 'menuitem'); if (o.rol) b.setAttribute('aria-checked', String(!!o.secili));
      b.innerHTML = `${o.ik}<span class="ab-mt"></span>${o.kisa ? `<span class="ab-ms">${o.kisa}</span>` : ''}`; b.querySelector('.ab-mt').textContent = o.ad;
      menu.appendChild(b);
    }
    menu.hidden = false; menu.classList.add('ab-kapali');
    const tr = tutEl.getBoundingClientRect(), mw = menu.offsetWidth, mh = menu.offsetHeight, W = genis(), H = innerHeight;
    let x = tr.left + tr.width / 2 - mw / 2, y = tr.bottom + 4;
    x = sinir(x, 8, W - mw - 8); if (y + mh > H - 8) y = Math.max(8, tr.top - mh - 4);
    menu.style.left = Math.round(x) + 'px'; menu.style.top = Math.round(y) + 'px';
    void menu.offsetWidth; menu.classList.remove('ab-kapali');
    tutEl.setAttribute('aria-expanded', 'true');
    if (klavye) { const ilk = menu.querySelector('.ab-mo'); if (ilk) ilk.focus({ preventScroll: true }); }
  }
  function menuKapat(odakGeri) {
    if (!menu || menu.hidden) return;
    const icinde = menu.contains(document.activeElement);
    menu.classList.add('ab-kapali'); tutEl.setAttribute('aria-expanded', 'false');
    const m = menu; setTimeout(() => { if (m.classList.contains('ab-kapali')) m.hidden = true; }, azHareket() ? 0 : 160);
    if ((odakGeri || icinde) && acik && !kenarda) tutEl.focus({ preventScroll: true });
  }
  function menuTus(e) {
    const L = [...menu.querySelectorAll('.ab-mo')], i = L.indexOf(document.activeElement), k = e.key;
    let j = null;
    if (k === 'ArrowDown') j = i < 0 ? 0 : (i + 1) % L.length; else if (k === 'ArrowUp') j = i < 0 ? L.length - 1 : (i - 1 + L.length) % L.length;
    else if (k === 'Home') j = 0; else if (k === 'End') j = L.length - 1;
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); e.stopImmediatePropagation(); if (i >= 0) menuSec(L[i].dataset.id); return true; }
    else if (k === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); menuKapat(true); return true; }
    else if (k === 'Tab') { menuKapat(false); return false; }
    else return false;
    e.preventDefault(); e.stopImmediatePropagation(); L[j].focus({ preventScroll: true }); return true;
  }
  function menuSec(id) {
    menuKapat(false);
    if (id === 'gizSag' || id === 'gizSol') { kenaraGizle(id === 'gizSag' ? 'sag' : 'sol'); return; }
    if (id === 'balon') { kapat(); return; }
    if (id === 'kapat') { kapat(); girdi.value = ''; const G = gom(); if (G && ifHazir) G.ara(''); else bekleyen = { q: '' }; return; }
    if (kenarda) kenardanGetir(false);
    if (id === 'yuzen') D.kip = 'yuzen'; else { D.kip = 'bol'; if (id === 'bolSag') D.yan = 'sag'; else if (id === 'bolSol') D.yan = 'sol'; }
    sakla(); kipYaz(); pencereYerle(); tutEl.focus({ preventScroll: true });
  }

  function ara(q) {
    if (DK_YEREL) return;
    const G = gom();
    if (G && ifHazir) G.ara(q); else bekleyen = { q };
  }
  // aç: {q, kitap, ck (çekmece görünümü), odak}
  function ac(o = {}) {
    if (DK_YEREL) return dkYerel(o);
    kur(); pencereKur();
    const kitap = o.kitap || kitapIpucu();
    if (typeof o.q === 'string') girdi.value = o.q;
    if (!ifr.getAttribute('src')) { bekleyen = null; const u = `${KOK}ders-kitapligi/?gomulu=1#${kitap}/k/${o.ck || '_ara' + (o.q ? '/' + o.q : '')}`; ifr.setAttribute('src', 'about:blank'); setTimeout(() => { ifr.src = u; }, acik || azHareket() ? 0 : 290); } // açılış animasyonu ana iş parçacığı boşken akar
    else { const G = gom(); if (G && ifHazir) { if (o.ck) G.git(kitap, o.ck); else if (typeof o.q === 'string') G.ara(o.q); } else bekleyen = o.ck ? { kitap, ck: o.ck } : { q: o.q || '' }; }
    if (kenarda) kenardanGetir(false);
    if (!acik) {
      acik = true; kipYaz(); pencereYerle();
      document.documentElement.classList.add('ab-acik');
      pencere.style.transform = ''; pencere.style.opacity = '';
      pencere.hidden = false;
      const b = balon.getBoundingClientRect(), p = pencere.getBoundingClientRect();
      pencere.style.transformOrigin = `${Math.round(b.left + b.width / 2 - p.left)}px ${Math.round(b.top + b.height / 2 - p.top)}px`;
      pencere.classList.add('ab-kapali');
      void pencere.offsetWidth; // başlangıç karesi
      requestAnimationFrame(() => pencere.classList.remove('ab-kapali'));
      balon.classList.add('ab-gizle');
    }
    if (o.odak) { girdi.focus({ preventScroll: true }); if (o.sec !== false) girdi.select(); }
  }
  function kapat(hemen) {
    if (!acik || !pencere) return;
    acik = false; menuKapat(false);
    const icinde = pencere.contains(document.activeElement) || document.activeElement === ifr || (kulak && document.activeElement === kulak);
    const kenardaydi = !!kenarda;
    if (kenardaydi) { kenarda = null; pencere.removeAttribute('aria-hidden'); pencere.inert = false; document.documentElement.classList.remove('ab-kenarda'); if (kulak) { kulak.classList.remove('ab-gor'); kulak.hidden = true; } }
    document.documentElement.classList.remove('ab-acik');
    balon.classList.remove('ab-gizle'); balonYerle(false);
    pencere.style.transform = ''; pencere.style.opacity = '';
    const b = balon.getBoundingClientRect(), p = pencere.getBoundingClientRect();
    pencere.style.transformOrigin = `${Math.round(b.left + b.width / 2 - p.left)}px ${Math.round(b.top + b.height / 2 - p.top)}px`;
    pencere.classList.add('ab-kapali');
    const gizle = () => { if (!acik) pencere.hidden = true; };
    if (hemen || kenardaydi || azHareket()) gizle(); else setTimeout(gizle, 280);
    if (icinde) balon.focus({ preventScroll: true });
  }
  // Ders Kitaplığı'nın kendi sayfası: yerel çekmece (iframe yok)
  function dkYerel(o) {
    let h = location.hash.slice(1); try { h = decodeURIComponent(h); } catch (e) { /* bozuk */ }
    const on = h.split('/k/')[0] || o.kitap || kitapIpucu(), kid = on.split('/')[0];
    const kp = o.ck || '_ara' + (o.q ? '/' + o.q : '');
    location.hash = o.ck && o.kitap && o.kitap !== kid ? `#${o.kitap}/k/${kp}` : `#${on}/k/${kp}`;
    if (o.odak) setTimeout(() => { const i = document.getElementById('ck-ara'); if (i) { i.focus(); i.select(); } }, 120);
  }
  window.addEventListener('message', (e) => {
    if (e.origin !== location.origin || !e.data || !e.data.ab || !ifr || e.source !== ifr.contentWindow) return;
    const d = e.data;
    if (d.ab === 'git') { if (d.yeni) window.open(d.url, '_blank', 'noopener'); else { kapat(true); location.href = d.url; } }
    else if (d.ab === 'durum') { sonDurum = d; if (d.kitap) yaz('ab:kitap', d.kitap); acBag.href = `${KOK}ders-kitapligi/#${d.kitap}/k/${d.kp}`; }
    else if (d.ab === 'kapat') kapat();
    else if (d.ab === 'odak') { girdi.focus(); girdi.select(); }
  });

  // ---------- tetik: seçim (fare) / basılı tutup seçme (dokunma) ----------
  let TERIM = null, sonSecim = '', dokunuyor = false, stz = 0;
  const HARF = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'â': 'a', 'î': 'i', 'û': 'u' };
  const normal = (s) => String(s || '').toLocaleLowerCase('tr').replace(/[çğıöşüâîû]/g, (c) => HARF[c]).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const EK = ['larinin', 'lerinin', 'larini', 'lerini', 'lardan', 'lerden', 'larin', 'lerin', 'lari', 'leri', 'nin', 'nun', 'dan', 'den', 'tan', 'ten', 'lar', 'ler', 'in', 'un', 'da', 'de', 'ta', 'te', 'yi', 'yu', 'ya', 'ye', 'si', 'su', 'i', 'u', 'a', 'e', 's'];
  function terimler() {
    if (TERIM) return TERIM;
    TERIM = fetch(`${KOK}ortak/ara-terim.json`, { cache: 'force-cache' }).then((r) => (r.ok ? r.json() : null)).then((j) => { const M = new Map(); const KI = (j && j.k) || [], gor = (c) => { const t = c.slice(0, 1), id = c.slice(2); return t === 'k' ? `${id}/tanim` : t === 't' ? `_terim/${id}` : `_sozluk/${id}`; }; for (const [a, i, c, alt] of (j && j.t) || []) { if (M.has(a)) continue; const L = [{ k: KI[i], c: gor(c) }, ...(alt || []).map(([i2, c2]) => ({ k: KI[i2], c: gor(c2) }))]; M.set(a, L); } return M; }).catch(() => new Map());
    return TERIM;
  }
  function bul(M, t) {
    const n = normal(t); let L = M.get(n);
    if (!L && n.length >= 5) for (const e of EK) if (n.endsWith(e) && n.length - e.length >= 4 && M.has(n.slice(0, -e.length))) { L = M.get(n.slice(0, -e.length)); break; }
    if (!L) return null;
    const k = kitapIpucu(); return L.find((x) => x.k === k) || L[0]; // sayfanın kitabındaki kart öne
  }
  async function secimBak() {
    if (oku('ab:secim') === '0' || kalemAcik()) return;
    const s = window.getSelection(); if (!s || s.isCollapsed || !s.rangeCount) { cipGizle(); return; }
    const n = s.anchorNode && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentElement);
    if (!n || yaziAlani(n) || n.closest('.ab-pencere, .ab-cip, .ab-balon, .ab-menu, #cekmece')) return;
    const t = s.toString().replace(/\s+/g, ' ').trim();
    if (t.length < 2 || t.length > 60 || t.split(' ').length > 6 || !/\p{L}/u.test(t)) { cipGizle(); return; }
    if (t === sonSecim && acik && !kenarda) return;
    sonSecim = t;
    const M = await terimler(), h = bul(M, t);
    let r = null; try { r = s.getRangeAt(0).getBoundingClientRect(); } catch (e) { /* yok */ }
    if (h) { cipGizle(); ac({ kitap: h.k, ck: h.c, q: t, odak: false }); return; }
    cipGoster(t, r);
  }
  function cipGoster(t, r) {
    kur();
    if (!cip) {
      cip = document.createElement('button'); cip.type = 'button'; cip.className = 'ab-cip'; cip.hidden = true;
      cip.addEventListener('mousedown', (e) => e.preventDefault()); // seçim silinmesin
      cip.addEventListener('click', () => { const q = cip.dataset.q; cipGizle(); ac({ q, odak: false }); });
      document.body.appendChild(cip);
    }
    cip.dataset.q = t; cip.innerHTML = `${IK.ara}<span></span>`; cip.lastChild.textContent = `Ara: ${t.length > 32 ? t.slice(0, 31) + '…' : t}`;
    cip.hidden = false;
    const W = genis(), cw = Math.min(cip.offsetWidth || 200, W - 16);
    const x = r ? Math.max(8, Math.min(W - cw - 8, r.left + r.width / 2 - cw / 2)) : W / 2 - cw / 2;
    const yA = r ? r.bottom + 10 : innerHeight / 2, y = r && r.bottom + 54 > innerHeight ? Math.max(8, r.top - 50) : yA;
    cip.style.transform = `translate3d(${Math.round(x)}px,${Math.round(dar() ? y + 34 : y)}px,0)`;
    clearTimeout(cip._z); cip._z = setTimeout(cipGizle, 6000);
  }
  function cipGizle() { if (cip) cip.hidden = true; }
  document.addEventListener('mouseup', (e) => { if (e.button === 0 && !dokunuyor) setTimeout(secimBak, 20); }, { passive: true });
  document.addEventListener('touchstart', () => { dokunuyor = true; }, { passive: true, capture: true });
  document.addEventListener('touchend', () => { dokunuyor = false; clearTimeout(stz); stz = setTimeout(secimBak, 420); }, { passive: true, capture: true });
  document.addEventListener('selectionchange', () => { if (dokunuyor) return; clearTimeout(stz); stz = setTimeout(() => { const s = window.getSelection(); if (!s || s.isCollapsed) cipGizle(); }, 200); });
  addEventListener('scroll', () => { if (cip && !cip.hidden) cipGizle(); }, { passive: true });

  // ---------- dış kanca (Akademi menüsü, ana sayfa arama kutusu, gömülü kitaplık, sınama) ----------
  window.AraBalon = {
    ac: (o) => ac(o || { odak: true }), kapat: () => kapat(), ara: (q) => ac({ q, odak: true }), acik: () => acik,
    durum: () => ({ D: { ...D }, son: sonDurum, ifHazir, kenarda, menu: menuAcikMi(), kg: kgAcik() }),
    uzun: (o) => { if (o && o.devral) { tutBitir(); tut = { t0: performance.now(), uzun: true }; } uzunEylem(); },
    kip: (on) => kipCevir(on), kenar: (yon) => (yon ? kenaraGizle(yon) : kenardanGetir(true)), menu: () => menuAc(true),
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', kur, { once: true }); else kur();
})();
