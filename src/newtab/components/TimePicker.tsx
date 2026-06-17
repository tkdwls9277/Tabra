import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  defaultOpen?: boolean;
}

function getCurrentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function parseTime(value: string): { h24: number; m: number } {
  if (!value) {
    const now = new Date();
    return { h24: now.getHours(), m: now.getMinutes() };
  }
  const [h, m] = value.split(":").map(Number);
  return { h24: h, m };
}

function toTimeString(h24: number, m: number): string {
  return `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function to12h(h24: number): number {
  if (h24 === 0) return 12;
  if (h24 > 12) return h24 - 12;
  return h24;
}

/** 직접 입력 가능한 시:분 필드 */
const DirectInput: React.FC<{ h24: number; m: number; onApply: (h: number, m: number) => void }> = ({ h24, m, onApply }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const open = () => {
    setDraft(`${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commit = () => {
    const cleaned = draft.replace(/[^0-9:]/g, "");
    let hh: number, mm: number;
    if (cleaned.includes(":")) {
      [hh, mm] = cleaned.split(":").map(Number);
    } else if (cleaned.length <= 2) {
      hh = Number(cleaned); mm = 0;
    } else {
      hh = Number(cleaned.slice(0, -2)); mm = Number(cleaned.slice(-2));
    }
    if (!isNaN(hh) && !isNaN(mm)) {
      onApply(Math.min(23, Math.max(0, hh)), Math.min(59, Math.max(0, mm)));
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="tp-direct-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
        placeholder="HH:MM"
        maxLength={5}
        autoFocus
      />
    );
  }

  return (
    <button type="button" className="tp-direct-display" onClick={open} title="클릭하여 직접 입력">
      {String(h24).padStart(2, "0")}<span className="tp-direct-sep">:</span>{String(m).padStart(2, "0")}
    </button>
  );
};

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, label, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // defaultOpen이면 마운트 직후 위치 계산
  useEffect(() => {
    if (defaultOpen) calcPosition();
  }, []);

  // 패널 위치 계산 — 아래 공간 부족 시 위로
  const calcPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const panelHeight = 380;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow >= panelHeight
      ? rect.bottom + 6
      : rect.top - panelHeight - 6;
    setPanelPos({ top: Math.max(6, top), left: rect.left, width: rect.width });
  };

  const handleOpen = () => {
    if (!value) onChange(getCurrentTime());
    calcPosition();
    setIsOpen((p) => !p);
  };

  // 외부 클릭 닫기 (지연: DirectInput의 onBlur commit이 먼저 실행되도록)
  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        panelRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      ) return;
      setTimeout(() => setIsOpen(false), 0);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  // 스크롤/리사이즈 시 닫기
  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [isOpen]);

  const { h24, m } = parseTime(value || getCurrentTime());
  const isPM = h24 >= 12;
  const h12 = to12h(h24);

  const setHour = (hour: number) => {
    let h = hour;
    if (isPM && hour !== 12) h = hour + 12;
    if (!isPM && hour === 12) h = 0;
    onChange(toTimeString(h, m));
  };

  const setAmPm = (pm: boolean) => {
    let h = h24;
    if (pm && h24 < 12) h = h24 + 12;
    else if (!pm && h24 >= 12) h = h24 - 12;
    onChange(toTimeString(h, m));
  };

  const displayAmPm = value ? (isPM ? "오후" : "오전") : "--";
  const displayH = value ? String(h12).padStart(2, "0") : "--";
  const displayM = value ? String(m).padStart(2, "0") : "--";

  const panel = isOpen
    ? createPortal(
        <div
          ref={panelRef}
          className="tp-panel"
          style={{ top: panelPos.top, left: panelPos.left, width: panelPos.width }}
        >
          {/* 직접 입력 + 오전/오후 */}
          <div className="tp-top-row">
            <DirectInput h24={h24} m={m} onApply={(h, min) => onChange(toTimeString(h, min))} />
            <div className="tp-ampm-row">
              <button type="button" className={`tp-ampm-btn${!isPM ? " active" : ""}`} onClick={() => setAmPm(false)}>오전</button>
              <button type="button" className={`tp-ampm-btn${isPM ? " active" : ""}`} onClick={() => setAmPm(true)}>오후</button>
            </div>
          </div>

          {/* 시/분 2열 */}
          <div className="tp-columns">
            <div className="tp-col">
              <div className="tp-section-label">시</div>
              <div className="tp-hour-grid">
                {[1,2,3,4,5,6,7,8,9,10,11,12].map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={`tp-cell${h12 === h && value ? " active" : ""}`}
                    onClick={() => setHour(h)}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <div className="tp-divider" />
            <div className="tp-col">
              <div className="tp-section-label">분</div>
              <div className="tp-min-grid">
                {[0,5,10,15,20,25,30,35,40,45,50,55].map((min) => (
                  <button
                    key={min}
                    type="button"
                    className={`tp-cell${m === min && value ? " active" : ""}`}
                    onClick={() => onChange(toTimeString(h24, min))}
                  >
                    {String(min).padStart(2, "0")}
                  </button>
                ))}
              </div>
              <div className="tp-fine-adjust">
                <button type="button" className="tp-fine-btn" onClick={() => onChange(toTimeString(h24, (m - 1 + 60) % 60))}>−1</button>
                <span className="tp-fine-value">{String(m).padStart(2, "0")}분</span>
                <button type="button" className="tp-fine-btn" onClick={() => onChange(toTimeString(h24, (m + 1) % 60))}>+1</button>
              </div>
            </div>
          </div>

          {/* 현재 시간 */}
          <button
            type="button"
            className="tp-now-btn"
            onClick={() => { onChange(getCurrentTime()); setIsOpen(false); }}
          >
            현재 시간으로 설정
          </button>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="tp-wrapper">
      <div className="tp-label">{label}</div>
      <button
        ref={triggerRef}
        className={`tp-display${isOpen ? " open" : ""}${!value ? " empty" : ""}`}
        onClick={handleOpen}
        type="button"
      >
        <span className={`tp-badge${isPM && value ? " pm" : ""}`}>{displayAmPm}</span>
        <span className="tp-time-text">
          {displayH}<span className="tp-sep">:</span>{displayM}
        </span>
        <span className="tp-edit-hint">수정</span>
      </button>
      {panel}
    </div>
  );
};
