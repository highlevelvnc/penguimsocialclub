import { createClient } from '@supabase/supabase-js'

// Admin client uses service role key — bypasses RLS.
// Untyped until we generate types from a live Supabase project:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts
// Then change this to: createClient<Database>(...)

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
