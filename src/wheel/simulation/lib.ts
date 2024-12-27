import * as RAPIER from '@dimforge/rapier2d';
import {
	Collider,
	ColliderDesc,
	RigidBody,
	RigidBodyDesc,
	RigidBodyType,
	type World,
} from '@dimforge/rapier2d';

export type Body = {
	rigidBody: RigidBody;
	collider: Collider;
};

const DEFAULT_DENSITY = 1.0;
const DEFAULT_COLLIDER_GROUPS = 0xffff_ffff;
const DEFAULT_FRICTION = 0.5;

export const makeCuboid = ({
	world,
	x,
	y,
	w,
	h,
	type,
	density = DEFAULT_DENSITY,
	continuousCollisionDetection = false,
	colliderGroups = DEFAULT_COLLIDER_GROUPS,
	friction = DEFAULT_FRICTION,
}: {
	world: World;
	x: number;
	y: number;
	w: number;
	h: number;
	type: RigidBodyType;
	density?: number;
	continuousCollisionDetection?: boolean;
	colliderGroups?: number;
	friction?: number;
}): Body => {
	const rigidBodyDesc = new RigidBodyDesc(type)
		.setTranslation(x, y)
		.setCcdEnabled(continuousCollisionDetection);

	const rigidBody = world.createRigidBody(rigidBodyDesc);

	const colliderDesc = ColliderDesc.cuboid(w / 2, h / 2)
		.setRestitution(0.0)
		.setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Min)
		.setDensity(density)
		.setCollisionGroups(colliderGroups)
		.setFriction(friction);

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
	continuousCollisionDetection = false,
	colliderGroups = DEFAULT_COLLIDER_GROUPS,
	friction = DEFAULT_FRICTION,
}: {
	world: World;
	x: number;
	y: number;
	r: number;
	type: RigidBodyType;
	density?: number;
	continuousCollisionDetection?: boolean;
	colliderGroups?: number;
	friction?: number;
}): Body => {
	const rigidBodyDesc = new RigidBodyDesc(type)
		.setTranslation(x, y)
		.setCcdEnabled(continuousCollisionDetection);

	const rigidBody = world.createRigidBody(rigidBodyDesc);

	const colliderDesc = ColliderDesc.ball(r)
		.setRestitution(0.0)
		.setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Min)
		.setDensity(density)
		.setCollisionGroups(colliderGroups)
		.setFriction(friction);

	const collider = world.createCollider(colliderDesc, rigidBody);

	return {
		rigidBody,
		collider,
	};
};

export const makeConvexMesh = ({
	world,
	x,
	y,
	vertices,
	type,
	density = DEFAULT_DENSITY,
	continuousCollisionDetection = false,
	colliderGroups = DEFAULT_COLLIDER_GROUPS,
	friction = DEFAULT_FRICTION,
}: {
	world: World;
	type: RigidBodyType;
	x: number;
	y: number;
	vertices: Float32Array;
	density?: number;
	continuousCollisionDetection?: boolean;
	colliderGroups?: number;
	friction?: number;
}): Body => {
	const rigidBodyDesc = new RigidBodyDesc(type)
		.setTranslation(x, y)
		.setCcdEnabled(continuousCollisionDetection);

	const rigidBody = world.createRigidBody(rigidBodyDesc);

	const colliderDesc = ColliderDesc.convexPolyline(vertices)!
		.setRestitution(0.0)
		.setRestitutionCombineRule(RAPIER.CoefficientCombineRule.Min)
		.setDensity(density)
		.setCollisionGroups(colliderGroups)
		.setFriction(friction);

	const collider = world.createCollider(colliderDesc, rigidBody);

	return {
		rigidBody,
		collider,
	};
};
