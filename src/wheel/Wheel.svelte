<script lang="ts">
	import { bootstrapWheel } from './bootstrap-wheel';

	/**
	 * Using `as` for HTML element's references is the best way the Svelte guys could come up with.
	 */
	let canvas: HTMLCanvasElement = $state() as HTMLCanvasElement;

	$effect(() => {
		const { shutdown } = bootstrapWheel(canvas);

		return shutdown;
	});
</script>

<canvas bind:this={canvas} id="demo-canvas" width="800" height="700"></canvas>