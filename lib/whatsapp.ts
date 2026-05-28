/**
 * Build a donate URL from a case's `payment_link` value, which can be either:
 *  - An Egyptian WhatsApp number (digits only, without +2, e.g. "1025533447")
 *    → returns a wa.me link with a pre-filled message.
 *  - A direct payment URL (starts with http/https, e.g. an InstaPay link)
 *    → returned as-is; the message prefix and case title are ignored.
 *
 * Returns `null` when `paymentLink` is empty so callers can hide the donate
 * button rather than linking to a broken URL.
 *
 * @param messagePrefix translated phrase like "I'd like to donate to:"
 * @param caseTitle the case header, appended to WhatsApp messages
 * @param paymentLink the case's payment_link field value; may be ""
 */
export function buildDonateUrl(
  messagePrefix: string,
  caseTitle: string,
  paymentLink: string,
): string | null {
  const value = paymentLink.trim();
  if (!value) return null;

  // Direct payment link (InstaPay, etc.)
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  // Egyptian WhatsApp number — prefix with country code +2
  const number = `+2${value}`.replace(/[^0-9]/g, '');
  const text = `${messagePrefix} ${caseTitle}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
