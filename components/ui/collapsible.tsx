'use client'

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'

/**
 * An interactive component which expands/collapses a content area.
 * @param {React.ComponentProps<typeof CollapsiblePrimitive.Root>} props - The props for the component.
 * @returns {JSX.Element} - The rendered collapsible component.
 */
function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

/**
 * The trigger that toggles the collapsible.
 * @param {React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>} props - The props for the component.
 * @returns {JSX.Element} - The rendered collapsible trigger component.
 */
function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

/**
 * The content that is hidden or shown by the collapsible.
 * @param {React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>} props - The props for the component.
 * @returns {JSX.Element} - The rendered collapsible content component.
 */
function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
