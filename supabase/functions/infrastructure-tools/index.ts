import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { tool, params } = await req.json();
    console.log(`Infrastructure tool called: ${tool}`, params);

    let result: unknown;

    switch (tool) {
      case "lookup_accelerator_specs": {
        const { vendor, model } = params || {};
        let query = supabase.from("accelerator_specs").select("*");
        if (vendor) query = query.eq("vendor", vendor);
        if (model) query = query.ilike("model", `%${model}%`);
        const { data, error } = await query;
        if (error) throw error;
        result = data;
        break;
      }

      case "get_benchmark_profile": {
        const { workload_type, model_name, accelerator_model } = params || {};
        let query = supabase
          .from("benchmarks")
          .select(`
            *,
            accelerator:accelerator_specs(vendor, model, arch, tdp_w)
          `);
        if (workload_type) query = query.eq("workload_type", workload_type);
        if (model_name) query = query.ilike("model_name", `%${model_name}%`);
        const { data, error } = await query;
        if (error) throw error;
        
        // Filter by accelerator model if provided
        if (accelerator_model && data) {
          result = data.filter((b: { accelerator?: { model?: string } }) => 
            b.accelerator?.model?.toLowerCase().includes(accelerator_model.toLowerCase())
          );
        } else {
          result = data;
        }
        break;
      }

      case "get_facility_coefficients": {
        const { region_code, provider } = params || {};
        let query = supabase.from("facility_coefficients").select("*");
        if (region_code) query = query.eq("region_code", region_code);
        if (provider) query = query.eq("provider", provider);
        const { data, error } = await query;
        if (error) throw error;
        result = data;
        break;
      }

      case "get_job_runs": {
        const { user_id, status, limit: queryLimit } = params || {};
        let query = supabase
          .from("job_runs")
          .select(`
            *,
            accelerator:accelerator_specs(vendor, model, tdp_w),
            facility:facility_coefficients(region_code, region_name, pue, wue_l_per_kwh, grid_co2_kg_per_kwh)
          `)
          .order("created_at", { ascending: false });
        if (user_id) query = query.eq("user_id", user_id);
        if (status) query = query.eq("status", status);
        if (queryLimit) query = query.limit(queryLimit);
        const { data, error } = await query;
        if (error) throw error;
        result = data;
        break;
      }

      case "simulate_job_on_alternative_hardware": {
        const { 
          current_accelerator_model,
          target_accelerator_model,
          target_region_code,
          workload_type,
          model_name,
          device_count = 1,
          hours = 1
        } = params || {};

        // Get current and target accelerator specs
        const { data: accelerators } = await supabase
          .from("accelerator_specs")
          .select("*")
          .or(`model.ilike.%${current_accelerator_model}%,model.ilike.%${target_accelerator_model}%`);

        const currentAccel = accelerators?.find((a: { model: string }) => 
          a.model.toLowerCase().includes(current_accelerator_model?.toLowerCase() || "")
        );
        const targetAccel = accelerators?.find((a: { model: string }) => 
          a.model.toLowerCase().includes(target_accelerator_model?.toLowerCase() || "")
        );

        // Get benchmarks for comparison
        const { data: benchmarks } = await supabase
          .from("benchmarks")
          .select(`*, accelerator:accelerator_specs(model, tdp_w)`)
          .eq("workload_type", workload_type || "pretrain")
          .ilike("model_name", `%${model_name || "llama"}%`);

        const currentBench = benchmarks?.find((b: { accelerator?: { model?: string } }) =>
          b.accelerator?.model?.toLowerCase().includes(current_accelerator_model?.toLowerCase() || "")
        );
        const targetBench = benchmarks?.find((b: { accelerator?: { model?: string } }) =>
          b.accelerator?.model?.toLowerCase().includes(target_accelerator_model?.toLowerCase() || "")
        );

        // Get facility coefficients
        const { data: facilities } = await supabase
          .from("facility_coefficients")
          .select("*");
        
        const targetFacility = facilities?.find((f: { region_code: string }) => 
          f.region_code === target_region_code
        ) || facilities?.[0];

        // Calculate estimates
        const currentTDP = currentAccel?.tdp_w || 400;
        const targetTDP = targetAccel?.tdp_w || 700;
        const currentTPS = currentBench?.tokens_per_second || 850;
        const targetTPS = targetBench?.tokens_per_second || 2100;
        const pue = targetFacility?.pue || 1.1;
        const wue = targetFacility?.wue_l_per_kwh || 1.1;
        const co2Factor = targetFacility?.grid_co2_kg_per_kwh || 0.35;

        // Energy calculations
        const currentEnergyKWh = (currentTDP * device_count * hours * pue) / 1000;
        const targetEnergyKWh = (targetTDP * device_count * hours * pue) / 1000;

        // Performance scaling
        const speedupFactor = targetTPS / currentTPS;
        const effectiveTimeHours = hours / speedupFactor;
        const adjustedTargetEnergyKWh = (targetTDP * device_count * effectiveTimeHours * pue) / 1000;

        // Water and CO2
        const currentWaterL = currentEnergyKWh * wue;
        const targetWaterL = adjustedTargetEnergyKWh * wue;
        const currentCO2Kg = currentEnergyKWh * co2Factor;
        const targetCO2Kg = adjustedTargetEnergyKWh * co2Factor;

        // Cost estimation (rough GPU-hour costs)
        const gpuHourCosts: Record<string, number> = {
          "A100-40GB": 2.5,
          "A100-80GB": 3.0,
          "H100-80GB": 4.5,
          "H200": 6.0,
          "B200": 8.0,
          "TPU v4": 3.2,
          "TPU v5e": 2.8,
          "TPU v5p": 4.0,
          "MI300X": 5.0,
        };
        const currentCostPerHour = gpuHourCosts[currentAccel?.model || "A100-80GB"] || 3.0;
        const targetCostPerHour = gpuHourCosts[targetAccel?.model || "H100-80GB"] || 4.5;
        const currentCost = currentCostPerHour * device_count * hours;
        const targetCost = targetCostPerHour * device_count * effectiveTimeHours;

        result = {
          current: {
            accelerator: currentAccel?.model || current_accelerator_model,
            tokens_per_second: currentTPS,
            energy_kwh: Math.round(currentEnergyKWh * 100) / 100,
            water_liters: Math.round(currentWaterL * 100) / 100,
            co2_kg: Math.round(currentCO2Kg * 100) / 100,
            cost_usd: Math.round(currentCost * 100) / 100,
            duration_hours: hours,
          },
          target: {
            accelerator: targetAccel?.model || target_accelerator_model,
            region: targetFacility?.region_name || target_region_code,
            tokens_per_second: targetTPS,
            energy_kwh: Math.round(adjustedTargetEnergyKWh * 100) / 100,
            water_liters: Math.round(targetWaterL * 100) / 100,
            co2_kg: Math.round(targetCO2Kg * 100) / 100,
            cost_usd: Math.round(targetCost * 100) / 100,
            duration_hours: Math.round(effectiveTimeHours * 100) / 100,
          },
          comparison: {
            speedup_factor: Math.round(speedupFactor * 100) / 100,
            energy_savings_pct: Math.round((1 - adjustedTargetEnergyKWh / currentEnergyKWh) * 100),
            water_savings_pct: Math.round((1 - targetWaterL / currentWaterL) * 100),
            co2_savings_pct: Math.round((1 - targetCO2Kg / currentCO2Kg) * 100),
            cost_savings_pct: Math.round((1 - targetCost / currentCost) * 100),
            cost_savings_usd: Math.round((currentCost - targetCost) * 100) / 100,
          },
        };
        break;
      }

      case "get_all_reference_data": {
        const [accelerators, benchmarks, facilities] = await Promise.all([
          supabase.from("accelerator_specs").select("*"),
          supabase.from("benchmarks").select(`*, accelerator:accelerator_specs(model)`),
          supabase.from("facility_coefficients").select("*"),
        ]);
        result = {
          accelerators: accelerators.data,
          benchmarks: benchmarks.data,
          facilities: facilities.data,
        };
        break;
      }

      default:
        throw new Error(`Unknown tool: ${tool}`);
    }

    console.log(`Tool ${tool} completed successfully`);
    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Infrastructure tools error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
