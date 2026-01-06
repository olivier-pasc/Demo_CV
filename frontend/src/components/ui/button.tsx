import * as React from "react";
import { cn } from "../../lib/utils";

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, ...props }, ref) => {
    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center rounded-full bg-randstad-blue px-6 py-3 text-base font-bold text-white transition-all duration-200 hover:bg-blue-800 disabled:opacity-50 disabled:pointer-events-none active:scale-95",
                className
            )}
            {...props}
        />
    );
});
Button.displayName = "Button";

export { Button };
