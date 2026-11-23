// Soru çözümleri: içindekiler durumunu hatırla + tam ekran okuma (sade HUD). Betik yoksa sayfa yine eksiksiz çalışır.
(() => {
  'use strict';
  const d = document, h = d.documentElement;
  const ic = d.getElementById('ic'), hud = d.getElementById('hud');
  if (!ic || !hud) return;
  const sorular = [...d.querySelectorAll('main article.soru')];
  const bls = [...ic.querySelectorAll('details.bl')];
  const linkler = [...ic.querySelectorAll('a[href^="#s"]')];
  const hudAd = hud.querySelector('.hud-ad');
  const dug = (k) => hud.querySelector(`[data-k="${k}"]`);
  const ANAH = 'sc-ic:' + location.pathname;
  let tam = false, hazir = false;

  // --- içindekiler: cihazda hatırla (çapayla gelişte kapalı kalır)
  const oku = () => { try { return JSON.parse(localStorage.getItem(ANAH) || 'null'); } catch (e) { return null; } };
  const yaz = () => { try { localStorage.setItem(ANAH, JSON.stringify({ a: ic.open, b: bls.flatMap((b, i) => (b.open ? [i] : [])) })); } catch (e) { /* depolama kapalı */ } };
  const v = oku();
  if (v && !location.hash) { ic.open = !!v.a; bls.forEach((b, i) => { b.open = (v.b || []).includes(i); }); }
  ic.addEventListener('toggle', (e) => {
    if (e.target === ic && ic.open) isaretle(true);
    if (hazir && !tam) yaz();
    if (tam) goster();
  }, true);
  hazir = true;

  // --- hangi sorudayız
  const ust = () => (tam ? 70 : 20);
  function simdiki() {
    let k = -1;
    for (let i = 0; i < sorular.length; i++) { if (sorular[i].getBoundingClientRect().top <= ust() + 40) k = i; else break; }
    return k;
  }
  function isaretle(bolumAc) {
    const k = Math.max(0, simdiki());
    const id = sorular[k] && sorular[k].id;
    for (const a of linkler) {
      if (a.getAttribute('href') === '#' + id) {
        a.setAttribute('aria-current', 'true');
        const b = a.closest('details.bl'); if (bolumAc && b) b.open = true;
      } else a.removeAttribute('aria-current');
    }
  }
  function hudYaz() {
    if (!tam) return;
    const k = simdiki(), q = sorular[Math.max(0, k)];
    if (q) { const no = q.querySelector('header .no'), t = q.querySelector('h2'); hudAd.textContent = (no ? no.textContent.replace(/^.*·\s*/, '') : '') + (t ? ' · ' + t.textContent : ''); }
    dug('once').disabled = k <= 0; dug('sonra').disabled = k >= sorular.length - 1;
  }
  function git(yon) {
    const k = simdiki();
    const i = Math.min(sorular.length - 1, Math.max(0, yon > 0 ? k + 1 : (k <= 0 ? 0 : k - 1)));
    const q = sorular[i]; if (!q) return;
    if (location.hash !== '#' + q.id) location.hash = q.id; else q.scrollIntoView();
  }

  // --- HUD: 2 sn hareketsizlikte gizlen, hareketle geri gel
  let zaman = 0;
  function goster() {
    if (!tam) return;
    hud.classList.remove('sakin');
    clearTimeout(zaman);
    zaman = setTimeout(() => {
      const fareUstte = matchMedia('(hover:hover)').matches && hud.matches(':hover');
      if (tam && !ic.open && !fareUstte && !hud.querySelector(':focus-visible')) hud.classList.add('sakin');
    }, 2000);
  }

  // --- tam ekran (Fullscreen API; yoksa sabit tam pencere katmanı)
  function konumAl() { const k = Math.max(0, simdiki()), q = sorular[k]; if (!q) return null; const r = q.getBoundingClientRect(); return { q, oran: r.height ? Math.min(1, Math.max(0, -r.top / r.height)) : 0 }; }
  function konumVer(p) { if (!p) return; const r = p.q.getBoundingClientRect(); scrollTo(0, scrollY + r.top + p.oran * r.height - (p.oran ? 0 : ust())); }
  function ac() {
    if (tam) return;
    const p = konumAl();
    tam = true; h.classList.add('tam'); hud.hidden = false;
    ic.open = false;
    if (h.requestFullscreen && !d.fullscreenElement) h.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
    requestAnimationFrame(() => { konumVer(p); hudYaz(); goster(); });
    d.addEventListener('fullscreenchange', function bir() { d.removeEventListener('fullscreenchange', bir); if (tam) requestAnimationFrame(() => konumVer(p)); });
  }
  function kapat() {
    if (!tam) return;
    const p = konumAl();
    tam = false; h.classList.remove('tam'); hud.hidden = true; hud.classList.remove('sakin');
    clearTimeout(zaman);
    const v2 = oku(); ic.open = !!(v2 && v2.a);
    if (d.fullscreenElement && d.exitFullscreen) d.exitFullscreen().catch(() => {});
    requestAnimationFrame(() => konumVer(p));
  }
  d.addEventListener('fullscreenchange', () => { if (!d.fullscreenElement && tam) kapat(); });

  const tamAc = d.querySelector('.tam-ac');
  if (tamAc) { tamAc.hidden = false; tamAc.addEventListener('click', ac); }
  hud.addEventListener('click', (e) => {
    const b = e.target.closest('[data-k]'); if (!b) return;
    const k = b.dataset.k;
    if (k === 'ic') ic.open = !ic.open;
    else if (k === 'once') git(-1);
    else if (k === 'sonra') git(1);
    else if (k === 'kapat') kapat();
    goster();
  });
  // tam ekranda içindekilerden seçince çekmece kapanır; çekmece dışına dokununca kapanır
  ic.addEventListener('click', (e) => { if (tam && e.target.closest('a[href^="#"]')) ic.open = false; });
  d.addEventListener('click', (e) => { if (tam && ic.open && !ic.contains(e.target) && !hud.contains(e.target)) ic.open = false; });

  for (const ev of ['mousemove', 'pointerdown', 'touchstart', 'wheel']) addEventListener(ev, goster, { passive: true });
  let bekle = false;
  addEventListener('scroll', () => { if (bekle) return; bekle = true; requestAnimationFrame(() => { bekle = false; hudYaz(); if (ic.open && !tam) isaretle(false); }); }, { passive: true });

  addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t && t.closest && t.closest('input,textarea,select,[contenteditable="true"]')) return;
    const k = e.key;
    if (k === 'f' || k === 'F') { e.preventDefault(); if (tam) kapat(); else ac(); return; }
    if (!tam) return;
    goster();
    if (k === 'Escape') { e.preventDefault(); if (ic.open) ic.open = false; else kapat(); }
    else if (k === 't' || k === 'T') { e.preventDefault(); ic.open = !ic.open; if (ic.open) { const a = ic.querySelector('a[aria-current]'); if (a) a.focus({ preventScroll: false }); } }
    else if ((k === 'ArrowRight' || k === 'ArrowLeft') && !(t.closest && t.closest('.fk,.tk,pre'))) { e.preventDefault(); git(k === 'ArrowRight' ? 1 : -1); }
  });
  // test ve gözlem kancası (tanımlayıcı nötr)
  window.__okuma = { ac, kapat, git, durum: () => ({ tam, hud: !hud.hidden && !hud.classList.contains('sakin'), ic: ic.open, k: simdiki() }) };
})();
