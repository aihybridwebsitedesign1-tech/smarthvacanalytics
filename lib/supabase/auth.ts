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

  // Wait for session to be fully established
  let retries = 0;
  while (retries < 10) {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      // Session is ready - wait one more second for RLS to be fully active
      await new Promise(resolve => setTimeout(resolve, 1000));
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    retries++;
  }

  return authData;
}

export async function signIn(email: string, password: string, rememberMe: boolean = false) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  if (!rememberMe && data.session) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('supabase_session_mode', 'temporary');
    }
  } else {
    if (typeof window !== 'undefined') {
      localStorage.setItem('supabase_session_mode', 'persistent');
    }
  }

  return data;
}

export function clearSessionOnBrowserClose() {
  if (typeof window !== 'undefined') {
    const sessionMode = localStorage.getItem('supabase_session_mode');
    if (sessionMode === 'temporary') {
      window.addEventListener('beforeunload', () => {
        supabase.auth.signOut();
      });
    }
  }
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
