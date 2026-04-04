/**
 * Google Sheets API Service
 * 
 * Bu servis, HMTRMS uygulamasının Google Sheets ile iletişimini sağlar.
 * 
 * Kullanım öncesi:
 * 1. Google Cloud Console'da proje oluşturun
 * 2. Google Sheets API'yi etkinleştirin
 * 3. Service Account oluşturun
 * 4. JSON key indirin
 * 5. Spreadsheet'i Service Account ile paylaşın
 */

import type { 
  Request, Task, Revize, Approval, User,
  DepartmentConfig, RoleConfig, WorkTypeConfig, UserWorkTypeMapping, ExtendedUser 
} from '@/types';

// Google Sheets API yapılandırması
interface SheetsConfig {
  spreadsheetId: string;
  apiKey?: string;
  accessToken?: string;
}

// Sheet isimleri
const SHEETS = {
  TALEPLER: 'Talepler',
  GOREVLER: 'Gorevler',
  REVIZELER: 'Revizeler',
  ONAYLAR: 'Onaylar',
  KULLANICILAR: 'Kullanicilar',
  AYARLAR: 'Ayarlar',
  DEPARTMANLAR: 'Departmanlar',
  ROLLER: 'Roller',
  ISTURLERI: 'IsTurleri',
  KULLANICI_IS_TURLERI: 'KullaniciIsTurleri',
} as const;

class GoogleSheetsService {
  private config: SheetsConfig;
  private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  constructor(config: SheetsConfig) {
    this.config = config;
  }

  /**
   * API Key veya Access Token ile kimlik doğrulama
   */
  private getAuthParams(): string {
    if (this.config.accessToken) {
      return `access_token=${this.config.accessToken}`;
    }
    if (this.config.apiKey) {
      return `key=${this.config.apiKey}`;
    }
    throw new Error('API Key veya Access Token gerekli');
  }

