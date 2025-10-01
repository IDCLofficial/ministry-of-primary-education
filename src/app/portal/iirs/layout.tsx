import Providers from "./dashboard/components/providers";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <body>
            <Providers>
                {children}
            </Providers>
        </body>
    );
}
