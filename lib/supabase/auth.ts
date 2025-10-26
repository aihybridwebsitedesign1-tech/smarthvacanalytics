import { supabase } from './client';

export async function signUp(email: string, password: string, companyName: string, technicianCount: number, planTier: string) {
  // Sign up the user with metadata - trigger will create the profile automatically
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        company_name: companyName,
        plan_tier: planTier,
        technician_count: technicianCount,
      }
    }
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('No user returned from signup');

  // Profile is created automatically by database trigger
  // No need to update - just ensure session is established
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
