/**
 * Build a wa.me URL with a pre-filled message.
 *
 * The phone number comes from NEXT_PUBLIC_WHATSAPP_NUMBER and must be in
 * international format WITHOUT the leading `+` (e.g. "201017134627"),
 * per the WhatsApp Click-to-Chat spec.
 *
 * @param messagePrefix translated phrase like "I'd like to donate to:"
 * @param caseTitle the case header to append
 * @returns a `https://wa.me/<number>?text=<encoded>` URL
 */
export function buildWhatsAppDonateUrl(
  messagePrefix: string,
  caseTitle: string,
  whatsNum: string
): string {
  const number = (whatsNum ? whatsNum : (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '')).replace(
    /[^0-9]/g,
    '',
  );

  const text = `${messagePrefix} ${caseTitle}`;
  const encoded = encodeURIComponent(text);

  return `https://wa.me/${number}?text=${encoded}`;
}
