import { CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useGmailStatus, gmailApi } from '@/api/gmail.api';

export function GmailAuthPage() {
  const { data: status, isLoading, error, refetch } = useGmailStatus();

  const handleConnect = () => {
    gmailApi.authorize();
  };

  return (
    <AdminLayout title="Gmail Integration">
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-2xl font-bold">Gmail API Connection</CardTitle>
            <Button 
              onClick={handleConnect} 
              className="gap-2"
              variant={status?.isAuthenticated ? "outline" : "default"}
            >
              <ExternalLink className="h-4 w-4" />
              {status?.isAuthenticated ? 'Reconnect / Switch Account' : 'Connect Gmail Account'}
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
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to load Gmail connection status. Please try again.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Connection Status</p>
                    <div className="flex items-center gap-2">
                      {status?.isAuthenticated ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="font-medium text-green-600">Connected</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span className="font-medium text-red-600">Not Connected</span>
                        </>
                      )}
                    </div>
                  </div>
                  {status?.isAuthenticated && status.email && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-muted-foreground">Connected Account</p>
                      <p className="font-medium">{status.email}</p>
                    </div>
                  )}
                </div>

                {status?.isAuthenticated && status.expiresAt && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="h-4 w-4" />
                    <span>Token expires at: {new Date(status.expiresAt).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t">
                  <Button variant="ghost" onClick={() => refetch()} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh Status
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Alert>
          <AlertTitle>Note</AlertTitle>
          <AlertDescription>
            The Gmail API token needs to be refreshed periodically. If the system fails to send emails, please check the connection status here and reconnect if necessary.
          </AlertDescription>
        </Alert>
      </div>
    </AdminLayout>
  );
}
