import { useState } from "react";
import { Webhook, Send, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const WebhookTesting = () => {
  const { toast } = useToast();
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState("success");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleTestWebhook = async () => {
    if (!orderId.trim()) {
      toast({
        title: "Validation Error",
        description: "Order ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      const payload = {
        orderId: orderId.trim(),
        status,
        ...(amount && { amount: parseFloat(amount) }),
        currency,
      };

      console.log('Sending test webhook with payload:', payload);

      const { data, error } = await supabase.functions.invoke('test-contipay-webhook', {
        body: payload,
      });

      if (error) throw error;

      setTestResult({
        success: true,
        data,
      });

      toast({
        title: "Webhook Test Successful",
        description: `Successfully triggered webhook for order ${orderId}`,
      });
    } catch (error: any) {
      console.error('Webhook test error:', error);
      setTestResult({
        success: false,
        error: error.message || 'Unknown error occurred',
      });

      toast({
        title: "Webhook Test Failed",
        description: error.message || 'Failed to trigger webhook',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const paymentStatuses = [
    { value: "success", label: "Success / Completed" },
    { value: "completed", label: "Completed" },
    { value: "paid", label: "Paid" },
    { value: "successful", label: "Successful" },
    { value: "failed", label: "Failed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "declined", label: "Declined" },
    { value: "rejected", label: "Rejected" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">ContiPay Webhook Testing</h2>
        <p className="text-muted-foreground">Test webhook callbacks without real payments</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhook Test Form
            </CardTitle>
            <CardDescription>
              Simulate ContiPay payment webhooks to test order status updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID *</Label>
                <Input
                  id="orderId"
                  placeholder="e.g., 51edc85d-4f4e-4892-ab6b-b4036b992da5"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  The UUID of the order you want to test
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Payment Status *</Label>
                  <Select value={status} onValueChange={setStatus} disabled={isLoading}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatuses.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency} disabled={isLoading}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="ZWL">ZWL</SelectItem>
                      <SelectItem value="ZAR">ZAR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (Optional)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 1150.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use the order's original amount
                </p>
              </div>

              <Button 
                onClick={handleTestWebhook} 
                disabled={isLoading || !orderId.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Test Webhook...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Test Webhook
                  </>
                )}
              </Button>
            </div>

            {testResult && (
              <div className="mt-6">
                <Alert variant={testResult.success ? "default" : "destructive"}>
                  <div className="flex items-start gap-2">
                    {testResult.success ? (
                      <CheckCircle2 className="h-5 w-5 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">
                        {testResult.success ? "Webhook Test Successful" : "Webhook Test Failed"}
                      </h4>
                      <AlertDescription>
                        <pre className="text-xs overflow-auto max-h-96 p-3 bg-background/50 rounded mt-2">
                          {JSON.stringify(testResult.success ? testResult.data : testResult.error, null, 2)}
                        </pre>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">How to use:</h4>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Create a test order through the checkout flow</li>
                <li>Copy the order ID from the database or order confirmation page</li>
                <li>Paste it into the "Order ID" field above</li>
                <li>Select the payment status you want to simulate</li>
                <li>Click "Send Test Webhook" to trigger the webhook handler</li>
              </ol>
            </div>

            <div>
              <h4 className="font-semibold mb-2">What happens:</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><span className="font-medium text-foreground">Success/Completed:</span> Order marked as confirmed, tickets activated</li>
                <li><span className="font-medium text-foreground">Failed/Cancelled:</span> Order marked as failed/cancelled</li>
                <li><span className="font-medium text-foreground">Pending/Processing:</span> Order status updated to pending</li>
              </ul>
            </div>

            <Alert>
              <AlertDescription>
                <strong>Note:</strong> This endpoint simulates ContiPay webhooks for testing purposes only. 
                Real payments will trigger webhooks automatically from ContiPay's servers.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WebhookTesting;
