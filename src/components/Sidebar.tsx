import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  PlusCircle, 
  FolderOpen, 
  CheckSquare, 
  RotateCcw, 
  CheckCircle, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Bell,
  ChevronDown,
  Hotel,
  Menu,
  X,
  Briefcase,
  CalendarClock,
  CalendarCheck,
  Info,
  Building2,
  Shield,
  Users,
  Wrench,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/hooks/useStore';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: number;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Ana Panel', icon: LayoutDashboard, roles: ['koordinator', 'yonetici', 'gm', 'admin'] },
  { id: 'is-tanimla', label: 'İş / Görev Tanımla', icon: Briefcase, roles: ['gm', 'admin'] },
  { id: 'dagitilacak-gorevler', label: 'Bugün Gelen Görevler', icon: CalendarClock, roles: ['gm', 'admin'] },
  { id: 'bitirilecek-gorevler', label: 'Bugün Bitirilecekler', icon: CalendarCheck, roles: ['gm', 'admin'] },
  { id: 'acik-isler', label: 'Açık İşler', icon: ClipboardList, roles: ['talep_sahibi', 'uygulayici', 'koordinator', 'yonetici', 'gm', 'admin'] },
  { id: 'yeni-talep', label: 'Yeni Talep', icon: PlusCircle, roles: ['talep_sahibi', 'koordinator', 'yonetici', 'gm', 'admin'] },
  { id: 'tum-talepler', label: 'Tüm Talepler', icon: FolderOpen, roles: ['koordinator', 'yonetici', 'gm', 'admin'] },
  { id: 'gorevlerim', label: 'Görevlerim', icon: CheckSquare, roles: ['uygulayici', 'koordinator', 'yonetici', 'gm', 'admin'] },
  { id: 'revizeler', label: 'Revizeler', icon: RotateCcw, roles: ['talep_sahibi', 'uygulayici', 'koordinator', 'yonetici', 'gm', 'admin'] },
  { id: 'onaylar', label: 'Onaylar', icon: CheckCircle, roles: ['talep_sahibi', 'yonetici', 'gm', 'admin'] },
  { id: 'raporlar', label: 'Raporlar', icon: BarChart3, roles: ['koordinator', 'yonetici', 'gm', 'admin'] },
];

// Yönetim menüsü (sadece admin ve gm)
const managementMenuItems: MenuItem[] = [
  { id: 'departman-yonetimi', label: 'Departmanlar', icon: Building2, roles: ['gm', 'admin'] },
  { id: 'rol-yonetimi', label: 'Roller', icon: Shield, roles: ['gm', 'admin'] },
  { id: 'is-turu-yonetimi', label: 'İş Türleri', icon: Wrench, roles: ['gm', 'admin'] },
  { id: 'kullanici-yonetimi', label: 'Kullanıcılar', icon: Users, roles: ['gm', 'admin'] },
  { id: 'ayarlar', label: 'Ayarlar', icon: Settings, roles: ['yonetici', 'gm', 'admin'] },
  { id: 'yardim', label: 'Yardım', icon: HelpCircle, roles: ['talep_sahibi', 'uygulayici', 'koordinator', 'yonetici', 'gm', 'admin'] },
  { id: 'hakkinda', label: 'Hakkında', icon: Info, roles: ['talep_sahibi', 'uygulayici', 'koordinator', 'yonetici', 'gm', 'admin'] },
];

export function Sidebar() {
  const { currentUser, currentView, setCurrentView, setSelectedRequestId, setSelectedTaskId, approvals, requests } = useStore();
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuClick = (menuId: string) => {
    setCurrentView(menuId);
    setSelectedRequestId(null);
    setSelectedTaskId(null);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Bugün gelen yeni talepleri hesapla
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayNewRequests = requests.filter(r => {
    const created = new Date(r.createdAt);
    return created.toDateString() === today.toDateString() && r.status === 'NEW';
  }).length;

  // Bugün deadline olan görevleri hesapla
  const todayDeadlines = requests.filter(r => {
    if (r.status === 'CMP' || r.status === 'CAN' || r.status === 'PUB') return false;
    return r.targetDate === todayStr;
  }).length;

  const visibleMenuItems = menuItems.filter(item => 
    item.roles.includes(currentUser.role)
  );

  const visibleManagementItems = managementMenuItems.filter(item => 
    item.roles.includes(currentUser.role)
  );

  const pendingApprovals = approvals.filter(a => a.status === 'bekliyor').length;
  
  // Kullanıcıya özel bildirimleri hesapla
  const userTasks = requests.filter(r => 
    r.assignedTo === currentUser.id && 
    r.status !== 'CMP' && 
    r.status !== 'CAN' && 
    r.status !== 'PUB'
  ).length;
  
  // Kullanıcının onaylaması gereken talepler
  const userPendingApprovals = approvals.filter(a => 
    a.status === 'bekliyor' && 
    (currentUser.role === 'gm' || currentUser.role === 'yonetici' || currentUser.role === 'admin')
  ).length;
  
  // Kullanıcının revize etmesi gereken talepler
  const userRevisions = requests.filter(r => 
    r.status === 'RVZ' && 
    r.requesterId === currentUser.id
  ).length;

  const getBadgeCount = (itemId: string) => {
    if (itemId === 'onaylar') return pendingApprovals;
    if (itemId === 'dagitilacak-gorevler') return todayNewRequests;
    if (itemId === 'bitirilecek-gorevler') return todayDeadlines;
    return undefined;
  };
  
  // Toplam bildirim sayısı (çan ikonu için)
  const totalNotifications = userTasks + userPendingApprovals + userRevisions + todayDeadlines;

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <Hotel className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">HMTRMS</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-medium text-primary-foreground">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
              <span className="text-sm">{currentUser.name.split(' ')[0]}</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-muted-foreground hover:text-foreground"
            onClick={() => handleMenuClick('bildirimler')}
          >
            <Bell className="w-5 h-5" />
            {totalNotifications > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-destructive text-[10px] animate-pulse">
                {totalNotifications > 9 ? '9+' : totalNotifications}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto scrollbar-hide">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const badgeCount = getBadgeCount(item.id);
          
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                ${isActive 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left text-sm">{item.label}</span>
              {badgeCount && badgeCount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0 flex-shrink-0 min-w-[1.25rem] text-center">
                  {badgeCount}
                </Badge>
              )}
            </button>
          );
        })}

        {/* Yönetim Menüsü */}
        {visibleManagementItems.length > 0 && (
          <>
            <div className="pt-4 pb-2">
              <div className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Yönetim
              </div>
            </div>
            {visibleManagementItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                </button>
              );
            })}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border/50 flex-shrink-0 space-y-1">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1 text-left">Çıkış Yap</span>
        </button>
        <div className="px-3 py-1 text-xs text-muted-foreground text-center">
          HMTRMS v1.0
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3 flex items-center justify-between safe-area-top">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="text-foreground -ml-2"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
          <div className="flex items-center gap-2">
            <Hotel className="w-5 h-5 text-primary" />
            <span className="font-bold text-base">HMTRMS</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-medium text-primary-foreground">
            {currentUser.name.charAt(0)}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-[280px] bg-card border-r border-border/50
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-14 flex-shrink-0 safe-area-top" />
    </>
  );
}
