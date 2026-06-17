import React from "react";
import type { WeatherData } from "../types";
import { HourlyWeather } from "./HourlyWeather";
import { Weather } from "./Weather";
import { WeeklyWeather } from "./WeeklyWeather";

interface WeatherPanelProps {
  isCollapsed: boolean;
  weatherApiKey: string;
  showWeeklyForecast: boolean;
  showHourlyForecast: boolean;
  weatherDraggable: boolean;
  unit: "C" | "F";
  onUnitToggle: () => void;
  onToggle: () => void;
  onSettingsClick: () => void;
  onWeatherDataUpdate?: (data: WeatherData | null) => void;
}

export const WeatherPanel: React.FC<WeatherPanelProps> = ({
  isCollapsed,
  weatherApiKey,
  showWeeklyForecast,
  showHourlyForecast,
  weatherDraggable,
  unit,
  onUnitToggle,
  onToggle,
  onSettingsClick,
  onWeatherDataUpdate,
}) => {
  return (
    <div className={`weather-panel panel ${isCollapsed ? "collapsed" : "open"}`}>
      <div className="panel-header" onClick={onToggle}>
        <h3 className="panel-title">🌤️ 날씨</h3>
        <button className="panel-toggle-btn">{isCollapsed ? "▶" : "◀"}</button>
      </div>

      {isCollapsed && (
        <div className="collapsed-indicator">
          <span className="vertical-text">🌤️ 날씨</span>
        </div>
      )}

      {!isCollapsed && (
        <div className="weather-panel-content">
          <div className="weather-panel-current">
            <Weather
              compact={false}
              apiKey={weatherApiKey}
              unit={unit}
              onUnitToggle={onUnitToggle}
              draggable={weatherDraggable}
              onSettingsClick={onSettingsClick}
              onWeatherDataUpdate={onWeatherDataUpdate}
            />
          </div>

          {showHourlyForecast && (
            <div className="weather-panel-section">
              <h4 className="weather-section-title">시간별 예보</h4>
              <HourlyWeather apiKey={weatherApiKey} unit={unit} />
            </div>
          )}

          {showWeeklyForecast && (
            <div className="weather-panel-section">
              <h4 className="weather-section-title">주간 예보</h4>
              <WeeklyWeather apiKey={weatherApiKey} unit={unit} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
