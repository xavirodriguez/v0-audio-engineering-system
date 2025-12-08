'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

/**
 * A theme provider component.
 * @param {ThemeProviderProps} props - The props for the component.
 * @returns {JSX.Element} - The rendered theme provider component.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
