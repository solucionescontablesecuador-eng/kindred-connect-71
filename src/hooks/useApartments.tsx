import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/localDb";
import { useBuilding } from "./useBuilding";

export interface Apartment {
  id: string;
  building_id: string;
  apartment_number: string;
  owner_full_name: string;
  mobile_phone: string;
  email: string;
  national_id: string;
  created_at: string;
  updated_at: string;
}

export function useApartments() {
  const { building } = useBuilding();
  const queryClient = useQueryClient();

  const { data: apartments = [], isLoading } = useQuery({
    queryKey: ["apartments", building?.id],
    queryFn: async () => {
      if (!building) return [];
      return db.getAll("apartments").filter((a: any) => a.building_id === building.id);
    },
    enabled: !!building,
  });

  const createApartment = useMutation({
    mutationFn: async (apartmentData: any) => {
      if (!building) throw new Error("No building found");
      return db.insert("apartments", { ...apartmentData, building_id: building.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apartments"] });
    },
  });

  const updateApartment = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      return db.update("apartments", id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apartments"] });
    },
  });

  const deleteApartment = useMutation({
    mutationFn: async (id: string) => {
      db.delete("apartments", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apartments"] });
    },
  });

  return { apartments, isLoading, createApartment, updateApartment, deleteApartment };
}