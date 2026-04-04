import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  CalendarClock, 
  UserPlus, 
  AlertCircle,
  CheckCircle,
  Clock,
  Briefcase,
  Users,
  BarChart3,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { getPriorityLabel } from '@/data/mockData';
import { useState } from 'react';
import type { User, Task } from '@/types';
import { toast } from 'sonner';

// Çalışan iş yükü ve yetkinlik analizi
interface EmployeeStats {
  user: User;
  activeTasks: Task[];
  activeTaskCount: number;
  completedTasks: Task[];
  totalTasks: number;
  completionRate: number;
  avgProgress: number;
  workloadPercent: number;
  isOverloaded: boolean;
  isAvailable: boolean;
  expertise: string[];
  availabilityStatus: 'müsait' | 'orta' | 'meşgul' | 'aşırı-yüklenmiş';
  isExpertInRequest: boolean;
}

// Kullanıcı uzmanlık eşleştirmesi (user id bazında)
const USER_EXPERTISE: Record<string, string[]> = {
  'u2': ['Afiş Tasarımı', 'Broşür', 'Menü', 'Bülten'],
  'u3': ['Afiş Tasarımı', 'Video Edit', 'Fotoğraf'],
  'u4': ['Sosyal Medya', 'Story'],
  'u5': ['Menü', 'Sunum', 'Fotoğraf'],
  'u6': ['Sosyal Medya', 'Bülten'],
};

