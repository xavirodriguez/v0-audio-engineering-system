import {getRequestConfig} from 'next-intl/server'
import {routing} from '@/i18n/routing'

export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as any)) {
    return {
      locale: routing.defaultLocale,
      messages: {}
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})
