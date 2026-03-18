import { Fragment } from "react";
import { AuthProvider } from "./providers/AuthProvider";
import NextTopLoader from "nextjs-toploader";
import { DateProvider } from "./context/dateContext";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (

        <Fragment>
            <NextTopLoader
                color='oklch(72.3% 0.219 149.579)'
            />
            <AuthProvider>
                <DateProvider>
                    {children}
                </DateProvider>
            </AuthProvider>
        </Fragment>

    );
}
