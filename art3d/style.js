// ============================================================
// SAPAN ÇİFTLİĞİ 3D STİL KİLİDİ
// Tüm sahne varlıkları yalnızca bu dosyadaki değerlerle üretilir.
// Revizyonlarda model değişir, bu kurallar DEĞİŞMEZ; böylece ışık,
// malzeme ve kadraj versiyonlar arasında kaymaz.
// ============================================================
export const CAMERA = { yaw: 28, pitch: 22, pxPerUnit: 120 };   // tek kamera açısı, tek ölçek (tüm varlıklar aynı ölçekte)
export const SHADOW = { opacity: 0.30, mapSize: 2048, radius: 6 };
// Işık yönü sabittir: güneş sol-ön-yukarıdan gelir. Sadece renk/şiddet günün saatine göre değişir.
export const LIGHT = {
  day:     { dir: [-0.62, 1.00, 0.78], key: '#FFF1D8', keyI: 2.5, sky: '#D6ECFF', ground: '#7DAF5C', hemiI: 1.20, rim: '#FFFFFF', rimI: 0.45, exposure: 1.00, windows: false },
  evening: { dir: [-0.95, 0.95, 0.62], key: '#FFB077', keyI: 2.2, sky: '#FFC89A', ground: '#6A7E44', hemiI: 0.95, rim: '#FFD2A8', rimI: 0.55, exposure: 1.00, windows: true },
  night:   { dir: [-0.45, 1.00, 0.55], key: '#A9BEFF', keyI: 1.35, sky: '#5A6FA8', ground: '#2A3A34', hemiI: 1.05, rim: '#8FB0FF', rimI: 0.9, exposure: 1.10, windows: true },
};
// Malzeme paleti: hepsi mat, sıcak, "oyuncak ahşap" hissi. Metalik yok.
export const PAL = {
  wall: '#EAD8B6', roof: '#B4513A', roofDark: '#8A6450', brick: '#8C4A3A',
  barn: '#B83A30', trim: '#FFF3DC', wood: '#8A5A34', woodDark: '#5E3818',
  stone: '#A69C90', tower: '#EFE3CC', cap: '#B83A30', cloth: '#FFF6E6',
  leaf: ['#5E9E48', '#4F8E3E', '#6DAE52'], trunk: '#7A4B24', hay: '#E7BE5C',
  glassDay: '#A9D3E6', glassNight: '#FFC65A', flower: ['#F2C14E', '#F28CA0', '#FFF6E0'],
};
// Kenar ışığı: arka-sağ-üstten, siluetleri gökyüzünden ayırır (özellikle gece).
export const RIM_DIR = [0.7, 0.6, -0.9];
export const MAT = { roughness: 0.82, metalness: 0.0, bevel: 0.06 };

// ---- KARAKTERLER (hayvan jetonları) ----
// Oyun alanı yukarıdan bakar; karakterler hafif önden-yukarıdan, yüzleri oyuncuya dönük görünür.
// Fizik yarıçapı = 1 birim. Tüm karakterler aynı kadrajda (±FRAME) render alınır, böylece boyutları oyundaki çemberle birebir eşleşir.
export const TOKEN = { pitch: 52, frame: 1.42, px: 512 };
// Karakter stüdyo ışığı: güneşle aynı yönden anahtar ışık + yumuşak dolgu + kenar ışığı. Gündüz ışığıyla aynı sıcaklıkta.
export const TOKEN_LIGHT = { key: '#FFF1D8', keyI: 2.3, keyDir: [-0.62, 1.0, 0.9], fill: '#CFE3FF', fillI: 0.55, fillDir: [1, 0.35, 0.8],
  rim: '#FFFFFF', rimI: 0.9, rimDir: [0.5, 0.8, -1], sky: '#FFFFFF', ground: '#B9D8A0', hemiI: 0.9, exposure: 1.05 };
// Karakter malzemesi: peluş/yumuşak oyuncak. Gözler parlak, burunlar yarı parlak.
export const TOY = { body: 0.62, glossy: 0.18, nose: 0.4 };
