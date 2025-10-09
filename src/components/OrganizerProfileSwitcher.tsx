import { Building2, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Organizer {
  id: string;
  business_name: string;
  business_type: string;
  status: string;
  city?: string;
  country?: string;
}

interface OrganizerProfileSwitcherProps {
  organizers: Organizer[];
  selectedOrganizer: Organizer;
  onSelectOrganizer: (organizerId: string) => void;
  onAddProfile: () => void;
}

const businessTypeConfig = {
  event_organizer: {
    label: "Event Organizer",
    color: "bg-purple-500",
    icon: "🎉"
  },
  transport_operator: {
    label: "Transport Operator",
    color: "bg-blue-500",
    icon: "🚌"
  },
  venue_owner: {
    label: "Venue Owner",
    color: "bg-green-500",
    icon: "🏛️"
  }
};

export function OrganizerProfileSwitcher({
  organizers,
  selectedOrganizer,
  onSelectOrganizer,
  onAddProfile,
}: OrganizerProfileSwitcherProps) {
  if (organizers.length === 1) {
    return (
      <Button
        onClick={onAddProfile}
        variant="secondary"
        size="sm"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Profile
      </Button>
    );
  }

  const getBusinessTypeConfig = (type: string) => {
    return businessTypeConfig[type as keyof typeof businessTypeConfig] || {
      label: type.replace('_', ' '),
      color: "bg-gray-500",
      icon: "📋"
    };
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2">
          <Building2 className="w-4 h-4" />
          <span className="hidden sm:inline">Switch Profile</span>
          <Badge variant="outline" className="bg-white/20 text-white border-white/30 hidden md:inline-flex">
            {organizers.length}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Your Organizer Profiles</DialogTitle>
          <DialogDescription>
            Select a profile to manage or create a new one
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="grid gap-4">
            {organizers.map((org) => {
              const isSelected = org.id === selectedOrganizer.id;
              const config = getBusinessTypeConfig(org.business_type);
              
              return (
                <Card
                  key={org.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => {
                    onSelectOrganizer(org.id);
                    // Close dialog after selection
                    document.querySelector('[data-state="open"]')?.dispatchEvent(
                      new KeyboardEvent('keydown', { key: 'Escape' })
                    );
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg ${config.color} flex items-center justify-center text-2xl`}>
                          {config.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {org.business_name}
                            {isSelected && (
                              <Badge variant="default" className="text-xs">
                                <Check className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {config.label}
                            </Badge>
                            {org.status === 'approved' ? (
                              <Badge variant="default" className="text-xs bg-green-500">
                                ✓ Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Pending
                              </Badge>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {org.city && org.country && `${org.city}, ${org.country}`}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t">
          <Button
            onClick={() => {
              onAddProfile();
              // Close dialog
              document.querySelector('[data-state="open"]')?.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'Escape' })
              );
            }}
            variant="outline"
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Organizer Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
