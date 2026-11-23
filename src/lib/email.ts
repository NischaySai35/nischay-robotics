// REUSE-CHECKED: emailjs|sendMail|nodemailer|resend|smtp|fetch( -> only waitlistMailto() in lib/waitlist.ts, which builds a mailto link; nothing sends mail, so this is new.

/**
 * Waitlist emails, sent through EmailJS (https://www.emailjs.com).
 *
 * Why EmailJS rather than a Cloud Function: Functions and the Firebase "Trigger
 * Email" extension both require the Blaze plan (a card on file). EmailJS's free
 * tier is 200 emails a month with no card, and it sends from your own Gmail.
 *
 * Two emails per signup:
 *   1. ADMIN   — to you, with every field, Reply-To set to the subscriber.
 *   2. CONFIRM — to the subscriber, "you're on the list".
 *
 * Talks to the REST endpoint with fetch, so there is no SDK in the bundle.
 * The public key is PUBLIC by design (like the Firebase config). Limit abuse in
 * the EmailJS dashboard → Account → Security.
 *
 * Every function here is best-effort and never throws: email is a nicety on top
 * of the Firestore record, and a signup must never fail because mail did.
 */

const cfg = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined,
  adminTemplate: import.meta.env.VITE_EMAILJS_TEMPLATE_ADMIN as string | undefined,
  confirmTemplate: import.meta.env.VITE_EMAILJS_TEMPLATE_CONFIRM as string | undefined,
}

export const isEmailConfigured = Boolean(cfg.serviceId && cfg.publicKey && cfg.adminTemplate)
export const isConfirmationConfigured = isEmailConfigured && Boolean(cfg.confirmTemplate)

const ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send'

async function send(templateId: string, params: Record<string, string>): Promise<boolean> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: cfg.serviceId,
        template_id: templateId,
        user_id: cfg.publicKey,
        template_params: params,
      }),
    })
    if (!res.ok) console.error('[email] EmailJS refused:', res.status, await res.text())
    return res.ok
  } catch (err) {
    console.error('[email] send failed', err)
    return false
  }
}

export type EmailOutcome = { adminSent: boolean; confirmationSent: boolean }

/** Sends both emails in parallel. Resolves even if either fails. */
export async function sendWaitlistEmails(params: Record<string, string>): Promise<EmailOutcome> {
  if (!isEmailConfigured) return { adminSent: false, confirmationSent: false }

  const [adminSent, confirmationSent] = await Promise.all([
    send(cfg.adminTemplate!, params),
    isConfirmationConfigured ? send(cfg.confirmTemplate!, params) : Promise.resolve(false),
  ])
  return { adminSent, confirmationSent }
}
