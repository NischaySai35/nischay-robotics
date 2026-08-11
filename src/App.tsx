import { lazy, Suspense, useEffect, useState } from 'react'
import { Aurora } from '@/components/background/Aurora'
import { Filters } from '@/components/svg/Filters'
import { VideoProvider } from '@/components/VideoPlayer'
import { WaitlistProvider } from '@/components/WaitlistModal'
import { useRenderTier } from '@/hooks/useEnvironment'
import { useSmoothScroll } from '@/lib/scroll'
import { Nav } from '@/sections/Nav'
import { Hero } from '@/sections/Hero'
import { Pillars } from '@/sections/Pillars'
import { Configurations } from '@/sections/Configurations'
import { Products } from '@/sections/Products'
import { Tetrobot } from '@/sections/Tetrobot'
import { Projects } from '@/sections/Projects'
import { Prototypes } from '@/sections/Prototypes'
import { Recognition } from '@/sections/Recognition'
import { Founder } from '@/sections/Founder'
import { Footer } from '@/sections/Footer'

// Three.js is ~40% of the bundle. Nothing above the fold depends on it, so it
// loads after the page is already interactive — and never at all on devices
// that can't or shouldn't run it.
const DropletField = lazy(() =>
  import('@/components/background/DropletField').then((m) => ({ default: m.DropletField })),
)

// The admin view drags in Firebase Auth and Firestore. Only ever loaded when
// somebody actually navigates to #/admin.
const Admin = lazy(() => import('@/pages/Admin'))

/**
 * Hash routing, deliberately hand-rolled.
 *
 * The site is one page plus one private admin view. A router library would be
 * ~10KB for a single branch, and hash routes have the practical advantage of
 * needing no server rewrite rules — they work identically on Firebase
 * Hosting, Netlify, GitHub Pages and `vite preview`.
 */
function useHashRoute(): string {
  const [hash, setHash] = useState(() =>
    typeof window === 'undefined' ? '' : window.location.hash,
  )
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

export default function App() {
  const tier = useRenderTier()
  const route = useHashRoute()
  useSmoothScroll()

  const isAdmin = route.startsWith('#/admin')

  return (
    <>
      <Filters />
      <Aurora />

      {tier !== 'none' && !isAdmin && (
        <Suspense fallback={null}>
          <DropletField tier={tier} />
        </Suspense>
      )}

      {isAdmin ? (
        <Suspense fallback={<div className="relative z-10 p-10 text-sm text-chalk/40">Loading…</div>}>
          <Admin />
        </Suspense>
      ) : (
        <WaitlistProvider>
          <VideoProvider>
            <Nav />

            <main className="grain relative">
              <Hero />
              <Pillars />
              <Configurations />
              <Products />
              <Tetrobot />
              <Projects />
              <Prototypes />
              <Recognition />
              <Founder />
            </main>

            <Footer />
          </VideoProvider>
        </WaitlistProvider>
      )}
    </>
  )
}
