import { ExamTypeEnum } from "@/app/portal/store/api/authApi";
import { SessionStore } from "@/app/result-checking/utils/secureStorage";
import { updateSearchParam } from "@/lib";

/** SessionStore key for a one-shot context handoff into the Adaure chat widget. */
export const ADAURE_CHAT_PREFILL_KEY = "adaure_chat_prefill";

/**
 * Context handed from another part of the site (e.g. the "Check Your
 * Details" dialog, or an agent's per-student "Report" button on the bulk
 * downloads page) into Adaure's chat — consumed once, then cleared. Adaure
 * has no way to look up a record herself, so this is just a head start so
 * the user doesn't have to retype what's already on screen. examNo is
 * optional because some contexts (e.g. the bulk list, before a student's
 * detail record has been fetched) genuinely don't have it yet.
 */
export interface AdaureChatPrefill {
    examType: ExamTypeEnum;
    examNo?: string;
    studentName?: string;
    school?: string;
    examYear?: string;
    /** Free-text description of what looks wrong, if the user wrote one. */
    issue?: string;
}

/** Stashes the prefill and opens the Adaure chat widget (same mechanism as the FAB). Call this from any "report an issue" button site-wide instead of linking straight to WhatsApp. */
export async function openAdaureChat(prefill: AdaureChatPrefill): Promise<void> {
    await SessionStore.setJSON(ADAURE_CHAT_PREFILL_KEY, prefill);
    updateSearchParam("contacting-support", "true");
}
