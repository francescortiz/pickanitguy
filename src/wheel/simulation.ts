import { Application, Color, Graphics } from 'pixi.js';
import * as RAPIER from '@dimforge/rapier2d';
import { ColliderDesc, RigidBodyDesc, World } from '@dimforge/rapier2d';
import { Viewport } from 'pixi-viewport';

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
	const sceneHeight = 700;
	const centerX = sceneWidth / 2;
	const centerY = sceneHeight / 2;
	const renderScale = 40;
	const meters = 1;
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

	// Create the ground
	// Create a dynamic rigid-body.
	const groundDesc = RigidBodyDesc.fixed().setTranslation(0.0 * meters, -5.0 * meters);
	const ground = world.createRigidBody(groundDesc);

	const groundColliderDesc = ColliderDesc.cuboid(10.0 * meters, 0.5 * meters)
		.setRestitution(0.0)
		.setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Min);
	const groundCollider = world.createCollider(groundColliderDesc, ground);

	// Create a dynamic rigid-body.
	const boxDesc = RigidBodyDesc.dynamic().setTranslation(0.0 * meters, 10.0 * meters);
	const box = world.createRigidBody(boxDesc);

	// Create a cuboid collider attached to the dynamic rigidBody.
	const boxColliderDesc = ColliderDesc.cuboid(0.5 * meters, 0.5 * meters)
		.setRestitution(0.0)
		.setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Min);
	const boxCollider = world.createCollider(boxColliderDesc, box);

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
				.stroke({ color: c, width: Math.max(1, 0.1 * renderScale) });
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

		// Get and print the rigid-body's position.
		let position = box.translation();
		console.log('Rigid-body position: ', position.x, ',', position.y);

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
