import { useState } from "react";
import { Apartment } from "@/hooks/useApartments";
import { Payment } from "@/hooks/usePayments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PaymentModal } from "./PaymentModal";

interface PaymentTableProps {
  apartments: Apartment[];
  payments: Payment[];
  year: number;
  monthlyFee: number;
  onUpdatePayment: (data: {
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

const MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

export function PaymentTable({
  apartments,
  payments,
  year,
  monthlyFee,
  onUpdatePayment,
  onUploadReceipt,
}: PaymentTableProps) {
  const [selectedPayment, setSelectedPayment] = useState<{
    apartment: Apartment;
    month: number;
    payment: Payment | null;
  } | null>(null);

  const getPayment = (apartmentId: string, month: number) => {
    return payments.find(
      (p) => p.apartment_id === apartmentId && p.month === month
    );
  };

  const handleCellClick = (apartment: Apartment, month: number) => {
    const payment = getPayment(apartment.id, month);
    setSelectedPayment({ apartment, month, payment: payment || null });
  };

  return (
    <>
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-10 bg-card min-w-[120px]">Apartamento</TableHead>
              {MONTHS.map((month) => (
                <TableHead key={month} className="text-center min-w-[80px]">
                  {month}
                </TableHead>
              ))}
              <TableHead className="text-center min-w-[100px]">Saldo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apartments.map((apartment) => {
              const balance = MONTHS.reduce((acc, _, monthIndex) => {
                const payment = getPayment(apartment.id, monthIndex + 1);
                if (!payment || payment.status === "pending") {
                  return acc + monthlyFee;
                }
                return acc;
              }, 0);

              return (
                <TableRow key={apartment.id}>
                  <TableCell className="sticky left-0 z-10 bg-card font-medium">
                    Apt. {apartment.apartment_number}
                  </TableCell>
                  {MONTHS.map((_, monthIndex) => {
                    const month = monthIndex + 1;
                    const payment = getPayment(apartment.id, month);
                    const isPaid = payment?.status === "paid";

                    return (
                      <TableCell key={month} className="text-center p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-full text-xs"
                          onClick={() => handleCellClick(apartment, month)}
                        >
                          {isPaid ? (
                            <span className="text-success font-bold">PAGADO</span>
                          ) : (
                            <span className="text-destructive font-bold">PENDIENTE</span>
                          )}
                        </Button>
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center">
                    <Badge variant={balance === 0 ? "default" : "destructive"}>
                      ${balance.toFixed(2)}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {selectedPayment && (
        <PaymentModal
          open={!!selectedPayment}
          onOpenChange={(open) => !open && setSelectedPayment(null)}
          apartment={selectedPayment.apartment}
          month={selectedPayment.month}
          year={year}
          payment={selectedPayment.payment}
          monthlyFee={monthlyFee}
          onSubmit={onUpdatePayment}
          onUploadReceipt={onUploadReceipt}
        />
      )}
    </>
  );
}