export function DagitilacakGorevler() {
  const { requests, tasks, users, updateRequest, addTask, setCurrentView, setSelectedRequestId } = useStore();
  const [selectedAssignee, setSelectedAssignee] = useState<Record<string, string>>({});
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [selectedRequestForAssign, setSelectedRequestForAssign] = useState<string | null>(null);

  const today = new Date();
  const uygulayicilar = users.filter(u => u.role === 'uygulayici');

  // Çalışan istatistiklerini hesapla
  const getEmployeeStats = (user: User, requestWorkType?: string): EmployeeStats => {
    const userTasks = tasks.filter(t => t.assignedTo === user.id);
    const activeTasks = userTasks.filter(t => 
      ['ASN', 'WIP', 'RVZ', 'APW'].includes(t.status)
    );
    const completedTasks = userTasks.filter(t => t.status === 'CMP');
    const totalTasks = userTasks.length;
    
    // Checklist ilerleme ortalaması
    const avgProgress = activeTasks.length > 0
      ? activeTasks.reduce((sum, t) => {
          const completed = t.checklist?.filter(c => c.isCompleted).length || 0;
          const total = t.checklist?.length || 1;
          return sum + (completed / total);
        }, 0) / activeTasks.length
      : 0;

    // İş tamamlama oranı
    const completionRate = totalTasks > 0
      ? (completedTasks.length / totalTasks) * 100
      : 0;

    // İş yükü yüzdesi (max 5 görev varsayımı)
    const maxTasks = 5;
    const workloadPercent = Math.min((activeTasks.length / maxTasks) * 100, 100);
    
    // Müsaitlik durumu
    let availabilityStatus: EmployeeStats['availabilityStatus'] = 'müsait';
    if (activeTasks.length >= 5) availabilityStatus = 'aşırı-yüklenmiş';
    else if (activeTasks.length >= 4) availabilityStatus = 'meşgul';
    else if (activeTasks.length >= 2) availabilityStatus = 'orta';

    // Uzmanlık alanları (user id'ye göre)
    const expertise = USER_EXPERTISE[user.id] ||
      (user as any).workTypes ||
      ['Afiş Tasarımı'];

    // İş türüne göre uygunluk
    const isExpertInRequest = requestWorkType 
      ? expertise.some(e => e.toLowerCase().includes(requestWorkType.toLowerCase()) || 
                           requestWorkType.toLowerCase().includes(e.toLowerCase()))
      : false;

    return {
      user,
      activeTasks,
      activeTaskCount: activeTasks.length,
      completedTasks,
      totalTasks,
      completionRate: Math.round(completionRate),
      avgProgress: Math.round(avgProgress * 100),
      workloadPercent,
      isOverloaded: activeTasks.length >= 5,
      isAvailable: activeTasks.length < 5,
      expertise,
      availabilityStatus,
      isExpertInRequest,
    };
  };

  // Tüm çalışanları istatistikleriyle birlikte getir
  const getAllEmployeeStats = (requestWorkType?: string) => {
    return uygulayicilar
      .map(u => getEmployeeStats(u, requestWorkType))
      .sort((a, b) => {
        // Uzmanlığa göre öncelik
        const aExpert = requestWorkType ? a.expertise.some(e => 
          e.toLowerCase().includes(requestWorkType.toLowerCase())) : false;
        const bExpert = requestWorkType ? b.expertise.some(e => 
          e.toLowerCase().includes(requestWorkType.toLowerCase())) : false;
        
        if (aExpert && !bExpert) return -1;
        if (!aExpert && bExpert) return 1;
        
        // Müsaitliğe göre sırala
        return a.activeTaskCount - b.activeTaskCount;
      });
  };

  // Bugün gelen ve atanmamış yeni talepler
  const yeniTalepler = requests.filter(r => {
    const created = new Date(r.createdAt);
    const isToday = created.toDateString() === today.toDateString();
    return isToday && r.status === 'NEW' && !r.assignedTo;
  });

  // Son 3 gün içinde gelen atanmamış talepler
  const sonUcGun = requests.filter(r => {
    const created = new Date(r.createdAt);
    const diffDays = Math.floor((today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3 && r.status === 'NEW' && !r.assignedTo;
  });

  const handleAssign = (requestId: string, assigneeId?: string) => {
    const finalAssigneeId = assigneeId || selectedAssignee[requestId];
    if (!finalAssigneeId) return;

    const assignee = uygulayicilar.find(u => u.id === finalAssigneeId);
    if (!assignee) return;

    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    // Talebi güncelle
    updateRequest(requestId, { 
      assignedTo: assignee.id, 
      assignedToName: assignee.name,
      status: 'ASN'
    });

    // Görev oluştur
    addTask({
      requestId: request.id,
      requestNo: request.requestNo,
      requestTitle: request.title,
      title: request.workType,
      type: request.workType,
      assignedTo: assignee.id,
      assignedToName: assignee.name,
      status: 'ASN',
      priority: request.priority,
      dueDate: request.targetDate,
      checklist: [],
    });

    // Seçimi temizle
    setSelectedAssignee(prev => {
      const newState = { ...prev };
      delete newState[requestId];
      return newState;
    });
    
    // Dialog'u kapat
    setShowEmployeeDialog(false);
    setSelectedRequestForAssign(null);
    
    // Başarı bildirimi göster
    toast.success('Görev başarıyla atandı!', {
      description: `${assignee.name} kullanıcısına "${request.title}" görevi atandı.`,
      duration: 4000,
    });
  };

  const openEmployeeSelector = (requestId: string) => {
    setSelectedRequestForAssign(requestId);
    setShowEmployeeDialog(true);
  };

  const handleViewRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setCurrentView('talep-detay');
  };

  const getHoursAgo = (dateString: string) => {
    const date = new Date(dateString);
    const diffHours = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Az önce';
    if (diffHours === 1) return '1 saat önce';
    return `${diffHours} saat önce`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="page-title flex items-center gap-2">
          <CalendarClock className="w-6 h-6 text-primary" />
          Bugün Gelen ve Dağıtılacak Görevler
        </h1>
        <Button 
          onClick={() => setCurrentView('is-tanimla')}
          className="w-full sm:w-auto"
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Yeni İş Tanımla
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-primary">{yeniTalepler.length}</div>
            <div className="small-text mt-1">Bugün Yeni</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-orange-500">{sonUcGun.length}</div>
            <div className="small-text mt-1">Son 3 Gün</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-green-500">
              {uygulayicilar.length}
            </div>
            <div className="small-text mt-1">Müsait Çalışan</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-purple-500">
              {yeniTalepler.filter(r => r.priority === 'kritik' || r.priority === 'yuksek').length}
            </div>
            <div className="small-text mt-1">Acil / Yüksek</div>
          </CardContent>
        </Card>
      </div>

      {/* Bugün Gelenler - Acil Atama */}
      <div>
        <h2 className="section-title flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-destructive" />
          BUGÜN GELEN TALEPLER ({yeniTalepler.length})
        </h2>
        
        {yeniTalepler.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-6 sm:p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-foreground font-medium">Bugün yeni talep yok!</p>
              <p className="small-text mt-1">Tüm talepler dağıtılmış durumda.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {yeniTalepler.map((request) => (
              <Card key={request.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Talep Bilgileri */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-muted-foreground">{request.requestNo}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${request.priority === 'kritik' ? 'border-destructive text-destructive' : ''}`}
                        >
                          {getPriorityLabel(request.priority)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">{request.department}</Badge>
                      </div>
                      <h3 className="card-title mb-1 truncate">{request.title}</h3>
                      <p className="small-text line-clamp-2">{request.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getHoursAgo(request.createdAt)}
                        </span>
                        <span>Talep: {request.requesterName}</span>
                        <span>Deadline: {request.targetDate}</span>
                      </div>
                    </div>

                    {/* Atama Bölümü */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:w-auto">
                      <Button
                        size="sm"
                        onClick={() => openEmployeeSelector(request.id)}
                        className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Çalışan Seç
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewRequest(request.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Son 3 Gün - Bekleyenler */}
      {sonUcGun.length > yeniTalepler.length && (
        <div>
          <h2 className="section-title flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-orange-500" />
            SON 3 GÜN İÇİNDE BEKLEYENLER ({sonUcGun.length - yeniTalepler.length})
          </h2>
          <div className="space-y-3">
            {sonUcGun
              .filter(r => !yeniTalepler.includes(r))
              .map((request) => (
                <Card key={request.id} className="border-border/50 border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-mono text-muted-foreground">{request.requestNo}</span>
                          <Badge variant="outline" className="text-xs">{request.department}</Badge>
                          <Badge className="text-xs bg-orange-500">Bekliyor</Badge>
                        </div>
                        <h3 className="card-title mb-1 truncate">{request.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Talep: {request.requesterName}</span>
                          <span>Deadline: {request.targetDate}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => openEmployeeSelector(request.id)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Çalışan Seç
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Hızlı Atama İpuçları */}
      <Card className="border-border/50 bg-secondary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Hızlı Atama İpuçları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Kritik öncelikli işler hemen atanmalı</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-muted-foreground">Bugün deadline olan işlere öncelik ver</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Her iş için uygun uzmanı seç</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Çalışan Seçim Dialogu */}
      <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Çalışan Seç - İş Yükü ve Yetkinlik Analizi
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequestForAssign && (
            <div className="space-y-4">
              {/* Talep Özeti */}
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm font-medium">Atanacak İş:</p>
                {(() => {
                  const req = requests.find(r => r.id === selectedRequestForAssign);
                  return req ? (
                    <div className="mt-2">
                      <p className="font-medium">{req.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <Badge variant="outline">{req.workType}</Badge>
                        <Badge 
                          variant="outline" 
                          className={req.priority === 'kritik' ? 'border-destructive text-destructive' : ''}
                        >
                          {getPriorityLabel(req.priority)}
                        </Badge>
                        <span>Deadline: {req.targetDate}</span>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Çalışan Listesi */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Müsait Çalışanlar
                  <span className="text-xs text-muted-foreground font-normal">
                    (İş türüne göre uzmanlar önce)
                  </span>
                </h3>
                
                {(() => {
                  const request = requests.find(r => r.id === selectedRequestForAssign);
                  const employeeStats = getAllEmployeeStats(request?.workType);
                  
                  return employeeStats.map((stats) => (
                    <Card 
                      key={stats.user.id} 
                      className={`border-border/50 transition-all hover:border-primary/50 ${
                        stats.isOverloaded ? 'opacity-60' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          {/* Çalışan Bilgisi */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-base">{stats.user.name}</span>
                              
                              {/* Uzmanlık Rozeti */}
                              {request?.workType && stats.expertise.some(e => 
                                e.toLowerCase().includes(request.workType.toLowerCase()) ||
                                request.workType.toLowerCase().includes(e.toLowerCase())
                              ) && (
                                <Badge className="bg-green-500 text-white text-xs">
                                  <Award className="w-3 h-3 mr-1" />
                                  Uzman
                                </Badge>
                              )}
                              
                              {/* Müsaitlik Rozeti */}
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  stats.availabilityStatus === 'müsait' ? 'border-green-500 text-green-500' :
                                  stats.availabilityStatus === 'orta' ? 'border-yellow-500 text-yellow-500' :
                                  stats.availabilityStatus === 'meşgul' ? 'border-orange-500 text-orange-500' :
                                  'border-destructive text-destructive'
                                }`}
                              >
                                {stats.availabilityStatus === 'müsait' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                                {stats.availabilityStatus === 'orta' && <Clock className="w-3 h-3 mr-1" />}
                                {stats.availabilityStatus === 'meşgul' && <AlertTriangle className="w-3 h-3 mr-1" />}
                                {stats.availabilityStatus === 'aşırı-yüklenmiş' && <XCircle className="w-3 h-3 mr-1" />}
                                {stats.availabilityStatus.toUpperCase()}
                              </Badge>
                            </div>
                            
                            {/* Uzmanlık Alanları */}
                            <div className="flex flex-wrap gap-1 mb-2">
                              {stats.expertise.map((exp, idx) => (
                                <span 
                                  key={idx} 
                                  className={`text-xs px-2 py-0.5 rounded ${
                                    request?.workType && (
                                      exp.toLowerCase().includes(request.workType.toLowerCase()) ||
                                      request.workType.toLowerCase().includes(exp.toLowerCase())
                                    ) 
                                      ? 'bg-green-500/20 text-green-600 font-medium' 
                                      : 'bg-secondary text-muted-foreground'
                                  }`}
                                >
                                  {exp}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* İstatistikler */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:w-auto">
                            {/* Aktif İş Sayısı */}
                            <div className="text-center p-2 bg-secondary/30 rounded-lg">
                              <p className="text-sm font-medium">{stats.activeTaskCount}</p>
                              <p className="text-xs text-muted-foreground">Aktif İş</p>
                            </div>
                            
                            {/* İş Yükü */}
                            <div className="text-center p-2 bg-secondary/30 rounded-lg">
                              <div className="flex items-center justify-center gap-1">
                                <p className={`text-sm font-medium ${
                                  stats.workloadPercent >= 80 ? 'text-destructive' :
                                  stats.workloadPercent >= 60 ? 'text-orange-500' :
                                  'text-green-500'
                                }`}>
                                  {Math.round(stats.workloadPercent)}%
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">İş Yükü</p>
                              <Progress 
                                value={stats.workloadPercent} 
                                className="h-1 mt-1"
                              />
                            </div>
                            
                            {/* Ortalama İlerleme */}
                            <div className="text-center p-2 bg-secondary/30 rounded-lg">
                              <p className="text-sm font-medium">{stats.avgProgress}%</p>
                              <p className="text-xs text-muted-foreground">Ort. İlerleme</p>
                            </div>
                            
                            {/* Tamamlama Oranı */}
                            <div className="text-center p-2 bg-secondary/30 rounded-lg">
                              <p className="text-sm font-medium">{stats.completionRate}%</p>
                              <p className="text-xs text-muted-foreground">Başarı Oranı</p>
                            </div>
                          </div>

                          {/* Atama Butonu */}
                          <Button
                            size="sm"
                            onClick={() => handleAssign(selectedRequestForAssign, stats.user.id)}
                            disabled={stats.isOverloaded}
                            className={`${
                              stats.isOverloaded 
                                ? 'bg-muted text-muted-foreground' 
                                : request?.workType && stats.expertise.some(e => 
                                    e.toLowerCase().includes(request.workType.toLowerCase()) ||
                                    request.workType.toLowerCase().includes(e.toLowerCase())
                                  )
                                  ? 'bg-green-500 hover:bg-green-600'
                                  : 'bg-primary hover:bg-primary/90'
                            }`}
                          >
                            {stats.isOverloaded ? (
                              <>
                                <XCircle className="w-4 h-4 mr-1" />
                                Dolu
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4 mr-1" />
                                Ata
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {/* Aktif İşler Listesi (varsa) */}
                        {stats.activeTasks.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <p className="text-xs text-muted-foreground mb-2">Mevcut İşler:</p>
                            <div className="space-y-1">
                              {stats.activeTasks.slice(0, 3).map((task) => {
                                const completed = task.checklist?.filter(c => c.isCompleted).length || 0;
                                const total = task.checklist?.length || 1;
                                const progress = Math.round((completed / total) * 100);
                                
                                return (
                                  <div key={task.id} className="flex items-center gap-2 text-xs">
                                    <span className="font-mono text-muted-foreground">{task.taskNo}</span>
                                    <span className="truncate flex-1">{task.requestTitle}</span>
                                    <div className="flex items-center gap-2">
                                      <Progress value={progress} className="w-16 h-1" />
                                      <span className="text-muted-foreground w-8">{progress}%</span>
                                    </div>
                                  </div>
                                );
                              })}
                              {stats.activeTasks.length > 3 && (
                                <p className="text-xs text-muted-foreground">
                                  +{stats.activeTasks.length - 3} iş daha...
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ));
                })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
