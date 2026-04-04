import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  RotateCcw,
  UserPlus,
  AlertTriangle,
  XCircle,
  Send,
  Clock,
  User,
  Briefcase,
  Calendar,
  Flag,
  MessageSquare,
  CheckCircle2,
  History,
  AlertCircle,
  ArrowRightLeft,
  CheckCircle
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { getStatusLabel, getStatusColor, getPriorityLabel, getRevizeSourceLabel } from '@/data/mockData';
import type { RequestStatus, RevizeSource } from '@/types';
import { toast } from 'sonner';

export function TalepDetay() {
  const { 
    requests, 
    tasks, 
    revizeler, 
    comments, 
    users,
    approvals,
    currentUser,
    selectedRequestId, 
    setCurrentView, 
    setSelectedRequestId,
    updateRequest,
    updateTask,
    addTask,
    addComment,
    addApproval,
    completeRequestWithDelay,
    addRevizeWithLimit,
    transferRequest
  } = useStore();

  const [showRevizeModal, setShowRevizeModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [revizeMessage, setRevizeMessage] = useState('');
  const [completeNote, setCompleteNote] = useState('');

  const [revizeForm, setRevizeForm] = useState({
    source: '' as RevizeSource | '',
    reason: '',
    expectation: '',
    referenceUrl: '',
  });

  const [assignForm, setAssignForm] = useState({
    userId: '',
    taskType: '',
  });

  const request = requests.find(r => r.id === selectedRequestId);
  
  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="border-border/50 w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Talep bulunamadı</p>
            <Button className="mt-4" onClick={() => setCurrentView('tum-talepler')}>
              Geri Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const requestTasks = tasks.filter(t => t.requestId === request.id);
  const requestRevizeler = revizeler.filter(r => r.requestId === request.id || requestTasks.some(t => t.id === r.taskId));
  const requestComments = comments.filter(c => c.requestId === request.id);

  const today = new Date();
  const targetDate = new Date(request.targetDate);
  const isDelayed = targetDate < today && !['CMP', 'CAN', 'PUB'].includes(request.status);

  const getSLAStatus = () => {
    const created = new Date(request.createdAt);
    const hoursElapsed = (today.getTime() - created.getTime()) / (1000 * 60 * 60);
    const hoursRemaining = (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60);
    
    return {
      elapsed: Math.round(hoursElapsed),
      remaining: Math.round(hoursRemaining),
      isOverdue: hoursRemaining < 0,
    };
  };

  const sla = getSLAStatus();

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment({
      requestId: request.id,
      userId: currentUser.id,
      userName: currentUser.name,
      content: newComment,
    });
    setNewComment('');
  };

  const handleStatusChange = (newStatus: RequestStatus) => {
    const now = new Date().toISOString();
    
    // Talebi güncelle
    updateRequest(request.id, { status: newStatus });
    
    // Eğer tamamlandı veya iptal edildiyse, ilgili tüm görevleri de güncelle
    if (newStatus === 'CMP' || newStatus === 'CAN') {
      requestTasks.forEach(task => {
        updateTask(task.id, { 
          status: newStatus,
          completedAt: newStatus === 'CMP' ? now : undefined
        });
      });
    }

    // Onay Bekliyor (APW) veya doğrudan Tamamlandı (CMP) seçildiğinde onay kaydı oluştur
    // Daha önce bu talep için bekleyen bir onay yoksa ekle
    if (newStatus === 'APW' || newStatus === 'CMP') {
      const alreadyPending = approvals.some(
        a => a.requestId === request.id && a.status === 'bekliyor'
      );
      if (!alreadyPending) {
        const completedChecklist = requestTasks.length > 0
          ? requestTasks.flatMap(t => t.checklist || []).filter(c => c.isCompleted).length
          : 0;
        const totalChecklist = requestTasks.length > 0
          ? requestTasks.flatMap(t => t.checklist || []).length
          : 0;

        addApproval({
          requestId: request.id,
          requestNo: request.requestNo,
          requestTitle: request.title,
          submittedBy: currentUser.id,
          submittedByName: currentUser.name,
          submittedAt: now,
          status: 'bekliyor',
          approvalType: 'son_onay',
          revizeCount: request.revizeCount || 0,
          checklistCompleted: completedChecklist,
          checklistTotal: totalChecklist,
          deliverableNote: '',
          deliverableUrl: '',
        });
      }
    }
  };

  const handleAssign = () => {
    if (!assignForm.userId) return;
    const user = users.find(u => u.id === assignForm.userId);
    if (user) {
      updateRequest(request.id, { 
        assignedTo: user.id, 
        assignedToName: user.name,
        status: 'ASN'
      });
      // Mükerrer görev oluşturma önle
      const existingTask = requestTasks.find(t =>
        t.assignedTo === user.id && t.status !== 'CAN'
      );
      if (!existingTask) {
        addTask({
          requestId: request.id,
          requestNo: request.requestNo,
          requestTitle: request.title,
          title: request.workType,
          type: request.workType,
          assignedTo: user.id,
          assignedToName: user.name,
          status: 'ASN',
          priority: request.priority,
          dueDate: request.targetDate,
          checklist: [],
        });
      }
      setShowAssignModal(false);
    }
  };

  const handleRevizeSubmit = () => {
    if (!revizeForm.source || !revizeForm.reason || !revizeForm.expectation) return;
    
    const result = addRevizeWithLimit({
      requestId: request.id,
      source: revizeForm.source as RevizeSource,
      reason: revizeForm.reason,
      expectation: revizeForm.expectation,
      referenceUrl: revizeForm.referenceUrl || undefined,
      requestedBy: currentUser.id,
      requestedByName: currentUser.name,
      requestedAt: new Date().toISOString(),
      status: 'acik',
    }, request.id);
    
    setRevizeMessage(result.message);
    
    if (result.success) {
      toast.success('Revize talebi gönderildi!', {
        description: result.message,
        duration: 4000,
      });
      setTimeout(() => {
        setShowRevizeModal(false);
        setRevizeForm({ source: '', reason: '', expectation: '', referenceUrl: '' });
        setRevizeMessage('');
      }, 2000);
    }
  };

  const handleTransfer = () => {
    const newRequest = transferRequest(request.id);
    if (newRequest) {
      setShowTransferModal(false);
      // Yeni göreve yönlendir
      setSelectedRequestId(newRequest.id);
      setCurrentView('talep-detay');
    }
  };

  const handleCompleteWithDelay = () => {
    completeRequestWithDelay(request.id, completeNote);

    // Gecikmeli tamamlamada da onay kaydı oluştur
    const alreadyPending = approvals.some(
      a => a.requestId === request.id && a.status === 'bekliyor'
    );
    if (!alreadyPending) {
      const now = new Date().toISOString();
      const completedChecklist = requestTasks.flatMap(t => t.checklist || []).filter(c => c.isCompleted).length;
      const totalChecklist = requestTasks.flatMap(t => t.checklist || []).length;
      addApproval({
        requestId: request.id,
        requestNo: request.requestNo,
        requestTitle: request.title,
        submittedBy: currentUser.id,
        submittedByName: currentUser.name,
        submittedAt: now,
        status: 'bekliyor',
        approvalType: 'son_onay',
        revizeCount: request.revizeCount || 0,
        checklistCompleted: completedChecklist,
        checklistTotal: totalChecklist,
        deliverableNote: completeNote || '',
        deliverableUrl: '',
      });
    }

    setShowCompleteModal(false);
    setCompleteNote('');
  };

  const statusHistory = [
    { status: 'NEW', label: 'Yeni Talep', date: request.createdAt },
    { status: 'REV', label: 'İnceleniyor', date: request.updatedAt },
  ];

  if (request.assignedTo) {
    statusHistory.push({ status: 'ASN', label: 'Atandı', date: request.updatedAt });
  }
  if (request.status === 'WIP' || request.status === 'APW' || request.status === 'RVZ' || request.status === 'CMP') {
    statusHistory.push({ status: 'WIP', label: 'Yapım Aşamasında', date: request.updatedAt });
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button 
          onClick={() => setCurrentView('tum-talepler')} 
          className="hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Tüm Talepler
        </button>
        <span>/</span>
        <span className="text-foreground font-medium">{request.requestNo}</span>
      </div>

      {/* Header */}
      <Card className="border-border/50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-foreground">{request.title}</h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                <span className="text-xs sm:text-sm font-mono text-muted-foreground">{request.requestNo}</span>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getStatusColor(request.status)}`} />
                  <span className="text-xs sm:text-sm">{getStatusLabel(request.status)}</span>
                </div>
                {isDelayed && (
                  <Badge variant="destructive" className="text-xs flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    GECİKTİ
                  </Badge>
                )}
                {request.isDelayedCompleted && request.delayedDays && request.delayedDays > 0 && (
                  <Badge variant="outline" className="text-xs bg-orange-500/20 text-orange-500 border-orange-500/50 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {request.delayedDays} gün gecikmeli tamamlandı
                  </Badge>
                )}
                {request.transferredFromRequestNo && (
                  <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-500 border-purple-500/50 flex items-center gap-1">
                    <ArrowRightLeft className="w-3 h-3" />
                    {request.transferredFromRequestNo} aktarımı
                  </Badge>
                )}
              </div>
            </div>
            {/* Revize Sayacı */}
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                (request.revizeCount || 0) >= 10 
                  ? 'bg-destructive/20 text-destructive' 
                  : (request.revizeCount || 0) >= 7 
                    ? 'bg-orange-500/20 text-orange-500'
                    : 'bg-blue-500/20 text-blue-500'
              }`}>
                <RotateCcw className="w-3 h-3 inline mr-1" />
                Revize: {request.revizeCount || 0}/10
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Info */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Request Info */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="section-title flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Talep Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="small-text">Talep Sahibi:</span>
                  <span className="text-sm">{request.requesterName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="small-text">Departman:</span>
                  <span className="text-sm">{request.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="small-text">Açılış:</span>
                  <span className="text-sm">{new Date(request.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="small-text">Hedef:</span>
                  <span className={`text-sm ${isDelayed ? 'text-destructive font-medium' : ''}`}>
                    {request.targetDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="small-text">Öncelik:</span>
                  <Badge variant="outline" className="text-xs">{getPriorityLabel(request.priority)}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="small-text">İş Türü:</span>
                  <span className="text-sm">{request.workType}</span>
                </div>
              </div>

              {request.facility && (
                <div className="pt-3 border-t border-border/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {request.facility && (
                      <div><span className="small-text">Tesis:</span> {request.facility}</div>
                    )}
                    {request.outlet && (
                      <div><span className="small-text">Outlet:</span> {request.outlet}</div>
                    )}
                    {request.format && (
                      <div><span className="small-text">Format:</span> {request.format}</div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="section-title">Açıklama</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{request.description}</p>
            </CardContent>
          </Card>

          {/* Aktarılmış Görev Bilgisi - Revize Geçmişi */}
          {request.transferredRevizeHistory && request.transferredRevizeHistory.length > 0 && (
            <Card className="border-border/50 border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="section-title flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-500" />
                  Önceki Görevden Revize Geçmişi ({request.transferredRevizeHistory.length} revize)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-purple-500/10 p-3 rounded-lg text-sm">
                    <p className="text-muted-foreground">
                      Bu görev <strong>{request.transferredFromRequestNo}</strong> nolu işten aktarılmıştır. 
                      Geçmiş başarısızlıklardan ders çıkarılarak yeniden başlanıyor.
                    </p>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {request.transferredRevizeHistory.map((history, index) => (
                      <div key={index} className="bg-secondary/30 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono text-muted-foreground">{history.revizeNo}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(history.requestedAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-sm font-medium mb-1">{history.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Beklenti:</span> {history.expectation}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">İsteyen:</span> {history.requestedByName}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mandatory Text */}
          {request.mandatoryText && (
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="section-title">Zorunlu Metinler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-secondary/50 p-3 sm:p-4 rounded-lg text-sm whitespace-pre-wrap">
                  {request.mandatoryText}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tasks */}
          <Card className="border-border/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="section-title flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Bağlı Görevler ({requestTasks.length})
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowAssignModal(true)}>
                <UserPlus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Görev Ekle</span>
              </Button>
            </CardHeader>
            <CardContent>
              {requestTasks.length > 0 ? (
                <div className="space-y-2">
                  {requestTasks.map((task) => (
                    <div key={task.id} className="list-item-mobile sm:list-item">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <span className="text-xs font-mono text-muted-foreground flex-shrink-0">{task.taskNo}</span>
                        <span className="text-sm truncate">{task.title}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 text-sm flex-shrink-0">
                        <span className="text-muted-foreground">{task.assignedToName}</span>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                          <span className="text-xs">{getStatusLabel(task.status)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">Henüz görev atanmamış</div>
              )}
            </CardContent>
          </Card>

          {/* Revisions */}
          {requestRevizeler.length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="section-title flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Revizeler ({requestRevizeler.length})
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => setShowRevizeModal(true)}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Revize Ekle</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {requestRevizeler.map((revize) => (
                    <div key={revize.id} className="list-item-mobile sm:list-item">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <span className="text-xs font-mono text-muted-foreground flex-shrink-0">{revize.revizeNo}</span>
                        <span className="text-sm">{getRevizeSourceLabel(revize.source)}</span>
                      </div>
                      <Badge className={revize.status === 'cozuldu' ? 'bg-green-500' : 'bg-orange-500'}>
                        {revize.status === 'cozuldu' ? 'Çözüldü' : 'Açık'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="section-title flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Yorumlar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {requestComments.map((comment) => (
                <div key={comment.id} className="bg-secondary/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString('tr-TR', { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
              
              <div className="flex gap-2">
                <Textarea
                  placeholder="Yorum ekle..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 form-input min-h-[80px]"
                />
                <Button onClick={handleAddComment} className="flex-shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-4 sm:space-y-6">
          {/* Status History */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="section-title">Durum Geçmişi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statusHistory.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                    <div>
                      <div className="text-sm">{item.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleString('tr-TR', { 
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SLA Tracking */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="section-title flex items-center gap-2">
                <Clock className="w-4 h-4" />
                SLA Takip
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Başlangıç:</span>
                <span>{new Date(request.createdAt).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Hedef:</span>
                <span>{request.targetDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Geçen:</span>
                <span>{sla.elapsed} saat</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kalan:</span>
                <span className={sla.isOverdue ? 'text-destructive font-medium' : ''}>
                  {sla.isOverdue ? `-${Math.abs(sla.remaining)} saat` : `${sla.remaining} saat`}
                </span>
              </div>
              <div className="pt-2 border-t border-border/50">
                <span className={sla.isOverdue ? 'text-destructive font-medium text-sm' : 'text-green-500 text-sm'}>
                  SLA: {sla.isOverdue ? 'Aşıldı' : 'Uygun'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="section-title">Aksiyonlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Select value={request.status} onValueChange={(v) => handleStatusChange(v as RequestStatus)}>
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="Durum Güncelle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">Yeni Talep</SelectItem>
                  <SelectItem value="REV">İnceleniyor</SelectItem>
                  <SelectItem value="BRF">Eksik Brief</SelectItem>
                  <SelectItem value="ASN">Atandı</SelectItem>
                  <SelectItem value="WIP">Yapım Aşamasında</SelectItem>
                  <SelectItem value="QCC">İç Kontrolde</SelectItem>
                  <SelectItem value="APW">Onay Bekliyor</SelectItem>
                  <SelectItem value="RVZ">Revizede</SelectItem>
                  <SelectItem value="CMP">Tamamlandı</SelectItem>
                  <SelectItem value="PUB">Yayınlandı</SelectItem>
                  <SelectItem value="CAN">İptal</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowAssignModal(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Kişiye Ata
              </Button>

              {/* Gecikmiş görev için tamamlama butonu */}
              {isDelayed && request.status !== 'CMP' && request.status !== 'CAN' && (
                <Button 
                  variant="outline" 
                  className="w-full bg-orange-500/10 text-orange-500 border-orange-500/50 hover:bg-orange-500/20"
                  onClick={() => setShowCompleteModal(true)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Gecikmeli Tamamla
                </Button>
              )}

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowRevizeModal(true)}
                disabled={(request.revizeCount || 0) >= 10}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Revize Talep Et
                {(request.revizeCount || 0) >= 10 && (
                  <span className="ml-1 text-xs">(Limit doldu)</span>
                )}
              </Button>

              {/* 10 revize sonrası aktarım butonu */}
              {(request.revizeCount || 0) >= 10 && request.status !== 'CMP' && request.status !== 'CAN' && (
                <Button 
                  variant="outline" 
                  className="w-full bg-purple-500/10 text-purple-500 border-purple-500/50 hover:bg-purple-500/20"
                  onClick={() => setShowTransferModal(true)}
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Yeni Göreve Aktar
                </Button>
              )}

              <Button 
                variant="outline" 
                className="w-full text-destructive hover:text-destructive"
                onClick={() => handleStatusChange('CAN')}
              >
                <XCircle className="w-4 h-4 mr-2" />
                İptal Et
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revize Modal */}
      <Dialog open={showRevizeModal} onOpenChange={setShowRevizeModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <RotateCcw className="w-5 h-5" />
              Yeni Revize — {request.requestNo}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Revize Limiti Uyarısı */}
            <div className={`p-3 rounded-lg ${
              (request.revizeCount || 0) >= 8 
                ? 'bg-destructive/10 border border-destructive/30' 
                : (request.revizeCount || 0) >= 5 
                  ? 'bg-orange-500/10 border border-orange-500/30'
                  : 'bg-blue-500/10 border border-blue-500/30'
            }`}>
              <div className="flex items-center gap-2">
                <AlertCircle className={`w-4 h-4 ${
                  (request.revizeCount || 0) >= 8 ? 'text-destructive' : (request.revizeCount || 0) >= 5 ? 'text-orange-500' : 'text-blue-500'
                }`} />
                <span className="text-sm font-medium">
                  Revize Sayısı: {request.revizeCount || 0}/10
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {(request.revizeCount || 0) >= 8 
                  ? 'Dikkat! Son 2 revize hakkınız kaldı. 10 revize sonrası iş yeni bir göreve aktarılacak.'
                  : (request.revizeCount || 0) >= 5 
                    ? `Kalan revize hakkı: ${10 - (request.revizeCount || 0)}`
                    : `Kalan revize hakkı: ${10 - (request.revizeCount || 0)}`
                }
              </p>
            </div>

            {/* Sonuç Mesajı */}
            {revizeMessage && (
              <div className={`p-3 rounded-lg ${
                revizeMessage.includes('başarıyla') 
                  ? 'bg-green-500/10 border border-green-500/30' 
                  : 'bg-destructive/10 border border-destructive/30'
              }`}>
                <p className={`text-sm ${
                  revizeMessage.includes('başarıyla') ? 'text-green-500' : 'text-destructive'
                }`}>
                  {revizeMessage}
                </p>
              </div>
            )}

            <div>
              <Label className="form-label">Revize Kaynağı *</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['brief_eksikligi', 'kalite_sorunu', 'yon_degisikligi', 'dis_faktor'] as RevizeSource[]).map((source) => (
                  <label key={source} className="flex items-center gap-2 p-3 border border-border/50 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors">
                    <input
                      type="radio"
                      name="revizeSource"
                      value={source}
                      checked={revizeForm.source === source}
                      onChange={(e) => setRevizeForm({ ...revizeForm, source: e.target.value as RevizeSource })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{getRevizeSourceLabel(source)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label className="form-label">Revize Nedeni *</Label>
              <Textarea
                placeholder="Ne sorun var? Hangi eleman değiştirilmeli?"
                value={revizeForm.reason}
                onChange={(e) => setRevizeForm({ ...revizeForm, reason: e.target.value })}
                className="form-input min-h-[80px]"
              />
            </div>

            <div>
              <Label className="form-label">Beklenti *</Label>
              <Textarea
                placeholder="Yeni versiyonda ne görmek istiyorsunuz?"
                value={revizeForm.expectation}
                onChange={(e) => setRevizeForm({ ...revizeForm, expectation: e.target.value })}
                className="form-input min-h-[80px]"
              />
            </div>

            <div>
              <Label className="form-label">Referans</Label>
              <Input
                placeholder="Drive bağlantısı (opsiyonel)"
                value={revizeForm.referenceUrl}
                onChange={(e) => setRevizeForm({ ...revizeForm, referenceUrl: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setShowRevizeModal(false); setRevizeMessage(''); }}>İptal</Button>
              <Button onClick={handleRevizeSubmit} disabled={(request.revizeCount || 0) >= 10}>
                Revize Gönder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <UserPlus className="w-5 h-5" />
              Görev Ata
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="form-label">Kişi Seç</Label>
              <Select 
                value={assignForm.userId} 
                onValueChange={(v) => setAssignForm({ ...assignForm, userId: v })}
              >
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="Kişi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.role === 'uygulayici').map((user) => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAssignModal(false)}>İptal</Button>
              <Button onClick={handleAssign}>Ata</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Modal - 10 Revize Sonrası Aktarım */}
      <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ArrowRightLeft className="w-5 h-5 text-purple-500" />
              Yeni Göreve Aktar
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-purple-500/10 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-purple-500" />
                <span className="font-medium">10 Revize Limitine Ulaşıldı</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Bu iş için maksimum 10 revize limitine ulaşıldı. İş yeni bir göreve aktarılarak devam edecek.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="form-label">Mevcut İş</Label>
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="font-medium">{request.requestNo}</p>
                <p className="text-sm text-muted-foreground">{request.title}</p>
                <p className="text-sm mt-1">Revize Sayısı: <strong>{request.revizeCount}</strong></p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="form-label">Yeni Görev Başlığı</Label>
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="font-medium">{request.requestNo} nolu iş aktarımı</p>
              </div>
            </div>

            <div className="bg-secondary/30 p-3 rounded-lg text-sm">
              <p className="text-muted-foreground">
                <strong>Not:</strong> Geçmiş revize istekleri ve beklentileri yeni görevde saklanacak. 
                Eski görev otomatik olarak kapatılacak.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowTransferModal(false)}>İptal</Button>
              <Button onClick={handleTransfer} className="bg-purple-500 hover:bg-purple-600">
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Aktar ve Devam Et
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Complete with Delay Modal - Gecikmeli Tamamlama */}
      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="w-5 h-5 text-orange-500" />
              Gecikmeli Tamamla
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-orange-500/10 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <span className="font-medium">Gecikmiş Görev</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Hedef tarih ({request.targetDate}) geçmiş olmasına rağmen bu görev tamamlanacak.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="form-label">Gecikme Bilgisi</Label>
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-sm">Hedef Tarih: <strong>{request.targetDate}</strong></p>
                <p className="text-sm">Bugün: <strong>2026-04-02</strong></p>
                <p className="text-sm text-orange-500 mt-1">
                  Gecikme: <strong>{Math.max(0, Math.ceil((new Date('2026-04-02').getTime() - new Date(request.targetDate).getTime()) / (1000 * 60 * 60 * 24)))} gün</strong>
                </p>
              </div>
            </div>

            <div>
              <Label className="form-label">Tamamlama Notu (Opsiyonel)</Label>
              <Textarea
                placeholder="Gecikme nedeni veya tamamlama notu..."
                value={completeNote}
                onChange={(e) => setCompleteNote(e.target.value)}
                className="form-input min-h-[80px]"
              />
            </div>

            <div className="bg-secondary/30 p-3 rounded-lg text-sm">
              <p className="text-muted-foreground">
                <strong>Bilgi:</strong> Görev tamamlandığında "X gün gecikmeli olarak tamamlandı" ibaresi otomatik olarak eklenecektir.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowCompleteModal(false)}>İptal</Button>
              <Button onClick={handleCompleteWithDelay} className="bg-orange-500 hover:bg-orange-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Gecikmeli Tamamla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
