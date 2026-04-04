/**
 * Google Sheets Yapılandırma Dosyası
 * 
 * Bu dosya, Google Sheets API bağlantı ayarlarını içerir.
 * 
 * ⚠️ ÖNEMLİ: Bu dosyadaki hassas bilgileri (API Key, Private Key) asla
 * GitHub'a yüklemeyin! Production ortamında environment variables kullanın.
 */

import type { SheetsConfig } from '@/services/googleSheets';

// ============================================
// GOOGLE SHEETS YAPILANDIRMASI
// ============================================

/**
 * Spreadsheet ID'nizi buraya yapıştırın
 * 
 * Spreadsheet URL'sinden ID'yi alın:
 * https://docs.google.com/spreadsheets/d/[BU_KISIM]/edit
 */
export const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID || '';

/**
 * Google API Key
 * 
 * Google Cloud Console > APIs & Services > Credentials > API Keys
 */
export const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

/**
 * Google OAuth Access Token (Opsiyonel)
 * 
 * OAuth 2.0 ile kimlik doğrulama yapıyorsanız kullanın
 */
export const ACCESS_TOKEN = import.meta.env.VITE_GOOGLE_ACCESS_TOKEN || '';

/**
 * Service Account Email
 * 
 * Google Cloud Console > IAM & Admin > Service Accounts
 */
export const SERVICE_ACCOUNT_EMAIL = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL || '';

/**
 * Service Account Private Key
 * 
 * ⚠️ BU DEĞERİ ASLA GITHUB'A YÜKLEMEYİN!
 * Environment variable olarak kullanın.
 */
export const PRIVATE_KEY = import.meta.env.VITE_GOOGLE_PRIVATE_KEY || '';

// ============================================
// SHEET YAPILANDIRMALARI
// ============================================

/**
 * Her veri tipi için kullanılan sheet isimleri
 */
export const SHEET_NAMES = {
  TALEPLER: 'Talepler',
  GOREVLER: 'Gorevler',
  REVIZELER: 'Revizeler',
  ONAYLAR: 'Onaylar',
  KULLANICILAR: 'Kullanicilar',
  AYARLAR: 'Ayarlar',
} as const;

/**
 * Her sheet için sütun yapılandırması
 */
