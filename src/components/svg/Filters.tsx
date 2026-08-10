/**
 * Global SVG filter definitions.
 *
 * Mounted once, invisible, referenced by id from CSS. Two families:
 *
 *  1. Refraction (`#nr-refract`) — fractal turbulence driving a displacement
 *     map. Used as a `backdrop-filter` input so the content *behind* a glass
 *     panel bends like light through water. Chromium-only; Safari and Firefox
 *     restrict backdrop-filter to built-in filter functions, so the CSS gates
 *     this behind `@supports` and falls back to blur + specular highlights.
 *     Ref: https://kube.io/blog/liquid-glass-css-svg/
 *
 *  2. Gooey (`#nr-goo`) — the classic two-step metaball filter: blur smears
 *     the alpha channel so neighbours bleed together, then a color matrix
 *     multiplies alpha by 18 and subtracts 7, snapping the smear back to a
 *     hard edge wherever it crossed the threshold. Separate shapes read as
 *     one body of liquid. Ref: https://css-tricks.com/gooey-effect/
 */
export function Filters() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <defs>
        {/* -- Water refraction ------------------------------------------- */}
        <filter
          id="nr-refract"
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.006 0.011"
            numOctaves={2}
            seed={11}
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="1.6" result="softNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softNoise"
            scale={26}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        <filter
          id="nr-refract-soft"
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.004 0.008"
            numOctaves={2}
            seed={4}
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="2.4" result="softNoise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="softNoise"
            scale={12}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* -- Gooey merge ------------------------------------------------- */}
        <filter id="nr-goo" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="goo"
          />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
    </svg>
  )
}
