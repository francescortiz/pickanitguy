import { AuthSession, SupabaseClient } from "@supabase/supabase-js";
import { Component } from "solid-js";
import { Database } from "./database.types";

import { Viewport } from "pixi-viewport";
import { ColliderDesc, RigidBodyDesc, World } from "@dimforge/rapier2d";
import { Application, Color, Graphics, Sprite, Texture } from "pixi.js";

interface Props {
	session: AuthSession;
	supabase: SupabaseClient<Database>;
}

const startSimulation = async (canvas: HTMLCanvasElement) => {
	let gravity = { x: 0.0, y: -9.81 };
	let world = new World(gravity);

	// Create the ground
	let groundColliderDesc = ColliderDesc.cuboid(10.0, 0);
	groundColliderDesc.setTranslation(0.0, -5.0);
	world.createCollider(groundColliderDesc);

	// Create a dynamic rigid-body.
	let rigidBodyDesc = RigidBodyDesc.dynamic().setTranslation(0.0, 10.0);
	let rigidBody = world.createRigidBody(rigidBodyDesc);

	// Create a cuboid collider attached to the dynamic rigidBody.
	let colliderDesc = ColliderDesc.cuboid(0.5, 0.5);
	let collider = world.createCollider(colliderDesc, rigidBody);

	const scale = 30;
	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;

	let GRAPHICS: Array<Graphics> = [];
	function renderDebug(pixiViewport: Viewport, physicsWorld: World) {
		const { vertices, colors } = physicsWorld.debugRender();

		GRAPHICS.forEach((g) => g.destroy());
		GRAPHICS = [];

		const g = new Graphics();

		for (let i = 0; i < vertices.length; i += 4) {
			const c = new Color({
				r: colors[i] * 255,
				g: colors[i + 1] * 255,
				b: colors[i + 2] * 255,
				a: colors[i + 3] * 255,
			});

			g.moveTo(centerX + vertices[i] * scale, centerY + -vertices[i + 1] * scale)
				.lineTo(centerX + vertices[i + 2] * scale, centerY + -vertices[i + 3] * scale)
				.stroke({ color: c, width: 1 });
		}
		GRAPHICS.push(g);
		viewport.addChild(g);
	}

	const app: Application = new Application();

	await app.init({
		// background: "#1099bb",
		resizeTo: canvas,
		canvas,
	});

	const viewport: Viewport = new Viewport({
		screenWidth: 800,
		screenHeight: 700,
		worldWidth: 1,
		worldHeight: 1,
		events: app.renderer.events,
	});

	// activate plugins
	viewport.drag().pinch().wheel().decelerate();

	app.stage.addChild(viewport);

	// document.body.append(app.canvas);

	// Game loop. Replace by your own game loop system.
	let gameLoop = () => {
		// Ste the simulation forward.
		world.step();

		// Get and print the rigid-body's position.
		let position = rigidBody.translation();
		console.log("Rigid-body position: ", position.x, ",", position.y);

		renderDebug(viewport, world);

		requestAnimationFrame(gameLoop);
	};

	gameLoop();
};

export const WheelRapier: Component<Props> = ({ supabase, session }) => {
	return <canvas ref={startSimulation} id="demo-canvas" width="800" height="700"></canvas>;
};
