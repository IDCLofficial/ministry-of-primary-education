import { School } from '../types/student.types'

export const sampleSchools: School[] = [
    {
        id: '1',
        name: 'Accra Methodist Primary School',
        location: 'Accra, Greater Accra',
        students: [
            {
                id: '1',
                examNo: 'BECE2024001',
                firstName: 'Kwame',
                lastName: 'Asante',
                gender: 'Male',
                dateOfBirth: '2008-03-15',
                class: 'JSS 3'
            },
            {
                id: '2',
                examNo: 'BECE2024002',
                firstName: 'Akosua',
                lastName: 'Mensah',
                gender: 'Female',
                dateOfBirth: '2008-07-22',
                class: 'JSS 3'
            },
            {
                id: '3',
                examNo: 'BECE2024003',
                firstName: 'Kofi',
                lastName: 'Owusu',
                gender: 'Male',
                dateOfBirth: '2008-01-10',
                class: 'JSS 3'
            }
        ]
    },
    {
        id: '2',
        name: 'Kumasi Anglican Primary School',
        location: 'Kumasi, Ashanti',
        students: [
            {
                id: '4',
                examNo: 'BECE2024004',
                firstName: 'Ama',
                lastName: 'Osei',
                gender: 'Female',
                dateOfBirth: '2008-05-18',
                class: 'JSS 3'
            },
            {
                id: '5',
                examNo: 'BECE2024005',
                firstName: 'Yaw',
                lastName: 'Boateng',
                gender: 'Male',
                dateOfBirth: '2008-09-03',
                class: 'JSS 3'
            }
        ]
    },
    {
        id: '3',
        name: 'Tamale Islamic Primary School',
        location: 'Tamale, Northern',
        students: [
            {
                id: '6',
                examNo: 'BECE2024006',
                firstName: 'Fatima',
                lastName: 'Mohammed',
                gender: 'Female',
                dateOfBirth: '2008-11-12',
                class: 'JSS 3'
            },
            {
                id: '7',
                examNo: 'BECE2024007',
                firstName: 'Abdul',
                lastName: 'Rahman',
                gender: 'Male',
                dateOfBirth: '2008-04-25',
                class: 'JSS 3'
            },
            {
                id: '8',
                examNo: 'BECE2024008',
                firstName: 'Aisha',
                lastName: 'Ibrahim',
                gender: 'Female',
                dateOfBirth: '2008-08-14',
                class: 'JSS 3'
            }
        ]
    }
]
