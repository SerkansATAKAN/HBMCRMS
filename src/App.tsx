import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { StoreProvider, useStore } from '@/hooks/useStore';
import { LoginPage } from '@/components/LoginPage';
import { SetPasswordPage } from '@/components/SetPasswordPage';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { YeniTalepForm } from '@/components/YeniTalepForm';
import { TumTalepler } from '@/components/TumTalepler';
import { TalepDetay } from '@/components/TalepDetay';
import { Gorevlerim } from '@/components/Gorevlerim';
import { Onaylar } from '@/components/Onaylar';
import { Raporlar } from '@/components/Raporlar';
import { AcikIsler } from '@/components/AcikIsler';
import { Revizeler } from '@/components/Revizeler';
import { IsTanimla } from '@/components/IsTanimla';
import { DagitilacakGorevler } from '@/components/DagitilacakGorevler';
import { BitirilecekGorevler } from '@/components/BitirilecekGorevler';
import { Hakkinda } from '@/components/Hakkinda';
import { DepartmanYonetimi } from '@/components/DepartmanYonetimi';
import { RolYonetimi } from '@/components/RolYonetimi';
import { IsTuruYonetimi } from '@/components/IsTuruYonetimi';
import { KullaniciYonetimi } from '@/components/KullaniciYonetimi';
import { Bildirimler } from '@/components/Bildirimler';
import { Yardim } from '@/components/Yardim';
import { Ayarlar } from '@/components/Ayarlar';
import { Toaster } from '@/components/ui/sonner';

function MainContent() {
  const { currentView } = useStore();

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'is-tanimla':
        return <IsTanimla />;
      case 'dagitilacak-gorevler':
        return <DagitilacakGorevler />;
      case 'bitirilecek-gorevler':
        return <BitirilecekGorevler />;
      case 'yeni-talep':
        return <YeniTalepForm />;
      case 'tum-talepler':
        return <TumTalepler />;
      case 'talep-detay':
        return <TalepDetay />;
      case 'gorev-detay':
        return <TalepDetay />;
      case 'gorevlerim':
        return <Gorevlerim />;
      case 'onaylar':
        return <Onaylar />;
      case 'raporlar':
        return <Raporlar />;
      case 'acik-isler':
        return <AcikIsler />;
      case 'revizeler':
        return <Revizeler />;
      case 'hakkinda':
        return <Hakkinda />;
      case 'departman-yonetimi':
        return <DepartmanYonetimi />;
      case 'rol-yonetimi':
        return <RolYonetimi />;
      case 'is-turu-yonetimi':
        return <IsTuruYonetimi />;
      case 'kullanici-yonetimi':
        return <KullaniciYonetimi />;
      case 'bildirimler':
        return <Bildirimler />;
      case 'yardim':
        return <Yardim />;
      case 'ayarlar':
        return <Ayarlar />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <main className="flex-1 overflow-auto bg-background min-h-screen">
      <div className="p-4 lg:p-6">
        {renderContent()}
      </div>
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { currentUser, isLoading, needsPasswordSet } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground text-sm">Yükleniyor…</p>
        </div>
      </div>
    );
  }

  if (needsPasswordSet) return <SetPasswordPage />;
  if (!currentUser) return <LoginPage />;

  return (
    <StoreProvider currentUser={currentUser}>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <MainContent />
      </div>
      <Toaster />
    </StoreProvider>
  );
}

export default App;
