## Usage

Those templates dependencies are maintained via [pnpm](https://pnpm.io) via `pnpm up -Lri`.

This is the reason you see a `pnpm-lock.yaml`. That being said, any package manager will work. This file can be safely
be removed once you clone a template.

```bash
$ pnpm install # or pnpm install or yarn install
```

### Learn more on the [Solid Website](https://solidjs.com) and come chat with us on our [Discord](https://discord.com/invite/solidjs)

## Available Scripts

In the project directory, you can run:

### `pnpm run dev` or `pnpm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>

### `pnpm run build`

Builds the app for production to the `dist` folder.<br>
It correctly bundles Solid in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

## Deployment

You can deploy the `dist` folder to any static host provider (netlify, surge, now, etc.)

## Technical Details

### Physics engine

Box2D has been selected as the physics engine for this project. The actual distribution that has been selected is
`box2d-wasm`. the reasons for having selected Box2D are:

- It is a well-known and well-documented physics' engine.
- It has the most solid implementation of solid body physics.
- It has good performance.
- It was easy to make it skip frames which allowed keep the physics simulation realistic in slower devices.

#### Other engines considered

- Matter.js: it does not have a so good implementation of solid body physics. It wasn't even tested.
- Rapier: Written in Rust, it was tested because it has a much better API and a recent update improved its solid body
  physics implementation, but a simple test of throwing a box into the floor was already looking weird: the edge of box
  would briefly go through the floor.

