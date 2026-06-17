import type { WorkRecord } from "../types";

// 근무시간 계산 (분 단위)
export function calculateWorkMinutes(checkIn: string, checkOut: string, isHalfDay: boolean = false): number {
  const [inHour, inMin] = checkIn.split(":").map(Number);
  const [outHour, outMin] = checkOut.split(":").map(Number);

  const inMinutes = inHour * 60 + inMin;
  const outMinutes = outHour * 60 + outMin;

  const totalMinutes = outMinutes - inMinutes;

  // 반차인 경우 점심시간 제외하지 않음 (4시간 근무)
  if (isHalfDay) {
    return Math.max(0, totalMinutes);
  }

  // 일반 근무: 점심시간 1시간(60분) 제외
  return Math.max(0, totalMinutes - 60);
}

// WorkRecord에서 근무시간 계산 (leaveType 고려)
export function calculateRecordWorkMinutes(record: WorkRecord): number {
  // 연차: 8시간으로 계산
  if (record.leaveType === "annual" || (!record.leaveType && record.isVacation)) {
    return 8 * 60;
  }

  // 반차/일반: 출퇴근 시간 기반
  if (record.checkIn && record.checkOut) {
    const isHalf = record.leaveType === "half";
    const skipLunch = isHalf && !record.excludeLunch;
    return calculateWorkMinutes(record.checkIn, record.checkOut, skipLunch);
  }

  return 0;
}

// 시간 포맷 (분 -> "X시간 Y분")
export function formatWorkTime(minutes: number, hourText: string = "시간", minuteText: string = "분"): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}${hourText} ${mins}${minuteText}`;
}
