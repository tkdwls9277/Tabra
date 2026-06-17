export const GRADIENTS: string[] = [
  "linear-gradient(135deg, #1c1b29, #3b4a6b)",
  "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
  "linear-gradient(135deg, #42275a, #734b6d)",
  "linear-gradient(135deg, #355c7d, #6c5b7b, #c06c84)",
  "linear-gradient(135deg, #232526, #414345)",
];

export const isChromeExtensionEnv = typeof chrome !== "undefined" && !!chrome.storage?.sync;

export const DEFAULT_CHECK_IN_TIME = "10:30";
export const DEFAULT_CHECK_OUT_TIME = "19:30";
export const WORK_HOURS_PER_DAY = 8;
export const WORK_HOURS_PER_WEEK = 40;
export const LUNCH_BREAK_MINUTES = 60;

export const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];
