import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock,
  AlertCircle, 
  CheckCircle, 
  RotateCcw, 
  TrendingUp,
  ArrowRight,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';

export function Dashboard() {
  const { requests, tasks, approvals, setCurrentView, setSelectedRequestId } = useStore();

  const today = new Date();
  // Bu haftanın sonu (Pazar)
  const thisWeekEnd = new Date(today);
  thisWeekEnd.setDate(today.getDate() + (7 - today.getDay()));

  // Yardımcı fonksiyonlar
  const getDaysOverdue = (targetDate: string) => {
    const target = new Date(targetDate);
    const diffTime = today.getTime() - target.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysUntil = (targetDate: string) => {
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Stats
  const todayNew = requests.filter(r => {
    const created = new Date(r.createdAt);
    return created.toDateString() === today.toDateString();
  }).length;

  // Gecikmiş işler: Bugün ve önceki günlerin deadline'ı geçmiş işler
  const delayed = requests.filter(r => {
    if (r.status === 'CMP' || r.status === 'CAN' || r.status === 'PUB') return false;
    const target = new Date(r.targetDate);
    return target <= today; // Bugün dahil
  }).length;

  const waitingApproval = approvals.filter(a => a.status === 'bekliyor').length;
  const inRevision = requests.filter(r => r.status === 'RVZ').length;
  
  // Bugün tamamlanan işler
  const todayCompleted = requests.filter(r => {
    if (r.status !== 'CMP' && r.status !== 'PUB') return false;
    if (!r.completedAt) return false;
    const completed = new Date(r.completedAt);
    return completed.toDateString() === today.toDateString();
  }).length;

  const thisWeekDeadline = requests.filter(r => {
    if (r.status === 'CMP' || r.status === 'CAN' || r.status === 'PUB') return false;
    const target = new Date(r.targetDate);
    return target >= today && target <= thisWeekEnd;
  }).length;

  // Tüm gecikmiş işler (sıralı) - Bugün dahil
  const allDelayedRequests = requests.filter(r => {
    if (r.status === 'CMP' || r.status === 'CAN' || r.status === 'PUB') return false;
    const target = new Date(r.targetDate);
    return target <= today; // Bugün dahil
  }).sort((a, b) => {
    // En çok gecikenden az gecikene sırala
    const daysA = getDaysOverdue(a.targetDate);
    const daysB = getDaysOverdue(b.targetDate);
    return daysB - daysA;
  });

  // Kartta gösterilecek gecikmiş işler (ilk 5)
  const delayedRequests = allDelayedRequests.slice(0, 5);
  const hasMoreDelayed = allDelayedRequests.length > 5;

  // Gecikmesi muhtemel işler (gecikmiş yoksa gösterilecek)
  // Risk analizi: ilerleme durumu ve kalan süreye göre
  const potentialDelays = requests.filter(r => {
    if (r.status === 'CMP' || r.status === 'CAN' || r.status === 'PUB') return false;
    const target = new Date(r.targetDate);
    if (target < today) return false; // Zaten gecikmişler hariç
    
    const daysUntil = getDaysUntil(r.targetDate);
    // 3 gün veya daha az kalmış ve yapım aşamasında/revizede olanlar
    return daysUntil <= 3 && (r.status === 'WIP' || r.status === 'RVZ' || r.status === 'APW');
  }).sort((a, b) => {
    // En yakın deadline önce
    const daysA = getDaysUntil(a.targetDate);
    const daysB = getDaysUntil(b.targetDate);
    return daysA - daysB;
  }).slice(0, 5);

  // This week deadlines
  const thisWeekRequests = requests.filter(r => {
    if (r.status === 'CMP' || r.status === 'CAN' || r.status === 'PUB') return false;
    const target = new Date(r.targetDate);
    return target >= today && target <= thisWeekEnd;
  }).slice(0, 3);

  // Workload by person
  const workloadByPerson = tasks.reduce((acc, task) => {
    if (task.status === 'CMP' || task.status === 'CAN') return acc;
    const existing = acc.find(a => a.userId === task.assignedTo);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ userId: task.assignedTo, userName: task.assignedToName, count: 1 });
    }
    return acc;
  }, [] as { userId: string; userName: string; count: number }[])
  .sort((a, b) => b.count - a.count)
  .slice(0, 5);

  const maxWorkload = Math.max(...workloadByPerson.map(w => w.count), 1);

  // Department stats
  const deptStats = requests.reduce((acc, req) => {
    const existing = acc.find(a => a.department === req.department);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ department: req.department, count: 1 });
    }
    return acc;
  }, [] as { department: string; count: number }[])
  .sort((a, b) => b.count - a.count)
  .slice(0, 5);

  const maxDeptCount = Math.max(...deptStats.map(d => d.count), 1);

  // Pending approvals
  const pendingApprovals = approvals.filter(a => a.status === 'bekliyor').slice(0, 2);

  const handleRequestClick = (requestId: string) => {
    setSelectedRequestId(requestId);
    setCurrentView('talep-detay');
  };

  // İşin ilerleme durumunu hesapla (checklist üzerinden)
  const getTaskProgress = (requestId: string) => {
    const requestTasks = tasks.filter(t => t.requestId === requestId);
    if (requestTasks.length === 0) return 0;
    
    const totalProgress = requestTasks.reduce((sum, task) => {
      if (!task.checklist || task.checklist.length === 0) return sum;
      const completed = task.checklist.filter(c => c.isCompleted).length;
      return sum + (completed / task.checklist.length);
    }, 0);
    
    return Math.round((totalProgress / requestTasks.length) * 100);
  };

  // Risk seviyesi hesapla
  const getRiskLevel = (request: typeof requests[0]) => {
    const daysUntil = getDaysUntil(request.targetDate);
    const progress = getTaskProgress(request.id);
    
    // Kalan gün / Beklenen ilerleme oranı
    const expectedProgress = Math.max(0, 100 - (daysUntil * 20)); // Günde %20 ilerleme varsayımı
    const risk = expectedProgress - progress;
    
    if (risk > 40) return { level: 'high', color: 'text-destructive', bg: 'bg-destructive/10' };
    if (risk > 20) return { level: 'medium', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    return { level: 'low', color: 'text-green-500', bg: 'bg-green-500/10' };
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">📊 Ana Panel</h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">Çarşamba, 2 Nisan 2026</span>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        <Card className="cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all border-border/50" onClick={() => setCurrentView('acik-isler')}>
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-primary">{todayNew}</div>
            <div className="text-xs lg:text-sm text-muted-foreground mt-1">Bugün Yeni</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg hover:shadow-destructive/10 transition-all border-border/50" onClick={() => setCurrentView('acik-isler')}>
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-destructive">{delayed}</div>
            <div className="text-xs lg:text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3 text-destructive" />
              Gecikmiş
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg hover:shadow-purple-500/10 transition-all border-border/50" onClick={() => setCurrentView('onaylar')}>
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-purple-500">{waitingApproval}</div>
            <div className="text-xs lg:text-sm text-muted-foreground mt-1">Onay Bekliyor</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg hover:shadow-orange-500/10 transition-all border-border/50" onClick={() => setCurrentView('revizeler')}>
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-orange-500">{inRevision}</div>
            <div className="text-xs lg:text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
              <RotateCcw className="w-3 h-3 text-orange-500" />
              Revizede
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg hover:shadow-green-500/10 transition-all border-border/50" onClick={() => setCurrentView('acik-isler')}>
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-green-500">{thisWeekDeadline}</div>
            <div className="text-xs lg:text-sm text-muted-foreground mt-1">Bu Hafta</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg hover:shadow-teal-500/10 transition-all border-border/50" onClick={() => setCurrentView('acik-isler')}>
          <CardContent className="p-3 lg:p-4 text-center">
            <div className="text-2xl lg:text-3xl font-bold text-teal-500">{todayCompleted}</div>
            <div className="text-xs lg:text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
              <CheckCircle className="w-3 h-3 text-teal-500" />
              Bugün Tamamlanan
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Delayed Tasks / Potential Delays */}
        <Card className={`border-border/50 ${allDelayedRequests.length > 0 ? 'border-l-4 border-l-destructive' : ''}`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-sm lg:text-base flex items-center gap-2 ${allDelayedRequests.length > 0 ? 'text-destructive' : 'text-orange-500'}`}>
              {allDelayedRequests.length > 0 ? (
                <>
                  <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                  GECİKMİŞ İŞLER
                  <Badge variant="destructive" className="ml-2 text-xs">{allDelayedRequests.length}</Badge>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5" />
                  GECİKME RİSKİ OLANLAR
                  <Badge variant="outline" className="ml-2 text-xs border-orange-500 text-orange-500">{potentialDelays.length}</Badge>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {allDelayedRequests.length > 0 ? (
                // GECİKMİŞ İŞLER VARSA
                <>
                  {delayedRequests.map((req) => {
                    const daysOverdue = getDaysOverdue(req.targetDate);
                    return (
                      <div 
                        key={req.id} 
                        onClick={() => handleRequestClick(req.id)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-destructive/5 rounded-lg cursor-pointer hover:bg-destructive/10 transition-colors gap-2 border border-destructive/20"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <span className="text-xs font-medium text-muted-foreground flex-shrink-0">{req.requestNo}</span>
                          <span className="text-sm truncate font-medium">{req.title.length > 25 ? req.title.substring(0, 25) + '...' : req.title}</span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">{req.department}</span>
                          <span className="text-xs">{req.assignedToName}</span>
                          <Badge variant="destructive" className="text-xs flex-shrink-0">
                            {daysOverdue}g gecikme
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                  {hasMoreDelayed && (
                    <div className="text-center py-2 text-xs text-muted-foreground">
                      +{allDelayedRequests.length - 5} iş daha...
                    </div>
                  )}
                </>
              ) : (
                // GECİKMİŞ İŞ YOKSA - RİSK ANALİZİ
                <>
                  {potentialDelays.length > 0 ? (
                    potentialDelays.map((req) => {
                      const daysUntil = getDaysUntil(req.targetDate);
                      const progress = getTaskProgress(req.id);
                      const risk = getRiskLevel(req);
                      
                      return (
                        <div 
                          key={req.id} 
                          onClick={() => handleRequestClick(req.id)}
                          className={`flex flex-col gap-2 p-3 rounded-lg cursor-pointer hover:opacity-80 transition-colors border ${risk.bg} border-orange-500/30`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="text-xs font-medium text-muted-foreground flex-shrink-0">{req.requestNo}</span>
                              <span className="text-sm truncate font-medium">{req.title.length > 25 ? req.title.substring(0, 25) + '...' : req.title}</span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs flex-shrink-0 ${risk.color} border-current`}
                            >
                              {daysUntil === 0 ? 'Bugün' : `${daysUntil}g kaldı`}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-muted-foreground">{req.assignedToName}</span>
                            <span className="text-muted-foreground">|</span>
                            <span className={risk.color}>İlerleme: %{progress}</span>
                            <div className="flex-1 max-w-[80px]">
                              <Progress value={progress} className="h-1" />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6">
                      <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Harika! Gecikme riski olan iş yok.</p>
                      <p className="text-xs text-muted-foreground mt-1">Tüm işler planlandığı gibi ilerliyor.</p>
                    </div>
                  )}
                </>
              )}
            </div>
            {allDelayedRequests.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setCurrentView('bitirilecek-gorevler')}
              >
                Tüm Gecikmiş İşler <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* This Week Deadlines */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm lg:text-base flex items-center gap-2 text-yellow-500">
              <Clock className="w-4 h-4 lg:w-5 lg:h-5" />
              BU HAFTA DEADLİNE
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {thisWeekRequests.map((req) => {
                const daysUntil = getDaysUntil(req.targetDate);
                const isToday = daysUntil === 0;
                const isTomorrow = daysUntil === 1;
                
                return (
                  <div 
                    key={req.id} 
                    onClick={() => handleRequestClick(req.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors gap-2"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className="text-xs font-medium text-muted-foreground flex-shrink-0">{req.requestNo}</span>
                      <span className="text-sm truncate">{req.title.length > 25 ? req.title.substring(0, 25) + '...' : req.title}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <span className="text-xs">
                        {isToday ? 'Bugün' : isTomorrow ? 'Yarın' : `${req.targetDate.split('-')[2]} Nis.`}
                      </span>
                      <span className="text-xs font-medium">{req.assignedToName}</span>
                      <Badge 
                        className={`text-xs flex-shrink-0 ${isToday ? 'bg-destructive' : isTomorrow ? 'bg-yellow-500' : 'bg-green-500'}`}
                      >
                        {isToday ? '🔴' : isTomorrow ? '🟡' : '🟢'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {thisWeekRequests.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">Bu hafta deadline yok</div>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-3 text-muted-foreground"
              onClick={() => setCurrentView('acik-isler')}
            >
              Tümü <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Workload by Person */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm lg:text-base flex items-center gap-2 text-foreground">
              <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5" />
              KİŞİ BAZLI İŞ YÜKÜ
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {workloadByPerson.map((person) => (
                <div key={person.userId} className="flex items-center gap-3">
                  <span className="text-sm w-20 lg:w-24 truncate">{person.userName}</span>
                  <div className="flex-1 min-w-0">
                    <div 
                      className="h-3 lg:h-4 bg-primary rounded-full transition-all"
                      style={{ width: `${(person.count / maxWorkload) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-10 lg:w-12 flex-shrink-0">{person.count} iş</span>
                </div>
              ))}
              {workloadByPerson.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">Aktif iş yok</div>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-3 text-muted-foreground"
              onClick={() => setCurrentView('gorevlerim')}
            >
              Detay Raporu <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        {/* Department Stats */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm lg:text-base flex items-center gap-2 text-foreground">
              <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5" />
              DEPARTMAN TALEPLERİ
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {deptStats.map((dept) => (
                <div key={dept.department} className="flex items-center gap-3">
                  <span className="text-sm w-16 lg:w-24">{dept.department}</span>
                  <div className="flex-1 min-w-0">
                    <div 
                      className="h-3 lg:h-4 bg-indigo-500 rounded-full transition-all"
                      style={{ width: `${(dept.count / maxDeptCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-6 lg:w-8 flex-shrink-0">{dept.count}</span>
                </div>
              ))}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full mt-3 text-muted-foreground"
              onClick={() => setCurrentView('raporlar')}
            >
              Tüm Dept. <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm lg:text-base flex items-center gap-2 text-green-500">
              <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
              ONAY BEKLEYENLERİM
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {pendingApprovals.map((approval) => (
                <div 
                  key={approval.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-secondary/30 rounded-lg gap-2"
                >
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <span className="text-xs font-medium text-muted-foreground flex-shrink-0">{approval.requestNo}</span>
                    <span className="text-sm truncate">{approval.requestTitle}</span>
                    <span className="text-sm text-muted-foreground hidden md:inline truncate">{approval.submittedByName} teslim etti</span>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setSelectedRequestId(approval.requestId);
                      setCurrentView('talep-detay');
                    }}
                    className="flex-shrink-0"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    İncele
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
