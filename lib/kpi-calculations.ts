import { supabase } from './supabase/client';
import { format, subDays, differenceInHours } from 'date-fns';

export interface KpiData {
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

export async function calculateKpisForDateRange(
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

  const totalRevenue = jobs.reduce((sum, job: any) => sum + Number(job.revenue || 0), 0);
  const totalCost = jobs.reduce((sum, job: any) => sum + Number(job.cost || 0), 0);
  const totalHours = jobs.reduce((sum, job: any) => sum + Number(job.hours_spent || 0), 0);

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

export async function generateSnapshotForDate(
  userId: string,
  snapshotDate: Date
): Promise<void> {
  const kpiData = await calculateKpisForDateRange(userId, snapshotDate, snapshotDate);

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

  const client: any = supabase;
  await client
    .from('analytics_snapshots')
    .upsert(snapshotRecord, {
      onConflict: 'user_id,snapshot_date',
    });
}

export async function regenerateAllSnapshots(
  userId: string,
  daysBack: number = 90
): Promise<void> {
  const promises = [];

  for (let i = 0; i < daysBack; i++) {
    const snapshotDate = subDays(new Date(), i);
    promises.push(generateSnapshotForDate(userId, snapshotDate));
  }

  await Promise.all(promises);
}

export async function calculateTechnicianKpis(
  userId: string,
  technicianId: string,
  startDate: Date,
  endDate: Date
) {
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', userId)
    .eq('technician_id', technicianId)
    .eq('status', 'completed')
    .gte('job_date', format(startDate, 'yyyy-MM-dd'))
    .lte('job_date', format(endDate, 'yyyy-MM-dd'));

  if (!jobs || jobs.length === 0) {
    return {
      jobsCompleted: 0,
      totalRevenue: 0,
      avgHours: 0,
      avgJobRevenue: 0,
      firstTimeFixRate: 0,
      avgResponseTime: 0,
    };
  }

  const totalRevenue = jobs.reduce((sum, job: any) => sum + Number(job.revenue || 0), 0);
  const totalHours = jobs.reduce((sum, job: any) => sum + Number(job.hours_spent || 0), 0);
  const jobsCompleted = jobs.length;
  const avgHours = jobsCompleted > 0 ? totalHours / jobsCompleted : 0;
  const avgJobRevenue = totalRevenue / jobsCompleted;

  const jobsWithoutCallbacks = jobs.filter((job: any) => !job.callback_required);
  const firstTimeFixRate = (jobsWithoutCallbacks.length / jobsCompleted) * 100;

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

  return {
    jobsCompleted,
    totalRevenue,
    avgHours,
    avgJobRevenue,
    firstTimeFixRate,
    avgResponseTime,
  };
}
