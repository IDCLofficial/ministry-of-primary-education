/**
 * Small formatting helpers used across the bulk-downloads UI.
 */

/**
 * Convert a string to Title Case while keeping common name punctuation
 * (spaces, hyphens, periods) intact.
 *
 *   "ABASURUM FLORA CHIJINDU"     → "Abasurum Flora Chijindu"
 *   "NNAH-OFORJI IFECHUKWU"      → "Nnah-Oforji Ifechukwu"
 *   "CHIDIEBUBE O."              → "Chidiebube O."
 *   "AKWILAM NMESOMA SARAH"      → "Akwilam Nmesoma Sarah"
 *
 * Non-letter characters (periods, commas, digits) are preserved as-is.
 */
export function toTitleCase(value: string): string {
    if (!value) return value
    return value
        .toLowerCase()
        .replace(/(^|[\s-])\p{L}/gu, match => match.toUpperCase())
}
