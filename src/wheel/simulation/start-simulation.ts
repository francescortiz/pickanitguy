import { Application } from 'pixi.js';
import { World } from '@dimforge/rapier2d';
import { Viewport } from 'pixi-viewport';
import { createWheelScene } from './scene';
import { destroyRenderDebug, renderDebug } from './render-debug';
import { destroyBeautifulRender, renderBeautiful } from './render-beautiful';

export const FRAME_DURATION_MS: number = Math.round(1000 / 120);

export const startSimulation = ({
	pixiApp,
}: {
	pixiApp: Application;
}): {
	shutdownSimulation: () => void;
	spin: () => void;
	toggleRenderMode: () => void;
} => {
	let gravity = { x: 0.0, y: -9.81 };
	let world = new World(gravity);

	const sceneWidth = 800;
	const sceneHeight = 600;
	let runSimulation = true;
	let isDebugMode = true;

	/**
	 * Pixi stuff
	 */

	const viewport: Viewport = new Viewport({
		screenWidth: sceneWidth,
		screenHeight: sceneHeight,
		worldWidth: 1,
		worldHeight: 1,
		events: pixiApp.renderer.events,
	});

	// activate plugins
	viewport.drag().pinch().wheel().decelerate();

	pixiApp.stage.addChild(viewport);

	const wheelScene = createWheelScene({ world, pegCount: 45 });

	let winner: number | null = null;
	let gameLoop = () => {
		if (!runSimulation) {
			console.debug(`Simulation stopped.`);
			return;
		}

		// Step the simulation forward.
		world.step();

		({ winner } = wheelScene.sceneTick());

		if (winner) {
			alert(winner);
			runSimulation = false;
		}

		if (isDebugMode) {
			renderDebug(viewport, world);
		} else {
			renderBeautiful(viewport, world, wheelScene);
		}

		setTimeout(gameLoop, FRAME_DURATION_MS);
	};

	gameLoop();

	return {
		shutdownSimulation: () => {
			runSimulation = false;
			destroyRenderDebug();
			destroyBeautifulRender();
		},
		spin: () => wheelScene.spin(),
		toggleRenderMode: () => {
			isDebugMode = !isDebugMode;
			if (isDebugMode) {
				destroyBeautifulRender();
			} else {
				destroyRenderDebug();
			}
		}
	};
};
