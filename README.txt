ADG Insight V9

GitHub yükleme:
1. Bu klasörün içindeki tüm dosya ve klasörleri deponun ana dizinine yükleyin.
2. index.html ana dizinde kalmalıdır.
3. css ve js klasörleri aynı yapıda korunmalıdır.
4. Cloudflare Pages otomatik olarak yeniden yayınlar.

Yönetici girişi:
demo@adg.com
ADG2026

Not:
Veriler şimdilik tarayıcının localStorage alanında tutulur.

V9.1: Firma logosu bağlantıyla veya bilgisayardan dosya seçilerek eklenebilir. Dosya 2 MB'dan küçük olmalıdır.

V9.2: Seçilen firma logosu müşteri portalındaki firma kartında ve firma tablosunda gösterilir.

V9.3: Giriş ekranındaki ADG Insight yörüngeleri ve dönen elektron animasyonları geri eklendi.

V9.4: ADG kutusunun altındaki en iç yörünge kaldırıldı.

V10 - Profesyonel Rapor Dashboard
- Sol menülü müşteri portalı
- Genel bakış, tüm raporlar, favoriler, son açılanlar ve kütüphane
- Firma ve metin filtresi
- Kart/liste görünümü
- İçerik türü göstergeleri
- Favori ve son açılan kayıtları

Kayıtlı proje başlıkları:
1. Kullanıcı, rol ve firma yetkileri
2. Firma profili ve kurumsal bilgiler
3. Kurumsal kütüphane ve doküman yönetimi
4. Power BI ve rapor yönetimi
5. Dashboard, favoriler ve son kullanılanlar
6. Sunucu, SQL Server ve merkezi dosya depolama

V10.1 - Firma Seçimi Akışı
- Girişten sonra önce logo ve firma kartlarının olduğu seçim ekranı açılır.
- Kullanıcı firma seçtikten sonra profesyonel dashboard görüntülenir.
- Dashboard yalnızca seçilen firmaya ait rapor ve dokümanları gösterir.
- Sol menüden veya üst düğmeden firma değiştirilebilir.

V10.1.1 Kararlı Düzeltme
- Firma seçim kartlarının tıklama olayları düzeltildi.
- Rapor/bağlantı kartlarının açılma işlevi sağlamlaştırıldı.
- V10.1 hazırlanırken kaybolan firma yönetimi fonksiyonları geri getirildi.
- Firma logo seçme, düzenleme ve firma kayıt işlemleri korunmuştur.

V10.2 - Firma Profili
- Vergi numarası ve vergi dairesi
- Telefon ve e-posta
- Web sitesi ve adres
- Firma dashboardunda kurumsal profil kartı

V10.3 - Kurumsal Kütüphane eklendi.

V10.4 - Dosya Yükleme ve Explorer Kütüphane
- PDF, Excel, Word, PowerPoint, görsel, ZIP ve video dosyaları seçilebilir.
- Dosyalar sunucu kurulana kadar IndexedDB içinde aynı tarayıcıda saklanır.
- Explorer tarzı klasör, kart/liste görünümü ve önizleme paneli eklendi.
- Dosya açma ve indirme işlevleri eklendi.
- Geçici dosya boyutu sınırı 50 MB'dır.

V10.4.1 - Kütüphane Dosya Yükleme Geri Yükleme
- Yanlışlıkla oluşturulan revert commitinden sonra dosya yükleme bileşenleri yeniden yayınlandı.
- file-store.js ve library.js tekrar aktif hale getirildi.
- Dosya seçme, IndexedDB kaydı, açma ve indirme özellikleri korunmuştur.
