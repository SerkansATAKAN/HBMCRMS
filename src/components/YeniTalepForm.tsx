import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown, ChevronUp, Info, CheckCircle, PlusCircle } from 'lucide-react';
import { useStore } from '@/hooks/useStore';
import type { Department, WorkType, Priority } from '@/types';
import { toast } from 'sonner';

const departments: Department[] = ['F&B', 'Events', 'Sales', 'Spa', 'HR', 'Wedding', 'Entertainment', 'Pazarlama'];
const workTypes: WorkType[] = ['Afiş Tasarımı', 'Sosyal Medya', 'Video Edit', 'Broşür', 'Menü', 'Sunum', 'Story', 'Bülten', 'Fotoğraf', 'Diğer'];

export function YeniTalepForm() {
  const { addRequest, setCurrentView, currentUser } = useStore();
  const [showDetails, setShowDetails] = useState(false);
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
    // Optional fields
    facility: '',
    outlet: '',
    campaign: '',
    publishDate: undefined as Date | undefined,
    language: 'TR',
    format: '',
    mandatoryText: '',
    referenceUrl: '',
    approver: '',
    strategicImportance: 'Orta',
    hasRevenueImpact: false,
    isVipSensitive: false,
    needsExternalResource: false,
    parentRequestNo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Başlık zorunludur';
    if (!formData.department) newErrors.department = 'Departman zorunludur';
    if (!formData.workType) newErrors.workType = 'İş türü zorunludur';
    if (!formData.description.trim()) newErrors.description = 'Açıklama zorunludur';
    if (!formData.targetDate) newErrors.targetDate = 'Hedef tarih zorunludur';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const priority: Priority = formData.isUrgent ? 'kritik' : formData.priority;

    const newRequest = addRequest({
      title: formData.title,
      description: formData.description,
      department: formData.department as Department,
      workType: formData.workType as WorkType,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      status: 'NEW',
      priority,
      isUrgent: formData.isUrgent,
      targetDate: formData.targetDate!.toISOString().split('T')[0],
      publishDate: formData.publishDate?.toISOString().split('T')[0],
      facility: formData.facility || undefined,
      outlet: formData.outlet || undefined,
      campaign: formData.campaign || undefined,
      language: formData.language || undefined,
      format: formData.format || undefined,
      mandatoryText: formData.mandatoryText || undefined,
      referenceUrl: formData.referenceUrl || undefined,
      approver: formData.approver || undefined,
      strategicImportance: formData.strategicImportance || undefined,
      hasRevenueImpact: formData.hasRevenueImpact,
      isVipSensitive: formData.isVipSensitive,
      needsExternalResource: formData.needsExternalResource,
      parentRequestNo: formData.parentRequestNo || undefined,
      revizeCount: 0,
    });

    setCreatedRequestNo(newRequest.requestNo);
    setShowSuccess(true);
    
    // Başarı bildirimi göster
    toast.success('Talep başarıyla oluşturuldu!', {
      description: `Talep numaranız: ${newRequest.requestNo}`,
      duration: 5000,
    });
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
      facility: '',
      outlet: '',
      campaign: '',
      publishDate: undefined,
      language: 'TR',
      format: '',
      mandatoryText: '',
      referenceUrl: '',
      approver: '',
      strategicImportance: 'Orta',
      hasRevenueImpact: false,
      isVipSensitive: false,
      needsExternalResource: false,
      parentRequestNo: '',
    });
    setErrors({});
    setShowDetails(false);
  };

  if (showSuccess) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Talebiniz alındı!</h2>
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-slate-500">Talep No</div>
              <div className="text-lg font-mono font-medium">{createdRequestNo}</div>
              <div className="text-sm text-slate-500 mt-2">Durum</div>
              <div className="text-sm font-medium">Yeni Talep</div>
            </div>
            <p className="text-sm text-slate-500 mb-6">Pazarlama ekibi bilgilendirildi.</p>
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowSuccess(false);
                  handleReset();
                }}
              >
                Yeni Talep
              </Button>
              <Button onClick={() => setCurrentView('tum-talepler')}>
                Talepleri Görüntüle
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">➕ Yeni Talep</h1>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p>Bu form 5 temel bilgiyle talep açar.</p>
              <p>Detayları talep açıldıktan sonra ekleyebilirsiniz.</p>
            </div>
          </div>

          {/* Required Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Talep Başlığı *</Label>
              <Input
                id="title"
                placeholder="Kısa ve açıklayıcı bir başlık girin..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Departman *</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(v) => setFormData({ ...formData, department: v as Department })}
                >
                  <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Departman seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
              </div>

              <div>
                <Label htmlFor="workType">İş Türü *</Label>
                <Select 
                  value={formData.workType} 
                  onValueChange={(v) => setFormData({ ...formData, workType: v as WorkType })}
                >
                  <SelectTrigger className={errors.workType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="İş türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {workTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.workType && <p className="text-xs text-red-500 mt-1">{errors.workType}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Kısa Açıklama *</Label>
              <Textarea
                id="description"
                placeholder="Ne istiyorsunuz? Nerede kullanılacak?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={errors.description ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hedef Teslim Tarihi *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${errors.targetDate ? 'border-red-500' : ''}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.targetDate ? (
                        format(formData.targetDate, 'dd.MM.yyyy')
                      ) : (
                        <span className="text-slate-400">GG/AA/YYYY</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.targetDate}
                      onSelect={(date) => setFormData({ ...formData, targetDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.targetDate && <p className="text-xs text-red-500 mt-1">{errors.targetDate}</p>}
              </div>

              <div>
                <Label htmlFor="priority">Öncelik *</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(v) => setFormData({ ...formData, priority: v as Priority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dusuk">🔵 Düşük</SelectItem>
                    <SelectItem value="normal">🔵 Normal</SelectItem>
                    <SelectItem value="yuksek">🟠 Yüksek</SelectItem>
                    <SelectItem value="kritik">🔴 Kritik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Urgent Checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="urgent"
                checked={formData.isUrgent}
                onCheckedChange={(checked) => setFormData({ ...formData, isUrgent: checked as boolean })}
              />
              <Label htmlFor="urgent" className="text-sm cursor-pointer">
                ⚡ ACİL Talebi mi? (işaretlenirse öncelik Kritik'e döner)
              </Label>
            </div>
          </div>

          {/* Toggle Details */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full"
          >
            {showDetails ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
            {showDetails ? 'Detayları Gizle' : '+ Detay Ekle'}
            <span className="text-xs text-slate-400 ml-2">
              (Tesis / Outlet / Kampanya / Format / Bütçe / Referans)
            </span>
          </Button>

          {/* Optional Details */}
          {showDetails && (
            <div className="space-y-4 pt-4 border-t">
              <div className="text-sm font-medium text-slate-500 mb-2">Detay Bilgiler</div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tesis / Otel</Label>
                  <Input
                    placeholder="Tesis seçin"
                    value={formData.facility}
                    onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Outlet / Alan</Label>
                  <Input
                    placeholder="Outlet seçin"
                    value={formData.outlet}
                    onChange={(e) => setFormData({ ...formData, outlet: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kampanya</Label>
                  <Input
                    placeholder="Kampanya seçin"
                    value={formData.campaign}
                    onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Yayın / Kullanım Tarihi</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.publishDate ? (
                          format(formData.publishDate, 'dd.MM.yyyy')
                        ) : (
                          <span className="text-slate-400">GG/AA/YYYY</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.publishDate}
                        onSelect={(date) => setFormData({ ...formData, publishDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Dil</Label>
                  <Select 
                    value={formData.language} 
                    onValueChange={(v) => setFormData({ ...formData, language: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TR">TR</SelectItem>
                      <SelectItem value="EN">EN</SelectItem>
                      <SelectItem value="TR + EN">TR + EN</SelectItem>
                      <SelectItem value="RU">RU</SelectItem>
                      <SelectItem value="DE">DE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Format / Boyut</Label>
                  <Input
                    placeholder="Örn: 1080x1920, A3"
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Zorunlu Metinler / Bilgiler</Label>
                <Textarea
                  placeholder="Afişe / materyale mutlaka girilmesi gereken metinler"
                  value={formData.mandatoryText}
                  onChange={(e) => setFormData({ ...formData, mandatoryText: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label>Referans Dosya / Görsel URL</Label>
                <Input
                  placeholder="🔗 Google Drive bağlantısı yapıştırın..."
                  value={formData.referenceUrl}
                  onChange={(e) => setFormData({ ...formData, referenceUrl: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Son Onay Verecek Kişi</Label>
                  <Input
                    placeholder="Kişi seçin"
                    value={formData.approver}
                    onChange={(e) => setFormData({ ...formData, approver: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Stratejik Önem</Label>
                  <Select 
                    value={formData.strategicImportance} 
                    onValueChange={(v) => setFormData({ ...formData, strategicImportance: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Düşük">Düşük</SelectItem>
                      <SelectItem value="Orta">Orta</SelectItem>
                      <SelectItem value="Yüksek">Yüksek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="revenue"
                    checked={formData.hasRevenueImpact}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasRevenueImpact: checked as boolean })}
                  />
                  <Label htmlFor="revenue" className="text-sm cursor-pointer">Gelir Etkisi Var</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="vip"
                    checked={formData.isVipSensitive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isVipSensitive: checked as boolean })}
                  />
                  <Label htmlFor="vip" className="text-sm cursor-pointer">VIP Hassasiyet</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="external"
                    checked={formData.needsExternalResource}
                    onCheckedChange={(checked) => setFormData({ ...formData, needsExternalResource: checked as boolean })}
                  />
                  <Label htmlFor="external" className="text-sm cursor-pointer">Dış Kaynak Gerekiyor</Label>
                </div>
              </div>

              <div>
                <Label>Bağlı Proje / Ana Talep No</Label>
                <Input
                  placeholder="REQ-XXXX (seri iş ise bağlı ana talebi girin)"
                  value={formData.parentRequestNo}
                  onChange={(e) => setFormData({ ...formData, parentRequestNo: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setCurrentView('dashboard')}>
              İptal
            </Button>
            <Button onClick={handleSubmit}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Talebi Kaydet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
