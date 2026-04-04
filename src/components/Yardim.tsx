import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  LayoutDashboard, 
  ClipboardList, 
  PlusCircle, 
  RotateCcw, 
  CheckCircle, 
  BarChart3, 
  Settings, 
  Briefcase,
  Building2,
  Shield,
  Users,
  Wrench,
  Info,
  Bell,
  ArrowRight,
  AlertTriangle,
  Clock,
  UserPlus,
  FileText,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: React.ReactNode;
}

export function Yardim() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const helpSections: HelpSection[] = [
    {
      id: 'genel',
      title: 'HMTRMS Nedir?',
      icon: Info,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>HMTRMS (Hotel Marketing Request Management System)</strong>, otel pazarlama departmanlarının 
            talep ve görev yönetimini dijitalleştiren kapsamlı bir yönetim sistemidir.
          </p>
          <div className="bg-secondary/30 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Sistemin Temel Amaçları:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Tüm pazarlama taleplerini merkezi bir sistemde toplamak</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Görev atama ve takip süreçlerini otomatikleştirmek</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Onay ve revize süreçlerini şeffaf hale getirmek</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Raporlama ve analiz imkanı sunmak</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Gecikmeleri önceden tespit etmek ve önlem almak</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'roller',
      title: 'Kullanıcı Rolleri ve Yetkileri',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-500" />
                  Talep Sahibi
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Yeni talep oluşturabilir</li>
                  <li>• Kendi taleplerini görüntüleyebilir</li>
                  <li>• Revize talep edebilir</li>
                  <li>• Onay verebilir/reddedebilir</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-green-500" />
                  Uygulayıcı
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Kendine atanan görevleri görür</li>
                  <li>• Görevleri tamamlar</li>
                  <li>• Checklist işaretler</li>
                  <li>• Onaya gönderir</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  Koordinatör
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Tüm talepleri görüntüler</li>
                  <li>• Görev atar</li>
                  <li>• Revizeleri yönetir</li>
                  <li>• Raporları görüntüler</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-orange-500" />
                  Yönetici
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Onay yetkisi</li>
                  <li>• Departman taleplerini yönetir</li>
                  <li>• Raporları görüntüler</li>
                  <li>• Ayarlara erişim</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border/50 md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-500" />
                  Genel Müdür / Admin
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• <strong>Tüm yetkiler:</strong> Sistemdeki tüm işlemleri yapabilir</li>
                  <li>• <strong>İş/Görev Tanımlama:</strong> Yeni işler oluşturur ve dağıtır</li>
                  <li>• <strong>Yönetim Paneli:</strong> Departman, rol, kullanıcı, iş türü yönetimi</li>
                  <li>• <strong>Onay Yetkisi:</strong> Tüm onayları verebilir</li>
                  <li>• <strong>Sistem Ayarları:</strong> Genel sistem yapılandırması</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'talep-durumlari',
      title: 'Talep Durumları ve Anlamları',
      icon: ClipboardList,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Her talep, yaşam döngüsü boyunca farklı durumlardan geçer. Durumlar renk kodları ile görselleştirilir:
          </p>
          <div className="space-y-2">
            {[
              { code: 'NEW', label: 'Yeni Talep', color: 'bg-gray-500', desc: 'Talep oluşturuldu, henüz incelenmedi' },
              { code: 'REV', label: 'İnceleniyor', color: 'bg-blue-500', desc: 'Koordinatör tarafından inceleniyor' },
              { code: 'BRF', label: 'Eksik Brief', color: 'bg-yellow-500', desc: 'Talep sahibinden ek bilgi bekleniyor' },
              { code: 'ASN', label: 'Atandı', color: 'bg-indigo-500', desc: 'Bir uygulayıcıya atandı' },
              { code: 'WIP', label: 'Yapım Aşamasında', color: 'bg-orange-500', desc: 'Uygulayıcı çalışıyor' },
              { code: 'QCC', label: 'İç Kontrolde', color: 'bg-cyan-500', desc: 'Kalite kontrol sürecinde' },
              { code: 'APW', label: 'Onay Bekliyor', color: 'bg-purple-500', desc: 'Talep sahibinin onayını bekliyor' },
              { code: 'RVZ', label: 'Revizede', color: 'bg-pink-500', desc: 'Revize talebi alındı, düzeltme yapılıyor' },
              { code: 'CMP', label: 'Tamamlandı', color: 'bg-green-500', desc: 'İş başarıyla tamamlandı' },
              { code: 'PUB', label: 'Yayınlandı', color: 'bg-teal-500', desc: 'İçerik yayınlandı' },
              { code: 'CAN', label: 'İptal', color: 'bg-red-500', desc: 'Talep iptal edildi' },
            ].map((status) => (
              <div key={status.code} className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${status.color}`} />
                <div className="flex-1">
                  <span className="font-medium text-sm">{status.label}</span>
                  <span className="text-xs text-muted-foreground ml-2">({status.code})</span>
                </div>
                <span className="text-xs text-muted-foreground">{status.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'ana-panel',
      title: 'Ana Panel Kullanımı',
      icon: LayoutDashboard,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ana Panel, sistemin genel durumunu hızlıca görmenizi sağlayan kontrol merkezidir.
          </p>
          <div className="space-y-3">
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                GECİKMİŞ İŞLER / GECİKME RİSKİ OLANLAR
              </h4>
              <p className="text-xs text-muted-foreground">
                <strong>Gecikmiş iş varsa:</strong> En çok gecikenden başlayarak sıralanır. 
                &quot;Tüm Gecikmiş İşler&quot; linki ile detaylı listeye ulaşılır.<br/>
                <strong>Gecikmiş iş yoksa:</strong> 3 gün veya daha az kalan riskli işler gösterilir. 
                Her işin ilerleme durumu ve kalan günü görülür.
              </p>
            </div>
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                BU HAFTA DEADLINE
              </h4>
              <p className="text-xs text-muted-foreground">
                Bu hafta içinde teslim edilmesi gereken işler listelenir. 
                Bugün: 🔴, Yarın: 🟡, Diğer günler: 🟢 olarak işaretlenir.
              </p>
            </div>
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                KİŞİ BAZLI İŞ YÜKÜ
              </h4>
              <p className="text-xs text-muted-foreground">
                Her uygulayıcının üzerindeki aktif iş sayısı görsel olarak gösterilir. 
                İş dağılımını dengelemek için kullanılır.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'yeni-talep',
      title: 'Yeni Talep Oluşturma',
      icon: PlusCircle,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Adım 1: Temel Bilgiler</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• <strong>Başlık:</strong> Talebinizi özetleyen kısa bir başlık</li>
                <li>• <strong>Açıklama:</strong> Detaylı açıklama ve beklentileriniz</li>
                <li>• <strong>Departman:</strong> Talebin hangi departmana ait olduğu</li>
                <li>• <strong>İş Türü:</strong> Afiş, Video, Sosyal Medya vb.</li>
              </ul>
            </div>
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Adım 2: Tarih ve Öncelik</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• <strong>Hedef Tarih:</strong> İşin bitirilmesini istediğiniz tarih</li>
                <li>• <strong>Yayın Tarihi:</strong> İçeriğin yayınlanacağı tarih (varsa)</li>
                <li>• <strong>Öncelik:</strong> Düşük / Normal / Yüksek / Kritik</li>
                <li>• <strong>Acil:</strong> Ekstra hızlı işlem gerekiyorsa işaretleyin</li>
              </ul>
            </div>
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Adım 3: Detaylar</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• <strong>Tesis/Outlet:</strong> Hangi tesise/outlet&apos;e ait</li>
                <li>• <strong>Kampanya:</strong> Hangi kampanya kapsamında</li>
                <li>• <strong>Dil:</strong> TR / EN / TR+EN</li>
                <li>• <strong>Format:</strong> Afiş boyutu, video süresi vb.</li>
                <li>• <strong>Zorunlu Metin:</strong> Kesinlikle kullanılması gereken metinler</li>
                <li>• <strong>Referans URL:</strong> Örnek çalışmalar veya kaynaklar</li>
              </ul>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2 text-green-600">💡 İpuçları</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Ne kadar detaylı brief verirseniz, revize ihtimali o kadar azalır</li>
                <li>• Referans görseller eklemek çok faydalıdır</li>
                <li>• Gerçekçi deadline belirleyin</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'gorev-atama',
      title: 'Görev Atama ve İş Yükü Analizi',
      icon: UserPlus,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            &quot;Bugün Gelen Görevler&quot; sayfasında görev atama yaparken çalışanların 
            detaylı analizini görürsünüz:
          </p>
          <div className="space-y-3">
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Çalışan Kartında Görülen Bilgiler</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">Aktif İş Sayısı:</span>
                  <span>Şu an üzerinde çalıştığı iş sayısı</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">İş Yükü %:</span>
                  <span>Kapasitesinin yüzde kaçı dolu (max 5 iş varsayımı)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">Ort. İlerleme:</span>
                  <span>Mevcut işlerinin ortalama tamamlanma yüzdesi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">Başarı Oranı:</span>
                  <span>Geçmişteki işlerini zamanında tamamlama oranı</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">Uzmanlık Alanları:</span>
                  <span>Hangi iş türlerinde uzman olduğu</span>
                </li>
              </ul>
            </div>
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Müsaitlik Durumları</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-green-500 text-green-500 text-xs">MÜSAİT</Badge>
                  <span className="text-xs text-muted-foreground">0-1 aktif iş</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-yellow-500 text-yellow-500 text-xs">ORTA</Badge>
                  <span className="text-xs text-muted-foreground">2-3 aktif iş</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-orange-500 text-orange-500 text-xs">MEŞGUL</Badge>
                  <span className="text-xs text-muted-foreground">4 aktif iş</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-destructive text-destructive text-xs">AŞIRI YÜKLENMİŞ</Badge>
                  <span className="text-xs text-muted-foreground">5+ aktif iş</span>
                </div>
              </div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2 text-green-600">💡 Akıllı Atama Önerisi</h4>
              <p className="text-xs text-muted-foreground">
                Sistem, iş türüne göre uzman olan çalışanları otomatik olarak öne çıkarır. 
                Uzman çalışanlarda &quot;Uzman&quot; rozeti ve yeşil &quot;Ata&quot; butonu görünür.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'revize-sistemi',
      title: 'Revize Sistemi (10 Limit Kuralı)',
      icon: RotateCcw,
      content: (
        <div className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2 text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              ÖNEMLİ: 10 Revize Limiti
            </h4>
            <p className="text-xs text-muted-foreground">
              Her iş için maksimum <strong>10 revize</strong> hakkı vardır. 
              10 revize sonrası iş otomatik olarak yeni bir göreve aktarılır.
            </p>
          </div>
          <div className="space-y-3">
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Revize Nasıl Talep Edilir?</h4>
              <ol className="space-y-1 text-xs text-muted-foreground list-decimal list-inside">
                <li>Talep detay sayfasına gidin</li>
                <li>&quot;Revize Talep Et&quot; butonuna tıklayın</li>
                <li>Revize kaynağını seçin (Brief Eksikliği / Kalite Sorunu / Yön Değişikliği / Dış Faktör)</li>
                <li>Revize nedenini açıkça yazın</li>
                <li>Beklentinizi detaylı açıklayın</li>
                <li>Referans varsa URL ekleyin</li>
                <li>&quot;Revize Gönder&quot; butonuna tıklayın</li>
              </ol>
            </div>
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Revize Sayacı ve Uyarılar</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• <span className="text-blue-500">1-7 revize:</span> Normal durum, mavi uyarı</li>
                <li>• <span className="text-orange-500">8-9 revize:</span> Dikkat, turuncu uyarı - Son 2 hakkınız!</li>
                <li>• <span className="text-destructive">10 revize:</span> Limit doldu, kırmızı uyarı</li>
              </ul>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2 text-purple-600">10 Revize Sonrası Görev Aktarımı</h4>
              <p className="text-xs text-muted-foreground">
                10 revize sonrası &quot;Yeni Göreve Aktar&quot; butonu aktif olur. Aktarım yapıldığında:<br/>
                • Eski görev kapatılır<br/>
                • Yeni görev oluşturulur (Başlık: &quot;... nolu iş aktarımı&quot;)<br/>
                • Tüm revize geçmişi yeni göreve taşınır<br/>
                • Geçmiş başarısızlıklardan ders çıkarılarak devam edilir
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'gecikme-yonetimi',
      title: 'Gecikme Yönetimi',
      icon: Clock,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Gecikmiş işlerin yönetimi ve gecikmeli tamamlama süreci:
          </p>
          <div className="space-y-3">
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Gecikmiş İş Nasıl Anlaşılır?</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Ana Panel&apos;de &quot;GECİKMİŞ İŞLER&quot; kartı kırmızı görünür</li>
                <li>• Talep detayında &quot;GECİKTİ&quot; rozeti görünür</li>
                <li>• Liste görünümlerinde kırmızı vurgu ve gecikme günü gösterilir</li>
              </ul>
            </div>
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Gecikmeli Tamamlama</h4>
              <ol className="space-y-1 text-xs text-muted-foreground list-decimal list-inside">
                <li>Talep detay sayfasına gidin</li>
                <li>&quot;Gecikmeli Tamamla&quot; butonuna tıklayın (turuncu renkli)</li>
                <li>Gecikme bilgilerini görüntüleyin</li>
                <li>İsteğe bağlı tamamlama notu ekleyin</li>
                <li>&quot;Gecikmeli Tamamla&quot; butonuna tıklayın</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-2">
                Tamamlandığında otomatik olarak <strong>&quot;X gün gecikmeli olarak tamamlandı&quot;</strong> ibaresi eklenir.
              </p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2 text-orange-600">Önemli Not</h4>
              <p className="text-xs text-muted-foreground">
                Gecikmiş işler yarım bırakılmamalıdır. Gecikme olsa bile iş tamamlanmalı ve 
                sistemde gecikmeli tamamlandı olarak işaretlenmelidir.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'bildirimler',
      title: 'Bildirim Sistemi',
      icon: Bell,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Çan ikonu size özel bildirimleri gösterir. Bildirimler şunları içerir:
          </p>
          <div className="space-y-3">
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Bildirim Türleri</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Onay Bekleyen Taleplerim:</strong> Onayınızı bekleyen teslimler</span>
                </li>
                <li className="flex items-start gap-2">
                  <RotateCcw className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Revize Taleplerim:</strong> Revize istediğiniz işlerin durumu</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <span><strong>Bugün Deadline:</strong> Bugün teslim etmeniz gereken işler</span>
                </li>
                <li className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Yeni Atanan Görevler:</strong> Size yeni atanan işler</span>
                </li>
                <li className="flex items-start gap-2">
                  <UserPlus className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Onaylamam Gerekenler:</strong> Sizin onay vermeniz gereken işler</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Gecikmiş Görevlerim:</strong> Deadline&apos;ı geçmiş işleriniz</span>
                </li>
              </ul>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2 text-green-600">Bildirim Sayısı</h4>
              <p className="text-xs text-muted-foreground">
                Çan ikonundaki kırmızı rozet, toplam bildirim sayısını gösterir. 
                9&apos;dan fazla bildirim varsa &quot;9+&quot; olarak görünür. Bildirimler pulsasyon 
                animasyonu ile dikkat çeker.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'yonetim-paneli',
      title: 'Yönetim Paneli (GM/Admin)',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Yönetim Paneli sadece Genel Müdür ve Admin kullanıcılar tarafından erişilebilir.
          </p>
          <div className="space-y-3">
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Departman Yönetimi
              </h4>
              <p className="text-xs text-muted-foreground">
                Yeni departman ekleme, mevcut departmanları düzenleme, 
                departman müdürü atama ve aktif/pasif durum yönetimi.
              </p>
            </div>
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Rol Yönetimi
              </h4>
              <p className="text-xs text-muted-foreground">
                Kullanıcı rollerini oluşturma ve düzenleme. Her rol için izinlerin 
                belirlenmesi ve hiyerarşik seviye ayarı.
              </p>
            </div>
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                İş Türü Yönetimi
              </h4>
              <p className="text-xs text-muted-foreground">
                Desteklenen iş türlerini ekleme/düzenleme. Her iş türü için 
                kategori, tahmini süre ve varsayılan checklist tanımlama.
              </p>
            </div>
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Kullanıcı Yönetimi
              </h4>
              <p className="text-xs text-muted-foreground">
                Yeni kullanıcı ekleme, kullanıcı bilgilerini düzenleme, 
                uzmanlık alanları atama ve avatar yönetimi.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'kisayollar',
      title: 'Klavye Kısayolları ve İpuçları',
      icon: FileText,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">🚀 Hızlı Erişim</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Ana Panel&apos;den istatistik kartlarına tıklayarak ilgili sayfaya gidin</li>
                <li>• Her sayfada &quot;Tümü&quot; linki ile detaylı listelere ulaşın</li>
                <li>• Görev kartlarına tıklayarak detay sayfasına gidin</li>
              </ul>
            </div>
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">📊 Verimlilik İpuçları</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Her gün &quot;Bugün Bitirilecekler&quot; sayfasını kontrol edin</li>
                <li>• Bildirimlerinizi düzenli olarak takip edin</li>
                <li>• Revize taleplerinde detaylı açıklama yazın</li>
                <li>• Checklist&apos;i düzenli güncelleyin</li>
              </ul>
            </div>
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">⚠️ Sık Yapılan Hatalar</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Eksiz brief vermek (revize sayısını artırır)</li>
                <li>• Gerçekçi olmayan deadline belirlemek</li>
                <li>• Görev atamadan iş beklemek</li>
                <li>• Revize nedenini açıklamamak</li>
              </ul>
            </div>
            <div className="bg-secondary/30 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">✅ En İyi Pratikler</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Referans görseller ekleyin</li>
                <li>• Zorunlu metinleri belirtin</li>
                <li>• İş yüküne göre atama yapın</li>
                <li>• Düzenli geri bildirim verin</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="page-title flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-primary" />
          Yardım ve Kullanım Kılavuzu
        </h1>
      </div>

      {/* Giriş */}
      <Card className="border-border/50 bg-primary/5">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Bu kılavuz, HMTRMS sisteminin tüm özelliklerini ve kullanımını detaylı olarak açıklar. 
            Sol menüden konulara tıklayarak detaylı bilgilere ulaşabilirsiniz.
          </p>
        </CardContent>
      </Card>

      {/* Konular Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sol Menü - Konu Listesi */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">KONULAR</h3>
          {helpSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm transition-all ${
                activeSection === section.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/30 text-foreground hover:bg-secondary/50'
              }`}
            >
              <section.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{section.title}</span>
              <ArrowRight className={`w-4 h-4 transition-transform ${
                activeSection === section.id ? 'rotate-90' : ''
              }`} />
            </button>
          ))}
        </div>

        {/* Sağ İçerik */}
        <div className="lg:col-span-2">
          {activeSection ? (
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {(() => {
                    const section = helpSections.find(s => s.id === activeSection);
                    if (section) {
                      const Icon = section.icon;
                      return <Icon className="w-5 h-5 text-primary" />;
                    }
                    return null;
                  })()}
                  {helpSections.find(s => s.id === activeSection)?.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {helpSections.find(s => s.id === activeSection)?.content}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/50 h-full flex items-center justify-center">
              <CardContent className="p-8 text-center">
                <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Yardım almak istediğiniz konuyu seçin</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer - Destek */}
      <Card className="border-border/50 bg-secondary/30">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-medium text-sm">Yardıma mı ihtiyacınız var?</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Bu kılavuzda cevabını bulamadığınız sorular için sistem yöneticinize başvurun.
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              HMTRMS v1.0
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
