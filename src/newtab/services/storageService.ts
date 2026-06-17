import type { StorageData } from "../types/index";

/**
 * Chrome Storage 관리 서비스
 */
export class StorageService {
  /**
   * Storage에서 데이터 로드
   */
  static async loadFromStorage(): Promise<StorageData | null> {
    if (typeof chrome === "undefined" || !chrome.storage) {
      return null;
    }

    return new Promise((resolve) => {
      chrome.storage.sync.get(
        [
          "userName",
          "todayFocus",
          "todos",
          "favorites",
          "favoritesOpen",
          "todosOpen",
          "workRecords",
          "workPanelOpen",
          "notificationPanelOpen",
          "weatherPanelOpen",
          "showFavoritesPanel",
          "showTodosPanel",
          "showWorkPanel",
          "showNotificationPanel",
          "showFocusSection",
          "weatherApiKey",
          "showWeeklyForecast",
          "showHourlyForecast",
          "weatherDraggable",
          "showWeatherPanel",
          "weatherUnit",
        ],
        (res) => {
          resolve(res as StorageData);
        }
      );
    });
  }

  /**
   * 패널 상태 저장
   */
  static savePanelState(
    key: "favoritesOpen" | "todosOpen" | "workPanelOpen" | "notificationPanelOpen" | "weatherPanelOpen",
    value: boolean
  ): void {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.set({ [key]: value });
    }
  }

  /**
   * 패널 표시 설정 저장
   */
  static savePanelVisibility(
    key:
      | "showFavoritesPanel"
      | "showTodosPanel"
      | "showWorkPanel"
      | "showNotificationPanel"
      | "showFocusSection"
      | "showWeatherPanel",
    value: boolean
  ): void {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.set({ [key]: value });
    }
  }

  /**
   * 사용자 이름 저장
   */
  static saveUserName(userName: string | null): void {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.set({ userName });
    }
  }

  /**
   * 오늘의 목표 저장
   */
  static saveTodayFocus(focus: string): void {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.set({ todayFocus: focus });
    }
  }
}
