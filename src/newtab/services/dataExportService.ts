/**
 * 데이터 내보내기/가져오기 서비스
 */

interface ExportData {
  version: string;
  exportDate: string;
  data: {
    // 사용자 설정
    userName?: string | null;
    todayFocus?: string;

    // 데이터
    todos?: any[];
    favorites?: any[];
    workRecords?: any[];
    notifications?: any[];

    // 패널 열림/닫힘 상태
    favoritesOpen?: boolean;
    todosOpen?: boolean;
    workPanelOpen?: boolean;
    notificationPanelOpen?: boolean;

    // 패널 표시/숨김 설정
    showFavoritesPanel?: boolean;
    showTodosPanel?: boolean;
    showWorkPanel?: boolean;
    showNotificationPanel?: boolean;
  };
}

function isValidBackup(data: unknown): data is ExportData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (typeof d.version !== "string") return false;
  if (typeof d.exportDate !== "string") return false;
  if (!d.data || typeof d.data !== "object") return false;
  const inner = d.data as Record<string, unknown>;
  // 배열 필드들은 있다면 배열이어야 함
  for (const key of ["todos", "favorites", "workRecords", "notifications"] as const) {
    if (key in inner && !Array.isArray(inner[key])) return false;
  }
  return true;
}

export const dataExportService = {
  /**
   * 모든 데이터를 JSON 파일로 내보내기
   */
  async exportData(): Promise<void> {
    try {
      // Chrome storage에서 모든 데이터 가져오기
      const storageData = await chrome.storage.sync.get(null);

      // localStorage에서 알림 데이터 가져오기
      const notifications = localStorage.getItem("tabra-notifications");

      const exportData: ExportData = {
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        data: {
          ...storageData,
          notifications: notifications ? JSON.parse(notifications) : [],
        },
      };

      // JSON 문자열로 변환
      const jsonString = JSON.stringify(exportData, null, 2);

      // Blob 생성
      const blob = new Blob([jsonString], { type: "application/json" });

      // 다운로드 링크 생성
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tabra-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log("[DataExport] Data exported successfully");
    } catch (error) {
      console.error("[DataExport] Export failed:", error);
      throw error;
    }
  },

  /**
   * JSON 파일에서 데이터 가져오기
   */
  async importData(file: File): Promise<boolean> {
    try {
      // 파일 읽기
      const text = await file.text();
      const importData: ExportData = JSON.parse(text);

      if (!isValidBackup(importData)) {
        throw new Error("올바르지 않은 백업 파일 형식입니다.");
      }

      console.log("[DataExport] Importing data version:", importData.version);

      // Chrome storage에 데이터 저장
      const { notifications, ...chromeStorageData } = importData.data;
      await chrome.storage.sync.set(chromeStorageData);

      // localStorage에 알림 데이터 저장
      if (notifications && notifications.length > 0) {
        localStorage.setItem("tabra-notifications", JSON.stringify(notifications));
        // chrome.storage.local에도 동기화
        await chrome.storage.local.set({ "tabra-notifications": notifications });
      }

      console.log("[DataExport] Data imported successfully");
      return true;
    } catch (error) {
      console.error("[DataExport] Import failed:", error);
      throw error;
    }
  },

  /**
   * 데이터 미리보기 (import 전 확인용)
   */
  async previewImportData(file: File): Promise<{
    version: string;
    exportDate: string;
    userName?: string | null;
    todayFocus?: string;
    itemCounts: {
      favorites: number;
      todos: number;
      workRecords: number;
      notifications: number;
    };
    settings: {
      showFavoritesPanel: boolean;
      showTodosPanel: boolean;
      showWorkPanel: boolean;
      showNotificationPanel: boolean;
    };
  }> {
    try {
      const text = await file.text();
      const importData: ExportData = JSON.parse(text);

      return {
        version: importData.version,
        exportDate: importData.exportDate,
        userName: importData.data.userName,
        todayFocus: importData.data.todayFocus,
        itemCounts: {
          favorites: importData.data.favorites?.length || 0,
          todos: importData.data.todos?.length || 0,
          workRecords: importData.data.workRecords?.length || 0,
          notifications: importData.data.notifications?.length || 0,
        },
        settings: {
          showFavoritesPanel: importData.data.showFavoritesPanel ?? true,
          showTodosPanel: importData.data.showTodosPanel ?? true,
          showWorkPanel: importData.data.showWorkPanel ?? true,
          showNotificationPanel: importData.data.showNotificationPanel ?? true,
        },
      };
    } catch (error) {
      console.error("[DataExport] Preview failed:", error);
      throw error;
    }
  },
};
