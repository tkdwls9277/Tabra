import React, { useCallback, useEffect, useState } from "react";
import { WeatherService } from "../services/weatherService";
import type { DailyForecast } from "../types";
import { DEFAULT_LOCATION, getGeolocation } from "../utils/weather";

interface WeeklyWeatherProps {
  apiKey: string;
  unit?: "C" | "F";
}


export const WeeklyWeather: React.FC<WeeklyWeatherProps> = ({ apiKey, unit = "C" }) => {
  const [forecast, setForecast] = useState<DailyForecast[] | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 일주일 날씨 로드
   */
  const loadWeeklyWeather = useCallback(async () => {
    try {
      if (!apiKey || apiKey.trim() === "") {
        setLoading(false);
        return;
      }

      // 캐시 확인
      const cached = WeatherService.getCachedForecast();
      if (cached && cached.length > 0) {
        console.log("[WeeklyWeather] Using cached forecast");
        setForecast(cached);
        setLoading(false);
        return;
      }

      console.log("[WeeklyWeather] Fetching new forecast data...");

      let lat, lon;
      try {
        // Geolocation API로 위치 가져오기
        const position = await getGeolocation();
        lat = position.coords.latitude;
        lon = position.coords.longitude;
      } catch (geoErr) {
        console.warn("[WeeklyWeather] Location access failed, using default (Seoul):", geoErr);
        lat = DEFAULT_LOCATION.lat;
        lon = DEFAULT_LOCATION.lon;
      }

      // 일주일 예보 API 호출
      const forecastData = await WeatherService.getWeeklyForecast(lat, lon, apiKey);

      console.log("[WeeklyWeather] Forecast data loaded:", forecastData);
      setForecast(forecastData);
      WeatherService.cacheForecast(forecastData);
    } catch (err) {
      console.error("[WeeklyWeather] Failed to load forecast:", err);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  /**
   * 온도 변환
   */
  const convertTemp = useCallback(
    (temp: number): number => {
      return unit === "C" ? temp : (temp * 9) / 5 + 32;
    },
    [unit]
  );

  // API 키 변경 시 날씨 재로드
  useEffect(() => {
    loadWeeklyWeather();
  }, [loadWeeklyWeather]);

  // API 키가 없으면 아무것도 표시하지 않음
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }

  if (loading) {
    return (
      <div className="weekly-weather-container">
        <div className="weekly-weather-loading">일주일 날씨 로딩 중...</div>
      </div>
    );
  }

  if (!forecast || forecast.length === 0) {
    return null;
  }

  return (
    <div className="weekly-weather-container">
      <div className="weekly-weather-scroll">
        {forecast.map((day, index) => (
          <div key={index} className="weekly-item">
            <div className="weekly-day">{day.dayOfWeek}</div>
            <div className="weekly-date">{day.date}</div>
            <div className="weekly-icon">{day.icon}</div>
            <div className="weekly-temp-max">{Math.round(convertTemp(day.tempMax))}°</div>
            <div className="weekly-temp-min">{Math.round(convertTemp(day.tempMin))}°</div>
          </div>
        ))}
      </div>
    </div>
  );
};
