import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/localDb";
import { useBuilding } from "./useBuilding";
import { useApartments } from "./useApartments";

export interface ExtraordinaryFee {
  id: string;
  building_id: string;
  title: string;
  description: string;
  amount: number;
  due_date: string;
  created_at: string;
}

export interface ExtraordinaryPayment {
  id: string;
  fee_id: string;
  apartment_id: string;
  status: "paid" | "pending";
  payment_date: string | null;
  amount_paid: number;
  receipt_url?: string | null;
  notes?: string | null;
}

export function useExtraordinaryFees() {
  const { building } = useBuilding();
  const { apartments } = useApartments();
  const queryClient = useQueryClient();

  const { data: fees = [], isLoading: feesLoading } = useQuery({
    queryKey: ["extraordinary_fees", building?.id],
    queryFn: async () => {
      if (!building) return [];
      const allFees = db.getAll("extraordinary_fees");
      return allFees.filter((f: any) => f.building_id === building.id);
    },
    enabled: !!building,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["extraordinary_payments"],
    queryFn: async () => {
      return db.getAll("extraordinary_payments") || [];
    },
  });

  const createFee = useMutation({
    mutationFn: async (feeData: Omit<ExtraordinaryFee, "id" | "building_id" | "created_at">) => {
      if (!building) throw new Error("No building found");
      const newFee = db.insert("extraordinary_fees", { 
        ...feeData, 
        building_id: building.id 
      });

      apartments.forEach(apt => {
        db.insert("extraordinary_payments", {
          fee_id: newFee.id,
          apartment_id: apt.id,
          status: "pending",
          payment_date: null,
          amount_paid: 0,
          receipt_url: null
        });
      });

      return newFee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extraordinary_fees"] });
      queryClient.invalidateQueries({ queryKey: ["extraordinary_payments"] });
    },
  });

  const updateFee = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ExtraordinaryFee> & { id: string }) => {
      return db.update("extraordinary_fees", id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extraordinary_fees"] });
    },
  });

  const updatePayment = useMutation({
    mutationFn: async (paymentData: Partial<ExtraordinaryPayment> & { fee_id: string, apartment_id: string }) => {
      const allPayments = db.getAll("extraordinary_payments");
      const existing = allPayments.find((p: any) => 
        p.fee_id === paymentData.fee_id && p.apartment_id === paymentData.apartment_id
      );

      if (existing) {
        return db.update("extraordinary_payments", existing.id, paymentData);
      } else {
        return db.insert("extraordinary_payments", paymentData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extraordinary_payments"] });
    },
  });

  const deleteFee = useMutation({
    mutationFn: async (id: string) => {
      db.delete("extraordinary_fees", id);
      const allPayments = db.getAll("extraordinary_payments");
      const toDelete = allPayments.filter((p: any) => p.fee_id === id);
      toDelete.forEach((p: any) => db.delete("extraordinary_payments", p.id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extraordinary_fees"] });
      queryClient.invalidateQueries({ queryKey: ["extraordinary_payments"] });
    },
  });

  const uploadReceipt = async (file: File) => {
    return URL.createObjectURL(file);
  };

  return { 
    fees, 
    payments, 
    isLoading: feesLoading || paymentsLoading, 
    createFee, 
    updateFee,
    updatePayment,
    deleteFee,
    uploadReceipt
  };
}