/* HEC-HMS 4.14 benzetimi — gri Swing penceresine benzeyen, durumdan yeniden çizilen arayüz.
   Her tıklanabilir parçanın data-hd anahtarı var; app.js bu anahtarla keşif açıklamasını ya da anlatım adımını eşler.
   Menü, araç ve alan adları programın kendi kaynak dosyasından (hms.jar) alındı. Sonuç grafikleri gerçek koşunun verisi. */
(function () {
  'use strict';
  const R = window.HMS_SONUC;
  const kac = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ik = (id, cls) => `<svg class="h-i${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const hdA = (hd) => ` data-hd="${kac(hd)}"`;

  /* ---------------------------------------------------------------- simgeler */
  const SIMGE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<symbol id="i-hms" viewBox="0 0 16 16"><rect x=".5" y=".5" width="15" height="15" rx="2" fill="#1f7a3a"/><path d="M1 12l4-5 3 3 3-5 4 7z" fill="#9be08a"/><path d="M1 13h14" stroke="#7cc8ff" stroke-width="2"/></symbol>
<symbol id="i-yeni" viewBox="0 0 16 16"><path d="M3.5 1.5h6l3 3v10h-9z" fill="#fff" stroke="#444"/><path d="M9.5 1.5v3h3" fill="none" stroke="#444"/></symbol>
<symbol id="i-ac" viewBox="0 0 16 16"><path d="M1.5 3.5h4l1 1.5h6v8.5h-11z" fill="#e9b93a" stroke="#8a6d00"/><path d="M3 13.5l2-6h10l-2.2 6z" fill="#f6d77a" stroke="#8a6d00"/></symbol>
<symbol id="i-disk" viewBox="0 0 16 16"><rect x="1.5" y="1.5" width="13" height="13" rx="1" fill="#2d2d2d"/><rect x="4" y="2" width="8" height="5" fill="#f4f4f4"/><rect x="9" y="3" width="2" height="3" fill="#2d2d2d"/><rect x="4" y="10" width="8" height="4.5" fill="#9a9a9a"/></symbol>
<symbol id="i-yazici" viewBox="0 0 16 16"><rect x="4" y="1.5" width="8" height="5" fill="#fff" stroke="#444"/><rect x="1.5" y="6" width="13" height="6" rx="1" fill="#8f8f8f" stroke="#444"/><rect x="4" y="10" width="8" height="4.5" fill="#fff" stroke="#444"/></symbol>
<symbol id="i-ok" viewBox="0 0 16 16"><path d="M4 1.5v12.2l3-2.9 2.2 4.6 2-1-2.2-4.5h4.2z" fill="#111" stroke="#fff" stroke-width=".6"/></symbol>
<symbol id="i-zum" viewBox="0 0 16 16"><circle cx="6.5" cy="6.5" r="4.2" fill="#fff" stroke="#222" stroke-width="1.5"/><path d="M9.6 9.6l4.8 4.8" stroke="#222" stroke-width="2.2"/></symbol>
<symbol id="i-subbasin" viewBox="0 0 16 16"><path d="M1.5 12.5V5l3-3 3 2.5 3-2 3.5 3v7z" fill="#cfe3f7" stroke="#2a64b4"/><path d="M3 9.5c2-1 3 1 5 0" fill="none" stroke="#2a64b4"/><path d="M6.5 13.5h7" stroke="#1036c8" stroke-width="1.6"/><path d="M12 11l3 2.5-3 2.5z" fill="#1036c8"/></symbol>
<symbol id="i-reach" viewBox="0 0 16 16"><path d="M2 2c0 6 3 9 9 10" fill="none" stroke="#2a64b4" stroke-width="2.4"/><path d="M10 9.5l4.5 3-4.5 3z" fill="#1036c8"/></symbol>
<symbol id="i-reservoir" viewBox="0 0 16 16"><path d="M1.5 3.5h13v10h-13z" fill="#fff" stroke="#2a64b4"/><path d="M2 8h12v5H2z" fill="#3b82d6"/></symbol>
<symbol id="i-junction" viewBox="0 0 16 16"><path d="M2 2l6 5.5L14 2M8 7.5V12" fill="none" stroke="#2a64b4" stroke-width="2.4"/><path d="M4.6 11.2L8 15l3.4-3.8z" fill="#1036c8"/></symbol>
<symbol id="i-diversion" viewBox="0 0 16 16"><path d="M2 8h6l5-5M8 8l5 5" fill="none" stroke="#2a64b4" stroke-width="2.2"/><path d="M11 1.5h3.5V5zM11 14.5h3.5V11z" fill="#1036c8"/></symbol>
<symbol id="i-source" viewBox="0 0 16 16"><path d="M2 2h12l-4 6v6H6V8z" fill="#cfe3f7" stroke="#2a64b4"/><path d="M8 9v6" stroke="#1036c8" stroke-width="1.6"/></symbol>
<symbol id="i-sink" viewBox="0 0 16 16"><path d="M1.5 8.5h13v6h-13z" fill="#3b82d6" stroke="#2a64b4"/><path d="M8 1v6" stroke="#1036c8" stroke-width="1.8"/><path d="M5 5l3 3.5L11 5z" fill="#1036c8"/></symbol>
<symbol id="i-arti" viewBox="0 0 16 16"><path d="M8 2v12M2 8h12" stroke="#7a7a7a" stroke-width="2"/></symbol>
<symbol id="i-hesap" viewBox="0 0 16 16"><path d="M4 9a3 3 0 0 1 .4-6A4 4 0 0 1 12 4a2.6 2.6 0 0 1 0 5z" fill="#c7d7ea" stroke="#5a6f8c"/><path d="M5 11l-1 3M8 11l-1 3M11 11l-1 3" stroke="#1d6fe0" stroke-width="1.6"/><circle cx="13" cy="12.5" r="2.5" fill="#e0402c"/></symbol>
<symbol id="i-gsum" viewBox="0 0 16 16"><rect x="1.5" y="2.5" width="13" height="11" fill="#fff" stroke="#3a5f8f"/><path d="M1.5 5.5h13M1.5 8.5h13M1.5 11h13M6 2.5v11" stroke="#3a5f8f"/><rect x="2" y="3" width="12" height="2.3" fill="#7fa6d6"/></symbol>
<symbol id="i-graf" viewBox="0 0 16 16"><rect x="1.5" y="1.5" width="13" height="13" fill="#fff" stroke="#3a5f8f"/><path d="M3 12l3-5 3 3 4-7" fill="none" stroke="#1d4fd6" stroke-width="1.5"/></symbol>
<symbol id="i-esum" viewBox="0 0 16 16"><rect x="1.5" y="1.5" width="13" height="13" fill="#fff" stroke="#3a5f8f"/><path d="M4 5h8M4 8h8M4 11h5" stroke="#3a5f8f" stroke-width="1.3"/></symbol>
<symbol id="i-ts" viewBox="0 0 16 16"><rect x="1.5" y="1.5" width="13" height="13" fill="#fff" stroke="#3a5f8f"/><path d="M1.5 5h13M1.5 8h13M1.5 11h13M6 1.5v13M10 1.5v13" stroke="#3a5f8f" stroke-width=".8"/></symbol>
<symbol id="i-klasor" viewBox="0 0 16 16"><path d="M1 3.5h5l1.2 1.5H15v8.5H1z" fill="#f4c542" stroke="#b8901c"/></symbol>
<symbol id="i-havza" viewBox="0 0 16 16"><path d="M2 13c-1-4 1-9 6-10 4-1 7 2 6 6s-6 6-12 4z" fill="#ffe08a" stroke="#c98a00"/><path d="M4 11c2-2 4-1 6-4" fill="none" stroke="#1d6fe0" stroke-width="1.4"/></symbol>
<symbol id="i-met" viewBox="0 0 16 16"><path d="M4 10a3 3 0 0 1 .4-6A4 4 0 0 1 12 5a2.6 2.6 0 0 1 0 5z" fill="#e6eef8" stroke="#5a6f8c"/><path d="M5 12l-1 2.5M8 12l-1 2.5M11 12l-1 2.5" stroke="#1d6fe0" stroke-width="1.4"/></symbol>
<symbol id="i-saat" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" fill="#fff" stroke="#5a6f8c"/><path d="M8 4v4l3 2" fill="none" stroke="#1d3f8f" stroke-width="1.4"/></symbol>
<symbol id="i-olcer" viewBox="0 0 16 16"><path d="M5 1.5h6l-1 5H6z" fill="#cfe3f7" stroke="#2a64b4"/><rect x="5.5" y="7" width="5" height="7.5" fill="#fff" stroke="#2a64b4"/><path d="M5.5 11h5" stroke="#3b82d6" stroke-width="3"/></symbol>
<symbol id="i-kosu" viewBox="0 0 16 16"><rect x="1.5" y="2.5" width="13" height="11" rx="1" fill="#eef3fa" stroke="#3a5f8f"/><path d="M6 5.5v5l4.5-2.5z" fill="#2a8a3a"/></symbol>
<symbol id="i-dosya" viewBox="0 0 16 16"><path d="M1.5 3.5h4l1 1.5h8v8.5h-13z" fill="#e9b93a" stroke="#8a6d00"/></symbol>
<symbol id="i-not" viewBox="0 0 16 16"><rect x="2" y="1.5" width="12" height="13" fill="#fff" stroke="#5a6f8c"/><path d="M4.5 5h7M4.5 8h7M4.5 11h4" stroke="#5a6f8c"/></symbol>
</defs></svg>`;

  /* ---------------------------------------------------------------- öğreticinin değerleri */
  const OG = {
    proje: 'Punxsutawney', yer: 'C:\\Projects',
    havza: ['Punxsutawney', 'Headwaters to the City of Punxsutawney - Existing Conditions.'],
    yeniAd: { 'Subbasin-1': 'Stump Creek', 'Subbasin-2': 'EB Mahoning Creek', 'Subbasin-3': 'Mahoning Creek Local' },
    alan: { 'EB Mahoning Creek': '41', 'Stump Creek': '29', 'Mahoning Creek Local': '88' },
    clark: { 'EB Mahoning Creek': ['7', '11'], 'Stump Creek': ['9', '12'], 'Mahoning Creek Local': ['10', '13'] },
    met: ['May 1996', 'Precipitation for the Storm of May 1st, 1996'],
    kontrol: ['May 1996', 'Storm of May 1st 1996'],
    atama: { 'EB Mahoning Creek': 'MFFP', 'Stump Creek': 'DUJP', 'Mahoning Creek Local': 'PNXP' },
    olcerler: ['DUJP', 'PNXP', 'MFFP'],
    dss: 'C:\\Projects\\Punxsutawney\\data\\observe.dss',
  };
  const YOLLAR = [
    ['ALLEGHENY', 'DUJP', 'PRECIP-INC'], ['ALLEGHENY', 'PNXP', 'FLOW'], ['ALLEGHENY', 'PNXP', 'PRECIP-INC'], ['SUSQUEHANA', 'MFFP', 'PRECIP-INC'],
  ];
  const yolAdi = (y) => `/${y[0]}/${y[1]}/${y[2]}/01Apr1994/1Hour/OBS/`;
  const YER = { sb1: [300, 44], sb2: [522, 152], sb3: [102, 152], j1: [300, 146], j2: [74, 266], r1: [192, 206] };
  const REACH_UC = [[284, 160], [94, 252]];

  /* ---------------------------------------------------------------- menüler (hms.jar ProjectInterfaceResources) */
  const A = (ad, ek) => Object.assign({ ad }, ek || {});
  const AY = { ayrac: true };
  const MENU = {
    File: [A('New...', { k: 'Ctrl+N' }), A('Open...', { k: 'Ctrl+O' }), A('Import', { alt: ['Simulation Run...', 'Basin Model...', 'Meteorologic Model...', 'Control Specifications...', 'HEC-1 File...', 'HEC-RAS HDF File...'].map((x) => A(x)) }), A('Export', { alt: [A('Export Basin Model...')] }), A('References...', { pasif: true }), AY, A('Save', { k: 'Ctrl+S' }), A('Save As...'), A('Delete...', { k: 'Ctrl+D' }), A('Rename...'), AY, A('Print...'), AY, A('Exit')],
    Edit: ['Undo', 'Redo', null, 'Cut', 'Copy', 'Paste', null, 'Select All', 'Select Upstream', 'Invert Selection', 'Clear Selection', 'Select By Name...'].map((x) => (x ? A(x, { pasif: true }) : AY)),
    View: [A('Maximum Extents...'), A('Map Layers...'), A('Terrain Layers...'), AY, A('Zoom In'), A('Zoom Out'), A('Zoom To Selected'), A('Zoom To All'), AY, A('Draw Gridlines'), A('Draw Element Labels', { alt: [A('None'), A('Name')] }), A('Draw Flow Directions'), AY, A('Toolbars', { alt: [A('File'), A('Components'), A('Compute')] }), A('Clear Messages')],
    Components: [A('Create Component', { alt: ['Terrain Data...', 'Basin Model...', 'Meteorologic Model...', 'Control Specifications...', 'Time-Series Data...', 'Paired Data...', 'Grid Data...'].map((x) => A(x)) }), AY, A('Basin Model Manager'), A('Meteorologic Model Manager'), A('Control Specifications Manager'), A('Time-Series Data Manager'), A('Paired Data Manager'), A('Grid Data Manager'), A('Terrain Data Manager')],
    GIS: ['Coordinate System', 'Preprocess Sinks', 'Preprocess Drainage', 'Identify Streams', 'Break Points Manager', 'Delineate Elements', null, 'Reverse Flow Direction', 'Split Element', 'Merge Elements', null, 'Georeference Existing Elements', 'Import Georeferenced Elements', 'Export Layers'].map((x) => (x ? A(x, { pasif: true }) : AY)),
    Parameters: null, // durumdan kurulur
    Compute: null,
    Results: null,
    Tools: [A('Reach Tables', { alt: [A('Elevation-Outflow-Area-Width')] }), A('Reservoir Tables', { alt: [A('Elevation-Storage-Outflow'), A('Elevation-Area-Outflow')] }), A('Parameter Sample Creator', { pasif: true }), AY, A('Data', { alt: ['Calculator...', 'Clipper...', 'Gap Filler...', 'Image Exporter...', 'Normalizer...', 'Sanitizer...', 'Shifter...'].map((x) => A(x)) }), A('Snowmelt', { alt: [A('SnowPAC...')] }), A('Ensemble Viewer...'), A('Reports', { alt: ['Basin Model...', 'Simulation Run...', 'Standard Report...', 'Statistics Report...'].map((x) => A(x)) }), A('Delete Results...'), AY, A('Program Settings...')],
    Help: [A('Tutorials and Guides'), A("User's Manual"), A('Technical Reference Manual'), A('Applications Guide'), AY, A('Install Sample Projects...'), A('View Terms and Conditions for Use'), AY, A('About HEC-HMS')],
  };
  const YONTEM = {
    Loss: ['Deficit and Constant', 'Exponential Loss', 'Green and Ampt', 'Gridded Deficit Constant', 'Gridded Green Ampt', 'Gridded SCS Curve Number', 'Gridded Soil Moisture Accounting', 'Initial and Constant', 'Layered Green and Ampt', 'Linear Deficit and Constant', 'SCS Curve Number', 'Smith Parlange', 'Soil Moisture Accounting'],
    Transform: ['Clark Unit Hydrograph', 'Kinematic Wave', '2D Diffusion Wave', 'ModClark', 'Snyder Unit Hydrograph', 'SCS Unit Hydrograph', 'User-Specified S-Graph', 'User-Specified Unit Hydrograph'],
    Baseflow: ['Bounded Recession', 'Constant Monthly', 'Linear Reservoir', 'Nonlinear Boussinesq', 'Recession'],
    Routing: ['Kinematic Wave', 'Lag', 'Lag & K', 'Modified Puls', 'Muskingum', 'Muskingum-Cunge', 'Normal Depth', 'Straddle Stagger'],
    Canopy: ['Dynamic Canopy', 'Gridded Simple Canopy', 'Simple Canopy'],
    Surface: ['Dynamic Surface', 'Gridded Simple Surface', 'Simple Surface'],
    Snowmelt: ['Temperature Index', 'Gridded Temperature Index', 'Energy Budget'],
    'Loss/Gain': ['Constant', 'Percolation'],
  };
  const YONTEM_ALAN = { Loss: 'loss', Transform: 'transform', Baseflow: 'baseflow', Routing: 'routing' };
  function menuKur(ad) {
    if (MENU[ad]) return MENU[ad];
    const kullan = (alan) => new Set(S.el.map((e) => e.yt && e.yt[alan]).filter(Boolean));
    if (ad === 'Parameters') {
      const hv = !!S.havzalar.length;
      const yt = (b) => A(b, { pasif: !hv, alt: (YONTEM[b] || []).map((m) => A(m, { pasif: !(YONTEM_ALAN[b] && kullan(YONTEM_ALAN[b]).has(m)) })).concat([AY, A('Change Method...', { pasif: true })]) });
      return [A('Subbasin Area', { pasif: !hv }), A('Characteristics', { pasif: true, alt: [] }), A('Discretization', { pasif: !hv, alt: ['Structured', 'Unstructured', 'File-Specified'].map((x) => A(x, { pasif: true })) }), yt('Canopy'), yt('Surface'), yt('Loss'), yt('Transform'), yt('Baseflow'), yt('Snowmelt'), A('Evapotranspiration', { pasif: true, alt: [] }), AY, yt('Routing'), yt('Loss/Gain'), AY, A('Zone Configuration Manager'), A('Computation Point Manager'), A('Element Inventory')];
    }
    if (ad === 'Compute') {
      const k = S.secKosu !== '--None--';
      return [A('Create Compute', { alt: ['Simulation Run...', 'Optimization Trial...', 'Forecast Alternative...', 'Depth-Area Analysis...', 'Uncertainty Analysis...', 'Frequency Analysis...', 'Ensemble Analysis...'].map((x) => A(x, { pasif: x !== 'Simulation Run...' })) }), AY, A('Simulation Run Manager'), A('Optimization Trial Manager'), A('Forecast Alternative Manager'), A('Depth-Area Analysis Manager'), A('Uncertainty Analysis Manager'), A('Frequency Analysis Manager'), A('Ensemble Analysis Manager'), AY, A('Multiple Compute...'), AY, A(k ? 'Compute Run [May 1996]' : 'Compute', { pasif: !k })];
    }
    if (ad === 'Results') {
      const v = S.sonuc && S.secKosu !== '--None--';
      return [A('Global Summary Table', { pasif: !v }), A('Element Summary Table', { pasif: !v }), A('Element Graph', { pasif: !v }), A('Element Time-Series Table', { pasif: !v }), AY, A('Graph Properties...', { pasif: true })];
    }
    return [];
  }

  /* ---------------------------------------------------------------- durum */
  let S, KOK, AYAR = {}, HEDEF = null, OLCEK = 1;
  function bosDurum() {
    return {
      acik: true, proje: null, xsekme: 'Components', acikD: new Set(['p']), secili: null, havzalar: [], harita: false, arac: 'arrow', el: [],
      vars: { loss: '--None--', transform: '--None--', baseflow: '--None--', routing: '--None--' },
      pg: [], dg: [], met: null, kontrol: null, kosu: null, secKosu: '--None--', sonuc: false, sonucGoz: false, gozJ2: '--None--',
      menu: null, combo: null, baglam: null, bagla: null, dlg: [], ce: null, log: [], kosuZamani: '', yazildi: 0,
    };
  }
  const elBul = (ad) => S.el.find((e) => e.ad === ad);
  const altHavzalar = () => S.el.filter((e) => e.tur === 'subbasin');
  const ust = () => S.dlg[S.dlg.length - 1];
  const simdi = () => { const d = new Date(), a = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; const p = (n) => String(n).padStart(2, '0'); return `${p(d.getDate())}${a[d.getMonth()]}${d.getFullYear()}, ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`; };

  function yeniEleman(tur, x, y) {
    const n = S.el.filter((e) => e.tur === tur).length + 1;
    const ad = { subbasin: 'Subbasin-', reach: 'Reach-', junction: 'Junction-', reservoir: 'Reservoir-', diversion: 'Diversion-', source: 'Source-', sink: 'Sink-' }[tur] + n;
    const e = { tur, ad, x, y, asagi: null, aciklama: '' };
    if (tur === 'subbasin') Object.assign(e, { alan: '', yt: { loss: S.vars.loss, transform: S.vars.transform, baseflow: S.vars.baseflow }, ilk: '', sabit: '', gec: '', tc: '', r: '', tip: '', katman: '', g1: ['', '', '', ''], g2: ['', '', '', ''], goz: '--None--' });
    if (tur === 'reach') Object.assign(e, { yt: { routing: S.vars.routing }, lag: '', x1: x + 92, y1: y - 46, x2: x - 98, y2: y + 46 });
    if (tur === 'junction') e.goz = '--None--';
    return e;
  }
  function reachUclari(r) {
    const ust1 = S.el.find((e) => e.asagi === r.ad && e.tur !== 'subbasin'), alt = r.asagi && elBul(r.asagi);
    return [ust1 ? [ust1.x, ust1.y] : [r.x1, r.y1], alt ? [alt.x, alt.y] : [r.x2, r.y2]];
  }

  /* ---------------------------------------------------------------- değer yolları (alan bağlama) */
  function hedefNesne(yol) {
    const p = yol.split('.');
    if (p[0] === 'dlg') return [ust(), p.slice(1)];
    if (p[0] === 'vars') return [S.vars, p.slice(1)];
    if (p[0] === 'el') return [elBul(p[1]), p.slice(2)];
    if (p[0] === 'pg' || p[0] === 'dg') return [S[p[0]].find((g) => g.ad === p[1]), p.slice(2)];
    if (p[0] === 'met') return [S.met, p.slice(1)];
    if (p[0] === 'atama') return [S.met && S.met.atama, p.slice(1)];
    if (p[0] === 'kontrol') return [S.kontrol, p.slice(1)];
    if (p[0] === 'proje') return [S.proje, p.slice(1)];
    if (p[0] === 'S') return [S, p.slice(1)];
    return [null, []];
  }
  function al(yol) { const [o, k] = hedefNesne(yol); if (!o) return ''; let v = o; for (const x of k) { v = v == null ? '' : v[x]; } return v == null ? '' : v; }
  function yaz(yol, d) { const [o, k] = hedefNesne(yol); if (!o) return; let v = o; for (let i = 0; i < k.length - 1; i++) v = v[k[i]]; v[k[k.length - 1]] = d; }

  const SECENEK = {
    birim: ['Metric', 'U.S. Customary'], unit: ['Metric', 'U.S. Customary'], sort: ['Hydrologic', 'Alphabetical', 'Creation'],
    loss: ['--None--'].concat(YONTEM.Loss), transform: ['--None--'].concat(YONTEM.Transform), baseflow: ['--None--'].concat(YONTEM.Baseflow), routing: ['--None--'].concat(YONTEM.Routing),
    kaynak: ['Manual Entry', 'Single Record HEC-DSS'], yagis: ['--None--', 'Frequency Storm', 'Gage Weights', 'Gridded Precipitation', 'HMR 52 Storm', 'Inverse Distance', 'SCS Storm', 'Specified Hyetograph', 'Standard Project Storm'],
    dahil: ['No', 'Yes'], aralik: ['1 Minute', '5 Minutes', '10 Minutes', '15 Minutes', '30 Minutes', '1 Hour', '1 Day'], tsTur: ['Precipitation Gages', 'Discharge Gages', 'Stage Gages', 'Temperature Gages'],
    goz: () => ['--None--'].concat(S.dg.map((g) => g.ad)), asagi: () => ['--None--'].concat(S.el.filter((e) => e.tur !== 'subbasin').map((e) => e.ad)),
    secKosu: () => ['--None--'].concat(S.kosu ? ['Run: ' + S.kosu.ad] : []), olcer: () => ['--None--'].concat(S.pg.map((g) => g.ad)),
  };
  function secenekler(yol) {
    const son = yol.split('.').pop();
    if (yol.startsWith('atama.')) return SECENEK.olcer();
    const s = SECENEK[son]; return typeof s === 'function' ? s() : s || ['--None--'];
  }

  /* ---------------------------------------------------------------- öğretici değeri (rehberli modda alan/satır tıklanınca) */
  function ogretici(yol) {
    const d = ust();
    if (yol === 'dlg.ad' && d) {
      if (d.tur === 'yeniProje') return OG.proje;
      if (d.tur === 'sihirbaz') return OG.met[0];
      if (d.tur === 'yeniBilesen') {
        if (d.tip === 'basin') return OG.havza[0];
        if (d.tip === 'met') return OG.met[0];
        if (d.tip === 'kontrol') return OG.kontrol[0];
        if (d.tip === 'ts') return d.tsTur === 'Discharge Gages' ? 'PNXP' : OG.olcerler.find((g) => !S.pg.some((x) => x.ad === g)) || 'Gage 1';
      }
    }
    if (yol === 'dlg.aciklama' && d && d.tur === 'yeniBilesen') return { basin: OG.havza[1], met: OG.met[1], kontrol: OG.kontrol[1] }[d.tip] || '';
    if (/^el\..+\.lag$/.test(yol)) return '300';
    if (/^(pg|dg)\..+\.dss$/.test(yol)) return OG.dss;
    if (/^(pg|dg)\..+\.bas$/.test(yol)) { const p = yol.replace(/\.bas$/, ''); yaz(p + '.basSaat', '01:00'); yaz(p + '.bit', '04May1996'); yaz(p + '.bitSaat', '00:00'); return '28Apr1996'; }
    if (yol === 'kontrol.bas') return '28Apr1996';
    if (yol === 'kontrol.basSaat') return '01:00';
    if (yol === 'kontrol.bit') return '04May1996';
    if (yol === 'kontrol.bitSaat') return '00:00';
    return null;
  }

  /* ---------------------------------------------------------------- eylemler */
  function dlgAc(d) { S.menu = null; S.combo = null; S.baglam = null; S.dlg.push(d); }
  function dlgKapat() { S.dlg.pop(); S.combo = null; }
  function logEkle(...satir) { S.log.push(...satir); }
  function projeAcikLog() { logEkle(['n', `NOTE 10008: Begin opening project "${S.proje.ad}" in directory "${OG.yer}\\${S.proje.ad}" at time ${simdi()}.`], ['n', `NOTE 10019: Finished opening project "${S.proje.ad}" in directory "${OG.yer}\\${S.proje.ad}" at time ${simdi()}.`]); }

  function ceAc(tur, ad, sekme) { S.ce = { tur, ad, sekme: sekme || CE_SEKME[tur][0] }; }
  const CE_SEKME = {
    proje: ['Project'], havza: ['Basin Model'], subbasin: ['Subbasin', 'Loss', 'Transform', 'Baseflow', 'Options'], reach: ['Reach', 'Routing', 'Options'], junction: ['Junction', 'Options'],
    pg: ['Time-Series Gage', 'Time Window', 'Table', 'Graph'], dg: ['Time-Series Gage', 'Time Window', 'Table', 'Graph'], met: ['Meteorologic Model', 'Basins', 'Options'], hyeto: ['Specified Hyetograph'],
    kontrol: ['Control Specifications'], kosu: ['Simulation Run'], klasor: [],
  };
  function elSec(ad) { const e = elBul(ad); if (!e) return; S.secili = 'e:' + ad; ceAc(e.tur, ad); }

  function menuEylem(yol) {
    const p = yol.split('/');
    let liste = menuKur(p[0]), oge = null;
    for (let i = 1; i < p.length; i++) { oge = (liste || []).find((x) => x.ad === p[i]); liste = oge && oge.alt; }
    if (!oge || oge.pasif) return;
    if (oge.alt) { S.menu = p; return; }
    S.menu = null;
    const ADIM = {
      'File/New...': () => dlgAc({ tur: 'yeniProje', ad: '', aciklama: '', birim: 'Metric' }),
      'File/Save': () => { S.yazildi++; },
      'Components/Basin Model Manager': () => S.proje && dlgAc({ tur: 'yonetici', tip: 'basin' }),
      'Components/Meteorologic Model Manager': () => S.proje && dlgAc({ tur: 'yonetici', tip: 'met' }),
      'Components/Control Specifications Manager': () => S.proje && dlgAc({ tur: 'yonetici', tip: 'kontrol' }),
      'Components/Time-Series Data Manager': () => S.proje && dlgAc({ tur: 'yonetici', tip: 'ts', tsTur: 'Precipitation Gages' }),
      'Components/Create Component/Basin Model...': () => S.proje && dlgAc({ tur: 'yeniBilesen', tip: 'basin', ad: '', aciklama: '' }),
      'Tools/Program Settings...': () => dlgAc({ tur: 'ayarlar', sekme: 'General' }),
      'Parameters/Subbasin Area': () => dlgAc({ tur: 'global', tip: 'alan' }),
      'Parameters/Loss/Initial and Constant': () => dlgAc({ tur: 'global', tip: 'kayip' }),
      'Parameters/Transform/Clark Unit Hydrograph': () => dlgAc({ tur: 'global', tip: 'clark' }),
      'Parameters/Baseflow/Linear Reservoir': () => dlgAc({ tur: 'global', tip: 'taban' }),
      'Parameters/Routing/Lag': () => dlgAc({ tur: 'global', tip: 'lag' }),
      'Compute/Create Compute/Simulation Run...': () => dlgAc({ tur: 'sihirbaz', adim: 1, ad: '', havza: '', met: '', kontrol: '' }),
      'Compute/Compute Run [May 1996]': () => hesapla(),
      'Results/Global Summary Table': () => dlgAc({ tur: 'gozet' }),
      'Results/Element Graph': () => sonucPenceresi('grafik'),
      'Results/Element Summary Table': () => sonucPenceresi('ozet'),
      'Results/Element Time-Series Table': () => sonucPenceresi('tablo'),
    };
    if (ADIM[yol]) ADIM[yol]();
  }
  function sonucPenceresi(tur, ad) {
    const e = ad || (S.secili && S.secili.startsWith('e:') ? S.secili.slice(2) : 'Junction-2');
    if (!S.sonuc || !R.eleman[e]) return;
    dlgAc({ tur, el: e });
  }

  function hesapla() {
    if (S.secKosu === '--None--' || !S.kosu) return;
    S.menu = null;
    const t = simdi(), sb = ['Mahoning Creek Local', 'Stump Creek', 'EB Mahoning Creek'];
    logEkle(['n', `NOTE 15301: Began computing simulation run "May 1996" at time ${t}.`], ['n', 'NOTE 20364: Found no parameter problems in meteorologic model "May 1996".'], ['n', 'NOTE 40049: Found no parameter problems in basin model "Punxsutawney".'],
      ...sb.map((s) => ['w', `WARNING 41862: Initial losses may have been included in baseflow for subbasin "${s}".`]),
      ...sb.map((s) => ['n', `NOTE 42413: Unit hydrograph volume for subbasin "${s}" is 1.0000 in.`]),
      ['n', `NOTE 15302: Finished computing simulation run "May 1996" at time ${t}.`], ['n', 'NOTE 15312: The total runtime for this simulation is 00:00.']);
    S.acikD.add('k:sr'); S.acikD.add('rr');
    S.sonuc = true; S.sonucGoz = elBul('Junction-2') && elBul('Junction-2').goz === 'PNXP'; S.kosuZamani = t;
    dlgAc({ tur: 'ilerleme' });
  }

  function dlgEylem(arg, o) {
    const d = ust(); if (!d) return;
    if (arg === 'x' || arg === 'Cancel') { dlgKapat(); return; }
    const T = d.tur;
    if (T === 'yeniProje' && arg === 'Create') {
      S.proje = { ad: d.ad || 'Project 1', aciklama: d.aciklama, birim: d.birim }; dlgKapat(); S.secili = 'p'; ceAc('proje', S.proje.ad); return;
    }
    if (T === 'yonetici') {
      if (arg === 'New...') dlgAc({ tur: 'yeniBilesen', tip: d.tip, tsTur: d.tsTur, ad: '', aciklama: '' });
      if (arg === 'Close') dlgKapat();
      return;
    }
    if (T === 'yeniBilesen' && arg === 'Create') { bilesenYarat(d); return; }
    if (T === 'ayarlar') { if (arg.startsWith('sekme:')) d.sekme = arg.slice(6); if (arg === 'OK') dlgKapat(); return; }
    if (T === 'adVer' && arg === 'Create') {
      const e = d.yeni; e.ad = d.ad || e.ad; e.aciklama = d.aciklama; S.el.push(e); S.acikD.add('h:' + S.havzalar[0].ad); dlgKapat(); elSec(e.ad); return;
    }
    if (T === 'global' && (arg === 'Close' || arg === 'Apply')) { if (arg === 'Close') dlgKapat(); return; }
    if (T === 'yolSec') {
      if (arg.startsWith('yol:')) d.sec = arg.slice(4);
      if (arg === 'Set Pathname' && d.sec) { const g = S[d.olcerTur].find((x) => x.ad === d.olcer); g.yol = d.sec; dlgKapat(); }
      return;
    }
    if (T === 'sihirbaz') {
      if (arg.startsWith('secim:')) { d[['', 'ad', 'havza', 'met', 'kontrol'][d.adim]] = arg.slice(6); return; }
      if (arg === 'Next >' && d.adim < 4) { if (d.adim === 1 && !d.ad) d.ad = 'Run 1'; d.adim++; return; }
      if (arg === '< Back' && d.adim > 1) { d.adim--; return; }
      if (arg === 'Finish' && d.adim === 4) {
        S.kosu = { ad: d.ad, havza: d.havza || 'Punxsutawney', met: d.met || 'May 1996', kontrol: d.kontrol || 'May 1996' }; dlgKapat();
        S.acikD.add('k:kosu'); return;
      }
      return;
    }
    if ((T === 'ilerleme' || T === 'grafik' || T === 'ozet' || T === 'gozet' || T === 'tablo') && arg === 'Close') { dlgKapat(); return; }
  }
  function bilesenYarat(d) {
    const ad = d.ad || ({ basin: 'Basin 1', met: 'Met 1', kontrol: 'Control 1', ts: 'Gage 1' }[d.tip]);
    if (d.tip === 'basin') { S.havzalar.push({ ad, aciklama: d.aciklama }); S.acikD.add('k:basin'); }
    if (d.tip === 'met') { S.met = { ad, aciklama: d.aciklama, yagis: '--None--', dahil: 'No', atama: {} }; altHavzalar().forEach((e) => { S.met.atama[e.ad] = '--None--'; }); S.acikD.add('k:met'); S.acikD.add('m'); }
    if (d.tip === 'kontrol') { S.kontrol = { ad, aciklama: d.aciklama, bas: '', basSaat: '', bit: '', bitSaat: '', aralik: '1 Hour' }; S.acikD.add('k:kontrol'); }
    if (d.tip === 'ts') {
      const tur = d.tsTur === 'Discharge Gages' ? 'dg' : 'pg';
      S[tur].push({ ad, aciklama: d.aciklama, kaynak: 'Manual Entry', dss: '', yol: '', bas: '', basSaat: '', bit: '', bitSaat: '' });
      S.acikD.add('k:ts'); S.acikD.add('k:' + tur);
    }
    dlgKapat();
    const yon = ust(); // yöneticinin listesi tazelensin
    if (yon && yon.tur === 'yonetici') yon.son = ad;
    if (d.tip === 'met') { S.secili = 'm'; ceAc('met', ad); }
    if (d.tip === 'kontrol') { S.secili = 'c'; ceAc('kontrol', ad); }
    if (d.tip === 'ts') { const tur = d.tsTur === 'Discharge Gages' ? 'dg' : 'pg'; S.secili = tur + ':' + ad; ceAc(tur, ad); }
  }

  function agacEylem(arg) {
    if (arg.startsWith('ac:')) { const id = arg.slice(3); if (S.acikD.has(id)) S.acikD.delete(id); else S.acikD.add(id); return; }
    if (arg.startsWith('adlandir:')) { const [eski, yeni] = arg.slice(9).split('='); const e = elBul(eski); if (e) { S.el.forEach((x) => { if (x.asagi === eski) x.asagi = yeni; }); e.ad = yeni; elSec(yeni); } return; }
    const id = arg.replace(/^sec:/, '');
    S.secili = id;
    if (id === 'p') ceAc('proje', S.proje.ad);
    else if (id.startsWith('h:')) { ceAc('havza', id.slice(2)); S.harita = true; S.acikD.add(id); }
    else if (id.startsWith('e:')) elSec(id.slice(2));
    else if (id === 'm') ceAc('met', S.met.ad);
    else if (id === 'hy') ceAc('hyeto', 'Specified Hyetograph');
    else if (id === 'c') ceAc('kontrol', S.kontrol.ad);
    else if (id.startsWith('pg:') || id.startsWith('dg:')) ceAc(id.slice(0, 2), id.slice(3));
    else if (id === 'r') ceAc('kosu', S.kosu.ad);
    else if (id.startsWith('rg:')) sonucPenceresi('grafik', id.slice(3));
    else if (id.startsWith('rt:')) sonucPenceresi('ozet', id.slice(3));
    else if (id.startsWith('rz:')) sonucPenceresi('tablo', id.slice(3));
    else if (id === 'rgs') { if (S.sonuc) dlgAc({ tur: 'gozet' }); }
    else S.ce = { tur: 'klasor', ad: '', sekme: '' };
  }

  function haritaEylem(arg, o) {
    if (arg.startsWith('hayalet:')) { const k = arg.slice(8); const tur = { sb: 'subbasin', r: 'reach', j: 'junction' }[k.replace(/\d/g, '')]; const [x, y] = YER[k]; const e = yeniEleman(tur, x, y); if (tur === 'reach') Object.assign(e, { x1: REACH_UC[0][0], y1: REACH_UC[0][1], x2: REACH_UC[1][0], y2: REACH_UC[1][1] }); dlgAc({ tur: 'adVer', yeni: e, ad: e.ad, aciklama: '' }); return; }
    if (arg === 'bos') {
      S.baglam = null;
      if (['subbasin', 'reach', 'junction', 'reservoir', 'sink', 'source', 'diversion'].includes(S.arac) && o && o.hx != null) { const e = yeniEleman(S.arac, o.hx, o.hy); dlgAc({ tur: 'adVer', yeni: e, ad: e.ad, aciklama: '' }); }
      else if (S.arac === 'arrow') { S.secili = S.havzalar[0] ? 'h:' + S.havzalar[0].ad : null; if (S.havzalar[0]) ceAc('havza', S.havzalar[0].ad); }
      return;
    }
    if (arg.startsWith('el:')) {
      const ad = arg.slice(3);
      if (S.bagla) {
        const kaynak = elBul(S.bagla), hedef = elBul(ad);
        if (kaynak && hedef && hedef !== kaynak && hedef.tur !== 'subbasin') { kaynak.asagi = ad; }
        S.bagla = null; elSec(ad); return;
      }
      elSec(ad);
      if (o && o.sag) S.baglam = { el: ad, x: o.x, y: o.y, alt: false };
    }
  }
  function baglamEylem(arg) {
    const b = S.baglam; if (!b) return;
    if (arg === 'Connect Downstream') { S.bagla = b.el; S.baglam = null; return; }
    if (arg === 'View Results') { if (S.sonuc) b.alt = !b.alt; return; }
    if (arg === 'Graph' || arg === 'Summary Table' || arg === 'Time-Series Table') { S.baglam = null; sonucPenceresi({ Graph: 'grafik', 'Summary Table': 'ozet', 'Time-Series Table': 'tablo' }[arg], b.el); return; }
    S.baglam = null;
  }
  function satirEylem(arg, o) {
    const [tip, ad] = [arg.slice(0, arg.indexOf('.')), arg.slice(arg.indexOf('.') + 1)];
    const e = elBul(ad);
    if (!o || !o.doldur) return;
    if (tip === 'alan' && e) e.alan = OG.alan[ad] || e.alan;
    if (tip === 'kayip' && e) Object.assign(e, { ilk: '1', sabit: '0.1', gec: '0' });
    if (tip === 'clark' && e) { e.tc = OG.clark[ad][0]; e.r = OG.clark[ad][1]; }
    if (tip === 'taban' && e) Object.assign(e, { katman: '2', tip: 'Discharge Per Area', g1: ['1', '0.5', '70', '1'], g2: ['1', '0.5', '100', '1'] });
    if (tip === 'atama' && S.met) S.met.atama[ad] = OG.atama[ad];
    if (tip === 'dahil' && S.met) S.met.dahil = 'Yes';
  }
  function aracEylem(arg) {
    S.menu = null; S.baglam = null;
    if (['arrow', 'zoom', 'subbasin', 'reach', 'reservoir', 'junction', 'diversion', 'source', 'sink', 'breakpoint'].includes(arg)) { if (S.havzalar.length) S.arac = arg; return; }
    if (arg === 'save') { if (S.proje) S.yazildi++; return; }
    if (arg === 'new') { dlgAc({ tur: 'yeniProje', ad: '', aciklama: '', birim: 'Metric' }); return; }
    if (arg === 'compute') { hesapla(); return; }
    if (arg === 'gsum') { if (S.sonuc && S.secKosu !== '--None--') dlgAc({ tur: 'gozet' }); return; }
    if (arg === 'graph') { sonucPenceresi('grafik'); return; }
    if (arg === 'esum') { sonucPenceresi('ozet'); return; }
    if (arg === 'tstable') { sonucPenceresi('tablo'); return; }
  }

  function yap(hd, o) {
    o = o || {};
    const i = hd.indexOf(':'), tip = i < 0 ? hd : hd.slice(0, i), arg = i < 0 ? '' : hd.slice(i + 1);
    if (tip !== 'cbo' && tip !== 'cb' && hd !== 'tb:secKosu') S.combo = null;
    if (tip !== 'm' && tip !== 'mi') S.menu = null;
    if (tip !== 'bm' && tip !== 'harita') S.baglam = null;
    switch (tip) {
      case 'masaustu': S.acik = true; break;
      case 'm': S.menu = S.menu && S.menu[0] === arg && S.menu.length === 1 ? null : [arg]; S.baglam = null; break;
      case 'mi': menuEylem(arg); break;
      case 'tb': if (arg === 'secKosu') { S.combo = S.combo && S.combo.yol === 'S.secKosu' ? null : { yol: 'S.secKosu', hd }; } else aracEylem(arg); break;
      case 'xt': S.xsekme = arg; break;
      case 'agac': agacEylem(arg); break;
      case 'harita': haritaEylem(arg, o); break;
      case 'bm': baglamEylem(arg); break;
      case 'dlg': dlgEylem(arg, o); break;
      case 'ce': if (arg.startsWith('sekme:') && S.ce) S.ce.sekme = arg.slice(6); if (arg === 'yol' && S.ce) dlgAc({ tur: 'yolSec', olcer: S.ce.ad, olcerTur: S.ce.tur, sec: '' }); break;
      case 'f': if (o.doldur) { const v = ogretici(arg); if (v != null) yaz(arg, v); } break;
      case 'satir': satirEylem(arg, o); break;
      case 'cb': S.combo = S.combo && S.combo.yol === arg ? null : { yol: arg, hd }; break;
      case 'cbo': if (S.combo) { yaz(S.combo.yol, arg); S.combo = null; } break;
      case 'bolge': break;
      default: break;
    }
    if (!o.cizme) ciz();
  }

  /* ---------------------------------------------------------------- çizim parçaları */
  const bt = (hd, metin, ek) => `<button type="button" class="h-btn${ek ? ' ' + ek : ''}"${hdA(hd)}>${kac(metin)}</button>`;
  const pbt = (metin) => `<button type="button" class="h-btn" disabled>${kac(metin)}</button>`;
  const rehberli = () => !!AYAR.rehberli && AYAR.rehberli();
  function girdi(yol, gen, ek) {
    const v = al(yol);
    return `<input class="h-in${ek ? ' ' + ek : ''}" style="${gen ? 'width:' + gen + 'px' : ''}" value="${kac(v)}" data-yol="${kac(yol)}"${hdA('f:' + yol)}${rehberli() ? ' readonly' : ''} spellcheck="false" autocomplete="off">`;
  }
  function kutu(yol, gen) {
    const v = al(yol) || '--None--';
    return `<span class="h-cb" style="${gen ? 'width:' + gen + 'px' : ''}"${hdA('cb:' + yol)}><span>${kac(v)}</span><svg viewBox="0 0 10 6" class="h-ok"><path d="M1 1l4 4 4-4" fill="none" stroke="#555" stroke-width="1.3"/></svg></span>`;
  }
  const satirAlan = (et, ic, zor) => `<div class="h-sat"><label>${zor ? '<i>*</i>' : ''}${kac(et)}</label><div>${ic}</div></div>`;
  const sabit = (v) => `<span class="h-sbt">${kac(v)}</span>`;

  function baslik() {
    const ad = S.proje ? ` [${OG.yer}\\${S.proje.ad}\\${S.proje.ad}.hms]` : '';
    return `<div class="h-baslik"${hdA('bolge:baslik')}>${ik('hms')}<span class="h-bad">HEC-HMS 4.14${kac(ad)}</span><span class="h-pd"><i>—</i><i>▢</i><i>✕</i></span></div>`;
  }
  function menuListesi(liste, yol, derinlik) {
    let h = `<div class="h-dd" data-derin="${derinlik}">`;
    liste.forEach((o) => {
      if (o.ayrac) { h += '<div class="h-ayr"></div>'; return; }
      const tam = yol + '/' + o.ad, acik = S.menu && S.menu.join('/').startsWith(tam) && S.menu.length > derinlik + 1 && S.menu[derinlik + 1] === o.ad;
      h += `<div class="h-mo${o.pasif ? ' pasif' : ''}${acik ? ' acik' : ''}"${o.pasif ? '' : hdA('mi:' + tam)}><span>${kac(o.ad)}</span>${o.k ? `<em>${o.k}</em>` : ''}${o.alt ? '<b>›</b>' : ''}`;
      if (acik && o.alt && o.alt.length) h += menuListesi(o.alt, tam, derinlik + 1);
      h += '</div>';
    });
    return h + '</div>';
  }
  function menuCubugu() {
    const adlar = ['File', 'Edit', 'View', 'Components', 'GIS', 'Parameters', 'Compute', 'Results', 'Tools', 'Help'];
    return `<div class="h-menu"${hdA('bolge:menu')}>${adlar.map((a) => `<div class="h-mk"><button type="button" class="h-mb${S.menu && S.menu[0] === a ? ' acik' : ''}"${hdA('m:' + a)}>${a}</button>${S.menu && S.menu[0] === a ? menuListesi(menuKur(a), a, 0) : ''}</div>`).join('')}</div>`;
  }
  function aracCubugu() {
    const t = (id, ik2, et) => `<button type="button" class="h-tb${S.arac === id ? ' secik' : ''}" title="${kac(et)}"${hdA('tb:' + id)}>${ik(ik2)}</button>`;
    return `<div class="h-arac"${hdA('bolge:arac')}><div class="h-ar1">
      <span class="h-tg">${t('new', 'yeni', 'New Project')}${t('open', 'ac', 'Open Project')}${t('save', 'disk', 'Save Project')}${t('print', 'yazici', 'Print')}</span>
      <span class="h-tg">${t('arrow', 'ok', 'Arrow Tool')}${t('zoom', 'zum', 'Zoom Tool')}${t('subbasin', 'subbasin', 'Subbasin Creation Tool')}${t('reach', 'reach', 'Reach Creation Tool')}${t('reservoir', 'reservoir', 'Reservoir Creation Tool')}${t('junction', 'junction', 'Junction Creation Tool')}${t('diversion', 'diversion', 'Diversion Creation Tool')}${t('source', 'source', 'Source Creation Tool')}${t('sink', 'sink', 'Sink Creation Tool')}${t('breakpoint', 'arti', 'Break Point Creation Tool')}</span>
      <span class="h-tg h-hes"><span class="h-cb h-kosu"${hdA('tb:secKosu')}><span>${kac(S.secKosu)}</span><svg viewBox="0 0 10 6" class="h-ok"><path d="M1 1l4 4 4-4" fill="none" stroke="#555" stroke-width="1.3"/></svg></span>${t('compute', 'hesap', 'Compute Current Run')}${t('gsum', 'gsum', 'Global Summary Table')}${t('graph', 'graf', 'Element Graph')}${t('esum', 'esum', 'Element Summary Table')}${t('tstable', 'ts', 'Element Time-Series Table')}</span>
    </div><div class="h-ar2"${hdA('bolge:arac2')}><span class="h-cb pasif" style="width:120px"><span>--None--</span></span><span class="h-kayar"><i></i></span><span class="h-oynat">⏮ ◀ ▶ ⏸ ⏹ ▶▶ ⏭</span></div></div>`;
  }

  /* ---- ağaç */
  function dugum(id, simge, ad, cocuk, derin, ek) {
    const acik = S.acikD.has(id), var1 = cocuk && cocuk.length;
    let h = `<div class="h-d" style="padding-left:${derin * 14 + 2}px">`;
    h += var1 ? `<button type="button" class="h-pm"${hdA('agac:ac:' + id)}>${acik ? '−' : '+'}</button>` : '<span class="h-pm bos"></span>';
    h += `<span class="h-dad${S.secili === id ? ' secik' : ''}"${hdA((ek && ek.hd) || 'agac:sec:' + id)}>${ik(simge)}<span>${kac(ad)}</span></span></div>`;
    if (var1 && acik) h += cocuk.join('');
    return h;
  }
  function agac() {
    if (!S.proje) return '';
    const d = (id, s, a, c, n, e) => dugum(id, s, a, c, n, e);
    if (S.xsekme === 'Components') {
      const hv = S.havzalar.map((b) => d('h:' + b.ad, 'havza', b.ad, S.el.map((e) => d('e:' + e.ad, e.tur, e.ad, null, 3)), 2));
      const k = [d('k:basin', 'klasor', 'Basin Models', hv, 1)];
      if (S.met) k.push(d('k:met', 'klasor', 'Meteorologic Models', [d('m', 'met', S.met.ad, S.met.yagis === 'Specified Hyetograph' ? [d('hy', 'not', 'Specified Hyetograph', null, 3)] : null, 2)], 1));
      if (S.kontrol) k.push(d('k:kontrol', 'klasor', 'Control Specifications', [d('c', 'saat', S.kontrol.ad, null, 2)], 1));
      if (S.pg.length || S.dg.length) {
        const c = [];
        if (S.dg.length) c.push(d('k:dg', 'klasor', 'Discharge Gages', S.dg.map((g) => d('dg:' + g.ad, 'olcer', g.ad, null, 3)), 2));
        if (S.pg.length) c.push(d('k:pg', 'klasor', 'Precipitation Gages', S.pg.map((g) => d('pg:' + g.ad, 'olcer', g.ad, null, 3)), 2));
        k.push(d('k:ts', 'klasor', 'Time-Series Data', c, 1));
      }
      return d('p', 'klasor', S.proje.ad, k, 0);
    }
    if (S.xsekme === 'Compute') return S.kosu ? d('k:kosu', 'klasor', 'Simulation Runs', [d('r', 'kosu', S.kosu.ad, null, 1)], 0) : '';
    if (!S.sonuc) return '';
    const sira = ['Mahoning Creek Local', 'Reach-1', 'Stump Creek', 'EB Mahoning Creek', 'Junction-1', 'Junction-2'];
    const el = sira.map((a) => d('rs:' + a, (elBul(a) || {}).tur || 'junction', a, [d('rg:' + a, 'graf', 'Graph', null, 3), d('rt:' + a, 'esum', 'Summary Table', null, 3), d('rz:' + a, 'ts', 'Time-Series Table', null, 3)], 2));
    return d('k:sr', 'klasor', 'Simulation Runs', [d('rr', 'kosu', 'Run: May 1996', [d('rgs', 'gsum', 'Global Summary', null, 2)].concat(el), 1)], 0);
  }

  /* ---- bileşen düzenleyici */
  function ceIcerik() {
    const c = S.ce; if (!c || !c.tur || c.tur === 'klasor') return '';
    const sek = CE_SEKME[c.tur];
    const sekS = sek.length > 1 || c.tur !== 'proje' ? `<div class="h-cs">${sek.map((s) => `<button type="button" class="h-ct${c.sekme === s ? ' secik' : ''}"${hdA('ce:sekme:' + s)}>${kac(s)}</button>`).join('')}</div>` : '';
    let g = '';
    const e = elBul(c.ad), bn = S.havzalar[0] ? S.havzalar[0].ad : '';
    const bas = (et, deger) => `<div class="h-bas">${kac(et)}: <b>${kac(deger)}</b></div>`;
    if (c.tur === 'proje') g = bas('Name', S.proje.ad) + satirAlan('Description:', girdi('proje.aciklama')) + satirAlan('Output DSS File:', sabit(S.proje.ad + '.dss'));
    if (c.tur === 'havza') g = bas('Name', c.ad) + satirAlan('Description:', sabit(S.havzalar[0].aciklama)) + satirAlan('Unit System:', sabit(S.proje.birim)) + ['Sediment', 'Replace Missing', 'Local Flow', 'Unregulated Outputs', 'Flow Ratios'].map((x) => satirAlan(x + ':', sabit('No'))).join('') + satirAlan('Terrain Data:', sabit('--None--'));
    if (e && c.tur === 'subbasin') {
      g = bas('Basin Name', bn) + bas('Element Name', e.ad);
      if (c.sekme === 'Subbasin') g += satirAlan('Description:', girdi('el.' + e.ad + '.aciklama')) + satirAlan('Downstream:', kutu('el.' + e.ad + '.asagi')) + satirAlan('Area (MI2)', girdi('el.' + e.ad + '.alan'), 1) + satirAlan('Latitude Degrees:', sabit('')) + satirAlan('Longitude Degrees:', sabit('')) + satirAlan('Canopy Method:', sabit('--None--')) + satirAlan('Surface Method:', sabit('--None--')) + satirAlan('Loss Method:', sabit(e.yt.loss)) + satirAlan('Transform Method:', sabit(e.yt.transform)) + satirAlan('Baseflow Method:', sabit(e.yt.baseflow));
      if (c.sekme === 'Loss') g += e.yt.loss === 'Initial and Constant' ? satirAlan('Initial Loss (IN)', girdi('el.' + e.ad + '.ilk'), 1) + satirAlan('Constant Rate (IN/HR)', girdi('el.' + e.ad + '.sabit'), 1) + satirAlan('Impervious (%)', girdi('el.' + e.ad + '.gec'), 1) : '<p class="h-not">Loss Method: --None--</p>';
      if (c.sekme === 'Transform') g += e.yt.transform === 'Clark Unit Hydrograph' ? satirAlan('Method:', sabit('Standard')) + satirAlan('Time of Concentration (HR)', girdi('el.' + e.ad + '.tc'), 1) + satirAlan('Storage Coefficient (HR)', girdi('el.' + e.ad + '.r'), 1) : '<p class="h-not">Transform Method: --None--</p>';
      if (c.sekme === 'Baseflow') g += e.yt.baseflow === 'Linear Reservoir' ? satirAlan('Initial Type:', sabit(e.tip || 'Discharge')) + satirAlan('Layers:', sabit(e.katman || '1')) + ['GW 1 Initial (CFS/MI2)', 'GW 1 Fraction:', 'GW 1 Coefficient (HR)', 'GW 1 Reservoirs:'].map((x, i) => satirAlan(x, girdi('el.' + e.ad + '.g1.' + i), 1)).join('') + ['GW 2 Initial (CFS/MI2)', 'GW 2 Fraction:', 'GW 2 Coefficient (HR)', 'GW 2 Reservoirs:'].map((x, i) => satirAlan(x, girdi('el.' + e.ad + '.g2.' + i), 1)).join('') : '<p class="h-not">Baseflow Method: --None--</p>';
      if (c.sekme === 'Options') g += satirAlan('Observed Flow:', sabit('--None--')) + satirAlan('Observed SWE:', sabit('--None--'));
    }
    if (e && c.tur === 'reach') {
      g = bas('Basin Name', bn) + bas('Element Name', e.ad);
      if (c.sekme === 'Reach') g += satirAlan('Description:', girdi('el.' + e.ad + '.aciklama')) + satirAlan('Downstream:', kutu('el.' + e.ad + '.asagi')) + satirAlan('Routing Method:', sabit(e.yt.routing)) + satirAlan('Loss/Gain Method:', sabit('--None--'));
      if (c.sekme === 'Routing') g += e.yt.routing === 'Lag' ? satirAlan('Initial Type:', sabit('Discharge = Inflow')) + satirAlan('Lag (MIN)', girdi('el.' + e.ad + '.lag'), 1) : '<p class="h-not">Routing Method: --None--</p>';
      if (c.sekme === 'Options') g += satirAlan('Observed Flow:', sabit('--None--'));
    }
    if (e && c.tur === 'junction') {
      g = bas('Basin Name', bn) + bas('Element Name', e.ad);
      if (c.sekme === 'Junction') g += satirAlan('Description:', girdi('el.' + e.ad + '.aciklama')) + satirAlan('Downstream:', kutu('el.' + e.ad + '.asagi'));
      if (c.sekme === 'Options') g += satirAlan('Observed Flow:', kutu('el.' + e.ad + '.goz')) + satirAlan('Observed Stage:', sabit('--None--')) + satirAlan('Ref Flow (CFS):', sabit('')) + satirAlan('Ref Label:', sabit(''));
    }
    if (c.tur === 'pg' || c.tur === 'dg') {
      const og = S[c.tur].find((x) => x.ad === c.ad); if (!og) return '';
      const y = c.tur + '.' + og.ad + '.';
      if (c.sekme === 'Time-Series Gage') {
        g = bas('Gage Name', og.ad) + satirAlan('Description:', girdi(y + 'aciklama')) + satirAlan('Data Source:', kutu(y + 'kaynak'));
        if (og.kaynak === 'Single Record HEC-DSS') g += satirAlan('DSS Filename:', girdi(y + 'dss') + `<button type="button" class="h-kb" title="Select DSS File">${ik('dosya')}</button>`, 1) + satirAlan('DSS Pathname:', `<span class="h-in h-yol">${kac(og.yol)}</span><button type="button" class="h-kb" title="Select Pathname"${hdA('ce:yol')}>${ik('not')}</button>`, 1);
        g += satirAlan('Units:', sabit(c.tur === 'pg' ? 'Incremental Inches' : 'Cubic Feet Per Second')) + satirAlan('Time Interval:', sabit('1 Hour')) + satirAlan('Latitude Degrees:', sabit('')) + satirAlan('Longitude Degrees:', sabit(''));
      }
      if (c.sekme === 'Time Window') g = bas('Gage Name', og.ad) + satirAlan('Start Date (ddMMMYYYY)', girdi(y + 'bas'), 1) + satirAlan('Start Time (HH:mm)', girdi(y + 'basSaat'), 1) + satirAlan('End Date (ddMMMYYYY)', girdi(y + 'bit'), 1) + satirAlan('End Time (HH:mm)', girdi(y + 'bitSaat'), 1);
      const hazir = og.yol && og.bas;
      if (c.sekme === 'Table') g = hazir ? olcerTablo(og, c.tur) : '<p class="h-not">Time window not set.</p>';
      if (c.sekme === 'Graph') g = hazir ? olcerGrafik(og, c.tur) : '<p class="h-not">Time window not set.</p>';
    }
    if (c.tur === 'met' && S.met) {
      if (c.sekme === 'Meteorologic Model') g = bas('Met Name', S.met.ad) + satirAlan('Description:', girdi('met.aciklama')) + satirAlan('Shortwave:', sabit('--None--')) + satirAlan('Longwave:', sabit('--None--')) + satirAlan('Precipitation:', kutu('met.yagis')) + ['Temperature', 'Windspeed', 'Pressure', 'Dew Point', 'Snowmelt', 'Evapotranspiration'].map((x) => satirAlan(x + ':', sabit('--None--'))).join('') + satirAlan('Unit System:', sabit('U.S. Customary'));
      if (c.sekme === 'Basins') g = bas('Met Name', S.met.ad) + `<table class="h-tab"><tr><th>Basin Model</th><th>Include Subbasins</th></tr><tr${hdA('satir:dahil.Punxsutawney')}><td>Punxsutawney</td><td>${kutu('met.dahil')}</td></tr></table>`;
      if (c.sekme === 'Options') g = bas('Met Name', S.met.ad) + satirAlan('Replace Missing:', sabit('Abort Compute'));
    }
    if (c.tur === 'hyeto' && S.met) g = bas('Met Name', S.met.ad) + `<table class="h-tab"><tr><th>Subbasin Name</th><th>Gage</th></tr>${altHavzalar().map((e) => `<tr${hdA('satir:atama.' + e.ad)}><td>${kac(e.ad)}</td><td>${kutu('atama.' + e.ad, 82)}</td></tr>`).join('')}</table>`;
    if (c.tur === 'kontrol' && S.kontrol) g = bas('Name', S.kontrol.ad) + satirAlan('Description:', girdi('kontrol.aciklama')) + satirAlan('Start Date (ddMMMYYYY)', girdi('kontrol.bas'), 1) + satirAlan('Start Time (HH:mm)', girdi('kontrol.basSaat'), 1) + satirAlan('End Date (ddMMMYYYY)', girdi('kontrol.bit'), 1) + satirAlan('End Time (HH:mm)', girdi('kontrol.bitSaat'), 1) + satirAlan('Time Interval:', kutu('kontrol.aralik'));
    if (c.tur === 'kosu' && S.kosu) g = bas('Name', S.kosu.ad) + satirAlan('Description:', sabit('')) + satirAlan('Basin Model:', sabit(S.kosu.havza)) + satirAlan('Meteorologic Model:', sabit(S.kosu.met)) + satirAlan('Control Specifications:', sabit(S.kosu.kontrol)) + satirAlan('Save State:', sabit('No'));
    return sekS + `<div class="h-cg">${g}</div>`;
  }

  /* ---- grafikler */
  function nice(m) { if (m <= 0) return [1, 0.2]; const u = Math.pow(10, Math.floor(Math.log10(m))); for (const k of [1, 2, 2.5, 5, 10]) if (m <= k * u) return [k * u, (k * u) / 5]; return [m, m / 5]; }
  function eksenX(x0, x1, yb, n) {
    let h = ''; const gun = ['29', '30', '1', '2', '3', '4'];
    for (let j = 0; j < 6; j++) { const i = 23 + j * 24, x = x0 + ((x1 - x0) * i) / (n - 1); h += `<line x1="${x}" y1="${yb}" x2="${x}" y2="${yb + 4}" stroke="#333"/><text x="${x}" y="${yb + 14}" class="gx">${gun[j]}</text>`; }
    h += `<text x="${x0}" y="${yb + 26}" class="gx" text-anchor="start">Apr1996</text><text x="${x1}" y="${yb + 26}" class="gx" text-anchor="end">May1996</text>`;
    return h;
  }
  function cizgi(v, x0, x1, y0, y1, mx) { const n = v.length; return v.map((d, i) => `${(x0 + ((x1 - x0) * i) / (n - 1)).toFixed(1)},${(y1 - ((y1 - y0) * d) / mx).toFixed(1)}`).join(' '); }
  function grafikSVG(el, gen, yuk) {
    const v = R.eleman[el], n = R.n, sb = !!v.yagis, x0 = 50, x1 = gen - 10;
    let h = `<svg viewBox="0 0 ${gen} ${yuk}" class="h-graf" role="img" aria-label="${kac(el)} sonuç grafiği">`;
    let ya = 10, yb = yuk - 34;
    if (sb) {
      const ub = 10 + (yuk - 44) * 0.3, [m, s] = nice(Math.max(...v.yagis));
      h += `<rect x="${x0}" y="10" width="${x1 - x0}" height="${ub - 10}" fill="#fff" stroke="#333"/>`;
      for (let t = 0; t <= m + 1e-9; t += s * 2) { const y = 10 + ((ub - 10) * t) / m; h += `<text x="${x0 - 4}" y="${y + 3}" class="gy">${t.toFixed(2)}</text>`; }
      const w = (x1 - x0) / n;
      v.yagis.forEach((d, i) => { if (d > 0) { const x = x0 + ((x1 - x0) * i) / (n - 1) - w / 2; h += `<rect x="${x.toFixed(1)}" y="10" width="${w.toFixed(2)}" height="${(((ub - 10) * d) / m).toFixed(1)}" fill="#1d1ddb"/>`; } });
      v.kayip.forEach((d, i) => { if (d > 0) { const x = x0 + ((x1 - x0) * i) / (n - 1) - w / 2; h += `<rect x="${x.toFixed(1)}" y="10" width="${w.toFixed(2)}" height="${(((ub - 10) * d) / m).toFixed(1)}" fill="#e01b1b"/>`; } });
      h += `<text transform="translate(12 ${(10 + ub) / 2}) rotate(-90)" class="gl">Depth (IN)</text>`;
      ya = ub + 8;
    }
    const seri = [];
    if (sb) seri.push([v.akim, '#1d1ddb', ''], [v.taban, '#e01b1b', '6 3']);
    else if (el === 'Reach-1') seri.push([v.akim, '#1d1ddb', ''], [v.giris, '#1d1ddb', '6 3']);
    else if (el === 'Junction-1') seri.push([v.akim, '#1d1ddb', ''], [R.eleman['Stump Creek'].akim, '#1d1ddb', '6 3'], [R.eleman['EB Mahoning Creek'].akim, '#1d1ddb', '2 2']);
    else if (el === 'Junction-2') { seri.push([v.akim, '#1d1ddb', ''], [R.eleman['Mahoning Creek Local'].akim, '#1d1ddb', '6 3'], [R.eleman['Reach-1'].akim, '#1d1ddb', '2 2']); if (S.sonucGoz) seri.unshift([v.gozlenen, '#111', '', 1]); }
    const [m, s] = nice(Math.max(...seri.map((x) => Math.max(...x[0]))));
    h += `<rect x="${x0}" y="${ya}" width="${x1 - x0}" height="${yb - ya}" fill="#fff" stroke="#333"/>`;
    for (let t = 0; t <= m + 1e-9; t += s) { const y = yb - ((yb - ya) * t) / m; h += `<text x="${x0 - 4}" y="${y + 3}" class="gy">${t >= 1000 ? t.toLocaleString('en-US') : t}</text>${t > 0 ? `<line x1="${x0}" y1="${y}" x2="${x0 + 4}" y2="${y}" stroke="#333"/>` : ''}`; }
    seri.forEach(([d, r, k, nk]) => {
      h += `<polyline points="${cizgi(d, x0, x1, ya, yb, m)}" fill="none" stroke="${r}" stroke-width="${k ? 1.3 : 1.6}"${k ? ` stroke-dasharray="${k}"` : ''}/>`;
      if (nk) d.forEach((q, i) => { if (i % 3 === 0) h += `<circle cx="${(x0 + ((x1 - x0) * i) / (n - 1)).toFixed(1)}" cy="${(yb - ((yb - ya) * q) / m).toFixed(1)}" r="1.6" fill="#111"/>`; });
    });
    h += `<text transform="translate(12 ${(ya + yb) / 2}) rotate(-90)" class="gl">Flow (CFS)</text>` + eksenX(x0, x1, yb, n) + '</svg>';
    return h;
  }
  function lejant(el) {
    const v = R.eleman[el], r = (ad, k, renk, nk) => `<li><svg viewBox="0 0 30 8"><line x1="1" y1="4" x2="29" y2="4" stroke="${renk || '#1d1ddb'}" stroke-width="${k ? 1.3 : 2.4}"${k ? ` stroke-dasharray="${k}"` : ''}/>${nk ? '<circle cx="15" cy="4" r="2" fill="#111"/>' : ''}</svg>Run:May 1996 Element:${kac(ad)}</li>`;
    let l = '';
    if (v.yagis) l = r(el + ' Result:Precipitation', '', '#1d1ddb') + r(el + ' Result:Precipitation Loss', '', '#e01b1b') + r(el + ' Result:Outflow') + r(el + ' Result:Baseflow', '6 3', '#e01b1b');
    else if (el === 'Reach-1') l = r('Reach-1 Result:Outflow') + r('Reach-1 Result:Combined Inflow', '6 3');
    else if (el === 'Junction-1') l = r('Junction-1 Result:Outflow') + r('Stump Creek Result:Outflow', '6 3') + r('EB Mahoning Creek Result:Outflow', '2 2');
    else l = (S.sonucGoz ? r('Junction-2 Result:Observed Flow', '', '#111', 1) : '') + r('Junction-2 Result:Outflow') + r('Mahoning Creek Local Result:Outflow', '6 3') + r('Reach-1 Result:Outflow', '2 2');
    return `<div class="h-lej"><b>Legend (Compute Time: ${kac(S.kosuZamani)})</b><ul>${l}</ul></div>`;
  }
  function olcerGrafik(og, tur) {
    const v = R.olcer[tur === 'dg' ? 'PNXP-FLOW' : og.ad], n = v.length, gen = 230, yuk = 200, x0 = 34, x1 = gen - 6, ya = 8, yb = yuk - 30;
    const [m, s] = nice(Math.max(...v));
    let h = `<svg viewBox="0 0 ${gen} ${yuk}" class="h-graf" role="img" aria-label="${kac(og.ad)} grafiği"><rect x="${x0}" y="${ya}" width="${x1 - x0}" height="${yb - ya}" fill="#fff" stroke="#333"/>`;
    for (let t = 0; t <= m + 1e-9; t += s) { const y = yb - ((yb - ya) * t) / m; h += `<text x="${x0 - 3}" y="${y + 3}" class="gy">${tur === 'dg' ? Math.round(t) : t.toFixed(2)}</text>`; }
    if (tur === 'dg') h += `<polyline points="${cizgi(v, x0, x1, ya, yb, m)}" fill="none" stroke="#1d1ddb" stroke-width="1.4"/>`;
    else { const w = (x1 - x0) / n; v.forEach((d, i) => { if (d > 0) h += `<rect x="${(x0 + ((x1 - x0) * i) / (n - 1) - w / 2).toFixed(1)}" y="${(yb - ((yb - ya) * d) / m).toFixed(1)}" width="${w.toFixed(2)}" height="${(((yb - ya) * d) / m).toFixed(1)}" fill="#e01b1b"/>`; }); }
    h += `<text transform="translate(9 ${(ya + yb) / 2}) rotate(-90)" class="gl">${tur === 'dg' ? 'Flow (CFS)' : 'Precipitation (IN)'}</text>` + eksenX(x0, x1, yb, n) + '</svg>';
    return h;
  }
  const tarih = (i) => { const d = new Date(Date.UTC(1996, 3, 28, 1 + i)); const a = ['Jan', 'Feb', 'Mar', 'Apr', 'May']; return [`${String(d.getUTCDate()).padStart(2, '0')}${a[d.getUTCMonth()]}1996`, `${String(d.getUTCHours()).padStart(2, '0')}:00`]; };
  function olcerTablo(og, tur) {
    const v = R.olcer[tur === 'dg' ? 'PNXP-FLOW' : og.ad];
    return `<div class="h-tk"><table class="h-tab"><tr><th>Date</th><th>Time</th><th>${tur === 'dg' ? 'Flow (CFS)' : 'Precip (IN)'}</th></tr>${v.map((d, i) => { const [a, b] = tarih(i); return `<tr><td>${a}</td><td>${b}</td><td class="sag">${tur === 'dg' ? d.toFixed(1) : d.toFixed(2)}</td></tr>`; }).join('')}</table></div>`;
  }

  /* ---- harita */
  function harita() {
    if (!S.harita || !S.havzalar.length) return '';
    const bn = S.havzalar[0].ad, kosu = S.secKosu !== '--None--' ? ` Current Run [${S.kosu.ad}]` : '';
    let h = `<div class="h-cer"><div class="h-cerb">${ik('havza')}<span>Basin Model [${kac(bn)}]${kac(kosu)}</span><span class="h-pd k"><i>—</i><i>▢</i><i>✕</i></span></div><svg class="h-map${S.arac !== 'arrow' || S.bagla ? ' arti' : ''}" viewBox="-6 0 692 310" preserveAspectRatio="xMidYMid meet"${hdA('harita:bos')}>`;
    S.el.forEach((e) => { if (e.asagi && e.tur !== 'reach') { const a = elBul(e.asagi); if (a && a.tur !== 'reach') h += `<line x1="${e.x}" y1="${e.y}" x2="${a.x}" y2="${a.y}" stroke="#222" stroke-width="1"/>`; } });
    S.el.filter((e) => e.tur === 'reach').forEach((r) => {
      const [[a, b], [c, d]] = reachUclari(r), sec = S.secili === 'e:' + r.ad;
      h += `<g${hdA('harita:el:' + r.ad)} class="h-me">${sec ? `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="#b9b9c9" stroke-width="12" stroke-linecap="round"/>` : ''}<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="transparent" stroke-width="16"/><line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="#1d2fe0" stroke-width="4.5"/></g>`;
    });
    S.el.filter((e) => e.tur !== 'reach').forEach((e) => {
      const sec = S.secili === 'e:' + e.ad, s = e.tur === 'subbasin' ? 'subbasin' : e.tur;
      h += `<g${hdA('harita:el:' + e.ad)} class="h-me"><rect x="${e.x - 10}" y="${e.y - 10}" width="${20 + e.ad.length * 6.4 + 6}" height="20" fill="${sec ? '#cfe0f7' : 'transparent'}" stroke="${sec ? '#6c95d3' : 'none'}"/><use href="#i-${s}" x="${e.x - 9}" y="${e.y - 9}" width="18" height="18"/><text x="${e.x + 11}" y="${e.y + 4}" class="h-mt">${kac(e.ad)}</text></g>`;
    });
    if (HEDEF && HEDEF.startsWith('harita:hayalet:')) { const k = HEDEF.slice(15), [x, y] = YER[k]; h += `<g${hdA(HEDEF)} class="h-hay"><circle cx="${x}" cy="${y}" r="15" fill="rgba(0,113,227,.12)" stroke="#0071e3" stroke-width="1.6" stroke-dasharray="4 3"/><path d="M${x - 6} ${y}h12M${x} ${y - 6}v12" stroke="#0071e3" stroke-width="2"/></g>`; }
    if (S.bagla) h += `<text x="10" y="300" class="h-ip">Connect Downstream: click the downstream element</text>`;
    return h + '</svg></div>';
  }

  /* ---- açılır listeler, bağlam menüsü */
  function comboListesi() {
    if (!S.combo) return '';
    const sec = secenekler(S.combo.yol), v = al(S.combo.yol);
    return `<div class="h-cl" data-kaynak="${kac(S.combo.hd)}">${sec.map((x) => `<div class="h-clo${x === v ? ' secik' : ''}"${hdA('cbo:' + x)}>${kac(x)}</div>`).join('')}</div>`;
  }
  function baglamMenusu() {
    const b = S.baglam; if (!b) return '';
    const o = (ad, pasif, ek) => `<div class="h-mo${pasif ? ' pasif' : ''}${ek || ''}"${pasif ? '' : hdA('bm:' + ad)}><span>${kac(ad)}</span>${ad === 'View Results [May 1996]' ? '' : ''}</div>`;
    const vr = `<div class="h-mo${S.sonuc ? '' : ' pasif'}${b.alt ? ' acik' : ''}"${S.sonuc ? hdA('bm:View Results') : ''}><span>View Results [May 1996]</span><b>›</b>${b.alt ? `<div class="h-dd">${['Graph', 'Summary Table', 'Time-Series Table'].map((x) => `<div class="h-mo"${hdA('bm:' + x)}><span>${x}</span></div>`).join('')}</div>` : ''}</div>`;
    return `<div class="h-dd h-bm" style="left:${b.x}px;top:${b.y}px">${o('Edit')}${o('Compute To Point', !S.kosu)}${o('Calibration Aids', true)}${vr}<div class="h-ayr"></div>${o('Connect Downstream')}${o('Assign To Zone', true)}${o('Select Computation Point')}<div class="h-ayr"></div>${o('Cut Element')}${o('Copy Element')}${o('Paste Element', true)}<div class="h-ayr"></div>${o('Delete Element')}</div>`;
  }

  /* ---- diyaloglar */
  function pencere(baslik1, ic, gen, ek) {
    return `<div class="h-dlg${ek ? ' ' + ek : ''}" style="width:${gen}px"><div class="h-dbas">${ik('hms')}<span>${kac(baslik1)}</span><button type="button" class="h-dx"${hdA('dlg:x')}>✕</button></div><div class="h-dic">${ic}</div></div>`;
  }
  const TIP = { basin: ['Basin Model Manager', 'Current basin models:', 'Create A New Basin Model'], met: ['Meteorologic Model Manager', 'Current meteorologic models:', 'Create A New Meteorologic Model'], kontrol: ['Control Specifications Manager', 'Current control specifications:', 'Create A New Control Specifications'], ts: ['Time-Series Data Manager', 'Current time-series data:', 'Create A New Time-Series Data'] };
  function diyalog(d) {
    const T = d.tur;
    if (T === 'yeniProje') return pencere('Create a New Project', satirAlan('Name:', girdi('dlg.ad', 220)) + satirAlan('Description:', girdi('dlg.aciklama', 220)) + satirAlan('Location:', `<span class="h-in" style="width:194px">${OG.yer}</span><button type="button" class="h-kb">${ik('dosya')}</button>`) + satirAlan('Default Unit System:', kutu('dlg.birim', 150)) + `<div class="h-db">${bt('dlg:Create', 'Create')}${bt('dlg:Cancel', 'Cancel')}</div>`, 380);
    if (T === 'yonetici') {
      const [b1, b2] = TIP[d.tip];
      let liste = [];
      if (d.tip === 'basin') liste = S.havzalar.map((b) => [b.ad, b.aciklama]);
      if (d.tip === 'met') liste = S.met ? [[S.met.ad, S.met.aciklama]] : [];
      if (d.tip === 'kontrol') liste = S.kontrol ? [[S.kontrol.ad, S.kontrol.aciklama]] : [];
      if (d.tip === 'ts') liste = (d.tsTur === 'Discharge Gages' ? S.dg : d.tsTur === 'Precipitation Gages' ? S.pg : []).map((g) => [g.ad, g.aciklama]);
      const ust1 = d.tip === 'ts' ? satirAlan('Data Type:', kutu('dlg.tsTur', 170)) : '';
      return pencere(b1, ust1 + `<div class="h-yon"><div><div class="h-et">${b2}</div><div class="h-lst">${liste.map(([a, ac]) => `<div class="h-lo${a === d.son ? ' secik' : ''}"><span>${kac(a)}</span><em>${kac(ac)}</em></div>`).join('')}</div></div><div class="h-ybt">${bt('dlg:New...', 'New...')}${pbt('Copy...')}${pbt('Rename...')}${pbt('Delete')}${pbt('Description...')}</div></div><div class="h-db">${bt('dlg:Close', 'Close')}</div>`, 420);
    }
    if (T === 'yeniBilesen') return pencere(TIP[d.tip][2], (d.tip === 'ts' ? satirAlan('Data Type:', `<span class="h-cb pasif" style="width:200px"><span>${kac(d.tsTur)}</span></span>`) : '') + satirAlan('Name:', girdi('dlg.ad', 210)) + satirAlan('Description:', girdi('dlg.aciklama', 210)) + `<div class="h-db">${bt('dlg:Create', 'Create')}${bt('dlg:Cancel', 'Cancel')}</div>`, 360);
    if (T === 'adVer') { const tn = { subbasin: 'Subbasin', reach: 'Reach', junction: 'Junction' }[d.yeni.tur] || 'Element'; return pencere(`Create A New ${tn} Element`, satirAlan('Name:', girdi('dlg.ad', 200)) + satirAlan('Description:', girdi('dlg.aciklama', 200)) + `<div class="h-db">${bt('dlg:Create', 'Create')}${bt('dlg:Cancel', 'Cancel')}</div>`, 340); }
    if (T === 'ayarlar') {
      const sek = ['General', 'Basin Map', 'Defaults', 'Compute', 'Results', 'Messages'];
      let g = '';
      if (d.sekme === 'Defaults') g = satirAlan('Unit system:', sabit('U.S. Customary')) + satirAlan('Element sorting:', sabit('Hydrologic')) + satirAlan('Subbasin canopy:', sabit('--None--')) + satirAlan('Subbasin surface:', sabit('--None--')) + satirAlan('Subbasin loss:', kutu('vars.loss', 170)) + satirAlan('Subbasin transform:', kutu('vars.transform', 170)) + satirAlan('Subbasin baseflow:', kutu('vars.baseflow', 170)) + satirAlan('Reach routing:', kutu('vars.routing', 170)) + satirAlan('Reach loss/gain:', sabit('--None--')) + satirAlan('Subbasin precipitation:', sabit('--None--'));
      else if (d.sekme === 'General') g = ['Display warning before changing component method', 'Display warning before deleting a component', 'Automatically close progress window when successful', 'Automatically open last project on start-up'].map((x, i) => `<div class="h-kt"><span class="h-ck${i < 2 ? ' on' : ''}"></span>${x}</div>`).join('') + satirAlan('Theme:', sabit('Light'));
      else g = '<p class="h-not">—</p>';
      return pencere('Program Settings', `<div class="h-cs">${sek.map((s) => `<button type="button" class="h-ct${d.sekme === s ? ' secik' : ''}"${hdA('dlg:sekme:' + s)}>${s}</button>`).join('')}</div><div class="h-cg h-ays">${g}</div><div class="h-db">${bt('dlg:OK', 'OK')}${bt('dlg:Cancel', 'Cancel')}</div>`, 450);
    }
    if (T === 'global') {
      const bn = S.havzalar[0] ? S.havzalar[0].ad : '', sb = altHavzalar();
      const K = {
        alan: ['Subbasin Area', ['Area<br>(MI2)'], (e) => [['alan']]],
        kayip: ['Initial and Constant', ['Initial Loss<br>(IN)', 'Constant Rate<br>(IN/HR)', 'Impervious<br>(%)'], (e) => [['ilk'], ['sabit'], ['gec']]],
        clark: ['Clark Unit Hydrograph', ['Clark Method', 'Time of Concentration<br>(HR)', 'Storage Coefficient<br>(HR)'], (e) => [null, ['tc'], ['r']]],
        taban: ['Linear Reservoir', ['Number of<br>Layers', 'Initial Type', 'GW 1<br>Initial', 'GW 1<br>Fraction', 'GW 1<br>Coef. (HR)', 'GW 1<br>Reservoirs', 'GW 2<br>Initial', 'GW 2<br>Fraction', 'GW 2<br>Coef. (HR)', 'GW 2<br>Reservoirs'], (e) => [['katman'], ['tip'], ['g1', 0], ['g1', 1], ['g1', 2], ['g1', 3], ['g2', 0], ['g2', 1], ['g2', 2], ['g2', 3]]],
        lag: ['Lag', ['Lag (MIN)'], (e) => [['lag']]],
      }[d.tip];
      const sat = d.tip === 'lag' ? S.el.filter((e) => e.tur === 'reach') : sb;
      const hucre = (e, k) => { if (!k) return '<td>Standard</td>'; const yol = 'el.' + e.ad + '.' + k.join('.'); return `<td><input class="h-hc${k[0] === 'tip' ? ' gen' : ''}" value="${kac(al(yol))}" data-yol="${kac(yol)}"${rehberli() ? ' readonly' : ''} spellcheck="false"></td>`; };
      const tablo = `<div class="h-tk"><table class="h-tab h-gt"><tr><th>${d.tip === 'lag' ? 'Reach' : 'Subbasin'}</th>${K[1].map((x) => `<th>${x}</th>`).join('')}</tr>${sat.map((e) => `<tr${hdA('satir:' + d.tip + '.' + e.ad)}><td class="ad">${kac(e.ad)}</td>${K[2](e).map((k) => hucre(e, k)).join('')}</tr>`).join('')}</table></div>`;
      return pencere(`${K[0]} [${bn}]`, `<div class="h-gu"><span>${d.tip === 'alan' ? 'Show Elements: <u>All Elements</u>' : 'Filter: <u>--None--</u>'}</span><span>Sorting: <u>Watershed Explorer</u></span></div>${tablo}<div class="h-db h-dba"><span>Compute: <u>All Elements</u></span>${pbt('Print')}${bt('dlg:Apply', 'Apply')}${bt('dlg:Close', 'Close')}</div>`, d.tip === 'taban' ? 640 : 470, 'h-gen');
    }
    if (T === 'yolSec') {
      const b = d.olcer, rows = YOLLAR.filter((y) => y[1] === b && (d.olcerTur === 'dg' ? y[2] === 'FLOW' : true));
      return pencere('Select Pathname From HEC-DSS File', `<div class="h-gu"><span>A: <u>&nbsp;</u></span><span>B: <u>${kac(b)}</u></span><span>C: <u>&nbsp;</u></span></div><div class="h-tk"><table class="h-tab h-yt"><tr><th>Number</th><th>Part A</th><th>Part B</th><th>Part C</th><th>Part D / range</th><th>Part E</th><th>Part F</th></tr>${rows.map((y, i) => `<tr class="${d.sec === yolAdi(y) ? 'secik' : ''}"${hdA('dlg:yol:' + yolAdi(y))}><td>${i + 1}</td><td>${y[0]}</td><td>${y[1]}</td><td>${y[2]}</td><td>01Apr1994 - 31May1996</td><td>1Hour</td><td>OBS</td></tr>`).join('')}</table></div><div class="h-db">${bt('dlg:Set Pathname', 'Set Pathname')}${bt('dlg:Cancel', 'Cancel')}</div>`, 560, 'h-gen');
    }
    if (T === 'sihirbaz') {
      const metin = ['', 'A simulation run must have a name. You can give it a description after it has been created.', `Selected basin model "${d.havza || '?'}". A simulation run includes a meteorologic model. Select one from the list below.`, '', ''];
      let g = '';
      const liste = (ogeler, alan) => `<div class="h-tk"><table class="h-tab h-yt"><tr><th>Name</th><th>Description</th></tr>${ogeler.map(([a, ac]) => `<tr class="${d[alan] === a ? 'secik' : ''}"${hdA('dlg:secim:' + a)}><td>${kac(a)}</td><td>${kac(ac)}</td></tr>`).join('')}</table></div>`;
      if (d.adim === 1) g = `<p class="h-sp">${metin[1]}</p>` + satirAlan('Name:', girdi('dlg.ad', 220));
      if (d.adim === 2) g = '<p class="h-sp">A simulation run includes a basin model. Select one from the list below.</p>' + liste(S.havzalar.map((b) => [b.ad, b.aciklama]), 'havza');
      if (d.adim === 3) g = `<p class="h-sp">${kac(metin[2])}</p>` + liste(S.met ? [[S.met.ad, S.met.aciklama]] : [], 'met');
      if (d.adim === 4) g = `<p class="h-sp">${kac(`Selected basin model "${d.havza}" and meteorologic model "${d.met}". A simulation run includes a control specifications. Select one from the list below.`)}</p>` + liste(S.kontrol ? [[S.kontrol.ad, S.kontrol.aciklama]] : [], 'kontrol');
      return pencere(`Create a Simulation Run [Step ${d.adim} of 4]`, g + `<div class="h-db">${d.adim > 1 ? bt('dlg:< Back', '< Back') : pbt('< Back')}${d.adim < 4 ? bt('dlg:Next >', 'Next >') : bt('dlg:Finish', 'Finish')}${bt('dlg:Cancel', 'Cancel')}</div>`, 430);
    }
    if (T === 'ilerleme') return pencere('Compute Progress', `<p class="h-sp">Simulation Run "May 1996"</p><div class="h-bar"><i></i></div><p class="h-sp h-tam">Compute completed.</p><div class="h-db">${bt('dlg:Close', 'Close')}</div>`, 330);
    if (T === 'grafik') {
      const tur = { subbasin: 'Subbasin', reach: 'Reach', junction: 'Junction' }[(elBul(d.el) || {}).tur] || 'Element';
      return pencere(`Graph for ${tur} "${d.el}"`, `<div class="h-gm"><span>File</span><span>Edit</span><span>View</span></div><div class="h-gb">${tur} "${kac(d.el)}" Results for Run "May 1996"</div>${grafikSVG(d.el, 500, 290)}${lejant(d.el)}<div class="h-db">${bt('dlg:Close', 'Close')}</div>`, 520, 'h-sonuc');
    }
    if (T === 'ozet') {
      const o = R.ozet[d.el], tur = { subbasin: 'Subbasin', reach: 'Reach', junction: 'Junction' }[(elBul(d.el) || {}).tur] || 'Element';
      const ust1 = `<div class="h-oz"><p>Project: Punxsutawney &nbsp; Simulation Run: May 1996<br>${tur}: ${kac(d.el)}</p><dl><dt>Start of Run:</dt><dd>28Apr1996, 01:00</dd><dt>Basin Model:</dt><dd>Punxsutawney</dd><dt>End of Run:</dt><dd>04May1996, 00:00</dd><dt>Meteorologic Model:</dt><dd>May 1996</dd><dt>Compute Time:</dt><dd>${kac(S.kosuZamani)}</dd><dt>Control Specifications:</dt><dd>May 1996</dd></dl><p class="h-vu">Volume Units: <span class="h-rd on"></span>IN <span class="h-rd"></span>ACRE-FT</p>`;
      let ic = `<div class="h-oc"><b>Computed Results</b><dl><dt>Peak Discharge:</dt><dd>${o.tepe.toFixed(1)} (CFS)</dd><dt>Date/Time of Peak Discharge:</dt><dd>${o.zaman}</dd>`;
      if (o.yagisH != null) ic += `<dt>Precipitation Volume:</dt><dd>${o.yagisH.toFixed(2)} (IN)</dd><dt>Direct Runoff Volume:</dt><dd>${o.dogrudanH.toFixed(2)} (IN)</dd><dt>Loss Volume:</dt><dd>${o.kayipH.toFixed(2)} (IN)</dd><dt>Baseflow Volume:</dt><dd>${o.tabanH.toFixed(2)} (IN)</dd><dt>Excess Volume:</dt><dd>${o.etkiliH.toFixed(2)} (IN)</dd>`;
      ic += `<dt>Discharge Volume:</dt><dd>${o.hacim.toFixed(2)} (IN)</dd></dl></div>`;
      if (d.el === 'Junction-2' && S.sonucGoz) { const g = o.gozlem; ic += `<div class="h-oc"><b>Observed Flow Gage PNXP</b><dl><dt>Peak Discharge:</dt><dd>${g.tepe.toFixed(1)} (CFS)</dd><dt>Date/Time of Peak Discharge:</dt><dd>${g.zaman}</dd><dt>Volume:</dt><dd>${g.hacim.toFixed(2)} (IN)</dd><dt>Nash-Sutcliffe:</dt><dd>${g.nse.toFixed(3)}</dd><dt>RMSE Std Dev:</dt><dd>${g.rmse.toFixed(1)}</dd><dt>Modified Kling-Gupta:</dt><dd>${g.kge.toFixed(3)}</dd><dt>Percent Bias:</dt><dd>${g.bias.toFixed(2)} %</dd></dl></div>`; }
      return pencere(`Summary Results for ${tur} "${d.el}"`, ust1 + ic + `</div><div class="h-db">${bt('dlg:Close', 'Close')}</div>`, 470, 'h-sonuc');
    }
    if (T === 'gozet') {
      const sira = ['Mahoning Creek Local', 'Reach-1', 'Stump Creek', 'EB Mahoning Creek', 'Junction-1', 'Junction-2'];
      return pencere('Global Summary Results for Run "May 1996"', `<div class="h-oz"><p>Project: Punxsutawney &nbsp; Simulation Run: May 1996</p><dl><dt>Start of Run:</dt><dd>28Apr1996, 01:00</dd><dt>Basin Model:</dt><dd>Punxsutawney</dd><dt>End of Run:</dt><dd>04May1996, 00:00</dd><dt>Meteorologic Model:</dt><dd>May 1996</dd><dt>Compute Time:</dt><dd>${kac(S.kosuZamani)}</dd><dt>Control Specifications:</dt><dd>May 1996</dd></dl></div><div class="h-tk"><table class="h-tab h-gs"><tr><th>Hydrologic<br>Element</th><th>Drainage Area<br>(MI2)</th><th>Peak Discharge<br>(CFS)</th><th>Time of Peak</th><th>Volume<br>(IN)</th></tr>${sira.map((a) => { const o = R.ozet[a]; return `<tr${hdA('dlg:gs:' + a)}><td class="ad">${a}</td><td class="sag">${o.alan.toFixed(1)}</td><td class="sag">${o.tepe.toFixed(1)}</td><td>${o.zaman}</td><td class="sag">${o.hacim.toFixed(2)}</td></tr>`; }).join('')}</table></div><div class="h-db">${bt('dlg:Close', 'Close')}</div>`, 520, 'h-sonuc');
    }
    if (T === 'tablo') {
      const v = R.eleman[d.el], sb = !!v.yagis;
      const bas1 = sb ? ['Date', 'Time', 'Precip<br>(IN)', 'Loss<br>(IN)', 'Excess<br>(IN)', 'Direct Flow<br>(CFS)', 'Baseflow<br>(CFS)', 'Total Flow<br>(CFS)'] : ['Date', 'Time', 'Outflow<br>(CFS)'].concat(v.giris ? ['Inflow<br>(CFS)'] : []).concat(d.el === 'Junction-2' && S.sonucGoz ? ['Observed<br>(CFS)'] : []);
      const satir = v.akim.map((q, i) => { const [a, b] = tarih(i); const h = sb ? [v.yagis[i].toFixed(2), v.kayip[i].toFixed(2), v.etkili[i].toFixed(2), v.dogrudan[i].toFixed(1), v.taban[i].toFixed(1), q.toFixed(1)] : [q.toFixed(1)].concat(v.giris ? [v.giris[i].toFixed(1)] : []).concat(d.el === 'Junction-2' && S.sonucGoz ? [v.gozlenen[i].toFixed(1)] : []); return `<tr><td>${a}</td><td>${b}</td>${h.map((x) => `<td class="sag">${x}</td>`).join('')}</tr>`; }).join('');
      return pencere(`Time-Series Results for "${d.el}"`, `<div class="h-tk h-tku"><table class="h-tab h-gt"><tr>${bas1.map((x) => `<th>${x}</th>`).join('')}</tr>${satir}</table></div><p class="h-not">Hourly rows (the program lists every 15 minutes).</p><div class="h-db">${bt('dlg:Close', 'Close')}</div>`, 520, 'h-sonuc');
    }
    return '';
  }

  function log() { return `<div class="h-log"${hdA('bolge:log')}>${S.log.map(([t, s]) => `<div class="${t === 'w' ? 'w' : ''}">${kac(s)}</div>`).join('')}</div>`; }
  function govde() {
    return `<div class="h-govde"><div class="h-sol"><div class="h-exp"${hdA('bolge:agac')}><div class="h-agac">${agac()}</div><div class="h-xs">${['Components', 'Compute', 'Results'].map((s) => `<button type="button" class="h-xt${S.xsekme === s ? ' secik' : ''}"${hdA('xt:' + s)}>${s}</button>`).join('')}</div></div><div class="h-ce"${hdA('bolge:ce')}>${ceIcerik()}</div></div><div class="h-sag"><div class="h-masa"${hdA('bolge:masa')}>${harita()}</div>${log()}</div></div>`;
  }
  function masaustu() {
    return `<div class="h-win"${hdA('bolge:masaustu')}><button type="button" class="h-uyg"${hdA('masaustu:hms')}><svg class="h-ui" aria-hidden="true"><use href="#i-hms"/></svg><span>HEC-HMS 4.14</span></button></div>`;
  }

  /* ---------------------------------------------------------------- ana çizim */
  function ciz() {
    if (!KOK) return;
    const kayY = [...KOK.querySelectorAll('.h-agac, .h-cg, .h-tk')].map((e) => e.scrollTop);
    if (!S.acik) { KOK.innerHTML = masaustu(); isaretle(); return; }
    KOK.innerHTML = baslik() + menuCubugu() + aracCubugu() + govde() + `<div class="h-kat">${S.dlg.map((d, i) => `<div class="h-dk${i === S.dlg.length - 1 ? ' ust' : ''}" style="--i:${i}">${diyalog(d)}</div>`).join('')}${baglamMenusu()}${comboListesi()}</div>`;
    const lg = KOK.querySelector('.h-log'); if (lg) lg.scrollTop = lg.scrollHeight;
    KOK.querySelectorAll('.h-agac, .h-cg, .h-tk').forEach((e, i) => { if (kayY[i]) e.scrollTop = kayY[i]; });
    duzelt(); isaretle();
  }
  function duzelt() {
    const kr = KOK.getBoundingClientRect(), s = OLCEK || 1;
    KOK.querySelectorAll('.h-dd .h-dd').forEach((dd) => { const r = dd.getBoundingClientRect(); if (r.right > kr.right - 2) { dd.style.left = 'auto'; dd.style.right = '100%'; } });
    KOK.querySelectorAll('.h-mk > .h-dd').forEach((dd) => { const r = dd.getBoundingClientRect(); if (r.right > kr.right - 2) dd.style.left = -(r.right - kr.right + 4) / s + 'px'; });
    const bm = KOK.querySelector('.h-bm'); if (bm) { const r = bm.getBoundingClientRect(); if (r.right > kr.right) bm.style.left = (parseFloat(bm.style.left) - (r.right - kr.right) / s - 4) + 'px'; if (r.bottom > kr.bottom) bm.style.top = Math.max(0, parseFloat(bm.style.top) - (r.bottom - kr.bottom) / s - 4) + 'px'; }
    const cl = KOK.querySelector('.h-cl');
    if (cl) {
      const kay = KOK.querySelector(`[data-hd="${CSS.escape(cl.dataset.kaynak)}"]`);
      if (kay) { const r = kay.getBoundingClientRect(); cl.style.left = (r.left - kr.left) / s + 'px'; cl.style.top = (r.bottom - kr.top) / s + 'px'; cl.style.minWidth = r.width / s + 'px'; const c2 = cl.getBoundingClientRect(); if (c2.bottom > kr.bottom) cl.style.top = ((r.top - kr.top) / s - c2.height / s) + 'px'; if (c2.right > kr.right) cl.style.left = ((kr.right - kr.left) / s - c2.width / s - 4) + 'px'; }
    }
  }
  function isaretle() {
    if (!KOK) return;
    KOK.querySelectorAll('.h-hedef').forEach((e) => e.classList.remove('h-hedef'));
    if (!HEDEF) return;
    const e = hedefEl(HEDEF); if (e) e.classList.add('h-hedef');
  }
  function hedefEl(hd) { return KOK && KOK.querySelector(`[data-hd="${CSS.escape(hd)}"]`); }

  /* ---------------------------------------------------------------- olaylar */
  function olay(ev, sag) {
    const t = ev.target.closest('[data-hd]');
    if (!t || !KOK.contains(t)) return;
    if (sag) ev.preventDefault();
    const hd = t.dataset.hd, kr = KOK.getBoundingClientRect(), s = OLCEK || 1;
    const o = { sag, el: t, x: Math.round((ev.clientX - kr.left) / s), y: Math.round((ev.clientY - kr.top) / s) };
    if (hd === 'harita:bos' || hd.startsWith('harita:')) {
      const svg = KOK.querySelector('.h-map');
      if (svg && svg.getScreenCTM()) { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); o.hx = Math.round(q.x); o.hy = Math.round(q.y); }
    }
    if (t.tagName === 'INPUT' && !rehberli()) { AYAR.tik && AYAR.tik(hd, o, true); return; }
    AYAR.tik && AYAR.tik(hd, o);
  }
  function kur(kok, ayar) {
    KOK = kok; AYAR = ayar || {};
    if (!document.getElementById('i-hms')) document.body.insertAdjacentHTML('afterbegin', SIMGE);
    kok.addEventListener('click', (e) => { if (uzunBasildi) { uzunBasildi = false; e.preventDefault(); return; } olay(e, false); });
    kok.addEventListener('contextmenu', (e) => { e.preventDefault(); olay(e, true); });
    kok.addEventListener('input', (e) => { const y = e.target.dataset && e.target.dataset.yol; if (y && !rehberli()) yaz(y, e.target.value); });
    let zam = null, uzunBasildi = false;
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && S && (S.menu || S.combo || S.baglam || S.bagla)) { S.menu = null; S.combo = null; S.baglam = null; S.bagla = null; ciz(); } });
    kok.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch') return; clearTimeout(zam); zam = setTimeout(() => { uzunBasildi = true; olay(e, true); }, 520); });
    ['pointerup', 'pointercancel', 'pointermove'].forEach((n) => kok.addEventListener(n, (e) => { if (n === 'pointermove' && e.pointerType === 'touch' && Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0) < 3) return; clearTimeout(zam); }));
    S = bosDurum();
  }

  window.HMS = {
    kur, yap, ciz, hedefEl,
    durum: () => S,
    bosalt(acik) { S = bosDurum(); S.acik = acik !== false; },
    hedef(hd) { HEDEF = hd; },
    olcek(s) { OLCEK = s; },
    projeAcikLog, logEkle,
    ozet: () => R.ozet,
    temizle() { S.menu = null; S.combo = null; S.baglam = null; S.bagla = null; S.dlg = []; },
  };
})();
