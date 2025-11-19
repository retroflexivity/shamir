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

export interface TagProps extends React.HTMLAttributes<HTMLDivElement> {
  isSelected?: boolean;
  isIncompatible?: boolean;
}

function Tag({ className, isSelected, isIncompatible, ...props }: TagProps) {
  return (
    <Badge
      className={cn(
        "px-3 py-1 shadow-md inset-shadow-xl cursor-pointer rounded-full transition hover:bg-lightfg dark:hover:bg-darkfg hover:text-lightbg dark:hover:text-darkbg",
        isSelected
          ? "bg-lightfg dark:bg-darkfg text-lightbg dark:text-darkbg shadow-lg"
          : isIncompatible
          ? "opacity-40"
          : "",
        className
      )}
      {...props}
    />
  )
}

export { Badge, Tag }
