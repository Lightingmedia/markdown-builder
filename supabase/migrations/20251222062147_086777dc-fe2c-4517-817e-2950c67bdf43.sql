-- Accelerator specs table for GPU/TPU hardware specifications
CREATE TABLE public.accelerator_specs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor TEXT NOT NULL, -- nvidia, google, amd
    model TEXT NOT NULL, -- A100, H100, TPU v5
    arch TEXT, -- Ampere, Hopper, etc.
    memory_gb NUMERIC NOT NULL,
    mem_bandwidth_gbps NUMERIC,
    peak_fp16_tflops NUMERIC,
    tdp_w NUMERIC NOT NULL, -- Thermal Design Power in watts
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(vendor, model)
);

-- Benchmark measurements for workloads
CREATE TABLE public.benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accelerator_id UUID REFERENCES public.accelerator_specs(id) ON DELETE CASCADE,
    workload_type TEXT NOT NULL, -- pretrain, inference, finetune
    model_name TEXT NOT NULL, -- llama-70b, gpt-4, etc.
    tokens_per_second NUMERIC,
    avg_power_w_per_device NUMERIC,
    energy_kwh_total NUMERIC,
    batch_size INTEGER,
    precision TEXT, -- fp16, bf16, int8
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Facility/region environmental coefficients
CREATE TABLE public.facility_coefficients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_code TEXT NOT NULL UNIQUE, -- us-central1, europe-west1
    region_name TEXT,
    provider TEXT DEFAULT 'gcp', -- gcp, aws, azure
    pue NUMERIC NOT NULL DEFAULT 1.1, -- Power Usage Effectiveness
    wue_l_per_kwh NUMERIC DEFAULT 1.8, -- Water Usage Effectiveness (liters per kWh)
    grid_co2_kg_per_kwh NUMERIC DEFAULT 0.4, -- Carbon intensity
    renewable_pct NUMERIC DEFAULT 0, -- Renewable energy percentage
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Real-time job run telemetry
CREATE TABLE public.job_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    job_name TEXT NOT NULL,
    accelerator_id UUID REFERENCES public.accelerator_specs(id),
    facility_id UUID REFERENCES public.facility_coefficients(id),
    workload_type TEXT,
    model_name TEXT,
    device_count INTEGER DEFAULT 1,
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ,
    avg_gpu_util_pct NUMERIC,
    peak_gpu_util_pct NUMERIC,
    avg_power_w NUMERIC,
    energy_kwh_total NUMERIC,
    water_l_estimated NUMERIC,
    co2_kg_estimated NUMERIC,
    cloud_cost_usd NUMERIC,
    tokens_processed BIGINT,
    status TEXT DEFAULT 'running', -- running, completed, failed
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.accelerator_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_coefficients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_runs ENABLE ROW LEVEL SECURITY;

-- Accelerator specs are public read
CREATE POLICY "Anyone can view accelerator specs"
ON public.accelerator_specs FOR SELECT
USING (true);

CREATE POLICY "Admins can manage accelerator specs"
ON public.accelerator_specs FOR ALL
USING (is_admin());

-- Benchmarks are public read
CREATE POLICY "Anyone can view benchmarks"
ON public.benchmarks FOR SELECT
USING (true);

CREATE POLICY "Admins can manage benchmarks"
ON public.benchmarks FOR ALL
USING (is_admin());

-- Facility coefficients are public read
CREATE POLICY "Anyone can view facility coefficients"
ON public.facility_coefficients FOR SELECT
USING (true);

CREATE POLICY "Admins can manage facility coefficients"
ON public.facility_coefficients FOR ALL
USING (is_admin());

-- Job runs are user-scoped
CREATE POLICY "Users can view own job runs"
ON public.job_runs FOR SELECT
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own job runs"
ON public.job_runs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own job runs"
ON public.job_runs FOR UPDATE
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can delete own job runs"
ON public.job_runs FOR DELETE
USING (auth.uid() = user_id OR is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_accelerator_specs_updated_at
BEFORE UPDATE ON public.accelerator_specs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_facility_coefficients_updated_at
BEFORE UPDATE ON public.facility_coefficients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert reference data for accelerators
INSERT INTO public.accelerator_specs (vendor, model, arch, memory_gb, mem_bandwidth_gbps, peak_fp16_tflops, tdp_w) VALUES
('nvidia', 'A100-40GB', 'Ampere', 40, 1555, 312, 400),
('nvidia', 'A100-80GB', 'Ampere', 80, 2039, 312, 400),
('nvidia', 'H100-80GB', 'Hopper', 80, 3350, 1979, 700),
('nvidia', 'H200', 'Hopper', 141, 4800, 1979, 700),
('nvidia', 'B200', 'Blackwell', 192, 8000, 4500, 1000),
('google', 'TPU v4', 'TPU', 32, 1200, 275, 192),
('google', 'TPU v5e', 'TPU', 16, 819, 197, 150),
('google', 'TPU v5p', 'TPU', 95, 2765, 459, 250),
('amd', 'MI300X', 'CDNA3', 192, 5300, 1307, 750);

-- Insert reference facility data
INSERT INTO public.facility_coefficients (region_code, region_name, provider, pue, wue_l_per_kwh, grid_co2_kg_per_kwh, renewable_pct) VALUES
('us-central1', 'Iowa', 'gcp', 1.10, 1.1, 0.35, 75),
('us-east4', 'Virginia', 'gcp', 1.08, 1.5, 0.30, 95),
('europe-west1', 'Belgium', 'gcp', 1.08, 0.8, 0.15, 100),
('europe-north1', 'Finland', 'gcp', 1.07, 0.3, 0.08, 100),
('asia-east1', 'Taiwan', 'gcp', 1.12, 2.2, 0.55, 25),
('us-west1', 'Oregon', 'gcp', 1.09, 0.5, 0.10, 90);

-- Insert sample benchmark data
INSERT INTO public.benchmarks (accelerator_id, workload_type, model_name, tokens_per_second, avg_power_w_per_device, energy_kwh_total, batch_size, precision)
SELECT id, 'pretrain', 'llama-70b', 850, 380, 45.6, 32, 'bf16' FROM public.accelerator_specs WHERE model = 'A100-80GB'
UNION ALL
SELECT id, 'pretrain', 'llama-70b', 2100, 650, 31.2, 64, 'bf16' FROM public.accelerator_specs WHERE model = 'H100-80GB'
UNION ALL
SELECT id, 'inference', 'llama-70b', 45, 320, 0.08, 1, 'fp16' FROM public.accelerator_specs WHERE model = 'A100-80GB'
UNION ALL
SELECT id, 'inference', 'llama-70b', 120, 550, 0.05, 1, 'fp16' FROM public.accelerator_specs WHERE model = 'H100-80GB';