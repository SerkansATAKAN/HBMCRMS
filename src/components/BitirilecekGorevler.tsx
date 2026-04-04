import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CalendarCheck, 
  Clock, 
  AlertCircle,
  CheckCircle,
  RotateCcw,
  User,
  ArrowRight,
  Flag,
  Timer
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { getStatusLabel, getStatusColor, getPriorityLabel } from '@/data/mockData';

export function BitirilecekGorevler() {
  const { tasks, requests, setCurrentView, setSelectedRequestId } = useStore();

  const today = new Date().toISOString().split('T')[0];

  // Bugün deadline olan görevler
  const bugunDeadline = tasks.filter(t => {
    return t.dueDate === today && t.status !== 'CMP' && t.status !== 'CAN';
  });

  // Bugün deadline olan talepler (görevi olmayanlar da dahil)
  const bugunDeadlineTalepler = requests.filter(r => {
    if (r.status === 'CMP' || r.status === 'CAN' || r.status === 'PUB') return false;
    return r.targetDate === today;
  });

  // Gecikmiş görevler
  const gecikmisGorevler = tasks.filter(t => {
    if (t.status === 'CMP' || t.status === 'CAN') return false;
    return t.dueDate < today;
  });

  // İstatistikler
  const stats = {
    toplam: bugunDeadline.length,
    yapimda: bugunDeadline.filter(t => t.status === 'WIP').length,
    revizede: bugunDeadline.filter(t => t.status === 'RVZ').length,
    onayda: bugunDeadline.filter(t => t.status === 'APW').length,
    atanmadi: bugunDeadline.filter(t => t.status === 'ASN').length,
  };

  const handleViewRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setCurrentView('talep-detay');
  };

  const getChecklistProgress = (task: typeof tasks[0]) => {
    if (!task.checklist || task.checklist.length === 0) return 0;
    const completed = task.checklist.filter(c => c.isCompleted).length;
    return Math.round((completed / task.checklist.length) * 100);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="page-title flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-primary" />
          Bugün Bitirilmesi Gereken Görevler
        </h1>
        <div className="text-sm text-muted-foreground">
          {today.split('-').reverse().join('.')} - {new Date().toLocaleDateString('tr-TR', { weekday: 'long' })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-foreground">{stats.toplam}</div>
            <div className="small-text mt-1">Toplam</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-orange-500">{stats.yapimda}</div>
            <div className="small-text mt-1">Yapımda</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-yellow-500">{stats.revizede}</div>
            <div className="small-text mt-1">Revizede</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-purple-500">{stats.onayda}</div>
            <div className="small-text mt-1">Onayda</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-blue-500">{stats.atanmadi}</div>
            <div className="small-text mt-1">Atanmış</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-destructive">{gecikmisGorevler.length}</div>
            <div className="small-text mt-1">Gecikmiş</div>
          </CardContent>
        </Card>
      </div>

      {/* Bugün Bitirilecekler */}
      <div>
        <h2 className="section-title flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-primary" />
          BUGÜN DEADLINE ({bugunDeadline.length})
        </h2>
        
        {bugunDeadline.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-6 sm:p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-foreground font-medium">Bugün teslim görev yok!</p>
              <p className="small-text mt-1">Tüm görevler planlandığı gibi ilerliyor.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {bugunDeadline.map((task) => {
              const progress = getChecklistProgress(task);
              
              return (
                <Card key={task.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Görev Bilgileri */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground">{task.taskNo}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${task.priority === 'kritik' ? 'border-destructive text-destructive' : ''}`}
                          >
                            {getPriorityLabel(task.priority)}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                            <span className="text-xs">{getStatusLabel(task.status)}</span>
                          </div>
                        </div>
                        <h3 className="card-title mb-1 truncate">{task.requestTitle}</h3>
                        <p className="small-text">{task.title}</p>
                        
                        {/* İlerleme */}
                        {task.checklist && task.checklist.length > 0 && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-muted-foreground">İlerleme</span>
                              <span className={progress === 100 ? 'text-green-500' : ''}>
                                {progress}%
                              </span>
                            </div>
                            <Progress value={progress} className="h-1.5" />
                          </div>
                        )}
                      </div>

                      {/* Sorumlu ve İşlem */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:w-auto">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{task.assignedToName}</p>
                            <p className="text-xs text-muted-foreground">Sorumlu</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewRequest(task.requestId)}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Gecikmiş Görevler */}
      {gecikmisGorevler.length > 0 && (
        <div>
          <h2 className="section-title flex items-center gap-2 mb-3 text-destructive">
            <AlertCircle className="w-4 h-4" />
            GECİKMİŞ GÖREVLER ({gecikmisGorevler.length})
          </h2>
          <div className="space-y-3">
            {gecikmisGorevler.map((task) => {
              const daysOverdue = Math.floor((new Date(today).getTime() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <Card key={task.id} className="border-destructive/50 border-l-4 border-l-destructive">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground">{task.taskNo}</span>
                          <Badge variant="destructive" className="text-xs">
                            {daysOverdue} GÜN GECİKTİ
                          </Badge>
                        </div>
                        <h3 className="card-title mb-1 truncate">{task.requestTitle}</h3>
                        <p className="small-text">{task.title}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{task.assignedToName}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewRequest(task.requestId)}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Özet Kart */}
      <Card className="border-border/50 bg-secondary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Timer className="w-4 h-4" />
            Gün Özeti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Flag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{bugunDeadlineTalepler.length}</p>
                <p className="small-text">Bugün teslim talep</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium">
                  {tasks.filter(t => t.status === 'CMP' && t.completedAt?.startsWith(today)).length}
                </p>
                <p className="small-text">Bugün tamamlanan</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-medium">
                  {tasks.filter(t => t.status === 'RVZ').length}
                </p>
                <p className="small-text">Revizede bekleyen</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
