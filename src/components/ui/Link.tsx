// REUSE-CHECKED: Link|anchor|navigate -> no internal link component existed; pairs with lib/router.ts.

import type { MouseEvent, ReactNode } from 'react'
import { navigate } from '@/lib/router'

/**
 * Internal link. Renders a real <a href> so middle-click, "open in new tab",
 * crawlers and screen readers all see a normal link; plain left-clicks are
 * intercepted and routed client-side without a reload.
 */
export function Link({
  to,
  children,
  className = '',
  onClick,
  ...rest
}: {
  to: string
  children: ReactNode
  className?: string
  onClick?: () => void
  'aria-current'?: 'page' | undefined
  'aria-label'?: string
}) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.()
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(to)
  }

  return (
    <a href={to} onClick={handle} className={className} {...rest}>
      {children}
    </a>
  )
}
