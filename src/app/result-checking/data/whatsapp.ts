export const SUPPORT_WHATSAPP_NUMBER = '2348080954826'

export function buildWhatsappHref(lines: string[]): string {
  return `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`
}
