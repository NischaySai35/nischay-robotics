/**
 * A YouTube still, with the size-fallback chain that YouTube's own CDN forces
 * on you.
 *
 * YouTube only generates `maxresdefault` for high-resolution uploads. For
 * everything else it does NOT return 404 — it answers HTTP 200 with a 120x90
 * grey "no preview" placeholder, so `onError` never fires and the tile
 * silently renders a blurry grey rectangle. The only reliable tell is the
 * decoded size, so the walk down the chain is driven from `onLoad` too.
 */

/** Best-to-worst. `hqdefault` exists for every video, so it anchors the chain. */
const THUMB_SIZES = ['maxresdefault', 'sddefault', 'hqdefault'] as const

const thumbUrl = (id: string, step = 0) =>
  `https://i.ytimg.com/vi/${id}/${THUMB_SIZES[step]}.jpg`

/** YouTube's placeholder is exactly 120x90; every real still is wider. */
const isPlaceholder = (img: HTMLImageElement) => img.naturalWidth <= 120

function nextThumb(img: HTMLImageElement, id: string) {
  const step = Number(img.dataset.step ?? '0') + 1
  if (step >= THUMB_SIZES.length) return
  img.dataset.step = String(step)
  img.src = thumbUrl(id, step)
}

function checkThumb(img: HTMLImageElement, id: string) {
  if (isPlaceholder(img)) nextThumb(img, id)
}

export function YouTubeThumb({
  id,
  className = '',
  eager = false,
}: {
  id: string
  className?: string
  eager?: boolean
}) {
  return (
    <img
      // A cached image can finish loading before React attaches onLoad, so the
      // ref re-checks anything already complete on mount. Without it the grey
      // placeholder sticks on every repeat visit.
      ref={(img) => {
        if (img?.complete) checkThumb(img, id)
      }}
      src={thumbUrl(id)}
      alt=""
      loading={eager ? 'eager' : 'lazy'}
      className={className}
      onLoad={(e) => checkThumb(e.currentTarget, id)}
      onError={(e) => nextThumb(e.currentTarget, id)}
    />
  )
}