  /**
   * Belirli bir range'den veri oku
   */
  async getValues(range: string): Promise<any[][]> {
    try {
      const url = `${this.baseUrl}/${this.config.spreadsheetId}/values/${range}?${this.getAuthParams()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.values || [];
    } catch (error) {
      console.error('Google Sheets okuma hatası:', error);
      throw error;
    }
  }

  /**
   * Yeni satır ekle
   */
  async appendValues(range: string, values: any[][]): Promise<void> {
    try {
      const url = `${this.baseUrl}/${this.config.spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&${this.getAuthParams()}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Google Sheets ekleme hatası:', error);
      throw error;
    }
  }

  /**
   * Mevcut satırı güncelle
   */
  async updateValues(range: string, values: any[][]): Promise<void> {
    try {
      const url = `${this.baseUrl}/${this.config.spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED&${this.getAuthParams()}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Google Sheets güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Satır sil (temizle)
   */
  async clearValues(range: string): Promise<void> {
    try {
      const url = `${this.baseUrl}/${this.config.spreadsheetId}/values/${range}:clear?${this.getAuthParams()}`;
      
      const response = await fetch(url, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Google Sheets silme hatası:', error);
      throw error;
    }
  }

  /**
   * ID'ye göre satır bul
   */
  async findRowById(sheetName: string, idColumn: string, id: string): Promise<number | null> {
    try {
      const values = await this.getValues(`${sheetName}!${idColumn}:${idColumn}`);
      
      for (let i = 0; i < values.length; i++) {
        if (values[i][0] === id) {
          return i + 1; // 1-based index
        }
      }
      
      return null;
    } catch (error) {
      console.error('Satır bulma hatası:', error);
      return null;
    }
  }

  // ==================== TALEPLER İŞLEMLERİ ====================

  /**
   * Tüm talepleri getir
   */
  async getAllRequests(): Promise<Request[]> {
    try {
      const values = await this.getValues(`${SHEETS.TALEPLER}!A2:M`);
      
      return values.map(row => ({
        id: row[0] || '',
        requestNo: row[1] || '',
        title: row[2] || '',
        description: row[3] || '',
        department: row[4] || '',
        workType: row[5] || '',
        requesterId: row[6] || '',
        requesterName: row[7] || '',
        assignedTo: row[8] || undefined,
        assignedToName: row[9] || undefined,
        status: row[10] || 'NEW',
        priority: row[11] || 'normal',
        targetDate: row[12] || '',
        createdAt: row[13] || new Date().toISOString(),
        updatedAt: row[14] || new Date().toISOString(),
      } as Request));
    } catch (error) {
      console.error('Talepleri getirme hatası:', error);
      return [];
    }
  }

  /**
   * Yeni talep ekle
   */
  async addRequest(request: Request): Promise<void> {
    const row = [
      request.id,
      request.requestNo,
      request.title,
      request.description,
      request.department,
      request.workType,
      request.requesterId,
      request.requesterName,
      request.assignedTo || '',
      request.assignedToName || '',
      request.status,
      request.priority,
      request.targetDate,
      request.createdAt,
      request.updatedAt,
    ];

    await this.appendValues(`${SHEETS.TALEPLER}!A2:O`, [row]);
  }

  /**
   * Talep güncelle
   */
  async updateRequest(requestId: string, updates: Partial<Request>): Promise<void> {
    const rowIndex = await this.findRowById(SHEETS.TALEPLER, 'A', requestId);
    
    if (!rowIndex) {
      throw new Error('Talep bulunamadı');
    }

    // Mevcut veriyi al
    const currentData = await this.getValues(`${SHEETS.TALEPLER}!A${rowIndex}:O${rowIndex}`);
    
    if (currentData.length === 0) {
      throw new Error('Talep verisi bulunamadı');
    }

    // Güncellemeleri uygula
    const updatedRow = [
      updates.id ?? currentData[0][0],
      updates.requestNo ?? currentData[0][1],
      updates.title ?? currentData[0][2],
      updates.description ?? currentData[0][3],
      updates.department ?? currentData[0][4],
      updates.workType ?? currentData[0][5],
      updates.requesterId ?? currentData[0][6],
      updates.requesterName ?? currentData[0][7],
      updates.assignedTo ?? currentData[0][8],
      updates.assignedToName ?? currentData[0][9],
      updates.status ?? currentData[0][10],
      updates.priority ?? currentData[0][11],
      updates.targetDate ?? currentData[0][12],
      currentData[0][13], // createdAt değişmez
      new Date().toISOString(), // updatedAt
    ];

    await this.updateValues(`${SHEETS.TALEPLER}!A${rowIndex}:O${rowIndex}`, [updatedRow]);
  }

  // ==================== GÖREVLER İŞLEMLERİ ====================

  /**
   * Tüm görevleri getir
   */
  async getAllTasks(): Promise<Task[]> {
    try {
      const values = await this.getValues(`${SHEETS.GOREVLER}!A2:L`);
      
      return values.map(row => ({
        id: row[0] || '',
        taskNo: row[1] || '',
        requestId: row[2] || '',
        requestNo: row[3] || '',
        requestTitle: row[4] || '',
        title: row[5] || '',
        type: row[6] || '',
        assignedTo: row[7] || '',
        assignedToName: row[8] || '',
        status: row[9] || 'ASN',
        priority: row[10] || 'normal',
        dueDate: row[11] || '',
      } as Task));
    } catch (error) {
      console.error('Görevleri getirme hatası:', error);
      return [];
    }
  }

  /**
   * Yeni görev ekle
   */
  async addTask(task: Task): Promise<void> {
    const row = [
      task.id,
      task.taskNo,
      task.requestId,
      task.requestNo,
      task.requestTitle,
      task.title,
      task.type,
      task.assignedTo,
      task.assignedToName,
      task.status,
      task.priority,
      task.dueDate,
    ];

    await this.appendValues(`${SHEETS.GOREVLER}!A2:L`, [row]);
  }

  /**
   * Görev güncelle
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const rowIndex = await this.findRowById(SHEETS.GOREVLER, 'A', taskId);
    
    if (!rowIndex) {
      throw new Error('Görev bulunamadı');
    }

    const currentData = await this.getValues(`${SHEETS.GOREVLER}!A${rowIndex}:L${rowIndex}`);
    
    const updatedRow = [
      updates.id ?? currentData[0][0],
      updates.taskNo ?? currentData[0][1],
      updates.requestId ?? currentData[0][2],
      updates.requestNo ?? currentData[0][3],
      updates.requestTitle ?? currentData[0][4],
      updates.title ?? currentData[0][5],
      updates.type ?? currentData[0][6],
      updates.assignedTo ?? currentData[0][7],
      updates.assignedToName ?? currentData[0][8],
      updates.status ?? currentData[0][9],
      updates.priority ?? currentData[0][10],
      updates.dueDate ?? currentData[0][11],
    ];

    await this.updateValues(`${SHEETS.GOREVLER}!A${rowIndex}:L${rowIndex}`, [updatedRow]);
  }

  // ==================== REVİZELER İŞLEMLERİ ====================

  /**
   * Tüm revizeleri getir
   */
  async getAllRevizeler(): Promise<Revize[]> {
    try {
      const values = await this.getValues(`${SHEETS.REVIZELER}!A2:J`);
      
      return values.map(row => ({
        id: row[0] || '',
        revizeNo: row[1] || '',
        requestId: row[2] || undefined,
        taskId: row[3] || undefined,
        taskNo: row[4] || undefined,
        source: row[5] || 'brief_eksikligi',
        reason: row[6] || '',
        expectation: row[7] || '',
        requestedBy: row[8] || '',
        requestedByName: row[9] || '',
        requestedAt: row[10] || new Date().toISOString(),
        status: row[11] || 'acik',
      } as Revize));
    } catch (error) {
      console.error('Revizeleri getirme hatası:', error);
      return [];
    }
  }

  /**
   * Yeni revize ekle
   */
  async addRevize(revize: Revize): Promise<void> {
    const row = [
      revize.id,
      revize.revizeNo,
      revize.requestId || '',
      revize.taskId || '',
      revize.taskNo || '',
      revize.source,
      revize.reason,
      revize.expectation,
      revize.requestedBy,
      revize.requestedByName,
      revize.requestedAt,
      revize.status,
    ];

    await this.appendValues(`${SHEETS.REVIZELER}!A2:L`, [row]);
  }

  // ==================== ONAYLAR İŞLEMLERİ ====================

  /**
   * Tüm onayları getir
   */
  async getAllApprovals(): Promise<Approval[]> {
    try {
      const values = await this.getValues(`${SHEETS.ONAYLAR}!A2:K`);
      
      return values.map(row => ({
        id: row[0] || '',
        approvalNo: row[1] || '',
        requestId: row[2] || '',
        requestNo: row[3] || '',
        requestTitle: row[4] || '',
        submittedBy: row[5] || '',
        submittedByName: row[6] || '',
        approvalType: row[7] || 'son_onay',
        submittedAt: row[8] || new Date().toISOString(),
        checklistCompleted: parseInt(row[9]) || 0,
        checklistTotal: parseInt(row[10]) || 0,
        revizeCount: parseInt(row[11]) || 0,
        status: row[12] || 'bekliyor',
      } as Approval));
    } catch (error) {
      console.error('Onayları getirme hatası:', error);
      return [];
    }
  }

  /**
   * Yeni onay ekle
   */
  async addApproval(approval: Approval): Promise<void> {
    const row = [
      approval.id,
      approval.approvalNo,
      approval.requestId,
      approval.requestNo,
      approval.requestTitle,
      approval.submittedBy,
      approval.submittedByName,
      approval.approvalType,
      approval.submittedAt,
      approval.checklistCompleted,
      approval.checklistTotal,
      approval.revizeCount,
      approval.status,
    ];

    await this.appendValues(`${SHEETS.ONAYLAR}!A2:M`, [row]);
  }

  /**
   * Onay güncelle
   */
  async updateApproval(approvalId: string, updates: Partial<Approval>): Promise<void> {
    const rowIndex = await this.findRowById(SHEETS.ONAYLAR, 'A', approvalId);
    
    if (!rowIndex) {
      throw new Error('Onay bulunamadı');
    }

    const currentData = await this.getValues(`${SHEETS.ONAYLAR}!A${rowIndex}:M${rowIndex}`);
    
    const updatedRow = [
      updates.id ?? currentData[0][0],
      updates.approvalNo ?? currentData[0][1],
      updates.requestId ?? currentData[0][2],
      updates.requestNo ?? currentData[0][3],
      updates.requestTitle ?? currentData[0][4],
      updates.submittedBy ?? currentData[0][5],
      updates.submittedByName ?? currentData[0][6],
      updates.approvalType ?? currentData[0][7],
      currentData[0][8], // submittedAt değişmez
      updates.checklistCompleted ?? currentData[0][9],
      updates.checklistTotal ?? currentData[0][10],
      updates.revizeCount ?? currentData[0][11],
      updates.status ?? currentData[0][12],
    ];

    await this.updateValues(`${SHEETS.ONAYLAR}!A${rowIndex}:M${rowIndex}`, [updatedRow]);
  }

  // ==================== KULLANICILAR İŞLEMLERİ ====================

  /**
   * Tüm kullanıcıları getir
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const values = await this.getValues(`${SHEETS.KULLANICILAR}!A2:G`);
      
      return values.map(row => ({
        id: row[0] || '',
        name: row[1] || '',
        email: row[2] || '',
        role: row[3] || 'talep_sahibi',
        department: row[4] || '',
        avatar: row[5] || undefined,
        isActive: row[6] === 'true' || row[6] === 'TRUE',
      } as User));
    } catch (error) {
      console.error('Kullanıcıları getirme hatası:', error);
      return [];
    }
  }

  /**
   * Genişletilmiş kullanıcıları getir (avatar ve detaylar ile)
   */
  async getAllExtendedUsers(): Promise<ExtendedUser[]> {
    try {
      const values = await this.getValues(`${SHEETS.KULLANICILAR}!A2:M`);
      
      return values.map(row => ({
        id: row[0] || '',
        name: row[1] || '',
        email: row[2] || '',
        role: row[3] || 'talep_sahibi',
        department: row[4] || '',
        avatar: row[5] || undefined,
        isActive: row[6] === 'true' || row[6] === 'TRUE',
        phone: row[7] || undefined,
        title: row[8] || undefined,
        joinDate: row[9] || undefined,
        bio: row[10] || undefined,
        avatarUrl: row[11] || undefined,
        maxConcurrentTasks: parseInt(row[12]) || 5,
        createdAt: row[13] || new Date().toISOString(),
        updatedAt: row[14] || new Date().toISOString(),
      } as ExtendedUser));
    } catch (error) {
      console.error('Kullanıcıları getirme hatası:', error);
      return [];
    }
  }

  /**
   * Yeni kullanıcı ekle
   */
  async addUser(user: ExtendedUser): Promise<void> {
    const row = [
      user.id,
      user.name,
      user.email,
      user.role,
      user.department,
      user.avatar || '',
      user.isActive ? 'true' : 'false',
      user.phone || '',
      user.title || '',
      user.joinDate || '',
      user.bio || '',
      user.avatarUrl || '',
      user.maxConcurrentTasks || 5,
      user.createdAt,
      user.updatedAt,
    ];

    await this.appendValues(`${SHEETS.KULLANICILAR}!A2:O`, [row]);
  }

  /**
   * Kullanıcı güncelle
   */
  async updateUser(userId: string, updates: Partial<ExtendedUser>): Promise<void> {
    const rowIndex = await this.findRowById(SHEETS.KULLANICILAR, 'A', userId);
    
    if (!rowIndex) {
      throw new Error('Kullanıcı bulunamadı');
    }

    const currentData = await this.getValues(`${SHEETS.KULLANICILAR}!A${rowIndex}:O${rowIndex}`);
    
    const updatedRow = [
      updates.id ?? currentData[0][0],
      updates.name ?? currentData[0][1],
      updates.email ?? currentData[0][2],
      updates.role ?? currentData[0][3],
      updates.department ?? currentData[0][4],
      updates.avatar ?? currentData[0][5],
      updates.isActive !== undefined ? (updates.isActive ? 'true' : 'false') : currentData[0][6],
      updates.phone ?? currentData[0][7],
      updates.title ?? currentData[0][8],
      updates.joinDate ?? currentData[0][9],
      updates.bio ?? currentData[0][10],
      updates.avatarUrl ?? currentData[0][11],
      updates.maxConcurrentTasks ?? currentData[0][12],
      currentData[0][13], // createdAt değişmez
      new Date().toISOString(), // updatedAt
    ];

    await this.updateValues(`${SHEETS.KULLANICILAR}!A${rowIndex}:O${rowIndex}`, [updatedRow]);
  }

  // ==================== DEPARTMAN YÖNETİMİ ====================

  /**
   * Tüm departmanları getir
   */
  async getAllDepartments(): Promise<DepartmentConfig[]> {
    try {
      const values = await this.getValues(`${SHEETS.DEPARTMANLAR}!A2:H`);
      
      return values.map(row => ({
        id: row[0] || '',
        code: row[1] || '',
        name: row[2] || '',
        description: row[3] || '',
        managerId: row[4] || undefined,
        managerName: row[5] || undefined,
        isActive: row[6] === 'true' || row[6] === 'TRUE',
        createdAt: row[7] || new Date().toISOString(),
        updatedAt: row[8] || new Date().toISOString(),
      } as DepartmentConfig));
    } catch (error) {
      console.error('Departmanları getirme hatası:', error);
      return [];
    }
  }

  /**
   * Yeni departman ekle
   */
  async addDepartment(dept: DepartmentConfig): Promise<void> {
    const row = [
      dept.id,
      dept.code,
      dept.name,
      dept.description || '',
      dept.managerId || '',
      dept.managerName || '',
      dept.isActive ? 'true' : 'false',
      dept.createdAt,
      dept.updatedAt,
    ];

    await this.appendValues(`${SHEETS.DEPARTMANLAR}!A2:I`, [row]);
  }

  /**
   * Departman güncelle
   */
  async updateDepartment(deptId: string, updates: Partial<DepartmentConfig>): Promise<void> {
    const rowIndex = await this.findRowById(SHEETS.DEPARTMANLAR, 'A', deptId);
    
    if (!rowIndex) {
      throw new Error('Departman bulunamadı');
    }

    const currentData = await this.getValues(`${SHEETS.DEPARTMANLAR}!A${rowIndex}:I${rowIndex}`);
    
    const updatedRow = [
      updates.id ?? currentData[0][0],
      updates.code ?? currentData[0][1],
      updates.name ?? currentData[0][2],
      updates.description ?? currentData[0][3],
      updates.managerId ?? currentData[0][4],
      updates.managerName ?? currentData[0][5],
      updates.isActive !== undefined ? (updates.isActive ? 'true' : 'false') : currentData[0][6],
      currentData[0][7], // createdAt değişmez
      new Date().toISOString(), // updatedAt
    ];

    await this.updateValues(`${SHEETS.DEPARTMANLAR}!A${rowIndex}:I${rowIndex}`, [updatedRow]);
  }

  /**
   * Departman sil (pasif yap)
   */
  async deleteDepartment(deptId: string): Promise<void> {
    await this.updateDepartment(deptId, { isActive: false });
  }

  // ==================== ROL YÖNETİMİ ====================

  /**
   * Tüm rolleri getir
   */
  async getAllRoles(): Promise<RoleConfig[]> {
    try {
      const values = await this.getValues(`${SHEETS.ROLLER}!A2:H`);
      
      return values.map(row => ({
        id: row[0] || '',
        code: row[1] || '',
        name: row[2] || '',
        description: row[3] || '',
        permissions: row[4] ? row[4].split(',') : [],
        level: parseInt(row[5]) || 1,
        isActive: row[6] === 'true' || row[6] === 'TRUE',
        createdAt: row[7] || new Date().toISOString(),
        updatedAt: row[8] || new Date().toISOString(),
      } as RoleConfig));
    } catch (error) {
      console.error('Rolleri getirme hatası:', error);
      return [];
    }
  }

  /**
   * Yeni rol ekle
   */
  async addRole(role: RoleConfig): Promise<void> {
    const row = [
      role.id,
      role.code,
      role.name,
      role.description || '',
      role.permissions.join(','),
      role.level,
      role.isActive ? 'true' : 'false',
      role.createdAt,
      role.updatedAt,
    ];

    await this.appendValues(`${SHEETS.ROLLER}!A2:I`, [row]);
  }

  /**
   * Rol güncelle
   */
  async updateRole(roleId: string, updates: Partial<RoleConfig>): Promise<void> {
    const rowIndex = await this.findRowById(SHEETS.ROLLER, 'A', roleId);
    
    if (!rowIndex) {
      throw new Error('Rol bulunamadı');
    }

    const currentData = await this.getValues(`${SHEETS.ROLLER}!A${rowIndex}:I${rowIndex}`);
    
    const updatedRow = [
      updates.id ?? currentData[0][0],
      updates.code ?? currentData[0][1],
      updates.name ?? currentData[0][2],
      updates.description ?? currentData[0][3],
      updates.permissions ? updates.permissions.join(',') : currentData[0][4],
      updates.level ?? currentData[0][5],
      updates.isActive !== undefined ? (updates.isActive ? 'true' : 'false') : currentData[0][6],
      currentData[0][7], // createdAt değişmez
      new Date().toISOString(), // updatedAt
    ];

    await this.updateValues(`${SHEETS.ROLLER}!A${rowIndex}:I${rowIndex}`, [updatedRow]);
  }

  // ==================== İŞ TÜRÜ YÖNETİMİ ====================

  /**
   * Tüm iş türlerini getir
   */
  async getAllWorkTypes(): Promise<WorkTypeConfig[]> {
    try {
      const values = await this.getValues(`${SHEETS.ISTURLERI}!A2:H`);
      
      return values.map(row => ({
        id: row[0] || '',
        code: row[1] || '',
        name: row[2] || '',
        description: row[3] || '',
        category: row[4] || '',
        estimatedHours: parseInt(row[5]) || 0,
        defaultChecklist: row[6] ? row[6].split('|') : [],
        isActive: row[7] === 'true' || row[7] === 'TRUE',
        createdAt: row[8] || new Date().toISOString(),
        updatedAt: row[9] || new Date().toISOString(),
      } as WorkTypeConfig));
    } catch (error) {
      console.error('İş türlerini getirme hatası:', error);
      return [];
    }
  }

  /**
   * Yeni iş türü ekle
   */
  async addWorkType(workType: WorkTypeConfig): Promise<void> {
    const row = [
      workType.id,
      workType.code,
      workType.name,
      workType.description || '',
      workType.category || '',
      workType.estimatedHours || 0,
      workType.defaultChecklist ? workType.defaultChecklist.join('|') : '',
      workType.isActive ? 'true' : 'false',
      workType.createdAt,
      workType.updatedAt,
    ];

    await this.appendValues(`${SHEETS.ISTURLERI}!A2:J`, [row]);
  }

  /**
   * İş türü güncelle
   */
  async updateWorkType(workTypeId: string, updates: Partial<WorkTypeConfig>): Promise<void> {
    const rowIndex = await this.findRowById(SHEETS.ISTURLERI, 'A', workTypeId);
    
    if (!rowIndex) {
      throw new Error('İş türü bulunamadı');
    }

    const currentData = await this.getValues(`${SHEETS.ISTURLERI}!A${rowIndex}:J${rowIndex}`);
    
    const updatedRow = [
      updates.id ?? currentData[0][0],
      updates.code ?? currentData[0][1],
      updates.name ?? currentData[0][2],
      updates.description ?? currentData[0][3],
      updates.category ?? currentData[0][4],
      updates.estimatedHours ?? currentData[0][5],
      updates.defaultChecklist ? updates.defaultChecklist.join('|') : currentData[0][6],
      updates.isActive !== undefined ? (updates.isActive ? 'true' : 'false') : currentData[0][7],
      currentData[0][8], // createdAt değişmez
      new Date().toISOString(), // updatedAt
    ];

    await this.updateValues(`${SHEETS.ISTURLERI}!A${rowIndex}:J${rowIndex}`, [updatedRow]);
  }

  // ==================== KULLANICI-İŞ TÜRÜ EŞLEŞTİRMESİ ====================

  /**
   * Tüm kullanıcı-iş türü eşleştirmelerini getir
   */
  async getAllUserWorkTypeMappings(): Promise<UserWorkTypeMapping[]> {
    try {
      const values = await this.getValues(`${SHEETS.KULLANICI_IS_TURLERI}!A2:H`);
      
      return values.map(row => ({
        id: row[0] || '',
        userId: row[1] || '',
        userName: row[2] || '',
        workTypeId: row[3] || '',
        workTypeName: row[4] || '',
        proficiency: row[5] || 'orta',
        isPrimary: row[6] === 'true' || row[6] === 'TRUE',
        isActive: row[7] === 'true' || row[7] === 'TRUE',
        createdAt: row[8] || new Date().toISOString(),
        updatedAt: row[9] || new Date().toISOString(),
      } as UserWorkTypeMapping));
    } catch (error) {
      console.error('Eşleştirmeleri getirme hatası:', error);
      return [];
    }
  }

  /**
   * Kullanıcıya göre iş türü eşleştirmelerini getir
   */
  async getUserWorkTypeMappings(userId: string): Promise<UserWorkTypeMapping[]> {
    const allMappings = await this.getAllUserWorkTypeMappings();
    return allMappings.filter(m => m.userId === userId && m.isActive);
  }

  /**
   * Yeni eşleştirme ekle
   */
  async addUserWorkTypeMapping(mapping: UserWorkTypeMapping): Promise<void> {
    const row = [
      mapping.id,
      mapping.userId,
      mapping.userName,
      mapping.workTypeId,
      mapping.workTypeName,
      mapping.proficiency,
      mapping.isPrimary ? 'true' : 'false',
      mapping.isActive ? 'true' : 'false',
      mapping.createdAt,
      mapping.updatedAt,
    ];

    await this.appendValues(`${SHEETS.KULLANICI_IS_TURLERI}!A2:J`, [row]);
  }

  /**
   * Eşleştirme güncelle
   */
  async updateUserWorkTypeMapping(mappingId: string, updates: Partial<UserWorkTypeMapping>): Promise<void> {
    const rowIndex = await this.findRowById(SHEETS.KULLANICI_IS_TURLERI, 'A', mappingId);
    
    if (!rowIndex) {
      throw new Error('Eşleştirme bulunamadı');
    }

    const currentData = await this.getValues(`${SHEETS.KULLANICI_IS_TURLERI}!A${rowIndex}:J${rowIndex}`);
    
    const updatedRow = [
      updates.id ?? currentData[0][0],
      updates.userId ?? currentData[0][1],
      updates.userName ?? currentData[0][2],
      updates.workTypeId ?? currentData[0][3],
      updates.workTypeName ?? currentData[0][4],
      updates.proficiency ?? currentData[0][5],
      updates.isPrimary !== undefined ? (updates.isPrimary ? 'true' : 'false') : currentData[0][6],
      updates.isActive !== undefined ? (updates.isActive ? 'true' : 'false') : currentData[0][7],
      currentData[0][8], // createdAt değişmez
      new Date().toISOString(), // updatedAt
    ];

    await this.updateValues(`${SHEETS.KULLANICI_IS_TURLERI}!A${rowIndex}:J${rowIndex}`, [updatedRow]);
  }

  /**
   * Eşleştirme sil (pasif yap)
   */
  async deleteUserWorkTypeMapping(mappingId: string): Promise<void> {
    await this.updateUserWorkTypeMapping(mappingId, { isActive: false });
  }
}

// Singleton instance
let sheetsServiceInstance: GoogleSheetsService | null = null;

export const initializeSheetsService = (config: SheetsConfig): GoogleSheetsService => {
  sheetsServiceInstance = new GoogleSheetsService(config);
  return sheetsServiceInstance;
};

export const getSheetsService = (): GoogleSheetsService => {
  if (!sheetsServiceInstance) {
    throw new Error('Google Sheets servisi henüz başlatılmadı');
  }
  return sheetsServiceInstance;
};

export { GoogleSheetsService, SHEETS };
export type { SheetsConfig };
