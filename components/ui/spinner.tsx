import { Loader2Icon } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * A spinner component.
 * @param {React.ComponentProps<'svg'>} props - The props for the component.
 * @returns {JSX.Element} - The rendered spinner component.
 */
function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }
