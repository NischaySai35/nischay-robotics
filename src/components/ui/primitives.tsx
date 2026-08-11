import { useRef } from 'react'
import type { ReactNode } from 'react'
import { motion, useInView } from 'motion/react'

/* ============================================================================
   Reveal — scroll-triggered entrance.
   `useInView(..., { once: true })` so content never animates away again; a
   section you've already read stays put when you scroll back up.
   ========================================================================= */

export function Reveal({
  children,
  delay = 0,
  y = 22,
  className = '',
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-12% 0px -8% 0px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(6px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ============================================================================
   Section — consistent rhythm and max width for every band of the page.
   ========================================================================= */

export function Section({
  id,
  children,
  className = '',
  width = 'default',
}: {
  id?: string
  children: ReactNode
  className?: string
  width?: 'default' | 'wide' | 'narrow'
}) {
  const max =
    width === 'wide' ? 'max-w-[1400px]' : width === 'narrow' ? 'max-w-3xl' : 'max-w-6xl'

  return (
    <section id={id} className={`relative z-10 px-5 py-24 sm:px-8 md:py-32 ${className}`}>
      <div className={`mx-auto ${max}`}>{children}</div>
    </section>
  )
}

/* ============================================================================
   SectionHeading
   ========================================================================= */

export function SectionHeading({
  kicker,
  title,
  lead,
  align = 'left',
}: {
  kicker?: string
  title: ReactNode
  lead?: string
  align?: 'left' | 'center'
}) {
  const centered = align === 'center'
  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-3xl'}>
      {kicker && (
        <Reveal>
          <p className="mb-4 flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.28em] text-accent uppercase">
            {!centered && <span className="bg-gold/60 h-px w-8" />}
            {kicker}
          </p>
        </Reveal>
      )}
      <Reveal delay={0.06}>
        <h2 className="text-[clamp(2rem,4.6vw,3.4rem)] text-balance">{title}</h2>
      </Reveal>
      {lead && (
        <Reveal delay={0.12}>
          <p className="text-chalk/62 mt-6 text-base leading-relaxed text-pretty sm:text-lg">
            {lead}
          </p>
        </Reveal>
      )}
    </div>
  )
}

/* ============================================================================
   GlassCard — the material of the whole site.
   `refract` opts a card into the Chromium-only SVG refraction; everything else
   is the blur + gradient-rim treatment that works everywhere.
   ========================================================================= */

export function GlassCard({
  children,
  className = '',
  tier = 'glass',
  refract = false,
  as: As = 'div',
}: {
  children: ReactNode
  className?: string
  tier?: 'glass' | 'glass-strong' | 'glass-soft'
  refract?: boolean
  as?: 'div' | 'article' | 'li' | 'aside'
}) {
  return (
    <As className={`${tier} ${refract ? 'refract' : ''} ${className}`}>{children}</As>
  )
}

/* ============================================================================
   Buttons
   ========================================================================= */

type ButtonProps = {
  children: ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'glass' | 'quiet'
  disabled?: boolean
  external?: boolean
  className?: string
  title?: string
}

export function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  disabled = false,
  external = false,
  className = '',
  title,
}: ButtonProps) {
  const base =
    'group relative inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-tight transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform'

  const variants = {
    primary:
      'bg-gradient-to-br from-sun via-gold to-ember text-onbrand shadow-[0_10px_36px_-10px_rgba(255,201,60,0.75)] hover:shadow-[0_16px_50px_-10px_rgba(255,201,60,0.95)] hover:-translate-y-0.5',
    glass:
      'glass-soft text-chalk hover:bg-chalk/[0.06] hover:-translate-y-0.5 !rounded-full',
    quiet: 'text-chalk/70 hover:text-accent',
  }

  const disabledCls = 'cursor-not-allowed opacity-45 saturate-50 hover:translate-y-0 hover:shadow-none'
  const cls = `${base} ${variants[variant]} ${disabled ? disabledCls : ''} ${className}`

  if (disabled || (!href && !onClick)) {
    return (
      <span className={cls} aria-disabled="true" title={title}>
        {children}
      </span>
    )
  }

  if (href) {
    return (
      <a
        href={href}
        className={cls}
        title={title}
        {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      >
        {children}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick} className={cls} title={title}>
      {children}
    </button>
  )
}

/* ============================================================================
   Small parts
   ========================================================================= */

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="glass-soft text-chalk/70 rounded-full px-3 py-1 text-[11px] font-medium tracking-wide">
      {children}
    </span>
  )
}

export function ArrowIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={`transition-transform duration-300 group-hover:translate-x-0.5 ${className}`}
    >
      <path
        d="M2.5 7h9M8 3.5 11.5 7 8 10.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
