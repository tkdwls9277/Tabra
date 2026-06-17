import { useState } from "react";
import { StorageService } from "../services/storageService";

type PanelVisibilityKey = Parameters<typeof StorageService.savePanelVisibility>[0];

interface UseOptionsModalProps {
  userName: string | null;
  showFavoritesPanel: boolean;
  showTodosPanel: boolean;
  showWorkPanel: boolean;
  showNotificationPanel: boolean;
  showFocusSection: boolean;
  weatherApiKey: string;
  showWeeklyForecast: boolean;
  showHourlyForecast: boolean;
  weatherDraggable: boolean;
  showWeatherPanel: boolean;
  setUserName: (value: string | null) => void;
  setShowFavoritesPanel: (value: boolean) => void;
  setShowTodosPanel: (value: boolean) => void;
  setShowWorkPanel: (value: boolean) => void;
  setShowNotificationPanel: (value: boolean) => void;
  setShowFocusSection: (value: boolean) => void;
  setWeatherApiKey: (value: string) => void;
  setShowWeeklyForecast: (value: boolean) => void;
  setShowHourlyForecast: (value: boolean) => void;
  setWeatherDraggable: (value: boolean) => void;
  setShowWeatherPanel: (value: boolean) => void;
}

export function useOptionsModal(props: UseOptionsModalProps) {
  const {
    userName,
    showFavoritesPanel, showTodosPanel, showWorkPanel, showNotificationPanel, showFocusSection,
    weatherApiKey, showWeeklyForecast, showHourlyForecast, weatherDraggable, showWeatherPanel,
    setUserName,
    setShowFavoritesPanel, setShowTodosPanel, setShowWorkPanel, setShowNotificationPanel,
    setShowFocusSection, setWeatherApiKey, setShowWeeklyForecast, setShowHourlyForecast,
    setWeatherDraggable, setShowWeatherPanel,
  } = props;

  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [optionsUserName, setOptionsUserName] = useState("");
  const [optionsShowFavorites, setOptionsShowFavorites] = useState(true);
  const [optionsShowTodos, setOptionsShowTodos] = useState(true);
  const [optionsShowWork, setOptionsShowWork] = useState(true);
  const [optionsShowNotifications, setOptionsShowNotifications] = useState(true);
  const [optionsShowFocus, setOptionsShowFocus] = useState(true);
  const [optionsWeatherApiKey, setOptionsWeatherApiKey] = useState("");
  const [optionsShowWeeklyForecast, setOptionsShowWeeklyForecast] = useState(false);
  const [optionsShowHourlyForecast, setOptionsShowHourlyForecast] = useState(false);
  const [optionsWeatherDraggable, setOptionsWeatherDraggable] = useState(true);
  const [optionsShowWeatherPanel, setOptionsShowWeatherPanel] = useState(true);

  const openOptionsModal = () => {
    setOptionsUserName(userName || "");
    setOptionsShowFavorites(showFavoritesPanel);
    setOptionsShowTodos(showTodosPanel);
    setOptionsShowWork(showWorkPanel);
    setOptionsShowNotifications(showNotificationPanel);
    setOptionsShowFocus(showFocusSection);
    setOptionsWeatherApiKey(weatherApiKey);
    setOptionsShowWeeklyForecast(showWeeklyForecast);
    setOptionsShowHourlyForecast(showHourlyForecast);
    setOptionsWeatherDraggable(weatherDraggable);
    setOptionsShowWeatherPanel(showWeatherPanel);
    setIsOptionsModalOpen(true);
  };

  const closeOptionsModal = () => setIsOptionsModalOpen(false);

  const handleUserNameChange = (value: string) => {
    setOptionsUserName(value);
    const newUserName = value.trim() || null;
    setUserName(newUserName);
    StorageService.saveUserName(newUserName);
  };

  // 패널 표시 토글 핸들러 팩토리: 모달 로컬 state + 앱 state + 스토리지를 한 번에 처리
  const makePanelToggle = (
    localSetter: (v: boolean) => void,
    appSetter: (v: boolean) => void,
    storageKey: PanelVisibilityKey,
  ) => (v: boolean) => {
    localSetter(v);
    appSetter(v);
    StorageService.savePanelVisibility(storageKey, v);
  };

  const handleShowFavoritesChange = makePanelToggle(setOptionsShowFavorites, setShowFavoritesPanel, "showFavoritesPanel");
  const handleShowTodosChange = makePanelToggle(setOptionsShowTodos, setShowTodosPanel, "showTodosPanel");
  const handleShowWorkChange = makePanelToggle(setOptionsShowWork, setShowWorkPanel, "showWorkPanel");
  const handleShowNotificationsChange = makePanelToggle(setOptionsShowNotifications, setShowNotificationPanel, "showNotificationPanel");
  const handleShowFocusChange = makePanelToggle(setOptionsShowFocus, setShowFocusSection, "showFocusSection");
  const handleShowWeatherPanelChange = makePanelToggle(setOptionsShowWeatherPanel, setShowWeatherPanel, "showWeatherPanel");

  const handleWeatherApiKeyChange = (value: string) => {
    setOptionsWeatherApiKey(value);
    setWeatherApiKey(value);
    chrome.storage.sync.set({ weatherApiKey: value });
  };

  const handleShowWeeklyForecastChange = (value: boolean) => {
    setOptionsShowWeeklyForecast(value);
    setShowWeeklyForecast(value);
    chrome.storage.sync.set({ showWeeklyForecast: value });
  };

  const handleShowHourlyForecastChange = (value: boolean) => {
    setOptionsShowHourlyForecast(value);
    setShowHourlyForecast(value);
    chrome.storage.sync.set({ showHourlyForecast: value });
  };

  const handleWeatherDraggableChange = (value: boolean) => {
    setOptionsWeatherDraggable(value);
    setWeatherDraggable(value);
    chrome.storage.sync.set({ weatherDraggable: value });
  };

  return {
    isOptionsModalOpen,
    optionsUserName,
    optionsShowFavorites,
    optionsShowTodos,
    optionsShowWork,
    optionsShowNotifications,
    optionsShowFocus,
    optionsWeatherApiKey,
    optionsShowWeeklyForecast,
    optionsShowHourlyForecast,
    optionsWeatherDraggable,
    optionsShowWeatherPanel,
    openOptionsModal,
    closeOptionsModal,
    handleUserNameChange,
    handleShowFavoritesChange,
    handleShowTodosChange,
    handleShowWorkChange,
    handleShowNotificationsChange,
    handleShowFocusChange,
    handleWeatherApiKeyChange,
    handleShowWeeklyForecastChange,
    handleShowHourlyForecastChange,
    handleWeatherDraggableChange,
    handleShowWeatherPanelChange,
  };
}
