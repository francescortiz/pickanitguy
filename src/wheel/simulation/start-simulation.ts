import { Application } from 'pixi.js';
import { World } from '@dimforge/rapier2d';
import { Viewport } from 'pixi-viewport';
import { createWheelScene } from './scene';
import { destroyRenderDebug, renderDebug } from './render-debug';

export const startSimulation = ({
	pixiApp,
}: {
	pixiApp: Application;
}): {
	shutdownSimulation: () => void;
	spin: () => void;
} => {
	let gravity = { x: 0.0, y: -9.81 };
	let world = new World(gravity);

	const sceneWidth = 800;
	const sceneHeight = 600;
	let runSimulation = true;

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

		// Ste the simulation forward.
		world.step();

		({ winner } = wheelScene.sceneTick());

		if (winner) {
			alert(winner);
			runSimulation = false;
		}

		renderDebug(viewport, world);

		requestAnimationFrame(gameLoop);
	};

	gameLoop();

	return {
		shutdownSimulation: () => {
			runSimulation = false;
			destroyRenderDebug();
		},
		spin: () => wheelScene.spin(),
	};
};
