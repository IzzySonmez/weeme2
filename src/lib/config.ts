// Production configuration and environment validation
export const config = {
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // API
  apiBase: import.meta.env.VITE_API_BASE || 'http://localhost:8787',
  
  // Supabase
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    enabled: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY)
  },
  
  // Features
  features: {
    aiSuggestions: true,
    aiContent: true,
    analytics: import.meta.env.PROD
  },
  
  // Limits
  limits: {
    maxReports: 50,
    maxAIContent: 100,
    maxTrackingCodes: 10
  }
};

// Validate critical environment variables
export const validateEnvironment = () => {
  const errors: string[] = [];
  
  if (config.isProduction) {
    if (!config.supabase.url) {
      errors.push('VITE_SUPABASE_URL is required in production');
    }
    if (!config.supabase.anonKey) {
      errors.push('VITE_SUPABASE_ANON_KEY is required in production');
    }
    if (config.apiBase.includes('localhost')) {
      errors.push('VITE_API_BASE should not use localhost in production');
    }
  }
  
  if (errors.length > 0) {
    console.error('[CONFIG] Environment validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    
    if (config.isProduction) {
      throw new Error('Critical environment variables missing');
    }
  }
  
  return errors.length === 0;
};

// Initialize validation
validateEnvironment();