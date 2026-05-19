
-- Lock down dc_endpoints (contains api_keys)
DROP POLICY IF EXISTS "Allow public delete to dc_endpoints" ON public.dc_endpoints;
DROP POLICY IF EXISTS "Allow public insert to dc_endpoints" ON public.dc_endpoints;
DROP POLICY IF EXISTS "Allow public read access to dc_endpoints" ON public.dc_endpoints;
DROP POLICY IF EXISTS "Allow public update to dc_endpoints" ON public.dc_endpoints;

CREATE POLICY "Admins can read dc_endpoints"
  ON public.dc_endpoints FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can insert dc_endpoints"
  ON public.dc_endpoints FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update dc_endpoints"
  ON public.dc_endpoints FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete dc_endpoints"
  ON public.dc_endpoints FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Lock down dc_telemetry
DROP POLICY IF EXISTS "Allow public insert to dc_telemetry" ON public.dc_telemetry;
DROP POLICY IF EXISTS "Allow public read access to dc_telemetry" ON public.dc_telemetry;

CREATE POLICY "Authenticated users can read dc_telemetry"
  ON public.dc_telemetry FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert dc_telemetry"
  ON public.dc_telemetry FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());
