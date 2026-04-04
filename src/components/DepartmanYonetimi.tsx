import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  CheckCircle2,
  XCircle,
  User
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import type { DepartmentConfig } from '@/types';

export function DepartmanYonetimi() {
  const { users } = useStore();
  const [departments, setDepartments] = useState<DepartmentConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentConfig | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    managerId: '',
    isActive: true,
  });

  // Mock veri - gerçek uygulamada Google Sheets'ten çekilecek
  useEffect(() => {
    setDepartments([
      { id: 'd1', code: 'FB', name: 'F&B', description: 'Yiyecek ve İçecek', managerId: 'u7', managerName: 'Kemal Aydın', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'd2', code: 'EVT', name: 'Events', description: 'Etkinlik Yönetimi', managerId: '', managerName: '', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'd3', code: 'SAL', name: 'Sales', description: 'Satış Departmanı', managerId: '', managerName: '', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'd4', code: 'SPA', name: 'Spa', description: 'Spa Merkezi', managerId: '', managerName: '', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'd5', code: 'HR', name: 'HR', description: 'İnsan Kaynakları', managerId: '', managerName: '', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'd6', code: 'WED', name: 'Wedding', description: 'Düğün Organizasyonu', managerId: '', managerName: '', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'd7', code: 'ENT', name: 'Entertainment', description: 'Eğlence', managerId: '', managerName: '', isActive: true, createdAt: '', updatedAt: '' },
      { id: 'd8', code: 'MKT', name: 'Pazarlama', description: 'Pazarlama Departmanı', managerId: 'u1', managerName: 'Atakan ŞENKAYA', isActive: true, createdAt: '', updatedAt: '' },
    ]);
  }, []);

  const filteredDepts = departments.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeManagers = users.filter(u => u.isActive && ['yonetici', 'koordinator', 'gm'].includes(u.role));

  const handleSave = () => {
    if (!formData.code.trim() || !formData.name.trim()) return;

    const manager = activeManagers.find(u => u.id === formData.managerId);
    const now = new Date().toISOString();

    if (editingDept) {
      setDepartments(prev => prev.map(d => 
        d.id === editingDept.id 
          ? { ...d, ...formData, managerName: manager?.name, updatedAt: now }
          : d
      ));
    } else {
      const newDept: DepartmentConfig = {
        id: `d${Date.now()}`,
        ...formData,
        managerName: manager?.name,
        createdAt: now,
        updatedAt: now,
      };
      setDepartments(prev => [...prev, newDept]);
    }

    setShowDialog(false);
    setEditingDept(null);
    setFormData({ code: '', name: '', description: '', managerId: '', isActive: true });
  };

  const handleEdit = (dept: DepartmentConfig) => {
    setEditingDept(dept);
    setFormData({
      code: dept.code,
      name: dept.name,
      description: dept.description || '',
      managerId: dept.managerId || '',
      isActive: dept.isActive,
    });
    setShowDialog(true);
  };

  const handleDelete = (deptId: string) => {
    setDepartments(prev => prev.filter(d => d.id !== deptId));
    setConfirmDeleteId(null);
  };

  const handleToggleActive = (deptId: string) => {
    setDepartments(prev => prev.map(d => 
      d.id === deptId ? { ...d, isActive: !d.isActive } : d
    ));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="page-title flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          Departman Yönetimi
        </h1>
        <Button onClick={() => {
          setEditingDept(null);
          setFormData({ code: '', name: '', description: '', managerId: '', isActive: true });
          setShowDialog(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Departman
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-primary">{departments.length}</div>
            <div className="small-text mt-1">Toplam</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-green-500">{departments.filter(d => d.isActive).length}</div>
            <div className="small-text mt-1">Aktif</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-muted-foreground">{departments.filter(d => !d.isActive).length}</div>
            <div className="small-text mt-1">Pasif</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-blue-500">{departments.filter(d => d.managerId).length}</div>
            <div className="small-text mt-1">Müdürlüklü</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Departman ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 form-input"
        />
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepts.map((dept) => (
          <Card key={dept.id} className={`border-border/50 ${!dept.isActive ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{dept.code}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{dept.name}</h3>
                    <p className="text-xs text-muted-foreground">{dept.description || 'Açıklama yok'}</p>
                  </div>
                </div>
                <Badge variant={dept.isActive ? 'default' : 'secondary'}>
                  {dept.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>

              {dept.managerName && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Müdür:</span>
                  <span>{dept.managerName}</span>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(dept)}>
                  <Edit2 className="w-4 h-4 mr-1" />
                  Düzenle
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleToggleActive(dept.id)}>
                  {dept.isActive ? <XCircle className="w-4 h-4 mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                  {dept.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                </Button>
                {confirmDeleteId === dept.id ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-red-600 font-medium">Emin misiniz?</span>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(dept.id)}>Evet</Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)}>Hayır</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="destructive" onClick={() => setConfirmDeleteId(dept.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              {editingDept ? 'Departman Düzenle' : 'Yeni Departman'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="form-label">Departman Kodu *</Label>
              <Input
                placeholder="Örn: FB, HR, MKT"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="form-input"
              />
            </div>
            <div>
              <Label className="form-label">Departman Adı *</Label>
              <Input
                placeholder="Departman adı"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <Label className="form-label">Açıklama</Label>
              <Textarea
                placeholder="Departman açıklaması"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-input min-h-[80px]"
              />
            </div>
            <div>
              <Label className="form-label">Departman Müdürü</Label>
              <select
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border/50 bg-background text-sm"
              >
                <option value="">Seçiniz</option>
                {activeManagers.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="isActive" className="text-sm cursor-pointer">Aktif</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>İptal</Button>
              <Button onClick={handleSave} disabled={!formData.code.trim() || !formData.name.trim()}>
                {editingDept ? 'Güncelle' : 'Ekle'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
