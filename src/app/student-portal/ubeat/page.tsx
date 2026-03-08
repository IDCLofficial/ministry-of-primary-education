import React from 'react'
import UBEATLogin from './components/PageContent'
import { studentPortalMetadata } from '@/lib/metadata'

export const metadata = studentPortalMetadata.ubeatLogin

export default function UBEATLoginPage() {
    return <UBEATLogin />
}
