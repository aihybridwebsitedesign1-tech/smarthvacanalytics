import { createClient } from 'npm:@supabase/supabase-js@2.58.0';
import { differenceInHours, format, subDays } from 'npm:date-fns@3.6.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface KpiData {
  totalRevenue: number;
  totalJobs: number;
  avgHours: number;
  grossMargin: number;
  avgJobRevenue: number;
  firstTimeFixRate: number;
  avgResponseTime: number;
  revenuePerTechnician: number;
  jobsPerTechPerWeek: number;
  maintenanceCompletionRate: number;
}

async function calculateKpisForDateRange(
  supabase: any,
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<KpiData> {
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('job_date', format(startDate, 'yyyy-MM-dd'))
    .lte('job_date', format(endDate, 'yyyy-MM-dd'));

  const { data: technicians } = await supabase
    .from('technicians')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (!jobs || jobs.length === 0) {
    return {
      totalRevenue: 0,
      totalJobs: 0,
      avgHours: 0,
      grossMargin: 0,
      avgJobRevenue: 0,
      firstTimeFixRate: 0,
      avgResponseTime: 0,
      revenuePerTechnician: 0,
      jobsPerTechPerWeek: 0,
      maintenanceCompletionRate: 0,
    };
  }

  const totalRevenue = jobs.reduce((sum: number, job: any) => sum + Number(job.revenue || 0), 0);
  const totalCost = jobs.reduce((sum: number, job: any) => sum + Number(job.cost || 0), 0);
  const totalHours = jobs.reduce((sum: number, job: any) => sum + Number(job.hours_spent || 0), 0);

  const totalJobs = jobs.length;
  const avgHours = totalJobs > 0 ? totalHours / totalJobs : 0;
  const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;
  const avgJobRevenue = totalRevenue / totalJobs;

  const jobsWithoutCallbacks = jobs.filter((job: any) => !job.callback_required);
  const firstTimeFixRate = totalJobs > 0 ? (jobsWithoutCallbacks.length / totalJobs) * 100 : 0;

  const jobsWithResponseTime = jobs.filter(
    (job: any) => job.scheduled_date && job.completed_date
  );
  let totalResponseHours = 0;

  jobsWithResponseTime.forEach((job: any) => {
    const scheduled = new Date(job.scheduled_date);
    const completed = new Date(job.completed_date);
    const hours = differenceInHours(completed, scheduled);
    if (hours >= 0) {
      totalResponseHours += hours;
    }
  });

  const avgResponseTime = jobsWithResponseTime.length > 0
    ? totalResponseHours / jobsWithResponseTime.length
    : 0;

  const activeTechCount = technicians?.length || 1;
  const revenuePerTechnician = totalRevenue / activeTechCount;

  const daysDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const weeks = daysDiff / 7;
  const jobsPerTechPerWeek = weeks > 0 ? totalJobs / activeTechCount / weeks : 0;

  const maintenanceJobs = jobs.filter((job: any) =>
    job.job_type === 'maintenance' ||
    job.title.toLowerCase().includes('maintenance')
  );
  const maintenanceCompletionRate = totalJobs > 0 ? (maintenanceJobs.length / totalJobs) * 100 : 0;

  return {
    totalRevenue,
    totalJobs,
    avgHours,
    grossMargin,
    avgJobRevenue,
    firstTimeFixRate,
    avgResponseTime,
    revenuePerTechnician,
    jobsPerTechPerWeek,
    maintenanceCompletionRate,
  };
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, daysBack = 1 } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const snapshots = [];

    for (let i = 0; i < daysBack; i++) {
      const snapshotDate = subDays(new Date(), i);
      const kpiData = await calculateKpisForDateRange(supabase, userId, snapshotDate, snapshotDate);

      const snapshotRecord = {
        user_id: userId,
        snapshot_date: format(snapshotDate, 'yyyy-MM-dd'),
        total_revenue: kpiData.totalRevenue,
        total_jobs: kpiData.totalJobs,
        avg_hours_per_job: kpiData.avgHours,
        gross_margin: kpiData.grossMargin,
        avg_job_revenue: kpiData.avgJobRevenue,
        first_time_fix_rate: kpiData.firstTimeFixRate,
        avg_response_time: kpiData.avgResponseTime,
        revenue_per_technician: kpiData.revenuePerTechnician,
        jobs_per_tech_per_week: kpiData.jobsPerTechPerWeek,
        maintenance_completion_rate: kpiData.maintenanceCompletionRate,
      };

      await supabase
        .from('analytics_snapshots')
        .upsert(snapshotRecord, {
          onConflict: 'user_id,snapshot_date',
        });

      snapshots.push(snapshotRecord);
    }

    return new Response(
      JSON.stringify({ success: true, snapshots: snapshots.length }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});