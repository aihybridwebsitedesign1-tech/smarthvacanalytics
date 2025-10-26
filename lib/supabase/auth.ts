import { supabase } from './client';

export async function signUp(email: string, password: string, companyName: string, technicianCount: number, planTier: string) {
  // Sign up the user with metadata
  // The database trigger will automatically create the profile
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        company_name: companyName,
        plan_tier: planTier,
      }
    }
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('No user returned from signup');

  // Wait a moment for the trigger to create the profile
  await new Promise(resolve => setTimeout(resolve, 500));

  // Update the profile with full details
  const client: any = supabase;
  const { error: profileError } = await client.from('profiles').update({
    company_name: companyName,
    technician_count: technicianCount,
    plan_tier: planTier,
    demo_mode: true,
    user_role: 'owner',
  }).eq('id', authData.user.id);

  if (profileError) {
    console.error('Profile update error:', profileError);
    // Don't throw - profile was created by trigger, just log the update error
  }

  await supabase.auth.getSession();

  return authData;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
