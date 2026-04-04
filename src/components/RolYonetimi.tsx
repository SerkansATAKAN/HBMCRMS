import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Shield, 
  Plus, 
  Edit2, 
  Search,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Layers
} from 'lucide-react';
import type { RoleConfig, UserRole } from '@/types';

const ALL_PERMISSIONS = [
  { id: 'talep_olustur', label: 'Talep Oluştur', category: 'Talep' },
  { id: 'talep_goruntule', label: 'Talep Görüntüle', category: 'Talep' },
  { id: 'talep_duzenle', label: 'Talep Düzenle', category: 'Talep' },
  { id: 'talep_sil', label: 'Talep Sil', category: 'Talep' },
  { id: 'gorev_atama', label: 'Görev Atama', category: 'Görev' },
  { id: 'gorev_goruntule', label: 'Görev Görüntüle', category: 'Görev' },
  { id: 'gorev_tamamla', label: 'Görev Tamamla', category: 'Görev' },
  { id: 'onay_verme', label: 'Onay Verme', category: 'Onay' },
  { id: 'onay_bekleyen', label: 'Onay Bekleyenleri Gör', category: 'Onay' },
  { id: 'revize_yonetimi', label: 'Revize Yönetimi', category: 'Revize' },
  { id: 'rapor_goruntule', label: 'Rapor Görüntüle', category: 'Rapor' },
  { id: 'rapor_olustur', label: 'Rapor Oluştur', category: 'Rapor' },
  { id: 'kullanici_yonetimi', label: 'Kullanıcı Yönetimi', category: 'Yönetim' },
  { id: 'departman_yonetimi', label: 'Departman Yönetimi', category: 'Yönetim' },
  { id: 'rol_yonetimi', label: 'Rol Yönetimi', category: 'Yönetim' },
  { id: 'ayarlar', label: 'Ayarlar', category: 'Yönetim' },
];

const ROLE_NAMES: Record<UserRole, string> = {
  talep_sahibi: 'Talep Sahibi',
  uygulayici: 'Uygulayıcı',
  koordinator: 'Koordinatör',
  yonetici: 'Yönetici',
  gm: 'Genel Müdür',
  admin: 'Sistem Yöneticisi',
};

