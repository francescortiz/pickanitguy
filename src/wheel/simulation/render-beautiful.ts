import { Container, Graphics, Sprite, Texture } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { World } from '@dimforge/rapier2d';
import { WHEEL_CONSTANTS } from './constants';

// Beautiful rendering container
let container: Container | null = null;
let wheel: Graphics | null = null;
let pegs: Graphics[] = [];
let needle: Graphics | null = null;

export const destroyBeautifulRender = () => {
  if (container) {
    container.destroy({ children: true });
  }
  container = null;
  wheel = null;
  pegs = [];
  needle = null;
};

export const renderBeautiful = (
  pixiViewport: Viewport, 
  physicsWorld: World, 
  wheelScene: any
) => {
  const { wheelRadius, pegRadius } = WHEEL_CONSTANTS;
  const centerX = pixiViewport.center.x;
  const centerY = pixiViewport.center.y;
  const renderScale = 150;

  // Initialize container if needed
  if (!container) {
    container = new Container();
    pixiViewport.addChild(container);
    
    // Create wheel
    wheel = new Graphics();
    wheel.beginFill(0x4e54c8);
    wheel.drawCircle(0, 0, wheelRadius * renderScale);
    wheel.endFill();
    
    // Add alternating color segments to wheel
    const segmentCount = wheelScene.pegs.length;
    for (let i = 0; i < segmentCount; i++) {
      const segmentAngle = (Math.PI * 2) / segmentCount;
      const startAngle = i * segmentAngle;
      const endAngle = (i + 1) * segmentAngle;
      
      const segment = new Graphics();
      // Alternating colors
      const color = i % 2 === 0 ? 0x3f51b5 : 0x5e35b1;
      segment.beginFill(color);
      segment.moveTo(0, 0);
      segment.arc(0, 0, wheelRadius * renderScale * 0.95, startAngle, endAngle);
      segment.lineTo(0, 0);
      segment.endFill();
      
      // Add segment number
      const textAngle = startAngle + segmentAngle / 2;
      const textX = Math.cos(textAngle) * (wheelRadius * renderScale * 0.7);
      const textY = Math.sin(textAngle) * (wheelRadius * renderScale * 0.7);
      
      const textGraphic = new Graphics();
      textGraphic.beginFill(0xffffff);
      textGraphic.drawCircle(textX, textY, 15);
      textGraphic.endFill();
      
      wheel.addChild(segment);
      wheel.addChild(textGraphic);
    }
    
    // Add a center cap
    const centerCap = new Graphics();
    centerCap.beginFill(0xf5f5f5);
    centerCap.drawCircle(0, 0, 30);
    centerCap.endFill();
    wheel.addChild(centerCap);
    
    container.addChild(wheel);
    
    // Create pegs
    for (let i = 0; i < wheelScene.pegs.length; i++) {
      const peg = new Graphics();
      peg.beginFill(0xe1c4ff);
      peg.lineStyle(2, 0x9575cd);
      peg.drawCircle(0, 0, pegRadius * renderScale);
      peg.endFill();
      container.addChild(peg);
      pegs.push(peg);
    }
    
    // Create needle - scaled to match physics simulation
    // The physics needle uses vertices: [0, 0.15], [0.06, 0], [0.001, -0.4], [-0.001, -0.4], [-0.06, 0]
    needle = new Graphics();
    needle.beginFill(0xff5252);
    // Scale to match physics size × renderScale
    const needleScale = renderScale;
    needle.moveTo(0, 0.15 * needleScale);
    needle.lineTo(0.06 * needleScale, 0);
    needle.lineTo(0.001 * needleScale, -0.4 * needleScale);
    needle.lineTo(-0.001 * needleScale, -0.4 * needleScale);
    needle.lineTo(-0.06 * needleScale, 0);
    needle.lineTo(0, 0.15 * needleScale);
    needle.endFill();
    
    // Add a shiny effect to the needle
    const needleShine = new Graphics();
    needleShine.beginFill(0xff8a80, 0.6);
    needleShine.moveTo(0, 0.1 * needleScale);
    needleShine.lineTo(0.03 * needleScale, 0);
    needleShine.lineTo(0.0005 * needleScale, -0.3 * needleScale);
    needleShine.lineTo(0, -0.32 * needleScale);
    needleShine.endFill();
    needle.addChild(needleShine);
    
    container.addChild(needle);
  }

  // Update wheel position and rotation
  if (wheel && wheelScene.wheel) {
    const wheelBody = wheelScene.wheel.rigidBody;
    const wheelPos = wheelBody.translation();
    const wheelRot = wheelBody.rotation();
    
    wheel.position.set(
      centerX + wheelPos.x * renderScale, 
      centerY - wheelPos.y * renderScale
    );
    wheel.rotation = -wheelRot;
  }
  
  // Update pegs positions
  for (let i = 0; i < pegs.length; i++) {
    if (wheelScene.pegs[i]) {
      const pegBody = wheelScene.pegs[i].rigidBody;
      const pegPos = pegBody.translation();
      
      pegs[i].position.set(
        centerX + pegPos.x * renderScale, 
        centerY - pegPos.y * renderScale
      );
    }
  }
  
  // Update needle position and rotation
  if (needle && wheelScene) {
    // Get the needle position from the physics world
    const needleJointPos = { 
      x: centerX, 
      y: centerY - (WHEEL_CONSTANTS.wheelRadius + 0.19) * renderScale 
    };
    
    needle.position.set(needleJointPos.x, needleJointPos.y);
    
    // If there's access to the needle physics body
    if (wheelScene.needle && wheelScene.needle.rigidBody) {
      const needleBody = wheelScene.needle.rigidBody;
      const needleRot = needleBody.rotation();
      needle.rotation = -needleRot + Math.PI;
    } else {
      // Fallback to the simulated needle motion if physics body isn't available
      const gameTime = Date.now() / 1000;
      // Simulate needle motion based on wheel movement if available
      const wheelRotation = wheelScene.wheel ? -wheelScene.wheel.rigidBody.rotation() : 0;
      // Add some natural oscillation plus impact from wheel rotation
      const needleAngle = Math.sin(gameTime * 2) * 0.05 + wheelRotation * 0.03;
      needle.rotation = needleAngle;
    }
  }
};