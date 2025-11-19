import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-token',
};

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
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    let userId: string | null = null;

    // Check for API token first (X-API-Token header) - case insensitive
    const apiTokenHeader = 
      req.headers.get('X-API-Token') ??
      req.headers.get('x-api-token') ??
      Array.from(req.headers.entries()).find(([key]) => 
        key.toLowerCase() === 'x-api-token'
      )?.[1];
    
    console.log('Incoming headers:', Array.from(req.headers.entries()));
    console.log('API Token Header value:', apiTokenHeader ? 'Found' : 'Not found');
    
    if (apiTokenHeader && apiTokenHeader.startsWith('cs_')) {
      // API Token authentication
      const token = apiTokenHeader.substring(3); // Remove 'cs_' prefix
      const tokenHash = await hashToken(token);
      
      const { data: tokenRecord, error: tokenError } = await supabase
        .from('api_tokens')
        .select('user_id, is_active, expires_at')
        .eq('token_hash', tokenHash)
        .single();

      if (tokenError || !tokenRecord || !tokenRecord.is_active) {
        console.error('Invalid API token:', tokenError);
        return new Response(JSON.stringify({ error: 'Invalid or inactive API token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Check expiration
      if (tokenRecord.expires_at && new Date(tokenRecord.expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: 'API token has expired' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      userId = tokenRecord.user_id;

      // Update last_used_at
      await supabase
        .from('api_tokens')
        .update({ last_used_at: new Date().toISOString() })
        .eq('token_hash', tokenHash);

    } else {
      console.log('No API token header found, falling back to JWT auth');
      // Fall back to JWT authentication
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Missing authentication. Provide either X-API-Token header (for external integrations) or Authorization header (for web app)' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const supabaseWithAuth = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } },
      });

      const { data: { user }, error: authError } = await supabaseWithAuth.auth.getUser();
      if (authError || !user) {
        console.error('Auth error:', authError);
        return new Response(JSON.stringify({ error: 'Invalid authorization token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      userId = user.id;
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { exercise_name, reps, sets = 1, duration, notes } = await req.json();

    if (!exercise_name || !reps) {
      return new Response(JSON.stringify({ error: 'Missing required fields: exercise_name and reps' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate estimated calories (rough estimate: 0.5 calories per push-up)
    const caloriesPerRep = exercise_name.toLowerCase().includes('push') ? 0.5 : 0.3;
    const totalCalories = Math.round(reps * sets * caloriesPerRep);
    const workoutDuration = duration || Math.round(reps * sets * 2); // Estimate 2 seconds per rep

    // Create workout
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: userId,
        total_duration: workoutDuration,
        total_calories: totalCalories,
        notes: notes || `Auto-logged from external tracker`,
        workout_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (workoutError) {
      console.error('Workout creation error:', workoutError);
      return new Response(JSON.stringify({ error: 'Failed to create workout' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create exercise entry
    const { error: exerciseError } = await supabase
      .from('exercises')
      .insert({
        workout_id: workout.id,
        name: exercise_name,
        type: 'strength',
        sets: sets,
        reps: reps,
        duration: workoutDuration,
        calories_burned: totalCalories,
      });

    if (exerciseError) {
      console.error('Exercise creation error:', exerciseError);
      return new Response(JSON.stringify({ error: 'Failed to create exercise' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Logged ${reps} ${exercise_name} successfully!`,
        workout_id: workout.id,
        calories: totalCalories,
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