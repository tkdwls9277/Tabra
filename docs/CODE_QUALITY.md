# 코드 품질 평가 (Code Quality Review)

> 기준 날짜: 2026-06-17 | 버전: 1.1.0

---

## 1. 잘 된 부분

- **레이어 분리**: Presentation → Hooks → Services → Data 레이어가 명확하게 구분됨
- **커스텀 훅 분리**: `useAppState`, `useWorkHandler` 등 관심사별로 훅을 나눠 App.tsx가 비대해지지 않음
- **타입 안전성**: 전체 코드베이스가 TypeScript로 작성되어 있고, `WorkRecord`, `Todo` 등 핵심 타입이 명확히 정의됨
- **i18n**: 4개 언어 지원이 처음부터 설계됨 (`useTranslation` + locales 분리)
- **캐싱 전략**: 날씨(1시간), 배경 이미지(1시간)에 localStorage 캐시 적용
- **성능**: `useComputedValues`에서 비싼 계산을 `useMemo`로 분리

---

## 2. DRY 위반 (중복 코드)

### 2.1 `calculateWorkMinutes` 중복 ⚠️

`utils/work.ts`에 정의되어 있음에도 `WorkPanel.tsx` 내부에 동일한 함수가 다시 구현되어 있다.

```typescript
// utils/work.ts (정의 위치)
export function calculateWorkMinutes(checkIn: string, checkOut: string): number { ... }

// WorkPanel.tsx (중복)
const calculateWorkMinutes = (checkIn: string, checkOut: string): number => { ... }
```

**해결**: WorkPanel.tsx에서 로컬 함수 제거하고 `utils/work.ts`에서 import.

---

### 2.2 요일 이름 배열 중복 ⚠️

`constants/index.ts`에 `DAY_NAMES`가 있는데, `WorkPanel.tsx`와 `TodoPanel.tsx` 각각에서 다국어 요일 배열을 로컬로 재선언한다.

```typescript
// constants/index.ts
export const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

// WorkPanel.tsx (중복 선언)
const dayNames = { ko: [...], en: [...], ... };

// TodoPanel.tsx (중복 선언)
const dayNames = { ko: [...], en: [...], ... };
```

**해결**: i18n locales에 `days` 키를 추가하고 `t.common.days`로 참조.

---

### 2.3 날씨 Geolocation 로직 중복 ⚠️

`Weather.tsx`, `HourlyWeather.tsx`, `WeeklyWeather.tsx` 세 컴포넌트가 각각 동일한 `getGeolocation()` 래퍼 함수를 가지고 있다.

```typescript
// 세 파일 모두 동일한 패턴
const getGeolocation = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
  });
```

**해결**: `utils/weather.ts`로 추출하거나 `WeatherService`에 정적 메서드로 이동.

---

### 2.4 패널 표시 핸들러 11개 반복 패턴 ⚠️

`useOptionsModal.ts`에서 패널 표시 토글 핸들러가 동일한 패턴으로 11회 반복된다.

```typescript
// 모두 같은 구조
const handleShowFavoritesChange = (v: boolean) => {
  setShowFavorites(v);
  props.setShowFavoritesPanel(v);
  StorageService.savePanelVisibility("showFavoritesPanel", v);
};
// ... 10개 더
```

**해결**: 제너릭 핸들러 팩토리로 교체.

```typescript
const makePanelHandler = <K extends keyof PanelVisibility>(
  key: K,
  localSetter: (v: boolean) => void,
  appSetter: (v: boolean) => void,
) => (v: boolean) => {
  localSetter(v);
  appSetter(v);
  StorageService.savePanelVisibility(key, v);
};
```

---

### 2.5 `useStorageSync` 변경 감지 핸들러 20+회 반복 ⚠️

`useStorageSync.ts`에서 모든 storage 키에 대해 동일한 패턴이 반복된다.

```typescript
// 20번 이상 반복
if (changes.todos !== undefined) {
  const v = changes.todos.newValue as Todo[] | undefined;
  props.setTodos(v ?? []);
}
```

**해결**: 타입 안전 매핑 테이블로 교체.

```typescript
const KEY_HANDLERS = [
  { key: 'todos',     setter: props.setTodos,     def: [] },
  { key: 'favorites', setter: props.setFavorites, def: [] },
  // ...
] as const;

KEY_HANDLERS.forEach(({ key, setter, def }) => {
  if (changes[key] !== undefined) setter(changes[key].newValue ?? def);
});
```

---

### 2.6 알림 타이밍 상수 중복 ⚠️

`notificationService.ts`의 `TIMING_MINUTES` 맵이 `background.ts`의 switch 문에서 재구현된다.

```typescript
// notificationService.ts
const TIMING_MINUTES: Record<NotificationTiming, number> = {
  "5min-before": 5, "10min-before": 10, ...
};

// background.ts (중복 switch)
switch (timing) {
  case "5min-before": alarmTime -= 5 * 60 * 1000; break;
  ...
}
```

**해결**: `notificationService.ts`에서 `TIMING_MINUTES` export → background.ts에서 import.

---

## 3. 과한 부분 (Over-engineering)

### 3.1 패널 상태가 2가지로 이중화

현재 패널마다 `xOpen` (접힘/펼침)과 `showX` (숨김/표시) 2가지 상태가 별도로 존재한다. 이를 props로 전달하면 컴포넌트마다 2개씩 받아야 한다.

