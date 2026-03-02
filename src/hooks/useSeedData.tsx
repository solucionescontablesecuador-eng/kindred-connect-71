import { useState } from "react";
import { db } from "@/lib/localDb";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

const FIRST_NAMES = [
  "Juan", "María", "Carlos", "Ana", "Luis", "Carmen", "Pedro", "Laura",
  "Miguel", "Sofía", "Roberto", "Elena", "Fernando", "Patricia", "Diego",
  "Gabriela", "Andrés", "Valentina", "Jorge", "Isabella", "Ricardo", "Natalia",
  "Alejandro", "Daniela", "Francisco"
];

const LAST_NAMES = [
  "Pérez", "García", "Rodríguez", "Martínez", "Hernández", "López", "González",
  "Díaz", "Morales", "Reyes", "Torres", "Ramírez", "Cruz", "Flores", "Rivera",
  "Gómez", "Vargas", "Castillo", "Jiménez", "Rojas", "Mendoza", "Guerrero",
  "Ortiz", "Salazar", "Núñez"
];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPhone() {
  return `+1 809 ${randomBetween(200, 999)} ${String(randomBetween(0, 9999)).padStart(4, "0")}`;
}

function randomId() {
  return `${String(randomBetween(1, 402)).padStart(3, "0")}-${String(randomBetween(0, 9999999)).padStart(7, "0")}-${randomBetween(0, 9)}`;
}

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
      localStorage.removeItem("condominios_local_db");

      const building = db.upsert("buildings", {
        admin_id: user.id,
        name: "Residencial Los Pinos",
        address: "Av. Independencia #123, Santo Domingo",
        monthly_fee: 75.00,
        cutoff_day: 5,
      }, "admin_id");

      db.upsert("profiles", {
        user_id: user.id,
        full_name: "Administrador General",
        mobile_phone: "+1 809 555 0000",
        email: user.email,
        national_id: "001-0000000-0",
      }, "user_id");

      // Generate 25 apartments across 5 floors
      const floors = [1, 2, 3, 4, 5];
      const unitsPerFloor = 5;
      const apartmentsData: any[] = [];

      floors.forEach(floor => {
        for (let unit = 1; unit <= unitsPerFloor; unit++) {
          const aptNum = `${floor}0${unit}`;
          const firstName = FIRST_NAMES[(floor - 1) * unitsPerFloor + unit - 1];
          const lastName1 = LAST_NAMES[randomBetween(0, LAST_NAMES.length - 1)];
          const lastName2 = LAST_NAMES[randomBetween(0, LAST_NAMES.length - 1)];
          apartmentsData.push({
            apartment_number: aptNum,
            owner_full_name: `${firstName} ${lastName1} ${lastName2}`,
            mobile_phone: randomPhone(),
            email: `${firstName.toLowerCase()}.${lastName1.toLowerCase()}@email.com`,
            national_id: randomId(),
          });
        }
      });

      const createdApartments = apartmentsData.map(apt =>
        db.insert("apartments", { ...apt, building_id: building.id })
      );

      console.log("Apartamentos creados:", createdApartments.length);

      // Generate payments for last 6 months with realistic variation
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const months = [];
      for (let i = 5; i >= 0; i--) {
        let m = currentMonth - i;
        let y = currentYear;
        if (m <= 0) { m += 12; y -= 1; }
        months.push({ month: m, year: y });
      }

      const paymentMethods = ["Efectivo", "Transferencia bancaria", "Cheque", "Depósito bancario"];

      createdApartments.forEach((apt, aptIndex) => {
        // Each apartment has a different payment behavior pattern
        const paymentReliability = Math.random(); // 0 = never pays, 1 = always pays

        months.forEach(({ month, year }) => {
          const isCurrentMonth = month === currentMonth && year === currentYear;
          const monthsAgo = (currentYear - year) * 12 + (currentMonth - month);

          // Payment probability: more reliable tenants pay more often, older months more likely paid
          let payProbability = paymentReliability * 0.7 + (monthsAgo > 2 ? 0.2 : 0) + (isCurrentMonth ? -0.15 : 0.1);
          payProbability = Math.min(Math.max(payProbability, 0.05), 0.95);

          const isPaid = Math.random() < payProbability;

          // Realistic amount variation: some pay exact, some pay different amounts
          let amount = 75.00;
          if (isPaid && Math.random() > 0.85) {
            // Occasional late fee or rounding
            amount = randomBetween(70, 80);
          }

          // Payment date: random day in the month, earlier months more likely early payment
          let paymentDate: string | null = null;
          if (isPaid) {
            const day = randomBetween(1, 28);
            paymentDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          }

          const method = paymentMethods[randomBetween(0, paymentMethods.length - 1)];

          db.insert("payments", {
            apartment_id: apt.id,
            year: year,
            month: month,
            amount: amount,
            status: isPaid ? "paid" : "pending",
            payment_date: paymentDate,
            notes: isPaid ? `Pago por ${method}` : (isCurrentMonth ? "Pendiente" : "Vencido - sin pago"),
          });
        });
      });

      // Generate extraordinary fees
      const extraordinaryFees = [
        {
          title: "Reparación de ascensor",
          description: "Mantenimiento correctivo del ascensor principal por desgaste de cables",
          amount: 150.00,
          due_date: `${currentYear}-${String(currentMonth).padStart(2, "0")}-20`,
        },
        {
          title: "Pintura de fachada",
          description: "Pintura exterior completa del edificio según acuerdo de asamblea",
          amount: 200.00,
          due_date: `${currentYear}-${String(Math.min(currentMonth + 1, 12)).padStart(2, "0")}-15`,
        },
        {
          title: "Sistema de cámaras",
          description: "Instalación de sistema de videovigilancia en áreas comunes",
          amount: 120.00,
          due_date: `${currentYear}-${String(Math.max(currentMonth - 1, 1)).padStart(2, "0")}-10`,
        },
      ];

      extraordinaryFees.forEach(feeData => {
        const fee = db.insert("extraordinary_fees", {
          ...feeData,
          building_id: building.id,
        });

        // Generate payments for each apartment for this fee
        createdApartments.forEach(apt => {
          const isPaid = Math.random() > 0.4;
          db.insert("extraordinary_payments", {
            fee_id: fee.id,
            apartment_id: apt.id,
            status: isPaid ? "paid" : "pending",
            amount_paid: isPaid ? feeData.amount : 0,
            payment_date: isPaid ? new Date().toISOString().split("T")[0] : null,
            receipt_url: null,
          });
        });
      });

      console.log("Datos generados: 25 apartamentos, 150 pagos mensuales, 3 cuotas extraordinarias");
      toast.success("¡Datos generados con éxito! 25 apartamentos con historial completo.");

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
