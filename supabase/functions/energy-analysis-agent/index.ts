import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are FEOA Architect (Facility Energy Optimisation Agent), an expert VP of Manufacturing Solutions and Senior Data Scientist focused on "Eco-Efficiency."

Your role:
- Analyse facility energy consumption data from HVAC, temperature sensors, and AI hardware telemetry (GPU/TPU wattage, inference verbosity)
- Provide predictive models and actionable recommendations for cost reduction
- Use structured UK English (e.g., Optimisation, Analysing, Colour)
- Be professional, authoritative, concise, and data-driven

Core Logic Pattern (ReAct):
1. Analyse: Scrutinise incoming data for inefficiencies and patterns
2. Reason: Quantify the impact (e.g., "This reasoning model's verbosity is contributing to a 30x energy cost increase")
3. Propose: Formulate specific, actionable recommendations

Key insights you should know:
- High-verbosity AI models (>1000 tokens/query) consume up to 30x more energy than equivalent smaller models
- HVAC typically accounts for 25-40% of facility energy consumption
- GPU inference workloads are highly variable and can spike energy usage dramatically
- Optimal HVAC setpoints in data centres are typically 24-27°C

Always provide specific, quantified recommendations when possible.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, message, data, dateRange } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let userPrompt = "";

    switch (type) {
      case "eda_chat":
        userPrompt = `User query about their energy data: "${message}"
        
Please provide analysis guidance, suggest visualisations, or answer questions about energy data patterns. If they ask about correlations, provide typical expected values for facility energy data.`;
        break;

      case "generate_report":
        userPrompt = `Generate an eco-efficiency report summary for the ${dateRange} period.

Include:
1. Executive summary of energy consumption patterns
2. Top 3 energy drivers identified
3. 2-3 specific, actionable recommendations with estimated savings
4. Risk assessment for any concerning patterns

Format your response as a structured report with clear sections.`;
        break;

      case "analyse_telemetry":
        userPrompt = `Analyse the following telemetry data:
${JSON.stringify(data, null, 2)}

Provide:
1. AI Energy Score (Wh per 1000 queries)
2. Eco-Efficiency Rating (A-F scale)
3. Primary energy drivers identified
4. Any anomalies or concerns
5. Specific recommendations`;
        break;

      default:
        userPrompt = message || "Provide general energy optimisation guidance.";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    // Generate mock recommendations for report type
    let recommendations: Array<{ title: string; description: string; impact_level: string; requires_approval: boolean }> = [];
    if (type === "generate_report") {
      recommendations = [
        {
          title: "Optimise HVAC Setpoint",
          description: "Increase setpoint by 2°C during low-occupancy periods to reduce cooling load.",
          impact_level: "high",
          requires_approval: true,
        },
        {
          title: "Reduce AI Model Verbosity",
          description: "Switch to shorter-context models for simple queries to reduce GPU energy consumption by up to 30x.",
          impact_level: "high",
          requires_approval: true,
        },
        {
          title: "Implement Load Balancing",
          description: "Distribute GPU workloads across off-peak hours to flatten energy demand curves.",
          impact_level: "medium",
          requires_approval: false,
        },
      ];
    }

    return new Response(
      JSON.stringify({
        response: content,
        recommendations,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in energy-analysis-agent:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
