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

## Mağaza sürümü (Capacitor: iOS + Android)

Aynı `index.html` hem web'de (GitHub Pages) hem uygulamalarda çalışır. Uygulama içinde:
- Reklamlar AdMob ödüllü reklamdır (AdSense yalnızca web).
- Sıralama ve başarımlar Game Center / Google Play Games'e de gönderilir. Skor, yalnızca bizim sunucumuz doğruladıktan sonra platform tablosuna gider.
- Titreşim Haptics, paylaşım yerel paylaşım menüsü ile yapılır.
- Web ödeme bağlantıları (Stripe, bahşiş) gizlidir; mağaza kuralları dijital ürünlerde uygulama içi satın alma ister. Çiftlik Sahibi paketi için sıradaki adım: RevenueCat ile IAP.

**Gereksinimler:** Node 20+, iOS için Mac + güncel Xcode, Android için Android Studio.

```bash
npm install
npm run ios       # web dosyalarını kopyalar, senkronlar, Xcode'u açar
npm run android   # aynısı, Android Studio'yu açar
```

`index.html` her değiştiğinde `npm run sync` çalıştır.

### iOS
1. Xcode'da App hedefi > Signing & Capabilities: kendi Team'ini seç. Game Center yetkisi projede hazır (`App.entitlements`).
2. App Store Connect'te `com.madexel.sapanciftligi` paket kimliğiyle uygulamayı oluştur.
3. Game Center bölümünde `docs/magaza-kurulum.md` içindeki 2 sıralamayı ve 42 başarımı aynı kimliklerle oluştur.

### Android
1. Play Console'da oyunu oluştur, Play Games Services > Yapılandırma'dan proje kimliğini (sadece rakamlar) `android/app/src/main/res/values/strings.xml` içindeki `game_services_project_id` alanına yaz. Kimlik `0` iken Play Games kapalı kalır, uygulama yine çalışır.
2. Aynı sıralama ve başarımları oluştur, Play Console'un verdiği kimlikleri `index.html` içindeki `NCFG.gs.android` alanına yapıştır.
3. Play Games yalnızca Play test kanallarından (dahili/kapalı/açık test) yüklenen sürümde çalışır.

### AdMob
Şu an Google'ın **test** kimlikleri kullanılıyor, gerçek para gelmez. AdMob hesabını açınca:
- Uygulama kimliklerini `ios/App/App/Info.plist` (`GADApplicationIdentifier`) ve `android/app/src/main/AndroidManifest.xml` (`com.google.android.gms.ads.APPLICATION_ID`) içinde değiştir.
- Ödüllü reklam birimlerini `index.html` içindeki `NCFG.admob.rewarded` alanına yaz ve `testing:false` yap.
- AB kullanıcıları için izin (UMP) ve iOS izleme izni (ATT) akışı hazır.

### Simgeler
Kaynaklar `assets/` klasöründe. Değiştirince: `npx @capacitor/assets generate --iconBackgroundColor '#6EB257' --splashBackgroundColor '#2F5E27' --splashBackgroundColorDark '#141F2C'`
