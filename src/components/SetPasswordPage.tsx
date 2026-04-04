import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function SetPasswordPage() {
  const { setNewPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checks = [
    { ok: password.length >= 8, label: 'En az 8 karakter' },
    { ok: /[A-Z]/.test(password), label: 'En az 1 büyük harf' },
    { ok: /[0-9]/.test(password), label: 'En az 1 rakam' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    if (checks.some(c => !c.ok)) {
      setError('Şifre gereksinimlerini karşılamalıdır.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error } = await setNewPassword(password);
    if (error) {
      setError('Şifre belirlenemedi. Lütfen tekrar deneyin.');
      toast.error('Hata oluştu');
    } else {
      toast.success('Şifreniz başarıyla belirlendi, giriş yapılıyor…');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary p-3 rounded-2xl shadow-lg">
              <Building2 className="w-9 h-9 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Şifrenizi Belirleyin</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Hesabınız aktive edildi. Giriş için yeni şifrenizi oluşturun.
          </p>
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Yeni Şifre</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="En az 8 karakter"
                    className="pl-9"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    autoFocus
                  />
                </div>
              </div>

              {/* Şifre kriterleri */}
              {password && (
                <div className="space-y-1 px-1">
                  {checks.map(({ ok, label }) => (
                    <div
                      key={label}
                      className={`flex items-center gap-2 text-xs transition-colors ${ok ? 'text-green-500' : 'text-muted-foreground'}`}
                    >
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                      {label}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="confirm">Şifre Tekrar</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="Şifrenizi tekrar girin"
                    className="pl-9"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Kaydediliyor…' : 'Şifremi Belirle ve Giriş Yap'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
