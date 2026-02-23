import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/localDb";
import { useAuth } from "./useAuth";

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const profiles = db.getAll("profiles");
      return profiles.find((p: any) => p.user_id === user?.id) || null;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: any) => {
      if (!profile) {
        return db.insert("profiles", { ...updates, user_id: user?.id });
      }
      return db.update("profiles", profile.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return { profile, isLoading, updateProfile };
}