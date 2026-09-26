# Mağaza kurulum listesi

Bu dosya oyun kodundan üretildi. Kimlikleri **aynen** kullan.

## Sıralamalar (leaderboards)

| Kimlik (Game Center) | Ad | Tür | Sıralama |
|---|---|---|---|
| `sapan.rekor` | Rekor | Klasik, en iyi skor | Büyükten küçüğe |
| `sapan.gunun_tarlasi` | Günün Tarlası | Yinelenen (recurring), her gün 00:00 Europe/Istanbul sıfırlanır | Büyükten küçüğe |

Play Console aynı iki sıralamayı oluşturunca verdiği kimlikleri `index.html` içindeki `NCFG.gs.android.lb` alanına yapıştır (`normal` = Rekor, `daily` = Günün Tarlası).

## Başarımlar (42 adet, toplam 1000 puan)

| Kimlik (Game Center) | Ad | Açıklama | Puan | Android anahtarı |
|---|---|---|---|---|
| `sapan.ach.first` | İlk birleşme | İki hayvanı birleştir | 5 | `first` |
| `sapan.ach.cat` | Kedi sever | Bir kedi oluştur | 5 | `cat` |
| `sapan.ach.sheep` | Çoban | Bir koyun oluştur | 5 | `sheep` |
| `sapan.ach.horse` | Seyis | Bir at oluştur | 5 | `horse` |
| `sapan.ach.cow` | Süt çiftliği | Bir inek oluştur | 10 | `cow` |
| `sapan.ach.elephant` | Fil hafızası | Bir fil oluştur | 15 | `elephant` |
| `sapan.ach.whale` | Okyanus çiftliği | Zincirin sonuna ulaş | 25 | `whale` |
| `sapan.ach.whale5` | Balina sürüsü | Toplam 5 balina oluştur | 50 | `whale5` |
| `sapan.ach.legend` | Gökkuşağı | İki dev hayvanı birleştir | 35 | `legend` |
| `sapan.ach.legend5` | Efsaneler efsanesi | 5 kez gökkuşağı oluştur | 85 | `legend5` |
| `sapan.ach.m100` | Çırak | Toplam 100 birleşme | 5 | `m100` |
| `sapan.ach.m1k` | Usta | Toplam 1.000 birleşme | 10 | `m1k` |
| `sapan.ach.m10k` | Çiftlik mimarı | Toplam 10.000 birleşme | 35 | `m10k` |
| `sapan.ach.ts100k` | Yüz binlik kasa | Toplam 100.000 puan topla | 5 | `ts100k` |
| `sapan.ach.ts1m` | Milyoner çiftçi | Toplam 1.000.000 puan topla | 50 | `ts1m` |
| `sapan.ach.combo5` | Zincirleme | x5 kombo yap | 5 | `combo5` |
| `sapan.ach.storm` | Fırtına | 25 kez x5 kombo yap | 25 | `storm` |
| `sapan.ach.p1k` | Bin puan | Tek oyunda 1.000 puan | 5 | `p1k` |
| `sapan.ach.p5k` | Beş bin | Tek oyunda 5.000 puan | 5 | `p5k` |
| `sapan.ach.p20k` | Yirmi bin | Tek oyunda 20.000 puan | 20 | `p20k` |
| `sapan.ach.p50k` | Elli bin | Tek oyunda 50.000 puan | 35 | `p50k` |
| `sapan.ach.p100k` | Yüz bin | Tek oyunda 100.000 puan | 75 | `p100k` |
| `sapan.ach.nosw` | Sadık atıcı | Hiç değiştirmeden tek oyunda 10.000 puan | 20 | `nosw` |
| `sapan.ach.marathon` | Maraton | Tek oyunda 15 dakika hayatta kal | 15 | `marathon` |
| `sapan.ach.uni10` | Sihirbaz | Tek boynuzla 10 hayvan büyüt | 5 | `uni10` |
| `sapan.ach.uni50` | Büyücü | Tek boynuzla 50 hayvan büyüt | 25 | `uni50` |
| `sapan.ach.rev10` | İnatçı | 10 kez ikinci şans kullan | 10 | `rev10` |
| `sapan.ach.g10` | Müdavim | 10 oyun oyna | 5 | `g10` |
| `sapan.ach.g50` | Çiftlik emektarı | 50 oyun oyna | 15 | `g50` |
| `sapan.ach.g200` | Çiftlik efsanesi | 200 oyun oyna | 35 | `g200` |
| `sapan.ach.streak7` | Sadık çiftçi | 7 gün üst üste gel | 10 | `streak7` |
| `sapan.ach.streak30` | Bir aylık dostluk | 30 gün üst üste gel | 50 | `streak30` |
| `sapan.ach.daily7` | Tarla gezgini | 7 farklı günün tarlasını oyna | 10 | `daily7` |
| `sapan.ach.daily30` | Tarla kurdu | 30 farklı günün tarlasını oyna | 35 | `daily30` |
| `sapan.ach.top10` | İlk on | Bir sıralamada ilk 10'a gir | 20 | `top10` |
| `sapan.ach.podium` | Podyum | Bir sıralamada ilk 3'e gir | 50 | `podium` |
| `sapan.ach.book` | Tam defter | 12 hayvanın hepsini bul | 25 | `book` |
| `sapan.ach.style` | Stil sahibi | Pazardan bir şey al | 5 | `style` |
| `sapan.ach.coll10` | Koleksiyoncu | 10 kozmetiğe sahip ol | 30 | `coll10` |
| `sapan.ach.lv10` | Seviye 10 | Çiftçi seviyesi 10 ol | 10 | `lv10` |
| `sapan.ach.lv20` | Seviye 20 | Çiftçi seviyesi 20 ol | 35 | `lv20` |
| `sapan.ach.lv30` | Seviye 30 | Çiftçi seviyesi 30 ol | 75 | `lv30` |

Play Console her başarım için `CgkI...` ile başlayan bir kimlik üretir. Bunları `NCFG.gs.android.ach` içine "Android anahtarı" ile eşleştirerek yaz, örneğin: `first:'CgkIxxxx'`.
