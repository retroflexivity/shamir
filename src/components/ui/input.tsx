import * as React from "react"
import { cn } from "../../lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    className={cn(
      "px-4 py-2 flex w-full btn focus:placeholder-transparent outline-none focus:outline-none font-normal",
      className
    )}
    ref={ref}
    {...props}
  />
))
Input.displayName = "Input"
export { Input }
