<script lang="ts">
	import type { AuthSession } from '@supabase/supabase-js';
	import Auth from './Auth.svelte';
	import Account from './Account.svelte';
	import type { AppSupabase } from './app-supabase';

	type AppProps = {
		appSupabase: AppSupabase
	}

	const { appSupabase }: AppProps = $props();

	let session: AuthSession | null = $state(null);

	$effect(() => {
		if (!appSupabase) {
			console.warn(`No appSupabase (${appSupabase})`);
			return;
		}

		appSupabase.auth.getSession().then(({ data }) => {
			session = data.session;
		});

		appSupabase.auth.onAuthStateChange((_event, receivedSession) => {
			session = receivedSession;
		});
	});
</script>

<div class="app">
	<header class="header">
		<div class="container" style:padding="50px 0 100px 0">
			{#if !session}
				<Auth appSupabase={appSupabase} />
			{:else}
				<Account appSupabase={appSupabase} session={session} />
			{/if}
		</div>
	</header>
</div>

<style>
    .app {
        text-align: center;
    }

    .header {

        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: calc(10px + 2vmin);
        color: white;
    }
</style>