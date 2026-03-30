import { redirect } from "next/navigation";

export function blockInProduction() {
    // return;
    if (process.env.NODE_ENV === "production") {
        redirect("/");
    }
}