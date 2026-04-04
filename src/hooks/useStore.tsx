import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Request, Task, Revize, Approval, Comment, User, RevizeHistoryItem } from '@/types';
import {
  fetchAllData,
  dbAddRequest,
  dbUpdateRequest,
  dbDeleteRequest,
  dbAddTask,
  dbUpdateTask,
  dbAddRevize,
  dbUpdateRevize,
  dbAddApproval,
  dbUpdateApproval,
  dbAddComment,
  getNextRequestNo,
  getNextTaskNo,
  getNextApprovalNo,
} from '@/services/supabaseService';

interface StoreState {
  // Data
  requests: Request[];
  tasks: Task[];
  revizeler: Revize[];
  approvals: Approval[];
  comments: Comment[];
  users: User[];
  currentUser: User;
  isLoading: boolean;
  
  // User Management
  updateUsers: (users: User[]) => void;
  
  // UI State
  currentView: string;
  selectedRequestId: string | null;
  selectedTaskId: string | null;
  
  // Actions
  setCurrentView: (view: string) => void;
  setSelectedRequestId: (id: string | null) => void;
  setSelectedTaskId: (id: string | null) => void;
  
  // CRUD Operations
  addRequest: (request: Omit<Request, 'id' | 'requestNo' | 'createdAt' | 'updatedAt'>) => Request;
  updateRequest: (id: string, updates: Partial<Request>) => void;
  deleteRequest: (id: string) => void;
  
  addTask: (task: Omit<Task, 'id' | 'taskNo'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  
  addRevize: (revize: Omit<Revize, 'id' | 'revizeNo'>) => Revize;
  updateRevize: (id: string, updates: Partial<Revize>) => void;
  
  addApproval: (approval: Omit<Approval, 'id' | 'approvalNo'>) => Approval;
  updateApproval: (id: string, updates: Partial<Approval>) => void;
  
  addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => Comment;
  
  // Gecikme ve revize yönetimi
  completeRequestWithDelay: (id: string, note?: string) => void;
  addRevizeWithLimit: (revizeData: Omit<Revize, 'id' | 'revizeNo' | 'revizeNumber'>, requestId: string) => { success: boolean; message: string; transferred?: boolean; newRequest?: Request };
  transferRequest: (requestId: string) => Request | null;
}

const StoreContext = createContext<StoreState | undefined>(undefined);

let requestCounter = 72;
let taskCounter = 9;
let revizeCounter = 4;
let approvalCounter = 2;

export function StoreProvider({ children, currentUser }: { children: ReactNode; currentUser: User }) {
  // Data State
  const [requests, setRequests] = useState<Request[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [revizeler, setRevizeler] = useState<Revize[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsersState] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI State
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Supabase'den ilk veri yüklemesi
  useEffect(() => {
    fetchAllData().then(data => {
      setRequests(data.requests);
      setTasks(data.tasks);
      setRevizeler(data.revizeler);
      setApprovals(data.approvals);
      setComments(data.comments);
      setUsersState(data.users);
      // Sayaçları DB'deki son değerlere göre ayarla
      getNextRequestNo().then(n => { requestCounter = n - 1; });
      getNextTaskNo().then(n => { taskCounter = n - 1; });
      getNextApprovalNo().then(n => { approvalCounter = n - 1; });
    }).finally(() => setIsLoading(false));
  }, []);

  // Generate Request Number
  const generateRequestNo = () => {
    requestCounter++;
    return `REQ-2026-${String(requestCounter).padStart(5, '0')}`;
  };

  // Generate Task Number
  const generateTaskNo = () => {
    taskCounter++;
    return `TASK-2026-${String(taskCounter).padStart(5, '0')}`;
  };

  // Generate Revize Number (task bazında)
  const generateRevizeNo = (revizeNumber: number) => {
    return `REV-${String(revizeNumber).padStart(2, '0')}`;
  };

  // Generate Approval Number
  const generateApprovalNo = () => {
    approvalCounter++;
    return `ONAY-${String(approvalCounter).padStart(3, '0')}`;
  };

  // Add Request
  const addRequest = useCallback((requestData: Omit<Request, 'id' | 'requestNo' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newRequest: Request = {
      ...requestData,
      id: `r${Date.now()}`,
      requestNo: generateRequestNo(),
      createdAt: now,
      updatedAt: now,
    };
    setRequests(prev => [newRequest, ...prev]);
    dbAddRequest(newRequest);
    return newRequest;
  }, []);

  // Update Request
  const updateRequest = useCallback((id: string, updates: Partial<Request>) => {
    setRequests(prev => prev.map(r =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
    ));
    dbUpdateRequest(id, { ...updates, updatedAt: new Date().toISOString() });
  }, []);

  // Delete Request
  const deleteRequest = useCallback((id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    setTasks(prev => prev.filter(t => t.requestId !== id));
    dbDeleteRequest(id);
  }, []);

  // Add Task
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'taskNo'>) => {
    const newTask: Task = {
      ...taskData,
      id: `t${Date.now()}`,
      taskNo: generateTaskNo(),
    };
    setTasks(prev => [...prev, newTask]);
    dbAddTask(newTask);
    return newTask;
  }, []);

