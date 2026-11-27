import type { ReactNode } from 'react'
import { Link } from '@/components/ui/Link'
import { LogoMark } from '@/components/ui/Logo'
import { ChannelIconView, DiscordIcon } from '@/components/ui/SocialIcons'
import { inr, listed, productPath } from '@/content/catalog'
import { policies } from '@/content/policies'
import { channels, company, contact, links } from '@/content/site'
import { useWaitlist } from '@/lib/waitlistContext'

const SOCIALS = channels.filter((c) => !['mail', 'whatsapp'].includes(c.icon))
const WHATSAPP = channels.find((c) => c.icon === 'whatsapp')

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="text-chalk/35 text-[10px] font-semibold tracking-[0.2em] uppercase">{title}</h4>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  )
}

const linkCls = 'text-chalk/60 hover:text-accent text-sm transition-colors'

/**
 * Store-style footer: a column per job (buy, explore, get help), so anything
 * on the site is two clicks away from the bottom of any page.
 */
export function Footer() {
  const join = useWaitlist()

  return (
    <footer className="relative z-10 px-5 pb-10 sm:px-8">
      <div className="glass mx-auto max-w-6xl overflow-hidden p-8 sm:p-10">
        <div className="relative z-10">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            {/* Identity */}
            <div className="max-w-sm">
              <div className="flex items-center gap-3">
                <LogoMark size={40} />
                <div>
                  <p className="font-display text-lg leading-none font-bold">{company.name}</p>
                  <p className="text-chalk/40 mt-1.5 text-[11px] tracking-[0.16em] uppercase">{company.descriptor}</p>
                </div>
              </div>
              <p className="text-chalk/45 mt-5 text-sm leading-relaxed">{company.tagline}</p>
              <p className="text-chalk/30 mt-4 text-[13px]">{company.location}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {links.discord && (
                  <a
                    href={links.discord}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Discord"
                    className="glass-soft text-chalk/65 hover:text-accent flex h-9 w-9 items-center justify-center !rounded-full transition-colors"
                  >
                    <span className="relative z-10">
                      <DiscordIcon size={16} />
                    </span>
                  </a>
                )}
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={s.label}
                    className="glass-soft text-chalk/65 hover:text-accent flex h-9 w-9 items-center justify-center !rounded-full transition-colors"
                  >
                    <span className="relative z-10">
                      <ChannelIconView name={s.icon} size={16} />
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <Column title="Shop">
              <li>
                <Link to="/shop" className={`${linkCls} font-semibold`}>
                  All products
                </Link>
              </li>
              {listed.filter((p) => p.featured).map((p) => (
                <li key={p.slug}>
                  <Link to={productPath(p)} className={linkCls}>
                    {p.name}
                    <span className="text-chalk/35"> · {p.price ? inr(p.price) : 'soon'}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/tetrobot" className={linkCls}>
                  Tetrobot software
                </Link>
              </li>
              <li>
                <Link to="/download" className="text-accent hover:text-sun text-sm font-semibold transition-colors">
                  Download — free
                </Link>
              </li>
            </Column>

            <Column title="Explore">
              <li>
                <Link to="/" className={linkCls}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shapes" className={linkCls}>
                  Shapes gallery
                </Link>
              </li>
              <li>
                <Link to="/prototypes" className={linkCls}>
                  Build videos
                </Link>
              </li>
              <li>
                <Link to="/company" className={linkCls}>
                  About the company
                </Link>
              </li>
              <li>
                <Link to="/company#partnerships" className={linkCls}>
                  Partnerships
                </Link>
              </li>
            </Column>

            <Column title="Help & contact">
              <li>
                <button type="button" onClick={() => join()} className={linkCls}>
                  Join the waitlist
                </button>
              </li>
              <li>
                <Link to="/modules#waitlist" className={linkCls}>
                  How the waitlist works
                </Link>
              </li>
              {policies.map((p) => (
                <li key={p.id}>
                  <Link to={`/policies/${p.id}`} className={linkCls}>
                    {p.title}
                  </Link>
                </li>
              ))}
              <li>
                <a href={`mailto:${contact.support}`} className={`${linkCls} break-all`}>
                  {contact.support}
                </a>
              </li>
              {WHATSAPP && (
                <li>
                  <a href={WHATSAPP.href} target="_blank" rel="noreferrer noopener" className={linkCls}>
                    WhatsApp {contact.phone}
                  </a>
                </li>
              )}
              <li>
                <Link to="/community" className={linkCls}>
                  All contact options
                </Link>
              </li>
            </Column>
          </div>

          <div className="border-chalk/10 mt-10 flex flex-col gap-3 border-t pt-6 text-[12px] sm:flex-row sm:items-center sm:justify-between">
            <p className="text-chalk/30">
              © {new Date().getFullYear()} {company.name}. Built at home in Bengaluru.
            </p>
            <p className="text-chalk/25">SO-101 arms in stock · Tetrobot modules releasing soon · Shipping across India.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
