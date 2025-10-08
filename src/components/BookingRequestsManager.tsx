import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Phone, 
  Calendar,
  MessageSquare,
  User
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

interface BookingRequestsManagerProps {
  organizerId?: string;
}

export const BookingRequestsManager = ({ organizerId }: BookingRequestsManagerProps) => {
  const { requests, loading, updateRequestStatus } = useBookingRequests(organizerId);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

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

  const handleApprove = async (requestId: string) => {
    await updateRequestStatus(requestId, 'approved');
    setShowDetailsDialog(false);
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
                            {request.guest_name || 'Guest User'}
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
                          onClick={() => handleApprove(request.id)}
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
                  <div key={request.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex-1">
                      <p className="font-medium">{request.guest_name || 'Guest User'}</p>
                      <p className="text-sm text-muted-foreground">{request.guest_email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </span>
                      {getStatusBadge(request.status)}
                    </div>
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
                  <p className="text-muted-foreground">{selectedRequest.guest_name || 'N/A'}</p>
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
                      onClick={() => handleApprove(selectedRequest.id)}
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
    </>
  );
};
