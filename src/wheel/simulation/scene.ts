import { JointData, RigidBodyType, type World } from '@dimforge/rapier2d';
import { type Body, makeBall, makeConvexMesh } from './lib';

export const createWheelScene = ({
	world,
}: {
	world: World;
}): {
	wheel: Body;
	pegs: Array<Body>;
	sceneTick: () => {
		winner: number;
	};
} => {
	const pegCount = 36;
	const pegRadius = 0.03;
	const wheelRadius = 1.5;
	const pegOffset = wheelRadius - pegRadius;

	const armStrength = 10;
	const armWeakPullPushRatio = 3 / 5;

	const needleSpringHandleY = 0.15;

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

	const wheelJoint = world.createImpulseJoint(
		JointData.revolute({ x: 0.0, y: 0.0 }, { x: 0.0, y: 0.0 }),
		wheel.rigidBody,
		wheelBase.rigidBody,
		true,
	);

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
		vertices: new Float32Array([0, 0.15, 0.06, 0, 0, -0.4, -0.05, 0]),
		density: 5,
		friction: 0.2,
	});
	needle.rigidBody.setRotation(0.9, true);
	const needleBase = makeBall({
		world,
		x: 0,
		y: wheelRadius + 0.2,
		r: 0.01,
		type: RigidBodyType.Fixed,
		colliderGroups: 0b0,
	});

	const needleJoint = world.createImpulseJoint(
		JointData.revolute({ x: 0.0, y: 0.0 }, { x: 0.0, y: 0.0 }),
		needle.rigidBody,
		needleBase.rigidBody,
		true,
	);

	return {
		wheel,
		pegs,
		sceneTick: () => {
			console.log(`needle rotation = ${needle.rigidBody.rotation()}`);
			// if (needle.rigidBody.rotation() > maxNeededRotation) {
			// 	needle.rigidBody.setRotation(maxNeededRotation, true);
			// }
			// if (needle.rigidBody.rotation() < minNeededRotation) {
			// 	needle.rigidBody.setRotation(minNeededRotation, true);
			// }

			needle.rigidBody.applyTorqueImpulse(-needle.rigidBody.rotation() * 0.001, true);

			const pegIndex = Math.floor(wheel.rigidBody.rotation() / pegCount);

			return {
				winner: pegIndex,
			};
		},
	};
};
