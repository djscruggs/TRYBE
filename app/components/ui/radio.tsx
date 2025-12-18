import * as React from "react"
import { cn } from "~/lib/utils"

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  crossOrigin?: string | undefined
}

function Radio({
  className,
  label,
  crossOrigin,
  ...props
}: RadioProps) {
  const id = props.id || `radio-${props.name}-${props.value}`
  
  return (
    <div className="flex items-center">
      <input
        type="radio"
        id={id}
        className={cn(
          "h-4 w-4 text-red focus:ring-red border-gray-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      {label && (
        <label htmlFor={id} className="ml-2 text-sm cursor-pointer">
          {label}
        </label>
      )}
    </div>
  )
}

export { Radio }

