<script lang="ts">
	import { bootstrapWheel } from './bootstrap-wheel';

	/**
	 * Using `as` for HTML element's references is the best way the Svelte guys could come up with.
	 */
	let canvas: HTMLCanvasElement = $state() as HTMLCanvasElement;
	let spin: () => void = $state(() => {
	});

	$effect(() => {
		const wheelDef = bootstrapWheel(canvas);
		spin = wheelDef.spin;
		return wheelDef.shutdown;
	});
</script>

<button onclick={spin}>Spin</button>

<canvas bind:this={canvas} width="800" height="600"></canvas>