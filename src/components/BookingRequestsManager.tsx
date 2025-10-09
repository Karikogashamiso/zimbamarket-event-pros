import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Phone, 
  Calendar,
  MessageSquare,
  User,
  DollarSign
} from 'lucide-react';
import { useBookingRequests } from '@/hooks/useBookingRequests';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BookingRequestsManagerProps {
  // No props needed - automatically uses authenticated user
}

export const BookingRequestsManager = () => {
  const { requests, loading, updateRequestStatus } = useBookingRequests();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [customPrice, setCustomPrice] = useState('');
  const { toast } = useToast();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
    setShowDetailsDialog(true);
  };

  const handleApproveClick = (request: any) => {
    setSelectedRequest(request);
    setCustomPrice(''); // Reset price
    setShowPriceDialog(true);
  };

  const handleApproveWithPrice = async (useCustomPrice: boolean) => {
    if (!selectedRequest) return;
    
    try {
      let priceToSet = null;
      
      if (useCustomPrice) {
        const price = parseFloat(customPrice);
        if (isNaN(price) || price <= 0) {
          toast({
            title: "Invalid Price",
            description: "Please enter a valid price",
            variant: "destructive",
          });
          return;
        }
        priceToSet = price;
      } else {
        // Use base price from service
        // Fetch the service to get base price
        const { data: service } = await supabase
          .from('services')
          .select('price_from')
          .eq('id', selectedRequest.service_id)
          .single();
        
        if (!service?.price_from) {
          toast({
            title: "No Base Price",
            description: "Service has no base price. Please set a custom price.",
            variant: "destructive",
          });
          return;
        }
        priceToSet = service.price_from;
      }

      // Update booking with approved status and price
      const { error } = await supabase
        .from('booking_requests')
        .update({ 
          status: 'approved',
          total_amount: priceToSet
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Booking approved with price $${priceToSet}`,
      });

      setShowPriceDialog(false);
      setShowDetailsDialog(false);
      window.location.reload();
    } catch (error: any) {
      console.error('Error approving booking:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve booking",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (requestId: string) => {
    await updateRequestStatus(requestId, 'rejected');
    setShowDetailsDialog(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <>
      <div className="space-y-6">
        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Requests</span>
              <Badge variant="secondary">{pendingRequests.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No pending requests</p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {request.user_id && request.profiles
                              ? `${request.profiles.first_name} ${request.profiles.last_name}`
                              : request.guest_name || 'Guest User'}
                          </span>
                          {getStatusBadge(request.status)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {request.guest_email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {request.guest_email}
                            </div>
                          )}
                          {request.guest_phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {request.guest_phone}
                            </div>
                          )}
                        </div>

                        {request.event_date && (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span>{new Date(request.event_date).toLocaleDateString()}</span>
                          </div>
                        )}

                        {request.message && (
                          <div className="flex items-start gap-1 text-sm">
                            <MessageSquare className="w-3 h-3 text-muted-foreground mt-1" />
                            <span className="text-muted-foreground line-clamp-2">{request.message}</span>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </p>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(request)}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleApproveClick(request)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleReject(request.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Processed Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Request History</CardTitle>
          </CardHeader>
          <CardContent>
            {processedRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No processed requests</p>
            ) : (
              <div className="space-y-3">
                {processedRequests.slice(0, 10).map((request) => (
                  <div 
                    key={request.id} 
                    className="border rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleViewDetails(request)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <p className="font-medium">
                            {request.user_id && request.profiles
                              ? `${request.profiles.first_name} ${request.profiles.last_name}`
                              : request.guest_name || 'Guest User'}
                          </p>
                        </div>
                        {request.guest_email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {request.guest_email}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {getStatusBadge(request.status)}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {request.event_date && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(request.event_date).toLocaleDateString()}
                        </div>
                      )}
                      
                      {request.total_amount && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="w-3 h-3" />
                          ${request.total_amount}
                        </div>
                      )}
                    </div>

                    {request.message && (
                      <div className="mt-2 text-sm text-muted-foreground line-clamp-1">
                        <MessageSquare className="w-3 h-3 inline mr-1" />
                        {request.message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Request Details</DialogTitle>
            <DialogDescription>
              Review the complete booking request information
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p className="text-muted-foreground">
                    {selectedRequest.user_id && selectedRequest.profiles
                      ? `${selectedRequest.profiles.first_name} ${selectedRequest.profiles.last_name}`
                      : selectedRequest.guest_name || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-muted-foreground">{selectedRequest.guest_email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p className="text-muted-foreground">{selectedRequest.guest_phone || 'N/A'}</p>
                </div>
                {selectedRequest.event_date && (
                  <div>
                    <label className="text-sm font-medium">Event Date</label>
                    <p className="text-muted-foreground">
                      {new Date(selectedRequest.event_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedRequest.total_amount && (
                  <div>
                    <label className="text-sm font-medium">Amount</label>
                    <p className="text-muted-foreground">${selectedRequest.total_amount}</p>
                  </div>
                )}
              </div>

              {selectedRequest.message && (
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <p className="text-muted-foreground mt-1 p-3 bg-muted rounded-md">
                    {selectedRequest.message}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                {selectedRequest.status === 'pending' && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => handleReject(selectedRequest.id)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                    <Button 
                      onClick={() => handleApproveClick(selectedRequest)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Price Approval Dialog */}
      <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Booking & Set Price</DialogTitle>
            <DialogDescription>
              Set the price for this booking request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded p-4">
                <p className="text-sm font-medium mb-2">Service Details</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest.services?.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Event Date: {new Date(selectedRequest.event_date).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-3">
                <Label>Choose Pricing Option</Label>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto py-3"
                  onClick={() => handleApproveWithPrice(false)}
                >
                  <div className="text-left">
                    <div className="font-semibold flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Use Base Price
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Use the service's standard pricing
                    </div>
                  </div>
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-price">Set Custom Price</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="custom-price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Enter amount"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Button 
                      onClick={() => handleApproveWithPrice(true)}
                      disabled={!customPrice}
                    >
                      Set & Approve
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
