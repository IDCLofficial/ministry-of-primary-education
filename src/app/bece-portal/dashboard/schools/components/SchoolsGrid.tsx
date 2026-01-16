import React from 'react'
import { School } from '../types/student.types'
import SchoolCard from './SchoolCard'
import Pagination from './Pagination'

interface SchoolsGridProps {
    schools: School[];
    pagination: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
        itemsPerPage: number;
        totalItems: number;
        disabled: boolean;
    };
}

export default function SchoolsGrid({ schools, pagination }: SchoolsGridProps) {
    return (
        <>
            <div className="grid sm:grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] grid-cols-1 gap-3">
                {schools.map((school) => (
                    <SchoolCard key={school._id} school={school} />
                ))}
            </div>
            <Pagination
                disabled={pagination.disabled}
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={pagination.onPageChange}
                itemsPerPage={pagination.itemsPerPage}
                totalItems={pagination.totalItems}
            />
        </>
    )
}
