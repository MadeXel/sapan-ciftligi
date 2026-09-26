# Sapan Çiftliği

Hayvanları sapanla ağıla fırlat, aynı iki hayvan çarpışınca birleşip büyüsün. iOS ve Android'de ana ekrana eklenebilen PWA.

## Gelir ayarları

`index.html` içindeki `CONFIG` nesnesi:

| Alan | Ne işe yarar |
|---|---|
| `adsClient` | Google AdSense **H5 Games Ads** yayıncı kimliği (`ca-pub-…`). Boşken ödüllü reklam yerine deneme reklamı çıkar. |
| `adsTest` | `true` iken Google test reklamı gösterir. |
| `premiumUrl` | Stripe Payment Link. Başarılı ödeme dönüş adresi: `…/sapan-ciftligi/?premium=ok` |
| `premiumPrice` | Pazarda görünen fiyat metni. |
| `tipUrl` | Bahşiş/destek bağlantısı. |
| `interstitialEvery` | 0 = kapalı. N>0 ise her N oyunda bir geçiş reklamı (Çiftlik Sahiplerine hiç çıkmaz). |

Notlar: AdSense onayı için github.io yerine kendi alan adın gerekir. `?premium=ok` dönüşü istemci tarafında doğrulanır; ciddi satışta sunucu doğrulaması (ör. Supabase Edge Function + Stripe webhook) eklenmeli. App Store / Google Play sürümünde dijital ürünler için mağazanın kendi ödeme sistemi (IAP) ve AdMob kullanılmalı.
