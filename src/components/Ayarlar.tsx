import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Bell,
  Shield,
  Globe,
  Monitor,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export function Ayarlar() {
  const [notifications, setNotifications] = useState({
    newRequest: true,
    deadlineReminder: true,
    revizeRequest: true,
    approvalRequest: true,
  });

  const [language, setLanguage] = useState('tr');
  const [dateFormat, setDateFormat] = useState('dd.mm.yyyy');

  const handleSave = () => {
    toast.success('Ayarlar kaydedildi!', { duration: 2000 });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Settings className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Ayarlar</h1>
      </div>

      {/* Uygulama Ayarları */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Uygulama Ayarları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Dil</Label>
              <p className="text-sm text-muted-foreground">Arayüz dili</p>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-36">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tr">Türkçe</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Tarih Formatı</Label>
              <p className="text-sm text-muted-foreground">Tarihlerin gösterim biçimi</p>
            </div>
            <Select value={dateFormat} onValueChange={setDateFormat}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dd.mm.yyyy">GG.AA.YYYY</SelectItem>
                <SelectItem value="yyyy-mm-dd">YYYY-AA-GG</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bildirim Ayarları */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Bildirim Ayarları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Yeni Talep Bildirimi</Label>
              <p className="text-sm text-muted-foreground">Sisteme yeni talep eklendiğinde bildirim al</p>
            </div>
            <Switch
              checked={notifications.newRequest}
              onCheckedChange={(v) => setNotifications(prev => ({ ...prev, newRequest: v }))}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Deadline Hatırlatıcısı</Label>
              <p className="text-sm text-muted-foreground">Teslim tarihi yaklaştığında bildirim al</p>
            </div>
            <Switch
              checked={notifications.deadlineReminder}
              onCheckedChange={(v) => setNotifications(prev => ({ ...prev, deadlineReminder: v }))}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Revize Talebi Bildirimi</Label>
              <p className="text-sm text-muted-foreground">Revize talebi geldiğinde bildirim al</p>
            </div>
            <Switch
              checked={notifications.revizeRequest}
              onCheckedChange={(v) => setNotifications(prev => ({ ...prev, revizeRequest: v }))}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Onay Bildirimi</Label>
              <p className="text-sm text-muted-foreground">Onay bekleyen iş oluştuğunda bildirim al</p>
            </div>
            <Switch
              checked={notifications.approvalRequest}
              onCheckedChange={(v) => setNotifications(prev => ({ ...prev, approvalRequest: v }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Güvenlik */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Güvenlik
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Oturum Zaman Aşımı</Label>
              <p className="text-sm text-muted-foreground">Hareketsiz kalındığında oturumu kapat</p>
            </div>
            <Select defaultValue="60">
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 dakika</SelectItem>
                <SelectItem value="60">1 saat</SelectItem>
                <SelectItem value="120">2 saat</SelectItem>
                <SelectItem value="0">Hiçbir zaman</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Kaydet */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <CheckCircle className="w-4 h-4" />
          Ayarları Kaydet
        </Button>
      </div>
    </div>
  );
}
