import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  RotateCcw, 
  AlertCircle,
  Eye,
  User,
  Briefcase
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';

export function Bildirimler() {
  const { 
    requests, 
    approvals, 
    currentUser, 
    setCurrentView, 
    setSelectedRequestId 
  } = useStore();

  const today = new Date('2026-04-02');

  // 1. Onay Bekleyen Taleplerim (Talep sahibi için)
  const onayBekleyenTaleplerim = requests.filter(r => 
    r.requesterId === currentUser.id && 
    r.status === 'APW'
  );

  // 2. Revize Taleplerim (Talep sahibi için)
  const revizeTaleplerim = requests.filter(r => 
    r.requesterId === currentUser.id && 
    r.status === 'RVZ'
  );

  // 3. Bugün Deadline Olan Görevlerim
  const bugunDeadlinelerim = requests.filter(r => 
    r.assignedTo === currentUser.id && 
    r.targetDate === '2026-04-02' &&
    r.status !== 'CMP' && 
    r.status !== 'CAN' && 
    r.status !== 'PUB'
  );

  // 4. Yeni Atanan Görevlerim
  const yeniGorevlerim = requests.filter(r => 
    r.assignedTo === currentUser.id && 
    r.status === 'ASN'
  );

  // 5. Onaylamam Gerekenler (Yönetici/GM için)
  const onaylamamGerekenler = approvals.filter(a => 
    a.status === 'bekliyor' && 
    (currentUser.role === 'gm' || currentUser.role === 'yonetici' || currentUser.role === 'admin')
  );

  // 6. Gecikmiş Görevlerim
  const gecikmisGorevlerim = requests.filter(r => 
    r.assignedTo === currentUser.id && 
    new Date(r.targetDate) < today &&
    r.status !== 'CMP' && 
    r.status !== 'CAN' && 
    r.status !== 'PUB'
  );

  const handleViewRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setCurrentView('talep-detay');
  };

  const getDaysOverdue = (targetDate: string) => {
    const target = new Date(targetDate);
    const diffTime = today.getTime() - target.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const totalNotifications = 
    onayBekleyenTaleplerim.length + 
    revizeTaleplerim.length + 
    bugunDeadlinelerim.length + 
    yeniGorevlerim.length + 
    onaylamamGerekenler.length + 
    gecikmisGorevlerim.length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="page-title flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" />
          Bildirimlerim
          {totalNotifications > 0 && (
            <Badge variant="destructive" className="text-xs">
              {totalNotifications}
            </Badge>
          )}
        </h1>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-orange-500">{onayBekleyenTaleplerim.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Onay Bekleyen</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-yellow-500">{revizeTaleplerim.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Revizede</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-destructive">{bugunDeadlinelerim.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Bugün Deadline</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-500">{yeniGorevlerim.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Yeni Atanan</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-purple-500">{onaylamamGerekenler.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Onaylamam Gereken</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{gecikmisGorevlerim.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Gecikmiş</div>
          </CardContent>
        </Card>
      </div>

      {/* Bildirim Listeleri */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Onay Bekleyen Taleplerim */}
        {onayBekleyenTaleplerim.length > 0 && (
          <Card className="border-border/50 border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-orange-500">
                <CheckCircle className="w-4 h-4" />
                Onay Bekleyen Taleplerim ({onayBekleyenTaleplerim.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {onayBekleyenTaleplerim.map((req) => (
                  <div 
                    key={req.id}
                    onClick={() => handleViewRequest(req.id)}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{req.title}</p>
                      <p className="text-xs text-muted-foreground">{req.requestNo} • {req.assignedToName}</p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Revize Taleplerim */}
        {revizeTaleplerim.length > 0 && (
          <Card className="border-border/50 border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-yellow-500">
                <RotateCcw className="w-4 h-4" />
                Revize Taleplerim ({revizeTaleplerim.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {revizeTaleplerim.map((req) => (
                  <div 
                    key={req.id}
                    onClick={() => handleViewRequest(req.id)}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{req.title}</p>
                      <p className="text-xs text-muted-foreground">{req.requestNo} • Revize: {req.revizeCount || 0}/10</p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bugün Deadline */}
        {bugunDeadlinelerim.length > 0 && (
          <Card className="border-border/50 border-l-4 border-l-destructive">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                <Clock className="w-4 h-4" />
                Bugün Deadline Olan İşlerim ({bugunDeadlinelerim.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {bugunDeadlinelerim.map((req) => (
                  <div 
                    key={req.id}
                    onClick={() => handleViewRequest(req.id)}
                    className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg cursor-pointer hover:bg-destructive/10 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{req.title}</p>
                      <p className="text-xs text-muted-foreground">{req.requestNo} • {req.workType}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">Bugün</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Yeni Atanan Görevler */}
        {yeniGorevlerim.length > 0 && (
          <Card className="border-border/50 border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-blue-500">
                <Briefcase className="w-4 h-4" />
                Yeni Atanan Görevlerim ({yeniGorevlerim.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {yeniGorevlerim.map((req) => (
                  <div 
                    key={req.id}
                    onClick={() => handleViewRequest(req.id)}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{req.title}</p>
                      <p className="text-xs text-muted-foreground">{req.requestNo} • Deadline: {req.targetDate}</p>
                    </div>
                    <Badge variant="outline" className="text-xs border-blue-500 text-blue-500">Yeni</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Onaylamam Gerekenler */}
        {onaylamamGerekenler.length > 0 && (
          <Card className="border-border/50 border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-purple-500">
                <User className="w-4 h-4" />
                Onaylamam Gerekenler ({onaylamamGerekenler.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {onaylamamGerekenler.map((app) => (
                  <div 
                    key={app.id}
                    onClick={() => handleViewRequest(app.requestId)}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{app.requestTitle}</p>
                      <p className="text-xs text-muted-foreground">{app.requestNo} • {app.submittedByName} teslim etti</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-purple-500 text-purple-500">
                      <Eye className="w-4 h-4 mr-1" />
                      İncele
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gecikmiş Görevlerim */}
        {gecikmisGorevlerim.length > 0 && (
          <Card className="border-border/50 border-l-4 border-l-red-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                Gecikmiş Görevlerim ({gecikmisGorevlerim.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {gecikmisGorevlerim.map((req) => (
                  <div 
                    key={req.id}
                    onClick={() => handleViewRequest(req.id)}
                    className="flex items-center justify-between p-3 bg-red-500/5 rounded-lg cursor-pointer hover:bg-red-500/10 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{req.title}</p>
                      <p className="text-xs text-muted-foreground">{req.requestNo} • Deadline: {req.targetDate}</p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {getDaysOverdue(req.targetDate)}g gecikme
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Boş Durum */}
      {totalNotifications === 0 && (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">Bildiriminiz bulunmuyor</p>
            <p className="small-text mt-1">Tüm işleriniz planlandığı gibi ilerliyor.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
