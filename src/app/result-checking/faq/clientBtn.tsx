"use client"

import { updateSearchParam } from "@/lib";
import { IoHelpCircleOutline } from "react-icons/io5";

export default function ClientBtn() {
    const handleContactSupport = () => {
        updateSearchParam("contacting-support", "true");
    }
    return (
        <button
            onClick={handleContactSupport}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-lg transition-colors"
        >
            Contact Support Team
        </button>
    )
}