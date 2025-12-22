export interface UIConfig {
  /**
   * Tiempo antes de remover un toast automáticamente.
   *
   * @default 3000ms (3 segundos)
   */
  toastRemoveDelay: number

  /**
   * Máximo número de toasts visibles simultáneamente.
   *
   * @default 3
   */
  toastLimit: number

  /**
   * Breakpoint para considerar dispositivo móvil.
   *
   * @default 768px
   */
  mobileBreakpoint: number
}

export const DEFAULT_UI_CONFIG: UIConfig = {
  toastRemoveDelay: 3000, // ✅ No 1000000!
  toastLimit: 3,
  mobileBreakpoint: 768,
}
