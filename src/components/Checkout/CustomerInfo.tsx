import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Phone, MapPin } from 'lucide-react';

interface CustomerInfoProps {
  customerInfo: any;
  onCustomerInfoChange: (info: any) => void;
}

export const CustomerInfo: React.FC<CustomerInfoProps> = ({
  customerInfo,
  onCustomerInfoChange
}) => {
  const [formData, setFormData] = useState({
    firstName: customerInfo?.firstName || '',
    lastName: customerInfo?.lastName || '',
    email: customerInfo?.email || '',
    phone: customerInfo?.phone || '',
    country: customerInfo?.country || 'Zimbabwe',
    city: customerInfo?.city || '',
    specialRequests: customerInfo?.specialRequests || '',
    marketingConsent: customerInfo?.marketingConsent || false,
    termsAccepted: customerInfo?.termsAccepted || false
  });

  const updateField = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onCustomerInfoChange(updated);
  };

  const zimbabweCities = [
    'Harare', 'Bulawayo', 'Chitungwiza', 'Mutare', 'Gweru',
    'Kwekwe', 'Kadoma', 'Masvingo', 'Chinhoyi', 'Norton',
    'Marondera', 'Ruwa', 'Chegutu', 'Zvishavane', 'Bindura'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
        <p className="text-muted-foreground">We'll use this information for your booking confirmation</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="Enter your first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Contact Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="your.email@example.com"
              required
            />
            <p className="text-xs text-muted-foreground">
              Your tickets will be sent to this email address
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+263 77 123 4567"
              required
            />
            <p className="text-xs text-muted-foreground">
              We may send SMS updates about your booking
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select 
                value={formData.country} 
                onValueChange={(value) => updateField('country', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                  <SelectItem value="South Africa">South Africa</SelectItem>
                  <SelectItem value="Botswana">Botswana</SelectItem>
                  <SelectItem value="Zambia">Zambia</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              {formData.country === 'Zimbabwe' ? (
                <Select 
                  value={formData.city} 
                  onValueChange={(value) => updateField('city', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {zimbabweCities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Enter your city"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Special Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="specialRequests">Additional Information (Optional)</Label>
            <Textarea
              id="specialRequests"
              value={formData.specialRequests}
              onChange={(e) => updateField('specialRequests', e.target.value)}
              placeholder="Any dietary requirements, accessibility needs, or special requests..."
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={formData.termsAccepted}
              onCheckedChange={(checked) => updateField('termsAccepted', checked)}
            />
            <div className="space-y-1">
              <Label 
                htmlFor="terms" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I accept the Terms & Conditions *
              </Label>
              <p className="text-xs text-muted-foreground">
                By proceeding, you agree to our terms of service and privacy policy.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="marketing"
              checked={formData.marketingConsent}
              onCheckedChange={(checked) => updateField('marketingConsent', checked)}
            />
            <div className="space-y-1">
              <Label 
                htmlFor="marketing" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Send me updates about events and offers
              </Label>
              <p className="text-xs text-muted-foreground">
                Get notified about upcoming events and exclusive deals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};