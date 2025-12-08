'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

/**
 * A toaster component that displays notifications.
 * @param {ToasterProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered toaster component.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
