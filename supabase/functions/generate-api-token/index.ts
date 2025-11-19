import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a random token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Hash token using SHA-256
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create client with service role key for database operations
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    // Verify JWT and get user separately
    const anonSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });
    
    const { data: { user }, error: authError } = await anonSupabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Invalid authorization token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { name, expires_in_days } = await req.json();

    if (!name || name.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Token name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate token
    const token = generateToken();
    const tokenHash = await hashToken(token);

    // Calculate expiration if provided
    let expiresAt = null;
    if (expires_in_days && expires_in_days > 0) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expires_in_days);
      expiresAt = expiryDate.toISOString();
    }

    // Store hashed token
    const { data: tokenRecord, error: dbError } = await supabase
      .from('api_tokens')
      .insert({
        user_id: user.id,
        name: name.trim(),
        token_hash: tokenHash,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(JSON.stringify({ error: 'Failed to create token' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`API token created for user ${user.id}: ${name}`);

    // Return the plain token only once
    return new Response(
      JSON.stringify({ 
        token: `cs_${token}`, // Add prefix for identification
        token_id: tokenRecord.id,
        name: tokenRecord.name,
        created_at: tokenRecord.created_at,
        expires_at: tokenRecord.expires_at,
      }), 
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});