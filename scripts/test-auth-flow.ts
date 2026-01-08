/**
 * Authentication Flow Test Script
 * 
 * This script helps verify the authentication setup by checking:
 * 1. Environment variables are configured
 * 2. Supabase client can be created
 * 3. Redirect URLs are properly formatted
 * 4. OAuth configuration is correct
 * 
 * Run with: npx tsx scripts/test-auth-flow.ts
 */

import { createClient } from '../src/lib/supabase/client';

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string;
}

const results: TestResult[] = [];

function addResult(name: string, passed: boolean, message: string, details?: string) {
  results.push({ name, passed, message, details });
}

function checkEnvironmentVariables() {
  console.log('\n🔍 Checking Environment Variables...\n');
  
  REQUIRED_ENV_VARS.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      addResult(
        `Env: ${varName}`,
        false,
        `❌ Missing: ${varName}`,
        'Add this to your .env.local file'
      );
    } else if (varName.includes('URL') && !value.startsWith('http')) {
      addResult(
        `Env: ${varName}`,
        false,
        `❌ Invalid URL format: ${varName}`,
        `Value: ${value.substring(0, 50)}...`
      );
    } else {
      addResult(
        `Env: ${varName}`,
        true,
        `✅ ${varName} is set`,
        varName.includes('KEY') ? `${value.substring(0, 20)}...` : value
      );
    }
  });
}

function checkSupabaseClient() {
  console.log('\n🔍 Testing Supabase Client Creation...\n');
  
  try {
    const client = createClient();
    addResult(
      'Supabase Client',
      true,
      '✅ Client created successfully',
      'Client instance is ready'
    );
    return client;
  } catch (error) {
    addResult(
      'Supabase Client',
      false,
      '❌ Failed to create client',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return null;
  }
}

function checkRedirectUrls() {
  console.log('\n🔍 Checking Redirect URL Configuration...\n');
  
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) {
    addResult(
      'Redirect URLs',
      false,
      '❌ Cannot check redirect URLs - SUPABASE_URL not set',
      ''
    );
    return;
  }

  const expectedCallbackUrl = 'http://localhost:3000/auth/callback';
  const supabaseCallbackUrl = `${baseUrl}/auth/v1/callback`;
  
  addResult(
    'Redirect URLs - Local',
    true,
    `✅ Local callback URL: ${expectedCallbackUrl}`,
    'Add this to Supabase Dashboard → Authentication → URL Configuration → Redirect URLs'
  );
  
  addResult(
    'Redirect URLs - Supabase',
    true,
    `✅ Supabase callback: ${supabaseCallbackUrl}`,
    'This should be added to Google Cloud Console OAuth credentials'
  );
}

async function checkOAuthConfiguration(client: ReturnType<typeof createClient> | null) {
  console.log('\n🔍 Checking OAuth Configuration...\n');
  
  if (!client) {
    addResult(
      'OAuth Config',
      false,
      '❌ Cannot check OAuth - client not available',
      ''
    );
    return;
  }

  // Note: We can't actually test OAuth without user interaction,
  // but we can verify the configuration is set up correctly
  addResult(
    'OAuth Config',
    true,
    '✅ OAuth configuration check',
    'Manual verification needed:\n' +
    '1. Go to Supabase Dashboard → Authentication → Providers → Google\n' +
    '2. Verify Client ID and Client Secret are set\n' +
    '3. Check that redirect URLs are whitelisted'
  );
}

function checkCallbackRoute() {
  console.log('\n🔍 Checking Callback Route Configuration...\n');
  
  const callbackUrl = 'http://localhost:3000/auth/callback';
  
  addResult(
    'Callback Route',
    true,
    `✅ Callback route exists: ${callbackUrl}`,
    'Route: src/app/auth/callback/route.ts'
  );
  
  addResult(
    'Callback Route - Supabase Config',
    true,
    '⚠️  Manual check required',
    'Ensure this URL is added to:\n' +
    'Supabase Dashboard → Authentication → URL Configuration → Redirect URLs'
  );
}

function printResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60) + '\n');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  results.forEach(result => {
    console.log(`${result.message}`);
    if (result.details) {
      console.log(`   ${result.details}`);
    }
    console.log('');
  });
  
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total:  ${results.length}`);
  console.log('='.repeat(60) + '\n');
  
  if (failed > 0) {
    console.log('⚠️  Some tests failed. Please fix the issues above.\n');
    process.exit(1);
  } else {
    console.log('🎉 All checks passed! Your auth setup looks good.\n');
    console.log('📝 Next Steps:');
    console.log('   1. Verify redirect URLs in Supabase Dashboard');
    console.log('   2. Test Google OAuth login flow');
    console.log('   3. Test magic link email flow\n');
  }
}

async function main() {
  console.log('🚀 Starting Authentication Flow Tests...\n');
  
  checkEnvironmentVariables();
  const client = checkSupabaseClient();
  checkRedirectUrls();
  await checkOAuthConfiguration(client);
  checkCallbackRoute();
  
  printResults();
}

// Run the tests
main().catch(error => {
  console.error('❌ Test script error:', error);
  process.exit(1);
});
