import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  variant?: 'default' | 'glass' | 'gradient'
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, change, trend = 'neutral', icon, variant = 'default', ...props }, ref) => {
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
          variant === 'default' && "bg-card/50 backdrop-blur-sm border border-border/60 shadow-md",
          variant === 'glass' && "glass shadow-md",
          variant === 'gradient' && "bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/20 shadow-md",
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="text-sm font-medium text-muted-foreground">
            {title}
          </div>
          {icon && (
            <div className="p-2 rounded-xl bg-accent/50 text-foreground">
              {icon}
            </div>
          )}
        </div>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold tracking-tight">
            {value}
          </div>
          {change && (
            <div
              className={cn(
                "flex items-center gap-1 text-sm font-medium",
                trend === 'up' && "text-emerald-600 dark:text-emerald-400",
                trend === 'down' && "text-rose-600 dark:text-rose-400",
                trend === 'neutral' && "text-muted-foreground"
              )}
            >
              <TrendIcon className="h-4 w-4" />
              {change}
            </div>
          )}
        </div>
      </div>
    )
  }
)
StatCard.displayName = "StatCard"

export { StatCard }
