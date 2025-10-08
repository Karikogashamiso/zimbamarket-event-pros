import { useState, useEffect } from "react";
import { Calendar, MapPin, Package, Users, TrendingUp, DollarSign, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { BusinessApplicationsManager } from "@/components/Admin/BusinessApplicationsManager";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVenues: 0,
    totalEvents: 0,
    totalOrders: 0,
    totalRevenue: 0,
    publishedEvents: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch venues count
      const { count: venuesCount } = await supabase
        .from('venues')
        .select('*', { count: 'exact', head: true });

      // Fetch events stats
      const { data: eventsData } = await supabase
        .from('events')
        .select('is_published');
      
      const totalEvents = eventsData?.length || 0;
      const publishedEvents = eventsData?.filter(e => e.is_published).length || 0;

      // Fetch orders stats
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount, booking_status');

      const totalOrders = ordersData?.length || 0;
      const pendingOrders = ordersData?.filter(o => o.booking_status === 'pending').length || 0;
      const totalRevenue = ordersData?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;

      setStats({
        totalVenues: venuesCount || 0,
        totalEvents,
        totalOrders,
        totalRevenue,
        publishedEvents,
        pendingOrders,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const statCards = [
    {
      title: "Total Venues",
      value: stats.totalVenues,
      icon: MapPin,
      description: "Active venues",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Events",
      value: stats.totalEvents,
      icon: Calendar,
      description: `${stats.publishedEvents} published`,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: Package,
      description: `${stats.pendingOrders} pending`,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      description: "All time revenue",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">Manage your platform and business applications</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Business Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/admin/venues" className="block p-4 hover:bg-muted rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Manage Venues</p>
                  <p className="text-sm text-muted-foreground">Add or edit venue information</p>
                </div>
              </div>
            </a>
            <a href="/admin/events" className="block p-4 hover:bg-muted rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Manage Events</p>
                  <p className="text-sm text-muted-foreground">Create and publish events</p>
                </div>
              </div>
            </a>
            <a href="/admin/orders" className="block p-4 hover:bg-muted rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">View Orders</p>
                  <p className="text-sm text-muted-foreground">Monitor bookings and tickets</p>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>Activity feed coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="applications">
          <BusinessApplicationsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
