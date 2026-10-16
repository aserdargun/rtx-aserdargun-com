# RTX Spark Atlas

[English](README.md) · [Türkçe](README.tr.md)

**NVIDIA RTX Spark N1X / 128 GB** için **Blender, Three.js, React ve TypeScript** ile geliştirilen ayrıntılı temsili mimari atlası. Seçilen yapılandırmada 20 Arm CPU ve 6.144 CUDA çekirdeği bulunur. Uygulama Türkçe ve İngilizce kullanılabilir.

**Durum:** Temsili uygulama geliştirildi ve yerelde doğrulandı. Yayın, özel alan adı etkinleştirmesi veya portföy bağlantısı yapılmadı. Hedef yayın adresi `https://rtx.aserdargun.com/`.

## Keşif özellikleri

- 46 seçilebilir parça, ayrı ayrı seçilebilen 20 CPU çekirdeği ve 6.144 mantıksal CUDA sayım işareti.
- Birleşik, patlatılmış ve üstten görünüm; katman ayırma, döndürme, yakınlaşma, odaklama, etiketler, bölüm izolasyonu, otomatik dönüş ve PNG indirme.
- Veri akışı, AI çıkarımı ve grafik senaryoları; hız, duraklatma ve elle adımlama. Sekiz bölümlü rehberli tur.
- Ayrıntılı mimari anlatımı; bellek paylaşımı, bant genişliği ve model ağırlığı hesaplayıcıları; CUDA / Tensor / RT eğitim örnekleri.
- On dört birincil NVIDIA kaynağı; indirilebilir Blender sahnesi ve GLB.
- Masaüstü ve telefon yerleşimi, klavye ile kullanılabilen bileşen kontrolleri, yerel fontlar, azaltılmış hareket desteği ve WebGL başlatılamazsa gösterilen poster.

[Tasarım kaydı](docs/design/spec.md), [tarayıcı doğrulaması](docs/verification/browser-checks.tr.md) ve [model doğrulaması](docs/verification/model-validation.json) uygulamayı ve sınırlarını belgeler.

## Yerelde çalıştırma

Node.js 22 serisinde 22.23 veya daha yenisini kullanın. Testler Node'un yerleşik TypeScript desteğini kullanır. Bağımlılık sürümleri kilit dosyasında kayıtlıdır.

```sh
npm ci
npm run dev
```

Geliştirme: `http://127.0.0.1:4317/`. Üretim paketi için:

```sh
npm test
npm run build
npm run preview
```

Üretim önizlemesi: `http://127.0.0.1:4318/`. İki sunucu da yalnızca yerel bağlantıya açılır; port doluysa başka porta geçmez. Yayınlanabilir statik dosyalar `dist/` klasöründedir. Tarayıcı kontrolleri Codex içi tarayıcıda yapıldı; otomatik uçtan uca test paketi iddia edilmez.

## Modeli yeniden üretme

Özgün geometri [blender/build_atlas.py](blender/build_atlas.py) ile tekrar üretilebilir. Blender 5.1.1 kullanıldı. Blender PATH üzerinde veya varsayılan macOS konumunda değilse `RTX_BLENDER` değişkenine çalıştırılabilir dosyanın yolunu verin.

```sh
npm run model
npm run model:optimize
npm test
npm run build
```

Çıktılar:

- [Blender sahnesi](public/models/rtx-spark-n1x-128gb.blend)
- [Tarayıcı GLB dosyası](public/models/rtx-spark-n1x-128gb.glb)
- [Parça ve kaynak manifesti](public/models/architecture.json)
- [Blender posteri](public/models/architecture-poster.png)

Ham GLB, sürüm kontrolü dışında tutulan `blender/build/` klasöründedir. glTF Transform, seçilebilir parça gruplarını koruyarak geometriyi küçültür. Khronos glTF Validator çıktıyı denetler. Normal gezinme sırasında Blender indirme dosyası yüklenmez.

## Kanıt ve temsil sınırları

Kullanıcı 16 Ekim 2026'da kapsamı **“temsili ama çok ayrıntılı şekilde yapalım”** olarak değiştirdi. Uygulama açıklanan işlevleri ve mantıksal sayıları gösterir. Ölçülü paket, fiziksel die floorplan, üretim geometrisi, bellek paketi sayısı veya gerçek SM dizilimi iddia etmez. 96 × 64 CUDA dizisi, Tensor/RT eğitim bölgeleri, katman yüksekliği, kaplama ve hatlar temsilidir.

300 GB/sn DRAM bant genişliği ile duyurulan 600 GB/sn NVLink-C2C farklı bağlantıları anlatır. Sunum C2C yönlerinin nasıl sayıldığını belirtmez. Bellek bölgeleri ve aktarım süreleri senaryodur; cihaz okuması veya performans ölçümü değildir. FP4 tepe değeri FP32 ya da sürekli uygulama performansı anlamına gelmez.

Önceki fiziksel blueprint araştırması [Türkçe bulgular](docs/research/findings.tr.md), [derin kaynak araştırması](docs/research/deep-source-audit.tr.md) ve [kaynak sicilinde](docs/research/physical-source-register.json) korunur. Sınırları belirtilen açık kaynak araştırmasında uygun ölçülü kaynak bulunamadı. Bu sonuç, böyle bir kaynağın hiç bulunmadığı anlamına gelmez.

## Yayın sınırı

`public/staticwebapp.config.json` statik sunucu yönlendirmelerini, önbelleği ve GLB/Blender MIME türlerini hazırlar. Yayın için barındırma kaynağı, `rtx.aserdargun.com` DNS/TLS doğrulaması, yayınlanan paketin tarayıcı kontrolü ve `aserdargun.com` bağlantısı gerekir. Bu adımlar çalıştırılmadı. NVIDIA tarafından üretilmiş veya onaylanmış olmayan bağımsız eğitim projesidir.
