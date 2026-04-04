import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Eye
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { getRevizeSourceLabel } from '@/data/mockData';

export function Revizeler() {
  const { revizeler, requests, tasks, currentUser, setCurrentView, setSelectedRequestId } = useStore();

  // Filter based on user role
  const myRevizeler = revizeler.filter(r => {
    // Admin/Yonetici/Koordinator sees all
    if (['admin', 'yonetici', 'koordinator'].includes(currentUser.role)) {
      return true;
    }

    // Talep sahibi sees revizes for own requests
    if (currentUser.role === 'talep_sahibi') {
      const request = requests.find(req => req.id === r.requestId);
      return request?.requesterId === currentUser.id;
    }

    // Uygulayici sees revizes for own tasks
    if (currentUser.role === 'uygulayici') {
      const task = tasks.find(t => t.id === r.taskId);
      return task?.assignedTo === currentUser.id;
    }

    return false;
  });

  const openRevizeler = myRevizeler.filter(r => r.status === 'acik');
  const resolvedRevizeler = myRevizeler.filter(r => r.status === 'cozuldu');

  const handleViewRequest = (requestId?: string) => {
    if (requestId) {
      setSelectedRequestId(requestId);
      setCurrentView('talep-detay');
    }
  };

  const getRelatedTitle = (revize: typeof myRevizeler[0]) => {
    if (revize.requestId) {
      const req = requests.find(r => r.id === revize.requestId);
      return req?.title || 'Bilinmiyor';
    }
    if (revize.taskId) {
      const task = tasks.find(t => t.id === revize.taskId);
      return task?.requestTitle || 'Bilinmiyor';
    }
    return 'Bilinmiyor';
  };

  const getRelatedNo = (revize: typeof myRevizeler[0]) => {
    if (revize.requestId) {
      const req = requests.find(r => r.id === revize.requestId);
      return req?.requestNo || '';
    }
    if (revize.taskId) {
      const task = tasks.find(t => t.id === revize.taskId);
      return task?.taskNo || '';
    }
    return '';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-slate-900">🔄 Revizeler</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">{openRevizeler.length}</div>
            <div className="text-sm text-slate-600 mt-1 flex items-center justify-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Açık Revize
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{resolvedRevizeler.length}</div>
            <div className="text-sm text-slate-600 mt-1 flex items-center justify-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Çözülen
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{myRevizeler.length}</div>
            <div className="text-sm text-slate-600 mt-1">Toplam</div>
          </CardContent>
        </Card>
      </div>

      {/* Open Revisions */}
      {openRevizeler.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-orange-600">
            <AlertCircle className="w-5 h-5" />
            AÇIK REVİZELER ({openRevizeler.length})
          </h2>
          <div className="space-y-2">
            {openRevizeler.map((revize) => (
              <Card key={revize.id} className="border-orange-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-slate-500">{revize.revizeNo}</span>
                      <span className="text-sm font-medium text-slate-500">{getRelatedNo(revize)}</span>
                      <span className="font-medium">{getRelatedTitle(revize)}</span>
                      <Badge className="bg-orange-500">{getRevizeSourceLabel(revize.source)}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-500">{revize.requestedByName}</span>
                      <span className="text-sm">{new Date(revize.requestedAt).toLocaleDateString('tr-TR')}</span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleViewRequest(revize.requestId)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    <span className="font-medium">Neden:</span> {revize.reason}
                  </div>
                  <div className="text-sm text-slate-600">
                    <span className="font-medium">Beklenti:</span> {revize.expectation}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Resolved Revisions */}
      {resolvedRevizeler.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            ÇÖZÜLEN REVİZELER ({resolvedRevizeler.length})
          </h2>
          <div className="space-y-2">
            {resolvedRevizeler.map((revize) => (
              <Card key={revize.id} className="border-green-200 bg-green-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-slate-500">{revize.revizeNo}</span>
                      <span className="text-sm font-medium text-slate-500">{getRelatedNo(revize)}</span>
                      <span className="font-medium">{getRelatedTitle(revize)}</span>
                      <Badge className="bg-green-500">{getRevizeSourceLabel(revize.source)}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-500">{revize.requestedByName}</span>
                      <span className="text-sm">{new Date(revize.requestedAt).toLocaleDateString('tr-TR')}</span>
                      <Badge className="bg-green-500">Çözüldü ✅</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {myRevizeler.length === 0 && (
        <div className="text-center py-12">
          <RotateCcw className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Revize bulunmuyor</p>
        </div>
      )}
    </div>
  );
}
