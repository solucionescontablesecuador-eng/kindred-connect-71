import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apartmentSchema, ApartmentFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ApartmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ApartmentFormData) => Promise<void>;
  initialData?: Partial<ApartmentFormData>;
  isEditing?: boolean;
}

export function ApartmentForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isEditing = false,
}: ApartmentFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApartmentFormData>({
    resolver: zodResolver(apartmentSchema),
    defaultValues: initialData,
  });

  const handleFormSubmit = async (data: ApartmentFormData) => {
    await onSubmit(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Apartment" : "Add New Apartment"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the apartment information below."
              : "Fill in the details to add a new apartment."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apartmentNumber">Apartment Number</Label>
            <Input
              id="apartmentNumber"
              placeholder="e.g., 101"
              {...register("apartmentNumber")}
            />
            {errors.apartmentNumber && (
              <p className="text-sm text-destructive">{errors.apartmentNumber.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerFullName">Owner Full Name</Label>
            <Input
              id="ownerFullName"
              placeholder="John Doe"
              {...register("ownerFullName")}
            />
            {errors.ownerFullName && (
              <p className="text-sm text-destructive">{errors.ownerFullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobilePhone">Mobile Phone</Label>
            <Input
              id="mobilePhone"
              placeholder="+1 234 567 8900"
              {...register("mobilePhone")}
            />
            {errors.mobilePhone && (
              <p className="text-sm text-destructive">{errors.mobilePhone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationalId">National ID / Cédula</Label>
            <Input
              id="nationalId"
              placeholder="Enter national ID"
              {...register("nationalId")}
            />
            {errors.nationalId && (
              <p className="text-sm text-destructive">{errors.nationalId.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Add Apartment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
