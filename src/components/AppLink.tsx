import Link from "next/link";

type AppLinkProps = {
  label: string;
  href: string;
  variant: "primary" | "secondary" | "tertiary";
  size?: "small" | "medium" | "large";
  className?: string;
};

export const AppLink = ({ label, href, variant, size, className }: AppLinkProps) => {
    return(
        <Link
            href={href}
            className={`${className} ${variant} ${size}`}
        >
            {label}
        </Link>
    )
}