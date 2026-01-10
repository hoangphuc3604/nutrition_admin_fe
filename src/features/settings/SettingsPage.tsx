import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/api/auth.api';

export function SettingsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <AdminLayout title={t('settings.pageTitle')}>
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>{t('settings.profile')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First Name</Label><Input defaultValue="Admin" /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input defaultValue="User" /></div>
            </div> */}
            <div className="space-y-2"><Label>{t('settings.email')}</Label><Input defaultValue={user.email} /></div>
            <Button>{t('common.saveChanges')}</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t('settings.notifications.title')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label>{t('settings.notifications.email')}</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>{t('settings.notifications.newUser')}</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>{t('settings.notifications.weeklyReport')}</Label><Switch /></div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
