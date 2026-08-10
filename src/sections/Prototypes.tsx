import { ArrowIcon, Button, Reveal, Section, SectionHeading } from '@/components/ui/primitives'
import { PlayBadge } from '@/components/VideoPlayer'
import { useVideoPlayer } from '@/lib/videoContext'
import { YouTubeThumb } from '@/components/YouTubeThumb'
import { links, videos } from '@/content/site'
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
        <span className="bg-gold text-void absolute top-5 left-5 z-10 rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.16em] uppercase">
          Main demo
        </span>
      )}

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <PlayBadge size={featured ? 84 : 60} />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
        <p
          className={`text-chalk font-semibold ${featured ? 'text-lg sm:text-2xl' : 'text-sm'}`}
        >
          {video.title}
        </p>
        <p className={`text-chalk/55 mt-1 ${featured ? 'text-sm' : 'text-xs'}`}>{video.caption}</p>
      </div>
    </button>
  )
}

export function Prototypes() {
  const featured = videos.find((v) => v.featured)
  const rest = videos.filter((v) => !v.featured)

  return (
    <Section id="prototypes">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          kicker="Prototypes"
          title={
            <>
              It only counts when it <span className="text-gold-grad">moves</span>.
            </>
          }
          lead="Build logs from the desk. More going up as the next revisions come off the printer."
        />
        <Reveal delay={0.12}>
          <Button variant="glass" href={links.youtube} external>
            YouTube channel <ArrowIcon />
          </Button>
        </Reveal>
      </div>

      {featured && (
        <Reveal className="mt-14">
          <VideoTile video={featured} featured />
        </Reveal>
      )}

      <div className={`grid gap-5 sm:grid-cols-2 ${featured ? 'mt-5' : 'mt-14'}`}>
        {rest.map((v, i) => (
          <Reveal key={v.id ?? `slot-${i}`} delay={(i % 2) * 0.08}>
            <VideoTile video={v} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
