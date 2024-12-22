<script lang="ts">
	import type { AuthSession, SupabaseClient } from '@supabase/supabase-js';
	import type { Database } from './database.types';
	import WheelBox2d from './WheelBox2d.svelte';

	type AccountProps = {
		session: AuthSession;
		appSupabase: SupabaseClient<Database>;
	}

	const { session, appSupabase }: AccountProps = $props();

	let loading: boolean = $state(true);
	let username: string | null = $state(null);
	let website: string | null = $state(null);
	let avatar: string | null = $state(null);

	$effect(() => {
		getProfile();
	});

	const getProfile = async () => {
		try {
			loading = true;
			const { user } = session;

			// const { data, error, status } = await supabase
			//   .from("profiles")
			//   .select(`username, website, avatar_url`)
			//   .eq("id", user.id)
			//   .single();
			//
			// if (error && status !== 406) {
			//   throw error;
			// }
			//
			// if (data) {
			//   setUsername(data.username);
			//   setWebsite(data.website);
			//   setAvatarUrl(data.avatar_url);
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
			// 	website: website,
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
	<WheelBox2d session={session} appSupabase={appSupabase}></WheelBox2d>
</div>