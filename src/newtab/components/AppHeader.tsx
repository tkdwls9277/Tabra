import React from "react";
import type { WeatherData, WorkRecord } from "../types/index";
import { FocusInput } from "./FocusInput";
import { NextNotification } from "./NextNotification";
import { WorkCheckButtons } from "./WorkCheckButtons";

interface AppHeaderProps {
  time: string;
  greeting: string;
  focus: string;
  focusInputValue: string;
  todayRecord: WorkRecord | undefined;
  showWorkPanel: boolean;
  showNotificationPanel: boolean;
  showFocusSection: boolean;
  showWeatherPanel: boolean;
  weatherData: WeatherData | null;
  onFocusInputChange: (value: string) => void;
  onFocusKeyDown: React.KeyboardEventHandler<HTMLInputElement>;
  onFocusBlur: () => void;
  onWorkSave: (type: "in" | "out", time: string, leaveType: "none" | "annual" | "half") => void;
  workTranslations: {
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

export const AppHeader: React.FC<AppHeaderProps> = ({
  time,
  greeting,
  focus,
  focusInputValue,
  todayRecord,
  showWorkPanel,
  showNotificationPanel,
  showFocusSection,
  showWeatherPanel,
  weatherData,
  onFocusInputChange,
  onFocusKeyDown,
  onFocusBlur,
  onWorkSave,
  workTranslations,
}) => {
  return (
    <div className="app-top">
      <div className="time-weather-row">
        <div className="app-time">{time}</div>
        {showWeatherPanel && weatherData && (
          <div className="header-weather">
            <span className="header-weather-icon">{weatherData.icon}</span>
            <span className="header-weather-temp">{Math.round(weatherData.temp)}°</span>
          </div>
        )}
      </div>

      <div className="app-greeting">{greeting}</div>

      {showFocusSection && (
        <FocusInput
          focus={focus}
          focusInputValue={focusInputValue}
          onFocusInputChange={onFocusInputChange}
          onFocusKeyDown={onFocusKeyDown}
          onFocusBlur={onFocusBlur}
        />
      )}

      {showNotificationPanel && <NextNotification />}

      {showWorkPanel && (
        <WorkCheckButtons
          todayRecord={todayRecord}
          onSave={onWorkSave}
          translations={workTranslations}
        />
      )}
    </div>
  );
};
