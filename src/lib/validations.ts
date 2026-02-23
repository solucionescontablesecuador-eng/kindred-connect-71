import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "El nombre completo debe tener al menos 2 caracteres").max(100, "El nombre completo debe tener menos de 100 caracteres"),
  mobilePhone: z.string().trim().min(8, "El teléfono móvil debe tener al menos 8 caracteres").max(20, "El teléfono móvil debe tener menos de 20 caracteres"),
  email: z.string().trim().email("Dirección de correo electrónico inválida").max(255, "El correo debe tener menos de 255 caracteres"),
  nationalId: z.string().trim().min(5, "La identificación nacional debe tener al menos 5 caracteres").max(20, "La identificación nacional debe tener menos de 20 caracteres"),
  buildingName: z.string().trim().min(2, "El nombre del edificio debe tener al menos 2 caracteres").max(100, "El nombre del edificio debe tener menos de 100 caracteres"),
  buildingAddress: z.string().trim().max(255, "La dirección debe tener menos de 255 caracteres").optional(),
  monthlyFee: z.number().min(0, "La cuota mensual debe ser positiva").max(1000000, "La cuota mensual es demasiado alta"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(100, "La contraseña debe tener menos de 100 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().trim().email("Dirección de correo electrónico inválida"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const apartmentSchema = z.object({
  apartmentNumber: z.string().trim().min(1, "El número de apartamento es requerido").max(10, "El número de apartamento debe tener menos de 10 caracteres"),
  ownerFullName: z.string().trim().min(2, "El nombre del propietario debe tener al menos 2 caracteres").max(100, "El nombre del propietario debe tener menos de 100 caracteres"),
  mobilePhone: z.string().trim().min(8, "El teléfono móvil debe tener al menos 8 caracteres").max(20, "El teléfono móvil debe tener menos de 20 caracteres"),
  email: z.string().trim().email("Dirección de correo electrónico inválida").max(255, "El correo debe tener menos de 255 caracteres"),
  nationalId: z.string().trim().min(5, "La identificación nacional debe tener al menos 5 caracteres").max(20, "La identificación nacional debe tener menos de 20 caracteres"),
});

export const paymentSchema = z.object({
  amount: z.number().min(0, "El monto debe ser positivo"),
  paymentDate: z.date().optional(),
  status: z.enum(["paid", "pending"]),
  notes: z.string().max(500, "Las notas deben tener menos de 500 caracteres").optional(),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ApartmentFormData = z.infer<typeof apartmentSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;