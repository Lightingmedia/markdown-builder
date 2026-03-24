import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, model = "llama3.1-8b", temperature = 0.2, maxTokens = 1024, topP = 1, stream = false } = await req.json();

    const CEREBRAS_API_KEY = Deno.env.get("CEREBRAS_API_KEY");
    if (!CEREBRAS_API_KEY) {
      throw new Error("CEREBRAS_API_KEY is not configured");
    }

    const startTime = Date.now();

    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CEREBRAS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_completion_tokens: maxTokens,
        temperature,
        top_p: topP,
        stream: false,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Cerebras API error:", response.status, errorText);
      throw new Error(`Cerebras API error: ${response.status}`);
    }

    const data = await response.json();
    const endTime = Date.now();
    const inferenceTime = (endTime - startTime) / 1000;
    const tokensGenerated = data.usage?.completion_tokens || 0;
    const tokensPerSecond = inferenceTime > 0 ? (tokensGenerated / inferenceTime).toFixed(2) : "0";

    return new Response(
      JSON.stringify({
        response: data.choices?.[0]?.message?.content || "",
        metrics: {
          inferenceTime: inferenceTime.toFixed(2),
          tokensGenerated,
          tokensPerSecond,
          model,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("cerebras-chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