export const SHEET_COLUMNS = {
  TALEPLER: [
    { name: 'ID', key: 'id', required: true },
    { name: 'TalepNo', key: 'requestNo', required: true },
    { name: 'Baslik', key: 'title', required: true },
    { name: 'Aciklama', key: 'description', required: true },
    { name: 'Departman', key: 'department', required: true },
    { name: 'IsTuru', key: 'workType', required: true },
    { name: 'TalepSahibiID', key: 'requesterId', required: true },
    { name: 'TalepSahibi', key: 'requesterName', required: true },
    { name: 'AtananID', key: 'assignedTo', required: false },
    { name: 'Atanan', key: 'assignedToName', required: false },
    { name: 'Durum', key: 'status', required: true },
    { name: 'Oncelik', key: 'priority', required: true },
    { name: 'HedefTarih', key: 'targetDate', required: true },
    { name: 'OlusturmaTarihi', key: 'createdAt', required: true },
    { name: 'GuncellemeTarihi', key: 'updatedAt', required: true },
  ],
  
  GOREVLER: [
    { name: 'ID', key: 'id', required: true },
    { name: 'GorevNo', key: 'taskNo', required: true },
    { name: 'TalepID', key: 'requestId', required: true },
    { name: 'TalepNo', key: 'requestNo', required: true },
    { name: 'TalepBaslik', key: 'requestTitle', required: true },
    { name: 'GorevBaslik', key: 'title', required: true },
    { name: 'Tur', key: 'type', required: true },
    { name: 'SorumluID', key: 'assignedTo', required: true },
    { name: 'Sorumlu', key: 'assignedToName', required: true },
    { name: 'Durum', key: 'status', required: true },
    { name: 'Oncelik', key: 'priority', required: true },
    { name: 'BitisTarihi', key: 'dueDate', required: true },
  ],
  
  REVIZELER: [
    { name: 'ID', key: 'id', required: true },
    { name: 'RevizeNo', key: 'revizeNo', required: true },
    { name: 'TalepID', key: 'requestId', required: false },
    { name: 'GorevID', key: 'taskId', required: false },
    { name: 'GorevNo', key: 'taskNo', required: false },
    { name: 'Kaynak', key: 'source', required: true },
    { name: 'Neden', key: 'reason', required: true },
    { name: 'Beklenti', key: 'expectation', required: true },
    { name: 'IsteyenID', key: 'requestedBy', required: true },
    { name: 'Isteyen', key: 'requestedByName', required: true },
    { name: 'IstemeTarihi', key: 'requestedAt', required: true },
    { name: 'Durum', key: 'status', required: true },
  ],
  
  ONAYLAR: [
    { name: 'ID', key: 'id', required: true },
    { name: 'OnayNo', key: 'approvalNo', required: true },
    { name: 'TalepID', key: 'requestId', required: true },
    { name: 'TalepNo', key: 'requestNo', required: true },
    { name: 'TalepBaslik', key: 'requestTitle', required: true },
    { name: 'GonderenID', key: 'submittedBy', required: true },
    { name: 'Gonderen', key: 'submittedByName', required: true },
    { name: 'OnayTipi', key: 'approvalType', required: true },
    { name: 'GonderimTarihi', key: 'submittedAt', required: true },
    { name: 'ChecklistTamamlanan', key: 'checklistCompleted', required: true },
    { name: 'ChecklistToplam', key: 'checklistTotal', required: true },
    { name: 'RevizeSayisi', key: 'revizeCount', required: true },
    { name: 'Durum', key: 'status', required: true },
  ],
  
  KULLANICILAR: [
    { name: 'ID', key: 'id', required: true },
    { name: 'AdSoyad', key: 'name', required: true },
    { name: 'Email', key: 'email', required: true },
    { name: 'Rol', key: 'role', required: true },
    { name: 'Departman', key: 'department', required: true },
    { name: 'Avatar', key: 'avatar', required: false },
    { name: 'Aktif', key: 'isActive', required: true },
  ],
} as const;

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

/**
 * SheetsConfig nesnesi oluştur
 */
export const createSheetsConfig = (): SheetsConfig => {
  // API Key veya Access Token kullan
  if (API_KEY) {
    return {
      spreadsheetId: SPREADSHEET_ID,
      apiKey: API_KEY,
    };
  }
  
  if (ACCESS_TOKEN) {
    return {
      spreadsheetId: SPREADSHEET_ID,
      accessToken: ACCESS_TOKEN,
    };
  }
  
  throw new Error('API Key veya Access Token tanımlanmadı!');
};

/**
 * Yapılandırma kontrolü
 */
export const validateConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!SPREADSHEET_ID) {
    errors.push('SPREADSHEET_ID tanımlanmadı');
  }
  
  if (!API_KEY && !ACCESS_TOKEN) {
    errors.push('API_KEY veya ACCESS_TOKEN tanımlanmadı');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// ============================================
// ÖRNEK .env DOSYASI
// ============================================

/*
# .env dosyasına şu satırları ekleyin:

# Google Sheets
VITE_GOOGLE_SHEETS_ID=your_spreadsheet_id_here
VITE_GOOGLE_API_KEY=your_api_key_here

# Opsiyonel - OAuth ile kimlik doğrulama
VITE_GOOGLE_ACCESS_TOKEN=your_access_token_here

# Service Account (Server-side kullanım için)
VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
VITE_GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
*/

export default {
  SPREADSHEET_ID,
  API_KEY,
  ACCESS_TOKEN,
  SERVICE_ACCOUNT_EMAIL,
  PRIVATE_KEY,
  SHEET_NAMES,
  SHEET_COLUMNS,
  createSheetsConfig,
  validateConfig,
};
