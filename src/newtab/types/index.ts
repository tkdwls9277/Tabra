export type Todo = {
  id: string;
  text: string;
  done: boolean;
  date: string; // YYYY-MM-DD
};

export type Favorite = {
  id: string;
  label: string;
  url: string;
  icon?: string; // 커스텀 아이콘 (이모지 또는 텍스트)
};

export type WorkRecord = {
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:MM
  checkOut?: string; // HH:MM
  isVacation?: boolean; // 연차 여부 (deprecated, leaveType 사용 권장)
  leaveType?: "none" | "annual" | "half"; // 'none': 일반 근무, 'annual': 연차, 'half': 반차
  excludeLunch?: boolean; // 반차 시 점심시간 1시간 제외 여부
};

export type TodoGroup = {
  date: string;
  todos: Todo[];
  hasIncomplete: boolean;
};

export type OvertimeInfo = {
  minutes: number;
  isOver: boolean;
};

export interface WeatherData {
  temp: number; // 섭씨 온도
  feelsLike: number; // 체감 온도
  humidity: number; // 습도 (%)
  windSpeed: number; // 풍속 (m/s)
  condition: string; // 날씨 상태 설명
  icon: string; // 날씨 아이콘 (이모지)
  location: string; // 위치명
  timestamp: number; // 캐시 타임스탬프
}

export interface DailyForecast {
  date: string; // 날짜 (MM/DD)
  dayOfWeek: string; // 요일
  tempMax: number; // 최고 온도
  tempMin: number; // 최저 온도
  icon: string; // 날씨 아이콘
  condition: string; // 날씨 상태
}

export interface HourlyForecast {
  time: string; // 시간 (HH:MM)
  temp: number; // 온도
  icon: string; // 날씨 아이콘
  condition: string; // 날씨 상태
  timestamp: number; // Unix timestamp
}

export interface StorageData {
  userName?: string | null;
  todayFocus?: string;
  todos?: Todo[];
  favorites?: Favorite[];
  favoritesOpen?: boolean;
  todosOpen?: boolean;
  workRecords?: WorkRecord[];
  workPanelOpen?: boolean;
  notificationPanelOpen?: boolean;
  weatherPanelOpen?: boolean;
  showFavoritesPanel?: boolean;
  showTodosPanel?: boolean;
  showWorkPanel?: boolean;
  showNotificationPanel?: boolean;
  showFocusSection?: boolean; // 핵심목표 표시 여부
  weatherApiKey?: string; // OpenWeather API 키 (사용자 입력)
  showWeeklyForecast?: boolean; // 일주일 날씨 예보 표시 여부
  showHourlyForecast?: boolean; // 시간별 날씨 예보 표시 여부
  weatherDraggable?: boolean; // 날씨 위젯 드래그 가능 여부
  showWeatherPanel?: boolean; // 날씨 표시 여부
  weatherUnit?: "C" | "F"; // 온도 단위 (기본: C)
}
