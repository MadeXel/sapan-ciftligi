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

## Sıralama ve hile koruması

Supabase projesi: `sapan-ciftligi` (eu-central-1). Tablolar istemciye tamamen kapalıdır.

**Akış:** Oyun başlamadan önce `start_session` sunucudan tek kullanımlık bir oturum ve rastgele bir tohum alır. Hayvanların geliş sırası bu tohumla belirlenir. Oyun her atışı, birleşmeyi, değişimi ve ikinci şansı zaman damgasıyla kaydeder. Oyun bitince bu günlük `submit` Edge Function'ına gider. Fonksiyon oyunu `replay.js` ile baştan oynatır, puanı kendisi hesaplar ve ancak her şey tutarsa kaydeder.

**Yakalananlar:** Sıra dışı ya da uydurma hayvan, ağılda olmayan hayvanların birleşmesi, insanüstü atış hızı, gerçek süreden uzun oyun süresi, şişirilmiş puan, oturumun tekrar kullanılması, başka cihazın oturumu, birden fazla ikinci şans, aşırı büyük istek. Ayrıca oturum açmada hız sınırı ve günlük limit, isim değiştirmede günlük 10 hak, gelişmiş küfür filtresi ve engelleme (ban) var.

**Önemli:** `index.html` içindeki `pick()` ve başlangıç yerleşimi `supabase/functions/submit/replay.js` ile birebir aynı kalmalı. Birini değiştirirsen diğerini de değiştir, yoksa gerçek oyunlar reddedilir.

**Yönetim (Supabase SQL Editor):**

```sql
-- son reddedilen denemeler
select created_at, reason, detail, device_id from rejects order by created_at desc limit 50;
-- bir oyuncuyu engelle / engeli kaldır
update players set banned = true  where name = 'Kötü Niyetli';
update players set banned = false where name = 'Kötü Niyetli';
```

Sınırlama: Kurallara uygun ama bir bot tarafından "kusursuz" oynanmış oyunlar teorik olarak geçebilir; puanlar yine de gerçekten gelen hayvanlarla sınırlıdır.
