import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const gradientButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97] relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        primary:
          "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        sunset:
          "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        ocean:
          "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        forest:
          "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        aurora:
          "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5",
        subtle:
          "bg-gradient-to-r from-muted via-muted to-accent text-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-xl px-4 text-xs",
        lg: "h-14 rounded-2xl px-10 text-base",
        icon: "h-11 w-11 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof gradientButtonVariants> {
  shimmer?: boolean
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, variant, size, shimmer, children, ...props }, ref) => {
    return (
      <button
        className={cn(gradientButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {shimmer && (
          <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
        {children}
      </button>
    )
  }
)
GradientButton.displayName = "GradientButton"

export { GradientButton, gradientButtonVariants }
