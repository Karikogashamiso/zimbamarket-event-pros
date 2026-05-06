import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddTicketTypeFormProps {
  eventId: string;
  onSuccess: () => void;
}

export const AddTicketTypeForm = ({ eventId, onSuccess }: AddTicketTypeFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const { error } = await supabase
        .from('ticket_types')
        .insert({
          event_id: eventId,
          name: formData.get('ticket_name') as string,
          description: formData.get('ticket_description') as string,
          base_price: parseFloat(formData.get('price') as string),
          max_quantity: parseInt(formData.get('quantity') as string),
          currency: 'USD',
          is_active: true,
        });

      if (error) throw error;

      toast({ title: "Ticket type added successfully!" });
      setIsOpen(false);
      (e.target as HTMLFormElement).reset();
      onSuccess();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message || "Failed to add ticket type.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} variant="outline" size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Add Ticket Type
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border rounded-lg p-4 bg-muted/50">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="ticket_name">Ticket Name *</Label>
          <Input id="ticket_name" name="ticket_name" placeholder="e.g., General Admission" required />
        </div>
        <div>
          <Label htmlFor="price">Price (USD) *</Label>
          <Input id="price" name="price" type="number" step="0.01" min="0" required />
        </div>
      </div>
      <div>
        <Label htmlFor="quantity">Quantity Available *</Label>
        <Input id="quantity" name="quantity" type="number" min="1" required />
      </div>
      <div>
        <Label htmlFor="ticket_description">Description</Label>
        <Textarea id="ticket_description" name="ticket_description" rows={2} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm">Add Ticket</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
};
