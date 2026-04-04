// HMTRMS - Hotel Marketing Request Management System Types

export type UserRole = 'talep_sahibi' | 'uygulayici' | 'koordinator' | 'yonetici' | 'gm' | 'admin';

export type RequestStatus = 
  | 'NEW'      // Yeni Talep
  | 'REV'      // İnceleniyor
  | 'BRF'      // Eksik Brief
  | 'ASN'      // Atandı
  | 'WIP'      // Yapım Aşamasında
  | 'QCC'      // İç Kontrolde
  | 'APW'      // Onay Bekliyor
  | 'RVZ'      // Revizede
  | 'CMP'      // Tamamlandı
  | 'PUB'      // Yayınlandı
  | 'CAN';     // İptal

export type Priority = 'dusuk' | 'normal' | 'yuksek' | 'kritik';

export type Department = 'F&B' | 'Events' | 'Sales' | 'Spa' | 'HR' | 'Wedding' | 'Entertainment' | 'Pazarlama' | 'Yönetim';

export type WorkType = 
  | 'Afiş Tasarımı'
  | 'Sosyal Medya'
  | 'Video Edit'
  | 'Broşür'
  | 'Menü'
  | 'Sunum'
  | 'Story'
  | 'Bülten'
  | 'Fotoğraf'
  | 'Diğer';

export type RevizeSource = 'brief_eksikligi' | 'kalite_sorunu' | 'yon_degisikligi' | 'dis_faktor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  avatar?: string;
  isActive: boolean;
}

export interface Request {
  id: string;
  requestNo: string;
  title: string;
  description: string;
  department: Department;
  workType: WorkType;
  requesterId: string;
  requesterName: string;
  assignedTo?: string;
  assignedToName?: string;
  status: RequestStatus;
  priority: Priority;
  isUrgent: boolean;
  targetDate: string;
  publishDate?: string;
  facility?: string;
  outlet?: string;
  campaign?: string;
  language?: string;
  format?: string;
  mandatoryText?: string;
  referenceUrl?: string;
  approver?: string;
  strategicImportance?: string;
  hasRevenueImpact: boolean;
  isVipSensitive: boolean;
  needsExternalResource: boolean;
  parentRequestNo?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  // Gecikme ve revize yönetimi alanları
  delayedDays?: number;              // Gecikme gün sayısı
  isDelayedCompleted?: boolean;      // Gecikmeli tamamlandı mı
  revizeCount?: number;              // Toplam revize sayısı (varsayılan: 0)
  maxRevizeReached?: boolean;        // Maksimum revizeye ulaşıldı mı
  transferredFromRequestNo?: string; // Hangi talepten aktarıldı
  transferredRevizeHistory?: RevizeHistoryItem[]; // Aktarılan revize geçmişi
}

// Revize geçmişi için interface
export interface RevizeHistoryItem {
  revizeNo: string;
  revizeNumber: number;
  reason: string;
  expectation: string;
  requestedAt: string;
  requestedByName: string;
}

export interface Task {
  id: string;
  taskNo: string;
  requestId: string;
  requestNo: string;
  requestTitle: string;
  title: string;
  type: WorkType;
  assignedTo: string;
  assignedToName: string;
  reviewerId?: string;
  reviewerName?: string;
  status: RequestStatus;
  priority: Priority;
  dueDate: string;
  completedAt?: string;
  checklist: ChecklistItem[];
  deliverableUrl?: string;
  deliverableNote?: string;
  spentHours?: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  isMandatory: boolean;
}

export interface Revize {
  id: string;
  revizeNo: string;
  requestId?: string;
  taskId?: string;
  taskNo?: string;
  source: RevizeSource;
  reason: string;
  expectation: string;
  referenceUrl?: string;
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  status: 'acik' | 'cozuldu' | 'reddedildi';
  resolvedAt?: string;
  revizeNumber: number; // Kaçıncı revize olduğu (1-10)
}

export interface Comment {
  id: string;
  requestId?: string;
  taskId?: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'deadline' | 'revize' | 'onay' | 'tamamlandi' | 'yorum';
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Approval {
  id: string;
  approvalNo: string;
  requestId: string;
  requestNo: string;
  requestTitle: string;
  submittedBy: string;
  submittedByName: string;
  approvalType: 'son_onay' | 'ic_onay';
  submittedAt: string;
  deliverableUrl?: string;
  deliverableNote?: string;
  checklistCompleted: number;
  checklistTotal: number;
  revizeCount: number;
  status: 'bekliyor' | 'onaylandi' | 'reddedildi';
}

export interface DashboardStats {
  todayNew: number;
  delayed: number;
  waitingApproval: number;
  inRevision: number;
  thisWeekDeadline: number;
}

export interface WorkloadItem {
  userId: string;
  userName: string;
  taskCount: number;
}

export interface DepartmentStats {
  department: Department;
  requestCount: number;
}

// ============================================
// YÖNETİM PANELİ TİPLERİ
// ============================================

// Departman Yapılandırması
export interface DepartmentConfig {
  id: string;
  code: string;           // Kısa kod (F&B, HR vb.)
  name: string;           // Tam ad
  description?: string;   // Açıklama
  managerId?: string;     // Departman müdürü
  managerName?: string;   // Müdür adı
  isActive: boolean;      // Aktif/Pasif
  createdAt: string;
  updatedAt: string;
}

// Rol Yapılandırması
export interface RoleConfig {
  id: string;
  code: UserRole;         // Rol kodu
  name: string;           // Görünen ad
  description?: string;   // Açıklama
  permissions: string[];  // İzinler listesi
  level: number;          // Hiyerarşik seviye (1-10)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Talep Türü Yapılandırması
export interface WorkTypeConfig {
  id: string;
  code: string;           // Kısa kod
  name: string;           // Görünen ad
  description?: string;   // Açıklama
  category?: string;      // Kategori (Tasarım, Video, Metin vb.)
  estimatedHours?: number; // Tahmini süre (saat)
  defaultChecklist?: string[]; // Varsayılan checklist maddeleri
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Kullanıcı-Görev Eşleştirmesi
export interface UserWorkTypeMapping {
  id: string;
  userId: string;
  userName: string;
  workTypeId: string;
  workTypeName: string;
  proficiency: 'baslangic' | 'orta' | 'ileri' | 'uzman'; // Yetkinlik seviyesi
  isPrimary: boolean;     // Ana uzmanlık alanı mı?
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Genişletilmiş Kullanıcı (Avatar ve görev eşleştirmesi ile)
export interface ExtendedUser extends User {
  phone?: string;
  title?: string;         // Unvan
  joinDate?: string;      // İşe giriş tarihi
  bio?: string;           // Kısa biyografi
  avatarUrl?: string;     // Avatar görsel URL
  workTypes?: string[];   // Uzman olduğu iş türleri ID'leri
  maxConcurrentTasks?: number; // Aynı anda üstlenebileceği max görev
  createdAt: string;
  updatedAt: string;
}
