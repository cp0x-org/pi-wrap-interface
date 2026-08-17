import { ReactNode, useEffect, useMemo } from 'react';
import { IntlProvider } from 'react-intl';

// project imports
import useConfig from 'hooks/useConfig';

// locales
import enMessages from 'utils/locales/en.json';
import zhMessages from 'utils/locales/zh.json';

// types
import { I18n } from 'types/config';

// ==============================|| LOCALES ||============================== //

const DEFAULT_LOCALE: I18n = 'en';

/** Supported UI languages, in the order the language dropdown lists them. */
export const SUPPORTED_LOCALES: readonly I18n[] = ['en', 'zh'];

const messagesByLocale: Record<I18n, Record<string, string>> = {
  en: enMessages,
  zh: zhMessages
};

/** BCP 47 tags for the `lang` attribute on <html>. */
const htmlLangByLocale: Record<I18n, string> = {
  en: 'en',
  zh: 'zh-CN'
};

interface LocalesProps {
  children: ReactNode;
}

export default function Locales({ children }: LocalesProps) {
  const { i18n } = useConfig();

  // Guard against a stale/unknown locale persisted in localStorage.
  const locale: I18n = useMemo(() => (SUPPORTED_LOCALES.includes(i18n) ? i18n : DEFAULT_LOCALE), [i18n]);

  // Keep the document language in sync so assistive tech and agents read the right language.
  useEffect(() => {
    document.documentElement.lang = htmlLangByLocale[locale];
  }, [locale]);

  return (
    <IntlProvider locale={locale} defaultLocale={DEFAULT_LOCALE} messages={messagesByLocale[locale]}>
      {children}
    </IntlProvider>
  );
}
