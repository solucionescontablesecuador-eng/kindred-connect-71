import { memo } from "react";
import { Apartment } from "@/hooks/useApartments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ApartmentCardProps {
  apartment: Apartment;
  isPaidThisMonth: boolean;
  onEdit: (apartment: Apartment) => void;
  onDelete: (apartment: Apartment) => void;
}

export const ApartmentCard = memo(function ApartmentCard({ apartment, isPaidThisMonth, onEdit, onDelete }: ApartmentCardProps) {
  const hasPending = !isPaidThisMonth;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg">
            Apt. {apartment.apartment_number}
            {hasPending && (
              <span className="text-sm font-medium text-destructive">Pendiente</span>
            )}
          </CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              Opciones
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(apartment)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(apartment)}
              className="text-destructive"
            >
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm">
          <span className="font-medium">Propietario:</span> {apartment.owner_full_name}
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Teléfono:</span> {apartment.mobile_phone}
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Email:</span> {apartment.email}
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">ID:</span> {apartment.national_id}
        </div>
      </CardContent>
    </Card>
  );
});
