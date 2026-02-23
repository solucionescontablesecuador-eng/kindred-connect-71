import { useState, useRef } from "react";
import { Apartment } from "@/hooks/useApartments";
import { ExtraordinaryFee, ExtraordinaryPayment } from "@/hooks/useExtraordinaryFees";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Camera } from "lucide-react";
import { toast } from "sonner";

interface ExtraordinaryPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apartment: Apartment;
  fee: ExtraordinaryFee;
  payment: ExtraordinaryPayment | null;
  onSave: (data: any) => Promise<void>;
  onUpload: (file: File) => Promise<string>;
}

export function ExtraordinaryPaymentModal({
  open,
  onOpenChange,
  apartment,
  fee,
  payment,
  onSave,
  onUpload
}: ExtraordinaryPaymentModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [amountPaid, setAmountPaid] = useState(payment?.amount_paid?.toString() || fee.amount.toString());
  const [receiptUrl, setReceiptUrl] = useState(payment?.receipt_url || "");
  const [notes, setNotes] = useState(payment?.notes || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await onUpload(file);
      setReceiptUrl(url);
      toast.success("Comprobante cargado");
    } catch (error) {
      toast.error("Error al cargar imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    const amount = parseFloat(amountPaid);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Por favor ingresa un monto válido");
      return;
    }

    if (!receiptUrl) {
      toast.error("Por favor adjunta una fotografía del comprobante");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        fee_id: fee.id,
        apartment_id: apartment.id,
        status: "paid",
        amount_paid: amount,
        payment_date: new Date().toISOString().split('T')[0],
        receipt_url: receiptUrl,
        notes
      });
      onOpenChange(false);
    } catch (error) {
      toast.error("Error al guardar el pago");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Pago - Apt. {apartment.apartment_number}</DialogTitle>
          <DialogDescription>
            Cuota: {fee.title} • Total a pagar: ${fee.amount.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="amountPaid">Monto Recibido ($)</Label>
            <Input 
              id="amountPaid" 
              type="number" 
              step="0.01" 
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
            />
            {parseFloat(amountPaid) < fee.amount && (
              <p className="text-xs text-destructive font-medium">
                Aviso: El monto es inferior al total de la cuota.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Comprobante de Pago (Foto)</Label>
            <div className="flex flex-col gap-3">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              
              {receiptUrl ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                  <img src={receiptUrl} alt="Comprobante" className="h-full w-full object-cover" />
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="absolute bottom-2 right-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Cambiar Foto
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="h-32 w-full border-dashed" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Camera className="h-8 w-8 text-muted-foreground" />
                      <span>Tomar Foto o Subir Imagen</span>
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales</Label>
            <Textarea 
              id="notes" 
              placeholder="Ej: Pago parcial, resto el próximo lunes" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving || isUploading}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}