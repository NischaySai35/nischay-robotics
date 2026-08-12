import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { GLSL3, Vector2, Vector4 } from 'three'
import type { ShaderMaterial } from 'three'
import { QUALITY, buildFragmentShader, vertexShader } from './dropletShader'
import { usePointerNDC } from '@/hooks/useEnvironment'
import type { Tier } from '@/hooks/useEnvironment'

type SceneProps = { tier: Exclude<Tier, 'none'>; isDark: boolean }

function Scene({ tier, isDark }: SceneProps) {
  const quality = QUALITY[tier]
  const materialRef = useRef<ShaderMaterial>(null)
  const pointer = usePointerNDC()
  const size = useThree((s) => s.size)

  // Where the head of the trail is heading. Decoupled from the raw pointer so
  // the droplet has weight — it chases, it doesn't teleport.
  const target = useRef(new Vector2(0, 0))
  const scrollRef = useRef(0)

  const fragmentShader = useMemo(() => buildFragmentShader(quality), [quality])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uScroll: { value: 0 },
      uIntensity: { value: 0 },
      uLight: { value: 0 },
      uTrail: {
        value: Array.from({ length: quality.trail }, () => new Vector2(0, 0)),
      },
      // Per-cube tumble, packed (cosA, sinA, cosB, sinB). Updated on the CPU
      // each frame so the shader never runs trig inside the raymarch loop.
      uAmbRot: {
        value: Array.from({ length: quality.ambient }, () => new Vector4(1, 0, 1, 0)),
      },
      uTrailRot: { value: new Vector4(1, 0, 1, 0) },
    }),
    [quality.trail, quality.ambient],
  )

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = window.scrollY / Math.max(window.innerHeight, 1)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useFrame((_, rawDelta) => {
    const mat = materialRef.current
    if (!mat) return

    // Clamp delta so a backgrounded tab doesn't resume with one enormous step.
    const delta = Math.min(rawDelta, 1 / 30)
    const u = mat.uniforms

    u.uTime.value += delta
    u.uAspect.value = size.width / Math.max(size.height, 1)
    u.uLight.value = isDark ? 0 : 1

    // Ease the scroll offset so the parallax lags the page slightly.
    u.uScroll.value += (scrollRef.current * 0.35 - u.uScroll.value) * Math.min(delta * 4, 1)

    // Fade in on first frames — avoids a hard pop when the canvas mounts.
    u.uIntensity.value = Math.min(u.uIntensity.value + delta * 0.8, 1)

    // Idle: drift along a lissajous path so touch devices still get motion.
    if (pointer.active) {
      target.current.set(pointer.x, pointer.y)
    } else {
      const t = u.uTime.value
      target.current.set(Math.sin(t * 0.27) * 0.55, Math.cos(t * 0.19) * 0.42)
    }

    // Cube orientations. Each cube tumbles on two axes at its own rate, so the
    // field never falls into a synchronised grid.
    const time = u.uTime.value
    const ambRot = u.uAmbRot.value as Vector4[]
    for (let i = 0; i < ambRot.length; i++) {
      const a = time * (0.22 + i * 0.035) + i * 1.7
      const b = time * (0.17 + i * 0.028) + i * 2.6
      ambRot[i].set(Math.cos(a), Math.sin(a), Math.cos(b), Math.sin(b))
    }
    // Two axes so the cursor cube tumbles rather than spinning flat.
    const ta = time * 0.5
    const tb = time * 0.31
    ;(u.uTrailRot.value as Vector4).set(
      Math.cos(ta),
      Math.sin(ta),
      Math.cos(tb),
      Math.sin(tb),
    )

    // Trail: head chases the target, every other bead chases the one ahead.
    const trail = u.uTrail.value as Vector2[]
    const chase = Math.min(delta * 6.5, 1)
    trail[0].lerp(target.current, chase)
    for (let i = 1; i < trail.length; i++) {
      trail[i].lerp(trail[i - 1], Math.min(delta * (7 - i * 0.45), 1))
    }
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <rawShaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        glslVersion={GLSL3}
        transparent
        premultipliedAlpha
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}

/**
 * Fixed, full-viewport WebGL layer sitting between the CSS aurora and the page
 * content. Composited with `screen` so the droplets read as light added to the
 * scene rather than objects pasted on top of it.
 *
 * Rendering stops entirely when the tab is hidden.
 */
export function DropletField({ tier, isDark }: SceneProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      // `screen` can only lighten and `multiply` can only darken, so each
      // theme needs the one that can actually affect its page colour. On white,
      // screen is a no-op and the droplets vanish completely.
      style={{ mixBlendMode: isDark ? 'screen' : 'multiply' }}
    >
      <Canvas
        flat
        linear
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, tier === 'high' ? 1.75 : 1.15]}
        gl={{
          alpha: true,
          antialias: false,
          depth: false,
          stencil: false,
          powerPreference: 'high-performance',
        }}
      >
        <Scene tier={tier} isDark={isDark} />
      </Canvas>
    </div>
  )
}
