import * as React from "react";

import { cn } from "@/lib/utils";

interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href?: string;
}

export const SkipLink = React.forwardRef<HTMLAnchorElement, SkipLinkProps>(
    ({ href = "#main-content", className, children = "Passer au contenu principal", ...props }, ref) => {
        return (
            <a
                ref={ref}
                href={href}
                className={cn(
                    "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50",
                    "focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium",
                    "focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    className,
                )}
                {...props}
            >
                {children}
            </a>
        );
    },
);
SkipLink.displayName = "SkipLink";
