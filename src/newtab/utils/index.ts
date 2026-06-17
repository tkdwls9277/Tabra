import { detectLocale, getTranslations } from "../i18n";

// favicon URL 생성
export function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.origin;

    // Google favicon service 사용
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch (e) {
    // URL 파싱 실패 시 기본 아이콘
    return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text y="14" font-size="14">🔖</text></svg>';
  }
}

// 시간 문자열 생성 (HH:MM 형식)
export function getTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// 인사말 생성
export function getGreeting(userName: string | null): string {
  const hour = new Date().getHours();
  const locale = detectLocale();
  const t = getTranslations(locale);

  let greetingText = "";

  if (hour >= 5 && hour < 12) {
    greetingText = t.main.greeting.morning;
  } else if (hour >= 12 && hour < 18) {
    greetingText = t.main.greeting.afternoon;
  } else if (hour >= 18 && hour < 22) {
    greetingText = t.main.greeting.evening;
  } else {
    greetingText = t.main.greeting.night;
  }

  // 한국어와 일본어는 이름 뒤에 "님/さん" 추가
  if (userName) {
    if (locale === "ko") {
      return `${greetingText}, ${userName}님`;
    } else if (locale === "ja") {
      return `${greetingText}、${userName}さん`;
    } else {
      return `${greetingText}, ${userName}`;
    }
  }

  return greetingText;
}
