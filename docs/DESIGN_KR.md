# 설계 명세서 (Design Specification)

## Tabra: 아키텍처 및 설계 문서

---

## 1. 문서 정보

| 항목            | 내용                     |
| --------------- | ------------------------ |
| **프로젝트명**  | Tabra               |
| **버전**        | 1.1.0                    |
| **문서 버전**   | 2.0                      |
| **최종 수정일** | 2026년 6월 17일          |
| **관련 문서**   | [PRD_KR.md](./PRD_KR.md), [CODE_QUALITY.md](./CODE_QUALITY.md) |

---

## 2. 시스템 아키텍처

### 2.1 전체 구조도

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │              New Tab Page (newtab.html)              │   │
│  │                                                       │   │
│  │  React App (App.tsx)                                 │   │
│  │  ├─ State: useAppState (50+ state variables)         │   │
│  │  ├─ Load:  useStorage (초기 Chrome storage 로드)     │   │
│  │  ├─ Sync:  useStorageSync (탭 간 실시간 동기화)      │   │
│  │  └─ Computed: useComputedValues (메모화된 계산값)    │   │
│  │                                                       │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Background Service Worker (src/background.ts)      │   │
│  │   • chrome.alarms: 알림 스케줄링 (1분 주기 폴링)     │   │
│  │   • chrome.storage.local 감시 → 알림 재스케줄         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
           │
           ↓
    ┌──────────────────────────┐
    │ Storage                  │
    ├──────────────────────────┤
    │ chrome.storage.sync      │  ← 사용자 데이터 (탭/기기 동기화)
    │ chrome.storage.local     │  ← 알림 데이터 (대용량)
    │ localStorage             │  ← 날씨/이미지 캐시
    └──────────────────────────┘
```

### 2.2 레이어 아키텍처

```
Presentation   Components (AppHeader, WorkPanel, TodoPanel, ...)
               Modals (TimeEditModal, FavoriteModal, OptionsModal)
               ─────────────────────────────────────────────────
Application    Custom Hooks (useWorkHandler, useTodoHandler, ...)
               Handler Hooks: 이벤트 처리 + 서비스 호출
               ─────────────────────────────────────────────────
Service        Services (WorkService, StorageService, WeatherService, ...)
               비즈니스 로직 + 외부 통신
               ─────────────────────────────────────────────────
Data           Chrome Storage Sync/Local + localStorage
```

---

## 3. 데이터 모델

### 3.1 핵심 타입 (`src/newtab/types/index.ts`)

```typescript
type Todo = {
  id: string;
  text: string;
  done: boolean;
  date: string;         // YYYY-MM-DD
};

type Favorite = {
  id: string;
  label: string;
  url: string;
  icon?: string;        // 이모지 또는 텍스트
};

type WorkRecord = {
  date: string;         // YYYY-MM-DD
  checkIn?: string;     // HH:MM
  checkOut?: string;    // HH:MM
  leaveType: 'none' | 'annual' | 'half';  // 연차/반차
  excludeLunch?: boolean;  // 반차 시 점심 제외 옵션
};

type WeatherData = {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  location: string;
  timestamp: number;
};

type DailyForecast = {
  date: string;
  dayOfWeek: string;
  tempMax: number;
  tempMin: number;
  icon: string;
  condition: string;
};

type HourlyForecast = {
  time: string;
  temp: number;
  icon: string;
  condition: string;
  timestamp: number;
};
```

### 3.2 알림 타입 (`src/newtab/types/notification.ts`)

```typescript
type NotificationTiming =
  | "at-time" | "5min-before" | "10min-before"
  | "30min-before" | "1hour-before" | "1day-before";

