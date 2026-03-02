import { useState, useMemo, useCallback, memo } from "react";
import { Apartment } from "@/hooks/useApartments";
import { Payment } from "@/hooks/usePayments";
import { Button } from "@/components/ui/button";
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
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

type SortKey = "apartment" | "balance";
type SortDir = "asc" | "desc";

export const PaymentTable = memo(function PaymentTable({
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

  const paymentMap = useMemo(() => {
    const map = new Map<string, Payment>();
    for (const p of payments) {
      map.set(`${p.apartment_id}-${p.month}`, p);
    }
    return map;
  }, [payments]);

  const getPayment = useCallback((apartmentId: string, month: number) => {
    return paymentMap.get(`${apartmentId}-${month}`);
  }, [paymentMap]);

  const handleCellClick = useCallback((apartment: Apartment, month: number) => {
    const payment = getPayment(apartment.id, month);
    setSelectedPayment({ apartment, month, payment: payment || null });
  }, [getPayment]);

  const toggleSort = useCallback((key: SortKey) => {
    setSortKey(prev => {
      if (prev === key) {
        setSortDir(d => d === "asc" ? "desc" : "asc");
        return prev;
      }
      setSortDir("asc");
      return key;
    });
  }, []);

  const isOverdue = useCallback((month: number) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    if (year < currentYear) return true;
    if (year > currentYear) return false;
    if (month < currentMonth) return true;
    if (month === currentMonth && currentDay >= cutoffDay) return true;
    return false;
  }, [year, cutoffDay]);

  const getBalance = useCallback((apartmentId: string) => {
    let balance = 0;
    for (let m = 1; m <= 12; m++) {
      const payment = paymentMap.get(`${apartmentId}-${m}`);
      if (!payment || payment.status === "pending") {
        balance += monthlyFee;
      }
    }
    return balance;
  }, [paymentMap, monthlyFee]);

  const sortedApartments = useMemo(() => {
    const filtered = apartments.filter(apt =>
      apt.apartment_number.toLowerCase().includes(search.toLowerCase()) ||
      apt.owner_full_name.toLowerCase().includes(search.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "apartment") {
        return a.apartment_number.localeCompare(b.apartment_number, undefined, { numeric: true }) * dir;
      }
      return (getBalance(a.id) - getBalance(b.id)) * dir;
    });
  }, [apartments, search, sortKey, sortDir, getBalance]);

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
              {MONTHS.map((month) => (
                <TableHead key={month} className="text-center min-w-[90px] px-1">
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
                        <button
                          className="inline-flex items-center justify-center h-8 w-full rounded-md text-xs font-medium transition-colors cursor-pointer hover:bg-muted/80"
                          onClick={() => handleCellClick(apartment, month)}
                        >
                          <span className={overdue ? "text-destructive font-semibold" : "text-foreground"}>
                            {isPaid && payment
                              ? `$${Number(payment.amount).toFixed(0)}`
                              : overdue
                              ? `$${monthlyFee.toFixed(0)}`
                              : "—"}
                          </span>
                        </button>
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center">
                    <span className={`text-sm font-medium ${balance > 0 ? "text-destructive" : "text-foreground"}`}>
                      ${balance.toFixed(2)}
                    </span>
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
});
