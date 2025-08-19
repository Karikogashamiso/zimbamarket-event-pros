import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface BookingUpdate {
  type: string;
  event: string;
  data: any;
  timestamp: string;
  bookingId?: string;
}

interface RealtimeBookingHook {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  subscribeToBooking: (bookingId: string) => void;
  updates: BookingUpdate[];
  lastUpdate: BookingUpdate | null;
}

export const useRealtimeBookings = (): RealtimeBookingHook => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [updates, setUpdates] = useState<BookingUpdate[]>([]);
  const [lastUpdate, setLastUpdate] = useState<BookingUpdate | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    if (!user) return;

    try {
      setConnectionStatus('connecting');
      
      // Connect to realtime booking updates WebSocket
      const wsUrl = `wss://pxpdjfkppgoaygdfmaqr.functions.supabase.co/realtime-booking-updates`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Real-time booking connection established');
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Authenticate with user ID
        if (wsRef.current && user) {
          wsRef.current.send(JSON.stringify({
            type: 'authenticate',
            userId: user.id
          }));
        }

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'heartbeat' }));
          }
        }, 30000); // Every 30 seconds

        toast({
          title: "Real-time Updates Active",
          description: "You'll receive live updates about your bookings",
        });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Real-time booking update:', data);

          // Handle different types of updates
          switch (data.type) {
            case 'booking_update':
            case 'business_booking_update':
            case 'specific_booking_update':
              const update: BookingUpdate = {
                type: data.type,
                event: data.event,
                data: data.data,
                timestamp: data.timestamp,
                bookingId: data.bookingId
              };

              setUpdates(prev => [update, ...prev.slice(0, 49)]); // Keep last 50 updates
              setLastUpdate(update);

              // Show notification for important updates
              if (data.event === 'UPDATE' && data.data?.status) {
                const statusMessages = {
                  'confirmed': 'Your booking has been confirmed!',
                  'cancelled': 'A booking has been cancelled',
                  'pending': 'New booking request received',
                  'completed': 'Booking has been completed'
                };

                const message = statusMessages[data.data.status as keyof typeof statusMessages];
                if (message) {
                  toast({
                    title: "Booking Update",
                    description: message,
                  });
                }
              }
              break;

            case 'connection_established':
            case 'subscriptions_active':
            case 'booking_subscription_active':
              console.log('Connection status:', data.message);
              break;

            case 'error':
              console.error('Real-time error:', data.message);
              toast({
                title: "Connection Error",
                description: data.message,
                variant: "destructive",
              });
              break;

            case 'heartbeat_response':
              // Connection is healthy
              break;

            default:
              console.log('Unknown real-time message:', data);
          }
        } catch (error) {
          console.error('Error parsing real-time message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('Real-time booking connection closed:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Clear heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && event.code !== 1001) {
          setConnectionStatus('connecting');
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 5000); // Reconnect after 5 seconds
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('Real-time booking WebSocket error:', error);
        setConnectionStatus('error');
        
        toast({
          title: "Connection Error",
          description: "Failed to connect to real-time updates",
          variant: "destructive",
        });
      };

    } catch (error) {
      console.error('Failed to establish real-time connection:', error);
      setConnectionStatus('error');
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnect');
      wsRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
  };

  const subscribeToBooking = (bookingId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe_booking',
        bookingId: bookingId
      }));
    }
  };

  useEffect(() => {
    if (user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    connectionStatus,
    subscribeToBooking,
    updates,
    lastUpdate,
  };
};