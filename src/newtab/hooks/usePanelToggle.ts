import { StorageService } from "../services/storageService";

interface UsePanelToggleProps {
  favoritesOpen: boolean;
  setFavoritesOpen: (value: boolean) => void;
  todosOpen: boolean;
  setTodosOpen: (value: boolean) => void;
  workPanelOpen: boolean;
  setWorkPanelOpen: (value: boolean) => void;
  notificationPanelOpen: boolean;
  setNotificationPanelOpen: (value: boolean) => void;
  weatherPanelOpen: boolean;
  setWeatherPanelOpen: (value: boolean) => void;
}

/**
 * 패널 열림/닫힘 토글 로직을 관리하는 커스텀 훅
 */
export function usePanelToggle(props: UsePanelToggleProps) {
  const {
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
  } = props;

  const toggleFavoritesOpen = () => {
    const next = !favoritesOpen;
    setFavoritesOpen(next);
    StorageService.savePanelState("favoritesOpen", next);
  };

  const toggleTodosOpen = () => {
    const next = !todosOpen;
    setTodosOpen(next);
    StorageService.savePanelState("todosOpen", next);
  };

  const toggleWorkPanelOpen = () => {
    const next = !workPanelOpen;
    setWorkPanelOpen(next);
    StorageService.savePanelState("workPanelOpen", next);
  };

  const toggleNotificationPanelOpen = () => {
    const next = !notificationPanelOpen;
    setNotificationPanelOpen(next);
    StorageService.savePanelState("notificationPanelOpen", next);
  };

  const toggleWeatherPanelOpen = () => {
    const next = !weatherPanelOpen;
    setWeatherPanelOpen(next);
    StorageService.savePanelState("weatherPanelOpen", next);
  };

  return {
    toggleFavoritesOpen,
    toggleTodosOpen,
    toggleWorkPanelOpen,
    toggleNotificationPanelOpen,
    toggleWeatherPanelOpen,
  };
}
