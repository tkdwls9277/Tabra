import React, { useEffect, useRef } from "react";
import { useTranslation } from "../../hooks/useTranslation";

interface FavoriteModalProps {
  isOpen: boolean;
  isEditing: boolean;
  label: string;
  url: string;
  icon: string;
  onClose: () => void;
  onSubmit: () => void;
  onLabelChange: (label: string) => void;
  onUrlChange: (url: string) => void;
  onIconChange: (icon: string) => void;
}

export const FavoriteModal: React.FC<FavoriteModalProps> = ({
  isOpen,
  isEditing,
  label,
  url,
  icon,
  onClose,
  onSubmit,
  onLabelChange,
  onUrlChange,
  onIconChange,
}) => {
  const { t } = useTranslation();
  const firstInputRef = useRef<HTMLInputElement>(null);

  // 모달이 열릴 때 첫 번째 입력창에 포커스
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isOpen]);

  // ESC 키로 닫기, Enter 키로 저장
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        // Ctrl+Enter 또는 Cmd+Enter로 저장
        onSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onSubmit]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <h2 className="modal-title">{isEditing ? t.favorites.modalEditTitle : t.favorites.modalTitle}</h2>
        <label className="modal-label">
          {t.favorites.labelPlaceholder}
          <input
            ref={firstInputRef}
            className="modal-input"
            placeholder={t.favorites.labelPlaceholder}
            value={label}
            onChange={(e) => onLabelChange(e.target.value)}
          />
        </label>
        <label className="modal-label">
          {t.favorites.urlPlaceholder}
          <input
            className="modal-input"
            placeholder={t.favorites.urlPlaceholder}
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
          />
        </label>
        <label className="modal-label">
          {t.favorites.iconPlaceholder}
          <input
            className="modal-input"
            placeholder={t.favorites.iconPlaceholder}
            value={icon}
            onChange={(e) => onIconChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
          />
        </label>
        <div className="modal-hint">💡 {t.favorites.iconPlaceholder}</div>
        <div className="modal-actions">
          <button className="modal-btn secondary" onClick={onClose}>
            {t.common.cancel} (ESC)
          </button>
          <button className="modal-btn primary" onClick={onSubmit}>
            {t.common.save} (Ctrl+Enter)
          </button>
        </div>
      </div>
    </div>
  );
};
