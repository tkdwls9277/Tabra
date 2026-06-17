import React, { useCallback, useEffect, useState } from "react";
import { WeatherService } from "../services/weatherService";
import type { HourlyForecast } from "../types";
import { DEFAULT_LOCATION, getGeolocation } from "../utils/weather";

interface HourlyWeatherProps {
  apiKey?: string;
  unit?: "C" | "F";
}


export const HourlyWeather: React.FC<HourlyWeatherProps> = ({ apiKey, unit = "C" }) => {
  const [hourlyData, setHourlyData] = useState<HourlyForecast[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 온도 변환 (섭씨 ↔ 화씨)
   */
  const getTemperature = useCallback(
    (temp: number): number => {
      return unit === "C" ? temp : (temp * 9) / 5 + 32;
    },
    [unit]
  );

  /**
   * 시간별 날씨 로드
   */
  const loadHourlyWeather = useCallback(async () => {
    try {
      if (!apiKey || apiKey.trim() === "") {
        setError("no-api-key");
        setLoading(false);
        return;
      }

      // 캐시 확인
      const cached = WeatherService.getCachedHourlyForecast();
      if (cached && cached.length > 0) {
        console.log("[HourlyWeather] Using cached data");
        setHourlyData(cached);
        setLoading(false);
        return;
      }

      console.log("[HourlyWeather] Fetching new data...");

      let lat, lon;
      try {
        const position = await getGeolocation();
        lat = position.coords.latitude;
        lon = position.coords.longitude;
      } catch (geoErr) {
        console.warn("[HourlyWeather] Location access failed, using default (Seoul):", geoErr);
        lat = DEFAULT_LOCATION.lat;
        lon = DEFAULT_LOCATION.lon;
      }

      const data = await WeatherService.getHourlyForecast(lat, lon, apiKey);

      console.log("[HourlyWeather] Data loaded:", data);
      setHourlyData(data);
      WeatherService.cacheHourlyForecast(data);
      setError(null);
    } catch (err) {
      console.error("[HourlyWeather] Failed to load:", err);
      setError(err instanceof Error ? err.message : "Failed to load hourly weather");
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  // 초기 로드
  useEffect(() => {
    loadHourlyWeather();
  }, [loadHourlyWeather]);

  // API 키 변경 시 새로고침
  useEffect(() => {
    if (apiKey && apiKey.trim() !== "") {
      setLoading(true);
      WeatherService.clearHourlyCache();
      loadHourlyWeather();
    }
  }, [apiKey, loadHourlyWeather]);

  if (loading) {
    return (
      <div className="hourly-weather-container">
        <div className="hourly-weather-loading">⏳ 로딩 중...</div>
      </div>
    );
  }

  if (error === "no-api-key") {
    return null; // API 키 없으면 아무것도 표시하지 않음
  }

  if (error || !hourlyData || hourlyData.length === 0) {
    return null; // 에러 시 조용히 숨김
  }

  return (
    <div className="hourly-weather-container">
      <div className="hourly-weather-scroll">
        {hourlyData.map((hour, index) => (
          <div key={index} className="hourly-item">
            <div className="hourly-time">{hour.time}</div>
            <div className="hourly-icon">{hour.icon}</div>
            <div className="hourly-temp">
              {Math.round(getTemperature(hour.temp))}°{unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
