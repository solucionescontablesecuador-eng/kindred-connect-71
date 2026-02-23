import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/localDb";
import { useAuth } from "./useAuth";

export interface Building {
  id: string;
  name: string;
  address: string | null;
  monthly_fee: number;
  admin_id: string;
  created_at: string;
  updated_at: string;
}

export function useBuilding() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: building, isLoading } = useQuery({
    queryKey: ["building", user?.id],
    queryFn: async () => {
      const buildings = db.getAll("buildings");
      return buildings.find((b: any) => b.admin_id === user?.id) || null;
    },
  });

  const updateBuilding = useMutation({
    mutationFn: async (updates: Partial<Building>) => {
      if (!building) {
        return db.insert("buildings", { ...updates, admin_id: user?.id });
      }
      return db.update("buildings", building.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["building"] });
    },
  });

  return { building, isLoading, updateBuilding };
}