// Background script for handling alarms and notifications

// 이미 표시된 알림을 추적 (중복 방지)
const shownNotifications = new Set<string>();

// 1분마다 알림 체크
chrome.alarms.create("checkNotifications", { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkNotifications") {
    console.log("[Background] Alarm triggered, checking notifications...");
    checkAndTriggerNotifications();
  }
});

function checkAndTriggerNotifications() {
  // chrome.storage.local에서 알림 데이터 가져오기
  chrome.storage.local.get(["tabra-notifications"], (result) => {
    const notifications = (result["tabra-notifications"] || []) as any[];
    const now = new Date();

    console.log("[Background] Found notifications:", notifications.length);
    console.log("[Background] Current time:", now.toLocaleString("ko-KR"));

    if (notifications.length === 0) {
      console.log("[Background] No notifications to check");
      return;
    }

    notifications.forEach((notification: any) => {
      if (!notification.isEnabled) {
        console.log("[Background] Skipping disabled notification:", notification.title);
        return;
      }

      notification.timings.forEach((timing: string) => {
        const TIMING_MINUTES: Record<string, number> = {
          "at-time": 0, "5min-before": 5, "10min-before": 10,
          "30min-before": 30, "1hour-before": 60, "1day-before": 1440,
        };
        const minutesBefore = TIMING_MINUTES[timing] || 0;
        const referenceTime = new Date(now.getTime() - 30_000 + minutesBefore * 60_000);
        const effectiveDT = notification.repeat && notification.repeat !== "none"
          ? getNextOccurrence(notification.targetDateTime, notification.repeat, referenceTime).toISOString()
          : notification.targetDateTime;
        const alertTime = calculateAlertTime(effectiveDT, timing);
        const timeDiff = alertTime.getTime() - now.getTime();

        console.log(`[Background] Checking ${notification.title} (${timing}):`, {
          alertTime: alertTime.toLocaleString("ko-KR"),
          timeDiff: Math.round(timeDiff / 1000) + "s",
        });

        const notificationId = `${notification.id}-${timing}-${alertTime.getTime()}`;

        // 이미 표시한 알림이면 스킵
        if (shownNotifications.has(notificationId)) {
          return;
        }

        // -30초 ~ +30초 범위 내면 알림 트리거 (약간의 여유)
        if (timeDiff > -30 * 1000 && timeDiff < 30 * 1000) {
          console.log("[Background] Triggering notification:", notification.title);
          showNotification(notification, timing);
          shownNotifications.add(notificationId);

          // 1시간 후 기록 삭제 (메모리 관리)
          setTimeout(() => {
            shownNotifications.delete(notificationId);
          }, 60 * 60 * 1000);
        }
      });
    });
  });
}

function calculateAlertTime(targetDateTime: string, timing: string): Date {
  const TIMING_MINUTES: Record<string, number> = {
    "at-time": 0,
    "5min-before": 5,
    "10min-before": 10,
    "30min-before": 30,
    "1hour-before": 60,
    "1day-before": 1440,
  };

  const targetDate = new Date(targetDateTime);
  const minutesBefore = TIMING_MINUTES[timing] || 0;
  return new Date(targetDate.getTime() - minutesBefore * 60 * 1000);
}

function getNextOccurrence(targetDateTime: string, repeat: string | undefined, referenceTime: Date): Date {
  const base = new Date(targetDateTime);
  if (!repeat || repeat === "none") return base;

  const candidate = new Date(base);

  if (repeat === "daily") {
    candidate.setFullYear(referenceTime.getFullYear(), referenceTime.getMonth(), referenceTime.getDate());
    if (candidate.getTime() <= referenceTime.getTime()) {
      candidate.setDate(candidate.getDate() + 1);
    }
  } else if (repeat === "weekly") {
    const targetDay = base.getDay();
    candidate.setFullYear(referenceTime.getFullYear(), referenceTime.getMonth(), referenceTime.getDate());
    const daysUntilNext = (targetDay - referenceTime.getDay() + 7) % 7;
    candidate.setDate(candidate.getDate() + daysUntilNext);
    if (daysUntilNext === 0 && candidate.getTime() <= referenceTime.getTime()) {
      candidate.setDate(candidate.getDate() + 7);
    }
  } else if (repeat === "monthly") {
    candidate.setFullYear(referenceTime.getFullYear(), referenceTime.getMonth(), base.getDate());
    if (candidate.getTime() <= referenceTime.getTime()) {
      candidate.setMonth(candidate.getMonth() + 1);
    }
  } else if (repeat === "yearly") {
    candidate.setFullYear(referenceTime.getFullYear());
    if (candidate.getTime() <= referenceTime.getTime()) {
      candidate.setFullYear(candidate.getFullYear() + 1);
    }
  }

  return candidate;
}

function showNotification(notification: any, timing: string) {
  const timingTexts: Record<string, string> = {
    "at-time": "정시",
    "5min-before": "5분 전",
    "10min-before": "10분 전",
    "30min-before": "30분 전",
    "1hour-before": "1시간 전",
    "1day-before": "1일 전",
  };

  const timingText = timingTexts[timing] || "";
  const targetDate = new Date(notification.targetDateTime);
  const dateText = `${targetDate.getMonth() + 1}월 ${targetDate.getDate()}일 ${targetDate
    .getHours()
    .toString()
    .padStart(2, "0")}:${targetDate.getMinutes().toString().padStart(2, "0")}`;

  const notificationId = `notif-${Date.now()}`;

  console.log("[Background] Creating notification:", {
    id: notificationId,
    title: notification.title,
    timing: timingText,
    dateText,
  });

  chrome.notifications.create(
    notificationId,
    {
      type: "basic",
      iconUrl: chrome.runtime.getURL("icons/icon128.png"),
      title: notification.title,
      message: notification.description
        ? `${notification.description}\n${dateText} (${timingText})`
        : `${dateText} (${timingText})`,
      priority: 2,
      requireInteraction: true, // 사용자가 닫을 때까지 유지
    },
    (notificationId) => {
      if (chrome.runtime.lastError) {
        console.error("[Background] Notification error:", chrome.runtime.lastError);
      } else {
        console.log("[Background] Notification created successfully:", notificationId);
      }
    }
  );
}

// 설치 시 초기 알람 설정
chrome.runtime.onInstalled.addListener(() => {
  console.log("[Background] Extension installed, setting up alarms...");
  chrome.alarms.create("checkNotifications", { periodInMinutes: 1 });
});

// chrome.storage.local 변경 감지
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local" && changes["tabra-notifications"]) {
    console.log("[Background] Notifications data changed, checking immediately...");
    // 알림 데이터가 변경되면 즉시 체크
    checkAndTriggerNotifications();
  }
});

// 확장 프로그램 시작 시 로그만 출력
console.log("[Background] Service worker started");

// 메시지 리스너 (newtab에서 테스트 알림 요청 받기)
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log("[Background] Received message:", message);
  if (message.action === "showTestNotification") {
    sendResponse({ success: true });
  }
  return true;
});
