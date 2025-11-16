import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {}

function Badge({ className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "btn inline-flex items-center text-xs font-semibold transition-colors focus:outline-none",
        className
      )}
      {...props}
    />
  )
}

export { Badge }
