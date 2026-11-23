import { Link } from '@/components/ui/Link'
import { LogoMark } from '@/components/ui/Logo'
import { DiscordIcon } from '@/components/ui/SocialIcons'
import { channels, company, links, navItems } from '@/content/site'
import { useWaitlist } from '@/lib/waitlistContext'

export function Footer() {
  const join = useWaitlist()

  return (
    <footer className="relative z-10 px-5 pb-10 sm:px-8">
      <div className="glass mx-auto max-w-6xl overflow-hidden p-8 sm:p-10">
        <div className="relative z-10">
          <div className="flex flex-col gap-10 md:flex-row md:justify-between">
            {/* Identity */}
            <div className="max-w-sm">
              <div className="flex items-center gap-3">
                <LogoMark size={40} />
                <div>
                  <p className="font-display text-lg leading-none font-bold">{company.name}</p>
                  <p className="text-chalk/40 mt-1.5 text-[11px] tracking-[0.16em] uppercase">
                    {company.descriptor}
                  </p>
                </div>
              </div>
              <p className="text-chalk/45 mt-5 text-sm leading-relaxed">{company.tagline}</p>
              <p className="text-chalk/30 mt-4 text-[13px]">{company.location}</p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-10 sm:gap-16">
              <div>
                <h4 className="text-chalk/35 text-[10px] font-semibold tracking-[0.2em] uppercase">
                  Explore
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {navItems.map((n) => (
                    <li key={n.path}>
                      <Link to={n.path} className="text-chalk/60 hover:text-accent text-sm transition-colors">
                        {n.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link to="/download" className="text-accent hover:text-sun text-sm font-semibold transition-colors">
                      Download Tetrobot
                    </Link>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => join()}
                      className="text-chalk/60 hover:text-accent text-sm transition-colors"
                    >
                      Join the waitlist
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-chalk/35 text-[10px] font-semibold tracking-[0.2em] uppercase">
                  Elsewhere
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {links.discord && (
                    <li>
                      <a
                        href={links.discord}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-accent hover:text-sun inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                      >
                        <DiscordIcon size={15} /> Discord ↗
                      </a>
                    </li>
                  )}
                  {channels.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target={l.href.startsWith('mailto:') ? undefined : '_blank'}
                        rel="noreferrer noopener"
                        className="text-chalk/60 hover:text-accent text-sm transition-colors"
                      >
                        {l.label} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-chalk/10 pt-6 text-[12px] sm:flex-row sm:items-center sm:justify-between">
            <p className="text-chalk/30">
              © {new Date().getFullYear()} {company.name}. Built at home in Bengaluru.
            </p>
            <p className="text-chalk/25">
              Modules and developer kits releasing soon.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
