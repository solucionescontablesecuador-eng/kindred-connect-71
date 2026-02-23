import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { CollectionProgress } from "@/components/dashboard/CollectionProgress";
import { useBuilding } from "@/hooks/useBuilding";
import { useApartments } from "@/hooks/useApartments";
import { usePayments } from "@/hooks/usePayments";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardContent() {
  const { building, isLoading: buildingLoading } = useBuilding();
  const { apartments, isLoading: apartmentsLoading } = useApartments();
  const currentYear = new Date().getFullYear();
  const { payments, isLoading: paymentsLoading, calculateStats } = usePayments(currentYear);
  
  const isLoading = buildingLoading || apartmentsLoading || paymentsLoading;
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel de Control</h1>
        <p className="text-muted-foreground">
          Resumen de {building?.name || "tu edificio"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Total Apartamentos" 
          value={stats.totalApartments} 
          description="Registrados en tu edificio" 
          trend="neutral" 
        />

        <StatCard 
          title="Pagados al Día" 
          value={stats.paidApartments} 
          description={`${(stats.paidApartments / Math.max(stats.totalApartments, 1) * 100).toFixed(0)}% de los apartamentos`} 
          trend="up" 
        />

        <StatCard 
          title="Pagos Pendientes" 
          value={stats.pendingApartments} 
          description="Apartamentos con saldo pendiente" 
          trend={stats.pendingApartments > 0 ? "down" : "neutral"} 
        />

        <StatCard 
          title="Recaudado (Este Mes)" 
          value={formatCurrency(stats.totalCollected)} 
          description="Monto total recaudado" 
          trend="up" 
        />

        <StatCard 
          title="Meta Mensual" 
          value={formatCurrency(stats.monthlyTarget)} 
          description={`${stats.totalApartments} apartamentos × ${formatCurrency(building?.monthly_fee || 0)}`} 
          trend="neutral" 
        />

        <StatCard 
          title="Cuota Mensual" 
          value={formatCurrency(building?.monthly_fee || 0)} 
          description="Por apartamento" 
          trend="neutral" 
        />
      </div>

      <CollectionProgress collected={stats.totalCollected} target={stats.monthlyTarget} percentage={stats.collectionProgress} />
    </div>
  );
}

export default function Dashboard() {
  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  );
}