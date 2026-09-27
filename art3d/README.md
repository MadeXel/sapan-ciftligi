# 3D sahne varlıkları

Ev, ahır, yel değirmeni, ağaç ve çit three.js ile **gerçek 3D** modellenir; gündüz / akşam / gece ışığında render alınıp `img/` klasörüne hafif WebP olarak yazılır. Oyun çalışırken 3D motor yoktur, sadece bu görseller kullanılır.

## Stil kilidi
`style.js` tek doğruluk kaynağıdır: kamera açısı ve ölçeği, güneş yönü, kenar ışığı, gölge, malzeme ve renk paleti. **Revizyonlarda modeller değişir, bu dosya değişmez.** Böylece her yeni versiyonda ışık, malzeme ve kadraj önceki varlıklarla birebir tutarlı kalır. Stili bilerek değiştirmek gerekiyorsa tüm varlıklar birlikte yeniden render alınır.

## Yeniden render
```bash
cd art3d && npm install
pip install playwright pillow && python -m playwright install chromium
python render.py        # img/*.webp ve meta.json üretir
```
Sonra `meta.json` içeriğini `index.html` içindeki `const ART=` satırına yapıştır (bağlantı noktaları: zemin, baca, değirmen mili, ahır kapısı).

## Karakterler, ağıl ve ikonlar (3d dalı)
- `animals.js`: 12 peluş karakter (civcivden balinaya + tek boynuz). Her biri uyanık ve gözü kapalı olarak render alınır; gözü kapalı hâl hem gece uykusu hem de göz kırpma animasyonu için kullanılır.
- `pen.js`: temaya göre 3D ağıl (zemin + çit) ve üstte kalan çit katmanı.
- `icons.js`: altın yumurta, sepet, parşömen, kitap, kupa.
- Karakterler `style.js` içindeki `TOKEN` kadrajı ve `TOKEN_LIGHT` stüdyo ışığıyla çekilir: fizik yarıçapı = 1 birim, kadraj ±1.42. Böylece görsel ile çarpışma çemberi birebir örtüşür.

```bash
python render_cast.py     # img/cast/*.webp
python render_extras.py   # img/pen/*.webp, img/ui/*.webp
```
