import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { WorkRecord } from "../types/index";

/** 직접 입력 필드 */
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

/** 근무 유형 선택 (공유 컴포넌트) */
export const LeaveTypeSelector: React.FC<{
  value: "none" | "annual" | "half";
  onChange: (v: "none" | "annual" | "half") => void;
}> = ({ value, onChange }) => {
  const types = [
    { key: "none"   as const, icon: "🏢", label: "일반 근무" },
    { key: "annual" as const, icon: "🌴", label: "연차" },
    { key: "half"   as const, icon: "🌤️", label: "반차" },
  ];
  return (
    <div className="lt-selector">
      {types.map(({ key, icon, label }) => (
        <button
          key={key}
          type="button"
          className={`lt-btn${value === key ? " active" : ""}`}
          onClick={() => onChange(key)}
        >
          <span className="lt-icon">{icon}</span>
          <span className="lt-label">{label}</span>
        </button>
      ))}
    </div>
  );
};

interface WorkCheckButtonsProps {
  todayRecord: WorkRecord | undefined;
  onSave: (type: "in" | "out", time: string, leaveType: "none" | "annual" | "half", excludeLunch?: boolean) => void;
  translations: {
    checkInButton: string;
    checkInButtonRecorded: string;
    checkOutButton: string;
    checkOutButtonRecorded: string;
    todayWork: string;
    hour: string;
    minute: string;
    lunchExcluded: string;
  };
}

function getCurrentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function parseTime(value: string): { h24: number; m: number } {
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

export const WorkCheckButtons: React.FC<WorkCheckButtonsProps> = ({
  todayRecord,
  onSave,
  translations: t,
}) => {
  const [editType, setEditType] = useState<"in" | "out" | null>(null);
  const [leaveType, setLeaveType] = useState<"none" | "annual" | "half">("none");
  const [excludeLunch, setExcludeLunch] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, width: 0 });
  const inBtnRef = useRef<HTMLButtonElement>(null);
  const outBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const editValue = editType === "in" ? todayRecord?.checkIn : todayRecord?.checkOut;
  const { h24, m } = parseTime(editValue || getCurrentTime());
  const isPM = h24 >= 12;
  const h12 = to12h(h24);

  const calcPos = (btnRef: React.RefObject<HTMLButtonElement | null>) => {
    if (!btnRef.current) return;
    const parent = btnRef.current.closest(".work-check-buttons");
    const rect = parent?.getBoundingClientRect() || btnRef.current.getBoundingClientRect();
    const panelHeight = 380;
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow >= panelHeight
      ? rect.bottom + 6
      : rect.top - panelHeight - 6;
    setPanelPos({ top: Math.max(6, top), left: rect.left, width: rect.width });
  };

  useEffect(() => {
    if (!editType) return;
    const handle = (e: MouseEvent) => {
      if (
        panelRef.current?.contains(e.target as Node) ||
        inBtnRef.current?.contains(e.target as Node) ||
        outBtnRef.current?.contains(e.target as Node)
      ) return;
      setTimeout(() => setEditType(null), 0);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [editType]);

  const handleClick = (type: "in" | "out") => {
    const existing = type === "in" ? todayRecord?.checkIn : todayRecord?.checkOut;
    const curLt = todayRecord?.leaveType || "none";

    if (!existing && curLt !== "annual") {
      onSave(type, getCurrentTime(), curLt, todayRecord?.excludeLunch);
      return;
    }

    if (editType === type) {
      setEditType(null);
    } else {
      setLeaveType(curLt);
      setExcludeLunch(todayRecord?.excludeLunch || false);
      calcPos(type === "in" ? inBtnRef : outBtnRef);
      setEditType(type);
    }
  };

  const save = (time: string, lt?: "none" | "annual" | "half", el?: boolean) => {
    onSave(editType!, time, lt ?? leaveType, el ?? excludeLunch);
  };

  const pickHour = (hour: number) => {
    let h = hour;
    if (isPM && hour !== 12) h = hour + 12;
    if (!isPM && hour === 12) h = 0;
    save(toTimeString(h, m));
  };

  const pickMinute = (min: number) => {
    save(toTimeString(h24, min));
  };

  const pickAmPm = (pm: boolean) => {
    let h = h24;
    if (pm && h24 < 12) h = h24 + 12;
    else if (!pm && h24 >= 12) h = h24 - 12;
    save(toTimeString(h, m));
  };

  const pickNow = () => {
    save(getCurrentTime());
    setEditType(null);
  };

  const handleLeaveTypeChange = (lt: "none" | "annual" | "half") => {
    setLeaveType(lt);
    if (lt !== "half") setExcludeLunch(false);
    if (lt === "annual") {
      onSave(editType!, "", lt, false);
    } else {
      onSave(editType!, editValue || getCurrentTime(), lt, lt === "half" ? excludeLunch : false);
    }
  };

  const handleExcludeLunchToggle = () => {
    const next = !excludeLunch;
    setExcludeLunch(next);
    save(editValue || getCurrentTime(), undefined, next);
  };

  const calcWorkMin = (ci: string, co: string): number => {
    const [ih, im] = ci.split(":").map(Number);
    const [oh, om] = co.split(":").map(Number);
    const total = (oh * 60 + om) - (ih * 60 + im);
    const isHalf = todayRecord?.leaveType === "half";
    const skipLunch = isHalf && !todayRecord?.excludeLunch;
    return Math.max(0, skipLunch ? total : total - 60);
  };

  const fmtTime = (mins: number): string => {
    const h = Math.floor(mins / 60);
    const mm = mins % 60;
    if (h > 0 && mm > 0) return `${h}${t.hour} ${mm}${t.minute}`;
    if (h > 0) return `${h}${t.hour}`;
    return `${mm}${t.minute}`;
  };

  const hideTimePicker = editType === "in" && leaveType === "annual";

  return (
    <div className="work-check-container">
      <div className="work-check-buttons">
        <button
          ref={inBtnRef}
          className={`work-btn check-in${todayRecord?.checkIn ? " recorded" : ""}${editType === "in" ? " active-panel" : ""}`}
          onClick={() => handleClick("in")}
        >
          {todayRecord?.checkIn ? t.checkInButtonRecorded : t.checkInButton}
          {todayRecord?.checkIn && <span className="work-time-badge">{todayRecord.checkIn}</span>}
        </button>
        <button
          ref={outBtnRef}
          className={`work-btn check-out${todayRecord?.checkOut ? " recorded" : ""}${editType === "out" ? " active-panel" : ""}`}
          onClick={() => handleClick("out")}
        >
          {todayRecord?.checkOut ? t.checkOutButtonRecorded : t.checkOutButton}
          {todayRecord?.checkOut && <span className="work-time-badge">{todayRecord.checkOut}</span>}
        </button>
      </div>

      {/* 근무 유형 토글 — 항상 표시 */}
      <div className="work-leave-toggle">
        {([
          { key: "none"   as const, icon: "🏢", label: "일반" },
          { key: "annual" as const, icon: "🌴", label: "연차" },
          { key: "half"   as const, icon: "🌤️", label: "반차" },
        ]).map(({ key, icon, label }) => (
          <button
            key={key}
            type="button"
            className={`wlt-btn${(todayRecord?.leaveType || "none") === key ? " active" : ""}`}
            onClick={() => {
              const curTime = todayRecord?.checkIn || getCurrentTime();
              onSave("in", key === "annual" ? "" : curTime, key, key === "half" ? todayRecord?.excludeLunch : undefined);
            }}
          >
            <span className="wlt-icon">{icon}</span>
            <span className="wlt-label">{label}</span>
          </button>
        ))}
      </div>

      {editType && createPortal(
        <div ref={panelRef} className="tp-panel" style={{ top: panelPos.top, left: panelPos.left, width: panelPos.width }}>
          {/* 출근일 때 근무 유형 선택 */}
          {editType === "in" && (
            <LeaveTypeSelector value={leaveType} onChange={handleLeaveTypeChange} />
          )}

          {/* 연차가 아닌 경우 타임피커 */}
          {!hideTimePicker && (
            <>
              <div className="tp-top-row">
                <DirectInput h24={h24} m={m} onApply={(hh, mm) => save(toTimeString(hh, mm))} />
                <div className="tp-ampm-row">
                  <button type="button" className={`tp-ampm-btn${!isPM ? " active" : ""}`} onClick={() => pickAmPm(false)}>오전</button>
                  <button type="button" className={`tp-ampm-btn${isPM ? " active" : ""}`} onClick={() => pickAmPm(true)}>오후</button>
                </div>
              </div>
              <div className="tp-columns">
                <div className="tp-col">
                  <div className="tp-section-label">시</div>
                  <div className="tp-hour-grid">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map((h) => (
                      <button key={h} type="button" className={`tp-cell${h12 === h ? " active" : ""}`} onClick={() => pickHour(h)}>{h}</button>
                    ))}
                  </div>
                </div>
                <div className="tp-divider" />
                <div className="tp-col">
                  <div className="tp-section-label">분</div>
                  <div className="tp-min-grid">
                    {[0,5,10,15,20,25,30,35,40,45,50,55].map((min) => (
                      <button key={min} type="button" className={`tp-cell${m === min ? " active" : ""}`} onClick={() => pickMinute(min)}>{String(min).padStart(2, "0")}</button>
                    ))}
                  </div>
                  <div className="tp-fine-adjust">
                    <button type="button" className="tp-fine-btn" onClick={() => pickMinute((m - 1 + 60) % 60)}>−1</button>
                    <span className="tp-fine-value">{String(m).padStart(2, "0")}분</span>
                    <button type="button" className="tp-fine-btn" onClick={() => pickMinute((m + 1) % 60)}>+1</button>
                  </div>
                </div>
              </div>
              {/* 반차 점심 제외 토글 */}
              {leaveType === "half" && (
                <button type="button" className={`tp-lunch-toggle${excludeLunch ? " active" : ""}`} onClick={handleExcludeLunchToggle}>
                  🍽️ 점심시간 1시간 제외 {excludeLunch ? "✓" : ""}
                </button>
              )}
              <button type="button" className="tp-now-btn" onClick={pickNow}>현재 시간으로 설정</button>
            </>
          )}

          {/* 연차 안내 */}
          {hideTimePicker && (
            <div className="tp-annual-note">💡 연차는 8시간으로 계산됩니다.</div>
          )}
        </div>,
        document.body
      )}

      {todayRecord?.checkIn && todayRecord?.checkOut && (
        <div className="today-work-summary">
          {t.todayWork}: {fmtTime(calcWorkMin(todayRecord.checkIn, todayRecord.checkOut))}
          {todayRecord.leaveType !== "half" && ` (${t.lunchExcluded})`}
        </div>
      )}
    </div>
  );
};
