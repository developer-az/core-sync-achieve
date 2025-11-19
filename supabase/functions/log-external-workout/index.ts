import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create client with user's token
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Invalid authorization token' }), {
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
        user_id: user.id,
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