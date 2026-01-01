export const locales = ['en', 'es', 'fr', 'gl'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';
