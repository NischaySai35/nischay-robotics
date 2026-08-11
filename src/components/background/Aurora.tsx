/**
 * The CSS half of the background: slow-drifting blurred colour fields, a faint
 * technical grid, and a vignette.
 *
 * Every colour comes from a CSS variable, so the whole layer flips with the
 * theme without this component knowing which one is active.
 *
 * This layer is unconditional — it renders with no WebGL, no JavaScript
 * animation, and under `prefers-reduced-motion` (where the drift simply
 * stops). If the droplet canvas never mounts, the page still looks deliberate
 * rather than broken.
 */
export function Aurora() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base wash — keeps the page from ever being a flat slab of colour */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(1200px 800px at 15% -10%, var(--aurora-wash-1), transparent 60%),' +
            'radial-gradient(900px 700px at 85% 5%, var(--aurora-wash-2), transparent 62%),' +
            'radial-gradient(1000px 900px at 50% 110%, var(--aurora-wash-3), transparent 60%)',
        }}
      />

      {/* Drifting colour fields */}
      <div
        className="animate-drift absolute -top-[20%] -left-[10%] h-[70vh] w-[70vh] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, var(--aurora-1), transparent 68%)' }}
      />
      <div
        className="animate-drift absolute top-[25%] -right-[15%] h-[65vh] w-[65vh] rounded-full blur-[130px]"
        style={{
          background: 'radial-gradient(circle, var(--aurora-2), transparent 68%)',
          animationDelay: '-9s',
          animationDuration: '32s',
        }}
      />
      <div
        className="animate-drift absolute bottom-[-15%] left-[25%] h-[60vh] w-[60vh] rounded-full blur-[140px]"
        style={{
          background: 'radial-gradient(circle, var(--aurora-3), transparent 68%)',
          animationDelay: '-17s',
          animationDuration: '38s',
        }}
      />
      <div
        className="animate-drift absolute top-[55%] left-[5%] h-[45vh] w-[45vh] rounded-full blur-[110px]"
        style={{
          background: 'radial-gradient(circle, var(--aurora-4), transparent 70%)',
          animationDelay: '-24s',
          animationDuration: '44s',
        }}
      />

      {/* Technical grid — barely there, but it reads as "engineering" */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 'var(--grid-opacity)',
          backgroundImage:
            'linear-gradient(var(--grid-line) 1px, transparent 1px),' +
            'linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 100% 70% at 50% 40%, black, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 70% at 50% 40%, black, transparent 75%)',
        }}
      />

      {/* Vignette — pulls attention to the middle of the viewport */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 120% 90% at 50% 45%, transparent 45%, var(--vignette) 100%)',
        }}
      />
    </div>
  )
}
