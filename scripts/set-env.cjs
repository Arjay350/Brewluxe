const fs = require('fs');
const path = require('path');

// Try reading local .env file if it exists
const envPath = path.resolve(__dirname, '../.env');
const envVars = {};

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        envVars[key] = val;
      }
    }
  });
}

// Read from system environment (Vercel) or fallback to local .env or defaults
const supabaseUrl = process.env.SUPABASE_URL || envVars.SUPABASE_URL || 'https://bpvcqjrqnsfrqvhtdpfr.supabase.co';
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || envVars.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_wbeFpm6sPIARL5sowcsOcw_otzsR9Jv';
const paymongoKey = process.env.PAYMONGO_PUBLIC_KEY || envVars.PAYMONGO_PUBLIC_KEY || 'pk_test_sample_key';
const resendKey = process.env.RESEND_API_KEY || 're_test_sample_key';
const cloudinaryName = process.env.CLOUDINARY_CLOUD_NAME || envVars.CLOUDINARY_CLOUD_NAME || 'brewluxe-demo';

const prodEnvContent = `export const environment = {
  production: true,
  supabaseUrl: '${supabaseUrl}',
  supabasePublishableKey: '${supabaseKey}',
  paymongo: {
    apiUrl: 'https://api.paymongo.com/v2',
    publicKey: '${paymongoKey}',
  },
  resendApiKey: '${resendKey}',
  cloudinaryCloudName: '${cloudinaryName}',
};
`;

const devEnvContent = `export const environment = {
  production: false,
  supabaseUrl: '${supabaseUrl}',
  supabasePublishableKey: '${supabaseKey}',
  paymongo: {
    apiUrl: 'https://api.paymongo.com/v2',
    publicKey: '${paymongoKey}',
  },
  resendApiKey: '${resendKey}',
  cloudinaryCloudName: '${cloudinaryName}',
};
`;

const targetDir = path.resolve(__dirname, '../src/environments');
fs.writeFileSync(path.join(targetDir, 'environment.prod.ts'), prodEnvContent, 'utf8');
fs.writeFileSync(path.join(targetDir, 'environment.ts'), devEnvContent, 'utf8');

console.log('[Brewluxe] Environment configurations synchronized for build target.');
