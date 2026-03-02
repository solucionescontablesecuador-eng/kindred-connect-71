import { memo } from "react";
import { ExtraordinaryFee } from "@/hooks/useExtraordinaryFees";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ExtraordinaryFeeCardProps {
  fee: ExtraordinaryFee;
  onEdit: (fee: ExtraordinaryFee) => void;
  onDelete: (fee: ExtraordinaryFee) => void;
  onViewDetails: (fee: ExtraordinaryFee) => void;
  paidCount: number;
  totalCount: number;
}

export const ExtraordinaryFeeCard = memo(function ExtraordinaryFeeCard({
  fee,
  onEdit,
  onDelete,
  onViewDetails,
  paidCount,
  totalCount
}: ExtraordinaryFeeCardProps) {
  const progress = totalCount > 0 ? paidCount / totalCount * 100 : 0;

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{fee.title}</CardTitle>
            <CardDescription className="line-clamp-2">{fee.description}</CardDescription>
          </div>
          <span className="text-sm font-medium text-foreground">
            {progress.toFixed(0)}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 pt-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-bold text-foreground">${fee.amount.toFixed(2)}</span>
          <span>por apartamento</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Vence: {fee.due_date}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Recaudación: {paidCount} de {totalCount} apartamentos
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-3 gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={() => onViewDetails(fee)}>
          Detalles
        </Button>
        <Button variant="outline" size="sm" onClick={() => onEdit(fee)}>
          Editar
        </Button>
        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => onDelete(fee)}>
          Borrar
        </Button>
      </CardFooter>
    </Card>
  );
});
