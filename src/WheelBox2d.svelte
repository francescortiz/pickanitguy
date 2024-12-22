<script lang="ts">
	import type { AuthSession, SupabaseClient } from '@supabase/supabase-js';
	import type { Database } from './database.types';
	/**
	 * importing from 'box2d-wasm' like this requires you to have
	 * {
	 *   compilerOptions: {
	 *     moduleResolution: "node"
	 *   }
	 * }
	 * in your tsconfig.json
	 */
	import Box2DFactory from 'box2d-wasm';
	import { makeDebugDraw } from './debugDraw';

	interface WheelBox2dProps {
		session: AuthSession;
		appSupabase: SupabaseClient<Database>;
	}

	const { appSupabase, session }: WheelBox2dProps = $props();

	let canvas: HTMLCanvasElement | null = $state(null);

	$effect (() => {

		if (canvas === null) {
			return
		}

		const ensuredCanvas: HTMLCanvasElement = canvas

		Box2DFactory().then((box2D: typeof Box2D & EmscriptenModule) => {
			const { b2BodyDef, b2_dynamicBody, b2_staticBody, b2PolygonShape, b2Vec2, b2World } = box2D;

			const ctx = ensuredCanvas.getContext('2d');

			if (!ctx) {
				throw new Error('Unable to get 2d context from canvas');
			}

			const pixelsPerMeter = 64;
			const cameraOffsetMetres = {
				x: 6.25,
				y: 5,
			};

			// in metres per second squared
			const gravity = new b2Vec2(0, 9.81);
			const world = new b2World(gravity);

			const debugDraw = makeDebugDraw(ctx, pixelsPerMeter, box2D);
			world.SetDebugDraw(debugDraw);

			const sideLengthMetres = 1;
			const boxShape = new b2PolygonShape();
			boxShape.SetAsBox(sideLengthMetres / 4, sideLengthMetres / 4);

			const zero = new b2Vec2(0, 0);
			const boxPosition = new b2Vec2(0, -3);

			const boxDefinition = new b2BodyDef();
			boxDefinition.set_type(b2_dynamicBody);
			boxDefinition.set_position(boxPosition);

			const box = world.CreateBody(boxDefinition);
			box.CreateFixture(boxShape, 1);
			box.SetTransform(boxPosition, 0);
			box.SetLinearVelocity(boxPosition);
			box.SetAwake(true);
			box.SetEnabled(true);

			const groundPosition = new b2Vec2(0, 5);
			const groundDefinition = new b2BodyDef();
			groundDefinition.set_type(b2_staticBody);
			groundDefinition.set_position(groundPosition);

			const groundShape = new b2PolygonShape();
			groundShape.SetAsBox(sideLengthMetres * 6, sideLengthMetres / 4);

			const ground = world.CreateBody(groundDefinition);
			ground.CreateFixture(groundShape, 1);
			ground.SetTransform(groundPosition, 0);
			ground.SetLinearVelocity(boxPosition);
			ground.SetAwake(true);
			ground.SetEnabled(true);

			const leftWallPosition = new b2Vec2(-6, 1);
			const leftWallDefinition = new b2BodyDef();
			leftWallDefinition.set_type(b2_staticBody);
			leftWallDefinition.set_position(leftWallPosition);

			const leftWallShape = new b2PolygonShape();
			leftWallShape.SetAsBox(sideLengthMetres / 4, sideLengthMetres * 4);

			const leftWall = world.CreateBody(leftWallDefinition);
			leftWall.CreateFixture(leftWallShape, 1);
			leftWall.SetTransform(leftWallPosition, 0);
			leftWall.SetLinearVelocity(boxPosition);
			leftWall.SetAwake(true);
			leftWall.SetEnabled(true);

			const rightWallPosition = new b2Vec2(6, 1);
			const rightWallDefinition = new b2BodyDef();
			rightWallDefinition.set_type(b2_staticBody);
			rightWallDefinition.set_position(rightWallPosition);

			const rightWallShape = new b2PolygonShape();
			rightWallShape.SetAsBox(sideLengthMetres / 4, sideLengthMetres * 4);

			const rightWall = world.CreateBody(rightWallDefinition);
			rightWall.CreateFixture(rightWallShape, 1);
			rightWall.SetTransform(rightWallPosition, 0);
			rightWall.SetLinearVelocity(boxPosition);
			rightWall.SetAwake(true);
			rightWall.SetEnabled(true);

			// calculate no more than a 60th of a second during one world.Step() call
			const maxTimeStepMs = (1 / 60) * 1000;
			const velocityIterations = 1;
			const positionIterations = 1;

			/**
			 * Advances the world's physics by the requested number of milliseconds
			 * @param {number} deltaMs
			 */
			const step = (deltaMs: number) => {
				const clampedDeltaMs = Math.min(deltaMs, maxTimeStepMs);
				world.Step(deltaMs / 1000, velocityIterations, positionIterations);
			};

			const drawCanvas = () => {
				ctx.fillStyle = 'rgb(0,0,0)';
				ctx.fillRect(0, 0, ensuredCanvas.width, ensuredCanvas.height);

				ctx.save();
				ctx.scale(pixelsPerMeter, pixelsPerMeter);
				const { x, y } = cameraOffsetMetres;
				ctx.translate(x, y);
				ctx.lineWidth /= pixelsPerMeter;

				ctx.fillStyle = 'rgb(255,255,0)';
				world.DebugDraw();

				ctx.restore();
			};

			/** @type {number} you can use this handle to cancel the callback via cancelAnimationFrame */
			let handle;
			(function loop(prevMs) {
				const nowMs = window.performance.now();
				handle = requestAnimationFrame(() => loop(nowMs));
				const deltaMs = nowMs - prevMs;
				step(deltaMs);
				drawCanvas();
			})(window.performance.now());

			const jump = () => {
				if (Math.abs(box.GetLinearVelocity().y) < 0.001) {
					const boxLinerVelocity = box.GetLinearVelocity();
					boxLinerVelocity.op_add(new b2Vec2(0, -6));
					box.SetLinearVelocity(boxLinerVelocity);
				}
			};

			const left = () => {
				const boxLinerVelocity = box.GetLinearVelocity();
				boxLinerVelocity.op_add(new b2Vec2(-1, 0));
				box.SetLinearVelocity(boxLinerVelocity);
			};

			const right = () => {
				const boxLinerVelocity = box.GetLinearVelocity();
				boxLinerVelocity.op_add(new b2Vec2(1, 0));
				box.SetLinearVelocity(boxLinerVelocity);
			};

			ensuredCanvas.onclick = () => {
				jump();
			};

			window.onkeydown = (event) => {
				switch (event.key) {
					case 'W':
					case 'w':
					case ' ': {
						jump();
						break;
					}
					case 'A':
					case 'a': {
						left();
						break;
					}
					case 'D':
					case 'd': {
						right();
						break;
					}
				}
			};
		});
	});

</script>

<canvas bind:this={canvas} width="800" height="700"></canvas>
