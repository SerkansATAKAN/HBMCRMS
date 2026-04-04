# 🔗 HMTRMS Google Sheets Entegrasyonu - Hızlı Başlangıç

Bu rehber, HMTRMS uygulamasını Google Sheets'e bağlamak için gereken adımları içerir.

---

## 📋 Özet

Bu entegrasyon sayesinde:
- ✅ Tüm veriler Google Sheets'te saklanır
- ✅ Birden fazla kullanıcı aynı anda çalışabilir
- ✅ Verileri Excel'de görüntüleyebilirsiniz
- ✅ Formüller ve otomasyonlar ekleyebilirsiniz
- ✅ Ücretsiz ve güvenlidir

---

## 🚀 5 Dakikada Kurulum

### Adım 1: Google Cloud Proje Oluştur (2 dk)

1. [Google Cloud Console](https://console.cloud.google.com/) gidin
2. Sağ üstten proje seçici > **"New Project"**
3. Proje adı: `hmtrms-app`
4. **"Create"**

### Adım 2: Google Sheets API Etkinleştir (1 dk)

1. Sol menü: **"APIs & Services" > "Library"**
2. Arama: `Google Sheets API`
3. **"Enable"**

### Adım 3: API Key Oluştur (1 dk)

1. Sol menü: **"APIs & Services" > "Credentials"**
2. **"Create Credentials" > "API Key"**
3. Kopyalayın (güvenli yerde saklayın)

### Adım 4: Google Sheets Oluştur (1 dk)

1. [Google Sheets](https://sheets.google.com/) gidin
2. Yeni boş spreadsheet oluşturun
3. Adı: `HMTRMS_Veriler`
4. Sağ üst **"Share"** > **"Anyone with the link"** > **"Viewer"**

### Adım 5: Sheet Yapısını Oluştur

Spreadsheet'te şu sheet'leri oluşturun:

```
📊 HMTRMS_Veriler
├── 📄 Talepler
├── 📄 Gorevler
├── 📄 Revizeler
├── 📄 Onaylar
└── 📄 Kullanicilar
```

**Talepler** sheet'i için başlık satırı:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ID | TalepNo | Baslik | Aciklama | Departman | IsTuru | TalepSahibiID | TalepSahibi | AtananID | Atanan | Durum | Oncelik | HedefTarih | OlusturmaTarihi | GuncellemeTarihi |

---

## ⚙️ Uygulama Yapılandırması

### 1. Environment Variables

Proje kök dizininde `.env` dosyası oluşturun:

```env
# Google Sheets
VITE_GOOGLE_SHEETS_ID=your_spreadsheet_id_here
VITE_GOOGLE_API_KEY=your_api_key_here
```

**Spreadsheet ID'yi bulma:**
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                    Bu kısım Spreadsheet ID
```

### 2. Servisi Başlatma

```typescript
// App.tsx veya main.tsx
import { initializeSheetsService } from '@/services/googleSheets';
import { createSheetsConfig } from '@/config/sheets.config';

// Uygulama başlatılırken
initializeSheetsService(createSheetsConfig());
```

### 3. Hook Kullanımı

```typescript
// Herhangi bir bileşende
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { createSheetsConfig } from '@/config/sheets.config';

function MyComponent() {
  const { requests, loading, error, addRequest, updateRequest } = useGoogleSheets({
    ...createSheetsConfig(),
    autoFetch: true,
  });

  // Yeni talep ekle
  const handleSubmit = async () => {
    await addRequest({
      title: 'Yeni İş',
      description: 'Açıklama',
      department: 'F&B',
      workType: 'Afiş Tasarımı',
      requesterId: 'u1',
      requesterName: 'Atakan ŞENKAYA',
      status: 'NEW',
      priority: 'normal',
      targetDate: '2026-04-10',
      isUrgent: false,
      hasRevenueImpact: false,
      isVipSensitive: false,
      needsExternalResource: false,
    });
  };

  return (
    <div>
      {loading && <p>Yükleniyor...</p>}
      {error && <p>Hata: {error}</p>}
      <p>Toplam talep: {requests.length}</p>
    </div>
  );
}
```

---

## 📊 Veri Senkronizasyonu

### Otomatik Senkronizasyon

```typescript
const { fetchAll } = useGoogleSheets({
  ...createSheetsConfig(),
  autoFetch: true, // Bileşen yüklendiğinde otomatik çek
});
```

### Manuel Senkronizasyon

```typescript
const { fetchAll } = useGoogleSheets({
  ...createSheetsConfig(),
  autoFetch: false,
});

// Manuel yenileme
await fetchAll();
```

### Periyodik Senkronizasyon

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchAll();
  }, 5 * 60 * 1000); // Her 5 dakika

  return () => clearInterval(interval);
}, []);
```

---

## 🔐 Güvenlik

### API Key Kısıtlamaları

1. Google Cloud Console > Credentials
2. API Key'e tıklayın
3. **"Application restrictions"**
   - HTTP referrers (websites)
   - Your domain: `*.yourdomain.com/*`
4. **"API restrictions"**
   - Google Sheets API

### Önemli Notlar

- ✅ API Key'i asla GitHub'a yüklemeyin
- ✅ Production'da environment variables kullanın
- ✅ API Key'e sadece gerekli yetkileri verin
- ✅ Düzenli olarak API Key'i rotate edin

---

## 🛠️ Sorun Giderme

### "API Key geçersiz" hatası

```
Çözüm: Google Cloud Console > Credentials > API Key'i kontrol edin
```

### "Spreadsheet bulunamadı" hatası

```
Çözüm: Spreadsheet'i "Anyone with the link" olarak paylaşın
```

### "CORS hatası"

```
Çözüm: API Key restrictions'tan domain'inizi ekleyin
```

### Veriler güncellenmiyor

```
Çözüm: fetchAll() fonksiyonunu manuel çağırın veya sayfayı yenileyin
```

---

## 📚 API Referansı

### useGoogleSheets Hook

| Özellik | Tip | Açıklama |
|---------|-----|----------|
| `requests` | `Request[]` | Tüm talepler |
| `tasks` | `Task[]` | Tüm görevler |
| `revizeler` | `Revize[]` | Tüm revizeler |
| `approvals` | `Approval[]` | Tüm onaylar |
| `users` | `User[]` | Tüm kullanıcılar |
| `loading` | `boolean` | Yükleme durumu |
| `error` | `string \| null` | Hata mesajı |
| `fetchAll()` | `Promise<void>` | Tüm verileri yenile |
| `addRequest(data)` | `Promise<Request>` | Yeni talep ekle |
| `updateRequest(id, updates)` | `Promise<void>` | Talep güncelle |
| `deleteRequest(id)` | `Promise<void>` | Talep sil |
| `addTask(data)` | `Promise<Task>` | Yeni görev ekle |
| `updateTask(id, updates)` | `Promise<void>` | Görev güncelle |
| `addRevize(data)` | `Promise<Revize>` | Yeni revize ekle |
| `addApproval(data)` | `Promise<Approval>` | Yeni onay ekle |
| `updateApproval(id, updates)` | `Promise<void>` | Onay güncelle |

---

## 🎯 Örnek Senaryolar

### Senaryo 1: Yeni Talep ve Görev Atama

```typescript
const handleCreateRequest = async () => {
  // 1. Talep oluştur
  const request = await addRequest({
    title: 'Yaz Kampanyası Afişi',
    description: 'Havuz alanı için yaz kampanyası afişi',
    department: 'F&B',
    workType: 'Afiş Tasarımı',
    requesterId: 'u1',
    requesterName: 'Atakan ŞENKAYA',
    status: 'NEW',
    priority: 'yuksek',
    targetDate: '2026-04-15',
    isUrgent: true,
    hasRevenueImpact: true,
    isVipSensitive: false,
    needsExternalResource: false,
  });

  // 2. Görev ata
  await addTask({
    requestId: request.id,
    requestNo: request.requestNo,
    requestTitle: request.title,
    title: 'Afiş Tasarımı',
    type: 'Afiş Tasarımı',
    assignedTo: 'u2',
    assignedToName: 'Mehmet Demir',
    status: 'ASN',
    priority: 'yuksek',
    dueDate: request.targetDate,
    checklist: [],
  });

  console.log('Talep ve görev oluşturuldu:', request.requestNo);
};
```

### Senaryo 2: Durum Güncelleme

```typescript
const handleApprove = async (requestId: string) => {
  // Talebi onaylandı olarak işaretle
  await updateRequest(requestId, { status: 'CMP' });
  
  // İlişkili görevleri de güncelle
  const relatedTasks = tasks.filter(t => t.requestId === requestId);
  for (const task of relatedTasks) {
    await updateTask(task.id, { status: 'CMP' });
  }
  
  console.log('Talep onaylandı');
};
```

### Senaryo 3: Revize Talebi

```typescript
const handleRequestRevision = async (requestId: string) => {
  await addRevize({
    requestId,
    source: 'kalite_sorunu',
    reason: 'Renkler marka rehberine uymuyor',
    expectation: 'Marka renk paleti kullanılmalı',
    requestedBy: 'u1',
    requestedByName: 'Atakan ŞENKAYA',
    requestedAt: new Date().toISOString(),
    status: 'acik',
  });

  // Talebi revize durumuna getir
  await updateRequest(requestId, { status: 'RVZ' });
};
```

---

## 📞 Destek

Sorularınız için:
- Google Sheets API Docs: https://developers.google.com/sheets/api
- Google Cloud Console: https://console.cloud.google.com/

---

**Hazırlandı:** HMTRMS Development Team  
**Son Güncelleme:** 2026
