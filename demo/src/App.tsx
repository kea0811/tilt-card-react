import { useState } from 'react';
import { TiltCard, useTilt, parallax, requestGyroPermission } from 'tilt-card-react';
import type { TiltCardProps, TiltState } from 'tilt-card-react';

interface Variant {
  title: string;
  code: string;
  note: string;
  glyph: string;
  props: Partial<TiltCardProps>;
}

const VARIANTS: Variant[] = [
  {
    title: 'Default',
    code: '<TiltCard>',
    note: '14° toward the pointer, gentle scale.',
    glyph: '◈',
    props: {},
  },
  {
    title: 'Glare',
    code: '<TiltCard glare>',
    note: 'A light sheen follows the pointer.',
    glyph: '✦',
    props: { glare: true },
  },
  {
    title: 'Subtle',
    code: 'maxTilt={6} scale={1.01}',
    note: 'Barely-there depth for calm UIs.',
    glyph: '◍',
    props: { maxTilt: 6, scale: 1.01 },
  },
  {
    title: 'Dramatic',
    code: 'maxTilt={28} perspective={700}',
    note: 'Short perspective, big angles.',
    glyph: '◆',
    props: { maxTilt: 28, perspective: 700, scale: 1.08, glare: true },
  },
  {
    title: 'Reverse',
    code: 'reverse',
    note: 'Tilts away from the pointer instead.',
    glyph: '◇',
    props: { reverse: true },
  },
  {
    title: 'Floaty',
    code: 'speed={900}',
    note: 'Slow settle — feels weightless.',
    glyph: '❍',
    props: { speed: 900 },
  },
  {
    title: 'Snappy',
    code: 'speed={80} scale={1}',
    note: 'Instant tracking, no zoom.',
    glyph: '◉',
    props: { speed: 80, scale: 1 },
  },
];

function HoloCard() {
  return (
    <TiltCard glare maxTilt={16} perspective={900} scale={1.05} className="holo" aria-label="Showcase card">
      <div className="holo-blob" aria-hidden="true" />
      <span className="holo-badge" style={parallax(70)}>
        HOLO · 001
      </span>
      <h3 className="holo-title" style={parallax(50)}>
        Layers that
        <br />
        float apart
      </h3>
      <p className="holo-sub" style={parallax(35)}>
        Each layer sits at its own <code className="holo-code">translateZ</code> depth, so the card
        reads as a physical object.
      </p>
      <div className="holo-footer" style={parallax(20)}>
        <span className="holo-chip">glare</span>
        <span className="holo-chip">parallax(70)</span>
        <span className="holo-chip">maxTilt 16°</span>
      </div>
    </TiltCard>
  );
}

function HookPlayground() {
  const [tilt, setTilt] = useState<TiltState | null>(null);
  const { tiltProps, active } = useTilt({ maxTilt: 18, glareMaxOpacity: 0, onTilt: setTilt });

  return (
    <figure className="hook-stage" {...tiltProps}>
      <figcaption className="hook-label">headless · useTilt()</figcaption>
      <p className="hook-readout">
        <span className="hook-axis">rotateX</span>
        <span className="hook-value">{tilt ? `${tilt.rotateX.toFixed(1)}°` : '0.0°'}</span>
        <span className="hook-axis">rotateY</span>
        <span className="hook-value">{tilt ? `${tilt.rotateY.toFixed(1)}°` : '0.0°'}</span>
        <span className="hook-axis">source</span>
        <span className="hook-value">{tilt ? tilt.source : active ? 'waiting' : 'off'}</span>
      </p>
    </figure>
  );
}

function GyroPanel() {
  const [status, setStatus] = useState<'idle' | 'granted' | 'denied'>('idle');

  const enable = async () => {
    setStatus((await requestGyroPermission()) ? 'granted' : 'denied');
  };

  return (
    <div className="gyro-panel">
      <h3 className="gyro-title">On a phone? Tilt it.</h3>
      <p className="gyro-copy">
        Every card on this page also listens to the gyroscope — the device&apos;s resting pitch is
        auto-calibrated as neutral. iOS asks for permission first, so this button calls{' '}
        <code className="inline-code">requestGyroPermission()</code> from a tap.
      </p>
      <button className="gyro-button" type="button" onClick={enable} disabled={status === 'granted'}>
        {status === 'granted' ? 'Gyroscope enabled ✓' : 'Enable gyroscope'}
      </button>
      <p className="gyro-status" role="status" aria-live="polite">
        {status === 'idle' && 'Android and desktop need no permission — it just works.'}
        {status === 'granted' && 'Tilt your phone and watch the cards follow.'}
        {status === 'denied' && 'Permission was declined — pointer tilt still works everywhere.'}
      </p>
    </div>
  );
}

