import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompts: Record<string, string> = {
  generate: `You are an expert code generator. Generate clean, production-ready code based on the user's requirements.
- Use proper type hints and documentation
- Follow best practices for the specified language
- Include error handling where appropriate
- Write efficient, readable code`,

  explain: `You are a code explanation expert. Analyze the provided code and explain:
- Overall architecture and design patterns used
- Time and space complexity
- Key components and their purposes
- Best practices applied
Format your response with clear headings and bullet points.`,

  fix: `You are a debugging expert. Analyze the code for bugs and issues:
- Identify each bug with line number if visible
- Explain the root cause
- Provide the fix with before/after code snippets
- Rate severity (High/Medium/Low)`,

  docs: `You are a documentation expert. Generate comprehensive documentation for the code:
- Module/class docstrings
- Function documentation with parameters and return types
- Usage examples
- Installation instructions if applicable`,

  refactor: `You are a refactoring expert. Improve the code structure:
- Apply SOLID principles
- Extract magic numbers to constants
- Improve naming conventions
- Add type hints
- Implement design patterns where beneficial
Show the refactored code with explanations of changes.`,

  complete: `You are a code completion expert. Complete the partial code provided:
- Maintain consistent style with existing code
- Add missing functions or methods
- Implement TODO items
- Ensure the code compiles/runs correctly`,

  tests: `You are a testing expert. Generate comprehensive tests for the code:
- Unit tests for individual functions
- Integration tests where appropriate
- Mock external dependencies
- Include edge cases and error scenarios
- Use the specified testing framework`,

  debug: `You are a debugging analyst. Perform deep analysis of the code:
- Identify potential issues and bugs
- Check for memory leaks
- Analyze race conditions
- Review error handling
- Provide severity ratings and fixes`,

  interactive: `You are an intelligent coding assistant. Help the user with their coding questions:
- Provide clear, actionable answers
- Include code examples when helpful
- Suggest best practices
- Be concise but thorough`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      action, 
      code, 
      prompt, 
      language = "python",
      testFramework = "pytest",
      temperature = 0.7,
      maxTokens = 4096,
      model = "glm-4" 
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = systemPrompts[action] || systemPrompts.generate;
    
    let userContent = prompt || code || "";
    
    // Add context based on action
    if (action === "tests") {
      userContent = `Generate ${testFramework} tests for the following ${language} code:\n\n${code || prompt}`;
    } else if (language) {
      userContent = `Language: ${language}\n\n${userContent}`;
    }

    console.log(`Processing ${action} request for ${model}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ],
        max_tokens: maxTokens,
        temperature: temperature,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("llm-code-gen error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
