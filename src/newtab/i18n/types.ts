export type Locale = "en" | "ko" | "zh" | "ja";

export interface Translations {
  common: {
    add: string;
    edit: string;
    delete: string;
    cancel: string;
    save: string;
    close: string;
    confirm: string;
  };
  favorites: {
    title: string;
    add: string;
    edit: string;
    empty: string;
    labelPlaceholder: string;
    urlPlaceholder: string;
    iconPlaceholder: string;
    modalTitle: string;
    modalEditTitle: string;
  };
  todo: {
    title: string;
    add: string;
    placeholder: string;
    empty: string;
    filterAll: string;
    selectDate: string;
    clearDate: string;
    today: string;
    completed: string;
    remaining: string;
  };
  work: {
    title: string;
    checkIn: string;
    checkOut: string;
    recorded: string;
    totalHours: string;
    weekTotal: string;
    overtime: string;
    undertime: string;
    vacation: string;
    edit: string;
    checkInTime: string;
    checkOutTime: string;
    isVacation: string;
    vacationNote: string;
    hours: string;
    prevWeek: string;
    nextWeek: string;
    // App.tsx 출퇴근 버튼 관련
    checkInButton: string;
    checkOutButton: string;
    checkInButtonRecorded: string;
    checkOutButtonRecorded: string;
    todayWork: string;
    lunchExcluded: string;
    clickToEdit: string;
    clickToCheckIn: string;
    clickToCheckOut: string;
    rightClickToEdit: string;
    hour: string;
    minute: string;
    noRecord: string;
    leaveTypeNone: string;
    leaveTypeAnnual: string;
    leaveTypeHalf: string;
    annualLeave: string;
    halfDayLeave: string;
    annualLeaveNote: string;
    halfDayLeaveNote: string;
    selectLeaveType: string;
  };
  main: {
    greeting: {
      morning: string;
      afternoon: string;
      evening: string;
      night: string;
    };
    searchPlaceholder: string;
    focusLabel: string;
    focusPlaceholder: string;
  };
  options: {
    title: string;
    name: string;
    namePlaceholder: string;
    nameHint: string;
    panelSettings: string;
    showFavorites: string;
    showTodos: string;
    showWork: string;
    showNotifications: string;
    showFocus: string;
    settings: string;
  };
}
