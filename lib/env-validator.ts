export function validateEnvVariables() {
  const required = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  };

  const missing: string[] = [];
  const configured: string[] = [];

  Object.entries(required).forEach(([key, value]) => {
    if (!value || value.trim() === '') {
      missing.push(key);
    } else {
      configured.push(key);
    }
  });

  return {
    isValid: missing.length === 0,
    missing,
    configured,
  };
}

export function logEnvironmentStatus() {
  const status = validateEnvVariables();

  console.log('='.repeat(60));
  console.log('ENVIRONMENT CONFIGURATION STATUS');
  console.log('='.repeat(60));

  if (status.isValid) {
    console.log('✅ All required environment variables are configured');
  } else {
    console.error('❌ Missing required environment variables:', status.missing);
  }

  console.log('\n📋 Configured variables:', status.configured.length);
  status.configured.forEach((key) => {
    console.log(`  ✓ ${key}`);
  });

  if (status.missing.length > 0) {
    console.log('\n⚠️  Missing variables:', status.missing.length);
    status.missing.forEach((key) => {
      console.log(`  ✗ ${key}`);
    });
  }

  console.log('='.repeat(60));

  return status;
}
