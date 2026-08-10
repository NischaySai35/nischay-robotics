import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { GLSL3, Vector2 } from 'three'
import type { ShaderMaterial } from 'three'
import { QUALITY, buildFragmentShader, vertexShader } from './dropletShader'
import { usePointerNDC } from '@/hooks/useEnvironment'
import type { Tier } from '@/hooks/useEnvironment'

type SceneProps = { tier: Exclude<Tier, 'none'> }

function Scene({ tier }: SceneProps) {
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
      uTrail: {
        value: Array.from({ length: quality.trail }, () => new Vector2(0, 0)),
      },
    }),
    [quality.trail],
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
export function DropletField({ tier }: SceneProps) {
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
      style={{ mixBlendMode: 'screen' }}
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
        <Scene tier={tier} />
      </Canvas>
    </div>
  )
}
