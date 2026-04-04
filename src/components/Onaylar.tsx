import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp,
  FileText,
  RotateCcw
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { getRevizeSourceLabel } from '@/data/mockData';

const isSafeUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

export function Onaylar() {
  const { approvals, revizeler, tasks, updateApproval, updateRequest, addComment, currentUser } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');
  const [showRejectForm, setShowRejectForm] = useState<string | null>(null);

  const pendingApprovals = approvals.filter(a => a.status === 'bekliyor');

  const handleApprove = (approval: typeof pendingApprovals[0]) => {
    const now = new Date().toISOString();
    updateApproval(approval.id, { status: 'onaylandi' });
    updateRequest(approval.requestId, { status: 'CMP', completedAt: now });
  };

  const handleReject = (approval: typeof pendingApprovals[0]) => {
    updateApproval(approval.id, { status: 'reddedildi' });
    updateRequest(approval.requestId, { status: 'RVZ' });
    if (rejectionNote.trim()) {
      addComment({
        requestId: approval.requestId,
        userId: currentUser.id,
        userName: currentUser.name,
        content: `İade Nedeni: ${rejectionNote.trim()}`,
      });
    }
    setShowRejectForm(null);
    setRejectionNote('');
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-slate-900">
        ✔️ Onaylar — Benim Onayımı Bekleyenler ({pendingApprovals.length})
      </h1>

      {/* Approvals List */}
      <div className="space-y-4">
        {pendingApprovals.map((approval) => {
          const isExpanded = expandedId === approval.id;
          const requestTaskIds = tasks
            .filter(t => t.requestId === approval.requestId)
            .map(t => t.id);
          const approvalRevizeler = revizeler.filter(r =>
            r.requestId === approval.requestId ||
            requestTaskIds.includes(r.taskId || '')
          );

          return (
            <Card key={approval.id} className={isExpanded ? 'ring-2 ring-blue-500' : ''}>
              <CardHeader className="pb-3">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(approval.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-500">{approval.approvalNo}</span>
                    <span className="text-sm font-medium text-slate-500">{approval.requestNo}</span>
                    <span className="font-medium">{approval.requestTitle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(approval.id);
                      }}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {isExpanded ? 'Kapat' : 'Aç'}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Gönderen:</span>
                      <span className="ml-2">{approval.submittedByName} (İç Reviewer)</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Onay Tipi:</span>
                      <span className="ml-2">{approval.approvalType === 'son_onay' ? 'Son Onay' : 'İç Onay'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Tarih:</span>
                      <span className="ml-2">{new Date(approval.submittedAt).toLocaleString('tr-TR')}</span>
                    </div>
                  </div>

                  {approval.deliverableNote && (
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <span className="text-sm text-slate-500">Teslim Notu:</span>
                      <p className="text-sm mt-1">{approval.deliverableNote}</p>
                    </div>
                  )}

                  {approval.deliverableUrl && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <a 
                        href={isSafeUrl(approval.deliverableUrl) ? approval.deliverableUrl : '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {approval.deliverableUrl.split('/').pop()}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-500">Checklist Durumu:</span>
                      <span>{approval.checklistCompleted}/{approval.checklistTotal} ✅</span>
                    </div>
                    <Progress 
                      value={(approval.checklistCompleted / approval.checklistTotal) * 100} 
                      className="h-2"
                    />
                    {approval.checklistCompleted === approval.checklistTotal && (
                      <span className="text-sm text-green-600">Tümü tamamlandı</span>
                    )}
                  </div>

                  {approval.revizeCount > 0 && (
                    <div className="text-sm">
                      <span className="text-slate-500">Revize Sayısı:</span>
                      <span className="ml-2">{approval.revizeCount}</span>
                      {approvalRevizeler.length > 0 && (
                        <span className="ml-2 text-slate-400">
                          ({approvalRevizeler.map(r => getRevizeSourceLabel(r.source)).join(', ')} — çözüldü)
                        </span>
                      )}
                    </div>
                  )}

                  {showRejectForm === approval.id ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="İade nedenini yazın..."
                        value={rejectionNote}
                        onChange={(e) => setRejectionNote(e.target.value)}
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowRejectForm(null)}
                        >
                          İptal
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleReject(approval)}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          İade Et
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowRejectForm(approval.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        İade Et / Revize İste
                      </Button>
                      <Button 
                        onClick={() => handleApprove(approval)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Onayla
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}

        {pendingApprovals.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-slate-500">Onayınızı bekleyen talep bulunmuyor</p>
          </div>
        )}
      </div>
    </div>
  );
}
