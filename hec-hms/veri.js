/* HEC-HMS Okulu — içerik. AC: keşif modunda «Bu ne işe yarar?» açıklamaları (anahtar = arayüz parçası).
   ODEV: Ninova'daki iki ödev; her adım hem «Ödevler» bölümünde hem rehberli benzetimde kullanılır.
   mikro: [tıklanacak parça (data-hd), tek satır yönerge, ek] — ek.yap: başka eylem, ek.sag: sağ tık.
   Adım adım izle: IZ1/IZ2 (dosyanın sonunda) ödev adımlarıyla aynı sırada; yüklenince her adıma a.izle
   {giris, sonunda, neden, dikkat, teori:{b,m}}, her mikroya m.sonra (+ m.dikkat, m.iz) eklenir. */
(function () {
  'use strict';
  const AC = {
    masaustu: { b: 'HEC-HMS 4.14', t: 'Programın kendisi', m: ['Taşınabilir sürüm: klasördeki HEC-HMS.exe ile açılır, kurulum gerekmez.', 'Açılınca boş, gri bir pencere gelir; önce proje açılır ya da yaratılır.'], d: ['Ödevlerde 4.14 beta 2 ve sonrası istenir.', 'Program dili ve bölge ayarı İngilizce olsun; Türkçe ayarda tarih ve birim hataları çıkabiliyor.'] },
    'bolge:masaustu': { b: 'Masaüstü', t: 'Program henüz kapalı', m: ['HEC-HMS 4.14 simgesine basınca program açılır.'] },
    'bolge:baslik': { b: 'Başlık çubuğu', t: 'Açık projenin adı ve yolu', m: ['Köşeli parantez içinde .hms proje dosyasının yeri görünür.', 'Proje yoksa yalnız «HEC-HMS 4.14» yazar.'] },
    'bolge:menu': { b: 'Menü çubuğu', t: 'Bütün komutlar burada', m: ['10 menü: File, Edit, View, Components, GIS, Parameters, Compute, Results, Tools, Help.', 'Ödevlerde en çok Components, Parameters, Compute ve Results kullanılır.'] },
    'm:File': { b: 'File', t: 'Proje dosyası işleri', m: ['New: yeni proje · Open: var olan projeyi aç.', 'Save: projeyi diske yaz · Save As: başka adla yaz.', 'Import/Export: başka projeden model al, dışarı ver.'], d: ['Proje = bir klasör + içinde .hms, .basin, .met, .control, .dss dosyaları.', 'Programda geri al (Undo) sınırlı; sık sık Save.'] },
    'mi:File/New...': { b: 'File › New...', t: 'Yeni proje yaratır', m: ['Ad, açıklama, konum ve varsayılan birim sistemi sorulur.', 'Birim sistemi sonradan değişirse girilmiş değerler bozulur.'], d: ['U.S. Customary: inç, mil², cfs · Metric: mm, km², m³/s.'] },
    'mi:File/Save': { b: 'File › Save', t: 'Projeyi diske yazar', m: ['Disket simgesi ya da Ctrl+S ile aynı iş.', 'Bütün modeller (havza, meteoroloji, kontrol) birlikte yazılır.'] },
    'm:Edit': { b: 'Edit', t: 'Haritadaki elemanları seçme, kesme, kopyalama', m: ['Select Upstream: bir noktanın yukarısındaki bütün elemanları seçer.', 'Cut/Copy/Paste: elemanı başka havza modeline taşımak için.'] },
    'm:View': { b: 'View', t: 'Harita görünümü', m: ['Zoom In/Out, Zoom To All: haritayı yakınlaştır, hepsini sığdır.', 'Map Layers: arka plana nehir/sınır katmanı ekle.', 'Draw Element Labels: eleman adlarını göster/gizle.'] },
    'm:Components': { b: 'Components', t: 'Modelin parçalarını yöneten menü', m: ['Basin Model Manager: havza modeli (alt havzalar, kanallar).', 'Meteorologic Model Manager: yağış nasıl verilecek.', 'Control Specifications Manager: hesabın başlangıç, bitiş ve adımı.', 'Time-Series Data Manager: ölçer verileri (yağış, akım).'], d: ['Bir koşu (simulation run) = havza modeli + meteorolojik model + kontrol ayarı.', 'Create Component aynı yaratma pencerelerini doğrudan açar.'] },
    'mi:Components/Basin Model Manager': { b: 'Basin Model Manager', t: 'Havza modellerini yaratır, kopyalar, adlandırır', m: ['New... ile boş havza modeli açılır.', 'Aynı projede birden çok senaryo olabilir: «mevcut durum», «baraj sonrası».'] },
    'mi:Components/Meteorologic Model Manager': { b: 'Meteorologic Model Manager', t: 'Yağışın modele nasıl verileceğini tutar', m: ['Meteorolojik model; yağış, sıcaklık, buharlaşma yöntemlerini seçer.', 'HW#2: «May 1996» modeli, Specified Hyetograph yöntemi.'] },
    'mi:Components/Control Specifications Manager': { b: 'Control Specifications Manager', t: 'Hesabın zaman ayarı', m: ['Başlangıç, bitiş ve zaman adımı (time interval) burada.', 'HW#2: 28 Nisan 1996 01:00 – 4 Mayıs 1996 00:00, 15 dakika.'] },
    'mi:Components/Time-Series Data Manager': { b: 'Time-Series Data Manager', t: 'Ölçer verilerini yönetir', m: ['Data Type ile tür seçilir: Precipitation Gages (yağış), Discharge Gages (akım).', 'Veri elle girilebilir ya da HEC-DSS dosyasından okunur.'] },
    'mi:Components/Create Component': { b: 'Create Component', t: 'Yaratma pencerelerine kısa yol', m: ['Basin Model..., Meteorologic Model..., Control Specifications... doğrudan «Create A New …» penceresini açar.'] },
    'm:GIS': { b: 'GIS', t: 'Sayısal yükseklik modelinden havza çıkarma', m: ['Arazi verisi (DEM) varsa dereleri ve alt havzaları otomatik çizer.', 'Ödevlerde arazi verisi yok; menü bu yüzden soluk.'], d: ['Preprocess Sinks → Drainage → Identify Streams → Delineate Elements sırası izlenir.'] },
    'm:Parameters': { b: 'Parameters', t: 'Yöntem parametrelerini tablo hâlinde girme', m: ['Her seçenek, bütün alt havzaları tek tabloda gösteren «global editör» açar.', 'Subbasin Area: alanlar · Loss, Transform, Baseflow: alt havza yöntemleri · Routing: kanal.'], d: ['Aynı değerler tek tek Component Editor sekmelerinden de girilebilir.', 'Alt menüde yalnız kullanılan yöntem koyu görünür; diğerleri soluk.'] },
    'mi:Parameters/Subbasin Area': { b: 'Subbasin Area', t: 'Alt havza alanları tablosu', m: ['Birim: MI2 (mil kare) — U.S. Customary projede.', 'Alan, derinliği (inç) debiye (cfs) çevirir.'] },
    'mi:Parameters/Loss': { b: 'Parameters › Loss', t: 'Kayıp yöntemleri', m: ['Kayıp: yağışın akışa geçmeyen kısmı (sızma, tutulma).', 'Initial and Constant: önce sabit bir başlangıç kaybı, sonra sabit hız.'], d: ['SCS Curve Number: zemin ve arazi kullanımına göre tek sayı (CN).', 'Soil Moisture Accounting: uzun süreli, toprak nemini izleyen yöntem.'] },
    'mi:Parameters/Transform': { b: 'Parameters › Transform', t: 'Etkili yağışı akıma çevirme', m: ['Clark Unit Hydrograph: öteleme (Tc) + depolama (R).', 'SCS Unit Hydrograph: tek parametre, gecikme süresi (lag).'] },
    'mi:Parameters/Baseflow': { b: 'Parameters › Baseflow', t: 'Taban akışı yöntemleri', m: ['Taban akışı: yeraltından dereye gelen yavaş akım.', 'Linear Reservoir: sızan su doğrusal haznelerden yavaşça çıkar.'] },
    'mi:Parameters/Routing': { b: 'Parameters › Routing', t: 'Kanal öteleme yöntemleri', m: ['Lag: akımı yalnız geciktirir, şeklini bozmaz.', 'Muskingum: hem geciktirir hem tepeyi basıklaştırır.'] },
    'm:Compute': { b: 'Compute', t: 'Hesabı kurma ve çalıştırma', m: ['Create Compute › Simulation Run...: 4 adımlı sihirbazla koşu yaratır.', 'Compute Run [..]: seçili koşuyu hesaplar (araç çubuğundaki yağmur bulutu ile aynı).'], d: ['Optimization Trial: gözlenen akıma göre parametre kalibrasyonu.', 'Uncertainty / Frequency Analysis: çok sayıda koşuyla belirsizlik ve frekans.'] },
    'mi:Compute/Create Compute': { b: 'Create Compute', t: 'Yeni hesap türü yaratır', m: ['Ödevde yalnız «Simulation Run...» kullanılır.'] },
    'm:Results': { b: 'Results', t: 'Hesap sonuçları', m: ['Global Summary Table: her elemanın tepe debisi, zamanı ve hacmi.', 'Element Graph / Summary / Time-Series: seçili elemanın sonucu.'], d: ['Hesap yapılmadan ve koşu seçilmeden menü soluktur.'] },
    'mi:Results/Global Summary Table': { b: 'Global Summary Table', t: 'Bütün elemanların tek tablo özeti', m: ['Sütunlar: drenaj alanı, tepe debi, tepe zamanı, hacim.', 'Havza çıkışı (Junction-2) en alttaki satır.'] },
    'm:Tools': { b: 'Tools', t: 'Yardımcı araçlar ve ayarlar', m: ['Program Settings: varsayılan yöntemler, birim, görünüm.', 'Data: veri hesap makinesi, boşluk doldurma.', 'Reports: havza ve koşu raporu.'] },
    'mi:Tools/Program Settings...': { b: 'Program Settings', t: 'Programın genel ayarları', m: ['Defaults sekmesi: yeni elemanların doğacağı yöntemler.', 'Burada seçilen yöntem, sonradan eklenen her elemana uygulanır.'] },
    'm:Help': { b: 'Help', t: 'Kılavuzlar', m: ["User's Manual ve Technical Reference Manual: yöntemlerin denklemleri.", 'Tutorials and Guides: ödevlerdeki öğreticilerin bulunduğu site.'] },
    'bolge:arac': { b: 'Araç çubukları', t: 'Sık kullanılan komutların simgeleri', m: ['Solda dosya: New, Open, Save, Print.', 'Ortada eleman araçları: Arrow, Zoom, Subbasin, Reach, Junction…', 'Sağda hesap: koşu seçimi, Compute, sonuç tabloları.'] },
    'bolge:arac2': { b: 'Zaman çubuğu', t: 'Mekânsal sonuç animasyonu', m: ['Izgara (gridded) verilerde sonucu zamanda oynatır.', 'Ödevlerde kullanılmıyor.'] },
    'tb:new': { b: 'New Project', t: 'Yeni proje', m: ['File › New ile aynı.'] },
    'tb:open': { b: 'Open Project', t: 'Var olan projeyi açar', m: ['Klasördeki .hms dosyası seçilir.'] },
    'tb:save': { b: 'Save Project', t: 'Projeyi diske yazar', m: ['Disket simgesi = File › Save.', 'Öğretici «sık sık bas» diyor.'] },
    'tb:print': { b: 'Print', t: 'Haritayı yazdırır', m: ['Açık havza haritasını yazıcıya ya da PDF\'e gönderir.'] },
    'tb:arrow': { b: 'Arrow Tool', t: 'Seçme ve taşıma', m: ['Elemana bas: seçer, Component Editor açılır.', 'Sürükle: elemanın yerini değiştirir.'] },
    'tb:zoom': { b: 'Zoom Tool', t: 'Yakınlaştırma', m: ['Haritada bir kutu çizerek o bölgeye yaklaşır.'] },
    'tb:subbasin': { b: 'Subbasin Creation Tool', t: 'Alt havza ekler', m: ['Seçip haritaya bas: «Create A New Subbasin Element» gelir.', 'Alt havza = yağışı akıma çeviren alan (kayıp + dönüşüm + taban akışı).'] },
    'tb:reach': { b: 'Reach Creation Tool', t: 'Kanal (dere parçası) ekler', m: ['Reach, gelen akımı aşağıya taşır ve geciktirir.', 'Haritada kalın mavi çizgi olarak görünür.'] },
    'tb:reservoir': { b: 'Reservoir Creation Tool', t: 'Baraj/gölet ekler', m: ['Depolama-çıkış ilişkisiyle akımı biriktirip bırakır.', 'Ödevlerde yok.'] },
    'tb:junction': { b: 'Junction Creation Tool', t: 'Birleşim noktası ekler', m: ['Birden çok kolun akımını toplar.', 'Havza çıkışı genelde bir junction (burada Junction-2).'] },
    'tb:diversion': { b: 'Diversion Creation Tool', t: 'Akımı ikiye ayırır', m: ['Taşkın kanalı, sulama alma yapısı gibi.'] },
    'tb:source': { b: 'Source Creation Tool', t: 'Dışarıdan akım girer', m: ['Modelin dışından gelen bilinen bir akım (ör. üst havza).'] },
    'tb:sink': { b: 'Sink Creation Tool', t: 'Akımın çıktığı uç', m: ['Ağın son noktası; akım burada modelden çıkar.'] },
    'tb:breakpoint': { b: 'Break Point Creation Tool', t: 'GIS ile havza bölme noktası', m: ['Arazi verisiyle alt havza sınırı çizerken kullanılır.'] },
    'tb:secKosu': { b: 'Koşu seçimi', t: 'Hangi koşu hesaplanacak', m: ['Listeden «Run: May 1996» seçilir.', 'Seçilince haritanın başlığında «Current Run» yazar.'] },
    'tb:compute': { b: 'Compute Current Run', t: 'Seçili koşuyu hesaplar', m: ['Yağmur bulutu simgesi.', 'İlerleme penceresi açılır; Message Log\'a NOTE/WARNING satırları düşer.'], d: ['Hata (ERROR) varsa hesap durur; WARNING yalnız uyarıdır.'] },
    'tb:gsum': { b: 'Global Summary Table', t: 'Bütün elemanların özeti', m: ['Results › Global Summary Table ile aynı.'] },
    'tb:graph': { b: 'Element Graph', t: 'Seçili elemanın grafiği', m: ['Önce haritada bir eleman seç.'] },
    'tb:esum': { b: 'Element Summary Table', t: 'Seçili elemanın özet tablosu', m: ['Tepe debi, zamanı ve hacimler.'] },
    'tb:tstable': { b: 'Element Time-Series Table', t: 'Seçili elemanın zaman serisi', m: ['Her adım için yağış, kayıp, akım değerleri.'] },
    'bolge:agac': { b: 'Watershed Explorer', t: 'Projenin ağacı', m: ['Üç sekme: Components (modeller), Compute (koşular), Results (sonuçlar).', 'Bir düğüme bas: altında Component Editor açılır.'], d: ['+ / − ile klasör açılır, kapanır.'] },
    'xt:Components': { b: 'Components sekmesi', t: 'Modeller ve veriler', m: ['Basin Models, Meteorologic Models, Control Specifications, Time-Series Data.'] },
    'xt:Compute': { b: 'Compute sekmesi', t: 'Koşular', m: ['Simulation Runs altında yaratılan koşular durur.', 'Koşuya sağ tık › Compute ile de hesaplanır.'] },
    'xt:Results': { b: 'Results sekmesi', t: 'Sonuç ağacı', m: ['Hesaptan sonra her elemanın Graph, Summary Table, Time-Series Table düğümleri çıkar.'] },
    'agac:proje': { b: 'Proje düğümü', t: 'Ağacın kökü', m: ['Proje adı; altında bütün bileşen klasörleri.', 'Component Editor\'da proje açıklaması ve çıktı DSS dosyası.'] },
    'agac:k:basin': { b: 'Basin Models', t: 'Havza modelleri klasörü', m: ['Her havza modeli ayrı bir senaryo.'] },
    'agac:havza': { b: 'Havza modeli', t: 'Punxsutawney ağı', m: ['Basınca havza haritası (Basin Model) masaüstünde açılır.', 'Altında elemanlar listelenir.'] },
    'agac:subbasin': { b: 'Subbasin', t: 'Alt havza', m: ['Yağış → kayıp → etkili yağış → doğrudan akış + taban akışı.', 'Component Editor sekmeleri: Subbasin, Loss, Transform, Baseflow, Options.'] },
    'agac:reach': { b: 'Reach', t: 'Kanal', m: ['Gelen akımı öteler (Routing).', 'Sekmeler: Reach, Routing, Options.'] },
    'agac:junction': { b: 'Junction', t: 'Birleşim', m: ['Gelen akımları toplar; parametresi yoktur.', 'Options: gözlenen akım bağlanır (HW#2).'] },
    'agac:k:met': { b: 'Meteorologic Models', t: 'Meteorolojik modeller', m: ['Yağış ve diğer meteorolojik girdiler.'] },
    'agac:met': { b: 'Meteorolojik model', t: '«May 1996»', m: ['Precipitation yöntemi: Specified Hyetograph.', 'Basins sekmesi: hangi havza modeline uygulanacağı.'] },
    'agac:hy': { b: 'Specified Hyetograph', t: 'Alt havza ↔ ölçer eşlemesi', m: ['Her alt havzaya bir yağış ölçeri atanır.', 'O ölçerin saatlik yağışı alt havzanın tamamına aynen uygulanır.'] },
    'agac:k:kontrol': { b: 'Control Specifications', t: 'Zaman ayarları', m: ['Her biri bir başlangıç–bitiş ve adım.'] },
    'agac:kontrol': { b: 'Control Specifications', t: '«May 1996» zaman ayarı', m: ['28Apr1996 01:00 → 04May1996 00:00, 15 Minutes.'] },
    'agac:k:ts': { b: 'Time-Series Data', t: 'Ölçer verileri', m: ['Precipitation Gages: yağış · Discharge Gages: akım.'] },
    'agac:pg': { b: 'Precipitation Gage', t: 'Yağış ölçeri', m: ['Sekmeler: Time-Series Gage (kaynak), Time Window, Table, Graph.', 'DUJP, PNXP, MFFP: havzadaki üç istasyon.'] },
    'agac:dg': { b: 'Discharge Gage', t: 'Akım ölçeri', m: ['Gözlenen debi; modeli doğrulamak için.', 'HW#2: PNXP, Punxsutawney\'deki akım istasyonu.'] },
    'agac:kosu': { b: 'Simulation Run', t: 'Koşu', m: ['Havza + meteoroloji + kontrol üçlüsü.', 'Sağ tık › Compute ile hesaplanır.'] },
    'agac:sonuc': { b: 'Sonuç düğümü', t: 'Results ağacı', m: ['Graph, Summary Table, Time-Series Table düğümlerine basınca sonuç penceresi açılır.'] },
    'bolge:ce': { b: 'Component Editor', t: 'Seçili parçanın ayarları', m: ['Ağaçta ya da haritada neyi seçersen onun alanları burada.', 'Kırmızı yıldızlı (*) alanlar zorunlu.'], d: ['Değer girip başka alana geçince hemen işlenir.'] },
    'ce:Subbasin': { b: 'Subbasin sekmesi', t: 'Alt havzanın kimliği', m: ['Downstream: suyun aktığı eleman (bağlamanın ikinci yolu).', 'Area (MI2): alan · altında seçili yöntemler.'] },
    'ce:Loss': { b: 'Loss sekmesi', t: 'Kayıp parametreleri', m: ['Initial Loss (IN): başlangıç kaybı.', 'Constant Rate (IN/HR): sabit sızma hızı.', 'Impervious (%): geçirimsiz yüzey payı.'], d: ['Etkili yağış = yağış − kayıp.'] },
    'ce:Transform': { b: 'Transform sekmesi', t: 'Clark birim hidrografı', m: ['Time of Concentration (HR): en uzak noktadan çıkışa varış süresi.', 'Storage Coefficient (HR): havzanın depolama etkisi.'], d: ['Tc büyürse tepe gecikir; R büyürse tepe basıklaşır ve uzar.'] },
    'ce:Baseflow': { b: 'Baseflow sekmesi', t: 'Doğrusal hazne taban akışı', m: ['Layers: kaç yeraltı katmanı (ödevde 2).', 'GW Coefficient (HR): katmanın boşalma süresi; büyük = yavaş.'] },
    'ce:Options': { b: 'Options sekmesi', t: 'Gözlenen veri bağlama', m: ['Observed Flow: hesapla karşılaştırılacak akım ölçeri.', 'Bağlanınca grafikte siyah noktalı çizgi çıkar.'] },
    'ce:Reach': { b: 'Reach sekmesi', t: 'Kanalın kimliği', m: ['Downstream ve Routing Method burada.'] },
    'ce:Routing': { b: 'Routing sekmesi', t: 'Öteleme parametresi', m: ['Lag (MIN): akımın kanalda geciktiği süre.', 'Ödevde 300 dk = 5 saat.'] },
    'ce:Junction': { b: 'Junction sekmesi', t: 'Birleşimin kimliği', m: ['Yalnız ad, açıklama ve Downstream.'] },
    'ce:Time-Series Gage': { b: 'Time-Series Gage sekmesi', t: 'Verinin kaynağı', m: ['Data Source: Manual Entry (elle) ya da Single Record HEC-DSS (dosyadan).', 'DSS Pathname: verinin dosyadaki adresi; listeden seç.'] },
    'ce:Time Window': { b: 'Time Window sekmesi', t: 'Gösterilecek tarih aralığı', m: ['Table ve Graph yalnız bu aralığı gösterir.'] },
    'ce:Table': { b: 'Table sekmesi', t: 'Ölçer verisi tablosu', m: ['Saatlik değerler; yağışta inç, akımda cfs.'] },
    'ce:Graph': { b: 'Graph sekmesi', t: 'Ölçer verisi grafiği', m: ['Yağış çubuk (kırmızı), akım çizgi olarak çizilir.'] },
    'ce:Meteorologic Model': { b: 'Meteorologic Model sekmesi', t: 'Yöntem seçimi', m: ['Precipitation: Specified Hyetograph (ödev).', 'Diğer girdiler (sıcaklık, buharlaşma) --None--.'] },
    'ce:Basins': { b: 'Basins sekmesi', t: 'Hangi havzaya uygulanır', m: ['Include Subbasins = Yes: alt havzalar bu yağışı alır.'] },
    'ce:Specified Hyetograph': { b: 'Specified Hyetograph', t: 'Ölçer ataması', m: ['Her satır: alt havza → yağış ölçeri.'] },
    'ce:Control Specifications': { b: 'Control Specifications', t: 'Zaman ayarının alanları', m: ['Start/End Date ve Time; Time Interval (hesap adımı).'] },
    'ce:Simulation Run': { b: 'Simulation Run', t: 'Koşunun bileşenleri', m: ['Basin Model, Meteorologic Model, Control Specifications.'] },
    'ce:Project': { b: 'Project', t: 'Proje bilgisi', m: ['Description ve sonuçların yazıldığı DSS dosyası.'] },
    'ce:Basin Model': { b: 'Basin Model', t: 'Havza modelinin genel ayarı', m: ['Unit System: proje açılırken seçilen birim.', 'Sediment, Local Flow… ödevlerde No.'] },
    'ce:yol': { b: 'Select Pathname', t: 'DSS adresini listeden seçme', m: ['B-Part filtresi istasyon adını süzer.', 'Elle yazınca tek/çift eğik çizgi karışabiliyor; listeden seç.'] },
    'cb:loss': { b: 'Subbasin loss', t: 'Varsayılan kayıp yöntemi', m: ['Ödevde: Initial and Constant.'] },
    'cb:transform': { b: 'Subbasin transform', t: 'Varsayılan dönüşüm yöntemi', m: ['Ödevde: Clark Unit Hydrograph.'] },
    'cb:baseflow': { b: 'Subbasin baseflow', t: 'Varsayılan taban akışı yöntemi', m: ['Ödevde: Linear Reservoir.'] },
    'cb:routing': { b: 'Reach routing', t: 'Varsayılan öteleme yöntemi', m: ['Ödevde: Lag.'] },
    'cb:birim': { b: 'Default Unit System', t: 'Birim sistemi', m: ['U.S. Customary: in, mi², cfs.', 'Metric: mm, km², m³/s.'] },
    'cb:kaynak': { b: 'Data Source', t: 'Verinin nereden geldiği', m: ['Single Record HEC-DSS: observe.dss dosyasından okunur.'] },
    'cb:yagis': { b: 'Precipitation', t: 'Yağış yöntemi', m: ['Specified Hyetograph: ölçerin yağışı alt havzaya aynen.', 'Gage Weights / Inverse Distance: birden çok ölçerin ağırlıklı ortalaması.'] },
    'cb:dahil': { b: 'Include Subbasins', t: 'Alt havzalar dahil mi', m: ['Yes seçilmezse Specified Hyetograph alt havzaları göremez.'] },
    'cb:aralik': { b: 'Time Interval', t: 'Hesap adımı', m: ['Ödevde 15 Minutes.', 'Saatlik yağış 4 eşit parçaya bölünür.'] },
    'cb:tsTur': { b: 'Data Type', t: 'Ölçer türü', m: ['Precipitation Gages: yağış · Discharge Gages: akım.'] },
    'cb:goz': { b: 'Observed Flow', t: 'Gözlenen akım ölçeri', m: ['Junction-2\'ye PNXP bağlanır; sonuçta model ile gözlem yan yana.'] },
    'cb:asagi': { b: 'Downstream', t: 'Aşağı akış elemanı', m: ['Haritada Connect Downstream yapmanın tablo yolu.'] },
    'bolge:masa': { b: 'Desktop (harita masası)', t: 'Havza haritası ve sonuç pencereleri', m: ['Basin Model penceresi: elemanlar ve bağlantılar.', 'Eleman araçlarından biri seçiliyken boş yere basınca yeni eleman eklenir.'] },
    'harita:subbasin': { b: 'Subbasin (haritada)', t: 'Alt havza simgesi', m: ['Sol tık: seç, ayarları Component Editor\'da.', 'Sağ tık: Connect Downstream, View Results…'] },
    'harita:reach': { b: 'Reach (haritada)', t: 'Kalın mavi çizgi', m: ['Bir junction\'dan diğerine akım taşır.', 'Seçilince gri hâle görünür.'] },
    'harita:junction': { b: 'Junction (haritada)', t: 'Y biçimli simge', m: ['Kollar burada birleşir.', 'Junction-2: havzanın çıkışı, sonuçta en büyük debi.'] },
    'bm:Connect Downstream': { b: 'Connect Downstream', t: 'Aşağı akışa bağla', m: ['Sonra suyun gideceği elemana bas; ince çizgi çizilir.'] },
    'bm:View Results': { b: 'View Results', t: 'Elemanın sonuçları', m: ['Graph, Summary Table, Time-Series Table.'] },
    'bolge:log': { b: 'Message Log', t: 'Programın iletileri', m: ['NOTE: bilgi · WARNING (mor): uyarı · ERROR (kırmızı): hata.', 'Hesap bitince «Finished computing simulation run» satırı gelir.'], d: ['WARNING 41862 «Initial losses may have been included in baseflow»: başlangıç kaybı taban akışına sayılmış olabilir; ödevde sorun değil.'] },
    'dlg:yeniProje': { b: 'Create a New Project', t: 'Yeni proje penceresi', m: ['Name: proje adı · Location: klasör.', 'Default Unit System: bütün projenin birimi.'] },
    'dlg:yonetici': { b: 'Manager penceresi', t: 'Bileşen listesi', m: ['New...: yarat · Copy, Rename, Delete: düzenle.', 'Close ile kapanır; yaratılan bileşen ağaçta kalır.'] },
    'dlg:yeniBilesen': { b: 'Create A New …', t: 'Yaratma penceresi', m: ['Name zorunlu, Description isteğe bağlı.'] },
    'dlg:ayarlar': { b: 'Program Settings', t: 'Programın ayarları', m: ['Defaults sekmesi ödev için önemli.'] },
    'dlg:adVer': { b: 'Create A New … Element', t: 'Eleman adı', m: ['Varsayılan ad (Subbasin-1…) sonradan değiştirilebilir.'] },
    'dlg:global': { b: 'Global editör', t: 'Bütün alt havzalar tek tabloda', m: ['Hücreye değer yaz; Apply ya da Close.', 'Aynı değerler tek tek Component Editor sekmelerinde de görünür.'] },
    'dlg:yolSec': { b: 'Select Pathname From HEC-DSS File', t: 'DSS adres seçici', m: ['Part A: havza · B: istasyon · C: değişken (PRECIP-INC, FLOW) · E: aralık · F: sürüm.'] },
    'dlg:sihirbaz': { b: 'Create a Simulation Run', t: '4 adımlı sihirbaz', m: ['1 ad · 2 havza modeli · 3 meteorolojik model · 4 kontrol ayarı.'] },
    'dlg:ilerleme': { b: 'Compute Progress', t: 'Hesap ilerlemesi', m: ['Çubuk dolunca hesap biter; ayrıntı Message Log\'da.'] },
    'dlg:grafik': { b: 'Element Graph', t: 'Sonuç grafiği', m: ['Alt havzada üstte yağış (mavi) ve kayıp (kırmızı), altta akım.', 'Kesikli çizgiler giriş akımları ya da taban akışı.'] },
    'dlg:ozet': { b: 'Summary Table', t: 'Elemanın özet sonuçları', m: ['Peak Discharge: tepe debi · Volume: toplam hacim (inç).', 'Gözlenen akım bağlıysa Nash-Sutcliffe ve Kling-Gupta da yazılır.'] },
    'dlg:gozet': { b: 'Global Summary Results', t: 'Bütün elemanların özeti', m: ['Junction-2: havza çıkışının tepe debisi.'] },
    'dlg:tablo': { b: 'Time-Series Results', t: 'Adım adım sonuçlar', m: ['Program her 15 dk için satır verir; burada saatlik gösteriliyor.'] },
    'bm:Graph': { b: 'Graph', t: 'Elemanın sonuç grafiği', m: ['Alt havzada üstte yağış ve kayıp, altta akım.', 'Kanal ve birleşimde giriş akımları kesikli, çıkış düz çizgi.'] },
    'bm:Summary Table': { b: 'Summary Table', t: 'Elemanın özet sonuçları', m: ['Tepe debi, tepe zamanı ve hacimler.', 'Gözlenen akım bağlıysa Nash-Sutcliffe, Kling-Gupta ve Percent Bias da yazılır.'] },
    'oto:olcerler': { b: 'İki ölçer birden', t: 'PNXP ve MFFP', m: ['DUJP için yapılan 14 tık iki kez tekrarlanır.', 'Rehberli modda bu adım tek düğmeyle yapılır.'] },
  };

  /* her açıklama en az iki madde olsun */
  const EK = {
    'bolge:masaustu': 'Rehberli HW#1 buradan, programı açmakla başlar.',
    'mi:Components/Create Component': 'Manager penceresine uğramadan aynı sonucu verir.',
    'mi:Compute/Create Compute': 'Diğer türler (optimizasyon, belirsizlik) ileri derslerin konusu.',
    'tb:new': 'Açık proje varsa önce onu kapatır.',
    'tb:open': 'Son açılan projeler File menüsünün altında da listelenir.',
    'tb:print': 'Ödevde ekran görüntüsü yeterli; yazdırmak gerekmez.',
    'tb:zoom': 'Arrow Tool\'a dönünce normal seçime geçilir.',
    'tb:diversion': 'Ayrılan akım başka bir elemana bağlanır.',
    'tb:source': 'Ödevlerde yok.',
    'tb:sink': 'Ödevde çıkış Junction-2; sink kullanılmıyor.',
    'tb:breakpoint': 'Ödevlerde yok.',
    'tb:gsum': 'Hesap yapılmadan soluk kalır.',
    'tb:graph': 'Alt havzada yağış + akım, birleşimde giriş akımları çizilir.',
    'tb:esum': 'Önce haritada bir eleman seç.',
    'tb:tstable': 'Program her 15 dakikayı bir satır olarak listeler.',
    'xt:Components': 'Bir düğüme basınca alttaki Component Editor dolar.',
    'xt:Results': 'Aynı pencereler elemana sağ tık › View Results ile de açılır.',
    'agac:k:basin': 'Altındaki modele basınca havza haritası açılır.',
    'agac:k:met': 'Her model bir fırtınayı (ya da senaryoyu) temsil eder.',
    'agac:k:kontrol': 'Koşu yaratılırken listeden biri seçilir.',
    'agac:kontrol': 'Saatlik yağış bu adımda dörde bölünür.',
    'agac:k:ts': 'Veri HEC-DSS dosyasından okunur; elle de girilebilir.',
    'agac:sonuc': 'Results sekmesi yalnız hesaptan sonra dolar.',
    'ce:Reach': 'Yöntemin parametreleri Routing sekmesinde.',
    'ce:Junction': 'Gözlenen akım Options sekmesinde bağlanır.',
    'ce:Time Window': 'Hesabın süresini değil, yalnız görünümü etkiler.',
    'ce:Table': 'Değerler DSS dosyasından okunur; burada değiştirilmez.',
    'ce:Graph': 'Fırtınanın 29–30 Nisan\'da yoğunlaştığı bir bakışta görünür.',
    'ce:Basins': 'Projede birden çok havza modeli varsa her biri ayrı satır.',
    'ce:Specified Hyetograph': 'Ödevde: EB Mahoning → MFFP, Stump → DUJP, Mahoning Local → PNXP.',
    'ce:Control Specifications': 'Tarih biçimi ddMMMyyyy: 28Apr1996.',
    'ce:Simulation Run': 'Bileşenlerden biri değişirse koşu yeniden hesaplanmalı.',
    'ce:Project': 'Proje adı bu sekmede değiştirilmez; File › Rename kullanılır.',
    'cb:loss': 'Yeni alt havzalar bu yöntemle doğar.',
    'cb:transform': 'Yeni alt havzalar bu yöntemle doğar.',
    'cb:baseflow': 'Yeni alt havzalar bu yöntemle doğar.',
    'cb:routing': 'Yeni kanallar (reach) bu yöntemle doğar.',
    'cb:kaynak': 'Manual Entry: değerleri tabloya elle yazarsın.',
    'cb:dahil': 'Ödevde: Yes.',
    'cb:tsTur': 'Liste, seçilen türdeki ölçerleri gösterir.',
    'cb:goz': 'Özet tabloya Nash-Sutcliffe gibi uyum ölçüleri eklenir.',
    'cb:asagi': 'Seçilen eleman haritada ince çizgiyle bağlanır.',
    'bm:Connect Downstream': 'Subbasin\'e bağlanamaz; hedef junction ya da reach olmalı.',
    'bm:View Results': 'Hesap yapılmadan soluk kalır.',
    'dlg:yeniBilesen': 'Create ile ağaca eklenir, Component Editor\'da açılır.',
    'dlg:ayarlar': 'OK ile kapanır; yeni elemanlara uygulanır.',
    'dlg:adVer': 'Create ile eleman haritaya düşer.',
    'dlg:yolSec': 'Set Pathname seçili satırı ölçere bağlar.',
    'dlg:sihirbaz': 'Finish ile koşu Compute sekmesine eklenir.',
    'dlg:ilerleme': 'Uyarı olsa da hesap tamamlanır; Close ile kapat.',
    'dlg:gozet': 'Satırlar akış sırasında: yukarıdan aşağı havzaya.',
    'dlg:tablo': 'Sütunlar: yağış, kayıp, etkili yağış, doğrudan akış, taban akışı, toplam akış.',
  };
  Object.keys(EK).forEach((x) => { if (AC[x]) AC[x].m.push(EK[x]); });

  /* yardımcı: mikro adım */
  const k = (hd, ip, ek) => Object.assign({ hd, ip }, ek || {});
  const bagla = (a, b) => [k('harita:el:' + a, `${a} simgesine sağ tıkla (telefonda: dokun).`, { sag: true }), k('bm:Connect Downstream', 'Açılan menüde Connect Downstream.'), k('harita:el:' + b, `Aşağı akıştaki ${b} simgesine bas.`)];
  /* olcerOto: rehberli modda tek düğmeyle, izleme modunda tık tık oynatılır (et: ölçer adı, ip: kısa etiket) */
  const olcerOto = (ad, a) => [k('m:Components', 'Components menüsü'), k('mi:Components/Time-Series Data Manager', 'Time-Series Data Manager'), k('dlg:New...', 'New...'), k('f:dlg.ad', `Name: ${ad}`), k('dlg:Create', 'Create'), k('dlg:Close', 'Yöneticiyi kapat'), k(`cb:pg.${ad}.kaynak`, 'Data Source listesi'), k('cbo:Single Record HEC-DSS', 'Single Record HEC-DSS'), k(`f:pg.${ad}.dss`, 'DSS Filename: observe.dss'), k('ce:yol', 'Pathname düğmesi'), k(`dlg:yol:/${a}/${ad}/PRECIP-INC/01Apr1994/1Hour/OBS/`, 'PRECIP-INC satırı'), k('dlg:Set Pathname', 'Set Pathname'), k('ce:sekme:Time Window', 'Time Window sekmesi'), k(`f:pg.${ad}.bas`, 'Tarihler: 28Apr1996 01:00 → 04May1996 00:00')].map((x) => Object.assign(x, { et: ad }));
  const tablo3 = (ed, yol) => ['Stump Creek', 'EB Mahoning Creek', 'Mahoning Creek Local'].map((a) => k(`satir:${ed}.${a}`, `${a} satırına bas: değerler yazılır.`));

  const HW1 = [
    { baslik: "HEC-HMS'i aç.", mikro: [k('masaustu:hms', 'Masaüstündeki HEC-HMS 4.14 simgesine bas.')],
      ne: ['Programı başlatıyorum; boş, gri pencere gelir.', 'Pencerede 4 parça: Watershed Explorer, Component Editor, harita masası, Message Log.'], nerede: ['Taşınabilir sürüm: klasördeki HEC-HMS.exe; kurulum yok.'], neden: ['Öğretici 4.14 beta 2 ya da yenisini istiyor; 4.14 uygun.'] },
    { baslik: 'File › New ile Punxsutawney projesini yarat.', tablo: [['Name', 'Punxsutawney'], ['Default Unit System', 'U.S. Customary']], img: 'hw1-file-new',
      mikro: [k('m:File', 'File menüsünü aç.'), k('mi:File/New...', 'New... seç.'), k('f:dlg.ad', 'Name alanına bas: Punxsutawney yazılır.'), k('cb:dlg.birim', 'Default Unit System listesini aç.'), k('cbo:U.S. Customary', 'U.S. Customary seç.'), k('dlg:Create', 'Create.')],
      ne: ['Proje = bütün modellerin durduğu klasör (.hms dosyası).', 'Birim sistemi bütün girdilerin birimini belirler.'], nerede: ['File menüsü › New...', 'Create a New Project: Name, Description, Location, Default Unit System.'], neden: ['Öğreticinin değerleri inç, mi², cfs: U.S. Customary şart.', 'Birimi sonradan değiştirmek girilen değerleri bozar; baştan doğru seç.'] },
    { baslik: 'Basin Model Manager ile Punxsutawney havza modelini yarat.', tablo: [['Name', 'Punxsutawney'], ['Description', 'Headwaters to the City of Punxsutawney - Existing Conditions.']], img: 'hw1-components-menu',
      mikro: [k('m:Components', 'Components menüsünü aç.'), k('mi:Components/Basin Model Manager', 'Basin Model Manager.'), k('dlg:New...', 'New...'), k('f:dlg.ad', 'Name alanına bas.'), k('f:dlg.aciklama', 'Description alanına bas.'), k('dlg:Create', 'Create.'), k('dlg:Close', 'Yöneticiyi Close ile kapat.')],
      ne: ['Havza modeli = alt havza, kanal ve birleşimlerden oluşan ağ.', 'Şimdilik boş; elemanlar 6. adımda gelecek.'], nerede: ['Components › Basin Model Manager › New...', 'Yaratılan model Watershed Explorer\'da Basin Models altına düşer.'], neden: ['Ad ve açıklama yalnız tanıtım; hesaba girmez.'] },
    { baslik: 'Tools › Program Settings › Defaults: dört varsayılan yöntemi seç.', tablo: [['Subbasin loss', 'Initial and Constant'], ['Subbasin transform', 'Clark Unit Hydrograph'], ['Subbasin baseflow', 'Linear Reservoir'], ['Reach routing', 'Lag']], img: ['hw1-tools-menu', 'hw1-defaults'],
      mikro: [k('m:Tools', 'Tools menüsünü aç.'), k('mi:Tools/Program Settings...', 'Program Settings...'), k('dlg:sekme:Defaults', 'Defaults sekmesi.'), k('cb:vars.loss', 'Subbasin loss listesini aç.'), k('cbo:Initial and Constant', 'Initial and Constant.'), k('cb:vars.transform', 'Subbasin transform listesini aç.'), k('cbo:Clark Unit Hydrograph', 'Clark Unit Hydrograph.'), k('cb:vars.baseflow', 'Subbasin baseflow listesini aç.'), k('cbo:Linear Reservoir', 'Linear Reservoir.'), k('cb:vars.routing', 'Reach routing listesini aç.'), k('cbo:Lag', 'Lag.'), k('dlg:OK', 'OK.')],
      ne: ['Yeni eleman eklenince hangi yöntemle doğacağını seçiyorum.', 'Böylece her alt havzada yöntemi tek tek değiştirmem gerekmez.'], nerede: ['Tools › Program Settings... › Defaults sekmesi.'], neden: ['Loss (kayıp): yağışın toprağa giden kısmı — en basit yöntem Initial and Constant.', 'Transform (dönüşüm): etkili yağışı akıma çevirir — Clark birim hidrografı.', 'Baseflow (taban akışı): yeraltından gelen yavaş akım — Linear Reservoir.', 'Routing (öteleme): akımın kanalda ilerleyişi — Lag, yalnız geciktirir.'] },
    { baslik: "Watershed Explorer'da havza modelini aç.", img: 'hw1-renamed',
      mikro: [k('agac:sec:h:Punxsutawney', 'Basin Models altındaki Punxsutawney\'e bas: harita açılır.')],
      ne: ['Boş havza haritası (Basin Model penceresi) masaüstünde açılır.'], nerede: ['Sol üst: Watershed Explorer › Components › Basin Models.'], neden: ['Harita açık değilse eleman araçları çalışmaz.'] },
    { baslik: 'Subbasin aracıyla haritaya 3 alt havza koy.', tablo: [['Adlar', 'Subbasin-1, Subbasin-2, Subbasin-3 (varsayılan)']], img: 'hw1-create-subbasin',
      mikro: [k('tb:subbasin', 'Araç çubuğunda Subbasin Creation Tool.'), k('harita:hayalet:sb1', 'Haritada işaretli yere bas (üst orta).'), k('dlg:Create', 'Ad penceresinde Create.'), k('harita:hayalet:sb2', 'İkinci yer (sağ).'), k('dlg:Create', 'Create.'), k('harita:hayalet:sb3', 'Üçüncü yer (sol).'), k('dlg:Create', 'Create.')],
      ne: ['Alt havza = yağışın akıma dönüştüğü alan.', 'Her tıklamada ad penceresi gelir; varsayılan adı onaylıyorum.'], nerede: ['Components araç çubuğu: Subbasin Creation Tool (manzara + ok simgesi).'], neden: ['Punxsutawney\'e kadar havza üç kola ayrılmış: Stump Creek, EB Mahoning Creek ve yerel alan.'] },
    { baslik: 'Reach aracıyla 1 kanal, Junction aracıyla 2 birleşim ekle.', tablo: [['Reach', 'Reach-1'], ['Junction', 'Junction-1 (orta), Junction-2 (sol alt)']], img: ['hw1-elements', 'hw1-fig1'],
      mikro: [k('tb:reach', 'Reach Creation Tool.'), k('harita:hayalet:r1', 'Haritada işaretli yere bas.'), k('dlg:Create', 'Create.'), k('tb:junction', 'Junction Creation Tool.'), k('harita:hayalet:j1', 'Ortadaki işaretli yere bas.'), k('dlg:Create', 'Create.'), k('harita:hayalet:j2', 'Sol alttaki işaretli yere bas.'), k('dlg:Create', 'Create.')],
      ne: ['Reach (kanal) = akımı aşağıya taşıyan dere parçası.', 'Junction (birleşim) = kolların buluştuğu nokta.'], nerede: ['Reach ve Junction Creation Tool; yerleşim öğreticinin Şekil 1\'i gibi.'], neden: ['Junction-1\'de iki kol birleşir; Reach-1 bu akımı Junction-2\'ye taşır.'] },
    { baslik: 'Connect Downstream ile elemanları bağla; akış sol aşağı.', tablo: [['Subbasin-1', '→ Junction-1'], ['Subbasin-2', '→ Junction-1'], ['Junction-1', '→ Reach-1'], ['Reach-1', '→ Junction-2'], ['Subbasin-3', '→ Junction-2']], img: ['hw1-connect-menu', 'hw1-connected', 'hw1-fig2'],
      mikro: [k('tb:arrow', 'Önce Arrow Tool.')].concat(bagla('Subbasin-1', 'Junction-1'), bagla('Subbasin-2', 'Junction-1'), bagla('Junction-1', 'Reach-1'), bagla('Reach-1', 'Junction-2'), bagla('Subbasin-3', 'Junction-2')),
      ne: ['Her elemanın suyunu hangi elemana akıttığını söylüyorum.', 'Çizgi = bağlantı; Reach-1 iki birleşimin arasına oturur.'], nerede: ['Haritada elemana sağ tık › Connect Downstream › hedefe tık.'], neden: ['Ağ yukarıdan aşağı hesaplanır; bağlantısız eleman çıkışa katılmaz.'],
      soru: ['Elemanları bağlamanın başka yolu?', 'Component Editor\'da elemanın ilk sekmesindeki Downstream listesinden aşağı akış elemanını seçmek.'] },
    { baslik: 'Alt havzaları yeniden adlandır; sonra Save.', tablo: [['Subbasin-1', 'Stump Creek'], ['Subbasin-2', 'EB Mahoning Creek'], ['Subbasin-3', 'Mahoning Creek Local']], img: 'hw1-fig3',
      mikro: [k('agac:sec:e:Subbasin-1', "Watershed Explorer'da Subbasin-1'e bas: adı Stump Creek olur.", { yap: 'agac:adlandir:Subbasin-1=Stump Creek' }), k('agac:sec:e:Subbasin-2', 'Subbasin-2 → EB Mahoning Creek.', { yap: 'agac:adlandir:Subbasin-2=EB Mahoning Creek' }), k('agac:sec:e:Subbasin-3', 'Subbasin-3 → Mahoning Creek Local.', { yap: 'agac:adlandir:Subbasin-3=Mahoning Creek Local' }), k('tb:save', 'Disket simgesi (Save).')],
      ne: ['Elemanlara gerçek dere adlarını veriyorum.', 'Bağlantılar yeni adla korunur.'], nerede: ['Watershed Explorer\'da elemana bas, bir kez daha bas: ad alanı açılır; yeni adı yaz, Enter.'], neden: ['Sonuç tablolarında hangi derenin hangisi olduğu okunsun.'] },
    { baslik: 'Parameters › Subbasin Area: alanları gir.', tablo: [['EB Mahoning Creek', '41 mi²'], ['Stump Creek', '29 mi²'], ['Mahoning Creek Local', '88 mi²']], img: ['hw1-area-menu', 'hw1-area'],
      mikro: [k('m:Parameters', 'Parameters menüsünü aç.'), k('mi:Parameters/Subbasin Area', 'Subbasin Area.')].concat(tablo3('alan'), [k('dlg:Close', 'Close.')]),
      ne: ['Her alt havzanın drenaj alanını giriyorum.', 'Alan, yağış derinliğini debiye çevirir.'], nerede: ['Parameters › Subbasin Area: bütün alt havzalar tek tabloda (global editör).'], neden: ['1 mi² ≈ 2,59 km²; toplam 158 mi² ≈ 409 km².', 'Alan büyüdükçe aynı yağış daha büyük debi üretir.'] },
    { baslik: 'Parameters › Baseflow › Linear Reservoir: taban akışını gir.', tablo: [['Number of Layers', '2'], ['Initial Type', 'Discharge Per Area'], ['GW 1: Initial / Fraction / Coef. / Res.', '1 / 0.5 / 70 / 1'], ['GW 2: Initial / Fraction / Coef. / Res.', '1 / 0.5 / 100 / 1']], img: ['hw1-baseflow-menu', 'hw1-baseflow'],
      mikro: [k('m:Parameters', 'Parameters menüsünü aç.'), k('mi:Parameters/Baseflow', 'Baseflow.'), k('mi:Parameters/Baseflow/Linear Reservoir', 'Linear Reservoir.')].concat(tablo3('taban'), [k('dlg:Close', 'Close.')]),
      ne: ['Toprağa sızan suyu iki yeraltı haznesine bölüyorum.', 'Her hazne suyu yavaşça dereye bırakır.'], nerede: ['Parameters › Baseflow › Linear Reservoir (global editör).'], neden: ['Initial 1 cfs/mi² (iki katmanda da): fırtınadan önce de dere akıyor; başlangıç akımı alan × 2 cfs (Stump Creek 58 cfs).', 'Fraction 0.5 + 0.5: sızan suyun yarısı bir katmana, yarısı diğerine.', 'Coefficient 70 sa ve 100 sa: büyük katsayı = daha yavaş boşalma.'] },
    { baslik: 'Parameters › Loss › Initial and Constant: kayıpları gir.', tablo: [['Initial Loss', '1 in'], ['Constant Rate', '0.1 in/hr'], ['Impervious', '0 %']], img: ['hw1-loss-menu', 'hw1-loss'],
      mikro: [k('m:Parameters', 'Parameters menüsünü aç.'), k('mi:Parameters/Loss', 'Loss.'), k('mi:Parameters/Loss/Initial and Constant', 'Initial and Constant.')].concat(tablo3('kayip'), [k('dlg:Close', 'Close.')]),
      ne: ['Yağışın ne kadarının akışa geçmeyeceğini söylüyorum.'], nerede: ['Parameters › Loss › Initial and Constant.'], neden: ['Initial Loss 1 in: yağışın ilk 1 inçi toprakta, bitkide, çukurlarda kalır.', 'Constant Rate 0.1 in/hr: sonra toprak saatte 0,1 in emer; fazlası akışa geçer.', 'Impervious %0: beton/asfalt payı yok; kırsal havza.'] },
    { baslik: 'Parameters › Transform › Clark: Tc ve R değerlerini gir.', tablo: [['EB Mahoning Creek', 'Tc 7 · R 11 hr'], ['Stump Creek', 'Tc 9 · R 12 hr'], ['Mahoning Creek Local', 'Tc 10 · R 13 hr']], img: ['hw1-transform-menu', 'hw1-clark', 'hw1-loss-tab'],
      mikro: [k('m:Parameters', 'Parameters menüsünü aç.'), k('mi:Parameters/Transform', 'Transform.'), k('mi:Parameters/Transform/Clark Unit Hydrograph', 'Clark Unit Hydrograph.')].concat(tablo3('clark'), [k('dlg:Close', 'Close.')]),
      ne: ['Etkili yağışın çıkışa nasıl ulaşacağını tarif ediyorum.'], nerede: ['Parameters › Transform › Clark Unit Hydrograph.'], neden: ['Tc (Time of Concentration): en uzak damlanın çıkışa varma süresi → öteleme.', 'R (Storage Coefficient): havzanın suyu tutup yavaş bırakması → tepe basıklaşır.', 'En büyük alt havza (88 mi²) en büyük Tc ve R\'yi alır.'],
      soru: ['Yöntem parametrelerini Parameters menüsü dışında nereden girerim?', 'Haritada ya da ağaçta elemanı seç; Component Editor\'daki Loss, Transform, Baseflow sekmelerinden tek tek.'] },
    { baslik: 'Reach-1 › Routing: Lag 300 dakika.', tablo: [['Lag', '300 min']], img: 'hw1-reach-routing',
      mikro: [k('harita:el:Reach-1', 'Haritada Reach-1 çizgisine bas.'), k('ce:sekme:Routing', 'Component Editor\'da Routing sekmesi.'), k('f:el.Reach-1.lag', 'Lag (MIN) alanına bas: 300 yazılır.')],
      ne: ['Kanalda akımın ne kadar geciktiğini giriyorum.'], nerede: ['Haritada Reach-1 › Component Editor › Routing sekmesi.'], neden: ['Lag 300 dk = 5 saat: Junction-1\'deki akım Junction-2\'ye 5 saat sonra varır.', 'Lag şekli değiştirmez; yalnız geciktirir.'] },
    { baslik: 'Save; ekran görüntülerini tek PDF yap.', mikro: [k('tb:save', 'Disket simgesi (Save).')],
      ne: ['Projeyi diske yazıyorum (Save).', 'Her adımın ekran görüntüsünü sırayla tek PDF\'e koyuyorum.'], nerede: ['File › Save ya da disket simgesi.', 'Ekran görüntüsü: Win+Shift+S → Word\'e yapıştır → PDF olarak dışa aktar.'], neden: ['Hoca her adımı kendi bilgisayarında yaptığını görmek istiyor.'] },
  ];

  const HW2 = [
    { bolum: 1, baslik: "Time-Series Data Manager'da DUJP yağış ölçerini yarat.", tablo: [['Data Type', 'Precipitation Gages'], ['Name', 'DUJP']], img: 'hw2-ts-create',
      mikro: [k('m:Components', 'Components menüsünü aç.'), k('mi:Components/Time-Series Data Manager', 'Time-Series Data Manager.'), k('dlg:New...', 'New...'), k('f:dlg.ad', 'Name alanına bas: DUJP.'), k('dlg:Create', 'Create.'), k('dlg:Close', 'Yöneticiyi kapat.')],
      ne: ['Yağış ölçeri (gage) = bir istasyonun saatlik yağış verisi.'], nerede: ['Components › Time-Series Data Manager › New...'], neden: ['DUJP, PNXP, MFFP: havzayı temsil eden üç istasyon.'] },
    { bolum: 1, baslik: "DUJP'nin verisini observe.dss dosyasından bağla.", tablo: [['Data Source', 'Single Record HEC-DSS'], ['DSS Filename', 'data/observe.dss'], ['DSS Pathname', '/ALLEGHENY/DUJP/PRECIP-INC/…/1Hour/OBS/']], img: 'hw2-pathname',
      mikro: [k('cb:pg.DUJP.kaynak', 'Data Source listesini aç.'), k('cbo:Single Record HEC-DSS', 'Single Record HEC-DSS.'), k('f:pg.DUJP.dss', 'DSS Filename alanına bas.'), k('ce:yol', 'DSS Pathname yanındaki düğme.'), k('dlg:yol:/ALLEGHENY/DUJP/PRECIP-INC/01Apr1994/1Hour/OBS/', 'PRECIP-INC satırını seç.'), k('dlg:Set Pathname', 'Set Pathname.')],
      ne: ['Veriyi elle yazmıyorum; DSS dosyasından okutuyorum.'], nerede: ['Ağaçta Time-Series Data › Precipitation Gages › DUJP › Component Editor.'], neden: ['DSS: HEC\'in zaman serisi dosyası; pathname /A/B/C/D/E/F/ biçiminde adres.', 'Pathname\'i listeden seç: elle yazınca «Units are not valid» hatası çıkabiliyor.'] },
    { bolum: 1, baslik: "Time Window'u ayarla; tabloya ve grafiğe bak.", tablo: [['Start', '28Apr1996 01:00'], ['End', '04May1996 00:00']], img: 'hw2-dujp-graph',
      mikro: [k('ce:sekme:Time Window', 'Time Window sekmesi.'), k('f:pg.DUJP.bas', 'Start Date alanına bas: dört alan dolar.'), k('ce:sekme:Graph', 'Graph sekmesi.')],
      ne: ['Gösterilecek tarih aralığını seçiyorum.'], nerede: ['DUJP › Time Window; sonra Table ve Graph.'], neden: ['Fırtına 29–30 Nisan\'da yoğun; en büyük saatlik yağış ≈ 0,42 in.'] },
    { bolum: 1, baslik: 'Aynısını PNXP ve MFFP için yap.', tablo: [['PNXP', 'PRECIP-INC satırı (FLOW değil)'], ['MFFP', 'SUSQUEHANA verisi']],
      mikro: [k('oto:olcerler', 'Panelde «İki ölçeri de ekle» düğmesine bas; benzetim aynı adımları yapar.', { oto: olcerOto('PNXP', 'ALLEGHENY').concat(olcerOto('MFFP', 'SUSQUEHANA')) })],
      ne: ['Üç ölçer de aynı yolla eklenir.'], nerede: ['Time-Series Data Manager › New..., sonra her ölçerin Component Editor\'ı.'], neden: ['PNXP\'de iki satır çıkar: FLOW (akım) ve PRECIP-INC (yağış); burada yağış.', 'FLOW satırı 5. bölümde gözlenen akım için.'] },
    { bolum: 1, baslik: 'Meteorologic Model Manager ile May 1996 modelini yarat.', tablo: [['Name', 'May 1996'], ['Description', 'Precipitation for the Storm of May 1st, 1996']], img: 'hw2-met-create',
      mikro: [k('m:Components', 'Components menüsünü aç.'), k('mi:Components/Meteorologic Model Manager', 'Meteorologic Model Manager.'), k('dlg:New...', 'New...'), k('f:dlg.ad', 'Name alanına bas.'), k('f:dlg.aciklama', 'Description alanına bas.'), k('dlg:Create', 'Create.'), k('dlg:Close', 'Close.')],
      ne: ['Yağışın modele nasıl verileceğini tutan bileşeni yaratıyorum.'], nerede: ['Components › Meteorologic Model Manager › New...'], neden: ['Aynı havza farklı fırtınalarla denenebilsin diye meteoroloji ayrı tutulur.'] },
    { bolum: 1, baslik: 'Precipitation = Specified Hyetograph; Include Subbasins = Yes.', tablo: [['Precipitation', 'Specified Hyetograph'], ['Basins › Include Subbasins', 'Yes']],
      mikro: [k('cb:met.yagis', 'Precipitation listesini aç.'), k('cbo:Specified Hyetograph', 'Specified Hyetograph.'), k('ce:sekme:Basins', 'Basins sekmesi.'), k('cb:met.dahil', 'Include Subbasins listesini aç.'), k('cbo:Yes', 'Yes.')],
      ne: ['Yağış yöntemini seçip havza modelini bağlıyorum.'], nerede: ['Ağaçta May 1996 (Meteorologic Models) › Component Editor.'], neden: ['Specified Hyetograph: bir ölçerin yağışı alt havzaya aynen verilir.', 'Include Subbasins = Yes olmazsa model alt havzaları görmez.'] },
    { bolum: 1, baslik: 'Specified Hyetograph: her alt havzaya ölçerini ata.', tablo: [['EB Mahoning Creek', 'MFFP'], ['Stump Creek', 'DUJP'], ['Mahoning Creek Local', 'PNXP']], img: 'hw2-met-gages',
      mikro: [k('agac:sec:hy', 'Ağaçta Specified Hyetograph düğümüne bas.')].concat(['Stump Creek', 'EB Mahoning Creek', 'Mahoning Creek Local'].map((a) => k('satir:atama.' + a, `${a} satırına bas: ölçeri atanır.`))),
      ne: ['Her alt havzanın yağışını hangi istasyondan alacağını eşliyorum.'], nerede: ['May 1996 › Specified Hyetograph düğümü.'], neden: ['Her alt havza kendisini en iyi temsil eden istasyonu alır.'] },
    { bolum: 2, baslik: 'Control Specifications Manager ile May 1996 ayarını yarat.', tablo: [['Name', 'May 1996'], ['Description', 'Storm of May 1st 1996']],
      mikro: [k('m:Components', 'Components menüsünü aç.'), k('mi:Components/Control Specifications Manager', 'Control Specifications Manager.'), k('dlg:New...', 'New...'), k('f:dlg.ad', 'Name alanına bas.'), k('f:dlg.aciklama', 'Description alanına bas.'), k('dlg:Create', 'Create.'), k('dlg:Close', 'Close.')],
      ne: ['Hesabın zaman ayarını tutan bileşeni yaratıyorum.'], nerede: ['Components › Control Specifications Manager › New...'], neden: ['Aynı model farklı dönemler için ayrı ayarlarla koşturulabilir.'] },
    { bolum: 2, baslik: 'Başlangıç, bitiş ve 15 dakikalık adımı gir.', tablo: [['Start Date / Time', '28Apr1996 · 01:00'], ['End Date / Time', '04May1996 · 00:00'], ['Time Interval', '15 Minutes']], img: 'hw2-control',
      mikro: [k('f:kontrol.bas', 'Start Date alanına bas.'), k('f:kontrol.basSaat', 'Start Time.'), k('f:kontrol.bit', 'End Date.'), k('f:kontrol.bitSaat', 'End Time.'), k('cb:kontrol.aralik', 'Time Interval listesini aç.'), k('cbo:15 Minutes', '15 Minutes.')],
      ne: ['Hesabın ne zaman başlayıp biteceğini ve adımını giriyorum.'], nerede: ['Ağaçta Control Specifications › May 1996.'], neden: ['Hesap 15 dk adımla yürür; saatlik yağış dört eşit parçaya bölünür (1 in/sa → her 15 dk 0,25 in).', 'Adım, Tc ve R\'den çok küçük olmalı; 15 dk yeterince ince.'],
      soru: ['Yağış saatlik ama adım 15 dk: ne olur?', 'HEC-HMS her saatin toplamını dört eşit parçaya böler.'] },
    { bolum: 3, baslik: 'Compute › Create Compute › Simulation Run: sihirbazı bitir.', tablo: [['Name', 'May 1996'], ['Basin Model', 'Punxsutawney'], ['Meteorologic Model', 'May 1996'], ['Control Specifications', 'May 1996']], img: ['hw2-compute-menu', 'hw2-run-wizard'],
      mikro: [k('m:Compute', 'Compute menüsünü aç.'), k('mi:Compute/Create Compute', 'Create Compute.'), k('mi:Compute/Create Compute/Simulation Run...', 'Simulation Run...'), k('f:dlg.ad', 'Name alanına bas: May 1996.'), k('dlg:Next >', 'Next >'), k('dlg:secim:Punxsutawney', 'Punxsutawney havza modelini seç.'), k('dlg:Next >', 'Next >'), k('dlg:secim:May 1996', 'May 1996 meteorolojik modelini seç.'), k('dlg:Next >', 'Next >'), k('dlg:secim:May 1996', 'May 1996 kontrol ayarını seç.'), k('dlg:Finish', 'Finish.')],
      ne: ['Havza + meteoroloji + zaman ayarını tek koşuda birleştiriyorum.'], nerede: ['Compute › Create Compute › Simulation Run...; dört adımlı sihirbaz.'], neden: ['Bir koşu bu üçlü olmadan hesaplanamaz.'] },
    { bolum: 3, baslik: 'Run: May 1996 seç ve Compute\'a bas.', img: ['hw2-run-toolbar', 'hw2-run-log'],
      mikro: [k('tb:secKosu', 'Araç çubuğundaki koşu listesini aç.'), k('cbo:Run: May 1996', 'Run: May 1996.'), k('tb:compute', 'Yanındaki Compute (yağmur bulutu).'), k('dlg:Close', 'İlerleme penceresini kapat.')],
      ne: ['Modeli çalıştırıyorum.'], nerede: ['Compute araç çubuğu; ilerleme penceresi; Message Log.'], neden: ['Mor WARNING satırları yalnız uyarı; hata değil.', 'Koşu hatasız biterse «Finished computing simulation run» yazar.'],
      soru: ['Koşuyu başka nasıl çalıştırırım?', 'Compute menüsü › Compute Run [May 1996] ya da Compute sekmesinde koşuya sağ tık › Compute.'] },
    { bolum: 4, baslik: 'Results › Global Summary Table: bütün elemanların özeti.', tablo: [['Mahoning Creek Local', 'tepe 1786,0 cfs'], ['Stump Creek', 'tepe 609,7 cfs · 30 Nis 15:45'], ['Junction-2 (çıkış)', 'tepe 3082,9 cfs · 30 Nis 18:45']], img: 'hw2-global-summary',
      mikro: [k('m:Results', 'Results menüsünü aç.'), k('mi:Results/Global Summary Table', 'Global Summary Table.'), k('dlg:Close', 'Close.')],
      ne: ['Her elemanın tepe debisini, zamanını ve hacmini tek tabloda görüyorum.'], nerede: ['Results › Global Summary Table ya da araç çubuğundaki tablo simgesi.'], neden: ['Akış aşağı gittikçe alan ve tepe debi büyür; çıkış Junction-2.'] },
    { bolum: 4, baslik: "Stump Creek'in grafiğine bak.", tablo: [['Tepe', '609,7 cfs · 30 Nis 1996 15:45'], ['Hacim', '1,53 in']], img: ['hw2-stump-graph', 'hw2-stump-summary'],
      mikro: [k('harita:el:Stump Creek', 'Haritada Stump Creek\'e sağ tıkla (telefonda: dokun).', { sag: true }), k('bm:View Results', 'View Results [May 1996].'), k('bm:Graph', 'Graph.'), k('dlg:Close', 'Close.')],
      ne: ['Üstte yağış (mavi) ve kayıp (kırmızı); altta toplam akım ve taban akışı.'], nerede: ['Elemana sağ tık › View Results › Graph.'], neden: ['Mavi ile kırmızı arasındaki fark etkili yağış; o kadarı akışa geçer.', 'Kesikli kırmızı taban akışı yavaşça yükselir.'] },
    { bolum: 4, baslik: 'Reach-1 grafiği: giriş ve çıkış.', tablo: [['Reach-1', 'tepe 1501,1 cfs']], img: 'hw2-reach-graph',
      mikro: [k('harita:el:Reach-1', 'Haritada Reach-1\'e sağ tıkla.', { sag: true }), k('bm:View Results', 'View Results [May 1996].'), k('bm:Graph', 'Graph.'), k('dlg:Close', 'Close.')],
      ne: ['Kanalın girişini (kesikli) ve çıkışını (düz) karşılaştırıyorum.'], nerede: ['Reach-1\'e sağ tık › View Results › Graph.'], neden: ['Çıkış, girişin 5 saat gecikmiş kopyası (Lag 300 dk); tepe aynı yükseklikte.'] },
    { bolum: 5, baslik: 'PNXP akım ölçerini (Discharge Gages) yarat.', tablo: [['Data Type', 'Discharge Gages'], ['Name', 'PNXP']],
      mikro: [k('m:Components', 'Components menüsünü aç.'), k('mi:Components/Time-Series Data Manager', 'Time-Series Data Manager.'), k('cb:dlg.tsTur', 'Data Type listesini aç.'), k('cbo:Discharge Gages', 'Discharge Gages.'), k('dlg:New...', 'New...'), k('f:dlg.ad', 'Name alanına bas: PNXP.'), k('dlg:Create', 'Create.'), k('dlg:Close', 'Close.')],
      ne: ['Havza çıkışındaki gözlenmiş debiyi modele tanıtıyorum.'], nerede: ['Time-Series Data Manager › Data Type: Discharge Gages.'], neden: ['Modelin doğruluğu gözlemle karşılaştırılarak ölçülür.'] },
    { bolum: 5, baslik: 'PNXP akım verisini DSS\'ten bağla (FLOW).', tablo: [['Data Source', 'Single Record HEC-DSS'], ['DSS Pathname', '/ALLEGHENY/PNXP/FLOW/…/1Hour/OBS/']], img: 'hw2-junction-options',
      mikro: [k('cb:dg.PNXP.kaynak', 'Data Source listesini aç.'), k('cbo:Single Record HEC-DSS', 'Single Record HEC-DSS.'), k('f:dg.PNXP.dss', 'DSS Filename alanına bas.'), k('ce:yol', 'Pathname düğmesi.'), k('dlg:yol:/ALLEGHENY/PNXP/FLOW/01Apr1994/1Hour/OBS/', 'FLOW satırını seç.'), k('dlg:Set Pathname', 'Set Pathname.'), k('harita:el:Junction-2', 'Haritada Junction-2\'ye bas.'), k('ce:sekme:Options', 'Options sekmesi.'), k('cb:el.Junction-2.goz', 'Observed Flow listesini aç.'), k('cbo:PNXP', 'PNXP.')],
      ne: ['Akım verisini bağlayıp havza çıkışına (Junction-2) gözlem olarak koyuyorum.'], nerede: ['PNXP (Discharge Gages) › Time-Series Gage; Junction-2 › Options.'], neden: ['Ölçer Punxsutawney\'de, yani havzanın çıkışında: Junction-2 ile aynı nokta.'] },
    { bolum: 5, baslik: 'Koşuyu yeniden çalıştır; Junction-2 grafiği ve özeti.', tablo: [['Model', 'tepe 3082,9 cfs · 18:45 · 1,62 in'], ['Gözlem', 'tepe 2942,0 cfs · 17:00 · 1,60 in'], ['Nash-Sutcliffe', '0,952'], ['Kling-Gupta', '0,947']], img: ['hw2-observed-graph', 'hw2-observed-summary'],
      mikro: [k('tb:compute', 'Compute (yağmur bulutu).'), k('dlg:Close', 'İlerleme penceresini kapat.'), k('harita:el:Junction-2', 'Junction-2\'ye sağ tıkla.', { sag: true }), k('bm:View Results', 'View Results [May 1996].'), k('bm:Graph', 'Graph.'), k('dlg:Close', 'Close.'), k('harita:el:Junction-2', 'Yine sağ tık.', { sag: true }), k('bm:View Results', 'View Results [May 1996].'), k('bm:Summary Table', 'Summary Table.')],
      ne: ['Hesaplanan akımla gözlenen akımı aynı grafikte karşılaştırıyorum.'], nerede: ['Junction-2 › View Results › Graph ve Summary Table.'], neden: ['Siyah noktalı çizgi gözlenen akım.', 'Nash-Sutcliffe 0,952 (1 = kusursuz): model gözlemi çok iyi yakalıyor.', 'Model tepeyi ≈ %5 büyük ve ≈ 1 sa 45 dk geç veriyor.'] },
  ];

  const ODEV = [
    { id: 'hw1', ad: 'HW#1', konu: 'Creating a New Basin Model', teslim: '5 Kasım 2026, 14:30', adimlar: HW1,
      istenen: ['Öğreticiyi kendi bilgisayarında baştan sona yap.', 'Her adımın ekran görüntüsünü al.', 'Hepsini tek PDF yap; Ninova › Ödevler › HW#1\'e yükle (yalnız .pdf).'],
      bag: [['Creating a New Basin Model', 'https://www.hec.usace.army.mil/confluence/hmsdocs/hmsguides/basic-model-setup/creating-a-simple-model/creating-a-new-basin-model']] },
    { id: 'hw2', ad: 'HW#2', konu: 'Meteoroloji, kontrol, koşu, sonuç, gözlenen akım', teslim: '12 Kasım 2026, 14:30', adimlar: HW2,
      istenen: ['Beş öğreticiyi kendi bilgisayarında yap (HW#1 projesinden devam).', 'Her adımın ekran görüntüsünü al.', 'Hepsini tek PDF yap; Ninova › Ödevler › HW#2\'ye yükle (yalnız .pdf).'],
      bolumler: ['Creating a New Meteorologic Model', 'Creating a New Control Specifications', 'Creating and Computing a Simulation Run', 'Viewing Model Results', 'Viewing Observed Flow'],
      bag: [['Creating a New Meteorologic Model', 'creating-a-new-meteorologic-model'], ['Creating a New Control Specifications', 'creating-a-new-control-specifications'], ['Creating and Computing a Simulation Run', 'creating-and-computing-a-simulation-run'], ['Viewing Model Results', 'viewing-model-results'], ['Viewing Observed Flow', 'viewing-observed-flow']].map(([a, b]) => [a, 'https://www.hec.usace.army.mil/confluence/hmsdocs/hmsguides/basic-model-setup/creating-a-simple-model/' + b]),
      tuzak: ['Program dili ve bölge ayarı İngilizce olsun; Türkçe ayarda DSS ve birim hataları çıkabiliyor.', 'DSS pathname\'i elle yazma; Select Pathname listesinden seç.', 'Compute sonrası WARNING satırları sorun değil; ERROR olursa dur.'] },
  ];

  const IMG = {
    'hw1-file-new': 'File menüsü: New...', 'hw1-components-menu': 'Components menüsü', 'hw1-tools-menu': 'Tools menüsü', 'hw1-defaults': 'Program Settings › Defaults',
    'hw1-create-subbasin': 'Create A New Subbasin Element', 'hw1-elements': 'Elemanlar haritada', 'hw1-connect-menu': 'Sağ tık menüsü: Connect Downstream', 'hw1-connected': 'Bağlı ağ',
    'hw1-renamed': 'Yeni adlarla havza', 'hw1-baseflow': 'Linear Reservoir global editörü', 'hw1-reach-routing': 'Reach-1 › Routing: Lag 300', 'hw1-fig1': 'Öğretici Şekil 1: elemanlar',
    'hw1-fig2': 'Öğretici Şekil 2: bağlantılar', 'hw1-fig3': 'Öğretici Şekil 3: yeni adlar', 'hw1-area': 'Subbasin Area global editörü', 'hw1-loss': 'Initial and Constant global editörü',
    'hw1-clark': 'Clark Unit Hydrograph global editörü', 'hw1-area-menu': 'Parameters › Subbasin Area', 'hw1-baseflow-menu': 'Parameters › Baseflow › Linear Reservoir', 'hw1-loss-menu': 'Parameters › Loss › Initial and Constant', 'hw1-transform-menu': 'Parameters › Transform › Clark', 'hw1-loss-tab': 'Diğer yol: Component Editor › Loss sekmesi', 'hw2-ts-create': 'Create A New Time-Series Data', 'hw2-pathname': 'Select Pathname: DUJP PRECIP-INC', 'hw2-dujp-graph': 'DUJP saatlik yağış grafiği',
    'hw2-met-create': 'Create A New Meteorologic Model', 'hw2-met-gages': 'Specified Hyetograph: ölçer ataması', 'hw2-control': 'Control Specifications alanları', 'hw2-compute-menu': 'Compute › Create Compute',
    'hw2-run-wizard': 'Simulation Run sihirbazı, adım 1', 'hw2-run-toolbar': 'Koşu seçimi ve Compute düğmesi', 'hw2-run-log': 'Message Log: hesap bitti', 'hw2-global-summary': 'Global Summary Table',
    'hw2-stump-graph': 'Stump Creek sonuç grafiği', 'hw2-stump-summary': 'Stump Creek özet tablosu', 'hw2-reach-graph': 'Reach-1: giriş ve çıkış', 'hw2-junction-options': 'Junction-2 › Options › Observed Flow',
    'hw2-observed-graph': 'Junction-2: model ve gözlem', 'hw2-observed-summary': 'Junction-2 özeti: Nash-Sutcliffe 0.952',
  };

  /* ======================================================================== ADIM ADIM İZLE
     Her öğe bir ödev adımına karşılık gelir (aynı sıra). sonra: mikro başına «Ekranda ne değişti»;
     öğe metin ya da { s: metin, dikkat: bu tıkın uyarısı, iz: izleme modunda yönerge }. */
  const bs = (a, b, son) => [`${a} seçildi; yanında sağ tık menüsü açıldı: Edit, View Results, Connect Downstream, Delete Element…`, 'Menü kapandı. Haritanın altında «Connect Downstream: click the downstream element» yazıyor; imleç artıya döndü.', son || `İnce siyah bağlantı çizgisi çizildi: ${a} artık suyunu ${b}${/2$/.test(b) ? "'ye" : "'e"} gönderiyor.`];

  const IZ1 = [
    { // 1 HEC-HMS'i aç
      giris: ['Programı başlatıyorum: masaüstündeki HEC-HMS 4.14 simgesi.', 'Açılan pencerenin dört parçasını tanıyorum: Watershed Explorer (ağaç), Component Editor (ayarlar), harita masası, Message Log (iletiler).'],
      sonunda: 'Boş ama çalışan bir HEC-HMS penceresi.',
      neden: ["HEC-HMS'te her iş bir projenin içinde yapılır; önce program açık olmalı.", 'Taşınabilir sürüm kurulum istemez: klasördeki HEC-HMS.exe yeter.'],
      dikkat: ['Ödev 4.14 beta 2 ya da daha yeni bir sürüm istiyor; 4.14 uygun.', 'Bilgisayarın dil ve bölge ayarı İngilizce olsun; Türkçe ayarda tarih ve birim hataları çıkabiliyor.'],
      teori: { b: 'HEC-HMS ne hesaplar?', m: ['Girdi yağış: hangi saatte ne kadar yağdı (inç).', 'Alt havzada yağışın bir kısmı kayıp olur (toprak, bitki, çukur); kalanı etkili yağış.', 'Etkili yağış birim hidrografla çıkışta akıma (cfs) döner; üstüne taban akışı eklenir.', 'Kanal (reach) akımı aşağı taşır, birleşim (junction) kolları toplar.', 'Çıktı: havza çıkışında hidrograf, yani debinin zamana göre grafiği.'] },
      sonra: ['Program açıldı. Başlıkta yalnız «HEC-HMS 4.14» yazıyor; ağaç, Component Editor ve harita masası boş, çünkü henüz proje yok.'] },
    { // 2 File › New
      giris: ['File › New ile yeni bir proje açıyorum.', 'Projeye ad veriyorum ve birim sistemini seçiyorum.'],
      sonunda: 'Ağaçta Punxsutawney adlı boş bir proje.',
      neden: ['Proje, bütün modellerin (havza, meteoroloji, zaman ayarı) ve sonuçların durduğu klasör.', 'Birim sistemi gireceğim her sayının birimini belirler: inç mi mm mi, mi² mi km² mi.'],
      dikkat: ['Varsayılan birim Metric gelir; öğreticinin değerleri inç, mi² ve cfs olduğu için U.S. Customary seçilmeli.', 'Birim sistemi sonradan değişirse girilmiş değerler bozulur; baştan doğru seç.'],
      teori: { b: 'Birimler', m: ['1 in = 25,4 mm.', '1 mi² ≈ 2,59 km²; bütün havza 158 mi² ≈ 409 km².', '1 cfs (ft³/s) ≈ 0,0283 m³/s; çıkıştaki tepe 3082,9 cfs ≈ 87 m³/s.'] },
      sonra: ['File menüsü açıldı: New..., Open..., Save, Save As… alt alta.', '«Create a New Project» penceresi açıldı: Name boş, birim listesinde Metric yazıyor.', 'Name: Punxsutawney.', { s: 'Liste açıldı: Metric ve U.S. Customary.', dikkat: 'Öğreticinin bütün değerleri inç, mi² ve cfs: U.S. Customary şart.' }, 'Liste kapandı; Default Unit System alanında U.S. Customary yazıyor.', "Pencere kapandı. Başlık çubuğunda proje dosyasının yolu belirdi; ağaçta Punxsutawney proje düğümü, Component Editor'da proje bilgisi var."] },
    { // 3 Basin Model Manager
      giris: ['Components › Basin Model Manager ile havza modeli yaratıyorum.', 'Adı Punxsutawney, açıklaması öğreticiden.'],
      sonunda: 'Ağaçta Basin Models › Punxsutawney (henüz elemansız).',
      neden: ['Havza modeli suyun yolunu tarif eden ağ: alt havzalar, kanallar, birleşimler.', 'Bir projede birden çok havza modeli (senaryo) olabilir: «bugünkü durum», «baraj sonrası» gibi.'],
      dikkat: ['Ad ve açıklama hesaba girmez, ama sonuç pencerelerinde bu adı görürsün; öğreticideki adı aynen yaz.', "Create'ten sonra yönetici açık kalır; Close ile kapat."],
      teori: { b: 'Havza (watershed)', m: ['Havza: yağan suyu tek bir çıkış noktasına toplayan alan.', 'Sınırı su bölümü çizgisi: sırtın iki yanına düşen yağmur ayrı derelere gider.', 'Bu havzanın çıkışı Punxsutawney kenti; drenaj alanı 158 mi².'] },
      sonra: ['Components menüsü açıldı: en üstte Create Component, altında yedi Manager.', 'Basin Model Manager penceresi açıldı; «Current basin models» listesi boş.', 'Üstüne «Create A New Basin Model» penceresi geldi: Name ve Description boş.', 'Name: Punxsutawney.', 'Description: «Headwaters to the City of Punxsutawney - Existing Conditions.»', 'Yaratma penceresi kapandı; yöneticinin listesinde Punxsutawney seçili duruyor. Ağaçta Basin Models klasörü belirdi.', 'Yönetici kapandı. Ağaçta Basin Models › Punxsutawney duruyor.'] },
    { // 4 Defaults
      giris: ['Tools › Program Settings › Defaults sekmesini açıyorum.', 'Yeni alt havza ve kanalların hangi yöntemle doğacağını seçiyorum: kayıp, dönüşüm, taban akışı, öteleme.'],
      sonunda: 'Bundan sonra eklenen her alt havza Initial and Constant + Clark + Linear Reservoir, her kanal Lag ile doğar.',
      neden: ['Alt havza üç hesabı arka arkaya yapar: kayıp → dönüşüm → taban akışı. Kanal öteleme yapar.', 'Varsayılanı baştan seçersem her elemanda yöntemi tek tek değiştirmem gerekmez.'],
      dikkat: ['Bu ayar yalnız sonradan eklenen elemanlara uygulanır; elemanları koyduktan sonra değiştirirsen eskileri tek tek değiştirmen gerekir.', 'OK yerine Cancel ya da ✕ ile kapatırsan seçimler uygulanmaz.'],
      teori: { b: 'Dört yöntem, birer cümle', m: ['Kayıp (Initial and Constant): yağışın ilk kısmını toprak ve bitki tutar, sonra toprak sabit bir hızla emer; kalanı etkili yağış.', 'Dönüşüm (Clark): etkili yağışı çıkıştaki akıma çevirir; suyun yol alması (Tc) ve havzada birikip yavaş bırakılması (R).', 'Taban akışı (Linear Reservoir): sızan su yeraltı haznelerine gider, oradan dereye yavaşça döner.', 'Öteleme (Lag): kanal akımı yalnız geciktirir; hidrografın şekli değişmez.', 'Her biri sonraki adımlarda ayrıca açılıyor.'] },
      sonra: ['Tools menüsü açıldı; en altta Program Settings satırı.', 'Program Settings penceresi General sekmesinde açıldı; üstte altı sekme.', 'Defaults sekmesi: birim U.S. Customary; dört yöntem listesi --None-- gösteriyor.', 'Subbasin loss listesi açıldı: 13 kayıp yöntemi.', 'Subbasin loss: Initial and Constant.', 'Subbasin transform listesi açıldı: 8 dönüşüm yöntemi.', 'Subbasin transform: Clark Unit Hydrograph.', 'Subbasin baseflow listesi açıldı: 5 taban akışı yöntemi.', 'Subbasin baseflow: Linear Reservoir.', 'Reach routing listesi açıldı: 8 öteleme yöntemi.', 'Reach routing: Lag. Dört varsayılan da seçildi.', 'Pencere kapandı. Ekranda görünür değişiklik yok: seçimler bundan sonra eklenecek elemanlara uygulanacak.'] },
    { // 5 Havza haritasını aç
      giris: ['Ağaçta havza modeline basıp haritasını açıyorum.'],
      sonunda: 'Masada elemanları koyacağım boş havza haritası.',
      neden: ['Alt havza, kanal ve birleşimler bu haritaya konur; harita açılmadan eleman koyamazsın.'],
      dikkat: ["Component Editor'daki Unit System satırına bak: U.S. Customary yazmalı. Metric yazıyorsa 2. adıma dön."],
      sonra: ['Masada boş «Basin Model [Punxsutawney]» haritası açıldı. Component Editor havza modelini gösteriyor: Unit System U.S. Customary.'] },
    { // 6 Üç alt havza
      giris: ['Subbasin aracını seçip haritada üç yere tıklıyorum.', 'Her tıklamada gelen ad penceresinde varsayılan adı onaylıyorum.'],
      sonunda: 'Haritada Subbasin-1, -2 ve -3 (henüz bağlantısız).',
      neden: ["Punxsutawney'e kadar olan havza üç parçaya bölünmüş: Stump Creek, EB Mahoning Creek ve aradaki yerel alan.", 'Her parça kendi yağışını, kaybını ve akışını ayrı hesaplar; havzanın farklı yerleri farklı davranabilir.'],
      dikkat: ["Haritadaki konum hesaba girmez, yalnız görüntü; yine de öğreticinin Şekil 1'ine benzet, ekran görüntülerini karşılaştırmak kolaylaşır.", 'Araç seçiliyken haritada boş yere her tıklama yeni bir eleman yaratır.'],
      teori: { b: 'Alt havza ne yapar?', m: ['Her alt havza kendi yağışını alır ve sırayla üç hesap yapar: kayıp → dönüşüm → taban akışı.', 'Büyük havzayı parçalara bölmek, yağışın ve zeminin yerden yere değişmesini hesaba katar (yarı dağılımlı model).', 'Çıktısı tek bir hidrograf: aşağı akıştaki elemana giden toplam akım.'] },
      sonra: ['Subbasin Creation Tool basılı görünüyor; harita üzerinde imleç artıya döndü.', 'Tıklanan yerde «Create A New Subbasin Element» penceresi açıldı; Name hazır: Subbasin-1.', "Subbasin-1 haritaya düştü ve seçildi; ağaçta havza modelinin altında listelendi. Subbasin sekmesinde Loss, Transform, Baseflow yöntemleri Defaults'taki seçimler.", 'Ad penceresi yine açıldı: Subbasin-2.', 'Subbasin-2 haritada, sağda.', 'Ad penceresi: Subbasin-3.', 'Üç alt havza haritada: üstte, sağda ve solda. Henüz birbirine bağlı değiller.'] },
    { // 7 Kanal ve birleşimler
      giris: ['Reach aracıyla bir kanal, Junction aracıyla iki birleşim koyuyorum.', "Yerleşim öğreticinin Şekil 1'i gibi: Junction-1 ortada, Junction-2 sol altta, Reach-1 ikisinin arasında."],
      sonunda: 'Ağın bütün parçaları haritada.',
      neden: ["Junction-1: Stump Creek ile EB Mahoning Creek'in buluştuğu nokta.", "Reach-1: bu birleşik akımı aşağıya, Junction-2'ye taşıyan dere parçası.", 'Junction-2: havzanın çıkışı (Punxsutawney); bütün akım burada toplanır.'],
      dikkat: ["Junction'ın parametresi yoktur; yalnız gelenleri toplar.", "Reach'in iki ucu bağlantıyla anlam kazanır; bir sonraki adımda bağlanacak."],
      teori: { b: 'Birleşim ve kanal', m: ['Birleşimde akımlar aynı anda toplanır: Q çıkış = Q1 + Q2.', 'Kanalda su yol alırken zaman geçer; öteleme (routing) bu gecikmeyi, gerekirse tepedeki basıklaşmayı hesaplar.'] },
      sonra: ['Reach Creation Tool basılı.', 'Ad penceresi: Reach-1.', 'Reach-1 haritada kalın mavi çizgi; iki ucu şimdilik boşta.', 'Junction Creation Tool basılı.', 'Ad penceresi: Junction-1.', 'Junction-1 ortada: iki kolun buluşacağı nokta.', 'Ad penceresi: Junction-2.', 'Altı eleman haritada: 3 alt havza, 1 kanal, 2 birleşim. Bağlantı çizgisi henüz yok.'] },
    { // 8 Connect Downstream
      giris: ['Her elemanın suyunu nereye akıttığını söylüyorum: sağ tık › Connect Downstream › aşağıdaki elemana tık.', "Beş bağlantı: iki kol Junction-1'e, Junction-1 kanala, kanal Junction-2'ye, yerel alan Junction-2'ye."],
      sonunda: "Yukarıdan aşağıya bağlı bir ağ; bütün su Junction-2'de toplanıyor.",
      neden: ['HEC-HMS ağı yukarıdan aşağı hesaplar; bir elemanın sonucu aşağıdakinin girdisi olur.', "Bağlantısız bir alt havzanın akımı çıkışa ulaşmaz; Junction-2'nin debisi eksik çıkar."],
      dikkat: ["Önce Arrow Tool: araç Subbasin ya da Junction'da kalırsa tıklama yeni eleman yaratır.", 'Alt havza aşağı akış hedefi olamaz; hedef bir junction ya da reach olmalı.', "Bağlamanın ikinci yolu: Component Editor'daki Downstream listesi."],
      teori: { b: 'Akış ağı', m: ['Her elemanın tek bir aşağı akış elemanı vardır; bir elemana ise birden çok kol gelebilir.', 'Bu yüzden ağ bir ağaç gibi: dallar yukarıda, gövde (çıkış) aşağıda.', 'Hesap yukarıdan aşağı yürür: önce alt havzalar, en son çıkış.'] },
      sonra: ['Arrow Tool seçildi: tıklama artık eleman seçer, yeni eleman yaratmaz.'].concat(bs('Subbasin-1', 'Junction-1'), bs('Subbasin-2', 'Junction-1'), bs('Junction-1', 'Reach-1', "Reach-1'in üst ucu Junction-1'e oturdu: iki kolun toplamı artık kanala giriyor."), bs('Reach-1', 'Junction-2', "Reach-1'in alt ucu Junction-2'ye oturdu: kanal iki birleşimi bağlıyor."), bs('Subbasin-3', 'Junction-2', "Bağlantı çizildi: Subbasin-3 suyunu doğrudan Junction-2'ye gönderiyor. Ağ tamam; bütün su Junction-2'de toplanıyor.")) },
    { // 9 Yeniden adlandır + Save
      giris: ['Alt havzalara gerçek dere adlarını veriyorum.', 'Sonra projeyi diske yazıyorum (Save).'],
      sonunda: 'Stump Creek, EB Mahoning Creek, Mahoning Creek Local; proje diskte.',
      neden: ['Sonuç tablolarında hangi satırın hangi dere olduğu addan okunur.', "HW#2'de her alt havzaya bir yağış ölçeri atanacak; eşleme bu adlarla yapılır."],
      dikkat: ['Gerçek programda: ağaçta elemana bas, kısa bir aradan sonra bir kez daha bas (çift tık değil); ad alanı açılır, yeni adı yaz, Enter.', 'Adı öğreticideki gibi birebir yaz; sonraki ödevlerde bu adları arayacaksın.', 'Programda geri alma (Undo) sınırlı; sık sık Save.'],
      sonra: ["Subbasin-1 artık Stump Creek: haritada, ağaçta ve Component Editor'da yeni ad. Bağlantısı aynen duruyor.", 'Subbasin-2 artık EB Mahoning Creek.', 'Subbasin-3 artık Mahoning Creek Local. Üç dere de gerçek adında.', 'Proje diske yazıldı. Benzetimde görünür bir değişiklik olmaz.'] },
    { // 10 Subbasin Area
      giris: ['Parameters › Subbasin Area tablosunu açıyorum.', 'Üç alt havzanın alanını tek tabloda giriyorum.'],
      sonunda: 'Stump 29, EB Mahoning 41, Mahoning Local 88 mi² (toplam 158 mi²).',
      neden: ['Model yağışı derinlik (inç) olarak hesaplar; alan bu derinliği debiye (cfs) çevirir.', "Aynı yağış büyük alanda daha büyük debi üretir: en büyük katkı 88 mi²'lik yerel alandan gelir."],
      dikkat: ['Birim MI2 (mil kare). km² girersen alan ≈ 2,6 kat büyük olur, debiler de o kadar şişer.', 'Area kırmızı yıldızlı, zorunlu alan; boş bırakma.'],
      teori: { b: 'Derinlikten debiye', m: ["1 mi²'ye 1 in yağış ≈ 2,32 milyon ft³ su eder.", 'Bu su bir saatte akıp gitseydi ortalama ≈ 645 cfs olurdu: 1 in/sa · 1 mi² ≈ 645 cfs.', 'Aynı yağış ve aynı Tc, R ile alan iki katına çıkarsa debi de iki katına çıkar.'] },
      sonra: ['Parameters menüsü açıldı; havza modeli olduğu için satırlar etkin.', '«Subbasin Area [Punxsutawney]» tablosu açıldı: üç alt havza, Area (MI2) sütunu boş.', 'Stump Creek: 29 mi².', 'EB Mahoning Creek: 41 mi².', 'Mahoning Creek Local: 88 mi². Toplam 158 mi² ≈ 409 km².', 'Tablo kapandı; alanlar alt havzalara işlendi (Subbasin sekmesinin Area alanında da görünür).'] },
    { // 11 Baseflow
      giris: ['Parameters › Baseflow › Linear Reservoir tablosunu açıyorum.', 'Üç alt havzaya aynı taban akışı ayarını giriyorum: iki yeraltı katmanı.'],
      sonunda: 'Fırtınadan önce de akan, yağıştan sonra yavaşça boşalan bir taban akışı.',
      neden: ['Derede yağmur yokken de su akar; bu su yeraltından gelir (taban akışı).', "İki katmanın her biri başlangıçta 1 cfs/mi² verir; toplam alan × 2. Stump Creek 58 cfs, bütün havza 316 cfs ile başlar (PNXP'de ölçülen: 312 cfs).", 'Toprağa sızan suyun yarısı (Fraction 0.5) bir katmana, yarısı diğerine gider.'],
      dikkat: ['Initial Type «Discharge Per Area»: Initial değeri cfs/mi² okunur, alanla çarpılır.', "İki Fraction'ın toplamı 1 (0.5 + 0.5): sızan suyun hepsi katmanlara paylaşılıyor.", 'GW Coefficient birimi saat (HR): 70 ve 100.'],
      teori: { b: 'Doğrusal hazne (Linear Reservoir)', m: ['Hazneden çıkan debi içindeki suyla orantılı: Q = S / k.', 'k (GW Coefficient) büyükse hazne yavaş boşalır: 100 saatlik katman 70 saatlikten uzun akar.', 'Yağış bitince taban akışı üstel azalır: Q(t) = Q0 · e^(−t/k).', 'Reservoirs 1: her katman tek hazne; sayı artarsa su art arda haznelerden geçer, çıkış daha yayvan olur.', "Kayıp olarak toprağa giren su buradan dereye döner. Message Log'daki «Initial losses may have been included in baseflow» uyarısı bunu söyler.", 'Karşılaştırma: Recession yöntemi başlangıç akımını sabit bir oranla azaltır, bir eşikten sonra çekilme eğrisine geçer; bu ödevde kullanılmıyor.'] },
      sonra: ['Parameters menüsü açıldı.', 'Baseflow alt menüsü açıldı: kullanılan Linear Reservoir koyu, diğerleri soluk.', '«Linear Reservoir [Punxsutawney]» tablosu açıldı: on sütun, hepsi boş.', 'Stump Creek satırı doldu: 2 katman, Discharge Per Area; GW 1: 1 · 0.5 · 70 · 1; GW 2: 1 · 0.5 · 100 · 1.', 'EB Mahoning Creek: aynı değerler.', 'Mahoning Creek Local: aynı değerler. Üç alt havza da aynı taban akışı ayarında.', 'Tablo kapandı; değerler alt havzaların Baseflow sekmelerinde de görünür.'] },
    { // 12 Loss
      giris: ['Parameters › Loss › Initial and Constant tablosunu açıyorum.', 'Üç alt havzaya aynı kayıp değerlerini giriyorum.'],
      sonunda: 'Yağışın ilk 1 inçi, sonra saatte 0,1 inçi toprağa gidiyor; fazlası akışa geçiyor.',
      neden: ['Yağışın hepsi dereye ulaşmaz: bitki tutar, çukurlarda kalır, toprağa sızar. Buna kayıp diyoruz.', 'Etkili yağış = yağış − kayıp; yalnız etkili yağış doğrudan akışa döner.', 'Impervious 0 %: beton, asfalt gibi geçirimsiz yüzey yok; kırsal havza.'],
      dikkat: ['Birimler: Initial Loss inç (IN), Constant Rate inç/saat (IN/HR). mm girersen kayıp 25 kat büyür, neredeyse hiç akış çıkmaz.', 'Impervious yüzde: 0.5 yazarsan %0,5 olur, %50 değil.', 'Hesap adımı 15 dk olunca sabit hız her adımda 0,025 in düşer (0,1 ÷ 4).'],
      teori: { b: 'Initial and Constant kaybı', m: ['Başlangıç kaybı (1 in): yağışın ilk 1 inçi tutulur; dolana kadar etkili yağış olmaz.', 'Sabit hız (0,1 in/sa): sonra toprak saatte en çok 0,1 in emer; yağış bundan azsa hepsi sızar.', "Stump Creek'te (HW#2 sonucu): 29 Nisan sabahki ilk dalga (0,68 in) tamamen kayıp.", '30 Nisan 08:00 satırı: 0,42 in yağış → 0,10 in kayıp, 0,32 in etkili yağış.', 'Bütün fırtına: 1,76 in yağış = 1,37 in kayıp + 0,39 in etkili yağış.'] },
      sonra: ['Parameters menüsü açıldı.', 'Loss alt menüsü: kullanılan Initial and Constant koyu.', '«Initial and Constant [Punxsutawney]» tablosu: Initial Loss, Constant Rate, Impervious sütunları boş.', 'Stump Creek: Initial Loss 1 · Constant Rate 0.1 · Impervious 0.', 'EB Mahoning Creek: aynı değerler.', 'Mahoning Creek Local: aynı değerler.', 'Tablo kapandı; değerler alt havzaların Loss sekmelerinde de görünür.'] },
    { // 13 Clark
      giris: ['Parameters › Transform › Clark Unit Hydrograph tablosunu açıyorum.', 'Her alt havzaya iki süre giriyorum: Tc (yoğunlaşma süresi) ve R (depolama katsayısı).'],
      sonunda: 'Etkili yağışın çıkışa ne kadar sürede ve ne kadar yayılarak varacağı tanımlı.',
      neden: ['Etkili yağış bir anda çıkışa gelmez; havzanın her yerinden farklı sürede yol alır.', 'Tc ve R hidrografın ne zaman yükseleceğini ve tepesinin ne kadar sivri olacağını belirler.', 'En büyük alt havza (Mahoning Creek Local, 88 mi²) en uzun süreleri alıyor: Tc 10, R 13 saat.'],
      dikkat: ['İkisi de saat (HR). Dakika girersen hidrograf 60 kat yayılır.', 'Sırayı karıştırma: tabloda önce Time of Concentration, sonra Storage Coefficient.'],
      teori: { b: 'Clark birim hidrografı', m: ['Birim hidrograf: havzaya 1 in etkili yağış düşerse çıkışta görülen akım grafiği.', 'Öteleme: su en uzak noktadan çıkışa Tc sürede varır; arada alan-zaman eğrisine göre dağılır.', 'Depolama: ötelenen akım R katsayılı doğrusal bir hazneden geçer; tepe alçalır, çekilme uzar.', 'Tc büyürse tepe gecikir; R büyürse tepe basıklaşır.', "Message Log'daki «Unit hydrograph volume … is 1.0000 in» notu birim hidrografın hacminin tam 1 in olduğunu doğrular."] },
      sonra: ['Parameters menüsü açıldı.', 'Transform alt menüsü: kullanılan Clark Unit Hydrograph koyu.', '«Clark Unit Hydrograph [Punxsutawney]» tablosu: Clark Method «Standard», Tc ve R sütunları boş.', 'Stump Creek: Tc 9 sa, R 12 sa.', 'EB Mahoning Creek: Tc 7 sa, R 11 sa.', 'Mahoning Creek Local: Tc 10 sa, R 13 sa.', 'Tablo kapandı. Alt havzaların bütün yöntem değerleri girildi.'] },
    { // 14 Lag
      giris: ["Haritada Reach-1'i seçip Routing sekmesini açıyorum.", 'Gecikme süresini (Lag) 300 dakika giriyorum.'],
      sonunda: "Junction-1'deki akım Junction-2'ye 5 saat gecikmeyle varacak; HW#1'in bütün değerleri girildi.",
      neden: ['Su kanalda yol alırken zaman geçer; Lag bu gecikmeyi verir.', '300 dk = 5 saat.'],
      dikkat: ['Birim dakika (MIN): «5» yazarsan 5 dakika olur.', "Lag şekli değiştirmez: HW#2'de Reach-1'in tepesi girişle aynı çıkacak (1501,1 cfs), yalnız 5 saat sonra."],
      teori: { b: 'Öteleme: Lag ve Muskingum', m: ['Lag: çıkış, girişin 300 dk önceki hâli: O(t) = I(t − 300 dk). Şekil değişmez.', 'Muskingum: kanalı bir depo gibi düşünür, S = K·[x·I + (1 − x)·O]; hem geciktirir hem tepeyi basıklaştırır.', 'K kabaca geçiş süresi, x (0–0,5) girişin ağırlığı.', 'Doğal derelerde tepe biraz basıklaşır; Lag bunu yok sayan en basit yöntem.'] },
      sonra: ["Reach-1 seçildi (çizginin çevresi gri); Component Editor'da Reach sekmesi: Routing Method Lag.", 'Routing sekmesi: Initial Type «Discharge = Inflow», Lag (MIN) boş.', { s: 'Lag (MIN): 300. Kanal akımı 5 saat geciktirecek.', dikkat: 'Birim dakika: 300 dk = 5 saat.' }] },
    { // 15 Save + PDF
      giris: ['Projeyi son kez diske yazıyorum.', "Gerçek programda her adımın ekran görüntüsünü sırayla tek PDF'e koyuyorum."],
      sonunda: "HW#1 teslime hazır; HW#2 bu projeden devam eder.",
      neden: ['Ödev, her adımı kendi bilgisayarında yaptığını görmek istiyor; ekran görüntüleri bunun kanıtı.'],
      dikkat: ['Ninova yalnız .pdf kabul ediyor.', 'Pencerenin tamamını (başlık çubuğu dahil) al; hangi projede çalıştığın görünsün.'],
      sonra: ['Proje diske yazıldı. HW#1 benzetimde tamam.'] },
  ];

  const IZ2 = [
    { // 1 DUJP yağış ölçeri
      giris: ['Yağış verisini tutacak ilk ölçeri (gage) yaratıyorum: DUJP.', 'Ölçer şimdilik boş; veriyi bir sonraki adımda dosyadan bağlayacağım.'],
      sonunda: 'Ağaçta Time-Series Data › Precipitation Gages › DUJP.',
      neden: ['Model yağışı ölçerlerden alır; ölçer bir istasyonun zaman serisi (saat saat yağış).', 'Havzayı üç yağış istasyonu temsil ediyor: DUJP, PNXP, MFFP.'],
      dikkat: ['Data Type «Precipitation Gages» olsun; akım ölçeri (Discharge Gages) 5. bölümde.', 'Adı DSS dosyasındaki istasyon adıyla aynı yaz (DUJP); dosyada aradığında kolay bulursun.'],
      teori: { b: 'Havza ve meteoroloji ayrı', m: ['HEC-HMS iki şeyi ayrı tutar: havza (su nereden nereye akar) ve meteoroloji (ne zaman ne kadar yağar).', 'Yağış ölçeri saatlik artımlı yağış verir: PRECIP-INC, o saatte düşen inç.', 'Böylece aynı havza başka fırtınalarla da denenebilir.'] },
      sonra: ['Components menüsü açıldı.', 'Time-Series Data Manager açıldı: Data Type «Precipitation Gages», liste boş.', '«Create A New Time-Series Data» penceresi: Data Type Precipitation Gages, Name boş.', 'Name: DUJP.', 'DUJP yaratıldı. Ağaçta Time-Series Data › Precipitation Gages › DUJP belirdi; Component Editor ölçerin sekmelerini gösteriyor.', "Yönetici kapandı. DUJP'nin Time-Series Gage sekmesi açık: Data Source «Manual Entry»."] },
    { // 2 DSS'ten bağla
      giris: ["DUJP'nin verisini elle yazmıyorum; observe.dss dosyasından okutuyorum.", 'Dosyadaki doğru seriyi (pathname) listeden seçiyorum.'],
      sonunda: 'DUJP, dosyadaki saatlik yağış serisine bağlı (1994–1996).',
      neden: ["HEC-DSS, HEC programlarının zaman serisi dosyası; bir dosyada yüzlerce seri durabilir.", 'Her serinin adresi bir pathname: /A/B/C/D/E/F/.'],
      dikkat: ["Pathname'i elle yazma; Select Pathname listesinden seç. Elle yazınca eğik çizgiler karışıp «Units are not valid» hatası çıkabiliyor.", 'Bilgisayarın dil ve bölge ayarı İngilizce olsun; Türkçe ayarda DSS okuma hataları görülebiliyor.'],
      teori: { b: "Pathname'i okumak", m: ['/ALLEGHENY/DUJP/PRECIP-INC/01Apr1994/1Hour/OBS/', 'A: ALLEGHENY, nehir havzası · B: DUJP, istasyon · C: PRECIP-INC, artımlı yağış.', 'D: 01Apr1994, serinin başı · E: 1Hour, saatlik · F: OBS, gözlem.'] },
      sonra: ['Data Source listesi açıldı: Manual Entry ve Single Record HEC-DSS.', 'Single Record HEC-DSS seçildi; altında DSS Filename ve DSS Pathname alanları belirdi.', 'DSS Filename: projenin data klasöründeki observe.dss.', { s: '«Select Pathname From HEC-DSS File» penceresi açıldı: B filtresi DUJP, tek satır var (PRECIP-INC).', dikkat: "Pathname'i elle yazma; listeden seç." }, 'PRECIP-INC satırı seçildi (mavi).', 'Pencere kapandı; DSS Pathname alanında /ALLEGHENY/DUJP/PRECIP-INC/01Apr1994/1Hour/OBS/ yazıyor. Units: Incremental Inches.'] },
    { // 3 Time Window
      giris: ["DUJP'nin gösterileceği tarih aralığını giriyorum.", 'Grafiğe bakıp verinin geldiğini doğruluyorum.'],
      sonunda: "DUJP grafiğinde fırtına görünüyor: 29 ve 30 Nisan'da iki yağış dalgası.",
      neden: ["Time Window yalnız gösterimi sınırlar; hesabın süresi Control Specifications'ta.", 'Grafik, verinin doğru bağlandığının en hızlı kanıtı: boşsa pathname ya da tarih yanlış.'],
      dikkat: ['Tarih biçimi ddMMMyyyy: 28Apr1996, ay İngilizce kısaltma. «28.04.1996» olmaz.', 'Saat 24 saat biçiminde: 01:00, 00:00.'],
      teori: { b: 'Fırtına, sayılarla', m: ["DUJP'de en yoğun saat ≈ 0,42 in (≈ 10,7 mm).", "Fırtına boyunca Stump Creek'e 1,76 in (≈ 45 mm) yağdı.", 'Pencere 28 Nisan 01:00 – 4 Mayıs 00:00: yağıştan sonra akımın inişi de görünsün diye uzun.'] },
      sonra: ['Time Window sekmesi: dört alan boş.', 'Dört alan birden doldu: 28Apr1996 01:00 → 04May1996 00:00.', "Graph sekmesi: DUJP'nin saatlik yağışı kırmızı çubuklar; yoğun saatler 29 ve 30 Nisan."] },
    { // 4 PNXP ve MFFP
      giris: ["DUJP'de yaptığımın aynısını PNXP ve MFFP için tekrarlıyorum: her biri 14 tık.", 'İzlerken imleç hızlanır; adımlar DUJP ile birebir aynı.'],
      sonunda: 'Üç yağış ölçeri de dosyaya bağlı: DUJP, PNXP, MFFP.',
      neden: ['Her alt havza kendisini temsil eden istasyonun yağışını alacak; üç ölçer de lazım.'],
      dikkat: ["PNXP'de iki satır çıkar: FLOW (akım) ve PRECIP-INC (yağış). Burada yağış ölçeri yaratıyoruz → PRECIP-INC.", 'MFFP başka bir havza kodunda (SUSQUEHANA); B filtresi MFFP iken tek satır gelir.'],
      sonra: [{ s: "PNXP ve MFFP yaratıldı, ikisi de observe.dss'e bağlandı, zaman aralıkları girildi. Ağaçta üç yağış ölçeri var.", iz: "PNXP ve MFFP için DUJP'deki 14 tıkı arka arkaya yapıyorum." }] },
    { // 5 Meteorologic Model Manager
      giris: ['Meteorolojik modeli yaratıyorum: May 1996.', 'Bu bileşen yağışın modele hangi yöntemle verileceğini tutacak.'],
      sonunda: 'Ağaçta Meteorologic Models › May 1996 (yöntemi henüz seçilmedi).',
      neden: ['Havza ile meteoroloji ayrı tutulur: aynı havzayı başka bir fırtınayla denemek için yalnız meteorolojik modeli değiştirmek yeter.'],
      dikkat: ['Ad «May 1996»: koşu sihirbazında bu adı seçeceksin.', 'Açıklama hesaba girmez; öğreticideki gibi yaz.'],
      sonra: ['Components menüsü açıldı.', 'Meteorologic Model Manager açıldı; liste boş.', '«Create A New Meteorologic Model» penceresi.', 'Name: May 1996.', 'Description: «Precipitation for the Storm of May 1st, 1996».', "May 1996 yaratıldı: ağaçta Meteorologic Models › May 1996; Component Editor'da Meteorologic Model sekmesi.", 'Yönetici kapandı. Precipitation alanı şimdilik --None--.'] },
    { // 6 Specified Hyetograph + Include Subbasins
      giris: ['Yağış yöntemini Specified Hyetograph seçiyorum.', 'Basins sekmesinde bu meteorolojik modeli Punxsutawney havzasına bağlıyorum.'],
      sonunda: "May 1996, ölçer yağışını alt havzalara verecek ve Punxsutawney'e uygulanacak.",
      neden: ['Specified Hyetograph: her alt havzaya bir ölçer atanır; o ölçerin yağışı alt havzanın tamamına aynen düşer.', 'Include Subbasins = Yes olmazsa meteorolojik model bu havzanın alt havzalarına yağış vermez.'],
      dikkat: ['Diğer girdiler (Shortwave, Temperature, Evapotranspiration…) --None-- kalsın; bu kısa fırtına hesabında gerekmiyor.'],
      teori: { b: 'Yağışı alana yaymak', m: ['Specified Hyetograph: bir ölçer → bir alt havza, aynen.', 'Gage Weights: birden çok ölçerin ağırlıklı ortalaması (ör. Thiessen poligonları).', 'Inverse Distance: ölçerlere uzaklığın tersiyle ağırlık; yakın ölçer daha etkili.'] },
      sonra: ['Precipitation listesi açıldı: Frequency Storm, Gage Weights, Inverse Distance, SCS Storm, Specified Hyetograph…', "Precipitation: Specified Hyetograph. Ağaçta May 1996'nın altında «Specified Hyetograph» düğümü belirdi.", 'Basins sekmesi: Punxsutawney satırı, Include Subbasins «No».', 'Liste açıldı: No ve Yes.', "Include Subbasins: Yes. Meteorolojik model artık Punxsutawney'in alt havzalarına yağış verebilir."] },
    { // 7 Ölçer ataması
      giris: ['Specified Hyetograph düğümünü açıyorum.', 'Her alt havzaya yağışını alacağı ölçeri atıyorum.'],
      sonunda: 'Stump → DUJP, EB Mahoning → MFFP, Mahoning Local → PNXP.',
      neden: ['Her alt havza kendisini en iyi temsil eden istasyonu alır; öğretici bu eşlemeyi veriyor.', 'Eşleme yanlış olursa alt havzalar başka yerin yağışını alır; tepe debiler değişir.'],
      dikkat: ['Satır sırası ödev tablosundan farklı olabilir; sıraya değil ada bakarak ata.'],
      teori: { b: 'İstasyon farkı sonuçta', m: ['Toplam yağış (HW#2 sonucu): EB Mahoning 2,06 in (MFFP), Mahoning Local 1,93 in (PNXP), Stump 1,76 in (DUJP).', 'Aynı fırtınada en çok ile en az arasında 0,30 in fark var.'] },
      sonra: ["Component Editor'da atama tablosu: üç alt havza, Gage sütunu --None--.", 'Stump Creek → DUJP.', 'EB Mahoning Creek → MFFP.', 'Mahoning Creek Local → PNXP. Üç alt havzanın da yağış kaynağı belli.'] },
    { // 8 Control Specifications Manager
      giris: ['Hesabın zaman ayarını (Control Specifications) yaratıyorum: May 1996.'],
      sonunda: 'Ağaçta Control Specifications › May 1996; tarih alanları henüz boş.',
      neden: ['Kontrol ayarı modelin hangi zaman aralığında ve hangi adımla hesaplanacağını söyler.', 'Aynı havza ve yağış, farklı dönemler ya da adımlarla ayrı ayarlarla koşturulabilir.'],
      dikkat: ['Açıklama «Storm of May 1st 1996»: hesaba girmez, öğreticideki gibi yaz.'],
      sonra: ['Components menüsü açıldı.', 'Control Specifications Manager açıldı; liste boş.', '«Create A New Control Specifications» penceresi.', 'Name: May 1996.', 'Description: «Storm of May 1st 1996».', "May 1996 yaratıldı; Component Editor'da tarih alanları boş, Time Interval 1 Hour.", 'Yönetici kapandı; ağaçta Control Specifications › May 1996.'] },
    { // 9 Tarihler ve adım
      giris: ['Başlangıç, bitiş ve hesap adımını giriyorum.', 'Adım 15 dakika: program her 15 dakikada bir hesap yapacak.'],
      sonunda: '28Apr1996 01:00 → 04May1996 00:00, 15 dakikalık adımla 572 hesap adımı.',
      neden: ['Başlangıç fırtınadan önce (28 Nisan 01:00); bitiş, akımın fırtınadan sonra yeniden inmesine yetecek kadar geç (4 Mayıs).', "Adım, Tc ve R'den (7–13 saat) çok küçük olmalı; 15 dk yeterince ince."],
      dikkat: ['Tarih ddMMMyyyy (28Apr1996), saat HH:mm (01:00).', 'Bitiş başlangıçtan önce olamaz; veri bu aralığı kapsamazsa koşu durur (meteorolojik modelde Replace Missing: Abort Compute).'],
      teori: { b: 'Hesap adımı ve saatlik yağış', m: ['Yağış saatlik, adım 15 dk: HEC-HMS her saatin toplamını dört eşit parçaya böler (0,4 in/sa → her 15 dk 0,1 in).', 'Sonuçlar da 15 dakikalık; tepe zamanları bu yüzden 18:45 gibi çeyrek saatlere düşer.'] },
      sonra: ['Start Date: 28Apr1996.', 'Start Time: 01:00.', 'End Date: 04May1996.', 'End Time: 00:00.', 'Time Interval listesi açıldı: 1 Minute … 1 Day, yedi seçenek.', "Time Interval: 15 Minutes. Hesap 28 Nisan 01:00'den 4 Mayıs 00:00'a 572 adımda yürüyecek."] },
    { // 10 Simulation Run sihirbazı
      giris: ['Havza modeli + meteorolojik model + kontrol ayarını tek bir koşuda (simulation run) birleştiriyorum.', 'Dört adımlı sihirbaz: ad, havza, meteoroloji, zaman.'],
      sonunda: '«Run: May 1996» hesaplanmaya hazır.',
      neden: ['Koşu, hangi üç bileşenin birlikte hesaplanacağını söyler; biri eksikse hesap yapılamaz.'],
      dikkat: ["Finish'e basmadan Cancel ya da ✕ ile çıkarsan koşu yaratılmaz.", 'Her listede tek seçenek var; projede başka modeller olsaydı doğrusunu seçmek önemli olurdu.'],
      teori: { b: 'Koşu = havza + meteoroloji + kontrol', m: ['Havza modeli: suyun yolu ve parametreler (HW#1).', 'Meteorolojik model: ne zaman ne kadar yağdı.', 'Kontrol ayarı: hangi aralıkta, hangi adımla.', 'Bir bileşeni değiştirip (ör. başka fırtına) yeni bir koşu kurmak böylece kolay.'] },
      sonra: ['Compute menüsü açıldı; en alttaki Compute satırı soluk, çünkü seçili koşu yok.', 'Create Compute alt menüsü: yalnız Simulation Run... etkin.', 'Sihirbaz açıldı: «Create a Simulation Run [Step 1 of 4]», Name boş.', 'Name: May 1996.', 'Adım 2/4: havza modeli listesi (Punxsutawney).', 'Punxsutawney seçildi (mavi).', 'Adım 3/4: meteorolojik model listesi (May 1996).', 'May 1996 meteorolojik modeli seçildi.', 'Adım 4/4: kontrol ayarı listesi; Next yerine Finish geldi.', 'May 1996 kontrol ayarı seçildi.', "Sihirbaz kapandı. Koşu yaratıldı: Watershed Explorer'ın Compute sekmesinde Simulation Runs › May 1996."] },
    { // 11 Compute
      giris: ['Koşuyu araç çubuğundan seçip Compute ile hesaplatıyorum.', "Message Log'daki satırları okuyorum: NOTE bilgi, WARNING uyarı."],
      sonunda: 'Hesap bitti; sonuç pencereleri artık açılabilir.',
      neden: ['Compute ağı yukarıdan aşağı yürütür: önce alt havzalar, sonra Junction-1, Reach-1, en son Junction-2.'],
      dikkat: ['Mor WARNING 41862 («Initial losses may have been included in baseflow») hata değil; taban akışı yöntemi kaybı yeraltına aldığı için uyarıyor.', 'Kırmızı ERROR görürsen dur: çoğu zaman tarih biçimi, eksik ölçer ataması ya da pathname hatasıdır.'],
      teori: { b: 'Hesap sırası', m: ['1. Alt havza: yağış − kayıp = etkili yağış → Clark ile doğrudan akış → + taban akışı.', '2. Junction-1: Stump Creek + EB Mahoning Creek toplanır.', '3. Reach-1: Lag ile 5 saat ötelenir.', '4. Junction-2: Reach-1 + Mahoning Creek Local → havza çıkışı.', '«Unit hydrograph volume … is 1.0000 in» notları: üç alt havzanın birim hidrografı doğru hacimde.'] },
      sonra: ['Araç çubuğundaki koşu listesi açıldı: --None-- ve Run: May 1996.', 'Seçili koşu Run: May 1996. Haritanın başlığında «Current Run [May 1996]» yazıyor.', "Compute Progress penceresi: yeşil çubuk doldu, «Compute completed.» Message Log'a NOTE ve mor WARNING satırları düştü.", "İlerleme penceresi kapandı. Message Log'un son satırlarında «Finished computing simulation run» var."] },
    { // 12 Global Summary
      giris: ['Bütün elemanların sonucunu tek tabloda açıyorum.', 'Tepe debinin akış aşağı nasıl büyüdüğüne bakıyorum.'],
      sonunda: 'Havza çıkışı Junction-2: tepe 3082,9 cfs, 30 Nisan 18:45.',
      neden: ['Global Summary modelin büyük resmini tek bakışta verir: hangi kol ne kadar su getiriyor.'],
      dikkat: ["Junction-1 ile Reach-1'in tepesi aynı (1501,1 cfs), saatleri 5 saat farklı (14:30 → 19:30): Lag'in etkisi.", "Junction-2'nin tepesi kollarının tepeleri toplamı değil (1786,0 + 1501,1 = 3287,1 > 3082,9): tepeler aynı saatte gelmiyor."],
      teori: { b: 'Tablo nasıl okunur?', m: ['Drainage Area: o noktaya su gönderen toplam alan (Junction-2: 158 mi²).', 'Peak Discharge ve Time of Peak: en büyük debi ve zamanı.', 'Volume (IN): akışın toplam hacmi, alana yayılmış derinlik olarak (Junction-2: 1,62 in).'] },
      sonra: ['Results menüsü açıldı; hesap yapıldığı için satırlar etkin.', '«Global Summary Results» tablosu: altı eleman; alan, tepe debi, tepe zamanı, hacim. En altta Junction-2: 3082,9 cfs.', 'Tablo kapandı.'] },
    { // 13 Stump Creek grafiği
      giris: ['Stump Creek alt havzasının sonuç grafiğini açıyorum.', 'Yağışın ne kadarının kayba gittiğini, ne kadarının akışa geçtiğini görüyorum.'],
      sonunda: 'Stump Creek tepesi 609,7 cfs (30 Nisan 15:45); akış hacmi 1,53 in.',
      neden: ["Alt havza grafiği HW#1'de girdiğim kayıp, dönüşüm ve taban akışı ayarlarının sonucunu bir arada gösterir."],
      dikkat: ["29 Nisan'daki ilk dalgada çubukların hepsi kırmızı: başlangıç kaybı (1 in) önce dolmalı.", 'Kesikli kırmızı çizgi taban akışı; toplam akış onun üstüne biner.'],
      teori: { b: 'Hacim dengesi (Stump Creek)', m: ['Yağış 1,76 in = kayıp 1,37 in + etkili yağış 0,39 in.', 'Akış hacmi 1,53 in = doğrudan akış 0,39 in + taban akışı 1,14 in.', 'Taban akışının büyük payı: başlangıçtaki akım ve kaybın yeraltından dereye dönmesi.'] },
      sonra: ['Stump Creek seçildi; sağ tık menüsü açıldı. Hesap yapıldığı için View Results [May 1996] artık etkin.', 'Alt menü açıldı: Graph, Summary Table, Time-Series Table.', '«Graph for Subbasin Stump Creek» açıldı: üstte yağış (mavi) ve kayıp (kırmızı) çubukları; altta toplam akış (mavi) ve taban akışı (kesikli kırmızı).', 'Grafik kapandı.'] },
    { // 14 Reach-1 grafiği
      giris: ["Reach-1'in giriş ve çıkış akımını aynı grafikte görüyorum."],
      sonunda: 'Çıkış, girişin 5 saat gecikmiş kopyası: iki tepe de 1501,1 cfs.',
      neden: ['Lag yönteminin ne yaptığını gözle görmek: şekil aynı, zaman ileride.'],
      dikkat: ["Reach-1'in tepesi 19:30, Junction-1'inki 14:30: fark tam 300 dk."],
      teori: { b: 'Lag yerine Muskingum olsaydı', m: ['Çıkış tepesi girişten biraz alçak ve daha yayvan olurdu.', 'Hacim yine korunurdu: kanal suyu yok etmez, yalnız zamana yayar.'] },
      sonra: ['Reach-1 seçildi; sağ tık menüsü açıldı.', 'Alt menü: Graph, Summary Table, Time-Series Table.', '«Graph for Reach Reach-1» açıldı: kesikli çizgi giriş (Combined Inflow), düz çizgi çıkış (Outflow); çıkış 5 saat sonra, aynı yükseklikte.', 'Grafik kapandı.'] },
    { // 15 PNXP akım ölçeri
      giris: ['Havza çıkışında ölçülen akımı tutacak bir akım ölçeri (Discharge Gage) yaratıyorum: PNXP.'],
      sonunda: 'Ağaçta Discharge Gages › PNXP (veri henüz bağlı değil).',
      neden: ['Modelin ne kadar iyi olduğunu ancak gerçekte ölçülen akımla karşılaştırarak bilebiliriz.'],
      dikkat: ["Aynı adı taşıyan bir yağış ölçeri zaten var; Data Type'ı Discharge Gages yapmadan New... dersen ikinci bir yağış ölçeri yaratırsın."],
      teori: { b: 'Gözlem ve model', m: ['Kalibrasyon: parametreleri gözleme uyacak biçimde ayarlamak.', 'Doğrulama: ayarlanmış modelin başka bir olayda da tutup tutmadığına bakmak.', 'Bu ödev yalnız karşılaştırıyor; parametreler öğreticiden, kalibrasyon yok.'] },
      sonra: ['Components menüsü açıldı.', 'Time-Series Data Manager: Data Type Precipitation Gages; listede DUJP, PNXP, MFFP.', 'Data Type listesi açıldı: Precipitation, Discharge, Stage, Temperature Gages.', 'Data Type: Discharge Gages; liste boş, henüz akım ölçeri yok.', '«Create A New Time-Series Data» penceresi: Data Type Discharge Gages.', 'Name: PNXP.', 'PNXP akım ölçeri yaratıldı; ağaçta Time-Series Data › Discharge Gages › PNXP.', "Yönetici kapandı; PNXP'nin Time-Series Gage sekmesi açık, Units: Cubic Feet Per Second."] },
    { // 16 PNXP FLOW + Junction-2 Options
      giris: ["PNXP'nin akım verisini observe.dss'ten bağlıyorum (FLOW).", "Sonra bu ölçeri havza çıkışı Junction-2'ye «gözlenen akım» olarak takıyorum."],
      sonunda: 'Junction-2 sonuçlarında model ile gözlem yan yana çıkacak.',
      neden: ["PNXP istasyonu Punxsutawney'de, yani havzanın tam çıkışında: Junction-2 ile aynı nokta.", 'Gözlemi yanlış elemana bağlarsan karşılaştırma anlamsız olur.'],
      dikkat: ['Bu kez FLOW satırını seç (PRECIP-INC değil); birim cfs.', 'Ölçer bağlamak hesabı değiştirmez, sonuç pencerelerine gözlemi ekler; ama görünmesi için koşuyu yeniden hesaplamak gerekir.'],
      sonra: ['Data Source listesi açıldı.', 'Single Record HEC-DSS seçildi; DSS Filename ve Pathname alanları belirdi.', 'DSS Filename: observe.dss.', 'Select Pathname penceresi: FLOW satırı listede.', 'FLOW satırı seçildi.', 'DSS Pathname: /ALLEGHENY/PNXP/FLOW/01Apr1994/1Hour/OBS/.', "Junction-2 seçildi; Component Editor'da Junction sekmesi.", 'Options sekmesi: Observed Flow --None--.', 'Observed Flow listesi: --None-- ve PNXP.', 'Observed Flow: PNXP. Havza çıkışı artık gözlemle eşleşti.'] },
    { // 17 Yeniden hesap + Junction-2
      giris: ['Gözlem bağlıyken koşuyu yeniden hesaplıyorum.', "Junction-2'nin grafiğinde model ile gözlemi karşılaştırıyorum; özet tablosunda uyum ölçülerini okuyorum."],
      sonunda: 'Nash-Sutcliffe 0,952: model ölçülen akımı çok iyi yakalıyor.',
      neden: ['Ödevin son sorusu bu: model gerçeğe ne kadar yakın?'],
      dikkat: ['Model tepeyi ≈ %5 büyük (3082,9 / 2942,0 cfs) ve 1 sa 45 dk geç veriyor; hacimler neredeyse aynı (1,62 / 1,60 in).', 'Yeniden hesaplamadan grafiğe bakarsan siyah gözlem çizgisi görünmez.'],
      teori: { b: 'Nash–Sutcliffe neyi ölçer?', m: ['NSE = 1 − Σ(gözlem − model)² / Σ(gözlem − gözlem ortalaması)².', '1: kusursuz · 0: model, gözlemin ortalamasını söylemekten iyi değil · negatif: daha kötü.', '0,952: hataların karesi, gözlemin kendi değişkenliğinin yalnız ≈ %5\'i kadar.', 'Kling-Gupta (0,947) zamanlama uyumuna, değişkenliğe ve ortalamaya ayrı ayrı bakar; 1 kusursuz.', 'Percent Bias 1,39 %: model toplam hacmi gözlemden ≈ %1,4 fazla veriyor.'] },
      sonra: ["Compute Progress yeniden açıldı: hesap tamam. Message Log'a yeni satırlar eklendi.", 'İlerleme penceresi kapandı.', 'Junction-2 seçildi; sağ tık menüsü açıldı.', 'Alt menü: Graph, Summary Table, Time-Series Table.', "«Graph for Junction Junction-2» açıldı: siyah noktalı çizgi gözlenen akım (PNXP), düz mavi çizgi model; kesikliler Mahoning Creek Local ve Reach-1'den gelen akımlar.", 'Grafik kapandı.', 'Sağ tık menüsü yeniden açıldı.', 'Alt menü açıldı.', '«Summary Results for Junction Junction-2»: model tepe 3082,9 cfs (18:45), gözlem 2942,0 cfs (17:00); Nash-Sutcliffe 0,952, Modified Kling-Gupta 0,947, Percent Bias 1,39 %.'] },
  ];

  /* içerik → ödev adımlarına bağla (sayı uyuşmazsa konsola hata: test yakalar) */
  function izleBagla(adimlar, iz, ad) {
    if (iz.length !== adimlar.length) console.error(`${ad}: izle adım sayısı ${iz.length} ≠ ${adimlar.length}`);
    adimlar.forEach((a, i) => {
      const z = iz[i] || {}, s = z.sonra || [];
      if (s.length !== a.mikro.length) console.error(`${ad} adım ${i + 1}: sonra ${s.length} ≠ mikro ${a.mikro.length}`);
      a.mikro.forEach((m, j) => { const x = s[j]; if (typeof x === 'string') m.sonra = x; else if (x) { m.sonra = x.s; if (x.dikkat) m.dikkat = x.dikkat; if (x.iz) m.iz = x.iz; } });
      a.izle = { giris: z.giris, sonunda: z.sonunda, neden: z.neden, dikkat: z.dikkat, teori: z.teori };
    });
  }
  izleBagla(HW1, IZ1, 'HW#1');
  izleBagla(HW2, IZ2, 'HW#2');
  ODEV[0].izleSon = ["3 alt havza, 1 kanal, 2 birleşim; bütün su Junction-2'de toplanıyor.", 'Yöntemler: Initial and Constant · Clark Unit Hydrograph · Linear Reservoir · Lag.', 'Alanlar 29 + 41 + 88 = 158 mi²; Reach-1 Lag 300 dk.', 'Gerçek programda her adımın ekran görüntüsünü al, hepsini tek PDF yap.'];
  ODEV[1].izleSon = ['Üç yağış ölçeri (DUJP, PNXP, MFFP), May 1996 meteorolojik modeli, 15 dakikalık kontrol ayarı.', "Koşu hesaplandı: havza çıkışı Junction-2'de tepe 3082,9 cfs (30 Nisan 18:45).", 'Gözlenen akım PNXP: tepe 2942,0 cfs (17:00); Nash-Sutcliffe 0,952.', 'Gerçek programda her adımın ekran görüntüsünü al, hepsini tek PDF yap.'];

  /* ======================================================================== KATEGORİ KATEGORİ SEÇİM (17 Kas)
     Rehberli ve izle: adımlar ödevin aşamalarına (faz) ayrılır; her adımın seçim listesindeki kısa adı (kisa).
     fazlar: [ad, adım sayısı] sırayla; toplam ödevin adım sayısına eşit olmalı (değilse konsola hata: test yakalar). */
  const FAZ = {
    hw1: [['Proje kur', 4], ['Havza ağı', 5], ['Parametreler', 5], ['Teslim', 1]],
    hw2: [['Yağış ölçerleri', 4], ['Meteoroloji modeli', 3], ['Kontrol ve zaman', 2], ['Çalıştır', 2], ['Sonuçlar', 3], ['Gözlenen akım', 3]],
  };
  const KISA = {
    hw1: ['Programı aç', 'Proje yarat', 'Havza modeli yarat', 'Varsayılan yöntemler', 'Haritayı aç', '3 alt havza', 'Kanal ve birleşimler', 'Elemanları bağla', 'Adlandır, Save', 'Alanlar', 'Taban akışı', 'Kayıp', 'Clark: Tc ve R', 'Reach-1 Lag', 'Save, PDF'],
    hw2: ['DUJP ölçeri', 'DUJP verisi (DSS)', 'Time Window', 'PNXP ve MFFP', 'Met modeli yarat', 'Yağış yöntemi', 'Ölçer ataması', 'Kontrol yarat', 'Tarih ve adım', 'Koşu sihirbazı', 'Compute', 'Global özet', 'Stump Creek grafiği', 'Reach-1 grafiği', 'PNXP akım ölçeri', 'Akım verisi, Options', 'Yeniden hesap, kıyas'],
  };
  ODEV.forEach((o) => {
    const f = FAZ[o.id], k = KISA[o.id];
    if (k.length !== o.adimlar.length) console.error(`${o.ad}: kısa ad sayısı ${k.length} ≠ ${o.adimlar.length}`);
    if (f.reduce((t, x) => t + x[1], 0) !== o.adimlar.length) console.error(`${o.ad}: faz adımları toplamı ≠ ${o.adimlar.length}`);
    o.fazlar = []; let i = 0;
    f.forEach(([ad, n], fi) => { o.fazlar.push({ ad, bas: i, son: i + n }); for (let j = 0; j < n; j++, i++) if (o.adimlar[i]) o.adimlar[i].faz = fi; });
    o.adimlar.forEach((a, j) => { a.kisa = k[j] || a.baslik; });
  });

  /* Keşif: programın bütün parçaları, programın kendi bölümlerine göre. Öğe: [etiket, AC anahtarı, yol, vurgu, grup]
     yol: kesif tabanından (iki ödevin son hâli) sırayla yapılacak tıklar; «hd|sag» sağ tık (eleman ortasından),
     {hd, o} ek seçenekle. vurgu: benzetimde nabızla işaretlenecek parça (null: açılan pencerenin kendisi). */
  const T = (et, k, yol, hd, g) => ({ et, k, yol: yol || [], hd: hd === undefined ? k : hd, g });
  const menuOge = (yol, et, ac) => T(et, 'mi:' + yol, [ 'm:' + yol.split('/')[0] ].concat(ac ? ['mi:' + yol] : []), 'mi:' + yol);
  const sekme = (et, sec, s, k) => T(et, k || 'ce:' + s, [].concat(sec, ['ce:sekme:' + s]), 'ce:sekme:' + s);
  const ayar = (et, k) => T(et, 'cb:' + k, ['m:Tools', 'mi:Tools/Program Settings...', 'dlg:sekme:Defaults', 'cb:vars.' + k], 'cb:vars.' + k);
  const KESIF = [
    { id: 'bolgeler', ad: 'Bölgeler', ogeler: [
      T('Başlık çubuğu', 'bolge:baslik'), T('Menü çubuğu', 'bolge:menu'), T('Araç çubukları', 'bolge:arac'), T('Zaman çubuğu', 'bolge:arac2'),
      T('Watershed Explorer', 'bolge:agac'), T('Component Editor', 'bolge:ce', ['harita:el:Stump Creek']), T('Harita masası', 'bolge:masa'), T('Message Log', 'bolge:log')] },
    { id: 'menuler', ad: 'Menüler', ogeler: ['File', 'Edit', 'View', 'Components', 'GIS', 'Parameters', 'Compute', 'Results', 'Tools', 'Help'].map((m) => T(m, 'm:' + m, ['m:' + m])) },
    { id: 'komutlar', ad: 'Komutlar', ogeler: [
      menuOge('File/New...', 'File › New...'), menuOge('File/Save', 'File › Save'),
      menuOge('Components/Create Component', 'Create Component', true), menuOge('Components/Basin Model Manager', 'Basin Model Manager'), menuOge('Components/Meteorologic Model Manager', 'Meteorologic Model Manager'),
      menuOge('Components/Control Specifications Manager', 'Control Specifications Manager'), menuOge('Components/Time-Series Data Manager', 'Time-Series Data Manager'),
      menuOge('Parameters/Subbasin Area', 'Subbasin Area'), menuOge('Parameters/Loss', 'Parameters › Loss', true), menuOge('Parameters/Transform', 'Parameters › Transform', true),
      menuOge('Parameters/Baseflow', 'Parameters › Baseflow', true), menuOge('Parameters/Routing', 'Parameters › Routing', true),
      menuOge('Compute/Create Compute', 'Compute › Create Compute', true), menuOge('Results/Global Summary Table', 'Results › Global Summary'), menuOge('Tools/Program Settings...', 'Tools › Program Settings')] },
    { id: 'araclar', ad: 'Araçlar', ogeler: [
      T('New Project', 'tb:new', ['tb:new'], 'tb:new', 'File'), T('Open Project', 'tb:open', ['tb:open'], 'tb:open', 'File'), T('Save Project', 'tb:save', ['tb:save'], 'tb:save', 'File'), T('Print', 'tb:print', [], 'tb:print', 'File')]
      .concat([['arrow', 'Arrow'], ['zoom', 'Zoom'], ['subbasin', 'Subbasin'], ['reach', 'Reach'], ['reservoir', 'Reservoir'], ['junction', 'Junction'], ['diversion', 'Diversion'], ['source', 'Source'], ['sink', 'Sink'], ['breakpoint', 'Break Point']].map(([a, et]) => T(et, 'tb:' + a, ['tb:' + a], 'tb:' + a, 'Components')))
      .concat([T('Koşu seçimi', 'tb:secKosu', ['tb:secKosu'], 'tb:secKosu', 'Compute'), T('Compute', 'tb:compute', ['tb:compute'], 'tb:compute', 'Compute'), T('Global Summary', 'tb:gsum', ['tb:gsum'], 'tb:gsum', 'Compute'),
        T('Element Graph', 'tb:graph', ['harita:el:Junction-2', 'tb:graph'], 'tb:graph', 'Compute'), T('Element Summary', 'tb:esum', ['harita:el:Junction-2', 'tb:esum'], 'tb:esum', 'Compute'), T('Time-Series Table', 'tb:tstable', ['harita:el:Stump Creek', 'tb:tstable'], 'tb:tstable', 'Compute')]) },
    { id: 'explorer', ad: 'Explorer', ogeler: [
      T('Components sekmesi', 'xt:Components', ['xt:Components'], 'xt:Components', 'Sekmeler'), T('Compute sekmesi', 'xt:Compute', ['xt:Compute'], 'xt:Compute', 'Sekmeler'), T('Results sekmesi', 'xt:Results', ['xt:Results'], 'xt:Results', 'Sekmeler')]
      .concat([['Proje: Punxsutawney', 'agac:proje', 'p'], ['Basin Models', 'agac:k:basin', 'k:basin'], ['Havza modeli', 'agac:havza', 'h:Punxsutawney'], ['Subbasin: Stump Creek', 'agac:subbasin', 'e:Stump Creek'],
        ['Reach: Reach-1', 'agac:reach', 'e:Reach-1'], ['Junction: Junction-2', 'agac:junction', 'e:Junction-2'], ['Meteorologic Models', 'agac:k:met', 'k:met'], ['Met modeli: May 1996', 'agac:met', 'm'],
        ['Specified Hyetograph', 'agac:hy', 'hy'], ['Control Specifications', 'agac:k:kontrol', 'k:kontrol'], ['Kontrol: May 1996', 'agac:kontrol', 'c'], ['Time-Series Data', 'agac:k:ts', 'k:ts'],
        ['Yağış ölçeri: DUJP', 'agac:pg', 'pg:DUJP'], ['Akım ölçeri: PNXP', 'agac:dg', 'dg:PNXP']].map(([et, k, id]) => T(et, k, ['xt:Components', 'agac:sec:' + id], 'agac:sec:' + id, 'Components sekmesi')))
      .concat([T('Koşu: May 1996', 'agac:kosu', ['xt:Compute', 'agac:sec:r'], 'agac:sec:r', 'Compute ve Results'), T('Sonuç düğümü', 'agac:sonuc', ['xt:Results', 'agac:ac:rs:Junction-2', 'agac:sec:rs:Junction-2'], 'agac:sec:rs:Junction-2', 'Compute ve Results')]) },
    { id: 'harita', ad: 'Harita', ogeler: [
      T('Subbasin: Stump Creek', 'harita:subbasin', ['harita:el:Stump Creek'], 'harita:el:Stump Creek', 'Elemanlar'), T('Reach: Reach-1', 'harita:reach', ['harita:el:Reach-1'], 'harita:el:Reach-1', 'Elemanlar'),
      T('Junction: Junction-2', 'harita:junction', ['harita:el:Junction-2'], 'harita:el:Junction-2', 'Elemanlar'),
      T('Connect Downstream', 'bm:Connect Downstream', ['harita:el:EB Mahoning Creek|sag'], 'bm:Connect Downstream', 'Sağ tık menüsü'), T('View Results', 'bm:View Results', ['harita:el:Junction-2|sag', 'bm:View Results'], 'bm:View Results', 'Sağ tık menüsü'),
      T('Graph', 'bm:Graph', ['harita:el:Junction-2|sag', 'bm:View Results'], 'bm:Graph', 'Sağ tık menüsü'), T('Summary Table', 'bm:Summary Table', ['harita:el:Junction-2|sag', 'bm:View Results'], 'bm:Summary Table', 'Sağ tık menüsü')] },
    { id: 'editor', ad: 'Editör', ogeler: [
      T('Project', 'ce:Project', ['xt:Components', 'agac:sec:p'], 'bolge:ce', 'Proje ve havza'), sekme('Basin Model', ['xt:Components', 'agac:sec:h:Punxsutawney'], 'Basin Model'),
      sekme('Subbasin', ['harita:el:Stump Creek'], 'Subbasin'), sekme('Loss', ['harita:el:Stump Creek'], 'Loss'), sekme('Transform', ['harita:el:Stump Creek'], 'Transform'), sekme('Baseflow', ['harita:el:Stump Creek'], 'Baseflow'),
      sekme('Reach', ['harita:el:Reach-1'], 'Reach'), sekme('Routing', ['harita:el:Reach-1'], 'Routing'), sekme('Junction', ['harita:el:Junction-2'], 'Junction'), sekme('Options', ['harita:el:Junction-2'], 'Options')].map((x, i) => Object.assign(x, { g: i < 2 ? 'Proje ve havza' : 'Havza elemanları' }))
      .concat([sekme('Time-Series Gage', ['xt:Components', 'agac:sec:pg:DUJP'], 'Time-Series Gage'), T('Select Pathname', 'ce:yol', ['xt:Components', 'agac:sec:pg:DUJP'], 'ce:yol'), sekme('Time Window', ['xt:Components', 'agac:sec:pg:DUJP'], 'Time Window'),
        sekme('Table', ['xt:Components', 'agac:sec:pg:DUJP'], 'Table'), sekme('Graph', ['xt:Components', 'agac:sec:pg:DUJP'], 'Graph')].map((x) => Object.assign(x, { g: 'Ölçerler' })))
      .concat([sekme('Meteorologic Model', ['xt:Components', 'agac:sec:m'], 'Meteorologic Model'), sekme('Basins', ['xt:Components', 'agac:sec:m'], 'Basins'), sekme('Specified Hyetograph', ['xt:Components', 'agac:sec:hy'], 'Specified Hyetograph'),
        sekme('Control Specifications', ['xt:Components', 'agac:sec:c'], 'Control Specifications'), sekme('Simulation Run', ['xt:Compute', 'agac:sec:r'], 'Simulation Run')].map((x) => Object.assign(x, { g: 'Meteoroloji ve koşu' }))) },
    { id: 'listeler', ad: 'Listeler', ogeler: [
      T('Default Unit System', 'cb:birim', ['m:File', 'mi:File/New...', 'cb:dlg.birim'], 'cb:dlg.birim', 'Proje'),
      ayar('Subbasin loss', 'loss'), ayar('Subbasin transform', 'transform'), ayar('Subbasin baseflow', 'baseflow'), ayar('Reach routing', 'routing')].map((x, i) => Object.assign(x, { g: i ? 'Program Settings › Defaults' : 'Proje' }))
      .concat([T('Downstream', 'cb:asagi', ['harita:el:Stump Creek', 'ce:sekme:Subbasin', 'cb:el.Stump Creek.asagi'], 'cb:el.Stump Creek.asagi'), T('Data Type', 'cb:tsTur', ['m:Components', 'mi:Components/Time-Series Data Manager', 'cb:dlg.tsTur'], 'cb:dlg.tsTur'),
        T('Data Source', 'cb:kaynak', ['xt:Components', 'agac:sec:pg:DUJP', 'cb:pg.DUJP.kaynak'], 'cb:pg.DUJP.kaynak'), T('Precipitation', 'cb:yagis', ['xt:Components', 'agac:sec:m', 'cb:met.yagis'], 'cb:met.yagis'),
        T('Include Subbasins', 'cb:dahil', ['xt:Components', 'agac:sec:m', 'ce:sekme:Basins', 'cb:met.dahil'], 'cb:met.dahil'), T('Time Interval', 'cb:aralik', ['xt:Components', 'agac:sec:c', 'cb:kontrol.aralik'], 'cb:kontrol.aralik'),
        T('Observed Flow', 'cb:goz', ['harita:el:Junction-2', 'ce:sekme:Options', 'cb:el.Junction-2.goz'], 'cb:el.Junction-2.goz')].map((x) => Object.assign(x, { g: 'Component Editor' }))) },
    { id: 'pencereler', ad: 'Pencereler', ogeler: [
      T('Create a New Project', 'dlg:yeniProje', ['m:File', 'mi:File/New...'], null), T('Manager penceresi', 'dlg:yonetici', ['m:Components', 'mi:Components/Basin Model Manager'], null),
      T('Create A New …', 'dlg:yeniBilesen', ['m:Components', 'mi:Components/Meteorologic Model Manager', 'dlg:New...'], null), T('Create A New … Element', 'dlg:adVer', ['tb:subbasin', { hd: 'harita:bos', o: { hx: 560, hy: 250 } }], null),
      T('Program Settings', 'dlg:ayarlar', ['m:Tools', 'mi:Tools/Program Settings...', 'dlg:sekme:Defaults'], null), T('Global editör', 'dlg:global', ['m:Parameters', 'mi:Parameters/Loss', 'mi:Parameters/Loss/Initial and Constant'], null),
      T('Select Pathname', 'dlg:yolSec', ['xt:Components', 'agac:sec:pg:DUJP', 'ce:yol'], null), T('Simulation Run sihirbazı', 'dlg:sihirbaz', ['m:Compute', 'mi:Compute/Create Compute', 'mi:Compute/Create Compute/Simulation Run...'], null)].map((x) => Object.assign(x, { g: 'Yaratma ve ayar' }))
      .concat([T('Compute Progress', 'dlg:ilerleme', ['tb:compute'], null), T('Global Summary Results', 'dlg:gozet', ['tb:gsum'], null), T('Element Graph', 'dlg:grafik', ['harita:el:Junction-2', 'tb:graph'], null),
        T('Summary Table', 'dlg:ozet', ['harita:el:Junction-2', 'tb:esum'], null), T('Time-Series Results', 'dlg:tablo', ['harita:el:Stump Creek', 'tb:tstable'], null)].map((x) => Object.assign(x, { g: 'Sonuç' }))) },
  ];
  KESIF.forEach((c) => c.ogeler.forEach((o) => { if (!AC[o.k]) console.error(`Keşif: açıklaması olmayan parça ${o.k}`); }));

  window.OKUL = { AC, ODEV, IMG, KESIF };
})();
