import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

const NetworkStatus: React.FC = () => {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <Alert className="fixed top-20 left-4 right-4 z-50 bg-yellow-50 border-yellow-200 text-yellow-800">
      <WifiOff className="h-4 w-4" />
      <AlertDescription>
        You're currently offline. Some features may be limited, but you can still browse cached content.
      </AlertDescription>
    </Alert>
  );
};

export default NetworkStatus;