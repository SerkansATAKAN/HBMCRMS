import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { 
  ClipboardList, 
  Search,
  Eye
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { getStatusLabel } from '@/data/mockData';

export function AcikIsler() {
  const { requests, tasks, currentUser, setCurrentView, setSelectedRequestId } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const today = new Date();

  // Filter based on user role
  let myRequests = requests.filter(r => {
    // Exclude completed/cancelled/published
    if (['CMP', 'CAN', 'PUB'].includes(r.status)) return false;

    // Admin/Yonetici/Koordinator/GM hepsini görür
    if (['admin', 'yonetici', 'koordinator', 'gm'].includes(currentUser.role)) {
      return true;
    }

    // Talep sahibi kendi taleplerini görür
    if (currentUser.role === 'talep_sahibi') {
      return r.requesterId === currentUser.id;
    }

    // Uygulayici kendine atanmış görevlerin taleplerini görür
    if (currentUser.role === 'uygulayici') {
      return tasks.some(t => t.requestId === r.id && t.assignedTo === currentUser.id);
    }

    return false;
  });

  const isDelayed = (request: typeof myRequests[0]) => {
    const target = new Date(request.targetDate);
    return target < today;
  };

  const getDaysOverdue = (targetDate: string) => {
    const target = new Date(targetDate);
    const diffTime = today.getTime() - target.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysLeft = (targetDate: string) => {
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleViewRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setCurrentView('talep-detay');
  };

  // Arama filtresi uygula
  const filteredRequests = searchTerm.trim()
    ? myRequests.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.requestNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.requesterName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : myRequests;

  // Group by status
  const newRequests = filteredRequests.filter(r => r.status === 'NEW');
  const inProgressRequests = filteredRequests.filter(r => ['REV', 'ASN', 'WIP', 'QCC'].includes(r.status));
  const waitingApproval = filteredRequests.filter(r => r.status === 'APW');
  const inRevision = filteredRequests.filter(r => r.status === 'RVZ');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">📋 Açık İşler</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="İş ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{newRequests.length}</div>
            <div className="text-sm text-slate-600 mt-1">Yeni</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">{inProgressRequests.length}</div>
            <div className="text-sm text-slate-600 mt-1">Yapımda</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{waitingApproval.length}</div>
            <div className="text-sm text-slate-600 mt-1">Onay Bekliyor</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">{inRevision.length}</div>
            <div className="text-sm text-slate-600 mt-1">Revizede</div>
          </CardContent>
        </Card>
      </div>

      {/* New Requests */}
      {newRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            YENİ TALEPLER ({newRequests.length})
          </h2>
          <div className="space-y-2">
            {newRequests.map((req) => (
              <Card key={req.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-slate-500">{req.requestNo}</span>
                      <span className="font-medium">{req.title}</span>
                      <Badge>{req.department}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-500">{req.requesterName}</span>
                      <span className="text-sm">{getStatusLabel(req.status)}</span>
                      <Button size="sm" variant="ghost" onClick={() => handleViewRequest(req.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* In Progress */}
      {inProgressRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            YAPIM AŞAMASINDA ({inProgressRequests.length})
          </h2>
          <div className="space-y-2">
            {inProgressRequests.map((req) => {
              const delayed = isDelayed(req);
              const daysLeft = getDaysLeft(req.targetDate);
              
              return (
                <Card key={req.id} className={delayed ? 'border-red-300' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-500">{req.requestNo}</span>
                        <span className="font-medium">{req.title}</span>
                        <Badge>{req.department}</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm">{req.assignedToName || 'Atanmadı'}</span>
                        <span className={`text-sm ${delayed ? 'text-red-600 font-medium' : daysLeft <= 2 ? 'text-yellow-600' : ''}`}>
                          {delayed ? `${getDaysOverdue(req.targetDate)} gün gecikti` : `${daysLeft} gün kaldı`}
                        </span>
                        <Button size="sm" variant="ghost" onClick={() => handleViewRequest(req.id)}>
                          <Eye className="w-4 h-4" />
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

      {/* Waiting Approval */}
      {waitingApproval.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            ONAY BEKLİYOR ({waitingApproval.length})
          </h2>
          <div className="space-y-2">
            {waitingApproval.map((req) => (
              <Card key={req.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-slate-500">{req.requestNo}</span>
                      <span className="font-medium">{req.title}</span>
                      <Badge>{req.department}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">{req.assignedToName}</span>
                      <Button size="sm" onClick={() => handleViewRequest(req.id)}>
                        Onayla
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* In Revision */}
      {inRevision.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            REVİZEDE ({inRevision.length})
          </h2>
          <div className="space-y-2">
            {inRevision.map((req) => (
              <Card key={req.id} className="border-yellow-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-slate-500">{req.requestNo}</span>
                      <span className="font-medium">{req.title}</span>
                      <Badge>{req.department}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">{req.assignedToName}</span>
                      <Button size="sm" variant="ghost" onClick={() => handleViewRequest(req.id)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {myRequests.length === 0 && (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Açık iş bulunmuyor</p>
        </div>
      )}
    </div>
  );
}
