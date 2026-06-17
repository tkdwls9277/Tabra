import { useState } from "react";
import type { Favorite, Todo, WorkRecord } from "../types/index";

/**
 * 앱의 모든 상태를 관리하는 커스텀 훅
 */
export function useAppState() {
  // ===== 사용자 설정 =====
  const [userName, setUserName] = useState<string | null>(null);
  const [focus, setFocus] = useState("");
  const [focusInputValue, setFocusInputValue] = useState("");
  const [weatherApiKey, setWeatherApiKey] = useState<string>("");
  const [showWeeklyForecast, setShowWeeklyForecast] = useState(false);
  const [showHourlyForecast, setShowHourlyForecast] = useState(false);
  const [weatherDraggable, setWeatherDraggable] = useState(true);
  const [showWeatherPanel, setShowWeatherPanel] = useState(true);
  const [weatherUnit, setWeatherUnit] = useState<"C" | "F">("C");

  // ===== 데이터 =====
  const [todos, setTodos] = useState<Todo[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [workRecords, setWorkRecords] = useState<WorkRecord[]>([]);

  // ===== 패널 상태 (열림/닫힘) =====
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const [todosOpen, setTodosOpen] = useState(true);
  const [workPanelOpen, setWorkPanelOpen] = useState(true);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(true);
  const [weatherPanelOpen, setWeatherPanelOpen] = useState(true);

  // ===== 패널 표시/숨김 설정 =====
  const [showFavoritesPanel, setShowFavoritesPanel] = useState(true);
  const [showTodosPanel, setShowTodosPanel] = useState(true);
  const [showWorkPanel, setShowWorkPanel] = useState(true);
  const [showNotificationPanel, setShowNotificationPanel] = useState(true);
  const [showFocusSection, setShowFocusSection] = useState(true);

  // ===== Todo 관련 =====
  const [newTodoText, setNewTodoText] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCompletedTodos, setShowCompletedTodos] = useState(false);

  // ===== Work 관련 =====
  const [weekOffset, setWeekOffset] = useState(0);

  // ===== UI =====
  const [time, setTime] = useState("");
  const [greeting, setGreeting] = useState("");
  const [backgroundImage, setBackgroundImage] = useState<string>("");
  const [currentDate, setCurrentDate] = useState(""); // 현재 날짜 (YYYY-MM-DD)

  return {
    // 사용자 설정
    userName,
    setUserName,
    focus,
    setFocus,
    focusInputValue,
    setFocusInputValue,
    weatherApiKey,
    setWeatherApiKey,
    showWeeklyForecast,
    setShowWeeklyForecast,
    showHourlyForecast,
    setShowHourlyForecast,
    weatherDraggable,
    setWeatherDraggable,
    showWeatherPanel,
    setShowWeatherPanel,
    weatherUnit,
    setWeatherUnit,

    // 데이터
    todos,
    setTodos,
    favorites,
    setFavorites,
    workRecords,
    setWorkRecords,

    // 패널 상태
    favoritesOpen,
    setFavoritesOpen,
    todosOpen,
    setTodosOpen,
    workPanelOpen,
    setWorkPanelOpen,
    notificationPanelOpen,
    setNotificationPanelOpen,
    weatherPanelOpen,
    setWeatherPanelOpen,

    // 패널 표시 설정
    showFavoritesPanel,
    setShowFavoritesPanel,
    showTodosPanel,
    setShowTodosPanel,
    showWorkPanel,
    setShowWorkPanel,
    showNotificationPanel,
    setShowNotificationPanel,
    showFocusSection,
    setShowFocusSection,

    // Todo 관련
    newTodoText,
    setNewTodoText,
    selectedDate,
    setSelectedDate,
    showCompletedTodos,
    setShowCompletedTodos,

    // Work 관련
    weekOffset,
    setWeekOffset,

    // UI
    time,
    setTime,
    greeting,
    setGreeting,
    backgroundImage,
    setBackgroundImage,
    currentDate,
    setCurrentDate,
  };
}
