/**
 * Google Sheets Entegrasyon Örneği
 * 
 * Bu dosya, Google Sheets ile nasıl çalışılacağını gösterir.
 */

import { useState, useCallback } from 'react';
import { useGoogleSheets } from '@/hooks/useGoogleSheets';
import { createSheetsConfig, validateConfig } from '@/config/sheets.config';

// ============================================
// ÖRNEK 1: Temel Kullanım
// ============================================

export const ExampleBasicUsage = () => {
  // Yapılandırmayı doğrula
  const { valid, errors } = validateConfig();
  
  if (!valid) {
    console.error('Yapılandırma hataları:', errors);
    return null;
  }

  // Hook'u kullan
  const {
    requests,
    tasks,
    loading,
    error,
    fetchAll,
    addRequest,
    updateRequest,
    addTask,
  } = useGoogleSheets({
    ...createSheetsConfig(),
    autoFetch: true, // Bileşen yüklendiğinde otomatik veri çek
  });

  // Yeni talep ekleme
  const handleAddRequest = async () => {
    try {
      const newRequest = await addRequest({
        title: 'Yeni Afiş Tasarımı',
        description: 'Yaz kampanyası için afiş tasarımı',
        department: 'Pazarlama',
        workType: 'Afiş Tasarımı',
        requesterId: 'u1',
        requesterName: 'Atakan ŞENKAYA',
        status: 'NEW' as const,
        priority: 'yuksek',
        targetDate: '2026-04-10',
        isUrgent: false,
        hasRevenueImpact: true,
        isVipSensitive: false,
        needsExternalResource: false,
        revizeCount: 0,
      });
      
      console.log('Yeni talep oluşturuldu:', newRequest.requestNo);
    } catch (err) {
      console.error('Talep ekleme hatası:', err);
    }
  };

  // Talep güncelleme
  const handleUpdateStatus = async (requestId: string, newStatus: import('@/types').RequestStatus) => {
    try {
      await updateRequest(requestId, { status: newStatus });
      console.log('Talep durumu güncellendi');
    } catch (err) {
      console.error('Güncelleme hatası:', err);
    }
  };

  // Görev ekleme
  const handleAddTask = async (requestId: string, requestNo: string, requestTitle: string) => {
    try {
      const newTask = await addTask({
        requestId,
        requestNo,
        requestTitle,
        title: 'Afiş Tasarımı',
        type: 'Afiş Tasarımı',
        assignedTo: 'u2',
        assignedToName: 'Mehmet Demir',
        status: 'ASN',
        priority: 'yuksek',
        dueDate: '2026-04-10',
        checklist: [],
      });
      
      console.log('Yeni görev oluşturuldu:', newTask.taskNo);
    } catch (err) {
      console.error('Görev ekleme hatası:', err);
    }
  };

  return {
    requests,
    tasks,
    loading,
    error,
    fetchAll,
    handleAddRequest,
    handleUpdateStatus,
    handleAddTask,
  };
};

// ============================================
// ÖRNEK 2: Custom Hook ile Kullanım
// ============================================

