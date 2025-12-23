-- Create table for global data center distribution by country
CREATE TABLE public.global_datacenter_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL,
  country TEXT NOT NULL,
  total_datacenters INTEGER NOT NULL DEFAULT 0,
  datacenters_with_metrics INTEGER DEFAULT 0,
  datacenters_whitespace_na INTEGER DEFAULT 0,
  datacenters_grosspower_na INTEGER DEFAULT 0,
  available_whitespace_data INTEGER DEFAULT 0,
  available_grosspower_data INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(region, country)
);

-- Enable RLS
ALTER TABLE public.global_datacenter_stats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view (public reference data)
CREATE POLICY "Anyone can view datacenter stats"
ON public.global_datacenter_stats
FOR SELECT
USING (true);

-- Only admins can manage
CREATE POLICY "Admins can manage datacenter stats"
ON public.global_datacenter_stats
FOR ALL
USING (is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_global_datacenter_stats_updated_at
BEFORE UPDATE ON public.global_datacenter_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();