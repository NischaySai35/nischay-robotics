/**
 * Raymarched droplet field — GLSL ES 3.00 (WebGL2).
 *
 * A fullscreen quad with a signed-distance-function scene marched per pixel.
 * Droplets are spheres blended with a smooth minimum, which is what makes them
 * *merge* like liquid instead of intersecting like solids. A trail of spheres
 * follows the pointer, each smaller than the last, so the cursor drags a
 * stretching bead of water across the page.
 *
 * Approach follows the Codrops metaball technique:
 * https://tympanus.net/codrops/2025/06/09/how-to-create-interactive-droplet-like-metaballs-with-three-js-and-glsl/
 *
 * The quad is drawn in raw clip space — the vertex shader ignores the camera
 * matrices entirely — so it fills the viewport regardless of camera setup.
 */

export const vertexShader = /* glsl */ `
precision highp float;

in vec3 position;
out vec2 vUv;

void main() {
  // PlaneGeometry(2, 2) gives position.xy spanning -1..1 — already clip space.
  vUv = position.xy;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

type Quality = {
  /** Max raymarch iterations. The single biggest cost knob. */
  steps: number
  /** Ambient droplets drifting on their own. */
  ambient: number
  /** Pointer trail length. */
  trail: number
}

export const QUALITY: Record<'high' | 'low', Quality> = {
  high: { steps: 78, ambient: 10, trail: 8 },
  low: { steps: 40, ambient: 6, trail: 5 },
}

export function buildFragmentShader(q: Quality): string {
  return /* glsl */ `
precision highp float;

#define STEPS ${q.steps}
#define AMBIENT ${q.ambient}
#define TRAIL ${q.trail}

in vec2 vUv;
out vec4 fragColor;

uniform float uTime;
uniform float uAspect;
uniform float uScroll;
uniform float uIntensity;
/* 1.0 in the light theme, 0.0 in dark. Switches the whole shading model:
   light composites with multiply (subtract colour from white), dark with
   screen (add light to black). Adding light to a white page does nothing. */
uniform float uLight;
uniform vec2  uTrail[TRAIL];

/* Per-cube tumble, packed as (cosA, sinA, cosB, sinB) and computed on the CPU
   once per frame. Doing the trig in here instead would mean four sin/cos per
   cube per raymarch step — roughly 4000 transcendental ops per pixel. */
uniform vec4 uAmbRot[AMBIENT];
uniform vec4 uTrailRot;

/* -- SDF primitives ------------------------------------------------------ */

