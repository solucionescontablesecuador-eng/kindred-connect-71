import { memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Apartment } from "@/hooks/useApartments";
import { Payment } from "@/hooks/usePayments";

type ModalType = "total" | "paid" | "pending" | null;

interface KpiDetailModalProps {
  type: ModalType;
  onClose: () => void;
  apartments: Apartment[];
  payments: Payment[];
  monthlyFee: number;
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const KpiDetailModal = memo(function KpiDetailModal({ type, onClose, apartments, payments, monthlyFee }: KpiDetailModalProps) {
  if (!type) return null;

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const paidAptIds = new Set(
    payments
      .filter(p => p.year === currentYear && p.month === currentMonth && p.status === "paid")
      .map(p => p.apartment_id)
  );

  const getTitle = () => {
    switch (type) {
      case "total": return "Todos los Apartamentos";
      case "paid": return "Apartamentos al Día";
      case "pending": return "Apartamentos con Pagos Pendientes";
    }
  };

  const filteredApartments = apartments.filter(apt => {
    if (type === "total") return true;
    if (type === "paid") return paidAptIds.has(apt.id);
    if (type === "pending") return !paidAptIds.has(apt.id);
    return true;
  });

  const getPendingDetails = (aptId: string) => {
    const paidMonths = new Set(
      payments
        .filter(p => p.apartment_id === aptId && p.year === currentYear && p.status === "paid")
        .map(p => p.month)
    );
    const pending: string[] = [];
    for (let m = 1; m <= currentMonth; m++) {
      if (!paidMonths.has(m)) pending.push(MONTH_NAMES[m - 1]);
    }
    return pending;
  };

  const getPendingAmount = (aptId: string) => {
    return getPendingDetails(aptId).length * monthlyFee;
  };

  return (
    <Dialog open={!!type} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Apartamento</TableHead>
                <TableHead>Propietario</TableHead>
                {type === "total" && <TableHead className="text-center">Estado</TableHead>}
                {type === "pending" && <TableHead>Meses Pendientes</TableHead>}
                {type === "pending" && <TableHead className="text-right">Monto</TableHead>}
                {type === "paid" && <TableHead className="text-center">Mes Actual</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No hay apartamentos en esta categoría
                  </TableCell>
                </TableRow>
              ) : (
                filteredApartments.map(apt => {
                  const isPaid = paidAptIds.has(apt.id);
                  const pendingMonths = type === "pending" ? getPendingDetails(apt.id) : [];
                  const pendingAmount = type === "pending" ? getPendingAmount(apt.id) : 0;

                  return (
                    <TableRow key={apt.id}>
                      <TableCell className="font-semibold">Apt. {apt.apartment_number}</TableCell>
                      <TableCell>{apt.owner_full_name}</TableCell>
                      {type === "total" && (
                        <TableCell className="text-center">
                          <span className={isPaid ? "text-foreground" : "text-destructive"}>
                            {isPaid ? "Al día" : "Pendiente"}
                          </span>
                        </TableCell>
                      )}
                      {type === "pending" && (
                        <>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {pendingMonths.join(", ")}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium text-destructive">
                            ${pendingAmount.toFixed(2)}
                          </TableCell>
                        </>
                      )}
                      {type === "paid" && (
                        <TableCell className="text-center">
                          <span className="text-foreground">Pagado</span>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});
