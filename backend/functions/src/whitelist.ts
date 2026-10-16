// The free-access whitelist. Its value comes from the ACCESS_WHITELIST secret
// and is never logged or returned to anyone. No Firebase imports here, so it is
// easy to unit test.

/** Lower-cases and trims an email address so "  Ann@Example.com " matches "ann@example.com". */
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Turns the raw secret into a set of addresses. Entries may be separated by
 * commas, semicolons, spaces or new lines; empty entries are ignored, and so
 * are quotes or angle brackets pasted around an address.
 */
export function parseWhitelist(raw: string | undefined | null): Set<string> {
  const emails = new Set<string>()
  for (const part of (raw ?? '').split(/[\s,;]+/)) {
    const email = normaliseEmail(part.replace(/^["'<]+|["'>]+$/g, ''))
    if (email) emails.add(email)
  }
  return emails
}

export function isWhitelisted(email: string | null | undefined, whitelist: Set<string>): boolean {
  if (!email) return false
  const normalised = normaliseEmail(email)
  return normalised !== '' && whitelist.has(normalised)
}
