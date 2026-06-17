import React, { useEffect } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { TimePicker } from "../TimePicker";
import { LeaveTypeSelector } from "../WorkCheckButtons";

interface TimeEditModalProps {
  isOpen: boolean;
  date: string;
  checkIn: string;
  checkOut: string;
  isVacation: boolean;
  leaveType?: "none" | "annual" | "half";
  excludeLunch?: boolean;
  onClose: () => void;
  onSave: () => void;
  onCheckInChange: (checkIn: string) => void;
  onCheckOutChange: (checkOut: string) => void;
  onIsVacationChange: (isVacation: boolean) => void;
  onLeaveTypeChange?: (leaveType: "none" | "annual" | "half") => void;
  onExcludeLunchChange?: (v: boolean) => void;
}

export const TimeEditModal: React.FC<TimeEditModalProps> = ({
  isOpen,
  date,
  checkIn,
  checkOut,
  isVacation,
  leaveType = "none",
  onClose,
  onSave,
  onCheckInChange,
  onCheckOutChange,
  onIsVacationChange,
  onLeaveTypeChange,
  excludeLunch = false,
  onExcludeLunchChange,
}) => {
  const { t } = useTranslation();

  const currentLeaveType = leaveType !== "none" ? leaveType : isVacation ? "annual" : "none";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onSave();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onSave]);

  if (!isOpen) return null;

  const handleLeaveTypeChange = (newType: "none" | "annual" | "half") => {
    if (onLeaveTypeChange) onLeaveTypeChange(newType);
    onIsVacationChange(newType === "annual");
    if (newType === "annual") {
      onCheckInChange("");
      onCheckOutChange("");
    }
  };

  const showTimePickers = currentLeaveType === "none" || currentLeaveType === "half";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{t.work.edit}</h2>
        <div className="modal-date-display">{date}</div>

        {/* 근무 유형 선택 — 새 디자인 */}
        <div className="modal-section">
          <div className="modal-label" style={{ marginBottom: 10 }}>{t.work.selectLeaveType}</div>
          <LeaveTypeSelector value={currentLeaveType} onChange={handleLeaveTypeChange} />
        </div>

        {showTimePickers && (
          <>
            <TimePicker label={t.work.checkInTime} value={checkIn} onChange={onCheckInChange} />
            <TimePicker label={t.work.checkOutTime} value={checkOut} onChange={onCheckOutChange} />
            {currentLeaveType === "half" && (
              <button
                type="button"
                className={`tp-lunch-toggle${excludeLunch ? " active" : ""}`}
                onClick={() => onExcludeLunchChange?.(!excludeLunch)}
              >
                🍽️ 점심시간 1시간 제외 {excludeLunch ? "✓" : ""}
              </button>
            )}
            <div className="modal-hint">
              💡 {currentLeaveType === "half"
                ? (excludeLunch ? "반차 (점심 1시간 제외)" : t.work.halfDayLeaveNote)
                : t.work.lunchExcluded}
            </div>
          </>
        )}

        {currentLeaveType === "annual" && (
          <div className="modal-hint">💡 {t.work.annualLeaveNote}</div>
        )}

        <div className="modal-actions">
          <button className="modal-btn secondary" onClick={onClose}>
            {t.common.cancel} (ESC)
          </button>
          <button className="modal-btn primary" onClick={onSave}>
            {t.common.save} (Ctrl+Enter)
          </button>
        </div>
      </div>
    </div>
  );
};
