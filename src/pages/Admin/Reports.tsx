import { useState, useEffect, useCallback} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Helmet } from "react-helmet-async";
import { Flag, ExternalLink, CheckCircle, XCircle, DollarSign, TrendingUp, ShoppingCart, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<unknown[]>([]);
  const [salesData, setSalesData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalTickets: 0,
    avgOrderValue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<unknown[]>([]);
  const [bookingsSummary, setBookingsSummary] = useState({
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("service_reports")
        .select(`
          *,
          services (
            id,
            title
          ),
          profiles:reported_by_user_id (
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error: unknown) {
      console.error("Error fetching reports:", error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReports();
    fetchSalesData();
    fetchRecentOrders();
    fetchBookingsSummary();
  }, [fetchReports, fetchSalesData, fetchRecentOrders, fetchBookingsSummary]);

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("service_reports")
        .update({
          status: newStatus,
          resolved_by_user_id: newStatus === "resolved" ? (await supabase.auth.getUser()).data.user?.id : null,
          resolved_at: newStatus === "resolved" ? new Date().toISOString() : null,
        })
        .eq("id", reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Report marked as ${newStatus}`,
      });
      fetchReports();
    } catch (error: unknown) {
      console.error("Error updating report:", error);
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive",
      });
    }
  };

  const fetchSalesData = useCallback(async () => {
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("total_amount, id");

      if (error) throw error;

      const { count: ticketsCount, error: ticketsError } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true });

      if (ticketsError) throw ticketsError;

      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const totalOrders = orders?.length || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setSalesData({
        totalRevenue,
        totalOrders,
        totalTickets: ticketsCount || 0,
        avgOrderValue,
      });
    } catch (error: unknown) {
      console.error("Error fetching sales data:", error);
    }
  }, []);

  const fetchRecentOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentOrders(data || []);
    } catch (error: unknown) {
      console.error("Error fetching recent orders:", error);
    }
  }, []);

  const fetchBookingsSummary = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("booking_status");

      if (error) throw error;

      const summary = {
        pending: data?.filter((o) => o.booking_status === "pending").length || 0,
        confirmed: data?.filter((o) => o.booking_status === "confirmed").length || 0,
        completed: data?.filter((o) => o.booking_status === "completed").length || 0,
        cancelled: data?.filter((o) => o.booking_status === "cancelled").length || 0,
      };

      setBookingsSummary(summary);
    } catch (error: unknown) {
      console.error("Error fetching bookings summary:", error);
    }
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "default",
      reviewing: "secondary",
      resolved: "outline",
      dismissed: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <>
      <Helmet>
        <title>Service Reports - Admin | EventBridge</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Sales reports, bookings summary, and reported content
            </p>
          </div>
        </div>

        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sales">Sales Report</TabsTrigger>
            <TabsTrigger value="bookings">Bookings Summary</TabsTrigger>
            <TabsTrigger value="content">Content Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            {/* Sales Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <div className="text-2xl font-bold">
                      {formatCurrency(salesData.totalRevenue)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-blue-600" />
                    <div className="text-2xl font-bold">{salesData.totalOrders}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <div className="text-2xl font-bold">{salesData.totalTickets}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Order Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-600" />
                    <div className="text-2xl font-bold">
                      {formatCurrency(salesData.avgOrderValue)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono">{order.order_number}</TableCell>
                        <TableCell>
                          {order.customer_first_name} {order.customer_last_name}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(order.total_amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.booking_status === "completed"
                                ? "default"
                                : order.booking_status === "cancelled"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {order.booking_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.created_at), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            {/* Bookings Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{bookingsSummary.pending}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Awaiting confirmation
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Confirmed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {bookingsSummary.confirmed}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Active bookings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {bookingsSummary.completed}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Successfully completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cancelled</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {bookingsSummary.cancelled}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Cancelled bookings</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content">

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5" />
              All Reports ({reports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading reports...
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No reports found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reported Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {report.services?.title || "Deleted Service"}
                            </span>
                            {report.service_id && (
                              <Link
                                to={`/service/${report.service_id}`}
                                target="_blank"
                                className="text-primary hover:text-primary/80"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {report.profiles ? (
                            <div className="font-medium">
                              {report.profiles.first_name} {report.profiles.last_name}
                            </div>
                          ) : (
                            <Badge variant="secondary">Guest User</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm line-clamp-2">{report.reason}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell>
                          {format(new Date(report.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {report.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateReportStatus(report.id, "reviewing")
                                  }
                                >
                                  Review
                                </Button>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() =>
                                    updateReportStatus(report.id, "resolved")
                                  }
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Resolve
                                </Button>
                              </>
                            )}
                            {report.status === "reviewing" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() =>
                                    updateReportStatus(report.id, "resolved")
                                  }
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Resolve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    updateReportStatus(report.id, "dismissed")
                                  }
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Dismiss
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Reports;
