import React, { useEffect } from "react";
import { TimePicker } from "./TimePicker";

interface CheckInDrawerProps {
  isOpen: boolean;
  type: "in" | "out";
  time: string;
  leaveType: "none" | "annual" | "half";
  onTimeChange: (time: string) => void;
  onLeaveTypeChange: (leaveType: "none" | "annual" | "half") => void;
  onSave: () => void;
  onClose: () => void;
}

const LEAVE_ICONS = { none: "🏢", annual: "🌴", half: "🌤️" };
const LEAVE_LABELS = { none: "일반 근무", annual: "연차", half: "반차" };

export const CheckInDrawer: React.FC<CheckInDrawerProps> = ({
  isOpen,
  type,
  time,
  leaveType,
  onTimeChange,
  onLeaveTypeChange,
  onSave,
  onClose,
}) => {
  // ESC 닫기
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onSave();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, onSave]);

  if (!isOpen) return null;

  const isAnnual = leaveType === "annual";

  return (
    <>
      {/* 배경 딤 */}
      <div className="drawer-backdrop" onClick={onClose} />

      {/* 드로어 */}
      <div className="drawer">
        {/* 핸들 */}
        <div className="drawer-handle" />

        <div className="drawer-title">
          {type === "in" ? "🏢 출근 기록" : "🏠 퇴근 기록"}
        </div>

        {/* 출근일 때만 근무 유형 표시 */}
        {type === "in" && (
          <div className="drawer-section">
            <div className="drawer-section-label">근무 유형</div>
            <div className="drawer-leave-row">
              {(["none", "annual", "half"] as const).map((lt) => (
                <button
                  key={lt}
                  type="button"
                  className={`drawer-leave-btn${leaveType === lt ? " active" : ""}`}
                  onClick={() => onLeaveTypeChange(lt)}
                >
                  <span>{LEAVE_ICONS[lt]}</span>
                  <span>{LEAVE_LABELS[lt]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 연차면 시간 입력 불필요 */}
        {!isAnnual && (
          <div className="drawer-section">
            <TimePicker
              label={type === "in" ? "출근 시간" : "퇴근 시간"}
              value={time}
              onChange={onTimeChange}
            />
          </div>
        )}

        {isAnnual && (
          <div className="drawer-annual-note">💡 연차는 8시간으로 계산됩니다.</div>
        )}

        {/* 버튼 */}
        <div className="drawer-actions">
          <button type="button" className="drawer-btn secondary" onClick={onClose}>
            취소
          </button>
          <button type="button" className="drawer-btn primary" onClick={onSave}>
            {type === "in" ? "출근 기록" : "퇴근 기록"}
          </button>
        </div>
      </div>
    </>
  );
};
