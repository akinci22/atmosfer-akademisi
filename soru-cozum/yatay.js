// Yatay şeritler (D9): görünür yatay çubuk yok; fare şeridin kenarına yaklaşınca içerik yumuşakça o yöne kayar,
// devamı olan kenarda soluk iz; dokunmatikte parmakla çekme tarayıcının kendi davranışı (dokunulmaz).
// Asıl kopya: yolhava/_ATMOSFER-AKADEMI/tools/ortak/yatay.js → her statik alt sitenin kaynağına aynısı kopyalanır.
// Dışarıda kalanlar: program penceresi benzetimi (.hms), yazı alanları, iki eksende birden kayan kutular.
(() => {
  'use strict';
  const d = document;
  const YOK = '.hms, .raf-govde, textarea, input, select, [data-yt-yok]';
  const st = d.createElement('style');
  st.textContent = '.yt{scrollbar-width:none!important;overscroll-behavior-x:contain}.yt::-webkit-scrollbar{display:none!important;height:0!important}'
    + '.yt.yt-sag{-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 28px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 28px),transparent)}'
    + '.yt.yt-sol{-webkit-mask-image:linear-gradient(90deg,transparent,#000 28px);mask-image:linear-gradient(90deg,transparent,#000 28px)}'
    + '.yt.yt-sol.yt-sag{-webkit-mask-image:linear-gradient(90deg,transparent,#000 28px,#000 calc(100% - 28px),transparent);mask-image:linear-gradient(90deg,transparent,#000 28px,#000 calc(100% - 28px),transparent)}';
  d.head.appendChild(st);
  const fare = matchMedia('(hover: hover) and (pointer: fine)');
  const izli = new WeakSet();

  function yatayMi(e) {
    if (e.closest(YOK)) return false;
    const s = getComputedStyle(e);
    if (!/(auto|scroll)/.test(s.overflowX)) return false;
    if (/(auto|scroll)/.test(s.overflowY) && e.scrollHeight > e.clientHeight + 2) return false;
    return true;
  }
  function uclar(e) {
    const m = e.scrollWidth - e.clientWidth;
    e.classList.toggle('yt-sol', e.scrollLeft > 2);
    e.classList.toggle('yt-sag', m > 2 && e.scrollLeft < m - 2);
  }
  function bagla(e) {
    if (izli.has(e)) { uclar(e); return; }
    izli.add(e); e.classList.add('yt'); uclar(e);
    e.addEventListener('scroll', () => uclar(e), { passive: true });
    let hiz = 0, kare = 0;
    const adim = () => {
      if (!hiz) { kare = 0; return; }
      const once = e.scrollLeft; e.scrollLeft += hiz;
      if (e.scrollLeft === once) { hiz = 0; kare = 0; return; }
      kare = requestAnimationFrame(adim);
    };
    e.addEventListener('pointermove', (v) => {
      if (v.pointerType !== 'mouse' || !fare.matches || v.buttons) { hiz = 0; return; }
      const r = e.getBoundingClientRect(), bant = Math.min(80, r.width * 0.2);
      const sol = v.clientX - r.left, sag = r.right - v.clientX, son = e.scrollWidth - e.clientWidth - 1;
      let h = 0;
      if (sol < bant && e.scrollLeft > 0) h = -(1 + 13 * (1 - sol / bant) ** 2);
      else if (sag < bant && e.scrollLeft < son) h = 1 + 13 * (1 - sag / bant) ** 2;
      hiz = h;
      if (h && !kare) kare = requestAnimationFrame(adim);
    }, { passive: true });
    e.addEventListener('pointerleave', () => { hiz = 0; });
  }
  function tara() {
    for (const e of d.querySelectorAll('body *')) {
      if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0 && yatayMi(e)) bagla(e);
      else if (izli.has(e)) uclar(e);
    }
  }
  let bekle = 0; // kısma: sürekli değişen sahnelerde de en geç ms sonra bir kez tarar
  const sonra = (ms) => { if (bekle) return; bekle = setTimeout(() => { bekle = 0; tara(); }, ms); };
  if (d.readyState === 'complete') sonra(60); else addEventListener('load', () => sonra(60));
  addEventListener('resize', () => sonra(250), { passive: true });
  new MutationObserver(() => sonra(400)).observe(d.body || d.documentElement, { childList: true, subtree: true });
  window.__yatay = { tara };
})();
