<script lang="ts">
	import logo from './assets/Pick an IT Guy.webp';
	import type { AppSupabase } from './app-supabase';

	type AuthProps = {
		appSupabase: AppSupabase
	}

	const { appSupabase }: AuthProps = $props();

	let loading = $state(false);

	const handleLogin = async (e: SubmitEvent) => {
		e.preventDefault();

		try {
			const { protocol, host, port } = location;
			const portFragment = ['http80', 'https443'].includes(location.protocol + location.port)
				? ''
				: location.port
					? `:${location.port}`
					: '';
			const redirectUrl = `${protocol}://${host}${portFragment}/?authorized=true`;
			loading = true;
			const { error } = await appSupabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: redirectUrl,
				},
			});
			if (error) {
				throw error;
			}
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	};

</script>

<img src={logo} class="logo" alt="Pick an IT Guy" />
<p>Pick an IT Guy</p>

<div class="row flex-center flex">
	<div class="col-6 form-widget" aria-live="polite">
		<p class="description">Sign in with Google with the button below</p>
		<form class="form-widget" onsubmit={handleLogin}>
			<div>
				<button type="submit" class="button block" aria-live="polite">
					{#if loading}
						<span>Loading</span>
					{:else}
						<span>Login with Google</span>
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>


<style>

    .logo {
        max-width: 100%;
        max-height: 60vh;
        height: auto;
        pointer-events: none;
    }

</style>