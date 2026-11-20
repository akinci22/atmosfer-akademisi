// Sinoptik soru çözümleri — veri (icerik.py'den js_uret.py üretir; elle düzenleme yapma).
// Sorular kendi cümlelerimizle; şekiller sorular.js'te kendi SVG çizimimiz.
window.SORU_VERI = {
 "KAT": [
  {
   "id": "yer",
   "ad": "Yer basıncı",
   "baslik": "İzobar, merkez, yer rüzgârı"
  },
  {
   "id": "ust",
   "ad": "500 hPa akışı",
   "baslik": "Kontur, trof, sırt, jeostrofik rüzgâr"
  },
  {
   "id": "adv",
   "ad": "Sıcaklık adveksiyonu",
   "baslik": "Rüzgâr izotermi kesiyor mu?"
  },
  {
   "id": "dusey",
   "ad": "Düşey yapı",
   "baslik": "Kalınlık, çekirdek, eksen eğimi"
  }
 ],
 "S": [
  {
   "id": "s1",
   "no": 1,
   "kat": "yer",
   "tur": "Çiz + yorumla",
   "ad": "İzobar analizi",
   "ne": "Bir istasyon ağında eş basınç çizgilerini basit orantıyla yerleştirmek.",
   "soru": [
    "5 × 5 istasyonlu bir deniz seviyesi basınç haritası veriliyor (değerler şekilde).",
    "a) 1016, 1020 ve 1024 hPa izobarlarını çiz, değerlerini üstlerine yaz.",
    "b) Merkezdeki sisteme H ya da L de; izobarların en sık olduğu bir bölgeyi işaretle."
   ],
   "kural": "Bir izobar iki istasyonun arasından, değerlerin oranına göre geçer: fark ne kadar büyükse çizgi o istasyona o kadar uzak düşer.",
   "tablo": null,
   "adim": [
    {
     "ad": "Merkezi bul",
     "m": [
      "En büyük değer ortada: 1027,0 hPa.",
      "Her yöne doğru değerler azalıyor → merkez yüksek basınç: <b>H</b>."
     ]
    },
    {
     "ad": "Orantı kuralını kur",
     "m": [
      "Çizginin yeri: x = (p − p₁) / (p₂ − p₁) × aralık.",
      "Önce her istasyon satırında geçiş noktalarını işaretle (✕), sonra noktaları yumuşak bir eğriyle birleştir."
     ]
    },
    {
     "ad": "1024 hPa",
     "m": [
      "Orta satırda tam 1024,0 istasyonlarının üstünden geçer.",
      "İkinci ve dördüncü satırda 1022,5 ile 1025,5'in tam ortasında: (1024 − 1022,5) / 3 = 0,5.",
      "Orta sütunda 1021,0'dan 1025,5'e giderken 3 / 4,5 = 2/3 yolda.",
      "Sonuç: merkezi saran, kuzey-güney uzun kapalı bir elips."
     ]
    },
    {
     "ad": "1020 hPa",
     "m": [
      "Orta satır: 1015,0 → 1024,0 arasında (1020 − 1015) / 9 = 0,56 aralık içeride.",
      "İkinci ve dördüncü satır: (1020 − 1013,5) / 9 = 0,72.",
      "İlk ve son satır: 1018,0 → 1021,0 arasında 2/3 yolda.",
      "Kuzey ve güney kenarda haritadan çıkar: harita içinde açık yay."
     ]
    },
    {
     "ad": "1016 hPa",
     "m": [
      "Orta satır: (1016 − 1015) / 9 = 0,11 → kenar istasyonuna çok yakın.",
      "İkinci ve dördüncü satır: 2,5 / 9 = 0,28; ilk ve son satır: 7 / 9 = 0,78.",
      "Batıda ve doğuda birer yay; harita içinde kapanmaz."
     ]
    },
    {
     "ad": "Sık bölgeyi seç",
     "m": [
      "Doğu-batı yönünde komşu istasyon farkı 9 hPa, kuzey-güney yönünde en çok 4,5 hPa.",
      "Fark büyük → izobarlar sık → basınç gradyanı ve rüzgâr güçlü.",
      "Doğu (ya da batı) kanatta 1024,0 ile 1015,0 arası işaretlenir."
     ]
    }
   ],
   "cevap": [
    "Merkez H (1027 hPa).",
    "1024 kapalı elips; 1020 ve 1016 kuzey-güney uzanan yaylar.",
    "Sık bölge: doğu ya da batı kanat (fark 9 hPa)."
   ],
   "formul": {
    "duz": "x = (p − p₁) / (p₂ − p₁) · Δx",
    "terim": [
     [
      "x",
      "izobarın p₁ istasyonundan uzaklığı"
     ],
     [
      "p",
      "çizilecek izobar (hPa)"
     ],
     [
      "p₁, p₂",
      "komşu iki istasyonun basıncı (hPa)"
     ],
     [
      "Δx",
      "iki istasyon arası mesafe (1 aralık)"
     ]
    ]
   },
   "ornek": "1020 hPa, orta satır, batı: x = (1020 − 1015) / (1024 − 1015) = 5/9 ≈ 0,56 aralık.",
   "sinav": "Merkez 1027 hPa → H. İzobar yeri basit orantıyla. Doğu-batıda fark 9 hPa, kuzey-güneyde 4,5 hPa → izobarlar doğu ve batı kanatta sık, rüzgâr orada güçlü.",
   "tr": "Merkez bir yüksek basınç; izobarlar doğu ve batı kanatta sık, orada rüzgâr en güçlü.",
   "en": "The centre is a <u>high</u>; the <u>isobars</u> are closest on the east and west flanks, where the wind is strongest.",
   "hata": [
    "İzobarı her istasyonun üstünden geçirmeye zorlamak.",
    "1016'yı harita içinde kapatmaya çalışmak.",
    "Sık bölgeyi değerler en büyük yerde sanmak: sıklığı fark belirler."
   ],
   "oz": "İzobar = basit orantı; en büyük değer H; değer en hızlı nerede değişiyorsa izobar orada sık."
  },
  {
   "id": "s2",
   "no": 2,
   "kat": "yer",
   "tur": "Çiz + yorumla",
   "ad": "Yer basınç sistemleri",
   "ne": "Yerde rüzgârın alçak ve yüksek çevresinde nasıl döndüğünü ve merkezde havanın yükselip çöktüğünü göstermek.",
   "soru": [
    "İki kapalı izobar sistemi: A'da dıştan içe 1020 → 1028 → 1036 hPa; B'de 1012 → 1004 → 996 hPa.",
    "a) Merkezlere H ya da L yaz; her sistemin çevresine dört yer rüzgârı oku çiz.",
    "b) Yerdeki akış CONV mu DIV mi? Merkezden alınan kesitte düşey hareketi okla göster."
   ],
   "kural": "Yerde sürtünme rüzgârı yavaşlatır; rüzgâr izobarlara paralel kalamaz, alçak basınç tarafına doğru açıyla keser.",
   "tablo": null,
   "adim": [
    {
     "ad": "Merkezleri adlandır",
     "m": [
      "A'da değer içe doğru artıyor → <b>H</b>.",
      "B'de içe doğru azalıyor → <b>L</b>."
     ]
    },
    {
     "ad": "Dönüş yönü",
     "m": [
      "Kuzey Yarımküre: H çevresinde saat yönünde, L çevresinde saat yönünün tersine.",
      "Yukarıda (sürtünmesiz) bu dönüş izobarlara tam paraleldir."
     ]
    },
    {
     "ad": "Sürtünme açısı",
     "m": [
      "Yer yakınında rüzgâr yavaşlar → Coriolis zayıflar → basınç gradyan kuvveti ağır basar.",
      "Oklar izobarı alçak tarafa doğru keser: H'de dışa, L'de içe.",
      "Kesme açısı denizde küçük, karada daha büyüktür."
     ]
    },
    {
     "ad": "CONV / DIV",
     "m": [
      "A: hava merkezden dışa yayılıyor → <b>DIV</b> (ıraksama).",
      "B: hava merkeze toplanıyor → <b>CONV</b> (yakınsama)."
     ]
    },
    {
     "ad": "Düşey hareket",
     "m": [
      "Kütle korunur: yerde dışa giden havanın yerini yukarıdan inen doldurur → A'da çökme ↓ (ısınır, kurur, açık hava).",
      "B'de içe toplanan hava yukarı kaçar → yükselme ↑ (soğur, bulut ve yağış)."
     ]
    }
   ],
   "cevap": [
    "A: H · saat yönünde ve dışa · DIV · merkezde çökme ↓",
    "B: L · saat yönünün tersine ve içe · CONV · merkezde yükselme ↑"
   ],
   "formul": null,
   "ornek": "",
   "sinav": "A = H: saat yönünde, dışa doğru, DIV, çökme. B = L: saat yönünün tersine, içe doğru, CONV, yükselme. Neden: sürtünme rüzgârı alçağa doğru saptırır; kütle korunumu düşey hareketi verir.",
   "tr": "Yerde alçağın çevresinde rüzgâr içe doğru döner, hava toplanır ve yükselir.",
   "en": "Around a surface low the wind <u>spirals inward</u>; the air <u>converges</u> and rises.",
   "hata": [
    "Yer rüzgârını izobara tam paralel çizmek (o 500 hPa için doğru).",
    "Güney Yarımküre dönüş yönünü kullanmak.",
    "CONV'u çökmeyle eşlemek: yerde CONV = yükselme."
   ],
   "oz": "Yerde L: içe + yukarı + bulut; H: dışa + aşağı + açık hava."
  },
  {
   "id": "s3",
   "no": 3,
   "kat": "ust",
   "tur": "Çiz + yorumla",
   "ad": "Trof ve sırt eksenleri",
   "ne": "500 hPa dalgasında trof ve sırt eksenini bulmak, rüzgârı ve yağış bölgesini okumak.",
   "soru": [
    "500 hPa'da 534–558 dam konturları batıda kuzeye kabarıyor, doğuda güneye sarkıyor.",
    "P ve Q 552 dam konturu üzerinde: P çukurun batısında, Q doğusunda.",
    "a) Trof eksenini kesik, sırt eksenini noktalı çizgiyle çiz ve adlandır.",
    "b) P ve Q'da rüzgâr okunu çiz.  c) Yağış için hangisi daha elverişli?"
   ],
   "kural": "Trof: konturların en güneye sarktığı yer (düşük değerler güneye uzanır). Sırt: en kuzeye kabardığı yer. Eksen, her konturun en çok büküldüğü noktadan geçer.",
   "tablo": null,
   "adim": [
    {
     "ad": "Yönü oku",
     "m": [
      "Kuzeyde 534, güneyde 558 dam: alçak değerler kuzeyde.",
      "Bu yüzden akış batıdan doğuya (Kuzey Yarımküre'de alçak solda kalır)."
     ]
    },
    {
     "ad": "Sırt ekseni",
     "m": [
      "Her konturun en kuzey noktasını işaretle (batı kısım).",
      "Noktaları birleştir → noktalı çizgi, adı SIRT."
     ]
    },
    {
     "ad": "Trof ekseni",
     "m": [
      "Her konturun en güney noktasını işaretle (doğu kısım).",
      "Birleştir → kesik çizgi, adı TROF.",
      "Tepe noktaları konturdan kontura biraz kayıyorsa eksen eğik çıkar; bu normaldir."
     ]
    },
    {
     "ad": "P ve Q'da rüzgâr",
     "m": [
      "500 hPa'da sürtünme yok → rüzgâr konturlara paralel (jeostrofik).",
      "P'de kontur boyunca güneydoğuya, Q'da kuzeydoğuya doğru."
     ]
    },
    {
     "ad": "Neden paralel?",
     "m": [
      "Başta basınç gradyan kuvveti havayı kuzeye (alçağa) iter.",
      "Hava hızlanınca Coriolis onu sağa çevirir; doğuya dönünce Coriolis güneye, gradyan kuvveti kuzeye bakar.",
      "İki kuvvet eşitlenir → jeostrofik denge: rüzgâr konturlara paralel kalır."
     ]
    },
    {
     "ad": "Yağış: P mi Q mu?",
     "m": [
      "Trofun arkası (P): hava yavaşlar, yukarıda birikir (yakınsama) → çökme, yerde basınç artar, açık hava.",
      "Trofun önü (Q): hava hızlanır, yukarıda dağılır (ıraksama) → alttan hava yükselir, soğur → bulut ve yağış; yerde basınç düşer.",
      "Cevap: <b>Q</b>."
     ]
    }
   ],
   "cevap": [
    "Sırt batıda (noktalı), trof doğuda (kesik).",
    "P ve Q'da oklar konturlara paralel, batıdan doğuya.",
    "Yağış: Q (trofun önü)."
   ],
   "formul": null,
   "ornek": "",
   "sinav": "Sırt = konturların en kuzey noktaları, trof = en güney noktaları. Rüzgâr konturlara paralel, batıdan doğuya. Q trofun önünde: yukarıda ıraksama → yükselme → bulut ve yağış.",
   "tr": "Trofun önünde yukarıdaki hava dağılır, alttan hava yükselir ve yağış oluşur.",
   "en": "Ahead of the <u>trough</u> the air aloft <u>diverges</u>, so air rises from below and rain forms.",
   "hata": [
    "Ekseni kontur boyunca çizmek: eksen konturları keser.",
    "Rüzgârı konturlara dik çizmek.",
    "Trofun arkasını yağışlı sanmak."
   ],
   "oz": "Trofun önü = ıraksama + yükselme = yağış; arkası = yakınsama + çökme = açık hava."
  },
  {
   "id": "s5",
   "no": 5,
   "kat": "dusey",
   "tur": "Çiz + hesapla",
   "ad": "Sıcak ve soğuk çekirdek",
   "ne": "Basınç yüzeylerinin düşey kesitinden ve kalınlıktan sistemin çekirdeğini bulmak.",
   "soru": [
    "Düşey kesit: A'da 950 hPa yüzeyi merkezde çukurlaşıyor, 700 ve 500 kabarıyor; B'de tersi.",
    "a) Merkezde 950 ve 500 hPa için L ya da H yaz.",
    "b) 850–500 kalınlığını merkezde ve kenarda okla göster; çekirdek W mi C mi?",
    "c) Tablodaki dört sistem için kalınlığı (Z500 − Z850) hesapla, çekirdeği bul."
   ],
   "kural": "Sıcak hava genleşir, aynı basınç aralığı daha kalın bir tabaka kaplar. Merkezde kalınlık kenardan büyükse çekirdek sıcak (W), küçükse soğuk (C).",
   "tablo": [
    [
     "Sistem",
     "Yerde",
     "Z850 merkez / kenar",
     "Z500 merkez / kenar"
    ],
    [
     "S1",
     "H",
     "1560 / 1500 m",
     "5280 / 5460 m"
    ],
    [
     "S2",
     "L",
     "1440 / 1500 m",
     "5900 / 5820 m"
    ],
    [
     "S3",
     "L",
     "1260 / 1500 m",
     "5160 / 5520 m"
    ],
    [
     "S4",
     "H",
     "1620 / 1500 m",
     "5980 / 5820 m"
    ]
   ],
   "adim": [
    {
     "ad": "Yüzey iniyor = L",
     "m": [
      "Bir basınç yüzeyi merkezde aşağı iniyorsa aynı yükseklikte merkezin basıncı kenardan düşük → L.",
      "Yukarı çıkıyorsa → H."
     ]
    },
    {
     "ad": "A ve B'yi oku",
     "m": [
      "A: 950 aşağı → yerde <b>L</b>; 500 yukarı → yukarıda <b>H</b>.",
      "B: 950 yukarı → yerde <b>H</b>; 500 aşağı → yukarıda <b>L</b>."
     ]
    },
    {
     "ad": "Kalınlık okları",
     "m": [
      "850 ile 500 arasını merkezde ve kenarda ölç.",
      "A: merkez oku uzun → tabaka merkezde kalın → <b>W</b> (sıcak çekirdekli alçak).",
      "B: merkez oku kısa → tabaka merkezde ince → <b>C</b> (soğuk çekirdekli yüksek)."
     ]
    },
    {
     "ad": "Tablo: S1 ve S2",
     "m": [
      "S1: merkez 5280 − 1560 = 3720 m, kenar 5460 − 1500 = 3960 m → ince → <b>C</b>; yerde H → soğuk çekirdekli yüksek (kışın Sibirya yükseği).",
      "S2: 5900 − 1440 = 4460 m, kenar 4320 m → kalın → <b>W</b>; yerde L → sıcak çekirdekli (termik) alçak (yazın Basra alçağı)."
     ]
    },
    {
     "ad": "Tablo: S3 ve S4",
     "m": [
      "S3: 5160 − 1260 = 3900 m, kenar 4020 m → <b>C</b>; yerde L → soğuk çekirdekli alçak (İzlanda alçağı).",
      "S4: 5980 − 1620 = 4360 m, kenar 4320 m → <b>W</b>; yerde H → sıcak çekirdekli yüksek (Azor yükseği)."
     ]
    },
    {
     "ad": "Yükseklikle ne olur?",
     "m": [
      "Sıcak çekirdekli alçak yukarıda zayıflar, 500 hPa'da yükseğe döner (sığ sistem).",
      "Soğuk çekirdekli yüksek yukarıda alçağa döner; soğuk çekirdekli alçak ve sıcak çekirdekli yüksek yükseklikle güçlenir.",
      "Tablo da bunu söylüyor: S1 ve S3'te 500 hPa merkezi alçak, S2 ve S4'te yüksek."
     ]
    }
   ],
   "cevap": [
    "A: 950 L · 500 H · W (sıcak çekirdekli alçak).",
    "B: 950 H · 500 L · C (soğuk çekirdekli yüksek).",
    "S1 3720/3960 C · S2 4460/4320 W · S3 3900/4020 C · S4 4360/4320 W."
   ],
   "formul": {
    "duz": "ΔZ = Z500 − Z850 = (R_d · T̄ / g) · ln(850 / 500)",
    "terim": [
     [
      "ΔZ",
      "850–500 hPa kalınlığı (m)"
     ],
     [
      "R_d",
      "kuru hava gaz sabiti, 287 J kg⁻¹ K⁻¹"
     ],
     [
      "T̄",
      "tabakanın ortalama sıcaklığı (K)"
     ],
     [
      "g",
      "yerçekimi ivmesi, 9,81 m s⁻²"
     ]
    ]
   },
   "ornek": "T̄ = 260 K → ΔZ ≈ 4040 m. S1'in merkezi (3720 m) ≈ 240 K, S2'nin merkezi (4460 m) ≈ 287 K: kalınlık doğrudan sıcaklığı söyler.",
   "sinav": "Kalınlık = Z500 − Z850; merkezde büyükse W, küçükse C. A: 950 L, 500 H, W. B: 950 H, 500 L, C. S1 C (Sibirya), S2 W (Basra), S3 C (İzlanda), S4 W (Azor).",
   "tr": "Sıcak hava genleştiği için sıcak çekirdeğin üstünde tabaka daha kalındır.",
   "en": "Warm air expands, so the layer is <u>thicker</u> over a <u>warm core</u>.",
   "hata": [
    "Kalınlığı Z850 − Z500 diye ters çıkarmak.",
    "Yerdeki L/H'yi çekirdekle karıştırmak: L sıcak da olabilir soğuk da.",
    "Merkez ile kenarı karıştırmak."
   ],
   "oz": "Çekirdeği yerdeki basınç değil kalınlık söyler: merkezde kalın = W, ince = C."
  },
  {
   "id": "s6",
   "no": 6,
   "kat": "adv",
   "tur": "Çiz + hesapla",
   "ad": "Sıcaklık adveksiyonunun yönü",
   "ne": "Rüzgârın P noktasına sıcak mı soğuk mu hava taşıdığını bulmak ve değişimi hesaplamak.",
   "soru": [
    "850 hPa'da dört panel: izotermler kuzey-güney uzanıyor; batıda 0 °C, P'den geçen 4 °C, doğuda 8 °C.",
    "Rüzgâr A'da batıdan, B'de doğudan, C'de güneyden (izoterme paralel), D'de güneybatıdan.",
    "a) P'ye gelen havanın şu anki yerini S ile işaretle.  b) Adveksiyon W/C/0, değişim +/−/0.",
    "c) A'da rüzgâr 10 m/s, iki izoterm arası (4 °C) 200 km: P 6 saatte kaç derece değişir?"
   ],
   "kural": "Adveksiyon = havanın rüzgârla yatay taşınması. Rüzgâr soğuk yerden geliyorsa soğuk adveksiyon (sıcaklık düşer), sıcak yerden geliyorsa sıcak adveksiyon (artar), izoterme paralelse yok.",
   "tablo": null,
   "adim": [
    {
     "ad": "S'yi bul",
     "m": [
      "Oku tersine izle: S, P'nin rüzgâr yönünde gerisinde (okun kuyruğunda).",
      "S'deki sıcaklık birazdan P'ye gelecek."
     ]
    },
    {
     "ad": "A ve B",
     "m": [
      "A: rüzgâr batıdan → S batıda, 0–4 °C arası → <b>C</b>, <b>−</b>.",
      "B: rüzgâr doğudan → S doğuda, 4–8 °C arası → <b>W</b>, <b>+</b>."
     ]
    },
    {
     "ad": "C ve D",
     "m": [
      "C: rüzgâr izotermle aynı doğrultuda → S de 4 °C'de → <b>0</b>, <b>0</b>.",
      "D: rüzgâr güneybatıdan → S soğuk tarafta → <b>C</b>, <b>−</b>; izotermi 45° ile kestiği için etkisi A'dakinin ≈ %71'i (cos 45°)."
     ]
    },
    {
     "ad": "Hesap (A)",
     "m": [
      "Gradyan: 4 °C / 200 000 m = 2 × 10⁻⁵ °C/m.",
      "10 m/s × 2 × 10⁻⁵ °C/m = 2 × 10⁻⁴ °C/s.",
      "× 3600 s = 0,72 °C/saat → × 6 saat = 4,32 ≈ <b>4,3 °C düşüş</b>."
     ]
    },
    {
     "ad": "Varsayımlar",
     "m": [
      "Rüzgâr ve gradyan 6 saat boyunca aynı kalıyor.",
      "Güneşle ısınma, bulut, düşey hareket gibi başka etkiler yok sayılıyor."
     ]
    }
   ],
   "cevap": [
    "A: S batıda · C · −",
    "B: S doğuda · W · +",
    "C: S güneyde · 0 · 0",
    "D: S güneybatıda · C · −",
    "c) ≈ 4,3 °C düşüş (6 saatte)."
   ],
   "formul": {
    "duz": "(∂T/∂t)adv = −u · ΔT / Δx",
    "terim": [
     [
      "u",
      "izotermlere dik rüzgâr bileşeni (m/s)"
     ],
     [
      "ΔT / Δx",
      "sıcaklık gradyanı (°C/m)"
     ],
     [
      "eksi işareti",
      "rüzgâr soğuktan sıcağa eserse sıcaklık düşer"
     ]
    ]
   },
   "ornek": "−10 × 4 / 200 000 = −2 × 10⁻⁴ °C/s → 6 saatte −4,32 °C.",
   "sinav": "Okun kuyruğundaki S soğuksa C (−), sıcaksa W (+), aynı izotermdeyse 0. A: C −, B: W +, C: 0 0, D: C −. Hesap: 10 × 4 / 200 000 = 2 × 10⁻⁴ °C/s ≈ 0,72 °C/sa → 6 saatte ≈ −4,3 °C.",
   "tr": "Rüzgâr soğuk taraftan estiği için P'de sıcaklık düşüyor: soğuk adveksiyon.",
   "en": "The wind blows from the colder side, so the temperature at P falls: <u>cold advection</u>.",
   "hata": [
    "S'yi okun ucuna koymak: S okun kuyruğundadır.",
    "km'yi m'ye çevirmeyi unutmak.",
    "Paralel rüzgârda da adveksiyon var sanmak."
   ],
   "oz": "Okun kuyruğuna bak: oradaki sıcaklık P'ye gelecek. Hız × gradyan = değişim hızı."
  },
  {
   "id": "s7",
   "no": 7,
   "kat": "adv",
   "tur": "Çiz + yorumla",
   "ad": "Kontur ve izotermden adveksiyon",
   "ne": "500 hPa'da konturların izotermleri kestiği yerde sıcak ya da soğuk adveksiyonu okumak.",
   "soru": [
    "500 hPa'da 552, 558, 564 dam konturları ortada kuzeye kabaran bir sırt çiziyor.",
    "Kesik izotermler doğu-batı düz: kuzeyde −24, sonra −18, −12, güneyde −6 °C.",
    "P sırtın batı yamacında, R tepede, Q doğu yamacında (üçü de 558 konturunda).",
    "a) P, R ve Q'da rüzgâr okunu çiz.  b) Her nokta için W, C ya da 0 yaz."
   ],
   "kural": "Üst seviyede rüzgâr konturları izler. Konturlar izotermleri kesiyorsa rüzgâr sıcak ya da soğuk hava taşır: adveksiyon var.",
   "tablo": null,
   "adim": [
    {
     "ad": "Rüzgâr yönü",
     "m": [
      "Alçak değerler kuzeyde → rüzgâr konturlara paralel, batıdan doğuya.",
      "P'de kontur kuzeydoğuya tırmanıyor, R'de yatay, Q'da güneydoğuya iniyor."
     ]
    },
    {
     "ad": "P",
     "m": [
      "Rüzgâr güneybatıdan → hava güneydeki daha sıcak izotermlerden geliyor.",
      "→ <b>W</b> (sıcak adveksiyon)."
     ]
    },
    {
     "ad": "R",
     "m": [
      "Tepe noktasında kontur izoterme paralel → rüzgâr izotermi kesmiyor.",
      "→ <b>0</b>."
     ]
    },
    {
     "ad": "Q",
     "m": [
      "Rüzgâr kuzeybatıdan → kuzeydeki soğuk havayı getiriyor.",
      "→ <b>C</b> (soğuk adveksiyon)."
     ]
    },
    {
     "ad": "Genel kural",
     "m": [
      "Kesme açısı büyüdükçe ve izotermler sıklaştıkça adveksiyon güçlenir.",
      "Kontur izotermi kesiyorsa sistem baroklinik demektir (bkz. Soru 9)."
     ]
    }
   ],
   "cevap": [
    "P: W (güneybatıdan ılık hava)",
    "R: 0 (akış izoterme paralel)",
    "Q: C (kuzeybatıdan soğuk hava)"
   ],
   "formul": null,
   "ornek": "",
   "sinav": "P: W, güneyden ılık hava geliyor. R: 0, akış izoterme paralel. Q: C, kuzeyden soğuk hava geliyor. Kural: kontur izotermi kesiyorsa adveksiyon var.",
   "tr": "Konturların izotermleri kestiği yerde rüzgâr sıcak ya da soğuk hava taşır.",
   "en": "Where the <u>contours</u> cross the <u>isotherms</u>, the wind carries warm or cold air.",
   "hata": [
    "Rüzgârı izotermlere paralel çizmek: rüzgâr konturu izler.",
    "R'de de adveksiyon var sanmak.",
    "P'deki hava yönünü okun ucuna göre okumak."
   ],
   "oz": "Kontur izotermi kesiyorsa adveksiyon var; okun geldiği yer sıcaksa W, soğuksa C."
  },
  {
   "id": "s8",
   "no": 8,
   "kat": "adv",
   "tur": "Çiz + hesapla",
   "ad": "İzotermleri rüzgârla taşıma",
   "ne": "Düzgün rüzgârda sıcaklık alanını öteleyip P'nin gelecekteki sıcaklığını bulmak.",
   "soru": [
    "Kareli eksende (x doğu, y kuzey) üç izoterm: 14 °C (0,2)→(4,0), 10 °C (0,4)→(6,1), 6 °C (0,6)→(6,3). P (3,2)'de.",
    "Kuzeydoğulu rüzgâr Δt sürede alanı bir kare batıya, bir kare güneye taşıyor.",
    "a) Yeni izotermleri kesik çizgiyle çiz.",
    "b) P'ye gelecek havanın şimdiki yerini S ile işaretle; P'nin şimdiki ve Δt sonraki sıcaklığını yaz, + ya da −."
   ],
   "kural": "Rüzgâr her yerde aynıysa sıcaklık alanı bütünüyle rüzgârla taşınır. P'ye gelecek sıcaklık, şu anda P'nin rüzgâr yönünde gerisindeki noktanın sıcaklığıdır.",
   "tablo": null,
   "adim": [
    {
     "ad": "P'nin şimdiki sıcaklığı",
     "m": [
      "x = 3'te 14 °C çizgisi y = 0,5'te, 10 °C çizgisi y = 2,5'te.",
      "P (y = 2) bu aralığın 3/4'ünde → 14 − 3 = <b>11 °C</b>."
     ]
    },
    {
     "ad": "Yeni izotermler",
     "m": [
      "Her noktayı bir kare batıya ve bir kare güneye taşı: (x, y) → (x − 1, y − 1).",
      "14 °C: (0; 0,5)→(1; 0) · 10 °C: (0; 2,5)→(5; 0) · 6 °C: (0; 4,5)→(6; 1,5). Kesik çizgiyle çiz."
     ]
    },
    {
     "ad": "S'yi bul",
     "m": [
      "Rüzgârın tersine git: bir kare doğu, bir kare kuzey → S = (4, 3).",
      "x = 4'te 10 °C çizgisi y = 2'de, 6 °C çizgisi y = 4'te; S tam ortada → <b>8 °C</b>."
     ]
    },
    {
     "ad": "Değişim",
     "m": [
      "Δt sonra P'de 8 °C (yeni kesik izotermlerde de P, 10 ile 6 °C'nin ortasında).",
      "8 − 11 = −3 °C → <b>−</b>: kuzeydoğudan soğuk hava geliyor, soğuk adveksiyon."
     ]
    }
   ],
   "cevap": [
    "S = (4, 3), 8 °C.",
    "P: şimdi 11 °C → Δt sonra 8 °C, ΔT = −3 °C (−)."
   ],
   "formul": {
    "duz": "T(P, t + Δt) = T(S, t)  ·  S = P − V·Δt",
    "terim": [
     [
      "T(P, t+Δt)",
      "P'nin Δt sonraki sıcaklığı"
     ],
     [
      "T(S, t)",
      "S'nin şimdiki sıcaklığı"
     ],
     [
      "V⃗ Δt",
      "havanın Δt'de aldığı yol (burada bir kare batı + bir kare güney)"
     ]
    ]
   },
   "ornek": "Alan T = 18 − x − 2y biçiminde: P(3,2) → 11 °C, S(4,3) → 8 °C.",
   "sinav": "S = P'den rüzgârın tersine bir kare doğu + bir kare kuzey = (4,3), 8 °C. P: şimdi 11 °C, Δt sonra 8 °C, ΔT = −3 °C → soğuk adveksiyon.",
   "tr": "Rüzgâr düzgünse sıcaklık alanı bütünüyle rüzgârla taşınır; S'deki hava Δt sonra P'de olur.",
   "en": "If the wind is uniform, the whole temperature field is <u>carried downstream</u>; the air now at S reaches P after Δt.",
   "hata": [
    "Kuzeydoğulu rüzgârı kuzeydoğuya esen sanmak: rüzgâr adı geldiği yönü söyler.",
    "S'yi P'nin güneybatısına koymak.",
    "İzotermleri ters yöne taşımak."
   ],
   "oz": "Rüzgâr adı geldiği yönü söyler. P'nin geleceği = S'nin bugünü."
  },
  {
   "id": "s9",
   "no": 9,
   "kat": "dusey",
   "tur": "Çiz + yorumla",
   "ad": "Barotropik ve baroklinik",
   "ne": "Aynı alçağın iki sıcaklık alanıyla modelini adlandırmak: konturlar izotermleri kesiyor mu?",
   "soru": [
    "500 hPa'da kapalı bir alçak (540, 546, 552 dam), iki ayrı sıcaklık alanıyla.",
    "A: izotermler doğu-batı düz (kuzeyde −24, ortada −18, güneyde −12 °C). B: izotermler konturlara paralel daireler (içte −30, −24, dışta −18 °C).",
    "W ve E noktaları merkezin batısında ve doğusunda.",
    "a) W ve E'de rüzgâr okunu çiz, adveksiyonu W, C ya da 0 yaz.  b) Modelin adı: eşdeğer barotropik mi baroklinik mi?"
   ],
   "kural": "Konturlar ile izotermler paralelse adveksiyon yok: eşdeğer barotropik model, yavaş hareket eder. Birbirini kesiyorlarsa adveksiyon var: baroklinik model, hareket eder, çoğu kez cephe taşır.",
   "tablo": null,
   "adim": [
    {
     "ad": "Dönüş",
     "m": [
      "Alçak çevresinde Kuzey Yarımküre'de saat yönünün tersine dolaşım.",
      "Batı kenarda (W) rüzgâr kuzeyden güneye, doğu kenarda (E) güneyden kuzeye."
     ]
    },
    {
     "ad": "A: W ve E",
     "m": [
      "W noktasına hava kuzeyden, −24 °C tarafından gelir → <b>C</b>.",
      "E noktasına güneyden, −12 °C tarafından gelir → <b>W</b>."
     ]
    },
    {
     "ad": "A'nın adı",
     "m": [
      "Konturlar izotermleri kesiyor → adveksiyon var → <b>baroklinik</b>.",
      "Sistem hareket eder ve gelişir; genellikle cephe taşır."
     ]
    },
    {
     "ad": "B",
     "m": [
      "Rüzgâr dairesel izotermler boyunca eser, kesmez → W'de <b>0</b>, E'de <b>0</b>.",
      "→ <b>eşdeğer barotropik</b>: yavaş, çoğu kez yerinde sayan sistem (kesik alçak gibi); ekseni düşey."
     ]
    }
   ],
   "cevap": [
    "A: W noktası C, E noktası W → baroklinik.",
    "B: W noktası 0, E noktası 0 → eşdeğer barotropik."
   ],
   "formul": null,
   "ornek": "",
   "sinav": "A: W'de C (kuzeyden soğuk), E'de W (güneyden ılık) → baroklinik. B: W'de 0, E'de 0 (izoterm konturla paralel) → eşdeğer barotropik.",
   "tr": "Eşdeğer barotropik sistemde izotermler konturlara paraleldir, bu yüzden adveksiyon yoktur.",
   "en": "In an <u>equivalent barotropic</u> system the isotherms are parallel to the contours, so there is no advection.",
   "hata": [
    "Alçağın çevresinde saat yönünde dönüş çizmek.",
    "Batıdaki W noktasını W (sıcak) cevabıyla karıştırmak.",
    "Barotropik sistemin de cephe taşıdığını sanmak."
   ],
   "oz": "Kontur izotermi kesiyor = baroklinik (adveksiyon, hareket, cephe); paralel = eşdeğer barotropik."
  },
  {
   "id": "s10",
   "no": 10,
   "kat": "dusey",
   "tur": "Bul + yorumla",
   "ad": "Sistemin düşey ekseni",
   "ne": "Üç seviyedeki alçak merkezlerini birleştirip eksenin düşey mi eğik mi olduğunu söylemek.",
   "soru": [
    "Ortak bir batı-doğu hattında üç seviye, her birinde batı · orta · doğu değeri:",
    "A: 500 hPa 528 · 540 · 552 dam; 850 hPa 147 · 141 · 147 dam; yerde 1012 · 1008 · 996 hPa.",
    "B: 500 hPa 546 · 534 · 546 dam; 850 hPa 153 · 144 · 153 dam; yerde 1010 · 998 · 1010 hPa.",
    "a) Her satırda en küçük değeri daire içine al, yanına L yaz.  b) Merkezleri birleştir: düşey mi eğik mi? Eğikse 500 hPa merkezi yerdekinin batısında mı doğusunda mı?"
   ],
   "kural": "Yerde alçağı basınca (hPa), yukarıda yüksekliğe (dam) bakarak buluruz; ikisinde de en küçük değer merkezdir. Merkezleri alttan üste birleştirmek ekseni verir.",
   "tablo": null,
   "adim": [
    {
     "ad": "Merkezleri işaretle",
     "m": [
      "A: 500 → 528 (batı), 850 → 141 (orta), yer → 996 (doğu).",
      "B: 534, 144 ve 998: üçü de ortada."
     ]
    },
    {
     "ad": "Birleştir",
     "m": [
      "A: çizgi alttan üste batıya yatıyor → <b>eğik</b>; 500 hPa merkezi yerdekinin <b>batısında</b>.",
      "B: çizgi dik → <b>düşey</b>."
     ]
    },
    {
     "ad": "Neden eğik? (kalınlık)",
     "m": [
      "A'da kalınlık batıda 3810, ortada 3990, doğuda 4050 m → batı soğuk, doğu sıcak.",
      "Soğuk hava basınç yüzeylerini aşağı çeker, sıcak hava yukarı iter → yukarı çıktıkça en düşük değer soğuk tarafa (batıya) kayar.",
      "B'de batı ve doğu eşit (3930 m) → kayma yok."
     ]
    },
    {
     "ad": "Anlamı",
     "m": [
      "Batıya eğik eksen: gelişen baroklinik alçak. Üst trof yer alçağının batısında; trofun önündeki ıraksama yer alçağını derinleştirir.",
      "Düşey eksen: olgun, eşdeğer barotropik sistem; gelişme bitmiş, yavaş."
     ]
    }
   ],
   "cevap": [
    "A: L'ler 528 (batı) · 141 (orta) · 996 (doğu) → eksen eğik, 500 hPa merkezi BATIDA.",
    "B: hepsi ortada → eksen düşey."
   ],
   "formul": null,
   "ornek": "",
   "sinav": "A: L'ler 528 (W), 141 (orta), 996 (E) → eksen batıya eğik, 500 hPa merkezi yer merkezinin batısında: baroklinik, gelişen. B: hepsi ortada → eksen düşey: eşdeğer barotropik.",
   "tr": "Gelişen baroklinik alçakta eksen yükseklikle batıya eğilir; üst alçak yer alçağının batısındadır.",
   "en": "In a developing <u>baroclinic</u> low the axis <u>tilts westward</u> with height.",
   "hata": [
    "En büyük değeri merkez sanmak.",
    "Batı ile doğuyu karıştırmak: W solda, E sağda.",
    "Eğimin yönünü 500'den yere doğru okumak: eksen alttan üste okunur."
   ],
   "oz": "Merkezleri alttan üste birleştir: batıya eğik = baroklinik, gelişen; düşey = eşdeğer barotropik, olgun."
  }
 ],
 "KURAL": [
  [
   "Basınç alanını oku",
   "İzobar/kontur basit orantıyla; en büyük değer H, en küçük L.",
   "S1 · S10"
  ],
  [
   "Rüzgârı çiz",
   "Yukarıda konturlara paralel (jeostrofik); yerde sürtünmeyle alçağa doğru keser.",
   "S2 · S3 · S7 · S9"
  ],
  [
   "Düşey hareketi bul",
   "Yerde CONV → yükselme, DIV → çökme; 500 hPa'da trof önü ıraksama → yükselme.",
   "S2 · S3"
  ],
  [
   "Sıcaklık taşınımı",
   "Rüzgâr izotermi kesiyor mu? Kuyruktaki hava soğuksa C, sıcaksa W.",
   "S6 · S7 · S8"
  ],
  [
   "Düşey yapı",
   "Kalınlık çekirdeği söyler; kontur-izoterm kesişimi baroklinikliği; eksen eğimi gelişmeyi.",
   "S5 · S9 · S10"
  ]
 ],
 "HATA": [
  "Rüzgâr adını gittiği yön sanmak: kuzeydoğulu = kuzeydoğudan gelir.",
  "S noktasını okun ucuna koymak: gelecek hava okun kuyruğundadır.",
  "Yer rüzgârını izobara paralel çizmek: yerde sürtünme var, ok alçağa doğru keser.",
  "Kalınlığı ters çıkarmak: her zaman üst eksi alt (Z500 − Z850).",
  "Yerdeki L/H'yi çekirdekle karıştırmak: çekirdeği kalınlık söyler.",
  "Trofun arkasını yağışlı sanmak: yağış trofun önünde.",
  "Birim çevirmeyi unutmak: 200 km = 200 000 m; saatte 3600 s.",
  "Yer adı W/E ile cevap W (sıcak) / C (soğuk) harflerini karıştırmak."
 ]
};
