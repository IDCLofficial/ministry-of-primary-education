import { studentPortalMetadata } from '@/lib/metadata'
import BECELogin from './components/PageContent'

export const metadata = studentPortalMetadata.beceLogin

export default function BECELoginScreen() {
    return (
        <BECELogin />
    )
}