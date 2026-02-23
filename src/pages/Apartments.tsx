import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ApartmentForm } from "@/components/apartments/ApartmentForm";
import { ApartmentCard } from "@/components/apartments/ApartmentCard";
import { useApartments, Apartment } from "@/hooks/useApartments";
import { usePayments } from "@/hooks/usePayments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ApartmentFormData } from "@/lib/validations";

function ApartmentsContent() {
  const { apartments, isLoading, createApartment, updateApartment, deleteApartment } = useApartments();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const { payments } = usePayments(currentYear);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null);
  const [deletingApartment, setDeletingApartment] = useState<Apartment | null>(null);

  const filteredApartments = apartments.filter(apt => 
    apt.apartment_number.toLowerCase().includes(search.toLowerCase()) || 
    apt.owner_full_name.toLowerCase().includes(search.toLowerCase())
  );

  const isApartmentPaidThisMonth = (apartmentId: string) => {
    const payment = payments.find(p => p.apartment_id === apartmentId && p.month === currentMonth);
    return payment?.status === "paid";
  };

  const handleCreate = async (data: ApartmentFormData) => {
    try {
      await createApartment.mutateAsync({
        apartment_number: data.apartmentNumber,
        owner_full_name: data.ownerFullName,
        mobile_phone: data.mobilePhone,
        email: data.email,
        national_id: data.nationalId
      });
      toast.success("Apartamento creado con éxito");
    } catch (error: any) {
      toast.error("Error al crear el apartamento");
      throw error;
    }
  };

  const handleEdit = (apartment: Apartment) => {
    setEditingApartment(apartment);
  };

  const handleUpdate = async (data: ApartmentFormData) => {
    if (!editingApartment) return;
    try {
      await updateApartment.mutateAsync({
        id: editingApartment.id,
        apartment_number: data.apartmentNumber,
        owner_full_name: data.ownerFullName,
        mobile_phone: data.mobilePhone,
        email: data.email,
        national_id: data.nationalId
      });
      toast.success("Apartamento actualizado con éxito");
      setEditingApartment(null);
    } catch (error) {
      toast.error("Error al actualizar el apartamento");
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deletingApartment) return;
    try {
      await deleteApartment.mutateAsync(deletingApartment.id);
      toast.success("Apartamento eliminado con éxito");
      setDeletingApartment(null);
    } catch (error) {
      toast.error("Error al eliminar el apartamento");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Apartamentos</h1>
          <p className="text-muted-foreground">
            Gestiona los apartamentos y sus propietarios
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          Añadir Apartamento
        </Button>
      </div>

      <div className="relative">
        <Input 
          placeholder="Buscar apartamentos..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      {filteredApartments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <h3 className="text-lg font-medium">No se encontraron apartamentos</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {search ? "Prueba con otro término de búsqueda" : "Comienza añadiendo tu primer apartamento"}
          </p>
          {!search && (
            <Button onClick={() => setFormOpen(true)} className="mt-4">
              Añadir Apartamento
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredApartments.map(apartment => (
            <ApartmentCard 
              key={apartment.id} 
              apartment={apartment} 
              isPaidThisMonth={isApartmentPaidThisMonth(apartment.id)} 
              onEdit={handleEdit} 
              onDelete={setDeletingApartment} 
            />
          ))}
        </div>
      )}

      <ApartmentForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} />

      {editingApartment && (
        <ApartmentForm 
          open={!!editingApartment} 
          onOpenChange={open => !open && setEditingApartment(null)} 
          onSubmit={handleUpdate} 
          initialData={{
            apartmentNumber: editingApartment.apartment_number,
            ownerFullName: editingApartment.owner_full_name,
            mobilePhone: editingApartment.mobile_phone,
            email: editingApartment.email,
            nationalId: editingApartment.national_id
          }} 
          isEditing 
        />
      )}

      <AlertDialog open={!!deletingApartment} onOpenChange={open => !open && setDeletingApartment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Apartamento</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar el Apartamento {deletingApartment?.apartment_number}? 
              Esta acción no se puede deshacer.
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
  );
}

export default function Apartments() {
  return (
    <AppLayout>
      <ApartmentsContent />
    </AppLayout>
  );
}