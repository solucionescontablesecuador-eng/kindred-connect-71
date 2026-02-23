import { useState } from "react";
import { Apartment } from "@/hooks/useApartments";
import { Payment } from "@/hooks/usePayments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { Download } from "lucide-react";

interface ReportGeneratorProps {
  apartments: Apartment[];
  payments: Payment[];
  year: number;
  monthlyFee: number;
  buildingName: string;
}

const MONTH_NAMES = [
"Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
"Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];


export function ReportGenerator({
  apartments,
  payments,
  year,
  monthlyFee,
  buildingName
}: ReportGeneratorProps) {
  const [selectedApartment, setSelectedApartment] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [showReport, setShowReport] = useState(false);

  const filteredApartments = selectedApartment === "all" ?
  apartments :
  apartments.filter((a) => a.id === selectedApartment);

  const getApartmentPayments = (apartmentId: string) => {
    return payments.filter((p) => {
      const matchesApartment = p.apartment_id === apartmentId;
      const matchesMonth = selectedMonth === "all" || p.month === parseInt(selectedMonth);
      return matchesApartment && matchesMonth;
    });
  };

  const calculateBalance = (apartmentId: string) => {
    const months = selectedMonth === "all" ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [parseInt(selectedMonth)];
    const apartmentPayments = payments.filter((p) => p.apartment_id === apartmentId);

    let balance = 0;
    months.forEach((month) => {
      const payment = apartmentPayments.find((p) => p.month === month);
      if (!payment || payment.status === "pending") {
        balance += monthlyFee;
      }
    });
    return balance;
  };

  const generatePrintableReport = () => {
    const reportContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Pagos - ${buildingName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          h2 { color: #666; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f5f5f5; }
          .status-paid { color: green; font-weight: bold; }
          .status-pending { color: red; font-weight: bold; }
          .total { font-weight: bold; background-color: #f9f9f9; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Reporte de Pagos</h1>
        <p><strong>Edificio:</strong> ${buildingName}</p>
        <p><strong>Año:</strong> ${year}</p>
        <p><strong>Generado:</strong> ${new Date().toLocaleDateString()}</p>
        
        ${filteredApartments.map((apt) => {
      const aptPayments = getApartmentPayments(apt.id);
      const balance = calculateBalance(apt.id);
      const months = selectedMonth === "all" ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [parseInt(selectedMonth)];

      return `
            <h2>Apartamento ${apt.apartment_number}</h2>
            <p><strong>Propietario:</strong> ${apt.owner_full_name}</p>
            <p><strong>Teléfono:</strong> ${apt.mobile_phone}</p>
            <p><strong>Correo:</strong> ${apt.email}</p>
            
            <table>
              <thead>
                <tr>
                  <th>Mes</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Fecha de Pago</th>
                </tr>
              </thead>
              <tbody>
                ${months.map((month) => {
        const payment = aptPayments.find((p) => p.month === month);
        return `
                    <tr>
                      <td>${MONTH_NAMES[month - 1]}</td>
                      <td>$${payment?.amount || monthlyFee}</td>
                      <td class="${payment?.status === 'paid' ? 'status-paid' : 'status-pending'}">
                        ${payment?.status === 'paid' ? 'PAGADO' : 'PENDIENTE'}
                      </td>
                      <td>${payment?.payment_date || '-'}</td>
                    </tr>
                  `;
      }).join('')}
                <tr class="total">
                  <td colspan="3">Saldo Pendiente</td>
                  <td>$${balance.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          `;
    }).join('')}
        
        <div class="footer">
          <p>Este reporte fue generado automáticamente por Condominios Pro.</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(reportContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            
            Generar Reporte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Apartamento</Label>
              <Select value={selectedApartment} onValueChange={setSelectedApartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar apartamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Apartamentos</SelectItem>
                  {apartments.map((apt) =>
                  <SelectItem key={apt.id} value={apt.id}>
                      Apt. {apt.apartment_number} - {apt.owner_full_name}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mes</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar mes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Meses</SelectItem>
                  {MONTH_NAMES.map((month, index) =>
                  <SelectItem key={index} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setShowReport(true)}>
              
              Ver Reporte
            </Button>
            <Button variant="outline" onClick={generatePrintableReport}>
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {showReport &&
      <Card>
          <CardHeader>
            <CardTitle>Vista Previa del Reporte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {filteredApartments.map((apt) => {
            const aptPayments = getApartmentPayments(apt.id);
            const balance = calculateBalance(apt.id);
            const months = selectedMonth === "all" ?
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] :
            [parseInt(selectedMonth)];

            return (
              <div key={apt.id} className="border-b pb-6 last:border-b-0">
                  <h3 className="text-lg font-semibold">
                    Apartamento {apt.apartment_number}
                  </h3>
                  <div className="mt-2 grid gap-2 text-sm text-muted-foreground">
                    <p>Propietario: {apt.owner_full_name}</p>
                    <p>Teléfono: {apt.mobile_phone}</p>
                    <p>Correo: {apt.email}</p>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="pb-2 text-left font-medium">Mes</th>
                          <th className="pb-2 text-left font-medium">Monto</th>
                          <th className="pb-2 text-left font-medium">Estado</th>
                          <th className="pb-2 text-left font-medium">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {months.map((month) => {
                        const payment = aptPayments.find((p) => p.month === month);
                        return (
                          <tr key={month} className="border-b">
                              <td className="py-2">{MONTH_NAMES[month - 1]}</td>
                              <td className="py-2">${payment?.amount || monthlyFee}</td>
                            <td className="py-2">
                                <span className={payment?.status === 'paid' ? 'text-success' : 'text-destructive'}>
                                  {payment?.status === 'paid' ? 'Pagado' : 'Pendiente'}
                                </span>
                              </td>
                              <td className="py-2">{payment?.payment_date || '-'}</td>
                            </tr>);

                      })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-md bg-muted p-3">
                    <span className="font-medium">Saldo Pendiente:</span>
                    <span className={balance === 0 ? 'text-success font-bold' : 'text-destructive font-bold'}>
                      {balance === 0 ? 'Todos los pagos al día' : `$${balance.toFixed(2)}`}
                    </span>
                  </div>
                </div>);

          })}
          </CardContent>
        </Card>
      }
    </div>);

}