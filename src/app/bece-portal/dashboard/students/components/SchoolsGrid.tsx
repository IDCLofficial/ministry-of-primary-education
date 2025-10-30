import React from 'react'
import { School } from '../types/student.types'
import SchoolCard from './SchoolCard'

interface SchoolsGridProps {
    schools: School[]
}

export default function SchoolsGrid({ schools }: SchoolsGridProps) {
    return (
        <div className="grid sm:grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] grid-cols-1 gap-3">
            {schools.map((school) => (
                <SchoolCard key={school._id} school={school} />
            ))}
        </div>
    )
}
