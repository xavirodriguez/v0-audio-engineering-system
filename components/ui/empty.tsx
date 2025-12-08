import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * A component to display when there is no content.
 * @param {React.ComponentProps<'div'>} props - The props for the component.
 * @returns {JSX.Element} - The rendered empty component.
 */
function Empty({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty"
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12',
        className,
      )}
      {...props}
    />
  )
}

/**
 * The header of the empty component.
 * @param {React.ComponentProps<'div'>} props - The props for the component.
 * @returns {JSX.Element} - The rendered empty header component.
 */
function EmptyHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        'flex max-w-sm flex-col items-center gap-2 text-center',
        className,
      )}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  'flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

/**
 * The media of the empty component.
 * @param {React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>} props - The props for the component.
 * @returns {JSX.Element} - The rendered empty media component.
 */
function EmptyMedia({
  className,
  variant = 'default',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

/**
 * The title of the empty component.
 * @param {React.ComponentProps<'div'>} props - The props for the component.
 * @returns {JSX.Element} - The rendered empty title component.
 */
function EmptyTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-title"
      className={cn('text-lg font-medium tracking-tight', className)}
      {...props}
    />
  )
}

/**
 * The description of the empty component.
 * @param {React.ComponentProps<'p'>} props - The props for the component.
 * @returns {JSX.Element} - The rendered empty description component.
 */
function EmptyDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        'text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4',
        className,
      )}
      {...props}
    />
  )
}

/**
 * The content of the empty component.
 * @param {React.ComponentProps<'div'>} props - The props for the component.
 * @returns {JSX.Element} - The rendered empty content component.
 */
function EmptyContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        'flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance',
        className,
      )}
      {...props}
    />
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}
