import { aeePortalMetadata } from "@/lib/metadata";

export const metadata = aeePortalMetadata.examPage;

export default function DashboardPageLayout({
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