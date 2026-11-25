// REUSE-CHECKED: document.title|meta|canonical|head -> only bare `document.title =` in App.tsx and PageShell; nothing kept description/canonical in step.

import { useEffect } from 'react'
import { seo } from '@/content/site'

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = value
}

/**
 * Per-page <head>: title, description, canonical and the social-card fields.
 *
 * index.html carries the home page's values, which is what a crawler that
 * doesn't run JavaScript sees. Google does run it, and indexes each page with
 * whatever this sets — so every page gets its own title and snippet in search
 * results instead of seven copies of the home page's.
 */
export function usePageMeta({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string
  description: string
  path: string
  noindex?: boolean
}) {
  useEffect(() => {
    const url = seo.url + (path === '/' ? '/' : path)
    document.title = title
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('name', 'robots', noindex ? 'noindex' : 'index, follow')

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url
  }, [title, description, path, noindex])
}
