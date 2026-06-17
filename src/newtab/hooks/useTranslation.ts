import { useEffect, useState } from "react";
import { detectLocale, getTranslations, type Locale, type Translations } from "../i18n";

/**
 * React 컴포넌트에서 다국어 번역을 사용하기 위한 커스텀 훅
 *
 * @returns {Object} - { t: Translations, locale: Locale, setLocale: Function }
 *
 * @example
 * const { t, locale } = useTranslation();
 * <h1>{t.main.greeting.morning}</h1>
 */
export function useTranslation() {
  const [locale, setLocale] = useState<Locale>(detectLocale());
  const [t, setT] = useState<Translations>(getTranslations(locale));

  useEffect(() => {
    setT(getTranslations(locale));
  }, [locale]);

  return { t, locale, setLocale };
}