```typescript
// 현재: 패널 1개당 2개 state
favoritesOpen: boolean      // 접힘/펼침
showFavoritesPanel: boolean // 숨김/표시

// 개선안: 3-상태 단일 값
type PanelState = 'hidden' | 'collapsed' | 'open';
```

---

### 3.2 서비스 클래스가 불필요한 추상화

`TodoService`, `WorkService`, `FavoriteService`는 모두 인스턴스를 생성하지 않는 static 메서드만 가진다. 클래스 문법이 추가 가치를 제공하지 않는다.

```typescript
// 현재 (불필요한 class wrapper)
export class TodoService {
  static add(todos: Todo[], text: string): Todo[] { ... }
}

// 개선안 (함수 직접 export)
export function addTodo(todos: Todo[], text: string): Todo[] { ... }
```

---

### 3.3 `UnsplashService`가 서비스 클래스일 필요 없음

24개의 하드코딩된 URL 배열에서 랜덤 선택하는 로직은 `utils/images.ts` 또는 `constants/images.ts` 수준이다. 8개의 static 메서드를 가진 클래스로 만들 필요가 없다.

---

### 3.4 `useAppState`의 과도한 집중

50개 이상의 `useState`를 하나의 훅에 선언한다. 이 자체가 문제는 아니지만, 모든 setter를 props drilling으로 내려보내야 하므로 컴포넌트 시그니처가 비대해진다. Context API나 Zustand 같은 경량 상태 라이브러리로의 전환을 고려할 수 있다.

---

## 4. 부족한 부분

### 4.1 Error Boundary 없음 ⚠️

컴포넌트 오류가 발생하면 전체 앱이 흰 화면이 된다. 특히 날씨 API나 Chrome Storage 오류 시 사용자 경험이 나쁘다.

```typescript
// App.tsx 레벨에 추가 권장
<ErrorBoundary fallback={<FallbackUI />}>
  <App />
</ErrorBoundary>
```

---

### 4.2 알림 데이터의 불일치 저장소

알림은 `localStorage`가 원본이고 `chrome.storage.local`에 수동으로 복사된다. 이 설계는 두 저장소가 불일치할 수 있는 구조적 약점이 있다. 알림 삭제 시 `chrome.storage.local` 정리가 누락될 수 있다.

**권장**: 알림도 `chrome.storage.local`을 원본으로 사용하고 `localStorage`를 제거.

---

### 4.3 데이터 가져오기 시 유효성 검사 없음

`DataExportService.importData()`가 JSON을 파싱하지만 구조를 검증하지 않는다. 잘못된 JSON 파일을 가져오면 storage가 깨질 수 있다.

```typescript
// 현재 (검증 없음)
const data = JSON.parse(jsonString);
chrome.storage.sync.set(data);

// 권장
if (!isValidBackup(data)) throw new Error("잘못된 백업 파일");
```

---

### 4.4 날씨 기본 위치 하드코딩

Geolocation 거부 시 서울(lat: 37.5665, lon: 126.9780)로 폴백하는데, 이 값이 코드에 하드코딩되어 있다. 설정에서 기본 도시를 지정할 수 있어야 한다.

---

### 4.5 온도 단위(`C`/`F`) 미저장

`Weather.tsx`에서 온도 단위 토글 기능이 있지만 state가 컴포넌트 로컬이다. 새 탭을 열면 항상 `C`로 초기화된다.

**권장**: `weatherUnit` 키를 `chrome.storage.sync`에 추가.

---

### 4.6 접근성(a11y) 미흡

- 대부분의 아이콘 버튼에 `aria-label` 누락
- 모달이 `<dialog>` 요소 대신 커스텀 div + backdrop 사용
- 키보드 포커스 트랩 없음 (모달 열릴 때 배경 요소가 탭 가능)

---

### 4.7 `App.tsx.backup` 파일

`src/newtab/App.tsx.backup` 파일이 Git으로 추적되고 있다. 리팩토링 전 백업 파일로 보이며 삭제 권장.

---

## 5. 우선순위별 개선 권고

| 우선순위 | 항목                                  | 상태       |
|----------|---------------------------------------|------------|
| P0       | `App.tsx.backup` 삭제                 | ✅ 완료    |
| P0       | `calculateWorkMinutes` 중복 제거      | ✅ 완료    |
| P0       | Geolocation 유틸 추출 (3곳 중복)      | ✅ 완료 (`utils/weather.ts`) |
| P1       | 알림 저장소 단일화 (localStorage 제거) | ⬜ 미완료 (아키텍처 변경 필요) |
| P1       | 데이터 가져오기 유효성 검사 추가      | ✅ 완료    |
| P1       | 온도 단위 persistent 저장             | ✅ 완료 (`weatherUnit` storage) |
| P1       | `useStorageSync` 핸들러 팩토리화      | ✅ 완료 (`sync()` 헬퍼) |
| P2       | `useOptionsModal` 핸들러 팩토리화     | ✅ 완료 (`makePanelToggle`) |
| P2       | Error Boundary 추가                   | ⬜ 미완료  |
| P3       | 서비스 클래스 → 함수로 전환           | ⬜ 미완료  |
| P3       | 패널 상태 3-상태 단일화               | ⬜ 미완료  |
