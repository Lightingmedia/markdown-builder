-- Create table for DC API infrastructure endpoints
CREATE TABLE public.dc_endpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('compute', 'cooling', 'power')),
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('connected', 'pending', 'warning', 'disconnected')),
  api_key TEXT,
  last_ping TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for DC API telemetry stream
CREATE TABLE public.dc_telemetry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint_id UUID REFERENCES public.dc_endpoints(id) ON DELETE CASCADE,
  endpoint_name TEXT NOT NULL,
  endpoint_type TEXT NOT NULL,
  temperature_c NUMERIC,
  power_w NUMERIC,
  utilization_pct NUMERIC,
  flow_lpm NUMERIC,
  pressure_bar NUMERIC,
  leak_status TEXT,
  load_kw NUMERIC,
  voltage_v NUMERIC,
  power_factor NUMERIC,
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dc_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dc_telemetry ENABLE ROW LEVEL SECURITY;

-- Public read access for dc_endpoints (admin app)
CREATE POLICY "Allow public read access to dc_endpoints"
ON public.dc_endpoints
FOR SELECT
USING (true);

-- Public insert/update for dc_endpoints
CREATE POLICY "Allow public insert to dc_endpoints"
ON public.dc_endpoints
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update to dc_endpoints"
ON public.dc_endpoints
FOR UPDATE
USING (true);

CREATE POLICY "Allow public delete to dc_endpoints"
ON public.dc_endpoints
FOR DELETE
USING (true);

-- Public read access for telemetry
CREATE POLICY "Allow public read access to dc_telemetry"
ON public.dc_telemetry
FOR SELECT
USING (true);

-- Public insert for telemetry (from edge function)
CREATE POLICY "Allow public insert to dc_telemetry"
ON public.dc_telemetry
FOR INSERT
WITH CHECK (true);

-- Enable realtime for telemetry
ALTER PUBLICATION supabase_realtime ADD TABLE public.dc_telemetry;

-- Trigger for updated_at
CREATE TRIGGER update_dc_endpoints_updated_at
BEFORE UPDATE ON public.dc_endpoints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();