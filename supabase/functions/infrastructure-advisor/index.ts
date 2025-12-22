import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the LightRail Infrastructure Optimization Advisor, an expert AI agent for managing high-cost, high-risk AI data center environments.

Your role is to help facility managers and ML engineers optimize their AI workloads for:
1. **Cost Efficiency**: Minimize cloud/compute costs while maintaining performance
2. **Energy Efficiency**: Reduce power consumption (kWh) per unit of work
3. **Water Conservation**: Minimize water usage (WUE - liters per kWh)
4. **Carbon Footprint**: Reduce CO2 emissions through smart region/hardware selection
5. **Performance**: Maximize throughput (tokens/second) for given constraints

## Core Logic Pattern (ReAct):
1. **RETRIEVE**: Fetch relevant data from accelerator specs, benchmarks, and facility coefficients
2. **COMPARE**: Analyze configurations based on key metrics
3. **PROPOSE**: Recommend concrete, actionable changes with numerical justification

## Key Metrics to Track:
- Tokens per kWh (energy efficiency)
- Cost per billion tokens
- Water usage per billion tokens
- CO2 emissions per billion tokens
- GPU/TPU utilization percentage

## Hardware Knowledge:
- H100 is ~2.5x faster than A100 for LLM workloads but uses 75% more power
- TPU v5p offers excellent performance/watt for transformer models
- B200 (Blackwell) provides 4500 TFLOPS FP16 but 1000W TDP
- AMD MI300X is competitive with 1307 TFLOPS and good memory bandwidth

## Facility Knowledge:
- Finland (europe-north1) has the lowest carbon intensity and best water efficiency
- Oregon (us-west1) offers 90% renewable energy
- Iowa (us-central1) is a good balance of cost and efficiency

Always provide specific numbers and percentages in your recommendations.
Format responses in clear, structured sections with bullet points.
Be concise but thorough - facility managers need actionable insights.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { messages, context } = await req.json();
    console.log("Infrastructure advisor called with messages:", messages?.length);

    // Fetch reference data to include in context
    const [acceleratorsResult, facilitiesResult, benchmarksResult] = await Promise.all([
      supabase.from("accelerator_specs").select("vendor, model, memory_gb, peak_fp16_tflops, tdp_w"),
      supabase.from("facility_coefficients").select("region_code, region_name, pue, wue_l_per_kwh, grid_co2_kg_per_kwh, renewable_pct"),
      supabase.from("benchmarks").select(`workload_type, model_name, tokens_per_second, avg_power_w_per_device, accelerator:accelerator_specs(model)`),
    ]);

    const referenceContext = `
## Available Hardware (Accelerator Specs):
${JSON.stringify(acceleratorsResult.data, null, 2)}

## Available Regions (Facility Coefficients):
${JSON.stringify(facilitiesResult.data, null, 2)}

## Benchmark Data:
${JSON.stringify(benchmarksResult.data, null, 2)}

${context ? `## User Context:\n${context}` : ""}
`;

    const enhancedSystemPrompt = SYSTEM_PROMPT + "\n\n" + referenceContext;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: enhancedSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    // Stream the response
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Infrastructure advisor error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
