import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Key, Trash2, Ban, Copy, Check, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiKeysApi, ApiKey, CreateApiKeyRequest } from '@/api/api_keys.api';
import { format } from 'date-fns';

export function ApiKeysPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateApiKeyRequest>({
    name: '',
    description: '',
  });

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: apiKeysApi.getAllKeys,
  });

  const createMutation = useMutation({
    mutationFn: apiKeysApi.generateKey,
    onSuccess: (response) => {
      setGeneratedKey(response.rawKey);
      setCreateForm({ name: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({
        title: 'Success',
        description: 'API key generated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to generate API key',
        variant: 'destructive',
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => apiKeysApi.revokeKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({
        title: 'Success',
        description: 'API key revoked successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to revoke API key',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => apiKeysApi.deleteKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      toast({
        title: 'Success',
        description: 'API key deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete API key',
        variant: 'destructive',
      });
    },
  });

  const handleCreate = () => {
    if (!createForm.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name is required',
        variant: 'destructive',
      });
      return;
    }
    createMutation.mutate(createForm);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: 'Copied',
      description: 'API key copied to clipboard',
    });
  };

  const getStatusBadge = (apiKey: ApiKey) => {
    if (!apiKey.isActive) {
      return <Badge variant="secondary">Revoked</Badge>;
    }

    const now = new Date();
    const expiresAt = new Date(apiKey.expiresAt);

    if (expiresAt <= now) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 30) {
      return <Badge variant="outline" className="text-orange-600">Expires soon</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for server-to-server communication
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Generate API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Generate New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key for server-to-server authentication. The key will be shown only once.
              </DialogDescription>
            </DialogHeader>

            {!generatedKey ? (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., meal_plan_server"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    The API key will be valid for 1 year and can only be viewed once after creation.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="grid gap-4 py-4">
                <Alert>
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    API key generated successfully! Copy it now - it won't be shown again.
                  </AlertDescription>
                </Alert>
                <div className="grid gap-2">
                  <Label>API Key</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <code className="flex-1 text-sm break-all">{generatedKey}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyKey(generatedKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              {!generatedKey ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setCreateForm({ name: '', description: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? 'Generating...' : 'Generate'}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setGeneratedKey(null);
                    setCreateForm({ name: '', description: '' });
                  }}
                >
                  Done
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Manage API keys for external server authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage Count</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys?.map((apiKey: ApiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell>{apiKey.description || '-'}</TableCell>
                    <TableCell>{getStatusBadge(apiKey)}</TableCell>
                    <TableCell>{apiKey.usageCount}</TableCell>
                    <TableCell>
                      {apiKey.lastUsed ? format(new Date(apiKey.lastUsed), 'MMM dd, yyyy HH:mm') : 'Never'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(apiKey.expiresAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {apiKey.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeMutation.mutate({ id: apiKey.id })}
                            disabled={revokeMutation.isPending}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate({ id: apiKey.id })}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!apiKeys || apiKeys.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No API keys found. Create your first key to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
