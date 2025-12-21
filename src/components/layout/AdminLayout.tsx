import { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebarStore';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <AdminHeader title={title} />
      <main className={cn(
        "transition-all duration-300 p-6",
        isCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}>
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
