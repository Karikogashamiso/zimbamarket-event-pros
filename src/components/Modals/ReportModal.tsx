import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Flag } from "lucide-react";

interface ReportModalProps {
  onReport: (reason: string) => void;
  isReporting: boolean;
}

const reportReasons = [
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "spam", label: "Spam or fake listing" },
  { value: "misleading_info", label: "Misleading information" },
  { value: "pricing_issues", label: "Pricing issues" },
  { value: "poor_service", label: "Poor service quality" },
  { value: "other", label: "Other" },
];

export const ReportModal = ({ onReport, isReporting }: ReportModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const handleSubmit = () => {
    const reason = selectedReason === "other" ? customReason : selectedReason;
    if (reason.trim()) {
      onReport(reason.trim());
      setIsOpen(false);
      setSelectedReason("");
      setCustomReason("");
    }
  };

  const isFormValid = selectedReason && (selectedReason !== "other" || customReason.trim());

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Flag className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Service</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <Label className="text-base font-medium">Why are you reporting this service?</Label>
            <RadioGroup 
              value={selectedReason} 
              onValueChange={setSelectedReason}
              className="mt-4 space-y-3"
            >
              {reportReasons.map((reason) => (
                <div key={reason.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.value} id={reason.value} />
                  <Label htmlFor={reason.value} className="font-normal">
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {selectedReason === "other" && (
            <div>
              <Label htmlFor="custom-reason" className="text-sm font-medium">
                Please describe the issue
              </Label>
              <Textarea
                id="custom-reason"
                placeholder="Describe why you're reporting this service..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isReporting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!isFormValid || isReporting}
              variant="destructive"
            >
              {isReporting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};