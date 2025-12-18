import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TelemetryPayload {
  timestamp?: string;
  facility_id?: string;
  temp_c?: number;
  humidity_pct?: number;
  hvac_status?: string;
  gpu_wattage?: number;
  tokens_generated?: number;
  model_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: TelemetryPayload = await req.json();
    console.log("Received telemetry payload:", JSON.stringify(payload));

    // Basic validation
    if (!payload || typeof payload !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid payload structure" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // For public webhooks, we'd need a different auth mechanism
    // For now, we'll store with a system user or require auth header
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    if (!userId) {
      // For webhook testing without auth, log but don't store
      console.log("Webhook received without authentication - data logged but not stored");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Payload received (authentication required to store data)",
          received: payload 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store raw telemetry
    const { data: telemetryData, error: telemetryError } = await supabase
      .from("raw_telemetry")
      .insert({
        user_id: userId,
        facility_id: payload.facility_id,
        timestamp: payload.timestamp || new Date().toISOString(),
        temp_c: payload.temp_c,
        humidity_pct: payload.humidity_pct,
        hvac_status: payload.hvac_status,
        gpu_wattage: payload.gpu_wattage,
        tokens_generated: payload.tokens_generated,
        model_id: payload.model_id,
        raw_payload: payload,
      })
      .select()
      .single();

    if (telemetryError) {
      console.error("Error storing telemetry:", telemetryError);
      throw telemetryError;
    }

    // Calculate basic metrics
    const gpuWattage = payload.gpu_wattage || 0;
    const tokensGenerated = payload.tokens_generated || 1;
    const energyScore = tokensGenerated > 0 ? (gpuWattage / tokensGenerated) * 1000 : 0;

    // Determine efficiency rating
    let efficiencyRating = "A";
    if (energyScore > 50) efficiencyRating = "F";
    else if (energyScore > 30) efficiencyRating = "D";
    else if (energyScore > 20) efficiencyRating = "C";
    else if (energyScore > 10) efficiencyRating = "B";

    // Identify drivers
    const drivers: string[] = [];
    if (gpuWattage > 150) drivers.push("High GPU wattage");
    if (payload.hvac_status === "ON" && (payload.temp_c || 0) < 20) drivers.push("HVAC overcooling");
    if (tokensGenerated > 1000) drivers.push("High model verbosity");

    // Store processed metrics
    const { error: metricsError } = await supabase.from("processed_metrics").insert({
      user_id: userId,
      telemetry_id: telemetryData.id,
      ai_energy_score: energyScore,
      eco_efficiency_rating: efficiencyRating,
      identified_drivers: drivers,
      predicted_consumption: gpuWattage * 0.024, // Simple hourly estimate
    });

    if (metricsError) {
      console.error("Error storing metrics:", metricsError);
    }

    // Generate recommendation if efficiency is poor
    if (efficiencyRating === "D" || efficiencyRating === "F") {
      await supabase.from("recommendations").insert({
        user_id: userId,
        title: "Energy efficiency alert",
        description: `Current energy score of ${energyScore.toFixed(1)} Wh/1000 tokens indicates inefficiency. ${drivers.join(", ")}`,
        impact_level: efficiencyRating === "F" ? "high" : "medium",
        requires_approval: false,
      });
    }

    console.log("Telemetry processed successfully:", {
      telemetryId: telemetryData.id,
      energyScore,
      efficiencyRating,
    });

    return new Response(
      JSON.stringify({
        success: true,
        telemetry_id: telemetryData.id,
        energy_score: energyScore,
        efficiency_rating: efficiencyRating,
        drivers,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in energy-webhook-handler:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
