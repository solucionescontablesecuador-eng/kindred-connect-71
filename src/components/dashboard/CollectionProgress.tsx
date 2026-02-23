import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CollectionProgressProps {
  collected: number;
  target: number;
  percentage: number;
}

export function CollectionProgress({ collected, target, percentage }: CollectionProgressProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-lg">Monthly Collection Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Collected this month</span>
          <span className="font-semibold">{formatCurrency(collected)}</span>
        </div>
        <Progress value={percentage} className="h-3" />
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-primary">{percentage.toFixed(1)}% of target</span>
          <span className="text-muted-foreground">Target: {formatCurrency(target)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
