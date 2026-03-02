import { memo } from "react";
import { Apartment } from "@/hooks/useApartments";
import { ExtraordinaryFee, ExtraordinaryPayment } from "@/hooks/useExtraordinaryFees";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";

interface ExtraordinaryDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fee: ExtraordinaryFee | null;
  apartments: Apartment[];
  payments: ExtraordinaryPayment[];
  onMarkPaid: (apartment: Apartment, payment: ExtraordinaryPayment | null) => void;
  onMarkPending: (apartment: Apartment, payment: ExtraordinaryPayment) => void;
}

export const ExtraordinaryDetailsModal = memo(function ExtraordinaryDetailsModal({
  open,
  onOpenChange,
  fee,
  apartments,
  payments,
  onMarkPaid,
  onMarkPending
}: ExtraordinaryDetailsModalProps) {
  if (!fee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles de Recaudación: {fee.title}</DialogTitle>
          <DialogDescription>
            Listado de apartamentos. Los montos en rojo indican pagos incompletos.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Apt.</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Monto Pagado</TableHead>
                <TableHead className="text-center">Comprobante</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apartments.map(apt => {
                const payment = payments.find(p => p.fee_id === fee.id && p.apartment_id === apt.id);
                const isPaid = payment?.status === "paid";
                const amountPaid = payment?.amount_paid || 0;
                const balance = fee.amount - amountPaid;
                const isPartial = isPaid && balance > 0;

                return (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">{apt.apartment_number}</TableCell>
                    <TableCell className="text-sm">{apt.owner_full_name}</TableCell>
                    <TableCell className="text-center">
                      <span className={isPaid ? (isPartial ? "text-orange-600" : "text-foreground") : "text-destructive"}>
                        {isPaid ? (isPartial ? "Parcial" : "Pagado") : "Pendiente"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {isPaid ? (
                        <span className={isPartial ? "text-destructive font-medium" : "text-foreground font-medium"}>
                          ${amountPaid.toFixed(2)}
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {payment?.receipt_url ? (
                        <Button variant="ghost" size="sm" asChild title="Ver comprobante">
                          <a href={payment.receipt_url} target="_blank" rel="noreferrer">
                            <ImageIcon className="h-4 w-4" />
                          </a>
                        </Button>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {isPaid ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => onMarkPending(apt, payment!)}
                        >
                          Anular
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onMarkPaid(apt, payment || null)}
                        >
                          Pagar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
});
