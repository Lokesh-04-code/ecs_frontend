
import React, { useState, useCallback } from "react";
import { useIotData } from "../hooks/useIotData";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import emailjs from "emailjs-com";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = "openai/gpt-oss-20b";

function AIChat(): JSX.Element {
  const { chartData, refetch } = useIotData();

  const [aiResponse, setAiResponse] = useState(
    "Click 'Analyze Trends' to get AI insights on IoT data."
  );
  const [loading, setLoading] = useState(false);

  const sendEmailAlert = async (
    subject: string,
    message: string
  ): Promise<void> => {
    try {
      await emailjs.send(
        "service_tkttya7",
        "template_hwh57wa",
        { subject, message },
        "p-ka2jM3uNb5YWQMO"
      );

      console.log("Email alert sent successfully.");
    } catch (error) {
      console.error("Failed to send email alert:", error);
    }
  };

  const analyzeWithGroq = useCallback(async () => {
    if (!chartData || chartData.length === 0) {
      setAiResponse("No IoT data available to analyze.");
      return;
    }

    if (!GROQ_API_KEY) {
      setAiResponse(
        "Groq configuration error: VITE_GROQ_API_KEY is missing from .env. Restart the development server after adding it."
      );
      return;
    }

    setLoading(true);
    setAiResponse("Analyzing recent IoT readings...");

    try {
      // Assumes chartData is ordered newest first.
      const recentData = chartData.slice(0, 30);

      const summarizedData = recentData.map((d) => ({
        time: d.time,
        voltage: Number(d.voltage),
        current: Number(d.current),
        temperature: Number(d.temperature),
        humidity: Number(d.humidity),
        power: Number(d.powerOutput),
      }));

      const latest = summarizedData[0];
      const last5 = summarizedData.slice(0, 5);

      // Alert 1: Zero current in at least 3 of the last 5 readings.
      const zeroCurrentReadings = last5.filter(
        (d) => d.current === 0
      ).length;

      // Alert 2: Significant voltage variation over the last 10 readings.
      const last10Readings = summarizedData.slice(0, 10);
      const voltageValues = last10Readings.map((d) => d.voltage);
      const maxVoltage = Math.max(...voltageValues);
      const minVoltage = Math.min(...voltageValues);
      const voltageDrop = maxVoltage - minVoltage;

      const lowVoltageReadings = last10Readings.filter(
        (d) => d.voltage < maxVoltage - 2
      ).length;

      // Alert 3: Voltage below 3V in at least 3 of the last 5 readings.
      const criticalVoltageReadings = last5.filter(
        (d) => d.voltage < 3
      ).length;

      // Alert 4: Gradual voltage decline across the selected readings.
      const last15Readings = summarizedData.slice(0, 15);
      let gradualDrop = 0;

      if (last15Readings.length >= 10) {
        const firstFive = last15Readings.slice(0, 5);
        const lastFive = last15Readings.slice(-5);

        const firstAverage =
          firstFive.reduce((sum, d) => sum + d.voltage, 0) /
          firstFive.length;

        const lastAverage =
          lastFive.reduce((sum, d) => sum + d.voltage, 0) /
          lastFive.length;

        gradualDrop = firstAverage - lastAverage;
      }

      let alertTriggered = false;

      if (zeroCurrentReadings >= 3) {
        alertTriggered = true;

        await sendEmailAlert(
          "Solar Alert: Sustained Current Drop",
          `Current was 0A in ${zeroCurrentReadings} of the last 5 readings. Latest reading: ${latest.time}.`
        );
      }

      if (last10Readings.length >= 10 && voltageDrop >= 3) {
        alertTriggered = true;

        await sendEmailAlert(
          "Solar Alert: Sustained Voltage Variation",
          `Voltage range over the last 10 readings: ${minVoltage.toFixed(
            2
          )}V to ${maxVoltage.toFixed(
            2
          )}V. ${lowVoltageReadings} readings were more than 2V below the maximum.`
        );
      }

      if (criticalVoltageReadings >= 3) {
        alertTriggered = true;

        await sendEmailAlert(
          "CRITICAL: Sustained Low Voltage",
          `Voltage was below 3V in ${criticalVoltageReadings} of the last 5 readings. Latest: ${latest.voltage.toFixed(
            2
          )}V at ${latest.time}.`
        );
      }

      if (last15Readings.length >= 10 && gradualDrop >= 2) {
        alertTriggered = true;

        await sendEmailAlert(
          "Solar Alert: Gradual Voltage Decline",
          `Average voltage declined by ${gradualDrop.toFixed(
            2
          )}V across the selected readings.`
        );
      }

      const prompt = `
You are an IoT analyst for a solar power station.

Analyze these recent readings:
${JSON.stringify(summarizedData, null, 2)}

Alert checks:
- Zero current readings among the last five: ${zeroCurrentReadings}
- Voltage below 3V among the last five: ${criticalVoltageReadings}
- Voltage range among the last ten: ${minVoltage.toFixed(
        2
      )}V to ${maxVoltage.toFixed(2)}V
- Voltage variation: ${voltageDrop.toFixed(2)}V
- Gradual voltage decline: ${gradualDrop.toFixed(2)}V
- Rule-based alerts triggered: ${alertTriggered}

Identify sustained trends, possible anomalies, and whether more
measurements are needed. Do not claim a fault from a single reading.
Voltage thresholds depend on the actual system design.
Reply in 3-4 concise lines.
`;

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            max_completion_tokens: 400,
            temperature: 0.4,
          }),
        }
      );

      if (!response.ok) {
        const details = await response.text();

        throw new Error(
          `Groq HTTP ${response.status}: ${details.slice(0, 500)}`
        );
      }

      const data = await response.json();
      const message = data?.choices?.[0]?.message?.content;

      if (typeof message !== "string" || !message.trim()) {
        throw new Error("Groq returned no analysis.");
      }

      setAiResponse(message.trim());
    } catch (error) {
      console.error("Groq API Error:", error);

      setAiResponse(
        error instanceof Error
          ? `AI analysis failed: ${error.message}`
          : "AI analysis failed. Check the browser console."
      );
    } finally {
      setLoading(false);
    }
  }, [chartData]);

  const handleAnalyze = async () => {
    // Analyze currently loaded data to avoid using stale data after refetch.
    await analyzeWithGroq();
  };

  return (
    <div className="p-6 flex justify-center">
      <Card className="max-w-3xl w-full bg-gradient-to-br from-blue-100/40 to-purple-100/40 shadow-lg border border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-700">
            <AlertCircle className="h-5 w-5" />
            <span>AI Trend Insights</span>
          </CardTitle>

          <CardDescription>
            Analyzes recent IoT readings for sustained anomalies.
            Email alerts use configured thresholds that may need
            adjustment for your solar system.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div
            role="status"
            aria-live="polite"
            className={`p-4 rounded-lg transition-all duration-300 min-h-[100px] flex items-center ${
              loading
                ? "bg-yellow-100/60 text-yellow-700 animate-pulse"
                : aiResponse.toLowerCase().includes("failed") ||
                    aiResponse.toLowerCase().includes("error") ||
                    aiResponse.includes("CRITICAL") ||
                    aiResponse.includes("ALERTS")
                  ? "bg-red-100/70 text-red-800"
                  : "bg-white/70 text-gray-900"
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing recent readings...
              </div>
            ) : (
              aiResponse
            )}
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleAnalyze}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  loading ? "animate-spin" : ""
                }`}
              />
              Analyze Trends
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AIChat;
