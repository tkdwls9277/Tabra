export type NotificationTiming =
  | "at-time" // 정시
  | "5min-before" // 5분 전
  | "10min-before" // 10분 전
  | "30min-before" // 30분 전
  | "1hour-before" // 1시간 전
  | "1day-before"; // 1일 전

export type NotificationRepeat = "none" | "daily" | "weekly" | "monthly" | "yearly";

export interface Notification {
  id: string;
  title: string;
  description?: string;
  targetDateTime: string; // ISO 8601 format
  timings: NotificationTiming[]; // 여러 알림 시간 설정 가능
  repeat?: NotificationRepeat; // 반복 설정 (없으면 'none')
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationAlert {
  notificationId: string;
  title: string;
  description?: string;
  timing: NotificationTiming;
  alertTime: string; // 실제 알림이 울릴 시간
}
