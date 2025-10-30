export interface StudentData {
    examNo: string
    name: string
    sex: 'M' | 'F'
    age: number
    schoolName: string
    lga: string
    subjects: {
        name: string
        ca: number
        exam: number
        total: number
        grade: string
    }[]
    overallGrade: string
    totalCredits: number
}

// Grade calculation function
const calculateGrade = (total: number): string => {
    if (total >= 80) return 'A1'
    if (total >= 70) return 'B2'
    if (total >= 65) return 'B3'
    if (total >= 60) return 'C4'
    if (total >= 55) return 'C5'
    if (total >= 50) return 'C6'
    if (total >= 45) return 'D7'
    if (total >= 40) return 'E8'
    return 'F9'
}

// Calculate overall grade based on aggregate
const calculateOverallGrade = (subjects: StudentData['subjects']): string => {
    const gradePoints: { [key: string]: number } = {
        'A1': 1, 'B2': 2, 'B3': 3, 'C4': 4, 'C5': 5, 'C6': 6,
        'D7': 7, 'E8': 8, 'F9': 9
    }
    
    const totalPoints = subjects.reduce((sum, subject) => {
        return sum + (gradePoints[subject.grade] || 9)
    }, 0)
    
    const average = totalPoints / subjects.length
    if (average <= 1.5) return 'Distinction'
    if (average <= 2.5) return 'Credit'
    if (average <= 4.5) return 'Pass'
    return 'Fail'
}

// Generate demo student data
export const generateDemoStudent = (examNo: string): StudentData => {
    const demoSubjects = [
        { name: 'Mathematics', ca: 28, exam: 65 },
        { name: 'English Language', ca: 26, exam: 62 },
        { name: 'Basic Science', ca: 25, exam: 60 },
        { name: 'Social Studies', ca: 27, exam: 58 },
        { name: 'Christian Religious Studies', ca: 29, exam: 66 },
        { name: 'Igbo Language', ca: 24, exam: 55 },
        { name: 'Agricultural Science', ca: 22, exam: 52 },
        { name: 'Basic Technology', ca: 30, exam: 68 },
        { name: 'Civic Education', ca: 26, exam: 60 },
    ]

    const subjects = demoSubjects.map(subject => {
        const total = subject.ca + subject.exam
        return {
            ...subject,
            total,
            grade: calculateGrade(total)
        }
    })

    const totalCredits = subjects.filter(s => 
        s.grade.startsWith('A') || 
        s.grade.startsWith('B') || 
        s.grade.startsWith('C')
    ).length

    return {
        examNo: examNo || 'BECE2024001',
        name: 'Chukwuemeka Okafor',
        sex: 'M',
        age: 14,
        schoolName: 'Government Secondary School Owerri',
        lga: 'Owerri Municipal',
        subjects,
        overallGrade: calculateOverallGrade(subjects),
        totalCredits
    }
}
