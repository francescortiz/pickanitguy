import * as RAPIER from '@dimforge/rapier2d';
import {
	Collider,
	ColliderDesc,
	JointData,
	RigidBody,
	RigidBodyDesc,
	RigidBodyType,
	type World,
} from '@dimforge/rapier2d';

type Body = {
	rigidBody: RigidBody;
	collider: Collider;
};

const DEFAULT_DENSITY = 1.0;

export const makeCuboid = ({
	world,
	x,
	y,
	w,
	h,
	type,
}: {
	world: World;
	x: number;
	y: number;
	w: number;
	h: number;
	type: RigidBodyType;
}): Body => {
	const rigidBodyDesc = new RigidBodyDesc(type).setTranslation(x, y);
	const rigidBody = world.createRigidBody(rigidBodyDesc);

	const colliderDesc = ColliderDesc.cuboid(w / 2, h / 2)
		.setRestitution(0.0)
		.setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Min);
	const collider = world.createCollider(colliderDesc, rigidBody);

	return {
		rigidBody,
		collider,
	};
};

export const makeBall = ({
	world,
	x,
	y,
	r,
	type,
	density = DEFAULT_DENSITY,
}: {
	world: World;
	x: number;
	y: number;
	r: number;
	type: RigidBodyType;
	density?: number;
}): Body => {
	const rigidBodyDesc = new RigidBodyDesc(type).setTranslation(x, y);
	const rigidBody = world.createRigidBody(rigidBodyDesc);

	const colliderDesc = ColliderDesc.ball(r)
		.setRestitution(0.0)
		.setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Min)
		.setDensity(density);

	const collider = world.createCollider(colliderDesc, rigidBody);

	return {
		rigidBody,
		collider,
	};
};

export const createWheel = ({ world }: { world: World }) => {
	const pegCount = 12;
	const pegRadius = 0.05;
	const wheelRadius = 1.5;
	const pegOffset = wheelRadius - pegRadius * 2;

	const base = makeCuboid({ world, x: 0, y: -2, w: 0.5, h: 0.5, type: RigidBodyType.Fixed });
	const wheel = makeBall({ world, x: 0, y: 0, r: 1.5, type: RigidBodyType.Dynamic, density: 10 });

	wheel.rigidBody.addTorque(-300, true);
	setTimeout(() => {
		wheel.rigidBody.resetTorques(true);
		wheel.rigidBody.addTorque(-500, true);
	}, 500);
	setTimeout(() => {
		wheel.rigidBody.resetTorques(true);
		wheel.rigidBody.addTorque(-300, true);
	}, 1000);
	setTimeout(() => {
		wheel.rigidBody.resetTorques(true);
	}, 1500);

	const wheelJoint = world.createImpulseJoint(
		JointData.revolute({ x: 0.0, y: 0.0 }, { x: 0.0, y: +2.0 }),
		wheel.rigidBody,
		base.rigidBody,
		true,
	);

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

		const pegJoint = world.createImpulseJoint(
			JointData.fixed({ x: pegX, y: pegY }, 0, { x: 0.0, y: 0.0 }, 0),
			wheel.rigidBody,
			peg.rigidBody,
			true,
		);
	}
};
