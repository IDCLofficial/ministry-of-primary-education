import { redirect } from "next/navigation";

export function blockInProduction() {
    if (process.env.NODE_ENVS === "production") {
        redirect("/");
    }
}