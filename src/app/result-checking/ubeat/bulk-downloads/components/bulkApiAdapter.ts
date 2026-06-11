/**
 * Adapters that map the minimal backend contract to the wider `BulkStudent`
 * type used by the table UI.
 *
 * The `/ubeat/students/by-school` and `/bece/students/by-school` endpoints
 * only return `{ _id, name, isPaid }` — the table UI may want richer info
 * (e.g. school name in the modal), so we fold in the request context here.
 */

import type { BulkStudentListItem } from '@/app/result-checking/store/api/studentApi'
import type { BulkStudent } from './types'

interface MapContext {
    schoolId: string
    schoolName: string
    lga: string
    examYear: string | number
}

/**
 * Convert one row of the API response into the `BulkStudent` shape used
 * by the table. Fields not in the contract (examNo, class, gender…) are
 * intentionally left undefined — the row component renders `—` in that case.
 */
export function mapBulkStudentListItem(
    item: BulkStudentListItem,
    ctx: MapContext,
): BulkStudent {
    const isPaid = Boolean(item.isPaid)
    const yearNum = typeof ctx.examYear === 'string' ? Number(ctx.examYear) : ctx.examYear

    return {
        _id: item._id,
        studentName: item.name,
        paymentStatus: isPaid ? 'paid' : 'unpaid',
        certificateReady: isPaid,
        schoolId: ctx.schoolId,
        schoolName: ctx.schoolName,
        lga: ctx.lga,
        examYear: Number.isFinite(yearNum) ? yearNum : undefined,
    }
}
