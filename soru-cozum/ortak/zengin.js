// Çözüm sayfalarına KAPALI «Sınav için» blokları (soru-cozum/ortak/zengin.js).
// Aynı klasördeki zengin.json'u okur; formül terim kartları ve pratik bağları için banka.json'u kullanır.
// zengin.json yoksa ya da okunamazsa hiçbir şey yapmaz. Matematik (KaTeX) blok ilk açılınca yüklenir.
(() => {
  'use strict';
  const d = document;
  const KATEX = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/';
  const KANAL_AD = { test: 'Mini test', dy: 'Doğru / Yanlış', sayisal: 'Sayısal', yorum: 'Sonucu yorumla', fark: 'Kavram farkı', terim: 'Formül terimi', bosluk: 'Boşluk doldur', esle: 'Eşleştir', sirala: 'Sırala' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const al = (u) => fetch(u, { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const liste = (v) => (Array.isArray(v) ? v : v ? [v] : []);

  Promise.all([al('zengin.json'), al('banka.json')]).then(([z, b]) => { if (z && typeof z === 'object') kur(z, b || {}); });

  let katexSoz = null;
  function katexYukle() {
    if (window.katex) return Promise.resolve();
    if (katexSoz) return katexSoz;
    katexSoz = new Promise((tamam) => {
      const l = d.createElement('link'); l.rel = 'stylesheet'; l.href = KATEX + 'katex.min.css'; d.head.appendChild(l);
      const s = d.createElement('script'); s.src = KATEX + 'katex.min.js'; s.onload = tamam; s.onerror = tamam; d.head.appendChild(s);
    });
    return katexSoz;
  }
  function tex(t, blok) {
    if (window.katex) { try { return window.katex.renderToString(String(t), { displayMode: !!blok, throwOnError: false, strict: 'ignore' }); } catch (e) { /* düz göster */ } }
    return `<code>${esc(t)}</code>`;
  }
  function metin(s) {
    s = String(s == null ? '' : s).replace(/\\\$/g, '\u0001');
    const re = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g;
    let m, son = 0, out = '';
    const duz = (x) => esc(x).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    while ((m = re.exec(s))) { out += duz(s.slice(son, m.index)); out += tex(m[1] != null ? m[1] : m[2], m[1] != null); son = re.lastIndex; }
    return (out + duz(s.slice(son))).replace(/\u0001/g, '$');
  }

  function stil() {
    const st = d.createElement('style');
    st.textContent = `.zg{margin:1.8em 0 0;border:1px solid #e5e7eb;border-radius:12px;background:#fff}
.zg>summary{list-style:none;display:flex;flex-wrap:wrap;align-items:center;gap:2px 12px;min-height:48px;padding:6px 14px;cursor:pointer;border-radius:12px}
.zg>summary::-webkit-details-marker{display:none}
.zg>summary:hover{background:#f6f7f9}
.zg-b{display:inline-flex;align-items:center;gap:8px;font-weight:700;color:#1d4ed8}
.zg-b:after{content:"";width:.45em;height:.45em;margin:-.2em 0 0 .1em;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg);transition:transform .15s}
.zg[open] .zg-b:after{transform:rotate(-135deg);margin-top:.25em}
.zg-o{font-size:14px;color:#555}
.zg-ic{padding:2px 16px 14px;border-top:1px solid #e5e7eb}
.zg-s h4{margin:1.1em 0 .35em;font-size:13px;font-weight:750;letter-spacing:.05em;text-transform:uppercase;color:#555}
.zg-s ul{margin:.2em 0;padding-left:1.3em}.zg-s li{margin:.35em 0}
.zg-y{padding:8px 14px;border-left:3px solid #1d4ed8;border-radius:0 10px 10px 0;background:#f6f7f9}
.zg-h li::marker{color:#b91c1c}
.zg-f{margin:.6em 0 1em;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px}
.zg-fa{margin:0;font-weight:650}
.zg-tex{overflow-x:auto;overflow-y:hidden;scrollbar-width:none;font-size:1.15em}.zg-tex::-webkit-scrollbar{display:none}
.zg-t{list-style:none;margin:.3em 0 0!important;padding:0!important;display:grid;gap:8px}
.zg-t li{display:grid;grid-template-columns:minmax(56px,auto) minmax(0,1fr);gap:4px 12px;margin:0!important;padding:6px 0;border-top:1px solid #f0f1f3;font-size:.95em;line-height:1.5}
.zg-ts{font-size:1.1em}
.zg-alt{display:block;margin-top:2px;color:#555;font-size:.95em}
.zg-p a{text-decoration:none}.zg-p a:hover{text-decoration:underline}
.zg-k{margin:1em 0 0;font-size:15px;color:#555}
.zg-atlas{display:inline-flex;align-items:center;min-height:40px;font-size:15px;text-decoration:none}
@media(max-width:560px){.zg-t li{grid-template-columns:minmax(0,1fr)}.zg-ic{padding:2px 12px 12px}}
@media (prefers-reduced-motion:reduce){.zg-b:after{transition:none}}`;
    d.head.appendChild(st);
  }

  function kur(z, b) {
    const F = new Map((b.formuller || []).map((f) => [f.id, f]));
    const Q = new Map((b.sorular || []).map((q) => [q.id, q]));
    const K = new Map((b.kaynaklar || []).map((k) => [k.id, k]));
    let say = 0;
    for (const [capa, v] of Object.entries(z)) {
      const hedef = d.getElementById(capa);
      if (!hedef || !v || typeof v !== 'object') continue;
      const art = hedef.closest('article') || hedef;
      if (!say++) stil();
      const parca = [];
      if (liste(v.varyant).length) parca.push(`${liste(v.varyant).length} varyant`);
      if (v.yorum) parca.push('sonucu yorumla');
      if (liste(v.hata).length) parca.push(`${liste(v.hata).length} sık hata`);
      if (liste(v.formuller).filter((id) => F.has(id)).length) parca.push(`${liste(v.formuller).filter((id) => F.has(id)).length} formül`);
      if (liste(v.pratik).filter((id) => Q.has(id)).length) parca.push(`${liste(v.pratik).filter((id) => Q.has(id)).length} pratik`);
      const blok = d.createElement('details');
      blok.className = 'zg';
      blok.innerHTML = `<summary><span class="zg-b">Sınav için</span><span class="zg-o">${esc(parca.join(' · '))}</span></summary><div class="zg-ic"><p class="zg-k">Hazırlanıyor…</p></div>`;
      const alt = art.querySelector(':scope > footer');
      if (alt) art.insertBefore(blok, alt); else art.appendChild(blok);
      let dolu = false;
      blok.addEventListener('toggle', () => {
        if (!blok.open || dolu) return;
        dolu = true;
        katexYukle().then(() => { blok.querySelector('.zg-ic').innerHTML = icerik(v, F, Q, K); });
      });
    }
  }

  function kaynak(k, K) {
    const m = /^\s*([A-Za-z0-9_-]+)\s*[·,:]?\s*(.*)$/.exec(String(k || ''));
    if (m && K.has(m[1])) return esc(K.get(m[1]).kunye) + (m[2] ? ' · ' + esc(m[2]) : '');
    return esc(String(k || '').replace(/^\s*ders\b/i, 'Ders içeriği'));
  }
  function ozet(q) {
    const t = q.soru || q.ifade || q.metin || q.durum || liste(q.kavramlar).join(' / ') || liste(q.sol).join(' · ') || liste(q.adimlar)[0] || '';
    return String(t).replace(/\$[^$]*\$/g, '…').replace(/\{=?[^{}]*\}/g, '…').replace(/_{3,}/g, '…').slice(0, 100);
  }
  function icerik(v, F, Q, K) {
    let h = '';
    const vr = liste(v.varyant), ht = liste(v.hata), fs = liste(v.formuller).map((id) => F.get(id)).filter(Boolean), pr = liste(v.pratik).map((id) => Q.get(id)).filter(Boolean);
    if (vr.length) h += `<section class="zg-s"><h4>Sınavda nasıl değişebilir?</h4><ul>${vr.map((x) => `<li>${metin(x)}</li>`).join('')}</ul></section>`;
    if (v.yorum) h += `<section class="zg-s"><h4>Sonucu yorumla</h4><div class="zg-y">${metin(v.yorum)}</div></section>`;
    if (ht.length) h += `<section class="zg-s"><h4>Sık yapılan hatalar</h4><ul class="zg-h">${ht.map((x) => `<li>${metin(x)}</li>`).join('')}</ul></section>`;
    if (fs.length) {
      h += `<section class="zg-s"><h4>Formül, terim terim</h4>${fs.map((f) => `<div class="zg-f"><p class="zg-fa">${metin(f.ad || f.id)}</p><div class="zg-tex">${tex(f.tex, true)}</div>${f.birimler ? `<p class="zg-k">${metin(f.birimler)}</p>` : ''}<ul class="zg-t">${liste(f.terimler).map((t) => `<li><span class="zg-ts">${tex(t.s)}</span><span><strong>${metin(t.ad)}</strong>${t.birim ? ` · ${metin(t.birim)}` : ''}${t.ne ? ` — ${metin(t.ne)}` : ''}${liste(t.alternatif).map((a) => `<span class="zg-alt">Yerine: ${metin(a.ne)}${a.ne_zaman ? ` <em>(${metin(a.ne_zaman)})</em>` : ''}</span>`).join('')}</span></li>`).join('')}</ul><a class="zg-atlas" href="calis/#atlas/${encodeURIComponent(f.id)}">Formül atlasında aç →</a></div>`).join('')}</section>`;
    }
    if (pr.length) h += `<section class="zg-s"><h4>Pratik yap</h4><ul class="zg-p">${pr.map((q) => `<li><a href="calis/#${encodeURIComponent(q.id)}"><strong>${KANAL_AD[q.kanal] || q.kanal}:</strong> ${esc(ozet(q))}</a></li>`).join('')}</ul></section>`;
    if (v.kaynak) h += `<p class="zg-k">Kaynak: ${kaynak(v.kaynak, K)}</p>`;
    return h || '<p class="zg-k">Bu soru için ek not yok.</p>';
  }
})();
