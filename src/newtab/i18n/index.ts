import { en } from "./locales/en";
import { ja } from "./locales/ja";
import { ko } from "./locales/ko";
import { zh } from "./locales/zh";
import type { Locale, Translations } from "./types";

const translations: Record<Locale, Translations> = {
  en,
  ko,
  zh,
  ja,
};

/**
 * 크롬 브라우저의 언어 설정을 감지하여 지원하는 언어로 변환
 */
export function detectLocale(): Locale {
  // Chrome Extension API 사용 (chrome.i18n.getUILanguage())
  if (typeof chrome !== "undefined" && chrome.i18n) {
    const browserLang = chrome.i18n.getUILanguage().toLowerCase();

    if (browserLang.startsWith("ko")) return "ko";
    if (browserLang.startsWith("zh")) return "zh";
    if (browserLang.startsWith("ja")) return "ja";
  }

  // Fallback: navigator.language 사용
  const navigatorLang = navigator.language.toLowerCase();
  if (navigatorLang.startsWith("ko")) return "ko";
  if (navigatorLang.startsWith("zh")) return "zh";
  if (navigatorLang.startsWith("ja")) return "ja";

  // 기본값: 영어
  return "en";
}

/**
 * 현재 언어의 번역 객체를 반환
 */
export function getTranslations(locale: Locale = detectLocale()): Translations {
  return translations[locale] || translations.en;
}

/**
 * 중첩된 키를 사용하여 번역 값을 가져오는 헬퍼 함수
 * 예: t("main.greeting.morning") => "Good Morning"
 */
export function t(key: string, locale: Locale = detectLocale()): string {
  const trans = getTranslations(locale);
  const keys = key.split(".");

  let value: any = trans;
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }

  return typeof value === "string" ? value : key;
}

export { type Locale, type Translations };
