import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PaymentTable } from "@/components/payments/PaymentTable";
import { useBuilding } from "@/hooks/useBuilding";
import { useApartments } from "@/hooks/useApartments";
import { usePayments } from "@/hooks/usePayments";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, CreditCard } from "lucide-react";

function PaymentsContent() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  
  const { building, isLoading: buildingLoading } = useBuilding();
  const { apartments, isLoading: apartmentsLoading } = useApartments();
  const { payments, isLoading: paymentsLoading, upsertPayment, uploadReceipt } = usePayments(year);

  const isLoading = buildingLoading || apartmentsLoading || paymentsLoading;

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const handleUpdatePayment = async (data: {
    apartment_id: string;
    year: number;
    month: number;
    amount: number;
    payment_date?: string | null;
    status: "paid" | "pending";
    receipt_url?: string | null;
    notes?: string | null;
  }) => {
    await upsertPayment.mutateAsync(data);
  };

  const handleUploadReceipt = async (file: File, apartmentId: string, year: number, month: number) => {
    return await uploadReceipt(file, apartmentId, year, month);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pagos Mensuales</h1>
          <p className="text-muted-foreground">
            Rastrea y gestiona los pagos de los apartamentos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setYear((y) => y - 1)}
            disabled={year <= currentYear - 2}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setYear((y) => y + 1)}
            disabled={year >= currentYear + 2}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {apartments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <CreditCard className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No hay apartamentos para mostrar</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Añade apartamentos primero para empezar a rastrear pagos
          </p>
        </div>
      ) : (
        <PaymentTable
          apartments={apartments}
          payments={payments}
          year={year}
          monthlyFee={building?.monthly_fee || 0}
          onUpdatePayment={handleUpdatePayment}
          onUploadReceipt={handleUploadReceipt}
        />
      )}
    </div>
  );
}

export default function Payments() {
  return (
    <AppLayout>
      <PaymentsContent />
    </AppLayout>
  );
}