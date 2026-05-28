import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createAuthenticatedSupabase(accessToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

export type Sale = {
  id: string;
  agent: string;
  neighborhood: string;
  date: string;
  in_zone: boolean;
  user_id?: string;
  created_at?: string;
};

export type UserProfile = {
  id: string;
  email: string;
  team_name?: string;
};