export function App() {
  return (
    <>
      <header className="hero">
        <p className="hero-eyebrow">React 18 &amp; 19 · zero dependencies · 1.6 kB gzipped</p>
        <h1 className="hero-title">tilt-card-react</h1>
        <p className="hero-tagline">
          3D parallax tilt for React — pointer on desktop, <strong>gyroscope on mobile</strong>.
          Glare, depth layers, and reduced-motion manners included.
        </p>
        <code className="hero-install">pnpm add tilt-card-react</code>
        <p className="hero-hint" aria-hidden="true">
          hover any card below ↓
        </p>
      </header>

      <main className="page">
        <section className="section" aria-labelledby="showcase-h">
          <h2 className="section-title" id="showcase-h">
            The full effect
          </h2>
          <p className="section-sub">
            One component, three tricks: tilt toward the pointer, a glare that tracks it, and
            children lifted on their own z-planes with <code className="inline-code">parallax()</code>.
          </p>
          <div className="showcase">
            <HoloCard />
          </div>
        </section>

        <section className="section" aria-labelledby="variants-h">
          <h2 className="section-title" id="variants-h">
            Every knob, side by side
          </h2>
          <p className="section-sub">
            Each tile is the same <code className="inline-code">&lt;TiltCard&gt;</code> with one
            option changed — no picker, just hover across the grid.
          </p>
          <div className="grid">
            {VARIANTS.map((variant) => (
              <TiltCard key={variant.title} {...variant.props} className="tile">
                <span className="tile-glyph" aria-hidden="true">
                  {variant.glyph}
                </span>
                <h3 className="tile-title">{variant.title}</h3>
                <p className="tile-note">{variant.note}</p>
                <code className="tile-code">{variant.code}</code>
              </TiltCard>
            ))}
            <TiltCard className="tile" maxTilt={18}>
              <span className="tile-glyph" style={parallax(60)} aria-hidden="true">
                ⟡
              </span>
              <h3 className="tile-title" style={parallax(40)}>
                Parallax
              </h3>
              <p className="tile-note" style={parallax(25)}>
                Children float at their own depth.
              </p>
              <code className="tile-code" style={parallax(15)}>
                style={'{parallax(60)}'}
              </code>
            </TiltCard>
          </div>
        </section>

        <section className="section section-split" aria-labelledby="hook-h">
          <div>
            <h2 className="section-title" id="hook-h">
              Headless, if you want it
            </h2>
            <p className="section-sub">
              <code className="inline-code">useTilt()</code> returns spreadable props and reports
              every frame through <code className="inline-code">onTilt</code> — the readout below is
              live.
            </p>
            <HookPlayground />
          </div>
          <GyroPanel />
        </section>

        <section className="section" aria-labelledby="motion-h">
          <div className="motion-note">
            <h2 className="section-title" id="motion-h">
              Reduced motion, respected
            </h2>
            <p className="section-sub">
              When <code className="inline-code">prefers-reduced-motion</code> is set, every card on
              this page simply stays still — that&apos;s the library default, not demo code. Opt out
              per card with <code className="inline-code">respectReducedMotion={'{false}'}</code>.
            </p>
          </div>
        </section>

        <section className="section" aria-labelledby="code-h">
          <h2 className="section-title" id="code-h">
            The 5-second integration
          </h2>
          <pre className="codeblock" aria-label="Install command">
            <code className="codeblock-code">pnpm add tilt-card-react</code>
          </pre>
          <pre className="codeblock" aria-label="Usage example">
            <code className="codeblock-code">{`import { TiltCard, parallax } from 'tilt-card-react';

export function Pricing() {
  return (
    <TiltCard glare maxTilt={12}>
      <h3 style={parallax(40)}>Pro — $12/mo</h3>
      <p>Floats above the card while it tilts.</p>
    </TiltCard>
  );
}`}</code>
          </pre>
        </section>
      </main>

      <footer className="footer">
        <p className="footer-text">
          MIT · built by <span className="footer-name">kea0811</span> ·{' '}
          <a className="footer-link" href="https://github.com/kea0811/tilt-card-react">
            GitHub
          </a>
        </p>
      </footer>
    </>
  );
}
