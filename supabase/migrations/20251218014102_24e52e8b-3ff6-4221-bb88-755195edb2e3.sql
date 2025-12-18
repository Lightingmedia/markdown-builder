-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.is_admin());

-- Update existing tables to restrict user access

-- raw_telemetry: Users see only their own, admins see all
DROP POLICY IF EXISTS "Users can view own telemetry" ON public.raw_telemetry;
CREATE POLICY "Users can view own telemetry" ON public.raw_telemetry
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- processed_metrics: Users see only their own, admins see all
DROP POLICY IF EXISTS "Users can view own metrics" ON public.processed_metrics;
CREATE POLICY "Users can view own metrics" ON public.processed_metrics
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- recommendations: Users see only their own, admins see all
DROP POLICY IF EXISTS "Users can view own recommendations" ON public.recommendations;
CREATE POLICY "Users can view own recommendations" ON public.recommendations
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own recommendations" ON public.recommendations;
CREATE POLICY "Users can update own recommendations" ON public.recommendations
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- profiles: Users see only their own, admins see all
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- Admins can insert recommendations for any user
CREATE POLICY "Admins can insert any recommendations" ON public.recommendations
  FOR INSERT WITH CHECK (public.is_admin());

-- Admins can insert telemetry for any user
CREATE POLICY "Admins can insert any telemetry" ON public.raw_telemetry
  FOR INSERT WITH CHECK (public.is_admin());

-- Admins can insert metrics for any user
CREATE POLICY "Admins can insert any metrics" ON public.processed_metrics
  FOR INSERT WITH CHECK (public.is_admin());

-- Trigger to auto-assign 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();