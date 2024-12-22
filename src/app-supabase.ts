import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const bootstrapAppSupabase = (): {
	appSupabase: AppSupabase;
} => {
	const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
	const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

	return {
		appSupabase: createClient<Database>(supabaseUrl, supabaseAnonKey),
	};
};

export type AppSupabase = SupabaseClient<Database>;
