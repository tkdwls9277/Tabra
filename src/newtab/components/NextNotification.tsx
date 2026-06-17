import { useEffect, useState } from "react";
import { notificationService } from "../services/notificationService";
import type { NotificationAlert } from "../types/notification";

export function NextNotification() {
  const [nextAlert, setNextAlert] = useState<NotificationAlert | null>(null);
  const [timeText, setTimeText] = useState("");

  const loadNextAlert = () => {
    const alert = notificationService.getNextAlert();
    setNextAlert(alert);
    if (alert) {
      setTimeText(notificationService.getTimeUntilText(alert.alertTime));
    }
  };

  useEffect(() => {
    loadNextAlert();

    // 10초마다 업데이트
    const interval = setInterval(() => {
      loadNextAlert();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!nextAlert) {
    return null; // 다음 알림이 없으면 표시 안 함
  }

  return (
    <div className="next-notification">
      <div className="next-notification-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>
      <div className="next-notification-content">
        <div className="next-notification-title">{nextAlert.title}</div>
        <div className="next-notification-info">
          <span className="next-notification-time">{notificationService.formatDateTime(nextAlert.alertTime)}</span>
          <span className="next-notification-timing">{notificationService.getTimingText(nextAlert.timing)}</span>
          <span className="next-notification-countdown">{timeText}</span>
        </div>
      </div>
    </div>
  );
}
