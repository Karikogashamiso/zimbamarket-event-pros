import { useState, useEffect, useCallback} from "react";
import { Ticket, RefreshCw, Ban, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TicketData {
  id: string;
  ticket_number: string;
  ticket_status: string;
  created_at: string;
  order_id: string;
  orders: {
    order_number: string;
    customer_first_name: string;
    customer_last_name: string;
    customer_email: string;
    total_amount: number;
    currency: string;
  };
}

const Tickets = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketData | null>(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("tickets")
        .select(`
          *,
          orders (
            order_number,
            customer_first_name,
            customer_last_name,
            customer_email,
            total_amount,
            currency
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error: unknown) {
      console.error("Error fetching tickets:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleRefundRequest = async () => {
    if (!selectedTicket || !refundAmount || !refundReason) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("refund_requests").insert([{
        order_id: selectedTicket.order_id,
        refund_type: "full",
        refund_reason: refundReason,
        refund_amount: parseFloat(refundAmount),
        original_amount: selectedTicket.orders.total_amount,
        currency: selectedTicket.orders.currency as "USD" | "ZWL" | "RTGS",
        status: "pending",
      }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Refund request created successfully",
      });

      setRefundDialogOpen(false);
      setRefundAmount("");
      setRefundReason("");
      setSelectedTicket(null);
      fetchTickets();
    } catch (error: unknown) {
      console.error("Error creating refund:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create refund request",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedTicket || !newStatus) {
      toast({
        title: "Error",
        description: "Please select a status",
        variant: "destructive",
      });
      return;
    }

    try {
      const validStatuses = ["valid", "used", "cancelled", "refunded", "expired"];
      if (!validStatuses.includes(newStatus)) {
        throw new Error("Invalid ticket status");
      }

      const { error } = await supabase
        .from("tickets")
        .update({ ticket_status: newStatus as "valid" | "used" | "cancelled" | "refunded" | "expired" })
        .eq("id", selectedTicket.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ticket status updated successfully",
      });

      setStatusDialogOpen(false);
      setNewStatus("");
      setSelectedTicket(null);
      fetchTickets();
    } catch (error: unknown) {
      console.error("Error updating ticket:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update ticket status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      valid: "default",
      used: "secondary",
      cancelled: "destructive",
      refunded: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const filterTicketsByStatus = (status: string) => {
    if (status === "all") return tickets;
    return tickets.filter((t) => t.ticket_status === status);
  };

  const renderTicketsTable = (filteredTickets: TicketData[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ticket #</TableHead>
          <TableHead>Order #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredTickets.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
              No tickets found
            </TableCell>
          </TableRow>
        ) : (
          filteredTickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell className="font-mono font-medium">{ticket.ticket_number}</TableCell>
              <TableCell className="font-mono">{ticket.orders.order_number}</TableCell>
              <TableCell>
                {ticket.orders.customer_first_name} {ticket.orders.customer_last_name}
              </TableCell>
              <TableCell className="text-sm">{ticket.orders.customer_email}</TableCell>
              <TableCell>{getStatusBadge(ticket.ticket_status)}</TableCell>
              <TableCell className="text-sm">
                {new Date(ticket.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setNewStatus(ticket.ticket_status);
                      setStatusDialogOpen(true);
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Status
                  </Button>
                  {ticket.ticket_status !== "refunded" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setRefundAmount(ticket.orders.total_amount.toString());
                        setRefundDialogOpen(true);
                      }}
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Refund
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ticket Management</h2>
          <p className="text-muted-foreground">Manage ticket statuses and refunds</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Ticket className="w-4 h-4 mr-2" />
          {tickets.length} Total
        </Badge>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({tickets.length})</TabsTrigger>
          <TabsTrigger value="valid">
            Valid ({filterTicketsByStatus("valid").length})
          </TabsTrigger>
          <TabsTrigger value="used">
            Used ({filterTicketsByStatus("used").length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({filterTicketsByStatus("cancelled").length})
          </TabsTrigger>
          <TabsTrigger value="refunded">
            Refunded ({filterTicketsByStatus("refunded").length})
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <>
                <TabsContent value="all" className="m-0">
                  {renderTicketsTable(tickets)}
                </TabsContent>
                <TabsContent value="valid" className="m-0">
                  {renderTicketsTable(filterTicketsByStatus("valid"))}
                </TabsContent>
                <TabsContent value="used" className="m-0">
                  {renderTicketsTable(filterTicketsByStatus("used"))}
                </TabsContent>
                <TabsContent value="cancelled" className="m-0">
                  {renderTicketsTable(filterTicketsByStatus("cancelled"))}
                </TabsContent>
                <TabsContent value="refunded" className="m-0">
                  {renderTicketsTable(filterTicketsByStatus("refunded"))}
                </TabsContent>
              </>
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Refund Request</DialogTitle>
            <DialogDescription>
              Process a refund for ticket {selectedTicket?.ticket_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="refundAmount">Refund Amount</Label>
              <Input
                id="refundAmount"
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="Enter refund amount"
              />
            </div>
            <div>
              <Label htmlFor="refundReason">Reason for Refund</Label>
              <Textarea
                id="refundReason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Explain why this refund is being processed..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRefundRequest}>Create Refund Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Ticket Status</DialogTitle>
            <DialogDescription>
              Change the status for ticket {selectedTicket?.ticket_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tickets;
