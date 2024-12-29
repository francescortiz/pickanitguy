import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [wasm(), svelte()],
	server: {
		port: 3000,
	},
	build: {
		target: 'esnext',
	},
});
