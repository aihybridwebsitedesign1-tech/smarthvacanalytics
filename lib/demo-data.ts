import { supabase } from './supabase/client';
import { subDays, format } from 'date-fns';

export async function seedDemoData(userId: string) {
  const technicianNames = ['Mike Johnson', 'Sarah Williams', 'Tom Martinez'];
  const client: any = supabase;

  // Wait for profile to be fully created (with retries)
  let profileExists = false;
  for (let i = 0; i < 10; i++) {
    const { data: profile } = await client
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (profile) {
      profileExists = true;
      break;
    }

    // Wait before retry (exponential backoff)
    await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
  }

  if (!profileExists) {
    throw new Error('Profile not created yet. Please try again in a moment.');
  }

  const technicians = await Promise.all(
    technicianNames.map(async (name) => {
      const { data, error } = await client
        .from('technicians')
        .insert({
          user_id: userId,
          name,
          email: `${name.toLowerCase().replace(' ', '.')}@demo.com`,
          phone: `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    })
  );

  const jobTitles = [
    'AC Installation',
    'Heating Repair',
    'HVAC Maintenance',
    'Furnace Replacement',
    'Duct Cleaning',
    'Thermostat Installation',
    'Emergency AC Repair',
    'Heat Pump Service',
  ];

  const clientNames = [
    'ABC Manufacturing',
    'Johnson Residence',
    'City Hall',
    'Green Valley Apartments',
    'Smith Family Home',
    'Downtown Office Complex',
    'Riverside Restaurant',
    'Wilson Estate',
  ];

  const jobs = [];
  for (let i = 0; i < 30; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const jobDate = subDays(new Date(), daysAgo);
    const hours = Math.random() * 6 + 1;
    const revenue = Math.random() * 1500 + 300;
    const cost = revenue * (Math.random() * 0.3 + 0.3);

    jobs.push({
      user_id: userId,
      technician_id: technicians[Math.floor(Math.random() * technicians.length)].id,
      title: jobTitles[Math.floor(Math.random() * jobTitles.length)],
      client_name: clientNames[Math.floor(Math.random() * clientNames.length)],
      client_address: `${Math.floor(Math.random() * 9000) + 1000} Main St`,
      job_date: format(jobDate, 'yyyy-MM-dd'),
      hours_spent: Number(hours.toFixed(2)),
      revenue: Number(revenue.toFixed(2)),
      cost: Number(cost.toFixed(2)),
      status: daysAgo > 0 ? 'completed' : 'scheduled',
      notes: 'Demo data',
    });
  }

  const { error: jobsError } = await client.from('jobs').insert(jobs);
  if (jobsError) throw jobsError;

  const snapshots = [];
  for (let i = 0; i < 90; i++) {
    const snapshotDate = subDays(new Date(), i);
    const dailyJobs = jobs.filter(
      (job) => job.job_date === format(snapshotDate, 'yyyy-MM-dd') && job.status === 'completed'
    );

    const totalRevenue = dailyJobs.reduce((sum, job) => sum + job.revenue, 0);
    const totalCost = dailyJobs.reduce((sum, job) => sum + job.cost, 0);
    const totalHours = dailyJobs.reduce((sum, job) => sum + job.hours_spent, 0);
    const avgHours = dailyJobs.length > 0 ? totalHours / dailyJobs.length : 0;
    const grossMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

    const avgJobRevenue = dailyJobs.length > 0 ? totalRevenue / dailyJobs.length : 0;
    const firstTimeFixRate = dailyJobs.length > 0 ? (Math.random() * 15 + 80) : 0;
    const avgResponseTime = dailyJobs.length > 0 ? (Math.random() * 8 + 4) : 0;
    const activeTechs = 3;
    const revenuePerTechnician = activeTechs > 0 ? totalRevenue / activeTechs : 0;
    const jobsPerTechPerWeek = activeTechs > 0 ? (dailyJobs.length / activeTechs) * 7 : 0;
    const maintenanceJobs = dailyJobs.filter(job => job.title.includes('Maintenance'));
    const maintenanceCompletionRate = dailyJobs.length > 0 ? (maintenanceJobs.length / dailyJobs.length) * 100 : 0;

    snapshots.push({
      user_id: userId,
      snapshot_date: format(snapshotDate, 'yyyy-MM-dd'),
      total_revenue: Number(totalRevenue.toFixed(2)),
      total_jobs: dailyJobs.length,
      avg_hours_per_job: Number(avgHours.toFixed(2)),
      gross_margin: Number(grossMargin.toFixed(2)),
      avg_job_revenue: Number(avgJobRevenue.toFixed(2)),
      first_time_fix_rate: Number(firstTimeFixRate.toFixed(2)),
      avg_response_time: Number(avgResponseTime.toFixed(2)),
      revenue_per_technician: Number(revenuePerTechnician.toFixed(2)),
      jobs_per_tech_per_week: Number(jobsPerTechPerWeek.toFixed(2)),
      maintenance_completion_rate: Number(maintenanceCompletionRate.toFixed(2)),
    });
  }

  const { error: snapshotsError } = await client.from('analytics_snapshots').insert(snapshots);
  if (snapshotsError) throw snapshotsError;

  const recommendations = [
    {
      user_id: userId,
      title: 'Improve Scheduling Efficiency',
      description: 'Your average job completion time increased by 12% this month. Consider optimizing technician routes and scheduling to reduce travel time between jobs.',
      category: 'scheduling',
      priority: 'high',
    },
    {
      user_id: userId,
      title: 'Revenue per Technician Trending Up',
      description: 'Great news! Revenue per technician has increased by 8% over the past 30 days. Keep optimizing your scheduling blocks and pricing strategy.',
      category: 'profitability',
      priority: 'medium',
    },
    {
      user_id: userId,
      title: 'Consider Workflow Training',
      description: 'Some technicians are completing jobs 20% faster than others. Consider cross-training sessions to share best practices across your team.',
      category: 'efficiency',
      priority: 'medium',
    },
    {
      user_id: userId,
      title: 'First-Time Fix Rate Could Improve',
      description: 'Your first-time fix rate is currently at 82%. Consider additional diagnostic training or better equipment pre-checks to reduce callbacks and improve customer satisfaction.',
      category: 'efficiency',
      priority: 'high',
    },
    {
      user_id: userId,
      title: 'Increase Preventive Maintenance Upsells',
      description: 'Only 15% of your jobs are maintenance-based. Consider creating maintenance packages to increase recurring revenue and customer retention.',
      category: 'profitability',
      priority: 'medium',
    },
  ];

  const { error: recsError } = await client.from('recommendations').insert(recommendations);
  if (recsError) throw recsError;

  return true;
}
