import { aeePortalMetadata } from "@/lib/metadata";

export const metadata = aeePortalMetadata.registration

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
        </>
    );
}