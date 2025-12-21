import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/api/auth.api';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Profile Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First Name</Label><Input defaultValue="Admin" /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input defaultValue="User" /></div>
            </div> */}
            <div className="space-y-2"><Label>Email</Label><Input defaultValue={user.email} /></div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label>Email notifications</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>New user alerts</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>Weekly reports</Label><Switch /></div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
