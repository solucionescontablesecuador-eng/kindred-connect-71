import { useState } from "react";
import { db } from "@/lib/localDb";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function useSeedData() {
  const { user } = useAuth();
  const [isSeeding, setIsSeeding] = useState(false);

  const seed = async () => {
    if (!user) {
      toast.error("No hay usuario activo");
      return;
    }
    
    setIsSeeding(true);
    console.log("Iniciando generación de datos locales...");

    try {
      // 1. Limpiar datos previos para evitar duplicados extraños en el seed
      localStorage.removeItem("condominios_local_db");

      // 2. Crear edificio
      const building = db.upsert("buildings", {
        admin_id: user.id,
        name: "Residencial Los Pinos",
        address: "Av. Independencia #123, Santo Domingo",
        monthly_fee: 75.00,
      }, "admin_id");

      console.log("Edificio creado:", building);

      // 3. Crear perfil
      db.upsert("profiles", {
        user_id: user.id,
        full_name: "Administrador General",
        mobile_phone: "+1 809 555 0000",
        email: user.email,
        national_id: "001-0000000-0",
      }, "user_id");

      // 4. Apartamentos
      const apartmentsData = [
        { apartment_number: "101", owner_full_name: "Juan Pérez", mobile_phone: "+1 809 555 0101", email: "juan.perez@email.com", national_id: "001-1234567-1" },
        { apartment_number: "102", owner_full_name: "María García", mobile_phone: "+1 809 555 0102", email: "maria.garcia@email.com", national_id: "001-1234567-2" },
        { apartment_number: "201", owner_full_name: "Carlos Rodríguez", mobile_phone: "+1 809 555 0201", email: "carlos.rod@email.com", national_id: "001-1234567-3" },
        { apartment_number: "202", owner_full_name: "Ana Martínez", mobile_phone: "+1 809 555 0202", email: "ana.mtz@email.com", national_id: "001-1234567-4" },
        { apartment_number: "301", owner_full_name: "Luis Hernández", mobile_phone: "+1 809 555 0301", email: "luis.h@email.com", national_id: "001-1234567-5" },
      ];

      const createdApartments = apartmentsData.map(apt => 
        db.insert("apartments", { ...apt, building_id: building.id })
      );

      console.log("Apartamentos creados:", createdApartments.length);

      // 5. Pagos (últimos 3 meses)
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const months = [currentMonth, currentMonth - 1, currentMonth - 2].filter(m => m > 0);

      createdApartments.forEach(apt => {
        months.forEach(month => {
          const isPaid = Math.random() > 0.3; // 70% pagados
          db.insert("payments", {
            apartment_id: apt.id,
            year: currentYear,
            month: month,
            amount: 75.00,
            status: isPaid ? "paid" : "pending",
            payment_date: isPaid ? new Date().toISOString().split('T')[0] : null,
            notes: isPaid ? "Pago en efectivo" : "Pendiente",
          });
        });
      });

      console.log("Pagos generados correctamente");
      toast.success("¡Datos locales generados con éxito!");
      
      // Pequeño retraso para que el usuario vea el toast antes de recargar
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      console.error("Error en el seed:", error);
      toast.error("Error al generar datos: " + error.message);
    } finally {
      setIsSeeding(false);
    }
  };

  return { seed, isSeeding };
}