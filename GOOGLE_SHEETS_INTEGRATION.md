# HMTRMS - Google Sheets Entegrasyon Kılavuzu

Bu kılavuz, HMTRMS uygulamasının Google Sheets ile nasıl entegre edileceğini açıklar.

## 📋 İçindekiler

1. [Google Cloud Console Kurulumu](#1-google-cloud-console-kurulumu)
2. [Google Sheets API Yapılandırması](#2-google-sheets-api-yapılandırması)
3. [Service Account Oluşturma](#3-service-account-oluşturma)
4. [React Entegrasyonu](#4-react-entegrasyonu)
5. [Veri Yapısı](#5-veri-yapısı)
6. [CRUD Operasyonları](#6-crud-operasyonları)

---

## 1. Google Cloud Console Kurulumu

### Adım 1.1: Proje Oluşturma

1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. "Select a project" > "New Project" seçeneğine tıklayın
3. Proje adı: `hmtrms-sheets-integration`
4. "Create" butonuna tıklayın

### Adım 1.2: Google Sheets API'yi Etkinleştirme

1. Sol menüden "APIs & Services" > "Library" seçin
2. Arama çubuğuna "Google Sheets API" yazın
3. "Google Sheets API" seçeneğine tıklayın
4. "Enable" butonuna tıklayın

---

## 2. Google Sheets API Yapılandırması

### Adım 2.1: Service Account Oluşturma

1. Sol menüden "IAM & Admin" > "Service Accounts" seçin
2. "Create Service Account" butonuna tıklayın
3. **Service Account Details:**
   - Name: `hmtrms-service-account`
   - ID: (otomatik oluşur)
   - Description: `HMTRMS Google Sheets Integration`
4. "Create and Continue" seçin
5. **Grant Roles:**
   - Role: `Editor` (Düzenleyici yetkisi)
6. "Continue" > "Done" seçin

### Adım 2.2: Credentials (Anahtar) Oluşturma

1. Service Account listesinde oluşturduğunuz hesaba tıklayın
2. "Keys" sekmesine geçin
3. "Add Key" > "Create New Key" seçin
4. Key type: `JSON`
5. "Create" butonuna tıklayın
6. İnen JSON dosyasını güvenli bir yerde saklayın

### Adım 2.3: JSON Key Formatı

İnen dosya şu formatta olacak:

```json
{
  "type": "service_account",
  "project_id": "hmtrms-sheets-integration",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "hmtrms-service-account@hmtrms-sheets-integration.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

## 3. Google Sheets Hazırlama

### Adım 3.1: Yeni Spreadsheet Oluşturma

1. [Google Sheets](https://sheets.google.com/) adresine gidin
2. Yeni boş bir spreadsheet oluşturun
3. Adı: `HMTRMS_Veri_Tablosu`

### Adım 3.2: Service Account'a Erişim Verme

1. Sağ üst köşeden "Share" (Paylaş) butonuna tıklayın
2. Service Account email adresini ekleyin:
   - `hmtrms-service-account@hmtrms-sheets-integration.iam.gserviceaccount.com`
3. Yetki: `Editor` (Düzenleyici)
4. "Send" butonuna tıklayın

### Adım 3.3: Spreadsheet ID'sini Alma

Spreadsheet URL'sinden ID'yi kopyalayın:

```
https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
```

Örnek:
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                    Bu kısım Spreadsheet ID
```

---

## 4. React Entegrasyonu

### Adım 4.1: Gerekli Paketleri Yükleme

```bash
npm install googleapis
```

### Adım 4.2: Environment Variables

`.env` dosyası oluşturun:

```env
# Google Sheets API
VITE_GOOGLE_SHEETS_ID=your_spreadsheet_id_here
VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
VITE_GOOGLE_PRIVATE_KEY=your_private_key_here
```

**Önemli:** Private key'deki `\n` karakterlerini gerçek satır sonlarıyla değiştirin.

---

## 5. Veri Yapısı

### Sheet Yapılandırması

| Sheet Adı | Açıklama |
|-----------|----------|
| `Talepler` | Tüm taleplerin listesi |
| `Gorevler` | Tüm görevlerin listesi |
| `Revizeler` | Revize kayıtları |
| `Onaylar` | Onay bekleyenler |
| `Kullanicilar` | Kullanıcı listesi |

### Talepler Sheet Yapısı

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| ID | TalepNo | Baslik | Aciklama | Departman | IsTuru | TalepSahibi | Atanan | Durum | Oncelik |

---

## 6. CRUD Operasyonları

### Örnek: Talep Ekleme

```typescript
// Google Sheets'e yeni talep ekleme
const addRequestToSheet = async (request: Request) => {
  const row = [
    request.id,
    request.requestNo,
    request.title,
    request.description,
    request.department,
    request.workType,
    request.requesterName,
    request.assignedToName || '',
    request.status,
    request.priority,
    request.targetDate,
    request.createdAt
  ];
  
  await sheetsService.appendRow('Talepler!A:L', row);
};
```

### Örnek: Talep Güncelleme

```typescript
// Mevcut talebi güncelleme
const updateRequestInSheet = async (requestId: string, updates: Partial<Request>) => {
  // Önce satırı bul
  const rowIndex = await sheetsService.findRow('Talepler!A:A', requestId);
  
  if (rowIndex > 0) {
    // Güncelleme yap
    await sheetsService.updateRow(`Talepler!A${rowIndex}:L${rowIndex}`, updatedData);
  }
};
```

---

## 🔐 Güvenlik Notları

1. **Private Key'i asla GitHub'a yüklemeyin**
2. **Environment variables kullanın**
3. **Service Account'a minimum yetki verin**
4. **Production'da API anahtarlarını sunucu tarafında saklayın**

---

## 📚 Faydalı Kaynaklar

- [Google Sheets API Dokümantasyonu](https://developers.google.com/sheets/api)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Service Account Dokümantasyonu](https://cloud.google.com/iam/docs/service-accounts)
