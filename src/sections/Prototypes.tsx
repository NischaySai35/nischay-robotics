import { AsideCard, Block, PageShell } from '@/components/PageShell'
import { Button, Reveal } from '@/components/ui/primitives'
import { PlayBadge } from '@/components/VideoPlayer'
import { useVideoPlayer } from '@/lib/videoContext'
import { YouTubeThumb } from '@/components/YouTubeThumb'
import { links, pageAt, videos, pageSections } from '@/content/site'
import type { Video } from '@/content/site'

/** An empty slot, for videos not yet uploaded. */
function ComingSoon({ video }: { video: Video }) {
  return (
    <div className="glass-soft relative flex aspect-video items-center justify-center overflow-hidden">
      <div className="relative z-10 px-6 text-center">
        <div className="border-chalk/15 mx-auto flex h-11 w-11 items-center justify-center rounded-full border">
          <span className="text-chalk/30 text-lg leading-none">+</span>
        </div>
        <p className="text-chalk/45 mt-3 text-sm font-medium">{video.title}</p>
        <p className="text-chalk/25 mt-1 text-[11px] tracking-wide uppercase">{video.caption}</p>
      </div>
    </div>
  )
}

/**
 * A video tile. No YouTube JavaScript or cookies load until someone actually
 * clicks — the tile is just a still and a button, and playback happens in the
 * shared lightbox.
 */
function VideoTile({ video, featured = false }: { video: Video; featured?: boolean }) {
  const play = useVideoPlayer()

  if (!video.id) return <ComingSoon video={video} />

  return (
    <button
      type="button"
      onClick={() => play(video.id!, video.title)}
      aria-label={`Play: ${video.title}`}
      className="glass group relative block aspect-video w-full overflow-hidden text-left"
    >
      <YouTubeThumb
        id={video.id}
        eager={featured}
        // Slight base scale: YouTube pads stills from non-16:9 source footage
        // with black bars baked into the JPEG, and object-cover alone can't
        // crop them. 6% trims the bars without meaningfully cropping stills
        // that don't have any.
        className="absolute inset-0 h-full w-full scale-[1.06] object-cover opacity-75 transition-all duration-700 group-hover:scale-[1.12] group-hover:opacity-95"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {featured && (
        <span className="bg-gold text-onbrand absolute top-5 left-5 z-10 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.16em] uppercase">
          Main demo
        </span>
      )}

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <PlayBadge size={featured ? 84 : 60} />
      </div>

      {/* Always white — this sits on the thumbnail's dark scrim, which has no
          theme of its own. */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
        <p className={`font-semibold text-white ${featured ? 'text-lg sm:text-2xl' : 'text-sm'}`}>
          {video.title}
        </p>
        <p className={`mt-1 text-white/60 ${featured ? 'text-sm' : 'text-xs'}`}>{video.caption}</p>
      </div>
    </button>
  )
}

export function PrototypesPage() {
  const featured = videos.find((v) => v.featured)
  const rest = videos.filter((v) => !v.featured)

  const sections = pageSections['/prototypes'].filter((s) => featured || s.id !== 'main-demo')

  return (
    <PageShell
      page={pageAt('/prototypes')}
      title={
        <>
          It only counts when it <span className="text-gold-grad">moves</span>.
        </>
      }
      lead="Build logs from the desk. More going up as the next revisions come off the printer."
      sections={sections}
      aside={
        <AsideCard title="New uploads first" body="Subscribe for every new revision as it comes off the printer.">
          <Button href={links.youtube} external className="w-full !py-2.5 !text-[13px]">
            YouTube channel
          </Button>
        </AsideCard>
      }
    >
      {featured && (
        <Block id="main-demo" title="Main demo">
          <Reveal>
            <VideoTile video={featured} featured />
          </Reveal>
        </Block>
      )}

      <Block id="builds" title="More builds">
        <div className="grid gap-5 sm:grid-cols-2">
          {rest.map((v, i) => (
            <Reveal key={v.id ?? `slot-${i}`} delay={(i % 2) * 0.08}>
              <VideoTile video={v} />
            </Reveal>
          ))}
        </div>
      </Block>
    </PageShell>
  )
}
