'use client'

import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio'

/**
 * A container that maintains a specific aspect ratio.
 * @param {React.ComponentProps<typeof AspectRatioPrimitive.Root>} props - The props for the component.
 * @returns {JSX.Element} - The rendered aspect ratio component.
 */
function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />
}

export { AspectRatio }
