# Yayın kontrol listesi (1.0.0)

Kodda hazır olanlar: Capacitor iOS/Android projeleri, sadece iPhone + dikey ekran, sürüm 1.0.0, Game Center/Play Games köprüsü, AdMob ödüllü reklam + izin (ATT/UMP) akışı, Apple gizlilik manifesti, gizlilik ve destek sayfaları, Ayarlar › Verilerimi sil, Android geri tuşu, simgeler, açılış ekranı, mağaza görselleri ve metinleri.

## 1. Hesaplar
- [ ] Apple Developer Program (yıllık 99 $)
- [ ] Google Play Console (tek seferlik 25 $)
- [ ] Google AdMob hesabı

## 2. Reklamları gerçek kimliklere geçir (yayından önce ŞART)
Test reklamıyla mağazaya çıkmak AdMob politikası ihlalidir.
- [ ] AdMob'da iOS ve Android uygulamalarını oluştur, her biri için bir **Ödüllü** reklam birimi aç.
- [ ] `ios/App/App/Info.plist` → `GADApplicationIdentifier`
- [ ] `android/app/src/main/AndroidManifest.xml` → `com.google.android.gms.ads.APPLICATION_ID`
- [ ] `index.html` → `NCFG.admob.rewarded` (iOS ve Android birim kimlikleri) ve `testing:false`
- [ ] **app-ads.txt:** GitHub'da `madexel.github.io` adlı bir repo aç, köküne `store/app-ads.txt` şablonunu kendi yayıncı kimliğinle koy. Mağaza sayfalarında geliştirici sitesi olarak `https://madexel.github.io` yaz.

## 3. Oyun servisleri
- [ ] App Store Connect › Game Center: `docs/magaza-kurulum.md` içindeki 2 sıralama + 42 başarım.
- [ ] Play Console › Play Games Services: aynı liste; proje kimliğini `android/app/src/main/res/values/strings.xml`, üretilen kimlikleri `index.html` › `NCFG.gs.android` içine yaz.

## 4. iOS derleme (Mac + Xcode)
```bash
npm install
npm run ios        # web dosyalarını kopyalar, senkronlar, Xcode'u açar
```
- [ ] App hedefi › Signing & Capabilities: Team seç (Game Center yetkisi hazır).
- [ ] App Store Connect'te `com.madexel.sapanciftligi` ile uygulamayı oluştur.
- [ ] Product › Archive › Distribute App › App Store Connect.
- [ ] TestFlight'ta kendi telefonunda dene (aşağıdaki cihaz testi).

## 5. Android derleme (Android Studio)
```bash
npm install
npm run android
keytool -genkey -v -keystore sapan-ciftligi.keystore -alias sapan -keyalg RSA -keysize 2048 -validity 10000
```
- [ ] Anahtarı (keystore) ve şifresini güvenli bir yerde sakla, **asla repoya ekleme** (`.gitignore` hazır). Kaybedersen güncelleme yayınlayamazsın; Play App Signing'i açık tut.
- [ ] Build › Generate Signed Bundle › Android App Bundle (.aab).
- [ ] Play Console › Dahili test kanalına yükle. Play Games yalnızca Play'den yüklenen sürümde çalışır.

## 6. Mağaza sayfaları
- [ ] Metinler: `docs/magaza-sayfasi.md`
- [ ] Ekran görüntüleri: `store/screenshots/ios-6.9` (1290×2796), `ios-6.5` (1242×2688), `android` (1080×2160)
- [ ] Google Play öne çıkan görsel: `store/feature-graphic-1024x500.png`
- [ ] Gizlilik ve destek adresleri, App Privacy / Veri güvenliği / IARC cevapları (aynı dosyada)

## 7. Gerçek cihazda son kontrol
- [ ] İlk açılış: ATT izni (iOS), Avrupa'da onay formu
- [ ] Ödüllü reklam: bedava yumurta, ikinci şans, 2 kat yumurta
- [ ] Game Center / Play Games girişi, skor ve başarım gönderimi
- [ ] Android geri tuşu: paneller kapanıyor, oyunda mola veriyor, sadece menüde çıkıyor
- [ ] Sessiz mod, arka plana alma (oyun duruyor), internetsiz oynama
- [ ] Ayarlar › Verilerimi sil
- [ ] Günün tarlası skoru sıralamada görünüyor

## Bilinçli olarak 1.0.0'a alınmayanlar
- **Çiftlik Sahibi paketi (uygulama içi satın alma):** Uygulamada gizli. Mağaza kuralları gereği Stripe kullanılamaz; sonraki sürümde RevenueCat ile eklenebilir.
- **İngilizce arayüz:** Oyun yalnızca Türkçe. İlk yayını Türkiye'de yapmak önerilir.
