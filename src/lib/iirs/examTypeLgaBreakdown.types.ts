export interface ExamTypeSchoolBreakdown {
    schoolId: string;
    schoolName: string;
    lga: string;
    totalStudents: number;
}

export interface ExamTypeLgaSummary {
    lga: string;
    totalStudents: number;
    schoolCount: number;
}

export interface ExamTypeUnattributable {
    schoolCount: number;
    totalStudents: number;
}

export interface ExamTypeLgaBreakdownResponse {
    examType: string;
    schools: ExamTypeSchoolBreakdown[];
    lgaSummary: ExamTypeLgaSummary[];
    totalStudentsRegistered: number;
    unattributable: ExamTypeUnattributable;
}
