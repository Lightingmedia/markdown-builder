-- Add multi-vendor accelerator support columns to raw_telemetry
ALTER TABLE public.raw_telemetry 
ADD COLUMN IF NOT EXISTS accelerator_vendor TEXT DEFAULT 'nvidia',
ADD COLUMN IF NOT EXISTS tpu_wattage NUMERIC,
ADD COLUMN IF NOT EXISTS tpu_utilization NUMERIC,
ADD COLUMN IF NOT EXISTS tpu_memory_gb NUMERIC,
ADD COLUMN IF NOT EXISTS amd_gpu_wattage NUMERIC,
ADD COLUMN IF NOT EXISTS amd_utilization NUMERIC,
ADD COLUMN IF NOT EXISTS amd_memory_gb NUMERIC,
ADD COLUMN IF NOT EXISTS nvidia_utilization NUMERIC,
ADD COLUMN IF NOT EXISTS nvidia_memory_gb NUMERIC;

-- Add index for filtering by accelerator vendor
CREATE INDEX IF NOT EXISTS idx_raw_telemetry_accelerator_vendor ON public.raw_telemetry(accelerator_vendor);

-- Add comment for documentation
COMMENT ON COLUMN public.raw_telemetry.accelerator_vendor IS 'Accelerator vendor: nvidia, google_tpu, amd';
COMMENT ON COLUMN public.raw_telemetry.tpu_wattage IS 'Google TPU power consumption in watts';
COMMENT ON COLUMN public.raw_telemetry.amd_gpu_wattage IS 'AMD GPU power consumption in watts';