#!/usr/bin/env node
// Seeder: set an existing auth user as superadmin in the operators table
// Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... SUPERADMIN_EMAIL=admin@example.com npm run seed:superadmin
// Note: The Auth user must already exist in Supabase. Create it manually in Supabase dashboard first.

const fetch = global.fetch || require('node-fetch');

async function main() {
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment');
    process.exit(1);
  }

  if (!SUPERADMIN_EMAIL) {
    console.error('Error: SUPERADMIN_EMAIL must be set in the environment');
    console.error('Usage: SUPERADMIN_EMAIL=admin@example.com npm run seed:superadmin');
    console.error('Note: Create the Auth user manually in Supabase dashboard first.');
    process.exit(1);
  }

  console.log('Seeding superadmin...');
  console.log('SUPABASE_URL:', SUPABASE_URL);
  console.log('Looking up Auth user with email:', SUPERADMIN_EMAIL);

  let userId;

  try {
    // Fetch existing user by email via Admin API
    const adminUrl = new URL('/admin/v1/users', SUPABASE_URL).toString();
    const url = adminUrl + '?email=' + encodeURIComponent(SUPERADMIN_EMAIL);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Error: Admin API returned ${res.status}: ${errorText}`);
      console.error('Make sure the Auth user exists in Supabase and SERVICE_ROLE_KEY is correct.');
      process.exit(1);
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      console.error('Error: No Auth user found with email:', SUPERADMIN_EMAIL);
      console.error('Please create the user manually in Supabase dashboard first.');
      process.exit(1);
    }

    userId = data[0].id;
    console.log('Found existing Auth user with ID:', userId);
  } catch (err) {
    console.error('Error fetching user by email:', err.message);
    process.exit(1);
  }

  console.log('Upserting operator row for ID:', userId);
  const restUrl = new URL('/rest/v1/operators', SUPABASE_URL).toString();
  const payload = [{ id: userId, role: 'superadmin', active: true }];

  try {
    const res2 = await fetch(restUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SERVICE_KEY}`,
        apikey: SERVICE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(payload),
    });

    const text = await res2.text();
    if (!res2.ok) {
      console.error(`Error: PostgREST returned ${res2.status}: ${text}`);
      process.exit(1);
    }

    console.log('Success! Superadmin seeded or upserted.');
    console.log('Response:', text);
    process.exit(0);
  } catch (err) {
    console.error('Error upserting operator:', err.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
