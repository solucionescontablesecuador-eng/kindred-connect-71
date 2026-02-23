-- Create enum for payment status
CREATE TYPE public.payment_status AS ENUM ('paid', 'pending');

-- Create buildings table (each admin manages one building)
CREATE TABLE public.buildings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    monthly_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(admin_id)
);

-- Create profiles table for admin information
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name TEXT NOT NULL,
    mobile_phone TEXT NOT NULL,
    email TEXT NOT NULL,
    national_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create apartments table
CREATE TABLE public.apartments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    apartment_number TEXT NOT NULL,
    owner_full_name TEXT NOT NULL,
    mobile_phone TEXT NOT NULL,
    email TEXT NOT NULL,
    national_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(building_id, apartment_number)
);

-- Create payments table
CREATE TABLE public.payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    apartment_id UUID NOT NULL REFERENCES public.apartments(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    payment_date DATE,
    status public.payment_status NOT NULL DEFAULT 'pending',
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(apartment_id, year, month)
);

-- Enable RLS on all tables
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for buildings
CREATE POLICY "Admins can view their own building"
ON public.buildings FOR SELECT
USING (auth.uid() = admin_id);

CREATE POLICY "Admins can create their own building"
ON public.buildings FOR INSERT
WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can update their own building"
ON public.buildings FOR UPDATE
USING (auth.uid() = admin_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for apartments (only building admin can access)
CREATE POLICY "Admins can view apartments in their building"
ON public.apartments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.buildings 
        WHERE buildings.id = apartments.building_id 
        AND buildings.admin_id = auth.uid()
    )
);

CREATE POLICY "Admins can create apartments in their building"
ON public.apartments FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.buildings 
        WHERE buildings.id = apartments.building_id 
        AND buildings.admin_id = auth.uid()
    )
);

CREATE POLICY "Admins can update apartments in their building"
ON public.apartments FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.buildings 
        WHERE buildings.id = apartments.building_id 
        AND buildings.admin_id = auth.uid()
    )
);

CREATE POLICY "Admins can delete apartments in their building"
ON public.apartments FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.buildings 
        WHERE buildings.id = apartments.building_id 
        AND buildings.admin_id = auth.uid()
    )
);

-- RLS Policies for payments (only building admin can access)
CREATE POLICY "Admins can view payments for their building apartments"
ON public.payments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.apartments
        JOIN public.buildings ON buildings.id = apartments.building_id
        WHERE apartments.id = payments.apartment_id 
        AND buildings.admin_id = auth.uid()
    )
);

CREATE POLICY "Admins can create payments for their building apartments"
ON public.payments FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.apartments
        JOIN public.buildings ON buildings.id = apartments.building_id
        WHERE apartments.id = payments.apartment_id 
        AND buildings.admin_id = auth.uid()
    )
);

CREATE POLICY "Admins can update payments for their building apartments"
ON public.payments FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.apartments
        JOIN public.buildings ON buildings.id = apartments.building_id
        WHERE apartments.id = payments.apartment_id 
        AND buildings.admin_id = auth.uid()
    )
);

CREATE POLICY "Admins can delete payments for their building apartments"
ON public.payments FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.apartments
        JOIN public.buildings ON buildings.id = apartments.building_id
        WHERE apartments.id = payments.apartment_id 
        AND buildings.admin_id = auth.uid()
    )
);

-- Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-receipts', 'payment-receipts', false);

-- Storage policies for payment receipts
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-receipts');

CREATE POLICY "Users can view their building receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'payment-receipts');

CREATE POLICY "Users can update their building receipts"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'payment-receipts');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_buildings_updated_at
    BEFORE UPDATE ON public.buildings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_apartments_updated_at
    BEFORE UPDATE ON public.apartments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();