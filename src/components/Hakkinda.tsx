import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Hotel, 
  Target, 
  Users, 
  Briefcase, 
  CheckCircle, 
  BarChart3, 
  RotateCcw,
  Shield,
  Zap,
  Globe,
  Award,
  Clock
} from 'lucide-react';

export function Hakkinda() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-4 py-6">
        <div className="flex items-center justify-center gap-3">
          <Hotel className="w-10 h-10 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">HMTRMS</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Hotel Brand & Marketing Central Request Management System
        </p>
        <p className="text-base text-muted-foreground">
          Otel Marka ve Pazarlama Merkezi Talep Yönetim Sistemi
        </p>
      </div>

      {/* Sistem Amacı */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="section-title flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Sistemin Amacı
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-foreground leading-relaxed">
            HMTRMS, otel işletmelerinde pazarlama departmanına gelen tüm taleplerin 
            (afiş tasarımı, sosyal medya postu, video, menü vb.) merkezi bir yerden 
            yönetilmesini sağlayan profesyonel bir talep yönetim sistemidir.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Talep Sahipleri</h3>
                <p className="text-xs text-muted-foreground">
                  F&B, Spa, Sales, HR, Wedding vb. departmanlar sisteme talep giriyor
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Pazarlama Ekibi</h3>
                <p className="text-xs text-muted-foreground">
                  Talepleri atama, takip, onay ve raporlama süreçleriyle yönetiyor
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Özellikler */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="section-title flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Sistem Özellikleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm">Talep Yönetimi</h3>
                <p className="text-xs text-muted-foreground">
                  Kolay talep oluşturma, düzenleme ve takip
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <Users className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm">Görev Atama</h3>
                <p className="text-xs text-muted-foreground">
                  Otomatik ve manuel görev dağıtımı
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <RotateCcw className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm">Revize Takibi</h3>
                <p className="text-xs text-muted-foreground">
                  Revize taleplerinin kaydı ve yönetimi
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <Shield className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm">Onay Süreci</h3>
                <p className="text-xs text-muted-foreground">
                  Çok aşamalı onay mekanizması
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm">Raporlama</h3>
                <p className="text-xs text-muted-foreground">
                  Detaylı performans ve istatistik raporları
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-sm">SLA Takibi</h3>
                <p className="text-xs text-muted-foreground">
                  Hizmet seviyesi anlaşması izleme
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İş Akışı */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="section-title flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            İş Akışı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-medium text-white">1</div>
              <div>
                <p className="font-medium text-sm">Talep Girişi</p>
                <p className="text-xs text-muted-foreground">Departman talep oluşturur</p>
              </div>
            </div>
            <div className="hidden sm:block w-8 h-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-medium text-white">2</div>
              <div>
                <p className="font-medium text-sm">Atama</p>
                <p className="text-xs text-muted-foreground">Pazarlama ekibine atanır</p>
              </div>
            </div>
            <div className="hidden sm:block w-8 h-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-sm font-medium text-white">3</div>
              <div>
                <p className="font-medium text-sm">Üretim</p>
                <p className="text-xs text-muted-foreground">Tasarım ve üretim süreci</p>
              </div>
            </div>
            <div className="hidden sm:block w-8 h-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-sm font-medium text-white">4</div>
              <div>
                <p className="font-medium text-sm">Onay</p>
                <p className="text-xs text-muted-foreground">Final onay ve teslim</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Talep Türleri */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="section-title flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Desteklenen Talep Türleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              'Afiş Tasarımı',
              'Sosyal Medya',
              'Video Edit',
              'Broşür',
              'Menü',
              'Sunum',
              'Story',
              'Bülten',
              'Fotoğraf',
              'Diğer',
            ].map((type) => (
              <div key={type} className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm">{type}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Departmanlar */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="section-title flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Departmanlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'F&B', desc: 'Yiyecek & İçecek' },
              { name: 'Events', desc: 'Etkinlikler' },
              { name: 'Sales', desc: 'Satış' },
              { name: 'Spa', desc: 'Spa Merkezi' },
              { name: 'HR', desc: 'İnsan Kaynakları' },
              { name: 'Wedding', desc: 'Düğün Organizasyonu' },
              { name: 'Entertainment', desc: 'Eğlence' },
              { name: 'Pazarlama', desc: 'Pazarlama' },
            ].map((dept) => (
              <div key={dept.name} className="p-3 bg-secondary/30 rounded-lg">
                <p className="font-medium text-sm">{dept.name}</p>
                <p className="text-xs text-muted-foreground">{dept.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Kullanıcı Rolleri */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="section-title flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Kullanıcı Rolleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-sm">GM (Genel Müdür)</h3>
                <p className="text-xs text-muted-foreground">
                  Tüm sistemin yöneticisi. Talep onaylama, iş atama, raporlama ve sistem ayarlarına tam erişim.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Koordinatör</h3>
                <p className="text-xs text-muted-foreground">
                  Talep koordinasyonu, atama işlemleri ve takip süreçlerini yönetir.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Uygulayıcı (Grafiker)</h3>
                <p className="text-xs text-muted-foreground">
                  Kendine atanan görevleri görüntüler, üretim sürecini yönetir.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Talep Sahibi</h3>
                <p className="text-xs text-muted-foreground">
                  Talep oluşturur ve kendi taleplerinin durumunu takip eder.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-6 text-muted-foreground">
        <p className="text-sm">HMTRMS - Hotel Marketing Request Management System</p>
        <p className="text-xs mt-1">© 2026 Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}
