import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  CalendarIcon, 
  CheckCircle, 
  PlusCircle, 
  UserPlus,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import type { Department, WorkType, Priority } from '@/types';

const departments: Department[] = ['F&B', 'Events', 'Sales', 'Spa', 'HR', 'Wedding', 'Entertainment', 'Pazarlama'];
const workTypes: WorkType[] = ['Afiş Tasarımı', 'Sosyal Medya', 'Video Edit', 'Broşür', 'Menü', 'Sunum', 'Story', 'Bülten', 'Fotoğraf', 'Diğer'];

export function IsTanimla() {
  const { addRequest, addTask, setCurrentView, currentUser, users } = useStore();
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdRequestNo, setCreatedRequestNo] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    department: '' as Department | '',
    workType: '' as WorkType | '',
    description: '',
    targetDate: undefined as Date | undefined,
    priority: 'normal' as Priority,
    isUrgent: false,
    assignedTo: '',
    facility: '',
    outlet: '',
    format: '',
    mandatoryText: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const uygulayicilar = users.filter(u => u.role === 'uygulayici');

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Başlık zorunludur';
    if (!formData.department) newErrors.department = 'Departman zorunludur';
    if (!formData.workType) newErrors.workType = 'İş türü zorunludur';
    if (!formData.description.trim()) newErrors.description = 'Açıklama zorunludur';
    if (!formData.targetDate) newErrors.targetDate = 'Hedef tarih zorunludur';
    if (!formData.assignedTo) newErrors.assignedTo = 'Sorumlu kişi seçilmelidir';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const priority: Priority = formData.isUrgent ? 'kritik' : formData.priority;
    const assignedUser = uygulayicilar.find(u => u.id === formData.assignedTo);

    // Önce talep oluştur
    const newRequest = addRequest({
      title: formData.title,
      description: formData.description,
      department: formData.department as Department,
      workType: formData.workType as WorkType,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      assignedTo: assignedUser?.id,
      assignedToName: assignedUser?.name,
      status: 'ASN',
      priority,
      isUrgent: formData.isUrgent,
      targetDate: formData.targetDate!.toISOString().split('T')[0],
      facility: formData.facility || undefined,
      outlet: formData.outlet || undefined,
      format: formData.format || undefined,
      mandatoryText: formData.mandatoryText || undefined,
      hasRevenueImpact: false,
      isVipSensitive: false,
      needsExternalResource: false,
      revizeCount: 0,
    });

    // Hemen görev de oluştur
    if (assignedUser) {
      addTask({
        requestId: newRequest.id,
        requestNo: newRequest.requestNo,
        requestTitle: newRequest.title,
        title: formData.workType,
        type: formData.workType as WorkType,
        assignedTo: assignedUser.id,
        assignedToName: assignedUser.name,
        status: 'ASN',
        priority,
        dueDate: formData.targetDate!.toISOString().split('T')[0],
        checklist: [],
      });
    }

    setCreatedRequestNo(newRequest.requestNo);
    setShowSuccess(true);
  };

  const handleReset = () => {
    setFormData({
      title: '',
      department: '',
      workType: '',
      description: '',
      targetDate: undefined,
      priority: 'normal',
      isUrgent: false,
      assignedTo: '',
      facility: '',
      outlet: '',
      format: '',
      mandatoryText: '',
    });
    setErrors({});
  };

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md border-border/50">
          <CardContent className="p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-foreground">İş ve Görev Tanımlandı!</h2>
            <div className="bg-secondary/50 rounded-lg p-4 mb-4">
              <div className="text-sm text-muted-foreground">Talep No</div>
              <div className="text-lg font-mono font-medium text-foreground">{createdRequestNo}</div>
              <div className="text-sm text-muted-foreground mt-2">Durum</div>
              <div className="text-sm font-medium text-foreground">Atandı</div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">İlgili kişi bilgilendirildi.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowSuccess(false);
                  handleReset();
                }}
                className="w-full sm:w-auto"
              >
                Yeni İş Tanımla
              </Button>
              <Button 
                onClick={() => setCurrentView('tum-talepler')}
                className="w-full sm:w-auto"
              >
                Talepleri Görüntüle
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="page-title flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" />
          İş / Görev Tanımla
        </h1>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Info Banner */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 sm:p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground">
              <p className="font-medium">Bu form ile direkt iş tanımlayıp kişiye atayabilirsiniz.</p>
              <p className="text-muted-foreground">Talep otomatik oluşturulur ve ilgili kişiye görev atanır.</p>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* İş Başlığı */}
            <div className="sm:col-span-2">
              <Label className="form-label">İş Başlığı *</Label>
              <Input
                placeholder="Kısa ve açıklayıcı bir başlık girin..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`form-input ${errors.title ? 'border-destructive' : ''}`}
              />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
            </div>

            {/* Departman */}
            <div>
              <Label className="form-label">Departman *</Label>
              <Select 
                value={formData.department} 
                onValueChange={(v) => setFormData({ ...formData, department: v as Department })}
              >
                <SelectTrigger className={`form-input ${errors.department ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Departman seçin" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && <p className="text-xs text-destructive mt-1">{errors.department}</p>}
            </div>

            {/* İş Türü */}
            <div>
              <Label className="form-label">İş Türü *</Label>
              <Select 
                value={formData.workType} 
                onValueChange={(v) => setFormData({ ...formData, workType: v as WorkType })}
              >
                <SelectTrigger className={`form-input ${errors.workType ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="İş türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  {workTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.workType && <p className="text-xs text-destructive mt-1">{errors.workType}</p>}
            </div>

            {/* Sorumlu Kişi */}
            <div>
              <Label className="form-label flex items-center gap-1">
                <UserPlus className="w-3 h-3" />
                Sorumlu Kişi *
              </Label>
              <Select 
                value={formData.assignedTo} 
                onValueChange={(v) => setFormData({ ...formData, assignedTo: v })}
              >
                <SelectTrigger className={`form-input ${errors.assignedTo ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Kişi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {uygulayicilar.map((user) => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assignedTo && <p className="text-xs text-destructive mt-1">{errors.assignedTo}</p>}
            </div>

            {/* Hedef Tarih */}
            <div>
              <Label className="form-label">Hedef Teslim Tarihi *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal form-input ${errors.targetDate ? 'border-destructive' : ''}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {formData.targetDate ? (
                      format(formData.targetDate, 'dd.MM.yyyy', { locale: tr })
                    ) : (
                      <span className="text-muted-foreground">GG/AA/YYYY</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.targetDate}
                    onSelect={(date) => setFormData({ ...formData, targetDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.targetDate && <p className="text-xs text-destructive mt-1">{errors.targetDate}</p>}
            </div>

            {/* Öncelik */}
            <div>
              <Label className="form-label">Öncelik</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(v) => setFormData({ ...formData, priority: v as Priority })}
              >
                <SelectTrigger className="form-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dusuk">Düşük</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="yuksek">Yüksek</SelectItem>
                  <SelectItem value="kritik">Kritik</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Acil */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="urgent"
                checked={formData.isUrgent}
                onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="urgent" className="text-sm cursor-pointer flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-destructive" />
                ACİL Talep
              </Label>
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <Label className="form-label">İş Açıklaması *</Label>
            <Textarea
              placeholder="Ne istiyorsunuz? Nerede kullanılacak? Detayları yazın..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`min-h-[100px] form-input ${errors.description ? 'border-destructive' : ''}`}
            />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
          </div>

          {/* Optional Fields */}
          <div className="border-t border-border/50 pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">Ek Bilgiler (İsteğe Bağlı)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="form-label">Tesis / Otel</Label>
                <Input
                  placeholder="Örn: Otel 1 Antalya"
                  value={formData.facility}
                  onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <Label className="form-label">Outlet / Alan</Label>
                <Input
                  placeholder="Örn: Havuz Alanı"
                  value={formData.outlet}
                  onChange={(e) => setFormData({ ...formData, outlet: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <Label className="form-label">Format / Boyut</Label>
                <Input
                  placeholder="Örn: 1080x1920, A3"
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Zorunlu Metinler */}
          <div>
            <Label className="form-label">Zorunlu Metinler / Bilgiler</Label>
            <Textarea
              placeholder="Afişe / materyale mutlaka girilmesi gereken metinler..."
              value={formData.mandatoryText}
              onChange={(e) => setFormData({ ...formData, mandatoryText: e.target.value })}
              className="min-h-[80px] form-input"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-border/50">
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('dashboard')}
              className="w-full sm:w-auto"
            >
              İptal
            </Button>
            <Button 
              onClick={handleSubmit}
              className="w-full sm:w-auto"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              İşi Tanımla ve Ata
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
