import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Briefcase, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ListTodo,
  Palette,
  Video,
  FileText,
  Image,
  Layout,
  Megaphone
} from 'lucide-react';
import type { WorkTypeConfig } from '@/types';

const CATEGORIES = [
  { id: 'Tasarım', label: 'Tasarım', icon: Palette },
  { id: 'Video', label: 'Video', icon: Video },
  { id: 'Metin', label: 'Metin', icon: FileText },
  { id: 'Fotoğraf', label: 'Fotoğraf', icon: Image },
  { id: 'Sosyal Medya', label: 'Sosyal Medya', icon: Megaphone },
  { id: 'Diğer', label: 'Diğer', icon: Layout },
];

const DEFAULT_CHECKLISTS: Record<string, string[]> = {
  'Tasarım': ['Brief kontrolü', 'Taslak oluşturma', 'İç kontrol', 'Revizeler', 'Final onay', 'Export'],
  'Video': ['Senaryo onayı', 'Çekim planı', 'Video çekimi', 'Edit', 'Renk düzenleme', 'Ses düzenleme', 'Final'],
  'Metin': ['Konu araştırması', 'Taslak yazım', 'Edit', 'SEO kontrolü', 'Final onay'],
  'Fotoğraf': ['Çekim planı', 'Mekan hazırlığı', 'Fotoğraf çekimi', 'Seçim', 'Retouch', 'Final'],
  'Sosyal Medya': ['İçerik planı', 'Tasarım', 'Yazı', 'Onay', 'Paylaşım', 'Raporlama'],
  'Diğer': ['Analiz', 'Planlama', 'Uygulama', 'Kontrol'],
};

