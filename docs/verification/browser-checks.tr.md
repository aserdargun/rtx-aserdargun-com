# Yerel doğrulama — RTX Spark Atlas

Tarih: 16 Ekim 2026. Kapsam: kullanıcının kabul ettiği ayrıntılı temsili N1X 128 GB modeli ve iki dilli uygulama. Bu kayıt yerel kanıttır; yayın veya gerçek donanım doğrulaması değildir.

## Derleme ve dosyalar

- **Blender 5.1.1** sahneyi, ham GLB'yi, parça manifestini ve posteri başarıyla üretti.
- glTF Transform çıktısı: **6.446.428 bayt**, **122 mesh**, **15 malzeme**. Khronos doğrulaması: **0 hata, 0 uyarı**. [Model raporu](model-validation.json).
- Manifestte **46 ayrı seçilebilir parça** var. İki gösterim tabanı ve bir bağlantı grubu aynı kimlikleri kullandığı için GLB'de 49 parça etiketli düğüm bulunur; bunlar 49 farklı çip bileşeni değildir.
- **4/4 Node testi geçti:** yapılandırma ve gerçek CUDA işaret geometrisi; iki dilli parça/GLB eşleşmesi; açıklanan bellek bölüşümü örnekleri; ondalık GB hesapları.
- TypeScript ve Vite üretim derlemesi geçti. Three.js paketi yaklaşık **640 kB ham / 160 kB gzip** olduğu için Vite'ın 500 kB uyarısı korunuyor. GLB yaklaşık 6,45 MB; `.blend` ayrı ve isteğe bağlı indirmedir.
- On dört kaynak URL'si HTTP 200 döndürdü. [HTTP kaydı](source-http-checks.json) yalnız erişilebilirliği gösterir; içerik kanıtları araştırma raporlarındadır.

## Tarayıcıda çalıştırılan akışlar

Codex içi tarayıcıda geliştirme sunucusu `127.0.0.1:4317` ve derlenmiş üretim paketi `127.0.0.1:4318` kullanıldı.

| Akış | Gözlenen sonuç |
|---|---|
| Üretim keşif ekranı | Model `ready` durumuna geçti; canlı WebGL sahnesi görüntülendi. |
| 3B bellek geometrisine tıklama | Bellek bölümü ve `128 GB · LPDDR5X` seçimi açıldı. |
| CPU çekirdeği 8'i seçme | `Cortex-X925 · 8` seçildi; açıklaması göründü; odaklama çekirdek grubuna yaklaştı. |
| Üstten / birleşik / patlatılmış | Kamera ve ayrılan geometri değişti; sıfırlama genel görünümü getirdi. |
| Katman kaydırıcısı, klavye | End tuşu ayırmayı 1 yaptı ve patlatılmış görünümü seçti. |
| Bölüm izolasyonu | Yalnız seçilen bellek bölümünün nesneleri kaldı. |
| Etiketler | Anlamsal etiket dışa aktarımı düzeltildikten sonra tüm metin geometrisi gizlendi ve tekrar açıldı. |
| AI çıkarımı, 2× | CPU girdi adımıyla başladı ve ilerledi; yol, geometri ve açıklama göründü. |
| Grafik senaryosu, elle adım, duraklatma | GPU/RT adımı açıldı; duraklatınca yol ve açıklama kaldı. Elle adım otomatik oynatmayı başlatmıyor. |
| Rehberli tur | Başlangıçta 1/8, Sonraki ile CPU 2/8 göründü; kapatma tur kontrollerini kaldırdı. |
| Türkçe / İngilizce | Gezinme, bölümler, kontroller ve açıklamalar değişti; İngilizce tercih yeniden yüklemede korundu. |
| Bellek carveout, klavye | 8 GB için 96 GB paylaşılan, 24 GB yalnız CPU ve 104 GB GPU erişimi gösterildi. |
| Aktarım hesabı | 128 GB ve %100 kullanımda 300 GB/sn ile 0,427 saniye gösterildi. |
| Ağırlık hesabı | 70 milyar parametre, 16 bit için 140 GB gösterildi. |
| Tensor örneği | İkinci terimde kısmi toplam 3 oldu. |
| RT örneği | Üç ilerletmeyle dört kavramsal aşama etkinleşti. |
| Kaynaklar ve GLB | On dört kaynak ve temsil sınırı görüldü; GLB başarıyla indirildi. |
| PNG dışa aktarımı | Veri URL'si yerine Blob URL'si kullanıldıktan sonra üretim paketinde PNG indirildi. |
| Bölüm / sekme geçişi | Yeni bölüm üstten açıldı; detay panelinin kategorisi değişince kendi kaydırması sıfırlandı. |

