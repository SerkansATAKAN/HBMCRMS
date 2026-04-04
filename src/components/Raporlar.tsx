import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  RotateCcw,
  Download,
  FileSpreadsheet,
  Calendar
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { getRevizeSourceLabel } from '@/data/mockData';
import { toast } from 'sonner';

export function Raporlar() {
  const { requests, tasks, revizeler } = useStore();

  // KPI Calculations
  const calculateKPIs = () => {
    const completedRequests = requests.filter(r => r.status === 'CMP');
    const onTimeDeliveries = completedRequests.filter(r => {
      if (!r.completedAt) return false;
      return new Date(r.completedAt) <= new Date(r.targetDate);
    });

    const onTimeRate = completedRequests.length > 0 
      ? Math.round((onTimeDeliveries.length / completedRequests.length) * 100) 
      : 0;

    const avgRevisionsPerJob = revizeler.length > 0 
      ? (revizeler.length / requests.length).toFixed(1) 
      : '0';

    // İlk kabulde tamamlananlar (hiç revize olmadan tamamlanan işler)
    const firstAcceptanceRate = completedRequests.length > 0
      ? Math.round(
          completedRequests.filter(r => !r.revizeCount || r.revizeCount === 0).length /
          completedRequests.length * 100
        )
      : 0;

    const avgTurnaroundHours = completedRequests.length > 0
      ? Math.round(completedRequests.reduce((acc, r) => {
          if (!r.completedAt) return acc;
          const created = new Date(r.createdAt);
          const completed = new Date(r.completedAt);
          return acc + (completed.getTime() - created.getTime()) / (1000 * 60 * 60);
        }, 0) / completedRequests.length)
      : 0;

    return {
      onTimeRate,
      avgRevisionsPerJob,
      firstAcceptanceRate,
      avgTurnaroundHours,
      totalRequests: requests.length,
    };
  };

  const kpis = calculateKPIs();

  // Revize Source Distribution
  const revizeBySource = revizeler.reduce((acc, rev) => {
    acc[rev.source] = (acc[rev.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalRevizes = revizeler.length;

  // Department Stats
  const deptStats = requests.reduce((acc, req) => {
    acc[req.department] = (acc[req.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxDeptCount = Math.max(...Object.values(deptStats), 1);

  // Employee Performance
  const employeeStats = tasks.reduce((acc, task) => {
    if (!acc[task.assignedTo]) {
      acc[task.assignedTo] = {
        name: task.assignedToName,
        completed: 0,
        onTime: 0,
        delayed: 0,
        revisions: 0,
      };
    }
    
    if (task.status === 'CMP') {
      acc[task.assignedTo].completed++;
      if (task.completedAt && task.completedAt <= task.dueDate + 'T23:59:59') {
        acc[task.assignedTo].onTime++;
      } else {
        acc[task.assignedTo].delayed++;
      }
    }
    
    return acc;
  }, {} as Record<string, { name: string; completed: number; onTime: number; delayed: number; revisions: number }>);

  // Add revision counts
  revizeler.forEach(rev => {
    const task = tasks.find(t => t.id === rev.taskId);
    if (task && employeeStats[task.assignedTo]) {
      employeeStats[task.assignedTo].revisions++;
    }
  });

  const employeeList = Object.values(employeeStats)
    .filter(e => e.completed > 0)
    .sort((a, b) => b.completed - a.completed);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">📈 Raporlar</h1>
        <div className="flex items-center gap-3">
          <Select defaultValue="nisan2026">
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nisan2026">Nisan 2026</SelectItem>
              <SelectItem value="mart2026">Mart 2026</SelectItem>
              <SelectItem value="subat2026">Şubat 2026</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Tesis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="otel1">Otel 1</SelectItem>
              <SelectItem value="otel2">Otel 2</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => {
            toast.info('Rapor indiriliyor...', { description: 'Veriler tarayıcıya aktarılıyor.', duration: 2000 });
            setTimeout(() => window.print(), 500);
          }}>
            <Download className="w-4 h-4 mr-2" />
            Raporu İndir
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600">%{kpis.onTimeRate}</div>
            <div className="text-sm text-slate-600 mt-1">Zamanında Teslim</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{kpis.avgRevisionsPerJob}</div>
            <div className="text-sm text-slate-600 mt-1">Ort. Revize/İş</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">%{kpis.firstAcceptanceRate}</div>
            <div className="text-sm text-slate-600 mt-1">İlk Kabul Oranı</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">{kpis.avgTurnaroundHours} saat</div>
            <div className="text-sm text-slate-600 mt-1">Ort. Çevrim Süresi</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600">{kpis.totalRequests}</div>
            <div className="text-sm text-slate-600 mt-1">Talep Bu Ay</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Revize Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              REVİZE KAYNAK DAĞILIMI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(revizeBySource).map(([source, count]) => {
                const percentage = Math.round((count / totalRevizes) * 100);
                return (
                  <div key={source} className="flex items-center gap-3">
                    <span className="text-sm w-32">{getRevizeSourceLabel(source)}</span>
                    <div className="flex-1">
                      <div 
                        className="h-4 bg-orange-500 rounded"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-500 w-12">{percentage}%</span>
                  </div>
                );
              })}
              {totalRevizes === 0 && (
                <div className="text-center py-4 text-slate-500">Revize bulunmuyor</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Department Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              DEPARTMAN TALEPLERİ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(deptStats).sort((a, b) => b[1] - a[1]).map(([dept, count]) => (
                <div key={dept} className="flex items-center gap-3">
                  <span className="text-sm w-24">{dept}</span>
                  <div className="flex-1">
                    <div 
                      className="h-4 bg-indigo-500 rounded"
                      style={{ width: `${(count / maxDeptCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-500 w-8">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            ÇALIŞAN PERFORMANS TABLOSU — {new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4 text-sm font-medium text-slate-500">Kişi</th>
                  <th className="text-center py-2 px-4 text-sm font-medium text-slate-500">Tamam</th>
                  <th className="text-center py-2 px-4 text-sm font-medium text-slate-500">Zam.Teslim</th>
                  <th className="text-center py-2 px-4 text-sm font-medium text-slate-500">Gecik</th>
                  <th className="text-center py-2 px-4 text-sm font-medium text-slate-500">Rev./İş</th>
                  <th className="text-center py-2 px-4 text-sm font-medium text-slate-500">%Zam</th>
                </tr>
              </thead>
              <tbody>
                {employeeList.map((emp) => {
                  const onTimeRate = emp.completed > 0 
                    ? Math.round((emp.onTime / emp.completed) * 100) 
                    : 0;
                  const avgRevisions = emp.completed > 0 
                    ? (emp.revisions / emp.completed).toFixed(1) 
                    : '0';

                  return (
                    <tr key={emp.name} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">{emp.name}</td>
                      <td className="text-center py-3 px-4">{emp.completed}</td>
                      <td className="text-center py-3 px-4">{emp.onTime}</td>
                      <td className="text-center py-3 px-4">{emp.delayed}</td>
                      <td className="text-center py-3 px-4">{avgRevisions}</td>
                      <td className="text-center py-3 px-4">
                        <Badge className={onTimeRate >= 90 ? 'bg-green-500' : onTimeRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}>
                          %{onTimeRate}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
                {employeeList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      Performans verisi bulunmuyor
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Report Links */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-green-600" />
            <div>
              <div className="font-medium">Haftalık Açık İşler Raporu</div>
              <div className="text-sm text-slate-500">Google Sheets</div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <div className="font-medium">Dept. Talep Hacmi Raporu</div>
              <div className="text-sm text-slate-500">Google Sheets</div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div>
              <div className="font-medium">Çalışan Performans Raporu</div>
              <div className="text-sm text-slate-500">Google Sheets</div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <RotateCcw className="w-8 h-8 text-orange-600" />
            <div>
              <div className="font-medium">Revize Neden Analiz Raporu</div>
              <div className="text-sm text-slate-500">Google Sheets</div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-8 h-8 text-red-600" />
            <div>
              <div className="font-medium">SLA Uyum Raporu</div>
              <div className="text-sm text-slate-500">Google Sheets</div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-indigo-600" />
            <div>
              <div className="font-medium">Aylık Üretim Özeti</div>
              <div className="text-sm text-slate-500">Google Sheets</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
