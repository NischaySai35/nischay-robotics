// REUSE-CHECKED: ld+json|schema.org|structured -> only the static Organization block in index.html; nothing generated Product data.

/* ============================================================================
   Google product data (schema.org JSON-LD).

   One builder, used in two places so they can never disagree:
     - the build (scripts/prerender.ts) bakes it into each product's HTML;
     - the product page refreshes it in the browser once live reviews load.

   This is what lets Google show price, stock and star ratings under a
   search result, and what Merchant Center reads when it crawls the site.
   Relative imports only — the build imports this file too.
   ========================================================================= */

import { categories, store } from './catalog.ts'
import type { Availability, CatalogItem } from './catalog.ts'

export type ReviewSummary = {
  count: number
  average: number
  /** Most recent first. Only approved reviews ever reach here. */
  reviews: readonly { name: string; rating: number; text: string; date: string }[]
}

const AVAILABILITY: Record<Availability, string> = {
  in_stock: 'https://schema.org/InStock',
  out_of_stock: 'https://schema.org/OutOfStock',
  preorder: 'https://schema.org/PreOrder',
  made_to_order: 'https://schema.org/MadeToOrder',
}

export const shippingFeeFor = (price: number) => (price >= store.shipping.freeAbove ? 0 : store.shipping.fee)

export function productJsonLd(p: CatalogItem, siteUrl: string, summary?: ReviewSummary | null) {
  const url = `${siteUrl}/shop/${p.slug}`
  const days = (range: readonly [number, number]) => ({
    '@type': 'QuantitativeValue',
    minValue: range[0],
    maxValue: range[1],
    unitCode: 'DAY',
  })

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: [p.short, ...p.description].join(' '),
    image: p.images.map((src) => siteUrl + src),
    sku: p.sku,
    brand: { '@type': 'Brand', name: p.brand },
    category: categories[p.category].label,
    countryOfOrigin: p.countryOfOrigin,
    url,
  }
  if (p.gtin) data.gtin = p.gtin
  if (p.mpn) data.mpn = p.mpn

  if (p.price !== null) {
    data.offers = {
      '@type': 'Offer',
      url,
      priceCurrency: store.currency,
      price: p.price.toFixed(2),
      availability: AVAILABILITY[p.availability],
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'Nischay Robotics' },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: shippingFeeFor(p.price), currency: store.currency },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: store.shipping.country },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: days(store.shipping.handlingDays),
          transitTime: days(store.shipping.transitDays),
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: store.shipping.country,
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: store.returns.days,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: store.returns.customerPaysReturnShipping
          ? 'https://schema.org/ReturnShippingFees'
          : 'https://schema.org/FreeReturn',
      },
    }
  }

  // Ratings ONLY from real, approved, on-page reviews. Google penalises
  // markup that shows ratings the page itself doesn't show.
  if (summary && summary.count > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: summary.average.toFixed(1),
      reviewCount: summary.count,
      bestRating: 5,
      worstRating: 1,
    }
    data.review = summary.reviews.slice(0, 5).map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.name },
      datePublished: r.date,
      reviewBody: r.text,
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
    }))
  }

  return data
}

export function breadcrumbJsonLd(siteUrl: string, trail: readonly { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: siteUrl + t.path,
    })),
  }
}
