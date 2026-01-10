import { CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useGmailStatus, gmailApi } from '@/api/gmail.api';

export function GmailAuthPage() {
  const { t } = useTranslation();
  const { data: status, isLoading, error, refetch } = useGmailStatus();

  const handleConnect = () => {
    gmailApi.authorize();
  };

  return (
    <AdminLayout title={t('gmail.title')}>
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-2xl font-bold">{t('gmail.connectionMethods')}</CardTitle>
            <Button 
              onClick={handleConnect} 
              className="gap-2"
              variant={status?.isAuthenticated ? "outline" : "default"}
            >
              <ExternalLink className="h-4 w-4" />
              {status?.isAuthenticated ? t('gmail.reconnect') : t('gmail.connect')}
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>{t('common.error')}</AlertTitle>
                <AlertDescription>
                  {t('gmail.errorLoading')}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">{t('gmail.status')}</p>
                    <div className="flex items-center gap-2">
                      {status?.isAuthenticated ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="font-medium text-green-600">{t('gmail.connected')}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span className="font-medium text-red-600">{t('gmail.notConnected')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {status?.isAuthenticated && status.email && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-muted-foreground">{t('gmail.connectedAccount')}</p>
                      <p className="font-medium">{status.email}</p>
                    </div>
                  )}
                </div>

                {status?.isAuthenticated && status.expiresAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="h-4 w-4" />
                    <span>{t('gmail.tokenExpires')}: {new Date(status.expiresAt).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t">
                  <Button variant="ghost" onClick={() => refetch()} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    {t('gmail.refresh')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Alert>
          <AlertTitle>{t('common.note') || 'Note'}</AlertTitle>
          <AlertDescription>
            {t('gmail.description')}
          </AlertDescription>
        </Alert>
      </div>
    </AdminLayout>
  );
}
