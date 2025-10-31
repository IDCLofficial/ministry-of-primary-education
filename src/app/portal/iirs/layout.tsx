import Providers from "./dashboard/components/providers";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        
        <Providers>
            {children}
        </Providers>
     
    );
}
