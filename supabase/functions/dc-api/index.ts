import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

// Redfish-style API routes
const SUPPORTED_RESOURCES = ['compute', 'cooling', 'power', 'telemetry', 'endpoints'];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Extract resource type from path: /dc-api/v1/{resource}
    const version = pathParts.find(p => p.startsWith('v')) || 'v1';
    const resourceIndex = pathParts.indexOf(version) + 1;
    const resource = pathParts[resourceIndex] || '';
    const resourceId = pathParts[resourceIndex + 1];
    
    console.log(`[DC-API] ${req.method} /${version}/${resource}${resourceId ? '/' + resourceId : ''}`);

    // Route: GET /dc-api - API root
    if (!resource || resource === 'dc-api') {
      return new Response(JSON.stringify({
        "@odata.context": "/dc-api/v1/$metadata",
        "@odata.id": "/dc-api/v1",
        "Name": "LightRail DC API Gateway",
        "Version": "1.0.0",
        "Description": "Unified infrastructure management API inspired by DMTF Redfish",
        "Links": {
          "Endpoints": { "@odata.id": "/dc-api/v1/endpoints" },
          "Compute": { "@odata.id": "/dc-api/v1/compute" },
          "Cooling": { "@odata.id": "/dc-api/v1/cooling" },
          "Power": { "@odata.id": "/dc-api/v1/power" },
          "Telemetry": { "@odata.id": "/dc-api/v1/telemetry" }
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Validate resource type
    if (!SUPPORTED_RESOURCES.includes(resource)) {
      return new Response(JSON.stringify({
        error: "ResourceNotFound",
        message: `Resource '${resource}' not found. Supported: ${SUPPORTED_RESOURCES.join(', ')}`
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Route: /dc-api/v1/endpoints
    if (resource === 'endpoints') {
      return await handleEndpoints(req, supabase, resourceId);
    }

    // Route: /dc-api/v1/telemetry
    if (resource === 'telemetry') {
      return await handleTelemetry(req, supabase, resourceId);
    }

    // Route: /dc-api/v1/compute, cooling, power - query endpoints by type
    if (['compute', 'cooling', 'power'].includes(resource)) {
      return await handleResourceType(req, supabase, resource, resourceId);
    }

    return new Response(JSON.stringify({ error: "Not implemented" }), {
      status: 501,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('[DC-API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({
      error: "InternalServerError",
      message: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Handle /endpoints CRUD operations
async function handleEndpoints(req: Request, supabase: any, endpointId?: string) {
  const method = req.method;

  // GET all endpoints or single endpoint
  if (method === 'GET') {
    if (endpointId) {
      const { data, error } = await supabase
        .from('dc_endpoints')
        .select('*')
        .eq('id', endpointId)
        .single();
      
      if (error || !data) {
        return new Response(JSON.stringify({ error: "EndpointNotFound" }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify(formatEndpointResponse(data)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data, error } = await supabase
      .from('dc_endpoints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify({
      "@odata.context": "/dc-api/v1/$metadata#Endpoints",
      "Members@odata.count": data.length,
      "Members": data.map(formatEndpointResponse)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // POST - Register new endpoint
  if (method === 'POST') {
    const body = await req.json();
    
    // Validate required fields
    const validation = validateEndpointPayload(body);
    if (!validation.valid) {
      return new Response(JSON.stringify({
        error: "ValidationError",
        message: validation.message,
        details: validation.details
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Attempt connection test
    const connectionStatus = await testEndpointConnection(body.url);
    
    const { data, error } = await supabase
      .from('dc_endpoints')
      .insert({
        name: body.name,
        type: body.type,
        url: body.url,
        api_key: body.apiKey || null,
        status: connectionStatus.connected ? 'connected' : 'pending',
        last_ping: connectionStatus.connected ? new Date().toISOString() : null,
        metadata: body.metadata || {}
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`[DC-API] Endpoint registered: ${data.name} (${data.id})`);

    return new Response(JSON.stringify({
      ...formatEndpointResponse(data),
      connectionTest: connectionStatus
    }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // PATCH - Update endpoint
  if (method === 'PATCH' && endpointId) {
    const body = await req.json();
    
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.url) updateData.url = body.url;
    if (body.status) updateData.status = body.status;
    if (body.apiKey !== undefined) updateData.api_key = body.apiKey;
    if (body.metadata) updateData.metadata = body.metadata;

    const { data, error } = await supabase
      .from('dc_endpoints')
      .update(updateData)
      .eq('id', endpointId)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(formatEndpointResponse(data)), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // DELETE - Remove endpoint
  if (method === 'DELETE' && endpointId) {
    const { error } = await supabase
      .from('dc_endpoints')
      .delete()
      .eq('id', endpointId);

    if (error) throw error;

    return new Response(null, { status: 204, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ error: "MethodNotAllowed" }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Handle /telemetry - stream and query telemetry data
async function handleTelemetry(req: Request, supabase: any, endpointId?: string) {
  const method = req.method;
  const url = new URL(req.url);

  // GET - Query telemetry data
  if (method === 'GET') {
    let query = supabase
      .from('dc_telemetry')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (endpointId) {
      query = query.eq('endpoint_id', endpointId);
    }

    // Filter by type if provided
    const typeFilter = url.searchParams.get('type');
    if (typeFilter) {
      query = query.eq('endpoint_type', typeFilter);
    }

    const { data, error } = await query;
    if (error) throw error;

    return new Response(JSON.stringify({
      "@odata.context": "/dc-api/v1/$metadata#Telemetry",
      "Members@odata.count": data.length,
      "Members": data.map(formatTelemetryResponse)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // POST - Ingest telemetry data from endpoint
  if (method === 'POST') {
    const body = await req.json();
    
    if (!body.endpoint_id && !body.endpoint_name) {
      return new Response(JSON.stringify({
        error: "ValidationError",
        message: "Either endpoint_id or endpoint_name is required"
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Insert telemetry record
    const { data, error } = await supabase
      .from('dc_telemetry')
      .insert({
        endpoint_id: body.endpoint_id || null,
        endpoint_name: body.endpoint_name || 'Unknown',
        endpoint_type: body.endpoint_type || 'compute',
        temperature_c: body.temperature_c,
        power_w: body.power_w,
        utilization_pct: body.utilization_pct,
        flow_lpm: body.flow_lpm,
        pressure_bar: body.pressure_bar,
        leak_status: body.leak_status,
        load_kw: body.load_kw,
        voltage_v: body.voltage_v,
        power_factor: body.power_factor,
        raw_data: body.raw_data || body
      })
      .select()
      .single();

    if (error) throw error;

    // Update endpoint last_ping
    if (body.endpoint_id) {
      await supabase
        .from('dc_endpoints')
        .update({ 
          last_ping: new Date().toISOString(),
          status: 'connected'
        })
        .eq('id', body.endpoint_id);
    }

    console.log(`[DC-API] Telemetry ingested for ${body.endpoint_name || body.endpoint_id}`);

    return new Response(JSON.stringify(formatTelemetryResponse(data)), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: "MethodNotAllowed" }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Handle resource type queries (compute, cooling, power)
async function handleResourceType(req: Request, supabase: any, resourceType: string, resourceId?: string) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: "MethodNotAllowed" }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Get endpoints of this type
  let query = supabase
    .from('dc_endpoints')
    .select('*')
    .eq('type', resourceType);

  if (resourceId) {
    query = query.eq('id', resourceId);
    const { data, error } = await query.single();
    
    if (error || !data) {
      return new Response(JSON.stringify({ error: "ResourceNotFound" }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get latest telemetry for this endpoint
    const { data: telemetry } = await supabase
      .from('dc_telemetry')
      .select('*')
      .eq('endpoint_id', resourceId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return new Response(JSON.stringify({
      ...formatEndpointResponse(data),
      LatestTelemetry: telemetry ? formatTelemetryResponse(telemetry) : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { data, error } = await query;
  if (error) throw error;

  return new Response(JSON.stringify({
    "@odata.context": `/dc-api/v1/$metadata#${resourceType}`,
    "ResourceType": resourceType,
    "Members@odata.count": data.length,
    "Members": data.map(formatEndpointResponse)
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Validation helper
function validateEndpointPayload(body: any) {
  const errors: string[] = [];
  
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
    errors.push("name: Required, minimum 2 characters");
  }
  
  if (!body.type || !['compute', 'cooling', 'power'].includes(body.type)) {
    errors.push("type: Must be 'compute', 'cooling', or 'power'");
  }
  
  if (!body.url || typeof body.url !== 'string') {
    errors.push("url: Required, must be a valid URL or IP address");
  } else {
    // Basic URL validation
    try {
      if (!body.url.startsWith('http://') && !body.url.startsWith('https://')) {
        // Allow IP addresses without protocol
        if (!/^(\d{1,3}\.){3}\d{1,3}(:\d+)?/.test(body.url)) {
          errors.push("url: Must be a valid URL or IP address");
        }
      }
    } catch {
      errors.push("url: Invalid format");
    }
  }

  return {
    valid: errors.length === 0,
    message: errors.length > 0 ? "Validation failed" : null,
    details: errors
  };
}

// Mock connection test (in production, would actually test the endpoint)
async function testEndpointConnection(url: string) {
  // Simulate connection test
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // For demo purposes, succeed for most URLs
  const isReachable = !url.includes('unreachable');
  
  return {
    connected: isReachable,
    latency_ms: isReachable ? Math.floor(Math.random() * 50) + 10 : null,
    message: isReachable ? "Connection successful" : "Unable to reach endpoint"
  };
}

// Format helpers
function formatEndpointResponse(endpoint: any) {
  return {
    "@odata.id": `/dc-api/v1/endpoints/${endpoint.id}`,
    "Id": endpoint.id,
    "Name": endpoint.name,
    "ResourceType": endpoint.type,
    "EndpointURL": endpoint.url,
    "Status": {
      "State": endpoint.status === 'connected' ? 'Enabled' : 'Disabled',
      "Health": endpoint.status === 'warning' ? 'Warning' : endpoint.status === 'connected' ? 'OK' : 'Unknown'
    },
    "LastPing": endpoint.last_ping,
    "Metadata": endpoint.metadata,
    "Created": endpoint.created_at,
    "Modified": endpoint.updated_at
  };
}

function formatTelemetryResponse(telemetry: any) {
  return {
    "@odata.id": `/dc-api/v1/telemetry/${telemetry.id}`,
    "Id": telemetry.id,
    "EndpointId": telemetry.endpoint_id,
    "EndpointName": telemetry.endpoint_name,
    "ResourceType": telemetry.endpoint_type,
    "Timestamp": telemetry.created_at,
    "Metrics": {
      "Temperature_C": telemetry.temperature_c,
      "Power_W": telemetry.power_w,
      "Utilization_Pct": telemetry.utilization_pct,
      "Flow_LPM": telemetry.flow_lpm,
      "Pressure_Bar": telemetry.pressure_bar,
      "LeakStatus": telemetry.leak_status,
      "Load_kW": telemetry.load_kw,
      "Voltage_V": telemetry.voltage_v,
      "PowerFactor": telemetry.power_factor
    },
    "RawData": telemetry.raw_data
  };
}