export function IsTuruYonetimi() {
  const [workTypes, setWorkTypes] = useState<WorkTypeConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingWorkType, setEditingWorkType] = useState<WorkTypeConfig | null>(null);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    category: 'Tasarım',
    estimatedHours: 4,
    defaultChecklist: [] as string[],
    isActive: true,
  });

  // Mock veri - gerçek uygulamada Google Sheets'ten çekilecek
  useEffect(() => {
    setWorkTypes([
      { id: 'w1', code: 'AFS', name: 'Afiş Tasarımı', description: 'Promosyon afişleri', category: 'Tasarım', estimatedHours: 4, defaultChecklist: DEFAULT_CHECKLISTS['Tasarım'], isActive: true, createdAt: '', updatedAt: '' },
      { id: 'w2', code: 'SM', name: 'Sosyal Medya', description: 'Sosyal medya gönderileri', category: 'Sosyal Medya', estimatedHours: 2, defaultChecklist: DEFAULT_CHECKLISTS['Sosyal Medya'], isActive: true, createdAt: '', updatedAt: '' },
      { id: 'w3', code: 'VID', name: 'Video Edit', description: 'Video düzenleme', category: 'Video', estimatedHours: 8, defaultChecklist: DEFAULT_CHECKLISTS['Video'], isActive: true, createdAt: '', updatedAt: '' },
      { id: 'w4', code: 'BRO', name: 'Broşür', description: 'Broşür tasarımı', category: 'Tasarım', estimatedHours: 6, defaultChecklist: DEFAULT_CHECKLISTS['Tasarım'], isActive: true, createdAt: '', updatedAt: '' },
      { id: 'w5', code: 'MNU', name: 'Menü', description: 'Menü tasarımı', category: 'Tasarım', estimatedHours: 5, defaultChecklist: DEFAULT_CHECKLISTS['Tasarım'], isActive: true, createdAt: '', updatedAt: '' },
      { id: 'w6', code: 'SUN', name: 'Sunum', description: 'Sunum hazırlama', category: 'Diğer', estimatedHours: 3, defaultChecklist: DEFAULT_CHECKLISTS['Diğer'], isActive: true, createdAt: '', updatedAt: '' },
      { id: 'w7', code: 'STR', name: 'Story', description: 'Story tasarımı', category: 'Sosyal Medya', estimatedHours: 1, defaultChecklist: DEFAULT_CHECKLISTS['Sosyal Medya'], isActive: true, createdAt: '', updatedAt: '' },
      { id: 'w8', code: 'BUL', name: 'Bülten', description: 'E-bülten tasarımı', category: 'Tasarım', estimatedHours: 3, defaultChecklist: DEFAULT_CHECKLISTS['Tasarım'], isActive: true, createdAt: '', updatedAt: '' },
      { id: 'w9', code: 'FOTO', name: 'Fotoğraf', description: 'Fotoğraf çekimi', category: 'Fotoğraf', estimatedHours: 4, defaultChecklist: DEFAULT_CHECKLISTS['Fotoğraf'], isActive: true, createdAt: '', updatedAt: '' },
      { id: 'w10', code: 'DIG', name: 'Diğer', description: 'Diğer işler', category: 'Diğer', estimatedHours: 2, defaultChecklist: DEFAULT_CHECKLISTS['Diğer'], isActive: true, createdAt: '', updatedAt: '' },
    ]);
  }, []);

  const filteredWorkTypes = workTypes.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!formData.code.trim() || !formData.name.trim()) return;

    const now = new Date().toISOString();

    if (editingWorkType) {
      setWorkTypes(prev => prev.map(w => 
        w.id === editingWorkType.id 
          ? { ...w, ...formData, updatedAt: now }
          : w
      ));
    } else {
      const newWorkType: WorkTypeConfig = {
        id: `w${Date.now()}`,
        ...formData,
        createdAt: now,
        updatedAt: now,
      };
      setWorkTypes(prev => [...prev, newWorkType]);
    }

    setShowDialog(false);
    setEditingWorkType(null);
    setFormData({ code: '', name: '', description: '', category: 'Tasarım', estimatedHours: 4, defaultChecklist: [], isActive: true });
  };

  const handleEdit = (workType: WorkTypeConfig) => {
    setEditingWorkType(workType);
    setFormData({
      code: workType.code,
      name: workType.name,
      description: workType.description || '',
      category: workType.category || 'Tasarım',
      estimatedHours: workType.estimatedHours || 4,
      defaultChecklist: workType.defaultChecklist || [],
      isActive: workType.isActive,
    });
    setShowDialog(true);
  };

  const handleDelete = (workTypeId: string) => {
    setWorkTypes(prev => prev.filter(w => w.id !== workTypeId));
    setConfirmDeleteId(null);
  };

  const handleToggleActive = (workTypeId: string) => {
    setWorkTypes(prev => prev.map(w => 
      w.id === workTypeId ? { ...w, isActive: !w.isActive } : w
    ));
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setFormData(prev => ({
        ...prev,
        defaultChecklist: [...prev.defaultChecklist, newChecklistItem.trim()]
      }));
      setNewChecklistItem('');
    }
  };

  const removeChecklistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      defaultChecklist: prev.defaultChecklist.filter((_, i) => i !== index)
    }));
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.id === category);
    const Icon = cat?.icon || Briefcase;
    return <Icon className="w-5 h-5" />;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Tasarım': 'bg-purple-500/20 text-purple-500',
      'Video': 'bg-red-500/20 text-red-500',
      'Metin': 'bg-blue-500/20 text-blue-500',
      'Fotoğraf': 'bg-green-500/20 text-green-500',
      'Sosyal Medya': 'bg-pink-500/20 text-pink-500',
      'Diğer': 'bg-gray-500/20 text-gray-500',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="page-title flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" />
          İş Türü Yönetimi
        </h1>
        <Button onClick={() => {
          setEditingWorkType(null);
          setFormData({ code: '', name: '', description: '', category: 'Tasarım', estimatedHours: 4, defaultChecklist: [], isActive: true });
          setShowDialog(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Yeni İş Türü
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-primary">{workTypes.length}</div>
            <div className="small-text mt-1">Toplam Tür</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-green-500">{workTypes.filter(w => w.isActive).length}</div>
            <div className="small-text mt-1">Aktif</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-muted-foreground">{workTypes.filter(w => !w.isActive).length}</div>
            <div className="small-text mt-1">Pasif</div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="stat-number text-blue-500">
              {new Set(workTypes.map(w => w.category)).size}
            </div>
            <div className="small-text mt-1">Kategori</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="İş türü ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 form-input"
        />
      </div>

      {/* Work Types Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkTypes.map((workType) => (
          <Card key={workType.id} className={`border-border/50 ${!workType.isActive ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(workType.category || 'Diğer')}`}>
                    {getCategoryIcon(workType.category || 'Diğer')}
                  </div>
                  <div>
                    <h3 className="font-medium">{workType.name}</h3>
                    <p className="text-xs text-muted-foreground">{workType.code}</p>
                  </div>
                </div>
                <Badge variant={workType.isActive ? 'default' : 'secondary'} className="text-xs">
                  {workType.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                {workType.description || 'Açıklama yok'}
              </p>

              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {workType.estimatedHours} saat
                </span>
                <span className="flex items-center gap-1">
                  <ListTodo className="w-3 h-3" />
                  {workType.defaultChecklist?.length || 0} adım
                </span>
              </div>

              <div className="mt-3">
                <Badge variant="outline" className={`text-xs ${getCategoryColor(workType.category || 'Diğer')}`}>
                  {workType.category || 'Diğer'}
                </Badge>
              </div>

              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(workType)}>
                  <Edit2 className="w-4 h-4 mr-1" />
                  Düzenle
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleToggleActive(workType.id)}>
                  {workType.isActive ? <XCircle className="w-4 h-4 mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                  {workType.isActive ? 'Pasif' : 'Aktif'}
                </Button>
                {confirmDeleteId === workType.id ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-red-600 font-medium">Emin misiniz?</span>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(workType.id)}>Evet</Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmDeleteId(null)}>Hayır</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="destructive" onClick={() => setConfirmDeleteId(workType.id)}>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              {editingWorkType ? 'İş Türü Düzenle' : 'Yeni İş Türü'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="form-label">Kod *</Label>
                <Input
                  placeholder="Örn: AFS, SM, VID"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="form-input"
                />
              </div>
              <div>
                <Label className="form-label">Ad *</Label>
                <Input
                  placeholder="İş türü adı"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
            <div>
              <Label className="form-label">Açıklama</Label>
              <Textarea
                placeholder="Açıklama"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="form-input min-h-[60px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="form-label">Kategori</Label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const category = e.target.value;
                    setFormData({ 
                      ...formData, 
                      category,
                      defaultChecklist: DEFAULT_CHECKLISTS[category] || []
                    });
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-border/50 bg-background text-sm"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="form-label">Tahmini Süre (saat)</Label>
                <Input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || 4 })}
                  className="form-input"
                />
              </div>
            </div>

            {/* Checklist */}
            <div>
              <Label className="form-label">Varsayılan Checklist</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Yeni adım ekle..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                  className="form-input"
                />
                <Button type="button" onClick={addChecklistItem} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1 max-h-[150px] overflow-y-auto p-2 border border-border/50 rounded-lg">
                {formData.defaultChecklist.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-secondary/50 rounded">
                    <span className="text-sm">{index + 1}. {item}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChecklistItem(index)}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                {formData.defaultChecklist.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">Henüz adım eklenmemiş</p>
                )}
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
                {editingWorkType ? 'Güncelle' : 'Ekle'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