type Notification = {
  id: string;
  title: string;
  description?: string;
  targetDateTime: string;   // ISO 8601
  timings: NotificationTiming[];
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### 3.3 Storage 키 맵

| Storage          | 키                          | 타입              | 설명                       |
|------------------|-----------------------------|-------------------|----------------------------|
| `sync`           | `userName`                  | `string\|null`    | 사용자 이름                |
| `sync`           | `todayFocus`                | `string`          | 오늘의 핵심 목표           |
| `sync`           | `todos`                     | `Todo[]`          | 할일 목록                  |
| `sync`           | `favorites`                 | `Favorite[]`      | 즐겨찾기                   |
| `sync`           | `workRecords`               | `WorkRecord[]`    | 근무 기록                  |
| `sync`           | `favoritesOpen`             | `boolean`         | 즐겨찾기 패널 접힘 여부    |
| `sync`           | `todosOpen`                 | `boolean`         | 할일 패널 접힘 여부        |
| `sync`           | `workPanelOpen`             | `boolean`         | 근무 패널 접힘 여부        |
| `sync`           | `notificationPanelOpen`     | `boolean`         | 알림 패널 접힘 여부        |
| `sync`           | `weatherPanelOpen`          | `boolean`         | 날씨 패널 접힘 여부        |
| `sync`           | `showFavoritesPanel`        | `boolean`         | 옵션: 즐겨찾기 표시        |
| `sync`           | `showTodosPanel`            | `boolean`         | 옵션: 할일 표시            |
| `sync`           | `showWorkPanel`             | `boolean`         | 옵션: 근무 표시            |
| `sync`           | `showNotificationPanel`     | `boolean`         | 옵션: 알림 표시            |
| `sync`           | `showFocusSection`          | `boolean`         | 옵션: 핵심목표 표시        |
| `sync`           | `showWeatherPanel`          | `boolean`         | 옵션: 날씨 표시            |
| `sync`           | `weatherApiKey`             | `string`          | OpenWeather API 키         |
| `sync`           | `showWeeklyForecast`        | `boolean`         | 7일 예보 표시              |
| `sync`           | `showHourlyForecast`        | `boolean`         | 시간별 예보 표시           |
| `sync`           | `weatherDraggable`          | `boolean`         | 날씨 위젯 드래그 가능      |
| `local`          | `tabra-notifications`  | `Notification[]`  | 알림 데이터                |
| `localStorage`   | `tabra-weather`        | `WeatherData`     | 현재 날씨 캐시 (1시간)     |
| `localStorage`   | `tabra-forecast`       | 일별 예보         | 7일 예보 캐시 (1시간)      |
| `localStorage`   | `tabra-hourly`         | 시간별 예보       | 시간별 예보 캐시 (1시간)   |
| `localStorage`   | `unsplash_photo_cache`      | `{url, timestamp}`| 배경 이미지 캐시           |
| `localStorage`   | `recent_photos`             | `string[]`        | 최근 3개 이미지 기록       |
| `localStorage`   | `tabra-notifications`  | `Notification[]`  | 알림 원본 (localStorage)   |

> **주의**: 알림은 `localStorage`가 원본이고, chrome.storage.local에 수동으로 sync된다.

---

## 4. 컴포넌트 트리

```
App.tsx
├── AppHeader
│   ├── FocusInput           # 오늘의 핵심 목표 인라인 편집
│   ├── NextNotification     # 다음 알림 미리보기
│   └── WorkCheckButtons     # 출근/퇴근 버튼
│
├── WeatherPanel             # 날씨 컨테이너 (드래그 가능)
│   ├── Weather              # 현재 날씨
│   ├── HourlyWeather        # 시간별 예보 (옵션)
│   └── WeeklyWeather        # 7일 예보 (옵션)
│
├── FavoritesPanel           # 좌측 즐겨찾기 (@dnd-kit DnD)
├── TodoPanel                # 할일 목록 (날짜별 그룹)
├── WorkPanel                # 주간 근무 기록
├── NotificationPanel        # 알림 관리
│
├── CheckInDrawer            # 출퇴근 하단 드로어
│
└── ModalContainer
    ├── FavoriteModal        # 즐겨찾기 추가/편집
    ├── TimeEditModal        # 출퇴근 시간 수정 (leaveType 포함)
    └── OptionsModal         # 설정 (패널 표시, API키, 내보내기)
```

---

## 5. 상태 관리

### 5.1 훅 구조

```
App.tsx
├── useAppState()           # 50+ state 선언 (useState만, 로직 없음)
├── useStorage()            # 마운트 시 chrome.storage.sync 1회 로드
├── useStorageSync()        # onChanged 리스너 + 1분 날짜 체크
├── useComputedValues()     # useMemo: todosByDate, weekRecords, overtime 등
│
├── useFocusHandler()       # 핵심목표 Enter/blur 저장
├── useTodoHandler()        # Todo CRUD + 저장
├── useWorkHandler()        # 출퇴근/시간수정 + modal state
├── useFavoriteHandler()    # 즐겨찾기 CRUD + modal + DnD reorder
├── useOptionsModal()       # 설정 모달 11개 핸들러
├── usePanelToggle()        # 5개 패널 접힘 토글 + 저장
└── useTranslation()        # 브라우저 언어 감지 + t() 반환
```

### 5.2 데이터 흐름

```
Chrome Storage → useStorage → useAppState (setters)
                                    ↓
                          useStorageSync (onChanged listener)
                                    ↓
                          useComputedValues (derived state)
                                    ↓
                              Components (props)
                                    ↓
                           Handler Hooks (CRUD)
                                    ↓
                    Services (비즈니스 로직 + chrome.storage.set)
```

---

## 6. 서비스 레이어

| 서비스                | 저장소          | 주요 책임                                        |
|-----------------------|-----------------|--------------------------------------------------|
| `StorageService`      | chrome.sync     | 전체 데이터 로드, 패널 상태/표시 설정 저장       |
| `TodoService`         | chrome.sync     | Todo CRUD + 날짜별 그룹화                        |
| `FavoriteService`     | chrome.sync     | 즐겨찾기 CRUD + navigate                         |
| `WorkService`         | chrome.sync     | 출퇴근, 주간 계산, 초과근무 계산                 |
| `WeatherService`      | localStorage    | OpenWeather API 호출, 1시간 캐싱 (3가지 예보)    |
| `NotificationService` | localStorage    | 알림 CRUD, 알람 시간 계산                        |
| `DataExportService`   | —               | 전체 데이터 JSON 내보내기/가져오기               |
| `UnsplashService`     | localStorage    | 하드코딩된 24개 URL에서 랜덤 선택, 1시간 캐시   |

### 6.1 근무 시간 계산 (`WorkService`)

```
// 점심시간 제외 옵션 있는 경우:
workMinutes = (checkOut - checkIn) - 60

// excludeLunch = false 인 경우 (또는 연차):
workMinutes = (checkOut - checkIn)

// 연차 (leaveType = 'annual'):
workMinutes = 480 (8시간 고정)

// 반차 (leaveType = 'half'):
workMinutes = 240 (4시간 고정)

// 주간 목표: 40시간 = 2400분
weekTarget = weekdays(월~금 중 비휴일) × 480분
overtime = weekTotal - weekTarget
```

---

## 7. i18n

```
src/newtab/i18n/
├── index.ts        # useTranslation hook (브라우저 언어 auto-detect)
├── types.ts        # Translations 인터페이스, Locale 타입
└── locales/
    ├── ko.ts       # 한국어
    ├── en.ts       # 영어
    ├── ja.ts       # 일본어
    └── zh.ts       # 중국어
```

지원 언어: `ko` | `en` | `ja` | `zh` (브라우저 언어 기반 auto-detect, 수동 전환 가능)

---

## 8. 백그라운드 서비스 (`src/background.ts`)

```
1분마다 chrome.alarms 폴링
  → chrome.storage.local에서 Notification[] 로드
  → 트리거 시간이 된 알림 → chrome.notifications.create()

chrome.storage.onChanged (local namespace)
  → 'tabra-notifications' 변경 감지
  → chrome.alarms.clearAll() → 알림 전체 재스케줄
```

---

## 9. 스타일링

- **기반**: Tailwind CSS 4 + 커스텀 CSS (`src/newtab/styles/index.css`)
- **배경**: 반투명 패널 `rgba(0,0,0,0.3)` + `backdrop-filter: blur(10px)`
- **반응형**: `@media (max-aspect-ratio: 1/1)` — 세로화면 시 컬럼 레이아웃
- **전환**: 300ms ease 일관 적용

---

## 10. 빌드 및 배포

```bash
yarn dev     # 개발 서버
yarn build   # 프로덕션 빌드 → dist/
```

**빌드 결과물:**
```
dist/
├── newtab.html
├── manifest.json
├── background.js   (src/background.ts 컴파일)
├── assets/
│   ├── newtab-[hash].js
│   └── newtab-[hash].css
└── icons/
```

---

## 11. 주요 의존성

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "@dnd-kit/core": "^6.3.1",
  "@dnd-kit/sortable": "^10.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

---

## 12. 파일 구조

```
src/newtab/
├── App.tsx                      # 루트: 훅 조합 + 레이아웃
├── main.tsx
├── components/
│   ├── AppHeader.tsx
│   ├── CheckInDrawer.tsx        # 출퇴근 하단 드로어
│   ├── FavoritesPanel.tsx
│   ├── FocusInput.tsx
│   ├── HourlyWeather.tsx
│   ├── ModalContainer.tsx
│   ├── NextNotification.tsx
│   ├── NotificationPanel.tsx
│   ├── TimePicker.tsx
│   ├── TodoPanel.tsx
│   ├── Weather.tsx
│   ├── WeatherPanel.tsx
│   ├── WeeklyWeather.tsx
│   ├── WorkCheckButtons.tsx
│   ├── WorkPanel.tsx
│   └── modals/
│       ├── FavoriteModal.tsx
│       ├── OptionsModal.tsx
│       └── TimeEditModal.tsx
├── hooks/
│   ├── useAppState.ts
│   ├── useComputedValues.ts
│   ├── useFavoriteHandler.ts
│   ├── useFocusHandler.ts
│   ├── useOptionsModal.ts
│   ├── usePanelToggle.ts
│   ├── useStorage.ts
│   ├── useStorageSync.ts
│   ├── useTodoHandler.ts
│   ├── useTranslation.ts
│   └── useWorkHandler.ts
├── services/
│   ├── dataExportService.ts
│   ├── favoriteService.ts
│   ├── notificationService.ts
│   ├── storageService.ts
│   ├── todoService.ts
│   ├── unsplashService.ts
│   ├── weatherService.ts
│   └── workService.ts
├── types/
│   ├── index.ts
│   └── notification.ts
├── utils/
│   ├── date.ts
│   ├── index.ts
│   └── work.ts
├── constants/
│   └── index.ts
├── i18n/
│   ├── index.ts
│   ├── types.ts
│   └── locales/
│       ├── en.ts
│       ├── ko.ts
│       ├── ja.ts
│       └── zh.ts
└── styles/
    └── index.css
```

---

## 13. 변경 이력

| 버전  | 날짜       | 변경사항                                              |
|-------|------------|-------------------------------------------------------|
| 1.0   | 2025-12-10 | 초기 릴리즈: Todo, Favorites, Work, Notifications     |
| 1.1   | 2026-06    | 날씨 위젯 (Weather, HourlyWeather, WeeklyWeather) 추가 |
| 1.1   | 2026-06    | WorkRecord: isVacation → leaveType + excludeLunch     |
| doc 2.0 | 2026-06-17 | 현재 코드 기준 문서 전면 재작성                       |
