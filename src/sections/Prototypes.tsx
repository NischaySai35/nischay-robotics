import { useState } from 'react'
import { Reveal, Section, SectionHeading, Button, ArrowIcon } from '@/components/ui/primitives'
import { links, videos } from '@/content/site'
import type { Video } from '@/content/site'

/** Best-to-worst. `hqdefault` exists for every video, so it anchors the chain.
 *  All are cropped by `object-cover`, which removes the 4:3 letterbox bars on
 *  the lower sizes and leaves a clean 16:9 frame. */
const THUMB_SIZES = ['maxresdefault', 'sddefault', 'hqdefault'] as const

const thumbUrl = (id: string, step: number) =>
  `https://i.ytimg.com/vi/${id}/${THUMB_SIZES[step]}.jpg`

/**
 * Advance to the next thumbnail size.
 *
 * YouTube only generates `maxresdefault` for high-resolution uploads. For
 * everything else it does NOT 404 — it answers HTTP 200 with a 120x90 grey
 * "no preview" placeholder, so `onError` never fires and the tile silently
 * renders a blurry grey rectangle. The only reliable tell is the decoded
 * size, so this is driven from `onLoad` as well as `onError`.
 */
function nextThumb(img: HTMLImageElement, id: string) {
  const step = Number(img.dataset.step ?? '0') + 1
  if (step >= THUMB_SIZES.length) return
  img.dataset.step = String(step)
  img.src = thumbUrl(id, step)
}

/** YouTube's placeholder is exactly 120x90; every real still is wider. */
const isPlaceholder = (img: HTMLImageElement) => img.naturalWidth <= 120

function checkThumb(img: HTMLImageElement, id: string) {
  if (isPlaceholder(img)) nextThumb(img, id)
}

/**
 * Click-to-load video tiles.
 *
 * Nothing from YouTube runs until someone asks to watch: the tile shows a
 * still from YouTube's thumbnail CDN, and only on click does the iframe mount.
 * That keeps YouTube's player JS (and its cookies) off the page for everyone
 * who just scrolls past.
 */
function VideoTile({ video }: { video: Video }) {
  const [playing, setPlaying] = useState(false)

  if (!video.id) {
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

  if (playing) {
    return (
      <div className="glass relative aspect-video overflow-hidden">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play: ${video.title}`}
      className="glass group relative block aspect-video w-full overflow-hidden text-left"
    >
      <img
        // A cached image can finish loading before React attaches onLoad, so
        // the ref re-checks anything that is already complete on mount.
        // Without it the placeholder sticks on every repeat visit.
        ref={(img) => {
          if (img?.complete) checkThumb(img, video.id!)
        }}
        src={thumbUrl(video.id, 0)}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-75 transition-all duration-700 group-hover:scale-[1.04] group-hover:opacity-95"
        onLoad={(e) => checkThumb(e.currentTarget, video.id!)}
        onError={(e) => nextThumb(e.currentTarget, video.id!)}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

      {/* Play button */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <span className="from-sun to-ember flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br shadow-[0_12px_40px_-8px_rgba(255,201,60,0.8)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110">
          <svg width="20" height="22" viewBox="0 0 20 22" fill="#06050A" aria-hidden="true">
            <path d="M19 9.27a2 2 0 0 1 0 3.46L3 21.99a2 2 0 0 1-3-1.73V1.74A2 2 0 0 1 3 .01l16 9.26Z" />
          </svg>
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 p-5">
        <p className="text-chalk text-sm font-semibold">{video.title}</p>
        <p className="text-chalk/50 mt-0.5 text-xs">{video.caption}</p>
      </div>
    </button>
  )
}

export function Prototypes() {
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

      <div className="mt-14 grid gap-5 sm:grid-cols-2">
        {videos.map((v, i) => (
          <Reveal key={v.id ?? `slot-${i}`} delay={(i % 2) * 0.08}>
            <VideoTile video={v} />
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
