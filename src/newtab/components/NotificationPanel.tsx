import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { notificationService } from "../services/notificationService";
import type { Notification, NotificationRepeat, NotificationTiming } from "../types/notification";

interface NotificationPanelProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function NotificationPanel({ isCollapsed, onToggle }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [isVerticalScreen, setIsVerticalScreen] = useState(window.innerHeight > window.innerWidth);
  const [showAllNotifications, setShowAllNotifications] = useState(false); // 전체보기 상태

  // 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      setIsVerticalScreen(window.innerHeight > window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // localStorage를 chrome.storage.local에 동기화
  const syncToStorage = () => {
    const data = notificationService.getAll();
    chrome.storage.local.set({ "tabra-notifications": data });
    console.log("[NotificationPanel] Synced to chrome.storage:", data.length, "notifications");
  };

  const loadNotifications = () => {
    setNotifications(notificationService.getAll());
  };

  useEffect(() => {
    loadNotifications();
    // 초기 로드 시에도 동기화
    syncToStorage();
  }, []);

  const handleAdd = () => {
    setEditingNotification(null);
    setIsModalOpen(true);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 전파 방지
    handleAdd();
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 전파 방지
    onToggle();
  };

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("이 알림을 삭제하시겠습니까?")) {
      notificationService.delete(id);
      loadNotifications();
      syncToStorage();
    }
  };

  const handleToggle = (id: string) => {
    notificationService.toggle(id);
    loadNotifications();
    syncToStorage();
  };

  const handleSave = (data: Omit<Notification, "id" | "createdAt" | "updatedAt">) => {
    if (editingNotification) {
      notificationService.update(editingNotification.id, data);
    } else {
      notificationService.add(data);
    }
    loadNotifications();
    setIsModalOpen(false);
    syncToStorage();
  };

  if (isCollapsed) {
    return (
      <div className="notification-panel collapsed">
        <div className="panel-header" onClick={onToggle} style={{ cursor: "pointer" }}>
          <span className="panel-title">📢 알림</span>
          <button className="panel-toggle-btn" onClick={handleToggleClick} aria-label="알림 expand">
            {isVerticalScreen ? "▼" : "◀"}
          </button>
        </div>
        <div className="collapsed-indicator" onClick={onToggle} style={{ cursor: "pointer" }}>
          <span className="vertical-text">📢 알림</span>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-panel open">
      <div className="panel-header" onClick={onToggle} style={{ cursor: "pointer" }}>
        <span className="panel-title">📢 알림</span>
        <button className="panel-icon-btn" onClick={handleAddClick} title="알림 추가">
          +
        </button>
        <button className="panel-toggle-btn" onClick={handleToggleClick} aria-label="알림 collapse">
          {isVerticalScreen ? "▲" : "▶"}
        </button>
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <p>설정된 알림이 없습니다</p>
            <button onClick={handleAdd} className="add-first-btn">
              첫 알림 추가하기
            </button>
          </div>
        ) : (
          <>
            {(() => {
              const now = new Date();
              const isUpcoming = (n: Notification) =>
                (n.repeat && n.repeat !== "none") || new Date(n.targetDateTime) >= now;
              const upcomingNotifications = notifications.filter(isUpcoming);
              const pastNotifications = notifications.filter((n) => !isUpcoming(n));
              const displayNotifications = showAllNotifications ? notifications : upcomingNotifications;

              return (
                <>
                  {displayNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onEdit={() => handleEdit(notification)}
                      onDelete={() => handleDelete(notification.id)}
                      onToggle={() => handleToggle(notification.id)}
                    />
                  ))}

                  {pastNotifications.length > 0 && (
                    <div className="notification-view-toggle">
                      <button
                        className="view-toggle-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAllNotifications(!showAllNotifications);
                        }}
                      >
                        {showAllNotifications ? (
                          <>▲ 지나간 알림 숨기기 ({pastNotifications.length}개)</>
                        ) : (
                          <>▼ 지나간 알림 보기 ({pastNotifications.length}개)</>
                        )}
                      </button>
                    </div>
                  )}

                  {displayNotifications.length === 0 && !showAllNotifications && (
                    <div className="empty-state">
                      <p>예정된 알림이 없습니다</p>
                      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", marginTop: "8px" }}>
                        {pastNotifications.length}개의 지나간 알림이 있습니다
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </>
        )}
      </div>

      {isModalOpen &&
        createPortal(
          <NotificationModal
            notification={editingNotification}
            onSave={handleSave}
            onClose={() => setIsModalOpen(false)}
          />,
          document.body
        )}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}

function NotificationItem({ notification, onEdit, onDelete, onToggle }: NotificationItemProps) {
  const isRepeating = notification.repeat && notification.repeat !== "none";
  const displayDT = isRepeating
    ? notificationService.getNextOccurrence(notification.targetDateTime, notification.repeat).toISOString()
    : notification.targetDateTime;
  const isPast = !isRepeating && new Date(notification.targetDateTime) < new Date();

  return (
    <div className={`notification-item ${!notification.isEnabled ? "disabled" : ""} ${isPast ? "past" : ""}`}>
      <div className="notification-item-header">
        <input type="checkbox" checked={notification.isEnabled} onChange={onToggle} className="notification-toggle" />
        <h4 className="notification-item-title">{notification.title}</h4>
        <div className="notification-item-actions">
          <button onClick={onEdit} className="notification-edit-btn" title="수정">
            ✏️
          </button>
          <button onClick={onDelete} className="notification-delete-btn" title="삭제">
            🗑️
          </button>
        </div>
      </div>

      {notification.description && <p className="notification-item-description">{notification.description}</p>}

      <div className="notification-item-datetime">
        📅 {notificationService.formatDateTime(displayDT)}
        {isPast && <span className="past-badge">지남</span>}
      </div>

      <div className="notification-item-timings">
        {isRepeating && (
          <span className="repeat-badge">
            🔁 {notificationService.getRepeatText(notification.repeat)}
          </span>
        )}
        {notification.timings.map((timing) => (
          <span key={timing} className="timing-badge">
            {notificationService.getTimingText(timing)}
          </span>
        ))}
      </div>
    </div>
  );
}

interface NotificationModalProps {
  notification: Notification | null;
  onSave: (data: Omit<Notification, "id" | "createdAt" | "updatedAt">) => void;
  onClose: () => void;
}

function NotificationModal({ notification, onSave, onClose }: NotificationModalProps) {
  const [title, setTitle] = useState(notification?.title || "");
  const [description, setDescription] = useState(notification?.description || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedTimings, setSelectedTimings] = useState<NotificationTiming[]>(notification?.timings || ["at-time"]);
  const [repeat, setRepeat] = useState<NotificationRepeat>(notification?.repeat || "none");

  useEffect(() => {
    if (notification) {
      const targetDate = new Date(notification.targetDateTime);
      const year = targetDate.getFullYear();
      const month = (targetDate.getMonth() + 1).toString().padStart(2, "0");
      const day = targetDate.getDate().toString().padStart(2, "0");
      const hours = targetDate.getHours().toString().padStart(2, "0");
      const minutes = targetDate.getMinutes().toString().padStart(2, "0");

      setDate(`${year}-${month}-${day}`);
      setTime(`${hours}:${minutes}`);
    } else {
      // 기본값: 오늘 + 1시간 후
      const now = new Date();
      now.setHours(now.getHours() + 1);
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, "0");
      const day = now.getDate().toString().padStart(2, "0");
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");

      setDate(`${year}-${month}-${day}`);
      setTime(`${hours}:${minutes}`);
    }
  }, [notification]);

  const handleTimingToggle = (timing: NotificationTiming) => {
    setSelectedTimings((prev) => (prev.includes(timing) ? prev.filter((t) => t !== timing) : [...prev, timing]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("제목을 입력해주세요");
      return;
    }

    if (selectedTimings.length === 0) {
      alert("알림 시간을 하나 이상 선택해주세요");
      return;
    }

    const targetDateTime = new Date(`${date}T${time}`).toISOString();

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      targetDateTime,
      timings: selectedTimings,
      repeat,
      isEnabled: true,
    });
  };

  const allTimings: NotificationTiming[] = [
    "at-time",
    "5min-before",
    "10min-before",
    "30min-before",
    "1hour-before",
    "1day-before",
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal notification-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{notification ? "알림 수정" : "새 알림 추가"}</h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="notification-form">
          <div className="modal-label">
            <label htmlFor="notif-title">제목 *</label>
            <input
              id="notif-title"
              type="text"
              className="modal-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="알림 제목을 입력하세요"
              required
            />
          </div>

          <div className="modal-label">
            <label htmlFor="notif-desc">설명 (선택)</label>
            <textarea
              id="notif-desc"
              className="modal-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="추가 설명을 입력하세요"
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="modal-label">
              <label htmlFor="notif-date">날짜 *</label>
              <input
                id="notif-date"
                type="date"
                className="modal-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="modal-label">
              <label htmlFor="notif-time">시간 *</label>
              <input
                id="notif-time"
                type="time"
                className="modal-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="modal-label">
            <label>반복</label>
            <div className="repeat-options">
              {(["none", "daily", "weekly", "monthly", "yearly"] as const).map((opt) => {
                const labels: Record<NotificationRepeat, string> = {
                  none: "반복 없음",
                  daily: "매일",
                  weekly: "매주",
                  monthly: "매월",
                  yearly: "매년",
                };
                return (
                  <label key={opt} className={`repeat-option ${repeat === opt ? "selected" : ""}`}>
                    <input
                      type="radio"
                      name="repeat"
                      checked={repeat === opt}
                      onChange={() => setRepeat(opt)}
                    />
                    <span>{labels[opt]}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="modal-label">
            <label>알림 시간 * (복수 선택 가능)</label>
            <div className="timing-options">
              {allTimings.map((timing) => (
                <label key={timing} className="timing-option">
                  <input
                    type="checkbox"
                    checked={selectedTimings.includes(timing)}
                    onChange={() => handleTimingToggle(timing)}
                  />
                  <span>{notificationService.getTimingText(timing)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="modal-btn secondary">
              취소
            </button>
            <button type="submit" className="modal-btn primary">
              {notification ? "수정" : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
