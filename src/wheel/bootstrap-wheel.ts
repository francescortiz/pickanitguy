import { Application } from 'pixi.js';
import { startSimulation } from './simulation/start-simulation';

export const bootstrapWheel = (
	canvas: HTMLCanvasElement,
): {
	shutdown: () => void;
	spin: () => void;
	toggleRenderMode: () => void;
} => {
	let runPixiApp = true;

	const pixiApp: Application = new Application();

	let shutdownSimulation: () => void | undefined;
	let spin = () => {};
	let toggleRenderMode = () => {};

	pixiApp
		.init({
			background: "#1a1a2e",
			resizeTo: canvas,
			canvas,
		})
		.then(() => {
			if (!runPixiApp) {
				/**
				 * Since we live in an asynchronous function, we don't event bother to start if
				 * simulation has already stopped.
				 */
				return;
			}

			({ shutdownSimulation, spin, toggleRenderMode } = startSimulation({ pixiApp }));
		});

	// @ts-ignore Let's enable pixi dev tools
	globalThis.__PIXI_APP__ = pixiApp;

	return {
		shutdown: () => {
			runPixiApp = false;
			if (shutdownSimulation) {
				shutdownSimulation();
			}
			pixiApp.destroy();
		},
		spin: () => {
			if (spin) {
				spin();
			}
		},
		toggleRenderMode: () => {
			if (toggleRenderMode) {
				toggleRenderMode();
			}
		},
	};
};
