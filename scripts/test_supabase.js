/*
Simple Supabase smoke test script.
Usage (if you have .env.local):
  node -r dotenv/config scripts/test_supabase.js

Environment variables required:
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY

This script will:
 - call rpc('get_transaction_stats')
 - fetch first page of transactions (20 items) with operator relation
*/

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Try to load .env.local manually if present (no dotenv dependency required)
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) return;
      const key = m[1];
      let val = m[2] || '';
      // remove surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    });
  }
} catch (e) {
  // ignore
}

// Polyfill fetch/Headers/Request/Response for Node using undici (already a dependency)
try {
  const undici = require('undici');
  if (typeof globalThis.fetch !== 'function') globalThis.fetch = undici.fetch;
  if (typeof globalThis.Headers === 'undefined') globalThis.Headers = undici.Headers;
  if (typeof globalThis.Request === 'undefined') globalThis.Request = undici.Request;
  if (typeof globalThis.Response === 'undefined') globalThis.Response = undici.Response;
} catch (e) {
  // undici not available — supabase may fail in older Node
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  console.log('Calling get_transaction_stats...');
  const { data: stats, error: statsErr } = await supabase.rpc('get_transaction_stats');
  if (statsErr) {
    console.error('RPC error:', statsErr.message || statsErr);
  } else {
    console.log('Stats:', JSON.stringify(stats, null, 2));
  }

  console.log('\nFetching first page of transactions (20)...');
  const { data: txs, error: txErr, count } = await supabase
    .from('transactions')
    .select('id, donor_name, total_amount, total_rice, payment_method, operator_id, created_at, operators(username,email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, 19);

  if (txErr) {
    console.error('Fetch error:', txErr.message || txErr);
    process.exit(1);
  }

  console.log(`Total transactions: ${count}`);
  console.log('Transactions page (up to 20):');
  console.log(JSON.stringify(txs, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
