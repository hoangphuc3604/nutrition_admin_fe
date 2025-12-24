import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MoreHorizontal, Edit, Trash2, Ban, CheckCircle } from 'lucide-react';
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
import { useUsers } from '@/api/users.api';
import { useAuthStore } from '@/stores/authStore';

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const currentUser = useAuthStore((state) => state.user);
  const navigate = useNavigate();

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

  const getRoleVariant = (role: string): 'default' | 'secondary' => {
    return role === 'admin' ? 'default' : 'secondary';
  };

  return (
    <AdminLayout title="Users">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-secondary/50 rounded-xl">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Filter By</span>
            </div>
            
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-36 bg-card">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
              <SelectTrigger className="w-36 bg-card">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" onClick={resetFilters} className="text-destructive hover:text-destructive">
              Reset Filter
            </Button>

            <div className="relative ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
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
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">ID</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Email</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Created</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Roles</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-sm text-muted-foreground">
                      Loading users...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-sm text-destructive">
                      Failed to load users. Please try again.
                    </td>
                  </tr>
                ) : data?.users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-4 text-center text-sm text-muted-foreground">
                      No users found
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
                          {isCurrentUser && <span className="text-muted-foreground text-xs ml-2">(You)</span>}
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
                                user
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
                                <Edit className="h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                {user.status === 'active' ? (
                                  <><Ban className="h-4 w-4" /> Ban User</>
                                ) : (
                                  <><CheckCircle className="h-4 w-4" /> Activate</>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-destructive">
                                <Trash2 className="h-4 w-4" /> Delete
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
                  Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
                  {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
                  {data.pagination.total} users
                </>
              ) : (
                'Loading...'
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data || data.pagination.page === 1 || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data || !data.pagination.hasNext || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
