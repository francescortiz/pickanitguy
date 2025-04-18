import { JointData, RevoluteImpulseJoint, RigidBodyType, type World } from '@dimforge/rapier2d';
import { type Body, makeBall, makeConvexMesh, makeCuboid } from './lib';
import { WHEEL_CONSTANTS } from './constants';

export const createWheelScene = ({
	world,
	pegCount,
}: {
	world: World;
	pegCount: number;
}): {
	wheel: Body;
	pegs: Array<Body>;
	needle: Body;
	sceneTick: () => {
		winner: number | null;
	};
	spin: () => void;
} => {
	const { pegRadius, wheelRadius, strengthLoop1, strengthLoop2 } = WHEEL_CONSTANTS;
	const pegOffset = wheelRadius - pegRadius;

	const armStrength = (strengthLoop1 + Math.random() * strengthLoop2) * 2;
	const armWeakPullPushRatio = 3 / 5;

	const needleOffset = 0.19;

	const wheelBase = makeBall({ world, x: 0, y: 0, r: 0.2, type: RigidBodyType.Fixed });
	const wheel = makeBall({
		world,
		x: 0,
		y: 0,
		r: wheelRadius,
		type: RigidBodyType.Dynamic,
		density: 1,
		colliderGroups: 0,
	});

	const wheelJoint: RevoluteImpulseJoint = world.createImpulseJoint(
		JointData.revolute({ x: 0.0, y: 0.0 }, { x: 0.0, y: 0.0 }),
		wheel.rigidBody,
		wheelBase.rigidBody,
		true,
	) as RevoluteImpulseJoint;

	wheelJoint.configureMotorVelocity(0.4, 10000);

	const pegs: Array<Body> = [];
	for (let pegIndex = 0; pegIndex < pegCount; pegIndex++) {
		const pegAngle = pegIndex * ((Math.PI * 2) / pegCount);
		const pegX = Math.cos(pegAngle) * pegOffset;
		const pegY = Math.sin(pegAngle) * pegOffset;

		const peg = makeBall({
			world,
			x: pegX,
			y: pegY,
			r: pegRadius,
			type: RigidBodyType.Dynamic,
		});

		pegs.push(peg);

		const pegJoint = world.createImpulseJoint(
			JointData.fixed({ x: pegX, y: pegY }, 0, { x: 0.0, y: 0.0 }, 0),
			wheel.rigidBody,
			peg.rigidBody,
			true,
		);
	}

	const needle = makeConvexMesh({
		world,
		x: 0,
		y: 0,
		type: RigidBodyType.Dynamic,
		vertices: new Float32Array(
			[
				[0, 0.15], // Top
				[0.06, 0], // Right
				[0.001, -0.4], // Bottom right
				[-0.001, -0.4], // Bottom left
				[-0.06, 0], // Left
			].flatMap((x) => x),
		),
		density: 5,
		friction: 0.1,
	});
	needle.rigidBody.setRotation(0.3, true);
	const needleBase = makeBall({
		world,
		x: 0,
		y: wheelRadius + needleOffset,
		r: 0.01,
		type: RigidBodyType.Fixed,
		colliderGroups: 0b0,
	});
	const needleRightStop = makeCuboid({
		world,
		x: 0.35,
		y: wheelRadius + needleOffset + 0.01,
		w: 0.2,
		h: 0.2,
		type: RigidBodyType.Fixed,
	});
	const needleLeftStop = makeCuboid({
		world,
		x: -0.35,
		y: wheelRadius + needleOffset + 0.01,
		w: 0.2,
		h: 0.2,
		type: RigidBodyType.Fixed,
	});

	const needleJoint = world.createImpulseJoint(
		JointData.revolute({ x: 0.0, y: 0.0 }, { x: 0.0, y: 0.0 }),
		needle.rigidBody,
		needleBase.rigidBody,
		true,
	);

	let alreadySpinned = false;

	const finish = () => {
		console.log();
		let rotation = wheel.rigidBody.rotation();
		while (rotation < 0) {
			rotation += Math.PI * 2;
		}
		while (rotation >= Math.PI * 2) {
			rotation -= Math.PI * 2;
		}
		const pegIndex = Math.floor((rotation / (Math.PI * 2)) * pegCount);

		return {
			winner: pegIndex,
		};
	};

	return {
		wheel,
		pegs,
		needle,
		sceneTick: () => {
			const needleImpulse = -needle.rigidBody.rotation() * 0.002;
			const needleImpulseNormalized = Math.abs(needleImpulse) > 0.0001 ? needleImpulse : 0;

			needle.rigidBody.applyTorqueImpulse(needleImpulseNormalized, true);

			// Check if the needle is vertical (rotation <= 0)
			if (needle.rigidBody.rotation() <= 0) {
				// Only finish if the wheel has stopped or is moving backwards
				if (wheel.rigidBody.isSleeping() || wheel.rigidBody.angvel() > 0) {
					return finish();
				}
			}

			// If the wheel has stopped completely we might have to finish
			if (wheel.rigidBody.isSleeping()) {
				// If the needle is not vertical, push the wheel back aiming for vertical needle
				if (needle.rigidBody.rotation() > 0) {
					wheel.rigidBody.addTorque(armStrength / 100, true);
				} else {
					return finish();
				}
			}

			return { winner: null };
		},
		spin: () => {
			if (alreadySpinned) {
				return;
			}
			alreadySpinned = true;

			wheelJoint.configureMotorVelocity(0, 0.00000001);

			wheel.rigidBody.addTorque(-armStrength * armWeakPullPushRatio, true);
			setTimeout(() => {
				wheel.rigidBody.resetTorques(true);
				wheel.rigidBody.addTorque(-armStrength, true);
			}, 400);
			setTimeout(() => {
				wheel.rigidBody.resetTorques(true);
				wheel.rigidBody.addTorque(-armStrength * armWeakPullPushRatio, true);
			}, 800);
			setTimeout(() => {
				wheel.rigidBody.resetTorques(true);
			}, 1200);
		},
	};
};
