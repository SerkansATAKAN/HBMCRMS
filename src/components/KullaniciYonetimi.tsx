import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  CheckCircle2,
  XCircle,
  Phone,
  Briefcase,
  UserCircle,
  ImagePlus,
  Star,
  Award,
  Mail,
  Send
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import type { ExtendedUser, UserRole, Department } from '@/types';

const DEPARTMENTS: Department[] = ['F&B', 'Events', 'Sales', 'Spa', 'HR', 'Wedding', 'Entertainment', 'Pazarlama', 'Yönetim'];

const ROLES: { code: UserRole; label: string }[] = [
  { code: 'talep_sahibi', label: 'Talep Sahibi' },
  { code: 'uygulayici', label: 'Uygulayıcı' },
  { code: 'koordinator', label: 'Koordinatör' },
  { code: 'yonetici', label: 'Yönetici' },
  { code: 'gm', label: 'Genel Müdür' },
  { code: 'admin', label: 'Sistem Yöneticisi' },
];

const WORK_TYPES = [
  { id: 'wt1', name: 'Afiş Tasarımı' },
  { id: 'wt2', name: 'Sosyal Medya' },
  { id: 'wt3', name: 'Video Edit' },
  { id: 'wt4', name: 'Broşür' },
  { id: 'wt5', name: 'Menü' },
  { id: 'wt6', name: 'Sunum' },
  { id: 'wt7', name: 'Story' },
  { id: 'wt8', name: 'Bülten' },
  { id: 'wt9', name: 'Fotoğraf' },
];

const PROFICIENCY_LEVELS = [
  { value: 'baslangic', label: 'Başlangıç', color: 'bg-yellow-500/20 text-yellow-500' },
  { value: 'orta', label: 'Orta', color: 'bg-blue-500/20 text-blue-500' },
  { value: 'ileri', label: 'İleri', color: 'bg-purple-500/20 text-purple-500' },
  { value: 'uzman', label: 'Uzman', color: 'bg-green-500/20 text-green-500' },
];

// Avatar renkleri (isim baş harfine göre)
const AVATAR_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500',
];

