import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ResetRequest {
  userId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId }: ResetRequest = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data: jobsData } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: false })
      .eq('user_id', userId);

    const { data: techsData } = await supabase
      .from('technicians')
      .select('id', { count: 'exact', head: false })
      .eq('user_id', userId);

    const { data: snapshotsData } = await supabase
      .from('analytics_snapshots')
      .select('id', { count: 'exact', head: false })
      .eq('user_id', userId);

    const { data: recsData } = await supabase
      .from('recommendations')
      .select('id', { count: 'exact', head: false })
      .eq('user_id', userId);

    const jobsCount = jobsData?.length || 0;
    const techsCount = techsData?.length || 0;
    const snapshotsCount = snapshotsData?.length || 0;
    const recsCount = recsData?.length || 0;

    if (jobsCount === 0 && techsCount === 0 && snapshotsCount === 0 && recsCount === 0) {
      await supabase
        .from('profiles')
        .update({ demo_mode: false })
        .eq('id', userId);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'No demo data found to delete.',
          stats: {
            jobsDeleted: 0,
            techniciansDeleted: 0,
            snapshotsDeleted: 0,
            recommendationsDeleted: 0
          }
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    await supabase.from('recommendations').delete().eq('user_id', userId);
    await supabase.from('analytics_snapshots').delete().eq('user_id', userId);
    await supabase.from('jobs').delete().eq('user_id', userId);
    await supabase.from('technicians').delete().eq('user_id', userId);

    await supabase
      .from('profiles')
      .update({ demo_mode: false })
      .eq('id', userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo data cleared successfully',
        stats: {
          jobsDeleted: jobsCount,
          techniciansDeleted: techsCount,
          snapshotsDeleted: snapshotsCount,
          recommendationsDeleted: recsCount
        }
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Reset error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to clear demo data'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
