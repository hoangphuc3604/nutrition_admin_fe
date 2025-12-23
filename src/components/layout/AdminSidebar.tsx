import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UtensilsCrossed, 
  Carrot, 
  BarChart3, 
  Settings,
  LogOut,
  ChefHat,
  Menu,
  X,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebarStore';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/api/auth.api';

const mainNavItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { title: 'Users', icon: Users, path: '/users' },
  { title: 'Recipes', icon: UtensilsCrossed, path: '/recipes' },
  { title: 'Ingredients', icon: Carrot, path: '/ingredients' },
];

const secondaryNavItems = [
  { title: 'Reports', icon: BarChart3, path: '/reports' },
  { title: 'Gmail Auth', icon: Mail, path: '/gmail-auth' },
  { title: 'Settings', icon: Settings, path: '/settings' },
];

export function AdminSidebar() {
  const { isCollapsed, isMobileOpen, toggleCollapsed, setMobileOpen } = useSidebarStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => (
    <NavLink
      to={item.path}
      onClick={() => setMobileOpen(false)}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
        isActive(item.path)
          ? "bg-primary text-primary-foreground shadow-md"
          : "text-sidebar-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      {!isCollapsed && <span>{item.title}</span>}
    </NavLink>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center px-4 py-6 border-b border-sidebar-border">
        {isCollapsed ? (
          /* When collapsed: show toggle button in center (replacing ChefHat) */
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hidden lg:flex"
            onClick={toggleCollapsed}
          >
            <Menu className="h-5 w-5" />
          </Button>
        ) : (
          /* When expanded: show logo + text on left, toggle on right */
          <>
            <div className="flex items-center gap-3 flex-1">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Smart Meal</h1>
                <p className="text-xs text-muted-foreground">Admin Dashboard</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hidden lg:flex flex-shrink-0"
              onClick={toggleCollapsed}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </div>

        <div className="pt-6">
          {!isCollapsed && (
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Analytics
            </p>
          )}
          <div className="space-y-1">
            {secondaryNavItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        </div>
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border">
        <button 
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full",
            "text-destructive hover:bg-destructive/10 transition-colors"
          )}>
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border z-40 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {sidebarContent}
      </aside>
    </>
  );
}
