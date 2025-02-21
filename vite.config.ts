import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [wasm(), svelte(), tailwindcss()],
	server: {
		port: 3000,
	},
	build: {
		target: 'esnext',
		rollupOptions: {
			/**
			 * We need to remove tree shaking or else the build does not include the code to
			 * initialise the rapier wasm: https://github.com/dimforge/rapier.js/issues/278
			 */
			treeshake: false,
		},
	},
});
