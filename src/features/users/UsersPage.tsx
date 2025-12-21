import { useState } from 'react';
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

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'banned';
  createdAt: string;
  mealPlansCount: number;
}

const mockUsers: User[] = [
  { id: '00001', name: 'Christine Brooks', email: 'christine@example.com', role: 'user', status: 'active', createdAt: '14 Feb 2024', mealPlansCount: 12 },
  { id: '00002', name: 'Rosie Pearson', email: 'rosie@example.com', role: 'user', status: 'active', createdAt: '14 Feb 2024', mealPlansCount: 8 },
  { id: '00003', name: 'Darrell Caldwell', email: 'darrell@example.com', role: 'admin', status: 'banned', createdAt: '14 Feb 2024', mealPlansCount: 3 },
  { id: '00004', name: 'Gilbert Johnston', email: 'gilbert@example.com', role: 'user', status: 'active', createdAt: '14 Feb 2024', mealPlansCount: 25 },
  { id: '00005', name: 'Alan Cain', email: 'alan@example.com', role: 'user', status: 'active', createdAt: '14 Feb 2024', mealPlansCount: 5 },
  { id: '00006', name: 'Alfred Murray', email: 'alfred@example.com', role: 'user', status: 'active', createdAt: '14 Feb 2024', mealPlansCount: 18 },
];

export function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setRoleFilter('all');
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
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 bg-card">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-36 bg-card">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-card"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">ID</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Name</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Email</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Created</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Role</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4 text-sm text-muted-foreground">{user.id}</td>
                    <td className="py-4 px-4 text-sm font-medium text-foreground">{user.name}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{user.email}</td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{user.createdAt}</td>
                    <td className="py-4 px-4">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                        {user.role}
                      </Badge>
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
                          <DropdownMenuItem className="gap-2">
                            <Edit className="h-4 w-4" /> Edit
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
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {mockUsers.length} users
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
