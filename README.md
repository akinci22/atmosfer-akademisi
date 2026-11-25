# Atmosfer Akademisi

İTÜ meteoroloji dersleri için etkileşimli çalışma alanı. Yayın: https://akinci22.github.io/atmosfer-akademisi/

- Kök `index.html` — Atmosfer Akademisi'nin kendisi: derlenmiş uygulamanın index'i + `<base href="akademi/">` (`tools/kok_yayin.mjs` üretir; her yayında yeniden). Müfredat haritası, ders ders hafta hafta yol, konular, ders kartları, laboratuvar (simülasyon, kavram, ispat, 3B, dikey kesit, denklem), ansiklopedi, kod atölyesi, havacılık, kaynaklar, canlı atmosfer, kariyer; soru çözümü, sınav atölyesi, Araştırma ve Defterler girişleri ana sayfada.
- `akademi/` — uygulamanın derleme dosyaları (ayrı depoda `vite build` çıktısı); `akademi/index.html` eski `/akademi/#/…` adreslerini hash'i koruyarak köke yönlendirir.
- `harita-okulu/` — MTO 302E Hava Analizi ve Öngörü (ayrı depoda derlenir, `node tools/paketle.mjs` çıktısı)
- `sinoptik-brifing/`, `hava-analizi-proje-rehberi/` — MTO 302E
- `bulut-fizigi-rehberi/` — MTO 229E · `hec-hms/`, `hidrometeoroloji-quiz/` — MTO 316 · `cfd-temelleri/` — MTO 303E
- `ders-kitapligi/`, `soru-cozum/` — soru çözümleri ve sınav atölyeleri · `arastirma/` — Araştırma ve Defterler · `cbs/` — MTO 388
