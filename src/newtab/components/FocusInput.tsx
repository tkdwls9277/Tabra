import React, { useState } from "react";
import { useTranslation } from "../hooks/useTranslation";

interface FocusInputProps {
  focus: string;
  focusInputValue: string;
  onFocusInputChange: (value: string) => void;
  onFocusKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocusBlur?: () => void;
}

export const FocusInput: React.FC<FocusInputProps> = ({
  focus,
  focusInputValue,
  onFocusInputChange,
  onFocusKeyDown,
  onFocusBlur,
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    onFocusInputChange(focus);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
    }
    onFocusKeyDown(e);
  };

  const handleBlur = () => {
    // 포커스가 빠질 때 항상 편집 모드 종료 및 저장
    if (onFocusBlur) {
      onFocusBlur();
    }
    setIsEditing(false);
  };

  return (
    <div className="app-focus">
      <div className="app-focus-label">{t.main.focusLabel}</div>
      {!focus || isEditing ? (
        <input
          className="app-focus-input"
          placeholder={t.main.focusPlaceholder}
          value={focusInputValue}
          onChange={(e) => onFocusInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          autoFocus={isEditing}
        />
      ) : (
        <div
          className="app-focus-display-container"
          onClick={handleEdit}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleEdit();
            }
          }}
        >
          <div className="app-focus-display">{focus}</div>
        </div>
      )}
    </div>
  );
};
