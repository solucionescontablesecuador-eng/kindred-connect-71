import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useExtraordinaryFees, ExtraordinaryFee, ExtraordinaryPayment } from "@/hooks/useExtraordinaryFees";
import { useApartments, Apartment } from "@/hooks/useApartments";
import { ExtraordinaryFeeCard } from "@/components/extraordinary/ExtraordinaryFeeCard";
import { ExtraordinaryFeeForm } from "@/components/extraordinary/ExtraordinaryFeeForm";
import { ExtraordinaryDetailsModal } from "@/components/extraordinary/ExtraordinaryDetailsModal";
import { ExtraordinaryPaymentModal } from "@/components/extraordinary/ExtraordinaryPaymentModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function ExtraordinaryFees() {
  const { fees = [], payments = [], isLoading, createFee, updateFee, deleteFee, updatePayment, uploadReceipt } = useExtraordinaryFees();
  const { apartments = [] } = useApartments();
  
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<ExtraordinaryFee | null>(null);
  const [deletingFee, setDeletingFee] = useState<ExtraordinaryFee | null>(null);
  const [viewingDetails, setViewingDetails] = useState<ExtraordinaryFee | null>(null);
  
  const [payingApt, setPayingApt] = useState<{ apt: Apartment, payment: ExtraordinaryPayment | null } | null>(null);

  const filteredFees = (fees || []).filter(f => 
    f.title.toLowerCase().includes(search.toLowerCase()) || 
    f.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateOrUpdate = async (data: any) => {
    try {
      if (editingFee) {
        await updateFee.mutateAsync({ id: editingFee.id, ...data });
        toast.success("Cuota actualizada");
      } else {
        await createFee.mutateAsync(data);
        toast.success("Cuota creada con éxito");
      }
      setEditingFee(null);
      setFormOpen(false);
    } catch (error) {
      toast.error("Error al procesar la cuota");
    }
  };

  const handleDelete = async () => {
    if (!deletingFee) return;
    try {
      await deleteFee.mutateAsync(deletingFee.id);
      toast.success("Cuota eliminada");
      setDeletingFee(null);
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  const handleSavePayment = async (paymentData: any) => {
    try {
      await updatePayment.mutateAsync(paymentData);
      toast.success("Pago registrado correctamente");
      setPayingApt(null);
    } catch (error) {
      toast.error("Error al registrar pago");
    }
  };

  const handleMarkPending = async (apt: Apartment, payment: ExtraordinaryPayment) => {
    if (window.confirm(`¿Anular el pago del Apt. ${apt.apartment_number}?`)) {
      try {
        await updatePayment.mutateAsync({
          fee_id: payment.fee_id,
          apartment_id: apt.id,
          status: "pending",
          amount_paid: 0,
          payment_date: null,
          receipt_url: null
        });
        toast.success("Pago anulado");
      } catch (error) {
        toast.error("Error al anular");
      }
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between"><Skeleton className="h-10 w-48" /><Skeleton className="h-10 w-32" /></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Cuotas Extraordinarias</h1>
            <p className="text-muted-foreground">Gestiona proyectos y cobros especiales</p>
          </div>
          <Button onClick={() => { setEditingFee(null); setFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Nueva Cuota
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Buscar cuotas..." 
            className="pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {filteredFees.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <h3 className="text-lg font-medium">No hay cuotas extraordinarias</h3>
            <p className="text-sm text-muted-foreground">Crea una nueva cuota para empezar a recaudar fondos.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFees.map(fee => {
              const feePayments = (payments || []).filter(p => p.fee_id === fee.id);
              const paidCount = feePayments.filter(p => p.status === "paid").length;
              
              return (
                <ExtraordinaryFeeCard 
                  key={fee.id}
                  fee={fee}
                  paidCount={paidCount}
                  totalCount={apartments.length}
                  onEdit={(f) => { setEditingFee(f); setFormOpen(true); }}
                  onDelete={setDeletingFee}
                  onViewDetails={setViewingDetails}
                />
              );
            })}
          </div>
        )}

        <ExtraordinaryFeeForm 
          open={formOpen} 
          onOpenChange={setFormOpen} 
          onSubmit={handleCreateOrUpdate}
          initialData={editingFee}
        />

        <ExtraordinaryDetailsModal 
          open={!!viewingDetails}
          onOpenChange={(open) => !open && setViewingDetails(null)}
          fee={viewingDetails}
          apartments={apartments}
          payments={(payments || []).filter(p => p.fee_id === viewingDetails?.id)}
          onMarkPaid={(apt, payment) => setPayingApt({ apt, payment })}
          onMarkPending={handleMarkPending}
        />

        {payingApt && viewingDetails && (
          <ExtraordinaryPaymentModal 
            open={!!payingApt}
            onOpenChange={(open) => !open && setPayingApt(null)}
            apartment={payingApt.apt}
            fee={viewingDetails}
            payment={payingApt.payment}
            onSave={handleSavePayment}
            onUpload={uploadReceipt}
          />
        )}

        <AlertDialog open={!!deletingFee} onOpenChange={open => !open && setDeletingFee(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar cuota?</AlertDialogTitle>
              <AlertDialogDescription>
                Se borrarán todos los registros de pago asociados a "{deletingFee?.title}". Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}