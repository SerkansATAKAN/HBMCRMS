import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  RotateCcw, 
  Calendar,
  AlertTriangle,
  ArrowRight,
  Eye,
  CheckCircle2,
  Clock,
  User
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { getStatusLabel, getStatusColor } from '@/data/mockData';

export function Gorevlerim() {
  const { tasks, currentUser, setCurrentView, setSelectedTaskId, setSelectedRequestId } = useStore();

  const myTasks = tasks.filter(t => t.assignedTo === currentUser.id);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Bu haftanın sonu (Pazar)
  const thisWeekEnd = new Date(today);
  thisWeekEnd.setDate(today.getDate() + (7 - today.getDay()));

  const stats = {
    inProgress: myTasks.filter(t => t.status === 'WIP').length,
    inRevision: myTasks.filter(t => t.status === 'RVZ').length,
    waitingApproval: myTasks.filter(t => t.status === 'APW').length,
  completedThisMonth: myTasks.filter(t => {
    if (t.status !== 'CMP' || !t.completedAt) return false;
    const completed = new Date(t.completedAt);
    return completed.getMonth() === today.getMonth() && completed.getFullYear() === today.getFullYear();
  }).length,
  };

  const todayDeadline = myTasks.filter(t => t.dueDate === todayStr && t.status !== 'CMP' && t.status !== 'CAN');
  const thisWeekDeadline = myTasks.filter(t => {
    const due = new Date(t.dueDate);
    return due > today && due <= thisWeekEnd && t.status !== 'CMP' && t.status !== 'CAN';
  });
  const inRevision = myTasks.filter(t => t.status === 'RVZ');

  const isOverdue = (dueDate: string) => dueDate < todayStr;

  const handleViewTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTaskId(taskId);
      setSelectedRequestId(task.requestId);
      setCurrentView('talep-detay');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="page-title flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-primary" />
          Görevlerim
        </h1>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-medium text-primary-foreground">
            {currentUser.name.charAt(0)}
          </div>
          <span className="text-sm font-medium">{currentUser.name}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-orange-500">{stats.inProgress}</div>
            <div className="small-text mt-1">Yapımda</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-yellow-500">{stats.inRevision}</div>
            <div className="small-text mt-1 flex items-center justify-center gap-1">
              <RotateCcw className="w-3 h-3" />
              Revizede
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-purple-500">{stats.waitingApproval}</div>
            <div className="small-text mt-1">Onayda</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-green-500">{stats.completedThisMonth}</div>
            <div className="small-text mt-1">Bu Ay</div>
          </CardContent>
        </Card>
      </div>

      {/* Today Deadline */}
      <div>
        <h2 className="section-title flex items-center gap-2 mb-3 text-destructive">
          <AlertTriangle className="w-4 h-4" />
          BUGÜN TESLİM ({todayDeadline.length})
        </h2>
        <div className="space-y-3">
          {todayDeadline.map((task) => {
            const overdue = isOverdue(task.dueDate);
            const completedChecklist = task.checklist.filter(c => c.isCompleted).length;
            const totalChecklist = task.checklist.length;
            
            return (
              <Card key={task.id} className={`border-border/50 ${overdue ? 'border-destructive/50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs font-mono ${overdue ? 'text-destructive' : 'text-yellow-500'}`}>
                          {task.taskNo}
                        </span>
                        <Badge variant="outline" className="text-xs">{task.type}</Badge>
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                          <span className="text-xs">{getStatusLabel(task.status)}</span>
                        </div>
                      </div>
                      <p className="card-title truncate">{task.requestTitle}</p>
                      <p className="small-text">{task.requestNo}</p>
                      
                      {totalChecklist > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">İlerleme</span>
                            <span>{completedChecklist}/{totalChecklist}</span>
                          </div>
                          <Progress value={(completedChecklist / totalChecklist) * 100} className="h-1.5" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-sm font-medium ${overdue ? 'text-destructive' : ''}`}>
                        {overdue ? 'GECİKTİ' : '17:00'}
                      </span>
                      <Button size="sm" variant="ghost" onClick={() => handleViewTask(task.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {todayDeadline.length === 0 && (
            <Card className="border-border/50">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="text-foreground font-medium">Bugün teslim görev yok!</p>
                <p className="small-text">Rahat bir gün.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* This Week */}
      <div>
        <h2 className="section-title flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-primary" />
          BU HAFTA TESLİM ({thisWeekDeadline.length})
        </h2>
        <div className="space-y-3">
          {thisWeekDeadline.map((task) => (
            <Card key={task.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{task.taskNo}</span>
                      <Badge variant="outline" className="text-xs">{task.type}</Badge>
                    </div>
                    <p className="card-title truncate">{task.requestTitle}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm text-muted-foreground">{task.dueDate.split('-')[2]} Nis.</span>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                      <span className="text-xs">{getStatusLabel(task.status)}</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleViewTask(task.id)}>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {thisWeekDeadline.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Bu hafta teslim görev yok
            </div>
          )}
        </div>
      </div>

      {/* In Revision */}
      {inRevision.length > 0 && (
        <div>
          <h2 className="section-title flex items-center gap-2 mb-3 text-yellow-500">
            <RotateCcw className="w-4 h-4" />
            REVİZEDE ({inRevision.length})
          </h2>
          <div className="space-y-3">
            {inRevision.map((task) => (
              <Card key={task.id} className="border-border/50 border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-yellow-500">{task.taskNo}</span>
                        <Badge className="text-xs bg-yellow-500">Revizede</Badge>
                      </div>
                      <p className="card-title truncate">{task.requestTitle}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm text-muted-foreground">Revize nedeni görüntüle</span>
                      <Button size="sm" variant="ghost" onClick={() => handleViewTask(task.id)}>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Özet Kart */}
      <Card className="border-border/50 bg-secondary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Görev Özeti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{myTasks.filter(t => t.status !== 'CMP' && t.status !== 'CAN').length}</p>
                <p className="small-text">Aktif görev</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium">{myTasks.filter(t => t.status === 'CMP').length}</p>
                <p className="small-text">Tamamlanan</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-medium">{inRevision.length}</p>
                <p className="small-text">Revizede</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