Yeni üretim önizleme sekmesinde bu kontroller sırasında hata veya uyarı kaydedilmedi. Geliştirme sekmesindeki eski `PCFSoftShadowMap` uyarısı `PCFShadowMap` kullanılarak giderildi; eski zaman damgalı kayıt geçmişte duruyor.

## Telefon ve görsel kontrol

**1536 × 1024** masaüstü, **390 × 844** telefon ve **320 × 800** dar görünüm denendi. Düzeltmelerden sonra kök yatay içerik genişliği kullanılabilir belge genişliğini aşmadı; en dar görünümde kaydırma çubuğu kullanılabilir alanı 305 piksele indiriyor. Bileşen şeridi kendi alanında yatay kaydırılabilir. Telefonda sıralama model, kontroller, ayrıntı panelidir. Kamera araçları GPU'nun üzerini kapatmamaları için modelin üstünde yatay sıraya taşındı.

Saklanan ekran görüntüleri:

- [Masaüstü](explorer-desktop.jpg)
- [Telefon](explorer-mobile.jpg)
- [Patlatılmış animasyon](exploded-animation.jpg)

Son masaüstü ekranı ve [mimari konsepti](../design/architecture-concept.png) `view_image` ile birlikte açılarak karşılaştırıldı. Konsept tasarım referansıdır; kullanıcı onayı iddia edilmez.

| Tasarım noktası | Referans → sonuç |
|---|---|
| Ana hiyerarşi | Başlık, bileşen şeridi, merkezde 3B, sağ ayrıntı paneli, araçlar, metrikler ve alt bilgi korundu. |
| Yerleşim | Üç sütun korundu; 228 piksel sol şerit ve 330 piksel detay alanı etkileşimli modele yer açıyor. |
| Renk | Grafit zemin, yeşil etkin durumlar, camgöbeği bağlantı vurguları korundu; modelde özgün malzemeler kullanıldı. |
| Tipografi | Büyük sans-serif başlıklar ve eş aralıklı indeksler korundu. Yerel Inter / JetBrains Mono kullanılıyor. Ek kontroller ve kaynaklar için panel yazıları daha küçük. |
| Ana görsel | Konsept görselinin yerini özgün Blender geometrisi aldı. 20 CPU ve 6.144 CUDA işareti var; S/G işlevsel düzeni kaynaklara dayanıyor. Fotoğraf veya fiziksel ölçü eşdeğerliği iddia edilmiyor. |
| Kontroller | Sekiz bölüm ve üç kamera görünümü korundu; odak, etiket, izolasyon, indirme, hız ve senaryo araçları eklendi. |
| Metrikler | 300 GB/sn, 256 bit ve FP4 tepe korundu; duyurulan 600 GB/sn C2C dördüncü metrik oldu. |
| Telefon | Masaüstü sütunları, yatay bölüm şeridi ve alt alta model/kontrol/ayrıntı düzenine dönüşüyor. |

## İlk ekrandaki bilinçli metin farkları

- Bellek erişimi **“aynı fiziksel bellek havuzu”** olarak açıklandı; aynı uygulama bütçesi anlamına gelmiyor.
- “Gerçek mimariyi keşfet” yerine **“Mimariyi keşfet”** yazıldı; birebir fiziksel kopya vaat edilmiyor.
- Ayrıntı panelinin alt açıklaması **“46 bileşeni seç, işlevini öğren, veri yolculuğunu izle.”** oldu.
- Duyuru değerini DRAM'dan ayıran **“600 GB/sn · NVLink-C2C · duyurulan”** eklendi.
- N1X sahne etiketi, etkileşim ipucu, senaryo, hız, adım kontrolleri ve kaynak bağlantıları eklendi.
- Alt bilgiye **“Temsili eğitim modeli”** eklendi. Sahnedeki **“Fiziksel ölçekte değil”** açıklaması korundu.

## Sınırlar

Gerçek N1X cihazı veya sürekli bant genişliği/uygulama performansı ölçülmedi. Fiziksel geometri, SM dizilimi ya da bellek paketi yerleşimi iddia edilmez. WebGL hata posteri ve azaltılmış hareket desteği kodda var; bu oturumda ayrıca hata enjekte edilmedi veya hareket tercihi emüle edilmedi. Telefon ölçüleri masaüstü tarayıcı görünüm testleridir; gerçek iOS/Android cihaz kabulü değildir. DNS, TLS, barındırma, yayınlanan dosyalar ve `aserdargun.com` bağlantısı bu tamamlanan yerel derlemenin dışındadır.
