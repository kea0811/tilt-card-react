---
name: tilt-card-react
description: Use when a React app needs 3D tilt-on-hover cards with parallax depth — pointer-driven tilt with glare on desktop, gyroscope tilt on mobile. Works with React 18 and 19, zero dependencies.
---

# tilt-card-react

Reach for this when a user wants cards, tiles, or covers that lean toward the cursor in 3D — pricing cards, product shots, trading-card effects, portfolio tiles. It ships a ready `<TiltCard>` div plus a headless `useTilt()` hook, writes every frame as CSS custom properties (no re-renders), listens to the mobile gyroscope, and freezes automatically under `prefers-reduced-motion`.

## When to reach for this

User says:
- "Make the card tilt in 3D when I hover it"
- "Add that parallax/holographic card effect, with the shine that follows the mouse"
- "Tilt the cards with the phone's gyroscope on mobile"

User does NOT mean this when they ask for:
- ❌ Scroll-driven parallax backgrounds (that's a scroll/intersection library, not pointer tilt)
- ❌ Draggable/springy cards with momentum (use a gesture + spring animation library)
- ❌ Full 3D scenes or models (use a WebGL/Three.js stack)

## Install

```bash
pnpm add tilt-card-react
```

## Most common pattern (95% of cases)

```tsx
import { TiltCard, parallax } from 'tilt-card-react';

<TiltCard glare maxTilt={12} className="card">
  <h3 style={parallax(40)}>Floats above the surface</h3>
  <p>Regular children ride the card; parallax() children float.</p>
</TiltCard>
```

`TiltCard` renders a `div` and forwards `className`, `style`, and all other div props.

## API / flags

| Export | Purpose |
| --- | --- |
| `<TiltCard />` | Tilting `div`. Key props: `maxTilt` (deg, 14), `scale` (1.04), `perspective` (px, 1000), `speed` (ms, 400), `reverse`, `glare`, `glareMaxOpacity` (0.25), `gyro` (true), `disabled`, `respectReducedMotion` (true), `onTilt(state)` |
| `useTilt(options)` | Headless version. Returns `{ tiltProps, active }` — spread `tiltProps` onto any element. Same options minus `glare`. |
| `parallax(depth)` | Style object lifting a child `depth` px toward the viewer. |
| `requestGyroPermission()` | Async iOS 13+ permission prompt; resolves `true` when gyro events will flow. |
| `usePrefersReducedMotion()` | Boolean media-query hook, exported for reuse. |

Custom properties written on the element each frame: `--tilt-rx`, `--tilt-ry`, `--tilt-s`, `--tilt-gx`, `--tilt-gy`, `--tilt-go` — child CSS can read them with `var()`.

## Gotchas worth knowing

1. iOS only fires device-orientation events after `requestGyroPermission()` succeeds, and Safari only shows that prompt when the call starts inside a user gesture — wire it to a button `onClick`, never `useEffect`.
2. Tilt (and glare and scale) intentionally freezes when the OS asks for reduced motion; if a client insists, `respectReducedMotion={false}` opts a single card out.
3. `parallax()` only reads as depth because the card sets `transform-style: preserve-3d` — if you wrap children in an extra element with `overflow: hidden` or a `filter`, the browser flattens the 3D and the float disappears.
4. Don't put `TiltCard` inside a CSS `transform`ed ancestor with `perspective` of its own unless you want compounded tilt — the card carries its own `perspective()` in its transform.

## Links

- npm / install: https://www.npmjs.com/package/tilt-card-react
- repo: https://github.com/kea0811/tilt-card-react
