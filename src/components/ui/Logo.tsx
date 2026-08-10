/**
 * Placeholder identity mark — swap this one file when your real logo arrives.
 *
 * The idea: four modules in a T-tetromino, joined by visible latch points, with
 * the fourth module detached and mid-move. Modular units, a reconfigurable
 * body, one piece currently changing place. Reads at 20px, so it works as a
 * favicon too (see public/favicon.svg, which is this shape inlined).
 */
export function LogoMark({ className = '', size = 36 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role="img"
      aria-label="Nischay Robotics"
    >
      <defs>
        <linearGradient id="nr-logo-a" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#FFE58A" />
          <stop offset="55%" stopColor="#FFC93C" />
          <stop offset="100%" stopColor="#FF9A1F" />
        </linearGradient>
        <linearGradient id="nr-logo-b" x1="0" y1="48" x2="48" y2="0">
          <stop offset="0%" stopColor="#A97BFF" />
          <stop offset="100%" stopColor="#45E3FF" />
        </linearGradient>
      </defs>

      {/* latch links, drawn under the modules */}
      <g stroke="url(#nr-logo-a)" strokeWidth="1.6" strokeLinecap="round" opacity="0.85">
        <path d="M15 16.5h3" />
        <path d="M30 16.5h3" />
        <path d="M23.5 23v3" />
      </g>

      {/* three anchored modules */}
      <rect x="2" y="10" width="13" height="13" rx="3.6" fill="url(#nr-logo-a)" />
      <rect x="17" y="10" width="13" height="13" rx="3.6" fill="url(#nr-logo-a)" />
      <rect x="32" y="10" width="13" height="13" rx="3.6" fill="url(#nr-logo-a)" opacity="0.62" />

      {/* the module that's reconfiguring */}
      <rect
        x="17"
        y="26"
        width="13"
        height="13"
        rx="3.6"
        fill="url(#nr-logo-b)"
        transform="rotate(-12 23.5 32.5)"
      />
    </svg>
  )
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark size={30} />
      <span className="font-display text-[15px] leading-none font-bold tracking-tight">
        <span className="text-chalk">Nischay</span>{' '}
        <span className="text-gold-grad">Robotics</span>
      </span>
    </span>
  )
}
