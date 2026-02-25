export interface ExamType {
  id: string
  name: string
  shortName: string
  description: string
  fee: number
  lateFee: number
  hasLateFee: boolean
  iconPath: string
  class: string
  classFull: string
  color: string
}

export const EXAM_TYPES: ExamType[] = [
  {
    id: 'waec',
    name: 'West African Examinations Council',
    shortName: 'WAEC',
    description: 'West African Senior School Certificate Examination',
    fee: 7000,
    lateFee: 7500,
    class: 'SS3',
    classFull: 'Senior Secondary School 3',
    hasLateFee: true,
    iconPath: '/images/waec-logo.png',
    color: 'indigo'
  },
  {
    id: 'ubegpt',
    name: 'Universal Basic Education General Placement Test',
    shortName: 'UBEGPT',
    description: 'General placement test for basic education students',
    fee: 5000,
    lateFee: 5500,
    class: 'PRI6',
    classFull: 'Primary 6',
    hasLateFee: true,
    iconPath: '/images/ministry-logo.png',
    color: 'blue'
  },
  {
    id: 'ubetms',
    name: 'Universal Basic Education Test into Model Schools',
    shortName: 'UBETMS',
    description: 'Entrance test for admission into model schools',
    fee: 3000,
    lateFee: 0,
    class: 'PRI6',
    classFull: 'Primary 6',
    hasLateFee: false,
    iconPath: '/images/ministry-logo.png',
    color: 'purple'
  },
  {
    id: 'cess',
    name: 'Common Entrance into Science Schools',
    shortName: 'CESS',
    description: 'Entrance examination for science schools',
    fee: 3000,
    lateFee: 3500,
    class: 'PRI6',
    classFull: 'Primary 6',
    hasLateFee: true,
    iconPath: '/images/ministry-logo.png',
    color: 'green'
  },
  {
    id: 'bece',
    name: 'Basic Education Certificate Examination',
    shortName: 'BECE',
    description: 'Certificate examination for basic education completion',
    fee: 7000,
    lateFee: 7500,
    class: 'JSS3',
    classFull: 'Junior Secondary School 3',
    hasLateFee: true,
    iconPath: '/images/ministry-logo.png',
    color: 'indigo'
  },
  {
    id: 'bece-resit',
    name: 'Resit Exams (BECE)',
    shortName: 'BECE Resit',
    description: 'Resit examination for BECE candidates',
    fee: 2000,
    lateFee: 0,
    class: 'PRI6',
    classFull: 'Primary 6',
    hasLateFee: false,
    iconPath: '/images/ministry-logo.png',
    color: 'orange'
  },
  {
    id: 'ubeat',
    name: 'Universal Basic Education Assessment Test',
    shortName: 'UBEAT',
    description: 'Assessment test for basic education standards',
    fee: 5000,
    lateFee: 5500,
    class: 'PRI6',
    classFull: 'Primary 6',
    hasLateFee: true,
    iconPath: '/images/ministry-logo.png',
    color: 'teal'
  },
  {
    id: 'jscbe',
    name: 'Junior School Business Certificate Examination',
    shortName: 'JSCBE',
    description: 'Business certificate examination for junior school students',
    fee: 7000,
    lateFee: 7500,
    class: 'JSS3',
    classFull: 'Junior Secondary School 3',
    hasLateFee: true,
    iconPath: '/images/ministry-logo.png',
    color: 'pink'
  }
].map((i)=>({
  ...i,
  fee: i.fee + 1500,
  lateFee: i.lateFee + 1500,
}))

export interface ExamApplication {
  _id: string
  examType: string
  schoolId: string
  status: 'pending' | 'approved' | 'rejected'
  appliedAt: string
  approvedAt?: string
  rejectedAt?: string
  reviewNotes?: string
}

export const getExamById = (id: string): ExamType | undefined => {
  console.log(id)
  console.log(EXAM_TYPES)
  return EXAM_TYPES.find(exam => exam.id.toLowerCase() === id.toLowerCase())
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(amount)
}
