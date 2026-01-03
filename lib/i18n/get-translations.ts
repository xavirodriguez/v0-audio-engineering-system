// lib/i18n/get-translations.ts
// i18n/getMessages.ts
import {unstable_cache} from 'next/cache'

export const getCachedMessages = unstable_cache(
  async (locale: string) => {
    return (await import(`../../messages/${locale}.json`)).default
  },
  ['messages'],
  {revalidate: 3600, tags: ['i18n']}
)
