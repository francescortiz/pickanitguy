import { Application, Color, Graphics } from 'pixi.js';
import { World } from '@dimforge/rapier2d';
import { Viewport } from 'pixi-viewport';
import { createWheelScene } from './scene';

export const startSimulation = ({
	pixiApp,
}: {
	pixiApp: Application;
}): {
	shutdownSimulation: () => void;
} => {
	let gravity = { x: 0.0, y: -9.81 };
	let world = new World(gravity);

	const sceneWidth = 800;
	const sceneHeight = 600;
	const centerX = sceneWidth / 2;
	const centerY = sceneHeight / 2;
	const renderScale = 150;
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

	/**
	 * Physics stuff
	 */

	const wheelScene = createWheelScene({ world });

	let lines = new Graphics();
	viewport.addChild(lines);

	function renderDebug(pixiViewport: Viewport, physicsWorld: World) {
		const { vertices, colors } = physicsWorld.debugRender();

		lines.clear();

		for (let i = 0; i < vertices.length; i += 4) {
			const c = new Color({
				r: colors[i] * 255,
				g: colors[i + 1] * 255,
				b: colors[i + 2] * 255,
				a: colors[i + 3] * 255,
			});

			lines
				.moveTo(
					centerX + vertices[i] * renderScale,
					centerY + -vertices[i + 1] * renderScale,
				)
				.lineTo(
					centerX + vertices[i + 2] * renderScale,
					centerY + -vertices[i + 3] * renderScale,
				)
				.stroke({ color: c, width: 2 });
		}
	}

	// Game loop. Replace it with your own game loop system.
	let gameLoop = () => {
		if (!runSimulation) {
			console.debug(`Simulation stopped.`);
			return;
		}

		// Ste the simulation forward.
		world.step();

		wheelScene.sceneTick();

		renderDebug(viewport, world);

		requestAnimationFrame(gameLoop);
	};

	gameLoop();

	return {
		shutdownSimulation: () => {
			runSimulation = false;
		},
	};
};
