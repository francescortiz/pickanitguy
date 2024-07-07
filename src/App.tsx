import { createEffect, createSignal } from "solid-js";
import styles from "./App.module.css";
import { AuthSession, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./database.types";
import { Auth } from "./Auth";
import { Account } from "./Account";

export const App = ({ supabase }: { supabase: SupabaseClient<Database> }) => {
	const [session, setSession] = createSignal<AuthSession | null>(null);
	const [initializing, setInitializing] = createSignal(true);

	createEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setInitializing(false);
			setSession(session);
		});

		supabase.auth.onAuthStateChange((_event, session) => {
			setInitializing(false);
			setSession(session);
		});
	});

	return (
		<div class={styles.App}>
			<header class={styles.header}>
				<div class="container" style={{ padding: "50px 0 100px 0" }}>
					{initializing() ? null : !session() ? (
						<Auth supabase={supabase} />
					) : (
						<Account supabase={supabase} session={session()!} />
					)}
				</div>
			</header>
		</div>
	);
};
