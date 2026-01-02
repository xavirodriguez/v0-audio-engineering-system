// lib/i18n/get-translations.ts
import { unstable_cache } from 'next/cache'
import { getTranslations } from 'next-intl/server'

type GetTranslations = Parameters<typeof getTranslations>[0]

export const getCachedTranslations = unstable_cache(
  async (props: GetTranslations) => {
    return getTranslations(props)
  },
  ['translations'],
  { revalidate: 3600, tags: ['i18n'] }
)
