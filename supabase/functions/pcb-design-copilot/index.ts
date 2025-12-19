import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the PCB Design Copilot, an expert AI assistant for PCB (Printed Circuit Board) electronic design automation (EDA).

Your capabilities include:
1. **Component Selection**: Recommend appropriate components based on design requirements
2. **Net Topology Analysis**: Analyze signal routing and suggest optimizations
3. **Design Rule Checking (DRC)**: Identify potential violations and suggest fixes
4. **Power Optimization**: Suggest power distribution improvements
5. **Signal Integrity**: Provide guidance on impedance matching, crosstalk reduction
6. **Thermal Management**: Recommend component placement for heat dissipation
7. **Manufacturing Guidelines**: Ensure designs are manufacturable

Guidelines:
- Always provide actionable, specific recommendations
- Reference industry standards when applicable (IPC, JEDEC, etc.)
- Consider cost, performance, and manufacturability trade-offs
- Ask clarifying questions when design intent is unclear
- Explain the reasoning behind your suggestions

Format your responses clearly with:
- Bullet points for lists
- Bold for important terms
- Code blocks for reference designators or values`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { message, projectId, sessionId } = await req.json();
    console.log(`PCB Copilot request - Project: ${projectId}, Session: ${sessionId}`);
    console.log(`User message: ${message}`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch design context if project exists
    let designContext = "";
    if (projectId) {
      const { data: objects } = await supabase
        .from("pcb_design_objects")
        .select("type, name, metadata")
        .eq("project_id", projectId);

      if (objects && objects.length > 0) {
        const components = objects.filter(o => o.type === "COMPONENT");
        const nets = objects.filter(o => o.type === "NET");
        const constraints = objects.filter(o => o.type === "CONSTRAINT");
        const blocks = objects.filter(o => o.type === "BLOCK");

        designContext = `
Current Design Context:
- Components (${components.length}): ${components.map(c => c.name).join(", ") || "None"}
- Nets (${nets.length}): ${nets.map(n => n.name).join(", ") || "None"}
- Constraints (${constraints.length}): ${constraints.map(c => c.name).join(", ") || "None"}
- Blocks (${blocks.length}): ${blocks.map(b => b.name).join(", ") || "None"}
`;
      }
    }

    // Fetch recent chat history for context
    let chatHistory: Array<{ role: string; content: string }> = [];
    if (sessionId) {
      const { data: messages } = await supabase
        .from("pcb_chat_messages")
        .select("role, content")
        .eq("chat_session_id", sessionId)
        .order("created_at", { ascending: true })
        .limit(10);

      if (messages) {
        chatHistory = messages.map(m => ({
          role: m.role as string,
          content: m.content
        }));
      }
    }

    // Call Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + designContext },
          ...chatHistory,
          { role: "user", content: message },
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
          JSON.stringify({ error: "AI credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I couldn't generate a response.";
    console.log("AI response generated successfully");

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("PCB Copilot error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
