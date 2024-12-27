import { Color, Graphics } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { World } from '@dimforge/rapier2d';

let lines: Graphics | null;

export const destroyRenderDebug = () => {
	if (lines) {
		lines.destroy();
	}
	lines = null;
};

export const renderDebug = (pixiViewport: Viewport, physicsWorld: World) => {
	const { vertices, colors } = physicsWorld.debugRender();

	if (!lines) {
		lines = new Graphics();
		pixiViewport.addChild(lines);
	}

	const centerX = pixiViewport.center.x;
	const centerY = pixiViewport.center.y;
	const renderScale = 150;

	lines.clear();

	for (let i = 0; i < vertices.length; i += 4) {
		const c = new Color({
			r: colors[i] * 255,
			g: colors[i + 1] * 255,
			b: colors[i + 2] * 255,
			a: colors[i + 3] * 255,
		});

		lines
			.moveTo(centerX + vertices[i] * renderScale, centerY + -vertices[i + 1] * renderScale)
			.lineTo(
				centerX + vertices[i + 2] * renderScale,
				centerY + -vertices[i + 3] * renderScale,
			)
			.stroke({ color: c, width: 2 });
	}
};
