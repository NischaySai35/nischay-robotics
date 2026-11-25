// REUSE-CHECKED: policy|terms|privacy|refund|shipping -> only productSection.shippingNote in site.ts (one sentence); no policy pages existed.

/* ============================================================================
   Store policies — shipping, returns, privacy, terms, seller details.

   Google Merchant Center will not list products from a site without clear
   shipping and return policies and contact details, and India's Consumer
   Protection (E-Commerce) Rules 2020 require seller details, a grievance
   contact and a return policy. Numbers come from `store` in catalog.ts, so
   the pages, product pages and Google data always agree.

   ⚠ Read every page before you sell anything and change what isn't true for
   you. In particular, fill in `seller.address`.
   ========================================================================= */

import { store } from './catalog.ts'
import { contact, founder } from './site.ts'

export const seller = {
  name: 'Nischay Robotics',
  owner: founder.name,
  // TODO: the full postal address you'll accept returns at. The e-commerce
  // rules require a full address; Bengaluru alone is not enough.
  address: 'Bengaluru, Karnataka, India',
  email: contact.email,
  phone: contact.phone,
}

export type Policy = {
  id: 'shipping' | 'returns' | 'privacy' | 'terms' | 'seller'
  title: string
  summary: string
  sections: readonly { heading: string; body: readonly string[] }[]
}

const s = store.shipping
const r = store.returns
const rupees = (n: number) => '₹' + n.toLocaleString('en-IN')

export const policies: readonly Policy[] = [
  {
    id: 'shipping',
    title: 'Shipping policy',
    summary: `Ships from Bengaluru within ${s.handlingDays.join('–')} business days. Free over ${rupees(s.freeAbove)}.`,
    sections: [
      {
        heading: 'Where we ship',
        body: ['We currently ship anywhere in India. International orders: message us first and we will quote shipping.'],
      },
      {
        heading: 'Cost',
        body: [
          `Free shipping on orders of ${rupees(s.freeAbove)} or more. Below that, a flat ${rupees(s.fee)} per order.`,
          'The shipping cost is shown before you pay. Product prices already include all taxes.',
        ],
      },
      {
        heading: 'How long it takes',
        body: [
          `Orders are packed and handed to the courier within ${s.handlingDays.join('–')} business days.`,
          `Delivery usually takes ${s.transitDays.join('–')} business days after that, depending on your pin code.`,
          'You get the tracking number by email or WhatsApp as soon as it ships.',
        ],
      },
      {
        heading: 'Pre-orders',
        body: [
          'Products marked "Releasing soon" are not charged or shipped yet. Joining the waitlist only reserves your place; you are asked to pay when your unit is ready.',
        ],
      },
      {
        heading: 'Damaged in transit',
        body: [
          'If the parcel arrives damaged, take a photo before opening it fully and contact us within 48 hours. We will replace or refund it at no cost to you.',
        ],
      },
    ],
  },
  {
    id: 'returns',
    title: 'Returns & refunds',
    summary: `${r.days}-day returns on unused items. Faulty items replaced or refunded free.`,
    sections: [
      {
        heading: 'Returns',
        body: [
          `You can ask to return an item within ${r.days} days of delivery if it is unused, undamaged and in its original packaging.`,
          r.customerPaysReturnShipping
            ? 'For returns that are not due to a fault, return shipping is paid by you.'
            : 'Return shipping is free.',
          'Message us before sending anything back so we can give you the return address and confirm the return.',
        ],
      },
      {
        heading: 'Faulty or wrong items',
        body: [
          'If an item is faulty on arrival or not what you ordered, tell us within 7 days. We replace it or refund it in full, including all shipping costs.',
        ],
      },
      {
        heading: 'Refunds',
        body: [
          'Refunds go back to the original payment method within 7 business days of us receiving and checking the return.',
          'Cancel before an order ships and you are refunded in full.',
        ],
      },
      {
        heading: 'What cannot be returned',
        body: [
          'Items that have been soldered, modified, wired into a project, or damaged by wrong voltage or wiring — unless they arrived faulty.',
        ],
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy policy',
    summary: 'What we collect, why, and who else sees it.',
    sections: [
      {
        heading: 'What we collect',
        body: [
          'Waitlist and enquiry forms: your name, email and anything you choose to add (country, organisation, quantity, a note).',
          'Reviews: the name and text you submit, and the rating. These are published on the product page once approved.',
          'Orders: the name, address, phone and email needed to deliver your order.',
        ],
      },
      {
        heading: 'How it is stored and used',
        body: [
          'Form entries and reviews are stored in Google Firebase. Waitlist confirmation emails are sent through EmailJS.',
          'We use your details only to answer you, deliver your order and tell you when products you asked about are ready. We never sell or share them for marketing.',
        ],
      },
      {
        heading: 'Cookies and tracking',
        body: [
          'The site has no advertising or analytics trackers. Your browser stores your theme choice locally. YouTube videos load only when you press play.',
        ],
      },
      {
        heading: 'Your choices',
        body: [`Email ${contact.email} to see, correct or delete anything we hold about you.`],
      },
    ],
  },
  {
    id: 'terms',
    title: 'Terms of sale',
    summary: 'The short version of the deal when you buy from us.',
    sections: [
      {
        heading: 'Prices',
        body: [
          'All prices are in Indian rupees and include all taxes. Shipping is shown separately before you pay.',
          'If a price on the site is clearly wrong, we will contact you before shipping and you can cancel for a full refund.',
        ],
      },
      {
        heading: 'Orders',
        body: [
          'An order is confirmed once payment is received and we have confirmed it with you. If we cannot fulfil it, you are refunded in full.',
        ],
      },
      {
        heading: 'Use of products',
        body: [
          'Robotics parts involve motors, batteries and electricity. Follow the documentation, use the correct power supply and supervise children.',
        ],
      },
      {
        heading: 'Contact',
        body: ['Questions about an order: see Seller details below for every way to reach us.'],
      },
    ],
  },
  {
    id: 'seller',
    title: 'Seller details',
    summary: 'Who you are buying from, and who handles complaints.',
    sections: [
      {
        heading: 'Seller',
        body: [`${seller.name}, run by ${seller.owner}.`, seller.address],
      },
      {
        heading: 'Contact',
        body: [`Email: ${seller.email}`, `Phone / WhatsApp: ${seller.phone}`],
      },
      {
        heading: 'Grievance officer',
        body: [
          `${seller.owner} — ${seller.email}, ${seller.phone}.`,
          'Complaints are acknowledged within 48 hours and resolved within one month, as required by the Consumer Protection (E-Commerce) Rules, 2020.',
        ],
      },
    ],
  },
]

export const findPolicy = (id: string) => policies.find((p) => p.id === id)
