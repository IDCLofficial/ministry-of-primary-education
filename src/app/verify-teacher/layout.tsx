import type { Metadata } from 'next'
import { publicMetadata } from '@/lib/metadata'

export const metadata: Metadata = publicMetadata.teacherVerification

export default function VerifyTeacherLayout({ children }: { children: React.ReactNode }) {
    return children
}
