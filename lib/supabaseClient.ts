// Create Supabase client on the client-side only to avoid importing
// `@supabase/supabase-js` during server-side module evaluation where
// globals like `Request` may not be defined.

let _supabase: any = null;

export async function getSupabaseClient() {
  if (typeof window === "undefined") {
    throw new Error("getSupabaseClient must be called from the browser/client-side");
  }

  if (_supabase) return _supabase;

  const { createClient } = await import("@supabase/supabase-js");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

export default getSupabaseClient;
