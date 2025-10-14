import { useState, useEffect } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MapPin, Calendar, Package, Settings, ChevronLeft, Menu, Briefcase, Users, Flag, Mail, Quote, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const adminMenuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Home Content", url: "/admin/home-content", icon: Settings },
  { title: "Organizers", url: "/admin/organizers", icon: Users },
  { title: "Venues", url: "/admin/venues", icon: MapPin },
  { title: "Events", url: "/admin/events", icon: Calendar },
  { title: "Services", url: "/admin/services", icon: Briefcase },
  { title: "Orders", url: "/admin/orders", icon: Package },
  { title: "Blog Posts", url: "/admin/blog", icon: BookOpen },
  { title: "Newsletter", url: "/admin/newsletter", icon: Mail },
  { title: "Reports", url: "/admin/reports", icon: Flag },
  { title: "Contacts", url: "/admin/contacts", icon: Mail },
  { title: "Testimonials", url: "/admin/testimonials", icon: Quote },
];

function AdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold px-4 py-6">
            {!isCollapsed && "Admin Panel"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={
                          isActive
                            ? "bg-muted text-primary font-medium"
                            : "hover:bg-muted/50"
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          <Link to="/">
            <Button variant="outline" className="w-full" size="sm">
              <ChevronLeft className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Back to Site</span>}
            </Button>
          </Link>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

const AdminLayout = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const initializeAdmin = async () => {
      // Wait for auth to fully load
      if (authLoading) {
        return;
      }
      
      if (!user) {
        console.log('No user found, redirecting to login');
        toast({
          title: "Authentication Required",
          description: "Please sign in to access the admin panel.",
          variant: "destructive",
        });
        navigate('/auth?tab=login', { replace: true });
        setLoading(false);
        return;
      }
      
      console.log('User found, checking admin status for:', user.email);
      await checkAdminStatus();
    };

    initializeAdmin();
  }, [user, authLoading]);

  const checkAdminStatus = async () => {
    try {
      console.log('Checking admin status for user ID:', user?.id);
      
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .eq('role', 'admin')
        .maybeSingle();

      console.log('Role check result:', { roleData, roleError });

      if (roleError && roleError.code !== 'PGRST116') {
        console.error('Role query error:', roleError);
        throw roleError;
      }

      if (!roleData) {
        console.log('No admin role found for user');
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      console.log('Admin access granted');
      setIsAdmin(true);
    } catch (error: any) {
      console.error('Error checking admin status:', error);
      toast({
        title: "Error",
        description: "Failed to verify admin status.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-4 text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      <Helmet>
        <title>Admin Panel | ZimEventPro</title>
      </Helmet>

      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebar />
          
          <main className="flex-1 overflow-auto">
            <header className="sticky top-0 z-10 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-16 items-center gap-4 px-6">
                <SidebarTrigger>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SidebarTrigger>
                <div className="flex-1">
                  <h1 className="text-lg font-semibold">Admin Panel</h1>
                </div>
              </div>
            </header>
            
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>
  );
};

export default AdminLayout;
