import { createContext, useContext } from 'react'

/** Opens the waitlist modal, optionally preselecting a product slug. */
export type OpenWaitlist = (productSlug?: string) => void

export const WaitlistContext = createContext<OpenWaitlist>(() => {})

/**
 * Usage:
 *   const join = useWaitlist()
 *   join('kit')
 *
 * Split from the provider component so that WaitlistModal.tsx exports only
 * components — mixing hooks and components in one module breaks Fast Refresh.
 */
export const useWaitlist = () => useContext(WaitlistContext)
