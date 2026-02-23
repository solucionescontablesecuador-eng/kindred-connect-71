import { Apartment } from "@/hooks/useApartments";
import { Payment } from "@/hooks/usePayments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WhatsAppReminderProps {
  apartments: Apartment[];
  payments: Payment[];
  year: number;
  monthlyFee: number;
  buildingName: string;
}

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export function WhatsAppReminder({
  apartments,
  payments,
  year,
  monthlyFee,
  buildingName,
}: WhatsAppReminderProps) {
  const getApartmentDebt = (apartmentId: string) => {
    const pendingMonths: number[] = [];
    let totalDebt = 0;

    for (let month = 1; month <= 12; month++) {
      const payment = payments.find(
        (p) => p.apartment_id === apartmentId && p.month === month
      );
      if (!payment || payment.status === "pending") {
        pendingMonths.push(month);
        totalDebt += monthlyFee;
      }
    }

    return { pendingMonths, totalDebt };
  };

  const generateWhatsAppMessage = (apartment: Apartment, pendingMonths: number[], totalDebt: number) => {
    const monthsText = pendingMonths.map((m) => MONTH_NAMES[m - 1]).join(", ");
    
    const message = `Hola ${apartment.owner_full_name},

Este es un recordatorio amistoso de ${buildingName} con respecto a las cuotas de condominio pendientes.

*Meses Pendientes:* ${monthsText}
*Monto Total Adeudado:* $${totalDebt.toFixed(2)}

Por favor, realice el pago a la brevedad posible.

Gracias por su cooperación.

Atentamente,
Administración de ${buildingName}`;

    return encodeURIComponent(message);
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/[^0-9+]/g, "");
  };

  const openWhatsApp = (apartment: Apartment) => {
    const { pendingMonths, totalDebt } = getApartmentDebt(apartment.id);
    const message = generateWhatsAppMessage(apartment, pendingMonths, totalDebt);
    const phone = formatPhoneNumber(apartment.mobile_phone);
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const apartmentsWithDebt = apartments.filter((apt) => {
    const { totalDebt } = getApartmentDebt(apt.id);
    return totalDebt > 0;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recordatorios de Pago por WhatsApp</CardTitle>
        </CardHeader>
        <CardContent>
          {apartmentsWithDebt.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <h3 className="text-lg font-medium">Todos los pagos al día</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No hay pagos pendientes para recordar.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Haz clic en un apartamento para abrir WhatsApp con un mensaje de recordatorio.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {apartmentsWithDebt.map((apartment) => {
                  const { pendingMonths, totalDebt } = getApartmentDebt(apartment.id);
                  
                  return (
                    <Card key={apartment.id} className="transition-shadow hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">Apt. {apartment.apartment_number}</h4>
                            <p className="text-sm text-muted-foreground">
                              {apartment.owner_full_name}
                            </p>
                          </div>
                          <Badge variant="destructive">
                            ${totalDebt.toFixed(2)}
                          </Badge>
                        </div>
                        
                        <div className="mt-3 text-sm text-muted-foreground">
                          Teléfono: {apartment.mobile_phone}
                        </div>

                        <div className="mt-2 text-sm">
                          Pendiente: {pendingMonths.length} mes(es)
                        </div>

                        <Button
                          className="mt-4 w-full"
                          onClick={() => openWhatsApp(apartment)}
                        >
                          Enviar Recordatorio
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}