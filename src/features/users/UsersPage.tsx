import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreHorizontal, Edit, Trash2, Ban, CheckCircle, Shield } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { useUsers, useUpdateUserRoles, useUpdateUserStatus } from '@/api/users.api';
import { useAuthStore } from '@/stores/authStore';
import { UserRole, RoleLabels, getRoleVariant } from '@/enum/role.enum';
import { EditUserRolesDialog } from './components/EditUserRolesDialog';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<{ id: string; email: string; roles: UserRole[] } | null>(null);
  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const navigate = useNavigate();
  const { toast } = useToast();
  const updateUserRolesMutation = useUpdateUserRoles();
  const updateUserStatusMutation = useUpdateUserStatus();
  const { t } = useTranslation();

  const queryParams = useMemo(() => {
    const params: { page: number; limit: number; search?: string; status?: string; role?: string } = {
      page,
      limit: 10,
    };
    
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }
    
    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }
    
    if (roleFilter !== 'all') {
      params.role = roleFilter;
    }
    
    return params;
  }, [page, searchQuery, statusFilter, roleFilter]);

  const { data, isLoading, error } = useUsers(queryParams);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setRoleFilter('all');
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleEditRoles = (user: { id: string; email: string; roles: UserRole[] }) => {
    setEditingUser(user);
  };

  const handleSaveRoles = async (userId: string, roles: UserRole[]) => {
    try {
      const result = await updateUserRolesMutation.mutateAsync({ id: userId, roles });
      setEditingUser(null);
      toast({
        title: t('users.updateSuccess'),
        description: result.message,
        variant: "default",
        className: "bg-green-500 text-white border-none",
      });
    } catch (error: any) {
      toast({
        title: t('users.updateFailed'),
        description: error.message || t('users.updateRolesFailed'),
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      const result = await updateUserStatusMutation.mutateAsync({ id: userId, status: newStatus });
      toast({
        title: t('users.updateSuccess'),
        description: result.message,
        variant: "default",
        className: "bg-green-500 text-white border-none",
      });
    } catch (error: any) {
      toast({
        title: t('users.updateFailed'),
        description: error.message || t('users.updateStatusFailed'),
        variant: "destructive",
      });
    }
  };


  return (
    <AdminLayout title={t('users.title')}>
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">{t('users.management')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-secondary/50 rounded-xl">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">{t('users.filterBy')}</span>
            </div>

            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-36 bg-card">
                <SelectValue placeholder={t('users.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('users.allStatus')}</SelectItem>
                <SelectItem value="active">{t('users.active')}</SelectItem>
                <SelectItem value="banned">{t('users.banned')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
              <SelectTrigger className="w-36 bg-card">
                <SelectValue placeholder={t('users.role')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('users.allRoles')}</SelectItem>
                <SelectItem value={UserRole.USER}>{t(`roles.${UserRole.USER}`)}</SelectItem>
                <SelectItem value={UserRole.ADMIN}>{t(`roles.${UserRole.ADMIN}`)}</SelectItem>
                <SelectItem value={UserRole.MODERATOR}>{t(`roles.${UserRole.MODERATOR}`)}</SelectItem>
                <SelectItem value={UserRole.GUEST}>{t(`roles.${UserRole.GUEST}`)}</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" onClick={resetFilters} className="text-destructive hover:text-destructive">
              {t('users.resetFilter')}
            </Button>

            <div className="relative ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('users.searchUsers')}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 w-64 bg-card"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">{t('users.table.id')}</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">{t('users.table.email')}</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">{t('users.table.created')}</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">{t('users.table.roles')}</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">{t('users.table.status')}</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">{t('users.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-sm text-muted-foreground">
                      {t('users.loading')}
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-sm text-destructive">
                      {t('users.loadFailed')}
                    </td>
                  </tr>
                ) : data?.users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-sm text-muted-foreground">
                      {t('users.noUsers')}
                    </td>
                  </tr>
                ) : (
                  data?.users.map((user) => {
                    const roles = user.roles || [];
                    const isCurrentUser = currentUser?.id === user.id;
                    return (
                      <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4 text-sm text-muted-foreground">{user.id.slice(0, 8)}...</td>
                        <td className="py-4 px-4 text-sm font-medium text-foreground">
                          {user.email}
                          {isCurrentUser && <span className="text-muted-foreground text-xs ml-2">{t('users.you')}</span>}
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">{formatDate(user.createdAt)}</td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {roles.length > 0 ? (
                              roles.map((role) => (
                                <Badge
                                  key={role}
                                  variant={getRoleVariant(role)}
                                  className="capitalize"
                                >
                                  {role}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="secondary" className="capitalize">
                                {t('roles.user')}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={cn(
                            "capitalize",
                            user.status === 'active' 
                              ? "bg-success/10 text-success hover:bg-success/20" 
                              : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                          )}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => navigate(`/users/${user.id}`)}
                              >
                                <Edit className="h-4 w-4" /> {t('users.viewDetails')}
                              </DropdownMenuItem>
                              {isAdmin && (
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => handleEditRoles({
                                    id: user.id,
                                    email: user.email,
                                    roles: roles.length > 0 ? roles as UserRole[] : [UserRole.USER]
                                  })}
                                >
                                  <Shield className="h-4 w-4" /> {t('users.editRoles')}
                                </DropdownMenuItem>
                              )}
                              {isAdmin && (
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => handleUpdateStatus(user.id, user.status === 'active' ? 'banned' : 'active')}
                                >
                                  {user.status === 'active' ? (
                                    <><Ban className="h-4 w-4" /> {t('users.banUser')}</>
                                  ) : (
                                    <><CheckCircle className="h-4 w-4" /> {t('users.activate')}</>
                                  )}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="gap-2 text-destructive">
                                <Trash2 className="h-4 w-4" /> {t('users.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {data ? (
                <>
                  {t('common.showing')} {((data.pagination.page - 1) * data.pagination.limit) + 1} {t('common.to')}{' '}
                  {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} {t('common.of')}{' '}
                  {data.pagination.total} {t('users.showingUsers')}
                </>
              ) : (
                <span>{t('common.loading')}</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data || data.pagination.page === 1 || isLoading}
              >
                {t('common.previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data || !data.pagination.hasNext || isLoading}
              >
                {t('common.next')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {editingUser && (
        <EditUserRolesDialog
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          userId={editingUser.id}
          userEmail={editingUser.email}
          currentRoles={editingUser.roles}
          onSave={handleSaveRoles}
        />
      )}
    </AdminLayout>
  );
}
