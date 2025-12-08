import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * A container for a piece of content.
 * @param {React.ComponentProps<'div'>} props - The props for the component.
 * @returns {JSX.Element} - The rendered card component.
 */
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

/**
 * The header of the card.
 * @param {React.ComponentProps<'div'>} props - The props for the component.
 * @returns {JSX.Element} - The rendered card header component.
 */
function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        '@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6',
        className,
      )}
      {...props}
    />
  )
}

/**
 * The title of the card.
 * @param {React.ComponentProps<'div'>} props - The props for the component.
 * @returns {JSX.Element} - The rendered card title component.
 */
function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  )
}

/**
 * The description of the card.
 * @param {React.ComponentProps<'div'>} props - The props for the component.
 * @returns {JSX.Element} - The rendered card description component.
 */
function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

/**
 * An action that can be performed on the card.
 * @param {React.ComponentProps<'div'>} props - The props for the component.
 * @returns {JSX.Element} - The rendered card action component.
 */
function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  )
}

/**
 * The main content of the card.
 * @param {React.ComponentProps<'div'>} props - The props for the component.
 * @returns {JSX.Element} - The rendered card content component.
 */
function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('px-6', className)}
      {...props}
    />
  )
}

/**
 * The footer of the card.
 * @param {React.ComponentProps<'div'>} props - The props for the component.
 * @returns {JSX.Element} - The rendered card footer component.
 */
function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center px-6 [.border-t]:pt-6', className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
