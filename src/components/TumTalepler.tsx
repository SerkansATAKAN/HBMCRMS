import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { PlusCircle, Search, Filter, AlertCircle, Eye, RotateCcw, Clock, ArrowRightLeft } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { getStatusLabel, getStatusColor } from '@/data/mockData';
import type { RequestStatus, Department, Priority } from '@/types';

const statusOptions: { value: RequestStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'NEW', label: 'Yeni Talep' },
  { value: 'REV', label: 'İnceleniyor' },
  { value: 'BRF', label: 'Eksik Brief' },
  { value: 'ASN', label: 'Atandı' },
  { value: 'WIP', label: 'Yapım Aşamasında' },
  { value: 'QCC', label: 'İç Kontrolde' },
  { value: 'APW', label: 'Onay Bekliyor' },
  { value: 'RVZ', label: 'Revizede' },
  { value: 'CMP', label: 'Tamamlandı' },
  { value: 'PUB', label: 'Yayınlandı' },
  { value: 'CAN', label: 'İptal' },
];

const departmentOptions: { value: Department | 'all'; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'F&B', label: 'F&B' },
  { value: 'Events', label: 'Events' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Spa', label: 'Spa' },
  { value: 'HR', label: 'HR' },
  { value: 'Wedding', label: 'Wedding' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Pazarlama', label: 'Pazarlama' },
];

const priorityOptions: { value: Priority | 'all'; label: string }[] = [
  { value: 'all', label: 'Tümü' },
  { value: 'dusuk', label: 'Düşük' },
  { value: 'normal', label: 'Normal' },
  { value: 'yuksek', label: 'Yüksek' },
  { value: 'kritik', label: 'Kritik' },
];

export function TumTalepler() {
  const { requests, setCurrentView, setSelectedRequestId } = useStore();
  
  const [filters, setFilters] = useState({
    department: 'all' as Department | 'all',
    status: 'all' as RequestStatus | 'all',
    priority: 'all' as Priority | 'all',
    search: '',
  });

  const [sortBy, setSortBy] = useState('newest');

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    if (filters.department !== 'all') {
      result = result.filter(r => r.department === filters.department);
    }

    if (filters.status !== 'all') {
      result = result.filter(r => r.status === filters.status);
    }

    if (filters.priority !== 'all') {
      result = result.filter(r => r.priority === filters.priority);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(r => 
        r.title.toLowerCase().includes(searchLower) ||
        r.requestNo.toLowerCase().includes(searchLower) ||
        r.requesterName.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'deadline') {
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
      }
      return 0;
    });

    return result;
  }, [requests, filters, sortBy]);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const isDelayed = (request: typeof requests[0]) => {
    if (request.status === 'CMP' || request.status === 'CAN' || request.status === 'PUB') return false;
    const target = new Date(request.targetDate);
    return target < today;
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    return `${diffDays}G`;
  };

  const stats = {
    total: requests.length,
    open: requests.filter(r => !['CMP', 'CAN', 'PUB'].includes(r.status)).length,
    delayed: requests.filter(r => isDelayed(r)).length,
    thisMonth: requests.filter(r => {
      const created = new Date(r.createdAt);
      return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
    }).length,
  };

  const handleViewRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setCurrentView('talep-detay');
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">📁 Tüm Talepler</h1>
        <Button onClick={() => setCurrentView('yeni-talep')} className="w-full sm:w-auto">
          <PlusCircle className="w-4 h-4 mr-2" />
          Yeni Talep
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-3 lg:p-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtreler:</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
              <Select 
                value={filters.department} 
                onValueChange={(v) => setFilters({ ...filters, department: v as Department | 'all' })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Dept." />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.status} 
                onValueChange={(v) => setFilters({ ...filters, status: v as RequestStatus | 'all' })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filters.priority} 
                onValueChange={(v) => setFilters({ ...filters, priority: v as Priority | 'all' })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Öncelik" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sıralama" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Son eklenen</SelectItem>
                  <SelectItem value="oldest">İlk eklenen</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-shrink-0 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Talep ara..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table */}
      <Card className="border-border/50 hidden lg:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Talep No</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Dept</TableHead>
                <TableHead>Atanan</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Revize</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => {
                const delayed = isDelayed(request);
                const revizeCount = request.revizeCount || 0;
                
                return (
                  <TableRow 
                    key={request.id}
                    className={delayed ? 'bg-destructive/5' : ''}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1">
                        {request.transferredFromRequestNo && (
                          <ArrowRightLeft className="w-3 h-3 text-purple-500" />
                        )}
                        {request.requestNo}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[250px] truncate" title={request.title}>
                        {request.title}
                      </div>
                    </TableCell>
                    <TableCell>{request.department}</TableCell>
                    <TableCell>
                      {request.assignedToName ? (
                        request.assignedToName
                      ) : (
                        <span className="text-orange-500 text-sm flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Atama bekliyor!
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(request.status)}`} />
                        <span className="text-sm">{getStatusLabel(request.status)}</span>
                        {delayed && (
                          <Badge variant="destructive" className="text-xs">
                            GECİKTİ
                          </Badge>
                        )}
                        {request.isDelayedCompleted && request.delayedDays && request.delayedDays > 0 && (
                          <Badge variant="outline" className="text-xs bg-orange-500/20 text-orange-500 border-orange-500/50">
                            <Clock className="w-3 h-3 mr-1" />
                            {request.delayedDays}g gecikme
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 text-xs ${
                        revizeCount >= 10 ? 'text-destructive font-medium' : 
                        revizeCount >= 7 ? 'text-orange-500' : 'text-muted-foreground'
                      }`}>
                        <RotateCcw className="w-3 h-3" />
                        {revizeCount}/10
                      </div>
                    </TableCell>
                    <TableCell>{getDaysAgo(request.createdAt)}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleViewRequest(request.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Talep bulunamadı
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {filteredRequests.map((request) => {
          const delayed = isDelayed(request);
          const revizeCount = request.revizeCount || 0;
          
          return (
            <Card 
              key={request.id} 
              className={`border-border/50 cursor-pointer ${delayed ? 'border-destructive/50' : ''}`}
              onClick={() => handleViewRequest(request.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        {request.transferredFromRequestNo && (
                          <ArrowRightLeft className="w-3 h-3 text-purple-500 inline mr-1" />
                        )}
                        {request.requestNo}
                      </span>
                      <Badge variant="outline" className="text-xs">{request.department}</Badge>
                    </div>
                    <p className="text-sm font-medium truncate">{request.title}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="flex-shrink-0">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(request.status)}`} />
                    <span className="text-xs">{getStatusLabel(request.status)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {request.assignedToName ? (
                      <span className="text-xs text-muted-foreground">{request.assignedToName}</span>
                    ) : (
                      <span className="text-xs text-orange-500">Atama bekliyor</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className={`flex items-center gap-1 text-xs ${
                    revizeCount >= 10 ? 'text-destructive' : 
                    revizeCount >= 7 ? 'text-orange-500' : 'text-muted-foreground'
                  }`}>
                    <RotateCcw className="w-3 h-3" />
                    Revize: {revizeCount}/10
                  </div>
                  <div className="flex items-center gap-1">
                    {delayed && (
                      <Badge variant="destructive" className="text-xs">GECİKTİ</Badge>
                    )}
                    {request.isDelayedCompleted && request.delayedDays && request.delayedDays > 0 && (
                      <Badge variant="outline" className="text-xs bg-orange-500/20 text-orange-500 border-orange-500/50">
                        {request.delayedDays}g gecikme
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredRequests.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Talep bulunamadı
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="flex flex-wrap justify-center gap-4 lg:gap-8 text-sm text-muted-foreground">
        <span>Toplam: <strong className="text-foreground">{stats.total}</strong> talep</span>
        <span>Açık: <strong className="text-foreground">{stats.open}</strong></span>
        <span>Gecikmiş: <strong className="text-destructive">{stats.delayed}</strong></span>
        <span>Bu ay: <strong className="text-foreground">{stats.thisMonth}</strong></span>
      </div>
    </div>
  );
}