export function RolYonetimi() {
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleConfig | null>(null);

  const [formData, setFormData] = useState({
    code: '' as UserRole,
    name: '',
    description: '',
    permissions: [] as string[],
    level: 5,
    isActive: true,
  });

  // Mock veri - gerçek uygulamada Google Sheets'ten çekilecek
  useEffect(() => {
    setRoles([
      { 
        id: 'r1', 
        code: 'talep_sahibi', 
        name: 'Talep Sahibi', 
        description: 'Departman taleplerini oluşturabilir', 
        permissions: ['talep_olustur', 'talep_goruntule', 'talep_duzenle'],
        level: 1,
        isActive: true, 
        createdAt: '', 
        updatedAt: '' 
      },
      { 
        id: 'r2', 
        code: 'uygulayici', 
        name: 'Uygulayıcı', 
        description: 'Atanan görevleri yerine getirir', 
        permissions: ['gorev_goruntule', 'gorev_tamamla', 'talep_goruntule'],
        level: 2,
        isActive: true, 
        createdAt: '', 
        updatedAt: '' 
      },
      { 
        id: 'r3', 
        code: 'koordinator', 
        name: 'Koordinatör', 
        description: 'Talepleri yönetir ve görev atar', 
        permissions: ['talep_goruntule', 'talep_duzenle', 'gorev_atama', 'gorev_goruntule', 'revize_yonetimi', 'rapor_goruntule'],
        level: 4,
        isActive: true, 
        createdAt: '', 
        updatedAt: '' 
      },
      { 
        id: 'r4', 
        code: 'yonetici', 
        name: 'Yönetici', 
        description: 'Departman yöneticisi', 
        permissions: ['talep_goruntule', 'talep_duzenle', 'gorev_atama', 'gorev_goruntule', 'onay_verme', 'onay_bekleyen', 'revize_yonetimi', 'rapor_goruntule', 'rapor_olustur'],
        level: 6,
        isActive: true, 
        createdAt: '', 
        updatedAt: '' 
      },
      { 
        id: 'r5', 
        code: 'gm', 
        name: 'Genel Müdür', 
        description: 'Tüm sistem yetkileri', 
        permissions: ALL_PERMISSIONS.map(p => p.id),
        level: 9,
        isActive: true, 
        createdAt: '', 
        updatedAt: '' 
      },
      { 
        id: 'r6', 
        code: 'admin', 
        name: 'Sistem Yöneticisi', 
        description: 'Tam yetki', 
        permissions: ALL_PERMISSIONS.map(p => p.id),
        level: 10,
        isActive: true, 
        createdAt: '', 
        updatedAt: '' 
      },
    ]);
  }, []);

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!formData.code.trim() || !formData.name.trim()) return;

    const now = new Date().toISOString();

    if (editingRole) {
      setRoles(prev => prev.map(r => 
        r.id === editingRole.id 
          ? { ...r, ...formData, updatedAt: now }
          : r
      ));
    } else {
      const newRole: RoleConfig = {
        id: `r${Date.now()}`,
        ...formData,
        createdAt: now,
        updatedAt: now,
      };
      setRoles(prev => [...prev, newRole]);
    }

    setShowDialog(false);
    setEditingRole(null);
    setFormData({ code: '' as UserRole, name: '', description: '', permissions: [], level: 5, isActive: true });
  };

  const handleEdit = (role: RoleConfig) => {
    setEditingRole(role);
    setFormData({
      code: role.code,
      name: role.name,
      description: role.description || '',
      permissions: role.permissions,
      level: role.level,
      isActive: role.isActive,
    });
    setShowDialog(true);
  };

  const handleToggleActive = (roleId: string) => {
    setRoles(prev => prev.map(r => 
      r.id === roleId ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const togglePermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Talep': 'bg-blue-500/20 text-blue-500',
      'Görev': 'bg-green-500/20 text-green-500',
      'Onay': 'bg-purple-500/20 text-purple-500',
      'Revize': 'bg-orange-500/20 text-orange-500',
      'Rapor': 'bg-cyan-500/20 text-cyan-500',
      'Yönetim': 'bg-red-500/20 text-red-500',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  const groupedPermissions = ALL_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof ALL_PERMISSIONS>);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="page-title flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Rol Yönetimi
        </h1>
        <Button onClick={() => {
          setEditingRole(null);
          setFormData({ code: '' as UserRole, name: '', description: '', permissions: [], level: 5, isActive: true });
          setShowDialog(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Rol
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-primary">{roles.length}</div>
            <div className="small-text mt-1">Toplam Rol</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-green-500">{roles.filter(r => r.isActive).length}</div>
            <div className="small-text mt-1">Aktif</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-muted-foreground">{roles.filter(r => !r.isActive).length}</div>
            <div className="small-text mt-1">Pasif</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-blue-500">{ALL_PERMISSIONS.length}</div>
            <div className="small-text mt-1">Toplam İzin</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rol ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 form-input"
        />
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRoles.map((role) => (
          <Card key={role.id} className={`border-border/50 ${!role.isActive ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Role Info */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium">{role.name}</h3>
                      <Badge variant={role.isActive ? 'default' : 'secondary'} className="text-xs">
                        {role.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{role.description || 'Açıklama yok'}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        Seviye: {role.level}
                      </span>
                      <span className="flex items-center gap-1">
                        {role.permissions.length > 0 ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {role.permissions.length} İzin
                      </span>
                    </div>
                  </div>
                </div>

                {/* Permissions Preview */}
                <div className="flex flex-wrap gap-1 sm:max-w-[300px]">
                  {role.permissions.slice(0, 5).map((permId) => {
                    const perm = ALL_PERMISSIONS.find(p => p.id === permId);
                    if (!perm) return null;
                    return (
                      <Badge key={permId} variant="outline" className={`text-xs ${getCategoryColor(perm.category)}`}>
                        {perm.label}
                      </Badge>
                    );
                  })}
                  {role.permissions.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 5}
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 sm:flex-col sm:items-end">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(role)}>
                    <Edit2 className="w-4 h-4 mr-1" />
                    Düzenle
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleToggleActive(role.id)}>
                    {role.isActive ? <XCircle className="w-4 h-4 mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                    {role.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {editingRole ? 'Rol Düzenle' : 'Yeni Rol'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="form-label">Rol Kodu *</Label>
                <select
                  value={formData.code}
                  onChange={(e) => {
                    const code = e.target.value as UserRole;
                    setFormData({ 
                      ...formData, 
                      code,
                      name: ROLE_NAMES[code] || formData.name
                    });
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-border/50 bg-background text-sm"
                  disabled={!!editingRole}
                >
                  <option value="">Seçiniz</option>
                  {Object.entries(ROLE_NAMES).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="form-label">Rol Adı *</Label>
                <Input
                  placeholder="Rol adı"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
            <div>
              <Label className="form-label">Açıklama</Label>
              <Textarea
                placeholder="Rol açıklaması"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-input min-h-[80px]"
              />
            </div>
            <div>
              <Label className="form-label">Hiyerarşik Seviye (1-10)</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 5 })}
                className="form-input"
              />
            </div>

            {/* Permissions */}
            <div>
              <Label className="form-label mb-3">İzinler</Label>
              <div className="space-y-4 max-h-[300px] overflow-y-auto p-3 border border-border/50 rounded-lg">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Badge className={`text-xs ${getCategoryColor(category)}`}>{category}</Badge>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {perms.map((perm) => (
                        <label key={perm.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
                {editingRole ? 'Güncelle' : 'Ekle'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
