import { lazy, Suspense } from 'react'
import { Aurora } from '@/components/background/Aurora'
import { Filters } from '@/components/svg/Filters'
import { VideoProvider } from '@/components/VideoPlayer'
import { useRenderTier } from '@/hooks/useEnvironment'
import { useSmoothScroll } from '@/lib/scroll'
import { Nav } from '@/sections/Nav'
import { Hero } from '@/sections/Hero'
import { Pillars } from '@/sections/Pillars'
import { Tetrobot } from '@/sections/Tetrobot'
import { Projects } from '@/sections/Projects'
import { Prototypes } from '@/sections/Prototypes'
import { Recognition } from '@/sections/Recognition'
import { Founder } from '@/sections/Founder'
import { Collaborate } from '@/sections/Collaborate'
import { Footer } from '@/sections/Footer'

// Three.js is ~40% of the bundle. Nothing above the fold depends on it, so it
// loads after the page is already interactive — and never at all on devices
// that can't or shouldn't run it.
const DropletField = lazy(() =>
  import('@/components/background/DropletField').then((m) => ({ default: m.DropletField })),
)

export default function App() {
  const tier = useRenderTier()
  useSmoothScroll()

  return (
    <>
      <Filters />
      <Aurora />

      {tier !== 'none' && (
        <Suspense fallback={null}>
          <DropletField tier={tier} />
        </Suspense>
      )}

      <VideoProvider>
        <Nav />

        <main className="grain relative">
          <Hero />
          <Pillars />
          <Tetrobot />
          <Projects />
          <Prototypes />
          <Recognition />
          <Founder />
          <Collaborate />
        </main>

        <Footer />
      </VideoProvider>
    </>
  )
}
