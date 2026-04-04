/**
 * Google Sheets React Hook
 * 
 * Bu hook, React bileşenlerinde Google Sheets ile kolayca çalışmayı sağlar.
 * 
 * Kullanım:
 * ```tsx
 * const { requests, loading, error, addRequest, updateRequest } = useGoogleSheets({
 *   spreadsheetId: 'your_spreadsheet_id',
 *   apiKey: 'your_api_key'
 * });
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { initializeSheetsService, GoogleSheetsService } from '@/services/googleSheets';
import type { Request, Task, Revize, Approval, User } from '@/types';
import type { SheetsConfig } from '@/services/googleSheets';

interface UseGoogleSheetsOptions extends SheetsConfig {
  autoFetch?: boolean;
}

interface UseGoogleSheetsReturn {
  // Veri
  requests: Request[];
  tasks: Task[];
  revizeler: Revize[];
  approvals: Approval[];
  users: User[];
  
  // Durum
  loading: boolean;
  error: string | null;
  
  // CRUD Operasyonları
  fetchAll: () => Promise<void>;
  addRequest: (request: Omit<Request, 'id' | 'requestNo' | 'createdAt' | 'updatedAt'>) => Promise<Request>;
  updateRequest: (id: string, updates: Partial<Request>) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  
  addTask: (task: Omit<Task, 'id' | 'taskNo'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  
  addRevize: (revize: Omit<Revize, 'id' | 'revizeNo'>) => Promise<Revize>;
  updateRevize: (id: string, updates: Partial<Revize>) => Promise<void>;
  
  addApproval: (approval: Omit<Approval, 'id' | 'approvalNo'>) => Promise<Approval>;
  updateApproval: (id: string, updates: Partial<Approval>) => Promise<void>;
}

// ID ve numara oluşturma yardımcıları
let requestCounter = 0;
let taskCounter = 0;
let revizeCounter = 0;
let approvalCounter = 0;

const generateRequestNo = () => {
  requestCounter++;
  return `REQ-2026-${String(requestCounter).padStart(5, '0')}`;
};

const generateTaskNo = () => {
  taskCounter++;
  return `TASK-2026-${String(taskCounter).padStart(5, '0')}`;
};

const generateRevizeNo = () => {
  revizeCounter++;
  return `REV-${String(revizeCounter).padStart(2, '0')}`;
};

const generateApprovalNo = () => {
  approvalCounter++;
  return `ONAY-${String(approvalCounter).padStart(3, '0')}`;
};

export function useGoogleSheets(options: UseGoogleSheetsOptions): UseGoogleSheetsReturn {
  const { autoFetch = true, ...config } = options;
  
  // State
  const [requests, setRequests] = useState<Request[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [revizeler, setRevizeler] = useState<Revize[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [service, setService] = useState<GoogleSheetsService | null>(null);

  // Servisi başlat
  useEffect(() => {
    try {
      const sheetsService = initializeSheetsService(config);
      setService(sheetsService);
    } catch (err) {
      setError('Google Sheets servisi başlatılamadı');
      console.error(err);
    }
  }, [config.spreadsheetId, config.apiKey, config.accessToken]);

  // Tüm verileri çek
  const fetchAll = useCallback(async () => {
    if (!service) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [requestsData, tasksData, revizelerData, approvalsData, usersData] = await Promise.all([
        service.getAllRequests(),
        service.getAllTasks(),
        service.getAllRevizeler(),
        service.getAllApprovals(),
        service.getAllUsers(),
      ]);
      
      setRequests(requestsData);
      setTasks(tasksData);
      setRevizeler(revizelerData);
      setApprovals(approvalsData);
      setUsers(usersData);
      
      // Counter'ları güncelle
      if (requestsData.length > 0) {
        const maxReqNo = Math.max(...requestsData.map(r => {
          const match = r.requestNo.match(/\d+$/);
          return match ? parseInt(match[0]) : 0;
        }));
        requestCounter = maxReqNo;
      }
      
      if (tasksData.length > 0) {
        const maxTaskNo = Math.max(...tasksData.map(t => {
          const match = t.taskNo.match(/\d+$/);
          return match ? parseInt(match[0]) : 0;
        }));
        taskCounter = maxTaskNo;
      }
    } catch (err) {
      setError('Veriler çekilirken hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [service]);

  // İlk yükleme
  useEffect(() => {
    if (autoFetch && service) {
      fetchAll();
    }
  }, [autoFetch, service, fetchAll]);

  // ==================== TALEP OPERASYONLARI ====================

  const addRequest = useCallback(async (requestData: Omit<Request, 'id' | 'requestNo' | 'createdAt' | 'updatedAt'>): Promise<Request> => {
    if (!service) throw new Error('Servis başlatılmadı');
    
    const now = new Date().toISOString();
    const newRequest: Request = {
      ...requestData,
      id: `r${Date.now()}`,
      requestNo: generateRequestNo(),
      createdAt: now,
      updatedAt: now,
    };
    
    await service.addRequest(newRequest);
    setRequests(prev => [newRequest, ...prev]);
    
    return newRequest;
  }, [service]);

  const updateRequest = useCallback(async (id: string, updates: Partial<Request>): Promise<void> => {
    if (!service) throw new Error('Servis başlatılmadı');
    
    await service.updateRequest(id, updates);
    setRequests(prev => prev.map(r => 
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    ));
  }, [service]);

  const deleteRequest = useCallback(async (id: string): Promise<void> => {
    if (!service) throw new Error('Servis başlatılmadı');
    
    // Google Sheets'te silme işlemi (satırı temizle)
    const rowIndex = await service.findRowById('Talepler', 'A', id);
    if (rowIndex) {
      await service.clearValues(`Talepler!A${rowIndex}:O${rowIndex}`);
    }
    
    setRequests(prev => prev.filter(r => r.id !== id));
  }, [service]);

  // ==================== GÖREV OPERASYONLARI ====================

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'taskNo'>): Promise<Task> => {
    if (!service) throw new Error('Servis başlatılmadı');
    
    const newTask: Task = {
      ...taskData,
      id: `t${Date.now()}`,
      taskNo: generateTaskNo(),
    };
    
    await service.addTask(newTask);
    setTasks(prev => [...prev, newTask]);
    
    return newTask;
  }, [service]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>): Promise<void> => {
    if (!service) throw new Error('Servis başlatılmadı');
    
    await service.updateTask(id, updates);
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  }, [service]);

  // ==================== REVİZE OPERASYONLARI ====================

  const addRevize = useCallback(async (revizeData: Omit<Revize, 'id' | 'revizeNo'>): Promise<Revize> => {
    if (!service) throw new Error('Servis başlatılmadı');
    
    const newRevize: Revize = {
      ...revizeData,
      id: `rev${Date.now()}`,
      revizeNo: generateRevizeNo(),
    };
    
    await service.addRevize(newRevize);
    setRevizeler(prev => [...prev, newRevize]);
    
    return newRevize;
  }, [service]);

  const updateRevize = useCallback(async (id: string, updates: Partial<Revize>): Promise<void> => {
    if (!service) throw new Error('Servis başlatılmadı');
    
    // Revizeler için güncelleme fonksiyonu eklenecek
    setRevizeler(prev => prev.map(r => 
      r.id === id ? { ...r, ...updates } : r
    ));
  }, [service]);

  // ==================== ONAY OPERASYONLARI ====================

  const addApproval = useCallback(async (approvalData: Omit<Approval, 'id' | 'approvalNo'>): Promise<Approval> => {
    if (!service) throw new Error('Servis başlatılmadı');
    
    const newApproval: Approval = {
      ...approvalData,
      id: `a${Date.now()}`,
      approvalNo: generateApprovalNo(),
    };
    
    await service.addApproval(newApproval);
    setApprovals(prev => [...prev, newApproval]);
    
    return newApproval;
  }, [service]);

  const updateApproval = useCallback(async (id: string, updates: Partial<Approval>): Promise<void> => {
    if (!service) throw new Error('Servis başlatılmadı');
    
    await service.updateApproval(id, updates);
    setApprovals(prev => prev.map(a => 
      a.id === id ? { ...a, ...updates } : a
    ));
  }, [service]);

  return {
    // Veri
    requests,
    tasks,
    revizeler,
    approvals,
    users,
    
    // Durum
    loading,
    error,
    
    // CRUD Operasyonları
    fetchAll,
    addRequest,
    updateRequest,
    deleteRequest,
    addTask,
    updateTask,
    addRevize,
    updateRevize,
    addApproval,
    updateApproval,
  };
}

export default useGoogleSheets;
