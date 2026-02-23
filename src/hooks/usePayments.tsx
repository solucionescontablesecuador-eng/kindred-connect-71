import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/localDb";
import { useApartments } from "./useApartments";
import { useBuilding } from "./useBuilding";

export interface Payment {
  id: string;
  apartment_id: string;
  year: number;
  month: number;
  amount: number;
  payment_date: string | null;
  status: "paid" | "pending";
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function usePayments(year: number) {
  const { apartments } = useApartments();
  const { building } = useBuilding();
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments", year, apartments.length],
    queryFn: async () => {
      const aptIds = apartments.map(a => a.id);
      return db.getAll("payments").filter((p: any) => 
        aptIds.includes(p.apartment_id) && p.year === year
      );
    },
    enabled: apartments.length > 0,
  });

  const upsertPayment = useMutation({
    mutationFn: async (paymentData: any) => {
      const allPayments = db.getAll("payments");
      const existing = allPayments.find((p: any) => 
        p.apartment_id === paymentData.apartment_id && 
        p.year === paymentData.year && 
        p.month === paymentData.month
      );

      if (existing) {
        return db.update("payments", existing.id, paymentData);
      } else {
        return db.insert("payments", paymentData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });

  const uploadReceipt = async (file: File) => {
    // Simulación de subida: devolvemos una URL de objeto local
    return URL.createObjectURL(file);
  };

  const calculateStats = () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const totalApartments = apartments.length;
    const monthlyFee = building?.monthly_fee || 0;
    const monthlyTarget = totalApartments * monthlyFee;

    const currentMonthPayments = payments.filter(
      (p) => p.year === currentYear && p.month === currentMonth && p.status === "paid"
    );
    const totalCollected = currentMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const paidApartments = new Set(currentMonthPayments.map((p) => p.apartment_id)).size;
    const pendingApartments = totalApartments - paidApartments;
    const collectionProgress = monthlyTarget > 0 ? (totalCollected / monthlyTarget) * 100 : 0;

    return {
      totalApartments,
      paidApartments,
      pendingApartments,
      totalCollected,
      monthlyTarget,
      collectionProgress,
    };
  };

  return { payments, isLoading, upsertPayment, uploadReceipt, calculateStats };
}