// Polynomial smooth minimum. k controls how far apart two surfaces start to
// fuse — this is the whole reason the droplets feel wet rather than rigid.
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// Rounded box. The rounding is what keeps these reading as liquid cubes
// rather than dice: sharp enough to show six faces and twelve edges, soft
// enough that the smooth-minimum can still fuse them like droplets.
// NB: the parameter is not called "half" — that is a reserved word in GLSL ES
// and would fail to compile at runtime, long after the TypeScript build passes.
float sdRoundBox(vec3 p, float extent, float r) {
  vec3 q = abs(p) - vec3(extent - r);
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

// Two chained 2D rotations from precomputed sin/cos. Cheaper than building a
// mat3, and it runs inside the raymarch loop for every cube.
vec3 tumble(vec3 q, vec4 rot) {
  q.xz = vec2(q.x * rot.x - q.z * rot.y, q.x * rot.y + q.z * rot.x);
  q.xy = vec2(q.x * rot.z - q.y * rot.w, q.x * rot.w + q.y * rot.z);
  return q;
}

/* -- Value noise, for surface texture ------------------------------------ */

float hash31(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash31(i + vec3(0, 0, 0)), hash31(i + vec3(1, 0, 0)), f.x),
        mix(hash31(i + vec3(0, 1, 0)), hash31(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash31(i + vec3(0, 0, 1)), hash31(i + vec3(1, 0, 1)), f.x),
        mix(hash31(i + vec3(0, 1, 1)), hash31(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}

/* -- The scene ----------------------------------------------------------- */

/**
 * Aspect compensation.
 *
 * Droplets have a fixed size in world units, but a portrait viewport sees a
 * much narrower slice of that world — so on a phone the same droplet covers
 * half the screen. Widening the view on narrow screens keeps the apparent
 * droplet size roughly constant from desktop to mobile. Returns 1.0 on any
 * landscape viewport, so desktop framing is untouched.
 */
float viewZoom() {
  return max(1.0, 0.95 / max(uAspect, 0.30));
}

float map(vec3 p) {
  float d = 10.0;
  float zoom = viewZoom();

  // Ambient droplets: slow, independent orbits. Offset by scroll so the field
  // parallaxes gently as the page moves.
  for (int i = 0; i < AMBIENT; i++) {
    float fi = float(i);
    float t = uTime * 0.16 + fi * 2.39996;
    vec3 c = vec3(
      sin(t * 1.13 + fi) * 1.28 * uAspect * zoom,
      cos(t * 0.87 + fi * 1.7) * 1.05 * zoom + uScroll * 1.1,
      sin(t * 0.61 + fi * 2.3) * 0.45
    );
    float r = 0.135 + 0.04 * sin(uTime * 0.4 + fi * 1.9);
    // Tight rounding and a small blend radius keep the faces flat and the
    // edges crisp. Raise either and the cubes start fusing into blobs and
    // stop reading as cubes at all.
    d = smin(d, sdRoundBox(tumble(p - c, uAmbRot[i]), r, r * 0.14), 0.13);
  }

  // Pointer trail: head is fat, tail tapers to a bead.
  for (int i = 0; i < TRAIL; i++) {
    float fi = float(i);
    // Must use the same projection as the camera below, or the trail drifts
    // away from the actual cursor position.
    vec3 c = vec3(uTrail[i].x * uAspect * 1.5 * zoom, uTrail[i].y * 1.5 * zoom, 0.0);
    float r = mix(0.20, 0.035, fi / float(TRAIL));
    // Every bead shares ONE orientation. Give them individual rotations and
    // the cursor reads as a sphere: when the pointer is still the beads all
    // converge on the same point, and the union of eight differently-turned
    // cubes is a ball. Sharing the rotation makes converged beads collapse
    // into a single clean cube instead.
    d = smin(d, sdRoundBox(tumble(p - c, uTrailRot), r, r * 0.16), 0.16);
  }

  return d;
}

// Tetrahedral central differences — four map() taps instead of six.
vec3 calcNormal(vec3 p) {
  vec2 e = vec2(1.0, -1.0) * 0.0016;
  return normalize(
    e.xyy * map(p + e.xyy) +
    e.yyx * map(p + e.yyx) +
    e.yxy * map(p + e.yxy) +
    e.xxx * map(p + e.xxx));
}

/* -- Lighting environment ------------------------------------------------ */

// A tiny procedural "studio": warm key light high-left, cool fill low-right,
// over a near-black gradient. Sampled through both reflection and refraction
// so the droplets pick up colour from a world that isn't actually rendered.
vec3 env(vec3 d) {
  float y = d.y * 0.5 + 0.5;
  vec3 c = mix(vec3(0.020, 0.016, 0.040), vec3(0.070, 0.060, 0.120), y);

  float key = pow(max(dot(d, normalize(vec3(-0.45, 0.78, 0.44))), 0.0), 20.0);
  c += vec3(1.00, 0.78, 0.30) * key * 3.2;          // gold key

  float fill = pow(max(dot(d, normalize(vec3(0.72, -0.32, 0.62))), 0.0), 8.0);
  c += vec3(0.20, 0.62, 1.00) * fill * 0.85;        // cyan fill

  float rim = pow(max(dot(d, normalize(vec3(0.30, 0.20, -0.93))), 0.0), 12.0);
  c += vec3(0.66, 0.34, 1.00) * rim * 0.75;         // violet rim

  return c;
}

// Thin-film style iridescence ramp, weighted so yellow leads and the exotic
// hues arrive at glancing angles only.
vec3 iridescence(float t) {
  return 0.55 + 0.45 * cos(6.28318 * (vec3(1.00, 0.92, 0.76) * t + vec3(0.06, 0.40, 0.70)));
}

void main() {
  vec2 sp = vUv * vec2(uAspect, 1.0);

  vec3 ro = vec3(0.0, 0.0, 3.0);
  vec3 rd = normalize(vec3(sp * 0.9 * viewZoom(), -1.8));

  float t = 0.0;
  float minD = 10.0;
  bool hit = false;

  for (int i = 0; i < STEPS; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    minD = min(minD, d);
    if (d < 0.0015) { hit = true; break; }
    t += d * 0.92;              // slight under-relaxation; avoids overshoot
    if (t > 7.5) break;
  }

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  if (hit) {
    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);

    float fres = pow(1.0 - max(dot(n, -rd), 0.0), 2.6);

    vec3 refl = reflect(rd, n);
    vec3 refr = refract(rd, n, 0.86);

    float core = 1.0 - fres;

    // Each droplet's own hue. Sampled from slow spatial noise, so a given
    // droplet is roughly one colour while its neighbours land elsewhere on the
    // ramp — that's what makes the field polychrome instead of monochrome.
    // Art-directed rather than physically derived: sampling the environment
    // for the interior gave every droplet the same muddy maroon.
    float tintPhase = vnoise(p * 0.5 + 12.3) * 1.6 + uTime * 0.018;
    vec3 tint = iridescence(tintPhase);

    vec3 L = normalize(vec3(-0.5, 0.8, 0.6));
    float spec = pow(max(dot(refl, L), 0.0), 64.0);

    // Iridescent film over the rim, modulated by 3D noise so it isn't a clean
    // band. This is the thin-film shimmer at grazing angles.
    float film = fres * 1.3 + uTime * 0.025 + vnoise(p * 2.4 + uTime * 0.12) * 0.30;

    if (uLight > 0.5) {
      // LIGHT THEME — the canvas composites with multiply, where white
      // leaves the page untouched and saturated colour tints it. So the
      // droplet is expressed as *how much to tint*, which is the inverse of
      // the additive dark-mode build below: adding light to a white page does
      // nothing at all.
      // Deep enough that each droplet's hue is actually legible — at a lighter
      // mix they all wash out to the same pale grey-pink and the polychrome
      // field is lost.
      float depth = 0.26 + 0.58 * fres;
      vec3 c = mix(vec3(1.0), tint, depth);

      // A touch of the rim film, kept pale so it tints rather than muddies.
      c = mix(c, mix(vec3(1.0), iridescence(film), 0.75), fres * 0.5);

      // Specular pulls back to white, so a highlight reads as a highlight
      // instead of a bright patch that multiply would ignore anyway.
      c = mix(c, vec3(1.0), clamp(spec * 1.6, 0.0, 1.0));

      col = clamp(c, 0.0, 1.0);
      alpha = clamp(0.34 + fres * 0.5, 0.0, 0.88);
    } else {
      // DARK THEME — additive glass over near-black.

      // Body: refraction, dimmed. It grounds the droplet in the scene's light
      // without dictating its colour.
      col = env(refr) * vec3(1.00, 0.86, 0.56) * 0.45;

      // Surface: what bounces off it. Almost entirely rim-weighted, which is
      // what makes the droplets read as thin shells rather than solid marbles.
      col += env(refl) * (0.05 + 1.15 * fres);

      // Inner light — the droplet glows with its own hue. Without this it has
      // nothing but a rim, which over a near-black page reads as a hole
      // punched in the layout rather than a bead of liquid.
      col += tint * core * core * 1.15;

      col += iridescence(film) * fres * 1.6;

      // Specular pop — tight, so it reads as a single catchlight.
      col += vec3(1.0, 0.96, 0.88) * spec * 1.5;

      // Gold bias — this is a yellow-led system, not a neutral one.
      col = mix(col, col * vec3(1.24, 1.02, 0.58), 0.34);

      // Crush the midtones so highlights read as glass rather than plastic.
      col = pow(max(col, 0.0), vec3(1.12));

      // Centre stays partly transparent on purpose: droplets drift behind body
      // copy, and an opaque interior would make text unreadable as they pass.
      alpha = clamp(0.24 + fres * 0.56, 0.0, 0.80);
    }
  } else {
    // Halo: rays that *nearly* grazed a droplet still glow, so each one sits
    // in its own light instead of being cut out of the page.
    //
    // This has to stay in the miss branch. On a hit, minD collapses to the
    // surface threshold, so applying it there floods the whole silhouette with
    // opaque orange and kills the transparency the droplet depends on.
    float glow = exp(-minD * 10.0);

    if (uLight > 0.5) {
      // A warm tint just outside the silhouette, again as "how much to
      // darken" rather than "how much light to add".
      col = mix(vec3(1.0), vec3(1.00, 0.84, 0.52), glow * 0.55);
      alpha = glow * 0.30;
    } else {
      col += vec3(1.00, 0.72, 0.22) * glow * 0.22;
      col += vec3(0.35, 0.55, 1.00) * glow * glow * 0.07;
      alpha = glow * 0.24;
    }
  }

  // WebGL drawing buffers are premultiplied by default, so the browser expects
  // rgb already scaled by alpha. Emitting straight alpha here shows up as a
  // dark halo around every droplet.
  float a = clamp(alpha, 0.0, 1.0) * uIntensity;
  fragColor = vec4(col * a, a);
}
`
}
