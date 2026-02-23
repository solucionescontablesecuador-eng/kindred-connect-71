import { useState, useRef } from "react";
import { Apartment } from "@/hooks/useApartments";
import { Payment } from "@/hooks/usePayments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Upload, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apartment: Apartment;
  month: number;
  year: number;
  payment: Payment | null;
  monthlyFee: number;
  onSubmit: (data: {
    apartment_id: string;
    year: number;
    month: number;
    amount: number;
    payment_date?: string | null;
    status: "paid" | "pending";
    receipt_url?: string | null;
    notes?: string | null;
  }) => Promise<void>;
  onUploadReceipt: (file: File, apartmentId: string, year: number, month: number) => Promise<string>;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function PaymentModal({
  open,
  onOpenChange,
  apartment,
  month,
  year,
  payment,
  monthlyFee,
  onSubmit,
  onUploadReceipt,
}: PaymentModalProps) {
  const [isPaid, setIsPaid] = useState(payment?.status === "paid");
  const [amount, setAmount] = useState(payment?.amount?.toString() || monthlyFee.toString());
  const [paymentDate, setPaymentDate] = useState(
    payment?.payment_date || new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState(payment?.notes || "");
  const [receiptUrl, setReceiptUrl] = useState(payment?.receipt_url || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await onUploadReceipt(file, apartment.id, year, month);
      setReceiptUrl(url);
      toast.success("Receipt uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload receipt");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (isPaid && !receiptUrl) {
      toast.error("Please upload a payment receipt");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        apartment_id: apartment.id,
        year,
        month,
        amount: parseFloat(amount),
        payment_date: isPaid ? paymentDate : null,
        status: isPaid ? "paid" : "pending",
        receipt_url: receiptUrl || null,
        notes: notes || null,
      });
      toast.success("Payment updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Payment - Apt. {apartment.apartment_number}
          </DialogTitle>
          <DialogDescription>
            {MONTH_NAMES[month - 1]} {year} • {apartment.owner_full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="isPaid" className="text-base">Mark as Paid</Label>
            <Switch
              id="isPaid"
              checked={isPaid}
              onCheckedChange={setIsPaid}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {isPaid && (
            <>
              <div className="space-y-2">
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Payment Receipt</Label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1"
                  >
                    {isUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload Receipt
                  </Button>
                  {receiptUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      asChild
                    >
                      <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
                {receiptUrl && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span className="truncate">Receipt uploaded</span>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
