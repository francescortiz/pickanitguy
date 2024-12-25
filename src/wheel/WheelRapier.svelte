<script lang="ts">
	import type { AuthSession } from '@supabase/supabase-js';
	import type { AppSupabase } from '../app-supabase';
	import { bootstrapWheel } from './wheel';

	type WheelRapierProps = {
		session: AuthSession;
		appSupabase: AppSupabase;
	}

	const { appSupabase, session }: WheelRapierProps = $props();


	let canvasRef: HTMLCanvasElement | null = $state(null);


	$effect(() => {

		if (!canvasRef) {
			return;
		}

		const { shutdown } = bootstrapWheel(canvasRef);

		return shutdown;
	});


</script>

<canvas bind:this={canvasRef} id="demo-canvas" width="800" height="700"></canvas>