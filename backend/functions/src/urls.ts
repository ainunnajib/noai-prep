// Where Stripe sends people back to after paying (or cancelling). Pure, so it is unit tested.
//
// The site uses hash routing (…/noai-prep/#/account), so the query string has to
// go BEFORE the hash: …/noai-prep/?checkout=success&session_id=cs_…#/account.
// Anything after "#" never reaches the server and the page reads it from location.search.

/**
 * Normalises SITE_URL to a base like "https://example.github.io/noai-prep/":
 * drops any query or hash and adds the trailing slash GitHub Pages expects.
 * Throws if it isn't an https:// address (http:// is allowed for localhost while testing).
 */
export function siteBase(siteUrl: string): string {
  const url = new URL(siteUrl.trim())
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) {
    throw new Error('SITE_URL must start with https://')
  }
  url.search = ''
  url.hash = ''
  const lastSegment = url.pathname.split('/').pop() ?? ''
  if (!url.pathname.endsWith('/') && !lastSegment.includes('.')) url.pathname += '/'
  return url.toString()
}

export function checkoutUrls(siteUrl: string): { successUrl: string; cancelUrl: string } {
  const base = siteBase(siteUrl)
  return {
    // Stripe replaces {CHECKOUT_SESSION_ID} with the real id, so it must stay un-encoded.
    successUrl: `${base}?checkout=success&session_id={CHECKOUT_SESSION_ID}#/account`,
    cancelUrl: `${base}?checkout=cancelled#/account`,
  }
}
