import React, { useState, useEffect, useCallback } from "react";

export interface IoTDataPoint {
  created_at: string;
  entry_id: number;
  field1: string; // Current (mA)
  field2: string; // Voltage (V)
  field3: string; // Temperature (°C)
  field4: string; // Humidity (%)
  field5: string; // Lighting (Lux)
}

export interface IoTResponse {
  channel: {
    id: number;
    name: string;
    description: string;
    field1: string;
    field2: string;
    field3: string;
    field4: string;
    field5: string;
    last_entry_id: number;
  };
  feeds: IoTDataPoint[];
}

export interface ProcessedSensorData {
  current: number; // A
  voltage: number; // V
  temperature: number; // °C
  humidity: number; // %
  radiation: number; // W/m² (converted from Lux)
  timestamp: string;
  powerOutput: number; // W
}

const THINGSPEAK_API_URL =
  "https://api.thingspeak.com/channels/3054959/feeds.json?api_key=Q598Z948DH3KQH7C&results=20";

export const useIotData = () => {
  const [data, setData] = useState<IoTResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(THINGSPEAK_API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: IoTResponse = await response.json();
      console.log(result);
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching IoT data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ✅ Conversion constants
  const LUX_TO_W_PER_M2 = 1 / 120; // Approx. 1 W/m² ≈ 120 lux

  // ✅ Process latest sensor values
  const getLatestValues = (): ProcessedSensorData | null => {
    if (!data || !data.feeds.length) return null;

    const latest = data.feeds[data.feeds.length - 1];
    const currentA = (parseFloat(latest.field1) || 0) / 1000; // mA → A
    const voltage = parseFloat(latest.field2) || 0;
    const lightingLux = parseFloat(latest.field5) || 0;

    const radiation = lightingLux * LUX_TO_W_PER_M2; // Lux → W/m²
    const powerOutput = voltage * currentA; // W

    return {
      current: currentA,
      voltage,
      temperature: parseFloat(latest.field3) || 0,
      humidity: parseFloat(latest.field4) || 0,
      radiation,
      timestamp: latest.created_at,
      powerOutput,
    };
  };

  // ✅ Process chart data
  const getChartData = () => {
    if (!data || !data.feeds.length) return [];

    return (
      data.feeds
        // sort by newest first (optional)
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .map((feed, index) => {
          const currentA = (parseFloat(feed.field1) || 0) / 1000; // mA → A
          const voltage = parseFloat(feed.field2) || 0;
          const lightingLux = parseFloat(feed.field5) || 0;

          const radiation = lightingLux * LUX_TO_W_PER_M2; // W/m²
          const powerOutput = voltage * currentA; // W

          return {
            index: index + 1,
            time: new Date(feed.created_at).toLocaleTimeString(),
            timestamp: feed.created_at,
            current: currentA,
            voltage,
            temperature: parseFloat(feed.field3) || 0,
            humidity: parseFloat(feed.field4) || 0,
            radiation,
            powerOutput,
          };
        })
    );
  };

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: fetchData,
    latestValues: getLatestValues(),
    chartData: getChartData(),
  };
};
