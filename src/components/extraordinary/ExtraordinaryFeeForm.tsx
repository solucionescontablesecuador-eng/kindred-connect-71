import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ExtraordinaryFeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
}

export function ExtraordinaryFeeForm({ open, onOpenChange, onSubmit, initialData }: ExtraordinaryFeeFormProps) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    if (open) {
      reset(initialData || {
        title: "",
        description: "",
        amount: "",
        due_date: ""
      });
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = async (data: any) => {
    await onSubmit({
      ...data,
      amount: parseFloat(data.amount)
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Cuota" : "Nueva Cuota Extraordinaria"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Modifica los detalles de la cuota." : "Esta cuota se asignará a todos los apartamentos."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título / Concepto</Label>
            <Input id="title" placeholder="Ej: Pintura de Fachada" {...register("title", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" placeholder="Detalles del gasto..." {...register("description")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto por Apt ($)</Label>
              <Input id="amount" type="number" step="0.01" {...register("amount", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Fecha Límite</Label>
              <Input id="due_date" type="date" {...register("due_date", { required: true })} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Guardar Cambios" : "Crear Cuota"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}