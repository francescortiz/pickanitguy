import { Application } from 'pixi.js';
import { startSimulation } from './simulation';

export const bootstrapWheel = (
	canvas: HTMLCanvasElement,
): {
	shutdown: () => void;
} => {
	let runPixiApp = true;

	const pixiApp: Application = new Application();

	let shutdownSimulation: () => void | undefined;

	pixiApp
		.init({
			// background: "#1099bb",
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

			({ shutdownSimulation } = startSimulation({ pixiApp }));
		});

	return {
		shutdown: () => {
			runPixiApp = false;
			if (shutdownSimulation) {
				shutdownSimulation();
			}
			pixiApp.destroy();
		},
	};
};
