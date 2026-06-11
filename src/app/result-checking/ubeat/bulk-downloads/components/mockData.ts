/**
 * Constants for the Bulk Downloads search form.
 *
 * Both the available years and the LGA-→-school cascade are now pulled
 * live via RTK Query:
 *   - Years  → `useGetAvailableYearsQuery({ examType })`
 *   - Schools → `useGetSchoolNamesQuery({ lga })`
 *
 * Only the static list of LGAs (derived from the shared `LgaEnum`) lives
 * here, since the enum is the single source of truth across the portal.
 */

import { LgaEnum } from '@/app/portal/dashboard/[schoolCode]/types'

/** LGA options (mirrors `LgaEnum` from the portal types). */
export const LGA_OPTIONS = Object.values(LgaEnum).map(lga => ({
    value: lga,
    label: lga,
}))
