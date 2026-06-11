'use client'

import React, { useMemo } from 'react'
import { IoBusinessOutline, IoCalendarOutline, IoLocationOutline, IoSearch } from 'react-icons/io5'
import CustomDropdown from '@/app/portal/dashboard/components/CustomDropdown'
import { useGetSchoolNamesQuery } from '@/app/portal/store/api/authApi'
import { useGetAvailableYearsQuery } from '@/app/result-checking/store/api/studentApi'
import { LGA_OPTIONS } from './mockData'
import type { BulkExamConfig } from './examConfig'
import type { BulkSearchFilters } from './types'

interface BulkSearchFormProps {
    config: BulkExamConfig
    value: BulkSearchFilters
    onChange: (value: BulkSearchFilters) => void
    onSubmit: () => void
    isLoading?: boolean
    disabled?: boolean
}

/**
 * 3-field search form: Year + LGA + School.
 * Mirrors the alternative-form pattern from the main BECE/UBEAT login:
 *   - LGA list is the same `LgaEnum`-derived `LGA_OPTIONS` constant
 *   - Years are pulled live via `useGetAvailableYearsQuery({ examType })`
 *   - Schools are pulled live via `useGetSchoolNamesQuery({ lga })`
 *   - Same "select an LGA before schools become available" affordance
 *   - Same loading + "no data" empty states
 */
export default function BulkSearchForm({
    config,
    value,
    onChange,
    onSubmit,
    isLoading = false,
    disabled = false,
}: BulkSearchFormProps) {
    // ── Live available years (per exam) ──────────────────────────────────
    const { data: yearsData, isLoading: isLoadingYears } = useGetAvailableYearsQuery({
        examType: config.examType,
    })

    const yearOptions = useMemo(
        () => (yearsData?.years ?? []).map(y => ({ value: String(y), label: String(y) })),
        [yearsData],
    )

    // ── Live school list (LGA-scoped) ────────────────────────────────────
    const { data: schoolNames, isLoading: isLoadingSchools, isFetching: isFetchingSchools } =
        useGetSchoolNamesQuery(
            { lga: value.lga },
            { skip: !value.lga },
        )

    const schoolNamesList = useMemo(() => schoolNames ?? [], [schoolNames])

    const schoolOptions = useMemo(
        () =>
            schoolNamesList.map(school => ({
                value: school._id,
                label: String(school.schoolName).startsWith('"')
                    ? String(school.schoolName).slice(1)
                    : school.schoolName,
            })),
        [schoolNamesList],
    )

    const isFormValid =
        value.examYear.trim().length === 4 &&
        value.lga.trim().length >= 2 &&
        value.school.id.trim().length > 0

    const handleLgaChange = (lga: string) => {
        // Reset school when LGA changes — mirrors the UBEAT alternative form.
        onChange({ ...value, lga, school: { id: '', name: '' } })
    }

    const handleSchoolChange = (schoolId: string) => {
        const match = schoolNamesList.find(s => s._id === schoolId)
        onChange({
            ...value,
            school: { id: schoolId, name: match?.schoolName ?? '' },
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!isFormValid || isLoading || disabled) return
        onSubmit()
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-gray-200 overflow-hidden"
            aria-label={`Search ${config.shortName} cohort`}
        >
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                        Find a {config.shortName} cohort
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Pick a year, LGA and school to load every student in that group.
                    </p>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Exam Year */}
                <div className="group">
                    <label
                        htmlFor="bulk-exam-year"
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2"
                    >
                        <IoCalendarOutline className="w-4 h-4 text-gray-400" />
                        Exam Year <span className="text-red-500">*</span>
                    </label>
                    {isLoadingYears ? (
                        <div className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
                                <span>Loading years…</span>
                            </div>
                        </div>
                    ) : yearOptions.length === 0 ? (
                        <div className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500">
                            No years available for this exam yet
                        </div>
                    ) : (
                        <CustomDropdown
                            options={yearOptions}
                            value={value.examYear}
                            onChange={year => onChange({ ...value, examYear: year })}
                            placeholder="Select exam year"
                        />
                    )}
                </div>

                {/* LGA */}
                <div className="group">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                        <IoLocationOutline className="w-4 h-4 text-gray-400" />
                        Local Government Area <span className="text-red-500">*</span>
                    </label>
                    <CustomDropdown
                        options={LGA_OPTIONS}
                        value={value.lga}
                        onChange={handleLgaChange}
                        placeholder="Select LGA"
                        searchable
                        searchPlaceholder="Search LGA..."
                    />
                </div>

                {/* School */}
                <div className="group">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                        <IoBusinessOutline className="w-4 h-4 text-gray-400" />
                        School Name <span className="text-red-500">*</span>
                    </label>
                    {!value.lga ? (
                        <div className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500">
                            Select an LGA first
                        </div>
                    ) : isLoadingSchools || isFetchingSchools ? (
                        <div className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400" />
                                <span>Loading {value.lga} schools…</span>
                            </div>
                        </div>
                    ) : schoolOptions.length === 0 ? (
                        <div className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500">
                            No schools available for this LGA
                        </div>
                    ) : (
                        <CustomDropdown
                            options={schoolOptions}
                            value={value.school.id}
                            onChange={handleSchoolChange}
                            placeholder="Select a school"
                            searchable
                            searchPlaceholder="Search school name..."
                        />
                    )}
                </div>
            </div>

            {/* Submit */}
            <div className="px-6 pb-6 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-3">
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <IoSearch className="w-3.5 h-3.5" />
                    Results are paginated 10 per page. You can change filters at any time.
                </p>
                <button
                    type="submit"
                    disabled={!isFormValid || isLoading || disabled}
                    className={[
                        'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold',
                        'text-white bg-gray-900 hover:bg-gray-800 transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
                    ].join(' ')}
                >
                    {isLoading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Loading cohort…
                        </>
                    ) : (
                        <>
                            <IoSearch className="w-4 h-4" />
                            Load cohort
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
