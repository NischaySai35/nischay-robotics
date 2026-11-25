import { lazy, Suspense, useEffect } from 'react'
import type { ReactNode } from 'react'
import { Aurora } from '@/components/background/Aurora'
import { PhotoMosaic } from '@/components/background/PhotoMosaic'
import { Filters } from '@/components/svg/Filters'
import { Link } from '@/components/ui/Link'
import { VideoProvider } from '@/components/VideoPlayer'
import { WaitlistProvider } from '@/components/WaitlistModal'
import { seo } from '@/content/site'
import { useRenderTier } from '@/hooks/useEnvironment'
import { usePageMeta } from '@/lib/head'
import { useLocation } from '@/lib/router'
import { jumpToTop, useSmoothScroll } from '@/lib/scroll'
import { useTheme } from '@/lib/theme'
import { Nav } from '@/sections/Nav'
import { Hero } from '@/sections/Hero'
import { GetStarted } from '@/sections/GetStarted'
import { Pillars } from '@/sections/Pillars'
import { Explore } from '@/sections/Explore'
import { CommunityBand, CommunityPage } from '@/sections/Community'
import { ShapesPage } from '@/sections/Configurations'
import { ModulesPage } from '@/sections/Products'
import { TetrobotPage } from '@/sections/Tetrobot'
import { PrototypesPage } from '@/sections/Prototypes'
import { CompanyPage } from '@/sections/Founder'
import { Footer } from '@/sections/Footer'

// Three.js is ~40% of the bundle. Nothing above the fold depends on it, so it
// loads after the page is already interactive — and never at all on devices
// that can't or shouldn't run it.
const DropletField = lazy(() =>
  import('@/components/background/DropletField').then((m) => ({ default: m.DropletField })),
)

// The admin view drags in Firebase Auth and Firestore. Only ever loaded when
// somebody actually opens /#/admin.
const Admin = lazy(() => import('@/pages/Admin'))

/** The home page: the original hero and statements, then a card per page. */
function Home() {
  usePageMeta({ title: seo.title, description: seo.description, path: '/' })

  return (
    <main className="grain relative">
      <Hero />
      <GetStarted />
      <Pillars />
      <Explore />
      <CommunityBand />
    </main>
  )
}

function NotFound() {
  const { path } = useLocation()
  usePageMeta({ title: 'Page not found — Nischay Robotics', description: seo.description, path, noindex: true })

  return (
    <main className="relative z-10 flex min-h-[80vh] items-center justify-center px-5 pt-28">
      <div className="glass-strong max-w-md p-9 text-center">
        <div className="relative z-10">
          <p className="text-gold-grad font-display text-5xl font-bold">404</p>
          <h1 className="mt-4 text-2xl">This page changed shape.</h1>
          <p className="text-chalk/55 mt-3 text-sm">It doesn't exist — or it moved when the site got its pages.</p>
          <Link
            to="/"
            className="from-sun via-gold to-ember text-onbrand mt-7 inline-block rounded-full bg-gradient-to-br px-6 py-3 text-sm font-semibold"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}

const ROUTES: Record<string, () => ReactNode> = {
  '/': () => <Home />,
  '/modules': () => <ModulesPage />,
  '/shapes': () => <ShapesPage />,
  '/tetrobot': () => <TetrobotPage />,
  '/prototypes': () => <PrototypesPage />,
  '/company': () => <CompanyPage />,
  '/community': () => <CommunityPage />,
  // /download is an alias, resolved in lib/router.ts before render.
}

export default function App() {
  const tier = useRenderTier()
  const { path, hash } = useLocation()
  const { isDark } = useTheme()
  useSmoothScroll()

  // /#/admin keeps working (it's in every notification email); /admin too.
  const isAdmin = hash.startsWith('#/admin') || path === '/admin'

  // A new page starts at the top. Deep links (/tetrobot#status) are handled by
  // the page itself once it has laid out.
  useEffect(() => {
    jumpToTop()
  }, [path])

  const page = ROUTES[path] ?? (() => <NotFound />)

  return (
    <>
      <Filters />
      <Aurora />
      {/* Sits above the aurora, below the droplets. Skipped on the admin view,
          which has no need of decoration. */}
      {!isAdmin && <PhotoMosaic />}

      {tier !== 'none' && !isAdmin && (
        <Suspense fallback={null}>
          <DropletField tier={tier} isDark={isDark} />
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
            {/* Keyed by path so each page mounts fresh: entrance animations
                replay and per-page state never leaks between pages. */}
            <div key={path}>{page()}</div>
            <Footer />
          </VideoProvider>
        </WaitlistProvider>
      )}
    </>
  )
}
