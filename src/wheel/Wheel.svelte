<script lang="ts">
	import { bootstrapWheel } from './bootstrap-wheel';

	/**
	 * Using `as` for HTML element's references is the best way the Svelte guys could come up with.
	 */
	let canvas: HTMLCanvasElement = $state() as HTMLCanvasElement;
	let spin: () => void = $state(() => {});
	let toggleRenderMode: () => void = $state(() => {});
	let isDebugMode: boolean = $state(true);

	$effect(() => {
		const wheelDef = bootstrapWheel(canvas);
		spin = wheelDef.spin;
		toggleRenderMode = () => {
			isDebugMode = !isDebugMode;
			wheelDef.toggleRenderMode();
		};
		return wheelDef.shutdown;
	});
</script>

<div class="wheel-controls">
	<button onclick={spin} class="spin-button">Spin</button>
	<button onclick={toggleRenderMode} class="toggle-button">
		{isDebugMode ? 'Switch to Beautiful Mode' : 'Switch to Debug Mode'}
	</button>
</div>

<canvas bind:this={canvas} width="800" height="600"></canvas>

<style>
	.wheel-controls {
		margin-bottom: 1rem;
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.spin-button, .toggle-button {
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		font-weight: bold;
		cursor: pointer;
	}

	.spin-button {
		background-color: #5e35b1;
		color: white;
		border: none;
	}

	.toggle-button {
		background-color: #f5f5f5;
		color: #333;
		border: 1px solid #ddd;
	}
</style>