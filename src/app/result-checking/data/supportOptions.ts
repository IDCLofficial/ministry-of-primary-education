import { ExamTypeEnum } from "@/app/portal/store/api/authApi";
import { LgaEnum } from "@/app/portal/dashboard/[schoolCode]/types";

export const IMO_STATE_LGAS = Object.values(LgaEnum).sort();

export const EXAM_TYPES = [
    { value: ExamTypeEnum.BECE, label: "BECE — Basic Education Certificate Examination" },
    { value: ExamTypeEnum.UBEAT, label: "UBEAT — Universal Basic Education Assessment Test" },
    { value: ExamTypeEnum.COMMON_ENTRANCE, label: "Common Entrance Examination" },
];

export const SUPPORT_REASONS = [
    { value: "result_not_found", label: "Result Not Found" },
    { value: "wrong_result", label: "Wrong Result Displayed" },
    { value: "name_mismatch", label: "Name / Details Mismatch" },
    { value: "missing_subjects", label: "Missing Subjects or Scores" },
    { value: "portal_access", label: "Unable to Access Portal" },
    { value: "other", label: "Other (please specify)" },
];
