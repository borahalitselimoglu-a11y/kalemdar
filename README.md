# Kalemdar — Notlar · El yazısı · Cüzdan (PWA)

Evernote tarzı not defteri + yazının üstüne el yazısı/çizim + ses kaydı + kamera + gelir/gider takibi.
Sunucu yok: tüm veriler cihazdaki IndexedDB'de. Kilit açıksa her şey AES-256-GCM ile şifreli (PIN → PBKDF2 250.000 tur).

## Özellikler
- 12 dil: Türkçe, English, Español, Français, Italiano, Deutsch, Português, Русский, 中文, 日本語, العربية (sağdan sola), हिन्दी
- Not içinde ✍️ kalem modu: metnin üstüne parmakla/kalemle yaz; "Sadece kalem" ile avuç içi reddi
- Ses kaydı (duraklat/devam, dalga göstergesi), uygulama içi kamera (ön/arka), galeri
- Dışa aktarma: PDF (çizimlerle birlikte), Word (.docx), Excel (.xlsx), TXT, Markdown, HTML
- Not çevirisi: cihazda yerleşik çeviri varsa çevrimdışı; yoksa kullanıcı onayıyla MyMemory (günlük ~5.000 karakter ücretsiz)
- Cüzdan: TCMB listesindeki tüm para birimleri, hesap makineli tutar, tekrarlayan kayıtlar, bütçe, grafikler, Excel/CSV
- Anımsatıcı: not başına tarih/saat, tekrar (gün/hafta/ay), telefon bildirimi; bildirime dokununca not açılır; takvime ekleme (.ics / Google Takvim)
- Yedek alma/geri yükleme (kilit açıksa yedek de şifreli)

## Yayınlama (Satranç 3D ile aynı yol)
1. Bu klasördeki her şeyi yeni bir GitHub deposuna yükle (index.html kökte).
2. Settings → Pages → Deploy from branch → main / root.
3. https://KULLANICI.github.io/DEPO/ adresini PWABuilder'a ver → Android paketi.
4. Adres çubuğunu gizlemek için PWABuilder'ın verdiği kaydı, KULLANICI.github.io deposundaki `.well-known/assetlinks.json` dosyasına ekle (Kalemdar deposuna değil).
5. Android paketinde mikrofon ve kamera izinleri Chrome üzerinden istenir (ilk kullanımda).

## Dosyalar
- index.html — uygulamanın tamamı (HTML+CSS+JS)
- lib/ — PDF için jsPDF ve html2canvas (çevrimdışı çalışsın diye yerel kopya)
- manifest.json, sw.js — kurulum ve çevrimdışı çalışma
- icons/ — logo ve uygulama ikonları
- privacy.html — gizlilik politikası (TR/EN). Yayından önce [GELİŞTİRİCİ ADI] ve [E-POSTA ADRESİ] alanlarını doldur. Adresi: https://KULLANICI.github.io/DEPO/privacy.html (Google OAuth ekranı ve Play Console'a bu adresi gir)

## Anımsatıcılar hakkında
Web uygulamaları sunucu olmadan, uygulama tamamen kapalıyken bildirimi tam saniyesinde tetikleyemez. Kalemdar bu yüzden:
1. Uygulama açıkken veya arka plandayken bildirimi tam zamanında gösterir,
2. Uygulama açıldığında kaçmış anımsatıcıları hemen bildirir,
3. Android'in izin verdiği aralıklarla arka planda kontrol eder (periodic background sync — zamanlamayı Chrome belirler),
4. **Google Takvim eşitleme** (Ayarlar → Anımsatıcı): anımsatıcılar Google Takvim'e etkinlik olarak yazılır; eklenince, değişince, silinince takvim de güncellenir. Android takvimi bildirimi uygulama kapalıyken bile tam zamanında gönderir.
5. Samsung/Outlook gibi diğer takvimler için tek tek veya toplu .ics dosyası.

## Google Takvim eşitlemesini açmak (bir kerelik geliştirici ayarı)
1. https://console.cloud.google.com → yeni proje → "APIs & Services" → **Google Calendar API**'yi etkinleştir.
2. "OAuth consent screen": External, uygulama adı Kalemdar, kapsam olarak `.../auth/calendar.events` ekle; test kullanıcısı olarak kendi Gmail adresini ekle.
3. "Credentials" → "Create credentials" → **OAuth client ID** → türü **Web application** → "Authorized JavaScript origins" kısmına `https://KULLANICI.github.io` ekle.
4. Oluşan istemci kimliğini (…apps.googleusercontent.com) `index.html` içinde `const GCAL_CLIENT_ID = '';` satırındaki tırnakların arasına yapıştır. Kimlik girilmediği sürece takvim eşitleme bölümü kullanıcılara hiç görünmez.
5. Not: Google, takvim yazma iznini "hassas kapsam" sayar. 100 kullanıcıya kadar "doğrulanmamış uygulama" uyarısıyla çalışır; mağazada herkese açmadan önce Google'ın uygulama doğrulamasından (gizlilik politikası sayfası vb.) geçmek gerekir.

## Güncelleme yayınlarken
`sw.js` dosyasının başındaki `const CACHE = 'kalemdar-v4';` satırındaki sayıyı her yeni sürümde bir artır (v5, v6…). Böylece telefonlardaki uygulama yeni sürümü alır. Android paketini (.aab) yeniden yüklemen gerekmez; GitHub'daki dosyaları güncellemen yeterli.
