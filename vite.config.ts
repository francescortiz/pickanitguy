import { defineConfig, ViteDevServer } from 'vite';
import * as path from 'node:path';
import * as fs from 'node:fs';
import wasm from 'vite-plugin-wasm';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [
		wasm(),
		svelte(),
		{
			name: 'server-wasm-with-correct-mime-type',
			configureServer(server: ViteDevServer) {
				const logger = server.config.logger;
				return () => {
					server.middlewares.use(async (request, response, next) => {
						const originalUrl = request.originalUrl;
						if (originalUrl && originalUrl.endsWith('.wasm')) {
							response.setHeader('Content-Type', 'application/wasm');
							// Read originalUrl from file system
							// and pipe it to response
							// response.end(wasmFileContent);

							const wasmCandidate = path.join(
								__dirname,
								'./node_modules/.pnpm/box2d-wasm@7.0.0/node_modules/box2d-wasm/dist/es/',
								path.basename(originalUrl),
							);

							if (!fs.existsSync(wasmCandidate)) {
								logger.info(
									`Could not find wasm file: ${wasmCandidate}. Skipping this middleware.`,
								);
								next();
								return;
							}

							logger.info(`Serving '${originalUrl}' from ${wasmCandidate}`);

							fs.createReadStream(wasmCandidate).pipe(response);

							return;
						}

						next();
					});
				};
			},
		},
	],
	server: {
		port: 3000,
	},
	build: {
		target: 'esnext',
	},
});
