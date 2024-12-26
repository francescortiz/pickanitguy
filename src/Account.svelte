<script lang="ts">
	import type { AuthSession, SupabaseClient } from '@supabase/supabase-js';
	import type { Database } from './database.types';
	import Wheel from './wheel/Wheel.svelte';

	type AccountProps = {
		session: AuthSession;
		appSupabase: SupabaseClient<Database>;
	}

	const { session, appSupabase }: AccountProps = $props();

	let loading: boolean = $state(true);
	let username: string | null = $state(null);
	let avatarUrl: string | null = $state(null);

	$effect(() => {
		getProfile();
	});

	const getProfile = async () => {
		try {
			loading = true;
			const { user } = session;

			// const { data, error, status } = await supabase
			//   .from("profiles")
			//   .select(`username, avatar_url`)
			//   .eq("id", user.id)
			//   .single();
			//
			// if (error && status !== 406) {
			//   throw error;
			// }
			//
			// if (data) {
			//   username = data.username;
			//   avatarUrl = data.avatar_url;
			// }
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	};

	const updateProfile = async (e: Event) => {
		e.preventDefault();

		try {
			loading = true;
			const { user } = session;

			// const updates = {
			// 	id: user.id,
			// 	username: username,
			// 	avatar_url: avatarUrl,
			// 	updated_at: new Date().toISOString(),
			// };

			// const { error } = await supabase.from("profiles").upsert(updates);

			// if (error) {
			//   throw error;
			// }
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	};

</script>

<div aria-live="polite">
	<form onsubmit={updateProfile} class="form-widget">
		<div>Email: {session.user.email}</div>
		<!--		<div>-->
		<!--			<label for="username">Name</label>-->
		<!--			<input-->
		<!--				id="username"-->
		<!--				type="text"-->
		<!--				value={username() || ""}-->
		<!--				onChange={(e) => setUsername(e.currentTarget.value)}-->
		<!--			/>-->
		<!--			</div>-->
		<!--			<div>-->
		<!--			<label for="website">Website</label>-->
		<!--			<input-->
		<!--			id="website"-->
		<!--			type="text"-->
		<!--			value={website() || ""}-->
		<!--			onChange={(e) => setWebsite(e.currentTarget.value)}-->
		<!--			/>-->
		<!--			</div>-->
		<!--			<div>-->
		<!--			<button-->
		<!--			type="submit"-->
		<!--			class="button primary block"-->
		<!--			disabled={loading()}-->
		<!--			>-->
		<!--			{loading() ? "Saving ..." : "Update profile"}-->
		<!--			</button>-->
		<!--			</div>-->
		<button type="button" class="button block" onclick={() => appSupabase.auth.signOut()}>
			Sign Out
		</button>
	</form>
	<Wheel></Wheel>
</div>