  // Update Task
  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, ...updates } : t
    ));
    dbUpdateTask(id, updates);
  }, []);

  // Add Revize
  const addRevize = useCallback((revizeData: Omit<Revize, 'id' | 'revizeNo'>) => {
    revizeCounter++;
    const newRevize: Revize = {
      ...revizeData,
      id: `rev${Date.now()}`,
      revizeNo: generateRevizeNo(revizeData.revizeNumber ?? revizeCounter),
    };
    setRevizeler(prev => [...prev, newRevize]);
    dbAddRevize(newRevize);
    return newRevize;
  }, []);

  // Update Revize
  const updateRevize = useCallback((id: string, updates: Partial<Revize>) => {
    setRevizeler(prev => prev.map(r =>
      r.id === id ? { ...r, ...updates } : r
    ));
    dbUpdateRevize(id, updates);
  }, []);

  // Add Approval
  const addApproval = useCallback((approvalData: Omit<Approval, 'id' | 'approvalNo'>) => {
    const newApproval: Approval = {
      ...approvalData,
      id: `a${Date.now()}`,
      approvalNo: generateApprovalNo(),
    };
    setApprovals(prev => [...prev, newApproval]);
    dbAddApproval(newApproval);
    return newApproval;
  }, []);

  // Update Approval
  const updateApproval = useCallback((id: string, updates: Partial<Approval>) => {
    setApprovals(prev => prev.map(a =>
      a.id === id ? { ...a, ...updates } : a
    ));
    dbUpdateApproval(id, updates);
  }, []);

  // Add Comment
  const addComment = useCallback((commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...commentData,
      id: `cm${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [...prev, newComment]);
    dbAddComment(newComment);
    return newComment;
  }, []);

  // ==================== GECİKME ve REVİZE YÖNETİMİ ====================

  // Gecikmiş görevi tamamlama
  const completeRequestWithDelay = useCallback((id: string, note?: string) => {
    const request = requests.find(r => r.id === id);
    if (!request) return;

    const now = new Date().toISOString();
    const targetDate = new Date(request.targetDate);
    const currentDate = new Date();
    
    const diffTime = currentDate.getTime() - targetDate.getTime();
    const delayedDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    let updatedDescription = request.description;
    if (note) {
      updatedDescription = `${request.description}\n\n[Gecikmeli Tamamlama Notu]: ${note}`;
    }

    const updates: Partial<Request> = {
      status: 'CMP',
      completedAt: now,
      updatedAt: now,
      delayedDays,
      isDelayedCompleted: delayedDays > 0,
      description: updatedDescription,
    };

    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    dbUpdateRequest(id, updates);

    setTasks(prev => prev.map(t => {
      if (t.requestId !== id) return t;
      const taskUpdates = { status: 'CMP' as const, completedAt: now };
      dbUpdateTask(t.id, taskUpdates);
      return { ...t, ...taskUpdates };
    }));
  }, [requests]);

  // Update Users
  const updateUsers = useCallback((newUsers: User[]) => {
    setUsersState(newUsers);
  }, []);

  // Revize ekleme (10 limit kontrolü ile)
  const addRevizeWithLimit = useCallback((revizeData: Omit<Revize, 'id' | 'revizeNo' | 'revizeNumber'>, requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) {
      return { success: false, message: 'Talep bulunamadı' };
    }

    const currentRevizeCount = request.revizeCount || 0;

    if (currentRevizeCount >= 10) {
      return { 
        success: false, 
        message: 'Bu iş için maksimum 10 revize limitine ulaşıldı. Yeni bir göreve aktarılması gerekiyor.',
        transferred: true,
      };
    }

    const newRevizeNumber = currentRevizeCount + 1;
    const newRevize: Revize = {
      ...revizeData,
      id: `rev${Date.now()}`,
      revizeNo: `REV-${String(newRevizeNumber).padStart(2, '0')}`,
      revizeNumber: newRevizeNumber,
    };

    setRevizeler(prev => [...prev, newRevize]);
    dbAddRevize(newRevize);

    const rUpdates: Partial<Request> = {
      revizeCount: newRevizeNumber,
      status: 'RVZ',
      updatedAt: new Date().toISOString(),
    };
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, ...rUpdates } : r));
    dbUpdateRequest(requestId, rUpdates);

    if (newRevizeNumber === 10) {
      return { 
        success: true, 
        message: `Revize #${newRevizeNumber} eklendi. Bu son revize! Bir sonraki revize talebinde iş yeni bir göreve aktarılacak.` 
      };
    }

    return { 
      success: true, 
      message: `Revize #${newRevizeNumber} başarıyla eklendi. Kalan revize hakkı: ${10 - newRevizeNumber}` 
    };
  }, [requests]);

  // Görev aktarımı (10 revize sonrası)
  const transferRequest = useCallback((requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return null;

    if ((request.revizeCount || 0) < 10) {
      return null;
    }

    const now = new Date().toISOString();
    requestCounter++;
    const newRequestNo = `REQ-2026-${String(requestCounter).padStart(5, '0')}`;

    const revizeHistory: RevizeHistoryItem[] = revizeler
      .filter(r => r.requestId === requestId)
      .map(r => ({
        revizeNo: r.revizeNo,
        revizeNumber: r.revizeNumber,
        reason: r.reason,
        expectation: r.expectation,
        requestedAt: r.requestedAt,
        requestedByName: r.requestedByName,
      }));

    const newRequest: Request = {
      ...request,
      id: `r${Date.now()}`,
      requestNo: newRequestNo,
      title: `${request.requestNo} nolu iş aktarımı`,
      description: `${request.requestNo} nolu işten aktarıldı. Geçmiş başarısızlıklardan ders çıkarılarak yeniden başlanıyor.\n\nOrijinal iş: ${request.title}\n\nToplam ${request.revizeCount} revize yapılmıştır.`,
      status: 'NEW',
      revizeCount: 0,
      maxRevizeReached: true,
      transferredFromRequestNo: request.requestNo,
      transferredRevizeHistory: revizeHistory,
      createdAt: now,
      updatedAt: now,
      completedAt: undefined,
      delayedDays: undefined,
      isDelayedCompleted: undefined,
    };

    const oldUpdates: Partial<Request> = { status: 'CMP', completedAt: now, updatedAt: now };
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, ...oldUpdates } : r));
    dbUpdateRequest(requestId, oldUpdates);

    setRequests(prev => [newRequest, ...prev]);
    dbAddRequest(newRequest);

    return newRequest;
  }, [requests, revizeler]);

  const value: StoreState = {
    requests,
    tasks,
    revizeler,
    approvals,
    comments,
    users,
    currentUser,
    isLoading,
    updateUsers,
    currentView,
    selectedRequestId,
    selectedTaskId,
    setCurrentView,
    setSelectedRequestId,
    setSelectedTaskId,
    addRequest,
    updateRequest,
    deleteRequest,
    addTask,
    updateTask,
    addRevize,
    updateRevize,
    addApproval,
    updateApproval,
    addComment,
    completeRequestWithDelay,
    addRevizeWithLimit,
    transferRequest,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
