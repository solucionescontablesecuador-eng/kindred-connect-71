import { useState } from "react";
import { Apartment } from "@/hooks/useApartments";
import { Payment } from "@/hooks/usePayments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PaymentModal } from "./PaymentModal";
import { ArrowUpDown, Search } from "lucide-react";

interface PaymentTableProps {
  apartments: Apartment[];
  payments: Payment[];
  year: number;
  monthlyFee: number;
  cutoffDay?: number;
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
  onUploadReceipt: (file: File) => Promise<string>;
}

const MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

type SortKey = "apartment" | "balance";
type SortDir = "asc" | "desc";

export function PaymentTable({
  apartments,
  payments,
  year,
  monthlyFee,
  cutoffDay = 5,
  onUpdatePayment,
  onUploadReceipt,
}: PaymentTableProps) {
  const [selectedPayment, setSelectedPayment] = useState<{
    apartment: Apartment;
    month: number;
    payment: Payment | null;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("apartment");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const getPayment = (apartmentId: string, month: number) => {
    return payments.find(
      (p) => p.apartment_id === apartmentId && p.month === month
    );
  };

  const handleCellClick = (apartment: Apartment, month: number) => {
    const payment = getPayment(apartment.id, month);
    setSelectedPayment({ apartment, month, payment: payment || null });
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const isOverdue = (month: number) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    if (year < currentYear) return true;
    if (year > currentYear) return false;
    if (month < currentMonth) return true;
    if (month === currentMonth && currentDay >= cutoffDay) return true;
    return false;
  };

  const getBalance = (apartmentId: string) => {
    return MONTHS.reduce((acc, _, monthIndex) => {
      const payment = getPayment(apartmentId, monthIndex + 1);
      if (!payment || payment.status === "pending") {
        return acc + monthlyFee;
      }
      return acc;
    }, 0);
  };

  const filteredApartments = apartments.filter(apt =>
    apt.apartment_number.toLowerCase().includes(search.toLowerCase()) ||
    apt.owner_full_name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedApartments = [...filteredApartments].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "apartment") {
      return a.apartment_number.localeCompare(b.apartment_number, undefined, { numeric: true }) * dir;
    }
    return (getBalance(a.id) - getBalance(b.id)) * dir;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filtrar por apartamento o propietario..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-emerald-500/20 border border-emerald-500/40" />
            Pagado
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-muted border border-border" />
            Pendiente
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-sm bg-destructive/20 border border-destructive/40" />
            Vencido
          </span>
        </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="sticky left-0 z-10 bg-muted/50 min-w-[160px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => toggleSort("apartment")}
                >
                  Apartamento
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              {MONTHS.map((month, i) => (
                <TableHead key={month} className="text-center min-w-[72px] px-1">
                  <span className="text-xs font-medium">{month}</span>
                </TableHead>
              ))}
              <TableHead className="text-center min-w-[100px]">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => toggleSort("balance")}
                >
                  Saldo
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedApartments.map((apartment) => {
              const balance = getBalance(apartment.id);

              return (
                <TableRow key={apartment.id} className="group">
                  <TableCell className="sticky left-0 z-10 bg-card group-hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-semibold text-sm">Apt. {apartment.apartment_number}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[140px]">{apartment.owner_full_name}</p>
                    </div>
                  </TableCell>
                  {MONTHS.map((_, monthIndex) => {
                    const month = monthIndex + 1;
                    const payment = getPayment(apartment.id, month);
                    const isPaid = payment?.status === "paid";
                    const overdue = !isPaid && isOverdue(month);

                    return (
                      <TableCell key={month} className="text-center p-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className={`inline-flex items-center justify-center h-8 w-full rounded-md text-xs font-medium transition-colors cursor-pointer ${
                                  isPaid
                                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25"
                                    : overdue
                                    ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                }`}
                                onClick={() => handleCellClick(apartment, month)}
                              >
                                {isPaid ? "✓" : overdue ? "!" : "—"}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{isPaid ? "Pagado" : overdue ? "Vencido" : "Pendiente"} — {MONTHS[monthIndex]} {year}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center">
                    <Badge
                      variant={balance === 0 ? "default" : "destructive"}
                      className="font-mono text-xs"
                    >
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
    </div>
  );
}
