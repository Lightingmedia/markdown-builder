import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

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

interface AnomalyAlert {
  type: string;
  message: string;
  severity: "warning" | "critical";
  value: number;
  threshold: number;
}

function detectAnomalies(payload: TelemetryPayload): AnomalyAlert[] {
  const anomalies: AnomalyAlert[] = [];

  // High GPU wattage anomaly
  if (payload.gpu_wattage && payload.gpu_wattage > 300) {
    anomalies.push({
      type: "GPU_WATTAGE_CRITICAL",
      message: "GPU wattage exceeds critical threshold",
      severity: "critical",
      value: payload.gpu_wattage,
      threshold: 300,
    });
  } else if (payload.gpu_wattage && payload.gpu_wattage > 200) {
    anomalies.push({
      type: "GPU_WATTAGE_HIGH",
      message: "GPU wattage is above normal operating range",
      severity: "warning",
      value: payload.gpu_wattage,
      threshold: 200,
    });
  }

  // Temperature anomalies
  if (payload.temp_c && payload.temp_c > 35) {
    anomalies.push({
      type: "TEMPERATURE_CRITICAL",
      message: "Facility temperature critically high",
      severity: "critical",
      value: payload.temp_c,
      threshold: 35,
    });
  } else if (payload.temp_c && payload.temp_c > 28) {
    anomalies.push({
      type: "TEMPERATURE_HIGH",
      message: "Facility temperature above optimal range",
      severity: "warning",
      value: payload.temp_c,
      threshold: 28,
    });
  }

  // High token generation (potential inefficiency)
  if (payload.tokens_generated && payload.tokens_generated > 5000) {
    anomalies.push({
      type: "HIGH_TOKEN_GENERATION",
      message: "Unusually high token generation detected - potential model verbosity issue",
      severity: "warning",
      value: payload.tokens_generated,
      threshold: 5000,
    });
  }

  // HVAC + low temp anomaly (overcooling)
  if (payload.hvac_status === "ON" && payload.temp_c && payload.temp_c < 18) {
    anomalies.push({
      type: "HVAC_OVERCOOLING",
      message: "HVAC running while temperature is already low - potential energy waste",
      severity: "warning",
      value: payload.temp_c,
      threshold: 18,
    });
  }

  return anomalies;
}

async function sendAnomalyEmail(
  resend: Resend,
  userEmail: string,
  anomalies: AnomalyAlert[],
  payload: TelemetryPayload
) {
  const criticalCount = anomalies.filter((a) => a.severity === "critical").length;
  const warningCount = anomalies.filter((a) => a.severity === "warning").length;

  const subject = criticalCount > 0
    ? `🚨 CRITICAL: ${criticalCount} anomal${criticalCount > 1 ? "ies" : "y"} detected in facility telemetry`
    : `⚠️ WARNING: ${warningCount} anomal${warningCount > 1 ? "ies" : "y"} detected in facility telemetry`;

  const anomalyRows = anomalies
    .map(
      (a) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; color: ${a.severity === "critical" ? "#dc2626" : "#f59e0b"}; font-weight: bold;">
            ${a.severity === "critical" ? "🔴" : "🟡"} ${a.type}
          </td>
          <td style="padding: 12px;">${a.message}</td>
          <td style="padding: 12px; text-align: center;">${a.value}</td>
          <td style="padding: 12px; text-align: center;">${a.threshold}</td>
        </tr>
      `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 24px; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 24px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th { background: #f3f4f6; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280; }
        .telemetry { background: #f9fafb; padding: 16px; border-radius: 8px; margin-top: 20px; }
        .telemetry h3 { margin: 0 0 12px 0; color: #374151; }
        .telemetry-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .telemetry-item { font-size: 14px; color: #6b7280; }
        .footer { padding: 16px 24px; background: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚡ LightRail FEOA Alert</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9;">Facility Energy Optimisation Agent</p>
        </div>
        <div class="content">
          <p>Anomalies have been detected in your facility telemetry data:</p>
          
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Value</th>
                <th>Threshold</th>
              </tr>
            </thead>
            <tbody>
              ${anomalyRows}
            </tbody>
          </table>

          <div class="telemetry">
            <h3>📊 Telemetry Snapshot</h3>
            <div class="telemetry-grid">
              <div class="telemetry-item">🌡️ Temperature: ${payload.temp_c ?? "N/A"}°C</div>
              <div class="telemetry-item">💧 Humidity: ${payload.humidity_pct ?? "N/A"}%</div>
              <div class="telemetry-item">❄️ HVAC: ${payload.hvac_status ?? "N/A"}</div>
              <div class="telemetry-item">⚡ GPU: ${payload.gpu_wattage ?? "N/A"}W</div>
              <div class="telemetry-item">🔤 Tokens: ${payload.tokens_generated ?? "N/A"}</div>
              <div class="telemetry-item">🤖 Model: ${payload.model_id ?? "N/A"}</div>
            </div>
          </div>

          <p style="margin-top: 20px; color: #6b7280;">
            Please review these anomalies in your FEOA dashboard and take appropriate action.
          </p>
        </div>
        <div class="footer">
          <p>LightRail - Facility Energy Optimisation Agent</p>
          <p>This is an automated alert. Do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: "FEOA Alerts <onboarding@resend.dev>",
      to: [userEmail],
      subject,
      html,
    });
    console.log("Anomaly alert email sent to:", userEmail);
    return true;
  } catch (error) {
    console.error("Failed to send anomaly email:", error);
    return false;
  }
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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Initialize Resend if API key exists
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let userEmail: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
      userEmail = user?.email || null;
    }

    if (!userId) {
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

    // Detect anomalies BEFORE storing data
    const anomalies = detectAnomalies(payload);
    console.log(`Detected ${anomalies.length} anomalies:`, anomalies);

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
      predicted_consumption: gpuWattage * 0.024,
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

    // Send email notification if anomalies detected
    let emailSent = false;
    if (anomalies.length > 0 && resend && userEmail) {
      emailSent = await sendAnomalyEmail(resend, userEmail, anomalies, payload);

      // Store anomaly recommendations
      for (const anomaly of anomalies) {
        await supabase.from("recommendations").insert({
          user_id: userId,
          title: `Anomaly: ${anomaly.type.replace(/_/g, " ")}`,
          description: `${anomaly.message}. Current value: ${anomaly.value}, Threshold: ${anomaly.threshold}`,
          impact_level: anomaly.severity === "critical" ? "high" : "medium",
          requires_approval: anomaly.severity === "critical",
        });
      }
    }

    console.log("Telemetry processed successfully:", {
      telemetryId: telemetryData.id,
      energyScore,
      efficiencyRating,
      anomaliesDetected: anomalies.length,
      emailSent,
    });

    return new Response(
      JSON.stringify({
        success: true,
        telemetry_id: telemetryData.id,
        energy_score: energyScore,
        efficiency_rating: efficiencyRating,
        drivers,
        anomalies: anomalies.length > 0 ? anomalies : undefined,
        email_sent: emailSent,
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
