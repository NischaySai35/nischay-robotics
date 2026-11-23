import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { community, links, products, waitlist as copy } from '@/content/site'
import { isFirebaseConfigured } from '@/lib/firebase.config'
import { isEmailConfigured } from '@/lib/email'
import { LIMITS, submitWaitlist } from '@/lib/waitlist'
import type { SubmitResult } from '@/lib/waitlist'
import { pauseScroll, resumeScroll } from '@/lib/scroll'
import { WaitlistContext } from '@/lib/waitlistContext'
import type { OpenWaitlist } from '@/lib/waitlistContext'

type Phase = 'form' | 'sending' | 'done' | 'fallback'

// Colours come from the `.field` component class so they follow the theme.
const field = 'field block w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors'

function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="mb-1.5 flex items-baseline gap-2">
      <span className="text-chalk/70 text-[12px] font-semibold tracking-wide">{children}</span>
      {hint && <span className="text-chalk/30 text-[11px]">{hint}</span>}
    </span>
  )
}

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [slug, setSlug] = useState<string>(products[0].slug)
  const [phase, setPhase] = useState<Phase>('form')
  const [mailto, setMailto] = useState('')
  const [failReason, setFailReason] = useState<'offline' | 'error'>('offline')
  const [confirmationSent, setConfirmationSent] = useState(false)
  const [nameError, setNameError] = useState(false)

  const returnFocus = useRef<HTMLElement | null>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  const openModal = useCallback<OpenWaitlist>((productSlug) => {
    returnFocus.current = document.activeElement as HTMLElement | null
    if (productSlug) setSlug(productSlug)
    setPhase('form')
    setMailto('')
    setConfirmationSent(false)
    setNameError(false)
    setOpen(true)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    pauseScroll()
    // Let the entrance animation start before stealing focus.
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 250)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      resumeScroll()
      returnFocus.current?.focus?.()
    }
  }, [open, close])

  const value = useMemo(() => openModal, [openModal])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (phase === 'sending') return // double-click guard
    const data = new FormData(e.currentTarget)
    const product = products.find((p) => p.slug === data.get('product')) ?? products[0]

    // Honeypot: invisible to people, irresistible to form-filling bots. Pretend
    // it worked so the bot learns nothing.
    if (String(data.get('website') ?? '')) {
      setPhase('done')
      return
    }

    // `required` lets a name made of only spaces through; the rules don't.
    if (!String(data.get('name') ?? '').trim()) {
      setNameError(true)
      firstFieldRef.current?.focus()
      return
    }

    setPhase('sending')

    const result: SubmitResult = await submitWaitlist({
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      product: product.slug,
      productName: product.name,
      country: String(data.get('country') ?? '').trim(),
      organisation: String(data.get('organisation') ?? '').trim(),
      quantity: String(data.get('quantity') ?? '').trim(),
      message: String(data.get('message') ?? '').trim(),
    })

    if (result.status === 'stored') {
      setConfirmationSent(result.confirmationSent)
      setPhase('done')
    } else {
      setMailto(result.mailto)
      setFailReason(result.reason)
      setPhase('fallback')
    }
  }

  return (
    <WaitlistContext.Provider value={value}>
      {children}

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto p-4 py-10 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            role="dialog"
            aria-modal="true"
            aria-label={copy.title}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="fixed inset-0 cursor-default bg-black/85 backdrop-blur-xl"
            />

            <motion.div
              className="glass-strong relative z-10 w-full max-w-lg p-7 sm:p-9"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="glass-soft text-chalk/70 hover:text-accent absolute top-5 right-5 z-10 flex h-8 w-8 items-center justify-center !rounded-full transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>

              <div className="relative z-10">
                {phase === 'done' ? (
                  <div className="py-6 text-center">
                    <div className="bg-gold/15 text-accent mx-auto flex h-14 w-14 items-center justify-center rounded-full">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <h3 className="mt-5 text-2xl">{copy.success}</h3>
                    <p className="text-chalk/60 mx-auto mt-3 max-w-sm text-sm leading-relaxed">
                      {copy.successBlurb}
                    </p>
                    {confirmationSent && (
                      <p className="text-chalk/45 mx-auto mt-2 max-w-sm text-[13px] leading-relaxed">
                        {copy.confirmationNote}
                      </p>
                    )}

                    {links.discord && (
                      <div className="glass-soft mx-auto mt-6 max-w-sm px-5 py-4 text-left">
                        <p className="relative z-10 text-[13px] leading-relaxed">
                          <span className="text-chalk font-semibold">While you wait</span>
                          <span className="text-chalk/55">
                            {' '}— come build with us on Discord. Early looks land there first.
                          </span>
                        </p>
                        <a
                          href={links.discord}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-accent hover:text-sun relative z-10 mt-2 inline-block text-[13px] font-semibold"
                        >
                          {community.cta} ↗
                        </a>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={close}
                      className="from-sun via-gold to-ember text-onbrand mt-7 rounded-full bg-gradient-to-br px-6 py-3 text-sm font-semibold"
                    >
                      Close
                    </button>
                  </div>
                ) : phase === 'fallback' ? (
                  <div className="py-4 text-center">
                    <h3 className="text-xl">One more tap</h3>
                    <p className="text-chalk/60 mx-auto mt-3 max-w-sm text-sm leading-relaxed">
                      {failReason === 'error'
                        ? 'Something went wrong saving your signup — possibly the connection. This opens a prefilled email instead, with everything you typed already in it. Send it and you’re on the list.'
                        : 'The signup list isn’t connected yet, so this opens a prefilled email instead — everything you typed is already in it. Send it and you’re on the list.'}
                    </p>
                    <a
                      href={mailto}
                      onClick={() => setPhase('done')}
                      className="from-sun via-gold to-ember text-onbrand mt-6 inline-block rounded-full bg-gradient-to-br px-6 py-3 text-sm font-semibold"
                    >
                      Open the email
                    </a>
                  </div>
                ) : (
                  <form onSubmit={onSubmit}>
                    <h3 className="text-2xl">{copy.title}</h3>
                    <p className="text-chalk/55 mt-2 text-sm leading-relaxed">{copy.blurb}</p>

                    <div className="mt-6 space-y-4">
                      <label className="block">
                        <Label>Which one?</Label>
                        <select
                          name="product"
                          defaultValue={slug}
                          className={`${field} appearance-none`}
                        >
                          {products.map((p) => (
                            <option key={p.slug} value={p.slug} className="bg-ink">
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <Label>Name</Label>
                          <input
                            ref={firstFieldRef}
                            name="name"
                            required
                            maxLength={LIMITS.name}
                            autoComplete="name"
                            aria-invalid={nameError || undefined}
                            onChange={() => nameError && setNameError(false)}
                            className={field}
                            placeholder="Your name"
                          />
                          {nameError && (
                            <span className="mt-1.5 block text-[12px] text-[#E5484D]">Please enter your name.</span>
                          )}
                        </label>
                        <label className="block">
                          <Label>Email</Label>
                          <input
                            name="email"
                            type="email"
                            required
                            maxLength={LIMITS.email}
                            autoComplete="email"
                            className={field}
                            placeholder="you@example.com"
                          />
                        </label>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <Label hint="optional">Country</Label>
                          <input name="country" maxLength={LIMITS.country} autoComplete="country-name" className={field} placeholder="India" />
                        </label>
                        <label className="block">
                          <Label hint="optional">How many?</Label>
                          <input name="quantity" maxLength={LIMITS.quantity} className={field} placeholder="1" inputMode="numeric" />
                        </label>
                      </div>

                      <label className="block">
                        <Label hint="optional">Organisation</Label>
                        <input name="organisation" maxLength={LIMITS.organisation} autoComplete="organization" className={field} placeholder="Lab, university or company" />
                      </label>

                      <label className="block">
                        <Label hint="optional">What would you build?</Label>
                        <textarea
                          name="message"
                          rows={3}
                          maxLength={LIMITS.message}
                          className={`${field} resize-none`}
                          placeholder="Tells me which tool tip to build first."
                        />
                      </label>
                    </div>

                    {/* Honeypot — hidden from people and screen readers. */}
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      className="sr-only"
                    />

                    <button
                      type="submit"
                      disabled={phase === 'sending'}
                      className="from-sun via-gold to-ember text-onbrand mt-7 w-full rounded-full bg-gradient-to-br py-3.5 text-sm font-bold shadow-[0_10px_36px_-10px_rgba(255,201,60,0.75)] transition-all disabled:opacity-60"
                    >
                      {phase === 'sending' ? 'Adding you…' : 'Join the waitlist'}
                    </button>

                    {!isFirebaseConfigured && !isEmailConfigured && (
                      <p className="text-chalk/30 mt-3 text-center text-[11px]">
                        Signups currently arrive by email.
                      </p>
                    )}
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </WaitlistContext.Provider>
  )
}
