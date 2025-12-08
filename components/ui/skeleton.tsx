import { cn } from '@/lib/utils'

/**
 * A skeleton component.
 * @param {React.ComponentProps<'div'>} props - The props for the component.
 * @returns {JSX.Element} - The rendered skeleton component.
 */
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-accent animate-pulse rounded-md', className)}
      {...props}
    />
  )
}

export { Skeleton }
