import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useBuilding } from "@/hooks/useBuilding";
import { useProfile } from "@/hooks/useProfile";
import { useSeedData } from "@/hooks/useSeedData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

function SettingsContent() {
  const { building, isLoading: buildingLoading, updateBuilding } = useBuilding();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const { seed, isSeeding } = useSeedData();

  const [buildingName, setBuildingName] = useState("");
  const [address, setAddress] = useState("");
  const [monthlyFee, setMonthlyFee] = useState("0");
  const [isSavingBuilding, setIsSavingBuilding] = useState(false);

  const [fullName, setFullName] = useState("");
  const [mobilePhone, setMobilePhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (building) {
      setBuildingName(building.name);
      setAddress(building.address || "");
      setMonthlyFee(building.monthly_fee.toString());
    }
  }, [building]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setMobilePhone(profile.mobile_phone);
      setNationalId(profile.national_id);
    }
  }, [profile]);

  const handleSaveBuilding = async () => {
    setIsSavingBuilding(true);
    try {
      await updateBuilding.mutateAsync({
        name: buildingName,
        address: address || null,
        monthly_fee: parseFloat(monthlyFee),
      });
      toast.success("Configuración del edificio guardada");
    } catch (error) {
      toast.error("Error al guardar");
    } finally {
      setIsSavingBuilding(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await updateProfile.mutateAsync({
        full_name: fullName,
        mobile_phone: mobilePhone,
        national_id: nationalId,
      });
      toast.success("Perfil actualizado");
    } catch (error) {
      toast.error("Error al actualizar");
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (buildingLoading || profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">
            Gestiona la configuración de tu edificio y perfil
          </p>
        </div>
        <Button variant="outline" onClick={seed} disabled={isSeeding}>
          {isSeeding ? "Generando..." : "Generar Datos de Prueba"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información del Edificio</CardTitle>
            <CardDescription>
              Actualiza los detalles de tu edificio y la cuota mensual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buildingName">Nombre del Edificio</Label>
              <Input
                id="buildingName"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyFee">Cuota Mensual ($)</Label>
              <Input
                id="monthlyFee"
                type="number"
                step="0.01"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
              />
            </div>

            <Button onClick={handleSaveBuilding} disabled={isSavingBuilding}>
              {isSavingBuilding ? "Guardando..." : "Guardar Edificio"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Perfil del Administrador</CardTitle>
            <CardDescription>
              Actualiza tu información personal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobilePhone">Teléfono Móvil</Label>
              <Input
                id="mobilePhone"
                value={mobilePhone}
                onChange={(e) => setMobilePhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationalId">Cédula / ID Nacional</Label>
              <Input
                id="nationalId"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Correo Electrónico</Label>
              <Input
                value={profile?.email || ""}
                disabled
                className="bg-muted"
              />
            </div>

            <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
              {isSavingProfile ? "Guardando..." : "Guardar Perfil"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Settings() {
  return (
    <AppLayout>
      <SettingsContent />
    </AppLayout>
  );
}