export const useRequestManager = () => {
  const sheets = useGoogleSheets({
    ...createSheetsConfig(),
    autoFetch: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Talep oluştur ve hemen görev ata
  const createRequestWithTask = useCallback(async (requestData: any, assigneeId: string, assigneeName: string) => {
    setIsSubmitting(true);
    
    try {
      // 1. Talep oluştur
      const request = await sheets.addRequest({
        ...requestData,
        assignedTo: assigneeId,
        assignedToName: assigneeName,
        status: 'ASN',
      });

      // 2. Görev oluştur
      const task = await sheets.addTask({
        requestId: request.id,
        requestNo: request.requestNo,
        requestTitle: request.title,
        title: request.workType,
        type: request.workType,
        assignedTo: assigneeId,
        assignedToName: assigneeName,
        status: 'ASN',
        priority: request.priority,
        dueDate: request.targetDate,
        checklist: [],
      });

      return { request, task };
    } finally {
      setIsSubmitting(false);
    }
  }, [sheets]);

  // Toplu durum güncelleme
  const bulkUpdateStatus = useCallback(async (requestIds: string[], newStatus: import('@/types').RequestStatus) => {
    const promises = requestIds.map(id => sheets.updateRequest(id, { status: newStatus }));
    await Promise.all(promises);
  }, [sheets]);

  return {
    ...sheets,
    isSubmitting,
    createRequestWithTask,
    bulkUpdateStatus,
  };
};

// ============================================
// ÖRNEK 3: Dashboard İstatistikleri
// ============================================

export const useDashboardStats = () => {
  const { requests, tasks, approvals, loading } = useGoogleSheets({
    ...createSheetsConfig(),
    autoFetch: true,
  });

  const today = new Date('2026-04-02');

  // İstatistikleri hesapla
  const stats = {
    // Bugün yeni talepler
    todayNew: requests.filter(r => {
      const created = new Date(r.createdAt);
      return created.toDateString() === today.toDateString();
    }).length,

    // Gecikmiş talepler
    delayed: requests.filter(r => {
      if (['CMP', 'CAN', 'PUB'].includes(r.status)) return false;
      return new Date(r.targetDate) < today;
    }).length,

    // Onay bekleyenler
    waitingApproval: approvals.filter(a => a.status === 'bekliyor').length,

    // Revizede olanlar
    inRevision: requests.filter(r => r.status === 'RVZ').length,

    // Bu hafta deadline
    thisWeekDeadline: requests.filter(r => {
      if (['CMP', 'CAN', 'PUB'].includes(r.status)) return false;
      const target = new Date(r.targetDate);
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return target >= today && target <= weekEnd;
    }).length,

    // Kişi bazlı iş yükü
    workloadByPerson: tasks.reduce((acc, task) => {
      if (['CMP', 'CAN'].includes(task.status)) return acc;
      
      const existing = acc.find(a => a.userId === task.assignedTo);
      if (existing) {
        existing.count++;
      } else {
        acc.push({
          userId: task.assignedTo,
          userName: task.assignedToName,
          count: 1,
        });
      }
      return acc;
    }, [] as { userId: string; userName: string; count: number }[]),

    // Departman bazlı talepler
    departmentStats: requests.reduce((acc, req) => {
      const existing = acc.find(a => a.department === req.department);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ department: req.department, count: 1 });
      }
      return acc;
    }, [] as { department: string; count: number }[]),
  };

  return {
    stats,
    loading,
    requests,
    tasks,
  };
};

// ============================================
// ÖRNEK 4: Manuel Veri Senkronizasyonu
// ============================================

export const syncDataExample = async () => {
  const sheets = useGoogleSheets({
    ...createSheetsConfig(),
    autoFetch: false, // Manuel kontrol
  });

  // Verileri yenile
  const refreshData = async () => {
    console.log('Veriler yenileniyor...');
    await sheets.fetchAll();
    console.log('Veriler yenilendi!');
  };

  // Periyodik senkronizasyon (her 5 dakika)
  const startAutoSync = (intervalMinutes: number = 5) => {
    const intervalMs = intervalMinutes * 60 * 1000;
    
    const intervalId = setInterval(() => {
      refreshData();
    }, intervalMs);

    // Temizleme fonksiyonu
    return () => clearInterval(intervalId);
  };

  return {
    ...sheets,
    refreshData,
    startAutoSync,
  };
};

// ============================================
// ÖRNEK 5: Hata Yönetimi
// ============================================

export const useSheetsWithErrorHandling = () => {
  const sheets = useGoogleSheets({
    ...createSheetsConfig(),
    autoFetch: true,
  });

  const [localError, setLocalError] = useState<string | null>(null);

  // Güvenli talep ekleme
  const safeAddRequest = async (requestData: any) => {
    setLocalError(null);
    
    try {
      // Önce bağlantıyı kontrol et
      const { valid, errors } = validateConfig();
      if (!valid) {
        throw new Error(`Yapılandırma hatası: ${errors.join(', ')}`);
      }

      // Talep ekle
      const result = await sheets.addRequest(requestData);
      return result;
    } catch (err: any) {
      setLocalError(err.message || 'Bilinmeyen hata');
      throw err;
    }
  };

  // Güvenli güncelleme
  const safeUpdateRequest = async (id: string, updates: any) => {
    setLocalError(null);
    
    try {
      await sheets.updateRequest(id, updates);
    } catch (err: any) {
      setLocalError(err.message || 'Güncelleme hatası');
      throw err;
    }
  };

  return {
    ...sheets,
    localError,
    safeAddRequest,
    safeUpdateRequest,
  };
};
