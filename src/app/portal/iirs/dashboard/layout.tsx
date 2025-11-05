import React from "react";
import Header from "./components/Header";
import ProtectedRoute from "../providers/ProtectedRoute";

export default function Layout({children}:{children:React.ReactNode}){
    return(
        <ProtectedRoute redirectTo="/portal/iirs">
            <Header/>
            {children}
        </ProtectedRoute>
    )
}