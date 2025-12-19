import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Create the admin user
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@feoa.test',
      password: 'testlight',
      email_confirm: true,
      user_metadata: { full_name: 'Admin' }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('User created:', userData.user?.id)

    // Grant admin role
    if (userData.user) {
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: userData.user.id, role: 'admin' })

      if (roleError) {
        console.error('Error granting admin role:', roleError)
        return new Response(JSON.stringify({ error: roleError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Admin user created successfully',
      userId: userData.user?.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
