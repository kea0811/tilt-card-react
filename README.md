# tilt-card-react

![tests](https://img.shields.io/badge/tests-passing-brightgreen.svg) ![coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg) ![license](https://img.shields.io/badge/license-MIT-blue.svg)
![npm version](https://img.shields.io/npm/v/tilt-card-react.svg)
![npm downloads](https://img.shields.io/npm/dm/tilt-card-react.svg)
![bundle size](https://img.shields.io/bundlephobia/minzip/tilt-card-react?label=gzip)

**🌐 [Live demo →](https://tilt-card-react.vercel.app)**

3D parallax tilt for React — the card leans toward the pointer on desktop and follows the **gyroscope on mobile**. Glare that tracks the cursor, child layers that float at their own depth, and reduced-motion manners built in. Zero dependencies, ~1.6 kB gzipped, works with React 18 and 19.

## For AI coding agents

Drop [`SKILL.md`](./SKILL.md) into your AI coding agent or editor and it learns how to use this library — when to reach for it, the install + canonical pattern, the public API, and the gotchas that are easy to miss.

## Install

```bash
pnpm add tilt-card-react
```

> _Bleeding edge or before the first npm release: `pnpm add github:kea0811/tilt-card-react`._

npm and yarn work too: `npm i tilt-card-react` / `yarn add tilt-card-react`.

## Quick start

```tsx
import { TiltCard, parallax } from 'tilt-card-react';

export function Pricing() {
  return (
    <TiltCard glare maxTilt={12}>
      <h3 style={parallax(40)}>Pro — $12/mo</h3>
      <p>This heading floats 40px above the card while it tilts.</p>
    </TiltCard>
  );
}
```

That's the whole integration. `TiltCard` renders a `div`, so `className`, `style`, and every other div prop pass straight through.

## The pieces

| Export | What it is |
| --- | --- |
| `<TiltCard />` | A `div` wired for tilt, with an optional `glare` highlight layer |
| `useTilt(options)` | The headless hook behind it — spread `tiltProps` onto any element |
| `parallax(depth)` | Style helper that lifts a child `depth` px above the card surface |
| `requestGyroPermission()` | iOS 13+ permission prompt for device-orientation events |
| `usePrefersReducedMotion()` | The reduced-motion media-query hook, exported for reuse |

## API

### `<TiltCard />` props

All optional. Everything except `glare` is shared with `useTilt(options)`.

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `maxTilt` | `number` | `14` | Peak rotation in degrees. |
| `scale` | `number` | `1.04` | Zoom applied while the card is live. |
| `perspective` | `number` | `1000` | Perspective distance in px — lower is more dramatic. |
| `speed` | `number` | `400` | Transition duration in ms for settling. |
| `reverse` | `boolean` | `false` | Tilt away from the pointer instead of toward it. |
| `glare` | `boolean` | `false` | Render the light sheen that follows the pointer. _(TiltCard only.)_ |
| `glareMaxOpacity` | `number` | `0.25` | Peak opacity of that sheen, 0–1. |
| `gyro` | `boolean` | `true` | React to device orientation on mobile. |
| `disabled` | `boolean` | `false` | Kill switch — the card settles flat. |
| `respectReducedMotion` | `boolean` | `true` | Stay still when the user prefers reduced motion. |
| `onTilt` | `(state: TiltState) => void` | — | Called every update with `{ rotateX, rotateY, source }`. |

### `useTilt(options)`

```tsx
const { tiltProps, active } = useTilt({ maxTilt: 18 });

return <figure {...tiltProps}>anything can tilt</figure>;
```

`tiltProps` contains `ref`, `style`, `onPointerMove`, and `onPointerLeave`. `active` is `false` while `disabled` or when reduced motion wins — handy for swapping in a static treatment.

### The CSS custom-property bus

The hook never re-renders your component while tilting. Every frame is written as CSS custom properties on the element, and any child can join the effect with plain CSS:

| Property | Meaning | Resting fallback |
| --- | --- | --- |
| `--tilt-rx` / `--tilt-ry` | Current rotation, in degrees | `0deg` |
| `--tilt-s` | Current scale | `1` |
| `--tilt-gx` / `--tilt-gy` | Pointer/tilt position, in % | `50%` |
| `--tilt-go` | Glare opacity | `0` |

```css
.my-shine {
  opacity: var(--tilt-go, 0);
  background-position: var(--tilt-gx, 50%) var(--tilt-gy, 50%);
}
```

### `parallax(depth)`

Returns `{ transform: 'translateZ(<depth>px)', transformStyle: 'preserve-3d' }`. Positive depths float toward the viewer; negatives sink behind the surface. Merge it with your own styles: `style={{ ...parallax(40), color: 'white' }}`.

### `requestGyroPermission()`

iOS 13+ gates device-orientation events behind a prompt that only opens from a user gesture. Call this from a tap:

```tsx
<button onClick={async () => setGyroOn(await requestGyroPermission())}>
  Enable motion
</button>
```

Resolves `true` wherever gyro events will flow — including Android and desktops, which never ask. On phones, the device's resting pitch is auto-calibrated as neutral, so the effect works whether the phone is flat on a table or held upright.

## Reduced motion

`prefers-reduced-motion: reduce` freezes every card by default — no tilt, no glare, no scale. If your tilt is purely decorative *and* subtle you can opt out per card with `respectReducedMotion={false}`, but the default is the accessible choice.

## Contributing

```bash
pnpm install
pnpm test          # vitest, 100% coverage enforced
pnpm build         # ESM + CJS + types via vite
pnpm demo:dev      # the demo site, hot-reloading against src
```

Issues and PRs welcome — keep it small and zero-dependency.

## License

MIT © [kea0811](https://github.com/kea0811)
