// REUSE-CHECKED: policy page|legal -> PageShell needs scrollspy sections and prev/next across main pages; policies are short static text with their own sibling links.

import { Link } from '@/components/ui/Link'
import { policies } from '@/content/policies'
import type { Policy } from '@/content/policies'
import { usePageMeta } from '@/lib/head'

export function PolicyPage({ policy }: { policy: Policy }) {
  usePageMeta({
    title: `${policy.title} — Nischay Robotics`,
    description: policy.summary,
    path: `/policies/${policy.id}`,
  })

  return (
    <main className="relative z-10 px-5 pt-28 pb-16 sm:px-8 sm:pt-36">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[200px_minmax(0,1fr)]">
        <nav aria-label="Policies" className="lg:pt-14">
          <p className="text-chalk/35 text-[10px] font-semibold tracking-[0.2em] uppercase">Policies</p>
          <ul className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {policies.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/policies/${p.id}`}
                  aria-current={p.id === policy.id ? 'page' : undefined}
                  className={`block rounded-xl px-3 py-1.5 text-[13px] transition-colors ${
                    p.id === policy.id ? 'bg-chalk/[0.06] text-chalk font-semibold' : 'text-chalk/55 hover:text-chalk'
                  }`}
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <article>
          <nav aria-label="Breadcrumb" className="text-chalk/40 flex items-center gap-2 text-[12px]">
            <Link to="/" className="hover:text-accent">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link to="/shop" className="hover:text-accent">
              Shop
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-chalk/70">{policy.title}</span>
          </nav>
          <h1 className="mt-5 text-[clamp(2rem,4.5vw,3rem)] leading-[1.05]">{policy.title}</h1>
          <p className="text-chalk/60 mt-3 text-base">{policy.summary}</p>

          <div className="mt-10 space-y-9">
            {policy.sections.map((s) => (
              <section key={s.heading}>
                <h2 className="text-lg">{s.heading}</h2>
                <div className="text-chalk/70 mt-3 space-y-2.5 text-[15px] leading-relaxed">
                  {s.body.map((b) => (
                    <p key={b.slice(0, 32)}>{b}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </main>
  )
}
