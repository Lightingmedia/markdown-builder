-- =====================================================
-- LightRail DCIM+ Common Data Model (CDM) Schema
-- Platform Foundation for DCIM+ Telemetry & Agents
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- A1) Common Data Model - Core Asset Tables
-- =====================================================

-- Sites (Data Centers)
CREATE TABLE public.dcim_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    region TEXT,
    timezone TEXT DEFAULT 'UTC',
    pue_target DECIMAL(3,2) DEFAULT 1.40,
    capacity_mw DECIMAL(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rooms within sites
CREATE TABLE public.dcim_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.dcim_sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    floor TEXT,
    cooling_type TEXT DEFAULT 'air', -- air, liquid, hybrid
    power_capacity_kw DECIMAL(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rows within rooms
CREATE TABLE public.dcim_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.dcim_rooms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    aisle_type TEXT DEFAULT 'hot', -- hot, cold
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Racks
CREATE TABLE public.dcim_racks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    row_id UUID NOT NULL REFERENCES public.dcim_rows(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position INTEGER,
    u_capacity INTEGER DEFAULT 42,
    power_budget_kw DECIMAL(6,2),
    cooling_capacity_kw DECIMAL(6,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Nodes (Servers, Switches, Storage)
CREATE TABLE public.dcim_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rack_id UUID NOT NULL REFERENCES public.dcim_racks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    node_type TEXT NOT NULL, -- compute, storage, network, management
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    u_position INTEGER,
    u_height INTEGER DEFAULT 1,
    power_rating_w INTEGER,
    status TEXT DEFAULT 'online', -- online, offline, maintenance, failed
    firmware_version TEXT,
    driver_version TEXT,
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'::JSONB
);

-- GPUs/NPUs/Accelerators
CREATE TABLE public.dcim_accelerators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id UUID NOT NULL REFERENCES public.dcim_nodes(id) ON DELETE CASCADE,
    accelerator_type TEXT NOT NULL, -- gpu, tpu, npu, fpga
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    slot_position INTEGER,
    memory_gb INTEGER,
    tdp_w INTEGER,
    status TEXT DEFAULT 'online',
    driver_version TEXT,
    firmware_version TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- NICs and Network Links
CREATE TABLE public.dcim_network_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_node_id UUID REFERENCES public.dcim_nodes(id) ON DELETE CASCADE,
    target_node_id UUID REFERENCES public.dcim_nodes(id) ON DELETE CASCADE,
    source_port TEXT,
    target_port TEXT,
    speed_gbps INTEGER,
    link_type TEXT, -- ethernet, infiniband, nvlink, pcie
    status TEXT DEFAULT 'up',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Power Distribution (PDUs, UPS, Breakers)
CREATE TABLE public.dcim_power_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rack_id UUID REFERENCES public.dcim_racks(id) ON DELETE CASCADE,
    room_id UUID REFERENCES public.dcim_rooms(id) ON DELETE CASCADE,
    equipment_type TEXT NOT NULL, -- pdu, ups, breaker, utility_feed
    name TEXT NOT NULL,
    manufacturer TEXT,
    model TEXT,
    capacity_kw DECIMAL(10,2),
    redundancy_type TEXT DEFAULT 'N', -- N, N+1, 2N
    phases INTEGER DEFAULT 3,
    voltage INTEGER DEFAULT 480,
    status TEXT DEFAULT 'online',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cooling Equipment (CRACs, CDUs, Loops)
CREATE TABLE public.dcim_cooling_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.dcim_rooms(id) ON DELETE CASCADE,
    equipment_type TEXT NOT NULL, -- crac, cdu, chiller, cooling_loop, fan_wall
    name TEXT NOT NULL,
    manufacturer TEXT,
    model TEXT,
    capacity_kw DECIMAL(10,2),
    setpoint_c DECIMAL(4,1),
    status TEXT DEFAULT 'online',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- Workload Model - Jobs and Allocations
-- =====================================================

CREATE TABLE public.dcim_workloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.dcim_sites(id) ON DELETE CASCADE,
    job_id TEXT NOT NULL,
    job_name TEXT,
    scheduler_type TEXT, -- slurm, k8s, ray, custom
    model_signature TEXT, -- e.g., llama-70b, gpt-4-training
    workload_class TEXT, -- training, inference, finetuning
    signature_type TEXT, -- comm-heavy, compute-heavy, io-heavy, balanced
    priority INTEGER DEFAULT 5,
    gpu_count INTEGER,
    node_count INTEGER,
    status TEXT DEFAULT 'pending', -- pending, running, completed, failed, cancelled
    submitted_at TIMESTAMPTZ DEFAULT now(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Node allocations for workloads
CREATE TABLE public.dcim_workload_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workload_id UUID NOT NULL REFERENCES public.dcim_workloads(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES public.dcim_nodes(id) ON DELETE CASCADE,
    accelerator_ids UUID[],
    allocated_at TIMESTAMPTZ DEFAULT now(),
    released_at TIMESTAMPTZ
);

-- =====================================================
-- Telemetry - Time-series metrics
-- =====================================================

CREATE TABLE public.dcim_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.dcim_sites(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL, -- node, accelerator, rack, pdu, cooling, link
    entity_id UUID NOT NULL,
    metric_type TEXT NOT NULL, -- power_w, temp_c, util_pct, flow_lpm, latency_ms, etc.
    value DECIMAL(12,4) NOT NULL,
    unit TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Create index for time-series queries
CREATE INDEX idx_dcim_telemetry_time ON public.dcim_telemetry (site_id, entity_type, timestamp DESC);
CREATE INDEX idx_dcim_telemetry_entity ON public.dcim_telemetry (entity_id, metric_type, timestamp DESC);

-- =====================================================
-- Events and Incidents
-- =====================================================

CREATE TABLE public.dcim_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.dcim_sites(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- alarm, anomaly, threshold_breach, config_change, job_event
    severity TEXT DEFAULT 'info', -- info, warning, error, critical
    entity_type TEXT,
    entity_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    source TEXT, -- agent, sensor, scheduler, operator
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID,
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX idx_dcim_events_time ON public.dcim_events (site_id, created_at DESC);

-- =====================================================
-- Agent Recommendations and Actions
-- =====================================================

CREATE TABLE public.dcim_agent_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.dcim_sites(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL, -- congestion, thermal, power, reliability, incident, capacity
    priority TEXT DEFAULT 'medium', -- low, medium, high, critical
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, executed, rolled_back
    title TEXT NOT NULL,
    description TEXT,
    reasoning TEXT, -- AI agent's reasoning
    evidence JSONB, -- metrics, timelines, diffs
    action_type TEXT, -- placement, fabric_policy, throttle, migrate, alert, setpoint
    action_payload JSONB, -- specific action parameters
    impact_scope TEXT, -- single_node, rack, row, room, site
    affected_entities UUID[],
    estimated_improvement JSONB, -- { metric: value, unit: string }
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    executed_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    verification_result JSONB,
    rolled_back BOOLEAN DEFAULT false,
    rolled_back_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dcim_recommendations_status ON public.dcim_agent_recommendations (site_id, status, created_at DESC);

-- =====================================================
-- Runbooks (Change Management)
-- =====================================================

CREATE TABLE public.dcim_runbooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.dcim_sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    trigger_conditions JSONB, -- when to auto-trigger
    prechecks JSONB, -- conditions that must pass
    steps JSONB NOT NULL, -- array of action steps
    verification JSONB, -- how to verify success
    rollback_steps JSONB,
    is_automated BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Runbook execution history
CREATE TABLE public.dcim_runbook_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    runbook_id UUID NOT NULL REFERENCES public.dcim_runbooks(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES public.dcim_agent_recommendations(id),
    status TEXT DEFAULT 'pending', -- pending, running, completed, failed, rolled_back
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    executed_by UUID,
    execution_log JSONB,
    metrics_before JSONB,
    metrics_after JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- MCP Adapter Registry
-- =====================================================

CREATE TABLE public.dcim_adapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.dcim_sites(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    adapter_type TEXT NOT NULL, -- telemetry, ticketing, scheduler, chatops, infra
    provider TEXT, -- prometheus, slurm, pagerduty, etc.
    capability_tier TEXT DEFAULT 'readonly', -- readonly, recommend, controlled, autonomous
    endpoint_url TEXT,
    auth_type TEXT, -- api_key, oauth, basic, mtls
    credentials_ref TEXT, -- reference to secrets manager
    capabilities JSONB, -- { discover: true, observe: true, act: false, verify: false }
    rate_limits JSONB,
    health_status TEXT DEFAULT 'unknown',
    last_health_check TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'::JSONB
);

-- =====================================================
-- Enable RLS
-- =====================================================

ALTER TABLE public.dcim_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcim_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcim_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcim_racks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcim_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcim_accelerators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcim_network_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcim_power_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcim_cooling_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcim_workloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcim_workload_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcim_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcim_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcim_agent_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcim_runbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcim_runbook_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dcim_adapters ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies (Site-scoped access)
-- =====================================================

-- Sites: users can only access their own sites
CREATE POLICY "Users can view own sites" ON public.dcim_sites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sites" ON public.dcim_sites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sites" ON public.dcim_sites FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sites" ON public.dcim_sites FOR DELETE USING (auth.uid() = user_id);

-- Rooms: access via site ownership
CREATE POLICY "Users can manage rooms" ON public.dcim_rooms FOR ALL USING (
    EXISTS (SELECT 1 FROM public.dcim_sites WHERE id = dcim_rooms.site_id AND user_id = auth.uid())
);

-- Rows: access via site ownership
CREATE POLICY "Users can manage rows" ON public.dcim_rows FOR ALL USING (
    EXISTS (SELECT 1 FROM public.dcim_rooms r JOIN public.dcim_sites s ON r.site_id = s.id WHERE r.id = dcim_rows.room_id AND s.user_id = auth.uid())
);

-- Racks: access via site ownership
CREATE POLICY "Users can manage racks" ON public.dcim_racks FOR ALL USING (
    EXISTS (SELECT 1 FROM public.dcim_rows ro JOIN public.dcim_rooms rm ON ro.room_id = rm.id JOIN public.dcim_sites s ON rm.site_id = s.id WHERE ro.id = dcim_racks.row_id AND s.user_id = auth.uid())
);

-- Nodes: access via site ownership
CREATE POLICY "Users can manage nodes" ON public.dcim_nodes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.dcim_racks ra JOIN public.dcim_rows ro ON ra.row_id = ro.id JOIN public.dcim_rooms rm ON ro.room_id = rm.id JOIN public.dcim_sites s ON rm.site_id = s.id WHERE ra.id = dcim_nodes.rack_id AND s.user_id = auth.uid())
);

-- Accelerators: access via site ownership
CREATE POLICY "Users can manage accelerators" ON public.dcim_accelerators FOR ALL USING (
    EXISTS (SELECT 1 FROM public.dcim_nodes n JOIN public.dcim_racks ra ON n.rack_id = ra.id JOIN public.dcim_rows ro ON ra.row_id = ro.id JOIN public.dcim_rooms rm ON ro.room_id = rm.id JOIN public.dcim_sites s ON rm.site_id = s.id WHERE n.id = dcim_accelerators.node_id AND s.user_id = auth.uid())
);

-- Network links: access via site ownership (source node)
CREATE POLICY "Users can manage network_links" ON public.dcim_network_links FOR ALL USING (
    EXISTS (SELECT 1 FROM public.dcim_nodes n JOIN public.dcim_racks ra ON n.rack_id = ra.id JOIN public.dcim_rows ro ON ra.row_id = ro.id JOIN public.dcim_rooms rm ON ro.room_id = rm.id JOIN public.dcim_sites s ON rm.site_id = s.id WHERE n.id = dcim_network_links.source_node_id AND s.user_id = auth.uid())
);

-- Power equipment: access via room or rack site ownership
CREATE POLICY "Users can manage power_equipment" ON public.dcim_power_equipment FOR ALL USING (
    EXISTS (SELECT 1 FROM public.dcim_rooms rm JOIN public.dcim_sites s ON rm.site_id = s.id WHERE rm.id = dcim_power_equipment.room_id AND s.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.dcim_racks ra JOIN public.dcim_rows ro ON ra.row_id = ro.id JOIN public.dcim_rooms rm ON ro.room_id = rm.id JOIN public.dcim_sites s ON rm.site_id = s.id WHERE ra.id = dcim_power_equipment.rack_id AND s.user_id = auth.uid())
);

-- Cooling equipment: access via room site ownership
CREATE POLICY "Users can manage cooling_equipment" ON public.dcim_cooling_equipment FOR ALL USING (
    EXISTS (SELECT 1 FROM public.dcim_rooms rm JOIN public.dcim_sites s ON rm.site_id = s.id WHERE rm.id = dcim_cooling_equipment.room_id AND s.user_id = auth.uid())
);

-- Workloads: access via site ownership
CREATE POLICY "Users can manage workloads" ON public.dcim_workloads FOR ALL USING (
    EXISTS (SELECT 1 FROM public.dcim_sites WHERE id = dcim_workloads.site_id AND user_id = auth.uid())
);

-- Workload allocations: access via site ownership
CREATE POLICY "Users can manage workload_allocations" ON public.dcim_workload_allocations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.dcim_workloads w JOIN public.dcim_sites s ON w.site_id = s.id WHERE w.id = dcim_workload_allocations.workload_id AND s.user_id = auth.uid())
);

-- Telemetry: access via site ownership
CREATE POLICY "Users can manage telemetry" ON public.dcim_telemetry FOR ALL USING (
    EXISTS (SELECT 1 FROM public.dcim_sites WHERE id = dcim_telemetry.site_id AND user_id = auth.uid())
);

-- Events: access via site ownership
CREATE POLICY "Users can manage events" ON public.dcim_events FOR ALL USING (
    EXISTS (SELECT 1 FROM public.dcim_sites WHERE id = dcim_events.site_id AND user_id = auth.uid())
);

-- Agent recommendations: access via site ownership
CREATE POLICY "Users can manage agent_recommendations" ON public.dcim_agent_recommendations FOR ALL USING (
    EXISTS (SELECT 1 FROM public.dcim_sites WHERE id = dcim_agent_recommendations.site_id AND user_id = auth.uid())
);

-- Runbooks: access via site ownership
CREATE POLICY "Users can manage runbooks" ON public.dcim_runbooks FOR ALL USING (
    EXISTS (SELECT 1 FROM public.dcim_sites WHERE id = dcim_runbooks.site_id AND user_id = auth.uid())
);

-- Runbook executions: access via runbook site ownership
CREATE POLICY "Users can manage runbook_executions" ON public.dcim_runbook_executions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.dcim_runbooks r JOIN public.dcim_sites s ON r.site_id = s.id WHERE r.id = dcim_runbook_executions.runbook_id AND s.user_id = auth.uid())
);

-- Adapters: access via site ownership
CREATE POLICY "Users can manage adapters" ON public.dcim_adapters FOR ALL USING (
    EXISTS (SELECT 1 FROM public.dcim_sites WHERE id = dcim_adapters.site_id AND user_id = auth.uid())
);

-- =====================================================
-- Triggers for updated_at
-- =====================================================

CREATE TRIGGER update_dcim_sites_updated_at BEFORE UPDATE ON public.dcim_sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dcim_runbooks_updated_at BEFORE UPDATE ON public.dcim_runbooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Enable Realtime for key tables
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.dcim_telemetry;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dcim_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dcim_agent_recommendations;