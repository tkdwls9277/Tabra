import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { dataExportService } from "../../services/dataExportService";

interface OptionsModalProps {
  isOpen: boolean;
  userName: string;
  showFavorites: boolean;
  showTodos: boolean;
  showWork: boolean;
  showNotifications: boolean;
  showFocus: boolean;
  weatherApiKey: string;
  showWeeklyForecast: boolean;
  showHourlyForecast: boolean;
  weatherDraggable: boolean;
  showWeatherPanel: boolean;
  onClose: () => void;
  onUserNameChange: (userName: string) => void;
  onShowFavoritesChange: (show: boolean) => void;
  onShowTodosChange: (show: boolean) => void;
  onShowWorkChange: (show: boolean) => void;
  onShowNotificationsChange: (show: boolean) => void;
  onShowFocusChange: (show: boolean) => void;
  onWeatherApiKeyChange: (key: string) => void;
  onShowWeeklyForecastChange: (show: boolean) => void;
  onShowHourlyForecastChange: (show: boolean) => void;
  onWeatherDraggableChange: (draggable: boolean) => void;
  onShowWeatherPanelChange: (show: boolean) => void;
}

export const OptionsModal: React.FC<OptionsModalProps> = ({
  isOpen,
  userName,
  showFavorites,
  showTodos,
  showWork,
  showNotifications,
  showFocus,
  weatherApiKey,
  showWeeklyForecast,
  showHourlyForecast,
  weatherDraggable,
  showWeatherPanel,
  onClose,
  onUserNameChange,
  onShowFavoritesChange,
  onShowTodosChange,
  onShowWorkChange,
  onShowNotificationsChange,
  onShowFocusChange,
  onWeatherApiKeyChange,
  onShowWeeklyForecastChange,
  onShowHourlyForecastChange,
  onWeatherDraggableChange,
  onShowWeatherPanelChange,
}) => {
  const { t } = useTranslation();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await dataExportService.exportData();
      alert("✅ 데이터를 성공적으로 내보냈습니다!");
    } catch (error) {
      console.error("Export error:", error);
      alert("❌ 데이터 내보내기에 실패했습니다.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);

      // 미리보기 데이터 확인
      const preview = await dataExportService.previewImportData(file);

      const settingsSummary = [];
      if (preview.userName) settingsSummary.push(`사용자: ${preview.userName}`);
      if (preview.todayFocus) settingsSummary.push(`오늘의 목표: ${preview.todayFocus}`);

      const confirmMessage = `
다음 데이터를 가져오시겠습니까?

📅 백업 날짜: ${new Date(preview.exportDate).toLocaleString("ko-KR")}
${settingsSummary.length > 0 ? `\n⚙️ 설정:\n${settingsSummary.map((s) => `  • ${s}`).join("\n")}` : ""}

📊 데이터:
  • 즐겨찾기: ${preview.itemCounts.favorites}개
  • 할일: ${preview.itemCounts.todos}개
  • 근무기록: ${preview.itemCounts.workRecords}개
  • 알림: ${preview.itemCounts.notifications}개

🎛️ 패널 표시 설정:
  • 즐겨찾기: ${preview.settings.showFavoritesPanel ? "표시" : "숨김"}
  • 할일: ${preview.settings.showTodosPanel ? "표시" : "숨김"}
  • 근무기록: ${preview.settings.showWorkPanel ? "표시" : "숨김"}
  • 알림: ${preview.settings.showNotificationPanel ? "표시" : "숨김"}

⚠️ 현재 데이터는 모두 덮어씌워집니다!
      `.trim();

      if (!confirm(confirmMessage)) {
        event.target.value = ""; // 파일 선택 초기화
        return;
      }

      // 데이터 가져오기
      await dataExportService.importData(file);
      alert("✅ 데이터를 성공적으로 가져왔습니다!\n\n페이지를 새로고침합니다.");

      // 페이지 새로고침
      window.location.reload();
    } catch (error) {
      console.error("Import error:", error);
      alert("❌ 데이터 가져오기에 실패했습니다.\n파일 형식을 확인해주세요.");
    } finally {
      setIsImporting(false);
      event.target.value = ""; // 파일 선택 초기화
    }
  };

  // 모달이 열릴 때 이름 입력창에 포커스
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isOpen]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h2 className="modal-title">⚙️ {t.options.title}</h2>
        <label className="modal-label">
          {t.options.name}
          <input
            ref={nameInputRef}
            className="modal-input"
            type="text"
            value={userName}
            onChange={(e) => onUserNameChange(e.target.value)}
            placeholder={t.options.namePlaceholder}
          />
        </label>
        <div className="modal-hint">💡 {t.options.nameHint}</div>

        {/* 날씨 API 키 설정 */}
        <div style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "1rem" }}>
          <h3 style={{ fontSize: "0.95rem", marginBottom: "0.75rem", fontWeight: 600 }}>🌤️ 날씨 위젯 설정</h3>
          <label className="modal-label">
            OpenWeather API 키
            <input
              className="modal-input"
              type="password"
              value={weatherApiKey}
              onChange={(e) => onWeatherApiKeyChange(e.target.value)}
              placeholder="your_api_key_here"
            />
          </label>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginTop: "0.5rem" }}>
            💡 무료 API 키는{" "}
            <a
              href="https://openweathermap.org/api"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#60a5fa", textDecoration: "underline" }}
            >
              openweathermap.org
            </a>
            에서 발급받으세요.
            <br />
            ⚠️ API 키는 사용자의 브라우저에만 저장되며, 다른 곳으로 전송되지 않습니다.
          </div>

          {/* 일주일 날씨 예보 토글 스위치 */}
          <div className="toggle-switch-container" onClick={() => onShowWeeklyForecastChange(!showWeeklyForecast)}>
            <span className="toggle-switch-label">일주일 날씨 예보 표시</span>
            <div className={`toggle-switch ${showWeeklyForecast ? "active" : ""}`}>
              <div className="toggle-switch-slider" />
            </div>
          </div>

          {/* 시간별 날씨 예보 토글 스위치 */}
          <div className="toggle-switch-container" onClick={() => onShowHourlyForecastChange(!showHourlyForecast)}>
            <span className="toggle-switch-label">시간별 날씨 예보 표시</span>
            <div className={`toggle-switch ${showHourlyForecast ? "active" : ""}`}>
              <div className="toggle-switch-slider" />
            </div>
          </div>

          {/* 날씨 위젯 드래그 토글 스위치 */}
          <div className="toggle-switch-container" onClick={() => onWeatherDraggableChange(!weatherDraggable)}>
            <span className="toggle-switch-label">날씨 위젯 드래그 가능</span>
            <div className={`toggle-switch ${weatherDraggable ? "active" : ""}`}>
              <div className="toggle-switch-slider" />
            </div>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "1rem" }}>
          <h3 style={{ fontSize: "0.95rem", marginBottom: "0.75rem", fontWeight: 600 }}>{t.options.panelSettings}</h3>

          {/* 즐겨찾기 토글 */}
          <div
            className="toggle-switch-container"
            onClick={() => onShowFavoritesChange(!showFavorites)}
            style={{ marginBottom: "0.5rem" }}
          >
            <span className="toggle-switch-label">{t.options.showFavorites}</span>
            <div className={`toggle-switch ${showFavorites ? "active" : ""}`}>
              <div className="toggle-switch-slider" />
            </div>
          </div>

          {/* 할 일 토글 */}
          <div
            className="toggle-switch-container"
            onClick={() => onShowTodosChange(!showTodos)}
            style={{ marginBottom: "0.5rem" }}
          >
            <span className="toggle-switch-label">{t.options.showTodos}</span>
            <div className={`toggle-switch ${showTodos ? "active" : ""}`}>
              <div className="toggle-switch-slider" />
            </div>
          </div>

          {/* 출퇴근 토글 */}
          <div
            className="toggle-switch-container"
            onClick={() => onShowWorkChange(!showWork)}
            style={{ marginBottom: "0.5rem" }}
          >
            <span className="toggle-switch-label">{t.options.showWork}</span>
            <div className={`toggle-switch ${showWork ? "active" : ""}`}>
              <div className="toggle-switch-slider" />
            </div>
          </div>

          {/* 알림 토글 */}
          <div
            className="toggle-switch-container"
            onClick={() => onShowNotificationsChange(!showNotifications)}
            style={{ marginBottom: "0.5rem" }}
          >
            <span className="toggle-switch-label">{t.options.showNotifications}</span>
            <div className={`toggle-switch ${showNotifications ? "active" : ""}`}>
              <div className="toggle-switch-slider" />
            </div>
          </div>

          {/* 핵심 목표 토글 */}
          <div
            className="toggle-switch-container"
            onClick={() => onShowFocusChange(!showFocus)}
            style={{ marginBottom: "0.5rem" }}
          >
            <span className="toggle-switch-label">{t.options.showFocus}</span>
            <div className={`toggle-switch ${showFocus ? "active" : ""}`}>
              <div className="toggle-switch-slider" />
            </div>
          </div>

          {/* 날씨 표시 토글 */}
          <div className="toggle-switch-container" onClick={() => onShowWeatherPanelChange(!showWeatherPanel)}>
            <span className="toggle-switch-label">날씨 표시</span>
            <div className={`toggle-switch ${showWeatherPanel ? "active" : ""}`}>
              <div className="toggle-switch-slider" />
            </div>
          </div>
        </div>

        {/* 데이터 백업/복원 섹션 */}
        <div style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.2)", paddingTop: "1rem" }}>
          <h3 style={{ fontSize: "0.95rem", marginBottom: "0.75rem", fontWeight: 600 }}>💾 데이터 백업/복원</h3>
          <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column" }}>
            <button
              className="modal-btn secondary"
              onClick={handleExport}
              disabled={isExporting}
              style={{ width: "100%" }}
            >
              {isExporting ? "내보내는 중..." : "📤 데이터 내보내기 (Export)"}
            </button>
            <button
              className="modal-btn secondary"
              onClick={handleImportClick}
              disabled={isImporting}
              style={{ width: "100%" }}
            >
              {isImporting ? "가져오는 중..." : "📥 데이터 가져오기 (Import)"}
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
          </div>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", marginTop: "0.5rem" }}>
            💡 확장 재설치 시 데이터 손실을 방지하려면 주기적으로 백업하세요.
          </div>
        </div>

        {/* 닫기 버튼 */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <button className="modal-btn secondary" onClick={onClose}>
            {t.common.close || "닫기"} (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};
