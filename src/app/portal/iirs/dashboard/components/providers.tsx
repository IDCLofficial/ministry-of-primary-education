import { AuthContextProvider } from "../../context/authContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthContextProvider>
            {children}
        </AuthContextProvider>
    );
}   