function getAvatarColor(name: string): string {
  const charCode = name.charCodeAt(0);
  return AVATAR_COLORS[charCode % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function KullaniciYonetimi() {
  const { users: storeUsers, updateUsers, currentUser } = useStore();
  const { session } = useAuth();
  const [users, setUsersLocal] = useState<ExtendedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'worktypes'>('info');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isAdminOrGm = currentUser?.role === 'admin' || currentUser?.role === 'gm';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'uygulayici' as UserRole,
    department: 'Pazarlama' as Department,
    title: '',
    bio: '',
    avatarUrl: '',
    maxConcurrentTasks: 5,
    isActive: true,
    workTypeMappings: [] as { workTypeId: string; proficiency: 'baslangic' | 'orta' | 'ileri' | 'uzman'; isPrimary: boolean }[],
  });

  // Store'dan kullanıcıları bir kez yükle
  useEffect(() => {
    const now = new Date().toISOString();
    const extended: ExtendedUser[] = storeUsers.map(u => ({
      ...u,
      phone: (u as ExtendedUser).phone || '',
      title: (u as ExtendedUser).title || '',
      bio: (u as ExtendedUser).bio || '',
      avatarUrl: (u as ExtendedUser).avatarUrl || '',
      maxConcurrentTasks: (u as ExtendedUser).maxConcurrentTasks || 5,
      workTypeMappings: (u as unknown as { workTypeMappings?: unknown[] }).workTypeMappings || [],
      createdAt: (u as ExtendedUser).createdAt || now,
      updatedAt: (u as ExtendedUser).updatedAt || now,
    }));
    setUsersLocal(extended);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Yerel değişiklikleri store ile senkronize et
  const syncToStore = (updatedUsers: ExtendedUser[]) => {
    setUsersLocal(updatedUsers);
    updateUsers(updatedUsers);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) return;
    if (!isAdminOrGm) { toast.error('Bu işlem için yetkiniz yok'); return; }

    setSaving(true);
    const now = new Date().toISOString();

    try {
      if (editingUser) {
        // Mevcut kullanıcıyı Supabase'de güncelle
        const { error } = await supabase.from('users').update({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          phone: formData.phone || null,
          title: formData.title || null,
          is_active: formData.isActive,
        }).eq('id', editingUser.id);

        if (error) throw error;

        const updated = users.map(u =>
          u.id === editingUser.id ? { ...u, ...formData, updatedAt: now } : u
        );
        syncToStore(updated);
        toast.success('Kullanıcı güncellendi');
      } else {
        // Yeni kullanıcı → invite-user Edge Function
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        const token = currentSession?.access_token ?? session?.access_token;
        if (!token) throw new Error('Oturum bulunamadı');

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              email: formData.email,
              name: formData.name,
              role: formData.role,
              department: formData.department,
              title: formData.title || undefined,
              phone: formData.phone || undefined,
            }),
          }
        );

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Hata oluştu');

        // Yerel listeye ekle (Supabase'deki kayıt Edge Function tarafından oluşturuldu)
        const newUser: ExtendedUser = {
          id: `u${Date.now()}`,
          ...formData,
          createdAt: now,
          updatedAt: now,
        };
        syncToStore([...users, newUser]);
        toast.success(`${formData.email} adresine davet e-postası gönderildi`);
      }

      setShowDialog(false);
      setEditingUser(null);
      resetForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'uygulayici',
      department: 'Pazarlama',
      title: '',
      bio: '',
      avatarUrl: '',
      maxConcurrentTasks: 5,
      isActive: true,
      workTypeMappings: [],
    });
  };

  const handleEdit = (user: ExtendedUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      department: user.department,
      title: user.title || '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || '',
      maxConcurrentTasks: user.maxConcurrentTasks || 5,
      isActive: user.isActive,
      workTypeMappings: (user as unknown as { workTypeMappings?: typeof formData.workTypeMappings }).workTypeMappings || [],
    });
    setActiveTab('info');
    setShowDialog(true);
  };

  const handleDelete = async (userId: string) => {
    if (!isAdminOrGm) return;
    const { error } = await supabase.from('users').update({ is_active: false }).eq('id', userId);
    if (error) { toast.error('Silinemedi'); return; }
    syncToStore(users.filter(u => u.id !== userId));
    setConfirmDeleteId(null);
    toast.success('Kullanıcı kaldırıldı');
  };

  const handleToggleActive = async (userId: string) => {
    if (!isAdminOrGm) return;
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const newActive = !user.isActive;
    const { error } = await supabase.from('users').update({ is_active: newActive }).eq('id', userId);
    if (error) { toast.error('Güncellenemedi'); return; }
    syncToStore(users.map(u => u.id === userId ? { ...u, isActive: newActive } : u));
  };

  const getRoleLabel = (role: UserRole) => {
    return ROLES.find(r => r.code === role)?.label || role;
  };

  const getRoleColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      'talep_sahibi': 'bg-blue-500/20 text-blue-500',
      'uygulayici': 'bg-green-500/20 text-green-500',
      'koordinator': 'bg-purple-500/20 text-purple-500',
      'yonetici': 'bg-orange-500/20 text-orange-500',
      'gm': 'bg-red-500/20 text-red-500',
      'admin': 'bg-pink-500/20 text-pink-500',
    };
    return colors[role] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="page-title flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Kullanıcı Yönetimi
        </h1>
        <Button onClick={() => {
          setEditingUser(null);
          setFormData({
            name: '',
            email: '',
            phone: '',
            role: 'uygulayici',
            department: 'Pazarlama',
            title: '',
            bio: '',
            avatarUrl: '',
            maxConcurrentTasks: 5,
            isActive: true,
            workTypeMappings: [],
          });
          setShowDialog(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni Kullanıcı
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-primary">{users.length}</div>
            <div className="small-text mt-1">Toplam</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-green-500">{users.filter(u => u.isActive).length}</div>
            <div className="small-text mt-1">Aktif</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-muted-foreground">{users.filter(u => !u.isActive).length}</div>
            <div className="small-text mt-1">Pasif</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-blue-500">{users.filter(u => u.role === 'uygulayici').length}</div>
            <div className="small-text mt-1">Uygulayıcı</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Kullanıcı ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 form-input"
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className={`border-border/50 ${!user.isActive ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${getAvatarColor(user.name)}`}>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium truncate">{user.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{user.title || 'Unvan belirtilmemiş'}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {user.department}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-3 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Briefcase className="w-3 h-3" />
                  Max {user.maxConcurrentTasks || 5} görev
                </span>
                {user.workTypes && user.workTypes.length > 0 && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Award className="w-3 h-3" />
                    {user.workTypes.length} uzmanlık
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                  <Edit2 className="w-4 h-4 mr-1" />
                  Düzenle
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleToggleActive(user.id)}>
                  {user.isActive ? <XCircle className="w-4 h-4 mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                  {user.isActive ? 'Pasif' : 'Aktif'}
                </Button>
                {confirmDeleteId === user.id ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-red-600 font-medium">Emin misiniz?</span>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(user.id)}>Evet</Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)}>Hayır</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="destructive" onClick={() => setConfirmDeleteId(user.id)}>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCircle className="w-5 h-5" />
              {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant={activeTab === 'info' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('info')}
            >
              <UserCircle className="w-4 h-4 mr-1" />
              Bilgiler
            </Button>
            <Button
              type="button"
              variant={activeTab === 'worktypes' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('worktypes')}
            >
              <Award className="w-4 h-4 mr-1" />
              Uzmanlıklar
            </Button>
          </div>

          {activeTab === 'info' ? (
            <div className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl ${getAvatarColor(formData.name || 'A')}`}>
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getInitials(formData.name || '?')
                  )}
                </div>
                <div className="flex-1">
                  <Label className="form-label">Avatar URL</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://..."
                      value={formData.avatarUrl}
                      onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                      className="form-input"
                    />
                    <Button type="button" variant="outline" size="icon">
                      <ImagePlus className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Boş bırakılırsa baş harfler kullanılır</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="form-label">Ad Soyad *</Label>
                  <Input
                    placeholder="Ad Soyad"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <Label className="form-label">E-posta *</Label>
                  <Input
                    type="email"
                    placeholder="email@hotel.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="form-label">Telefon</Label>
                  <Input
                    placeholder="+90 5XX XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <Label className="form-label">Unvan</Label>
                  <Input
                    placeholder="Unvan"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="form-label">Rol</Label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full h-10 px-3 rounded-lg border border-border/50 bg-background text-sm"
                  >
                    {ROLES.map(r => (
                      <option key={r.code} value={r.code}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="form-label">Departman</Label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                    className="w-full h-10 px-3 rounded-lg border border-border/50 bg-background text-sm"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="form-label">Biyografi</Label>
                <Textarea
                  placeholder="Kısa biyografi..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="form-input min-h-[80px]"
                />
              </div>

              <div>
                <Label className="form-label">Max Eşzamanlı Görev</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={formData.maxConcurrentTasks}
                  onChange={(e) => setFormData({ ...formData, maxConcurrentTasks: parseInt(e.target.value) || 5 })}
                  className="form-input"
                />
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
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Kullanıcının uzman olduğu iş türlerini ve yetkinlik seviyelerini belirleyin.
              </p>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto p-3 border border-border/50 rounded-lg">
                {WORK_TYPES.map((wt) => {
                  const mapping = formData.workTypeMappings.find(m => m.workTypeId === wt.id);
                  return (
                    <div key={wt.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <span className="font-medium">{wt.name}</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={mapping?.proficiency || ''}
                          onChange={(e) => {
                            const proficiency = e.target.value as any;
                            if (proficiency) {
                              setFormData(prev => ({
                                ...prev,
                                workTypeMappings: prev.workTypeMappings.some(m => m.workTypeId === wt.id)
                                  ? prev.workTypeMappings.map(m => m.workTypeId === wt.id ? { ...m, proficiency } : m)
                                  : [...prev.workTypeMappings, { workTypeId: wt.id, proficiency, isPrimary: false }]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                workTypeMappings: prev.workTypeMappings.filter(m => m.workTypeId !== wt.id)
                              }));
                            }
                          }}
                          className="h-8 px-2 rounded border border-border/50 bg-background text-sm"
                        >
                          <option value="">Seçilmedi</option>
                          {PROFICIENCY_LEVELS.map(p => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                        {mapping && (
                          <Button
                            type="button"
                            variant={mapping.isPrimary ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                workTypeMappings: prev.workTypeMappings.map(m => 
                                  m.workTypeId === wt.id ? { ...m, isPrimary: !m.isPrimary } : m
                                )
                              }));
                            }}
                            className="h-8 px-2"
                          >
                            <Star className={`w-4 h-4 ${mapping.isPrimary ? 'fill-current' : ''}`} />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
            <Button variant="outline" onClick={() => setShowDialog(false)}>İptal</Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.name.trim() || !formData.email.trim()}
            >
              {saving ? (
                <><Send className="w-4 h-4 mr-2 animate-pulse" />{editingUser ? 'Güncelleniyor...' : 'Davet Gönderiliyor...'}</>
              ) : (
                editingUser ? 'Güncelle' : 'Davet Gönder'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
