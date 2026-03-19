import { redirect } from "next/navigation";

export function blockInProduction() {
    if (process.env.NODE_ENV === "production") {
        redirect("/");
    }
}