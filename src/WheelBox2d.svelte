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

	type WheelBox2dProps = {
		session: AuthSession;
		appSupabase: SupabaseClient<Database>;
	}

	enum CollisionCategory {
		NoCollisions = 0b0000,
		Wheel = 0b0000,
		Pegs = 0b0010,
	}

	enum CollisionMasks {
		NoCollisions = 0b0000,
		Wheel = 0b0000,
		Pegs = 0b0001
	}

	const { appSupabase, session }: WheelBox2dProps = $props();

	let canvasRef: HTMLCanvasElement | null = $state(null);

	$effect(() => {

		if (canvasRef === null) {
			return;
		}

		const canvas: HTMLCanvasElement = canvasRef;

		Box2DFactory().then((box2D: typeof Box2D & EmscriptenModule) => {
			const {
				b2BodyDef,
				b2Filter,
				b2_dynamicBody,
				b2_staticBody,
				b2PolygonShape,
				b2CircleShape,
				b2Vec2,
				b2World,
				b2RevoluteJointDef,
				b2WeldJointDef,
			} = box2D;

			const ctx = canvas.getContext('2d');

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

			/**
			 * Weehl
			 */




			const wheelBase = (() => { // Wheel base
				const wheelBasePosition = new b2Vec2(0, 0);

				const wheelBaseDefinition = new b2BodyDef();
				wheelBaseDefinition.set_type(b2_staticBody);
				wheelBaseDefinition.set_position(wheelBasePosition);

				const wheelBaseShape = new b2PolygonShape();
				wheelBaseShape.SetAsBox(0.25, 0.25);

				const wheelBase = world.CreateBody(wheelBaseDefinition);

				const wheelBaseFixture = wheelBase.CreateFixture(wheelBaseShape, 1);
				const wheelBaseFilter = new b2Filter();
				wheelBaseFilter.set_categoryBits(CollisionCategory.NoCollisions);
				wheelBaseFilter.set_maskBits(CollisionMasks.NoCollisions);
				wheelBaseFixture.SetFilterData(wheelBaseFilter);

				// wheelBase.SetTransform(wheelBasePosition, 0);
				// wheelBase.SetLinearVelocity(boxPosition);
				wheelBase.SetAwake(true);
				wheelBase.SetEnabled(true);

				return wheelBase;
			})();


			const wheelRadius = 2.50;

			const wheel = (() => { // Wheel
				const wheelPosition = new b2Vec2(0, wheelRadius);

				const wheelDefinition = new b2BodyDef();
				wheelDefinition.set_type(b2_dynamicBody);
				wheelDefinition.set_position(wheelPosition);

				const wheelShape = new b2CircleShape();
				wheelShape.set_m_radius(wheelRadius);

				const wheel = world.CreateBody(wheelDefinition);

				const wheelFixture = wheel.CreateFixture(wheelShape, 1);
				const wheelFilter = new b2Filter();
				wheelFilter.set_categoryBits(CollisionCategory.Wheel);
				wheelFilter.set_maskBits(CollisionMasks.Wheel);
				wheelFixture.SetFilterData(wheelFilter);
				wheelFixture.SetDensity(0.5)
				wheelFixture.SetFriction(0.5);

				// wheel.SetTransform(wheelBasePosition, 0);
				// wheel.SetLinearVelocity(boxPosition);
				wheel.SetAwake(true);
				wheel.SetEnabled(true);

				return wheel;
			})();

			const pegFilter = new b2Filter();
			pegFilter.set_categoryBits(CollisionCategory.Pegs);
			pegFilter.set_maskBits(CollisionMasks.Pegs);

			{
				const pegCount = 12;
				const pegAngleDelta = Math.PI * 2 / pegCount;
				for (let i = 0; i < pegCount; i++) {
					const pegRadius = 0.05;
					const pegOffset = (wheelRadius - pegRadius * 2);
					const angle = pegAngleDelta * i;
					const pegX = Math.cos(angle) * pegOffset;
					const pegY = Math.sin(angle) * pegOffset;
					const pegPosition = new b2Vec2(pegX, pegY);

					const pegDefinition = new b2BodyDef();
					pegDefinition.set_type(b2_dynamicBody);
					pegDefinition.set_position(pegPosition);
					pegDefinition.set_bullet(true);

					const pegShape = new b2CircleShape();
					pegShape.set_m_radius(pegRadius);

					const peg = world.CreateBody(pegDefinition);

					const pegFixture = peg.CreateFixture(pegShape, 1);
					pegFixture.SetFilterData(pegFilter);
					pegFixture.SetDensity(0.5);
					pegFixture.SetFriction(0.5);


					const pegJointDefinition = new b2RevoluteJointDef();
					// pegJointDefinition.set_collideConnected(true)
					pegJointDefinition.set_bodyA(peg);
					pegJointDefinition.set_bodyB(wheel);
					pegJointDefinition.set_localAnchorA(new b2Vec2(0,0));
					pegJointDefinition.set_localAnchorB(pegPosition);
					// pegJointDefinition.set_stiffness(0);
					// pegJointDefinition.set_damping(1.0);
					pegJointDefinition.set_enableLimit(true)
					pegJointDefinition.set_upperAngle(0)
					pegJointDefinition.set_lowerAngle(0)
					pegJointDefinition.set_referenceAngle(wheel.GetAngle() - peg.GetAngle())
					pegJointDefinition.set_collideConnected(false)
					const pegJoint = world.CreateJoint(pegJointDefinition);

				}
			}


			// { // Wheel joint
			// 	const wheelJointDefinition = new b2RevoluteJointDef();
			// 	wheelJointDefinition.set_bodyA(wheel);
			// 	wheelJointDefinition.set_bodyB(wheelBase);
			// 	const wheelJoint = world.CreateJoint(wheelJointDefinition);
			// }


			wheel.ApplyAngularImpulse(120, true);


			/**
			 * EXAMPLE
			 */


			const sideLengthMetres = 1;
			const boxShape = new b2PolygonShape();
			boxShape.SetAsBox(sideLengthMetres / 4, sideLengthMetres / 4);

			const zero = new b2Vec2(0, 0);
			const boxPosition = new b2Vec2(3, -3);

			const boxDefinition = new b2BodyDef();
			boxDefinition.set_type(b2_dynamicBody);
			boxDefinition.set_position(boxPosition);

			const box = world.CreateBody(boxDefinition);
			const boxFixture = box.CreateFixture(boxShape, 1);
			boxFixture.SetDensity(100)
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
				ctx.fillRect(0, 0, canvas.width, canvas.height);

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

			canvas.onclick = () => {
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

<canvas bind:this={canvasRef} width="800" height="700"></canvas>
