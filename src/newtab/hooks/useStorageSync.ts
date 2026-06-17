import { useEffect, useRef } from "react";
import type { Favorite, Todo, WorkRecord } from "../types/index";
import { formatDate } from "../utils/date";

interface StorageSyncProps {
  setUserName: (value: string | null) => void;
  setFocus: (value: string) => void;
  setFocusInputValue: (value: string) => void;
  setTodos: (value: Todo[]) => void;
  setFavorites: (value: Favorite[]) => void;
  setWorkRecords: (value: WorkRecord[]) => void;
  setFavoritesOpen: (value: boolean) => void;
  setTodosOpen: (value: boolean) => void;
  setWorkPanelOpen: (value: boolean) => void;
  setNotificationPanelOpen: (value: boolean) => void;
  setWeatherPanelOpen: (value: boolean) => void;
  setShowFavoritesPanel: (value: boolean) => void;
  setShowTodosPanel: (value: boolean) => void;
  setShowWorkPanel: (value: boolean) => void;
  setShowNotificationPanel: (value: boolean) => void;
  setShowFocusSection: (value: boolean) => void;
  setCurrentDate: (value: string) => void;
  setWeatherApiKey: (value: string) => void;
  setShowWeeklyForecast: (value: boolean) => void;
  setShowHourlyForecast: (value: boolean) => void;
  setWeatherDraggable: (value: boolean) => void;
  setShowWeatherPanel: (value: boolean) => void;
  setWeatherUnit: (value: "C" | "F") => void;
}

export function useStorageSync(props: StorageSyncProps) {
  const {
    setUserName, setFocus, setTodos, setFavorites, setWorkRecords,
    setFavoritesOpen, setTodosOpen, setWorkPanelOpen, setNotificationPanelOpen, setWeatherPanelOpen,
    setShowFavoritesPanel, setShowTodosPanel, setShowWorkPanel, setShowNotificationPanel,
    setShowFocusSection, setCurrentDate, setWeatherApiKey, setShowWeeklyForecast,
    setShowHourlyForecast, setWeatherDraggable, setShowWeatherPanel, setWeatherUnit,
  } = props;

  const lastCheckedDateRef = useRef<string>(formatDate(new Date()));

  useEffect(() => {
    const checkDateChange = () => {
      const currentDate = formatDate(new Date());
      if (currentDate !== lastCheckedDateRef.current) {
        console.log(`[StorageSync] 날짜 변경 감지: ${lastCheckedDateRef.current} -> ${currentDate}`);
        lastCheckedDateRef.current = currentDate;
        setCurrentDate(currentDate);
      }
    };

    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, namespace: string) => {
      if (namespace !== "sync") return;

      console.log("[App] Storage changed in another tab:", changes);
      checkDateChange();

      // 타입별 기본값과 setter를 매핑해 반복 제거
      const sync = <T>(key: string, setter: (v: T) => void, defaultVal: T) => {
        if (key in changes) setter((changes[key].newValue as T | undefined) ?? defaultVal);
      };

      sync("userName", setUserName, null);
      sync("todayFocus", setFocus, "");
      sync("todos", setTodos, []);
      sync("favorites", setFavorites, []);
      sync("workRecords", setWorkRecords, []);

      sync("favoritesOpen", setFavoritesOpen, true);
      sync("todosOpen", setTodosOpen, true);
      sync("workPanelOpen", setWorkPanelOpen, true);
      sync("notificationPanelOpen", setNotificationPanelOpen, true);
      sync("weatherPanelOpen", setWeatherPanelOpen, true);

      sync("showFavoritesPanel", setShowFavoritesPanel, true);
      sync("showTodosPanel", setShowTodosPanel, true);
      sync("showWorkPanel", setShowWorkPanel, true);
      sync("showNotificationPanel", setShowNotificationPanel, true);
      sync("showFocusSection", setShowFocusSection, true);
      sync("showWeatherPanel", setShowWeatherPanel, true);

      sync("weatherApiKey", setWeatherApiKey, "");
      sync("showWeeklyForecast", setShowWeeklyForecast, false);
      sync("showHourlyForecast", setShowHourlyForecast, false);
      sync("weatherDraggable", setWeatherDraggable, true);
      sync("weatherUnit", setWeatherUnit, "C");
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    checkDateChange();

    const dateCheckTimer = setInterval(checkDateChange, 1000 * 60);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      clearInterval(dateCheckTimer);
    };
  }, [
    setUserName, setFocus, setTodos, setFavorites, setWorkRecords,
    setFavoritesOpen, setTodosOpen, setWorkPanelOpen, setNotificationPanelOpen, setWeatherPanelOpen,
    setShowFavoritesPanel, setShowTodosPanel, setShowWorkPanel, setShowNotificationPanel,
    setShowFocusSection, setCurrentDate, setWeatherApiKey, setShowWeeklyForecast,
    setShowHourlyForecast, setWeatherDraggable, setShowWeatherPanel, setWeatherUnit,
  ]);
}
