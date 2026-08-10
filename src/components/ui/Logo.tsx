/**
 * Identity mark — the faceted gold star.
 *
 * Source art is `public/icon.png` (888x888, transparent background). The
 * smaller sizes served here are cropped to the star's bounding box and
 * downscaled from that original, so there's no wasted padding and no blur at
 * small sizes. To change the logo, replace `icon.png` and regenerate the
 * `icon-*.png` set (see README).
 */
export function LogoMark({ className = '', size = 36 }: { className?: string; size?: number }) {
  return (
    <img
      // 96px covers up to a 3x display at the sizes used here; the 192px
      // variant takes over on denser screens and larger placements.
      src="/icon-96.png"
      srcSet="/icon-96.png 1x, /icon-192.png 2x, /icon-256.png 3x"
      width={size}
      height={size}
      alt="Nischay Robotics"
      className={`shrink-0 select-none ${className}`}
      style={{
        // Sits the mark in the same light as the rest of the page rather than
        // letting it read as a pasted-on asset.
        filter: 'drop-shadow(0 2px 10px rgba(255,201,60,0.45))',
      }}
      draggable={false}
    />
  )
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={34} />
      <span className="font-display text-[15px] leading-none font-bold tracking-tight">
        <span className="text-chalk">Nischay</span>{' '}
        <span className="text-gold-grad">Robotics</span>
      </span>
    </span>
  )
}
