import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { WhatsAppReminder } from "@/components/communications/WhatsAppReminder";
import { useBuilding } from "@/hooks/useBuilding";
import { useApartments } from "@/hooks/useApartments";
import { usePayments } from "@/hooks/usePayments";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import { Label } from "@/components/ui/label";

function CommunicationsContent() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  
  const { building, isLoading: buildingLoading } = useBuilding();
  const { apartments, isLoading: apartmentsLoading } = useApartments();
  const { payments, isLoading: paymentsLoading } = usePayments(year);

  const isLoading = buildingLoading || apartmentsLoading || paymentsLoading;

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comunicaciones</h1>
          <p className="text-muted-foreground">
            Envía recordatorios de pago por WhatsApp
          </p>
        </div>

        <div className="space-y-2">
          <Label>Año</Label>
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
        </div>
      </div>

      {apartments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No hay apartamentos para contactar</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Añade apartamentos para enviar recordatorios de pago
          </p>
        </div>
      ) : (
        <WhatsAppReminder
          apartments={apartments}
          payments={payments}
          year={year}
          monthlyFee={building?.monthly_fee || 0}
          buildingName={building?.name || "Edificio"}
        />
      )}
    </div>
  );
}

export default function Communications() {
  return (
    <AppLayout>
      <CommunicationsContent />
    </AppLayout>
  );
}