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

const HF_API_KEY = import.meta.env.VITE_HF_API_KEY;
const HF_MODEL = "deepseek-ai/DeepSeek-V3.2-Exp";

function AIChat(): JSX.Element {
  const { chartData, refetch } = useIotData();
  const [aiResponse, setAiResponse] = useState(
    "Click 'Analyze' to get AI insights on IoT data."
  );
  const [loading, setLoading] = useState(false);

  // --- FRONTEND EMAIL ALERT FUNCTION ---
  const sendEmailAlert = async (subject: string, message: string) => {
    try {
      const params = {
        subject,
        message,
      };

      await emailjs.send(
        "service_tkttya7", // from EmailJS dashboard
        "template_hwh57wa", // from EmailJS dashboard
        params,
        "p-ka2jM3uNb5YWQMO" // from EmailJS dashboard
      );

      console.log("✅ Email alert sent successfully!");
    } catch (err) {
      console.error("❌ Failed to send email alert:", err);
    }
  };

  // ---- Core AI Analysis ----
  const analyzeWithHF = useCallback(async () => {
    if (!chartData || chartData.length === 0) {
      setAiResponse("No IoT data available to analyze.");
      return;
    }

    setLoading(true);
    setAiResponse("Analyzing last 30 IoT entries for sustained anomalies...");

    const recentData = chartData.slice(0, 30); // Analyze last 30 entries
    const summarizedData = recentData.map((d) => ({
      time: d.time,
      voltage: d.voltage,
      current: d.current,
      temperature: d.temperature,
      humidity: d.humidity,
      power: d.powerOutput,
    }));

    const latest = summarizedData[0];

    // --- IMPROVED ALERT CONDITIONS ---
    let alertTriggered = false;

    // Alert 1: Sustained current drop (0A for multiple readings)
    const zeroCurrentReadings = summarizedData
      .slice(0, 5) // Check last 5 readings
      .filter((d) => d.current === 0).length;

    if (zeroCurrentReadings >= 3) {
      // If 3 out of 5 readings show 0A
      await sendEmailAlert(
        "⚠️ Solar Alert: Sustained Current Drop",
        `Alert! Current dropped to 0A for ${zeroCurrentReadings} consecutive readings. Possible battery disconnection or system fault. Latest reading at ${latest.time}.`
      );
      alertTriggered = true;
    }

    // Alert 2: Sustained voltage drop (analyze trend over last 10 readings)
    const last10Readings = summarizedData.slice(0, 10);
    const voltageTrend = last10Readings.map((d) => d.voltage);
    const maxVoltage = Math.max(...voltageTrend);
    const minVoltage = Math.min(...voltageTrend);
    const voltageDrop = maxVoltage - minVoltage;

    // Check if voltage drop is sustained (not just a temporary dip)
    const lowVoltageReadings = last10Readings.filter(
      (d) => d.voltage < maxVoltage - 2
    ).length;

    if (voltageDrop >= 3) {
      // Sustained drop
      await sendEmailAlert(
        "⚠️ Solar Alert: Sustained Voltage Drop",
        `Voltage dropped by ${voltageDrop.toFixed(
          2
        )}V over last 10 readings. ${lowVoltageReadings} readings show significant drop. Possible battery issue or persistent shading.`
      );
      alertTriggered = true;
    }

    // Alert 3: Critical low voltage (sustained, not temporary)
    const criticalVoltageReadings = summarizedData
      .slice(0, 5) // Check last 5 readings
      .filter((d) => d.voltage < 3).length;

    if (criticalVoltageReadings >= 3) {
      // If 3 out of 5 readings are critical
      await sendEmailAlert(
        "🔴 CRITICAL: Sustained Low Voltage",
        `CRITICAL! Voltage below 3V for ${criticalVoltageReadings} consecutive readings. System at risk of shutdown. Check battery immediately! Latest: ${latest.voltage.toFixed(
          2
        )}V at ${latest.time}.`
      );
      alertTriggered = true;
    }

    // Alert 4: Gradual voltage decline over last 15 readings
    const last15Readings = summarizedData.slice(0, 15);
    if (last15Readings.length >= 10) {
      const firstHalfAvg =
        last15Readings.slice(0, 5).reduce((sum, d) => sum + d.voltage, 0) / 5;
      const secondHalfAvg =
        last15Readings.slice(-5).reduce((sum, d) => sum + d.voltage, 0) / 5;
      const gradualDrop = firstHalfAvg - secondHalfAvg;

      if (gradualDrop >= 2) {
        // Gradual decline of 2V or more
        await sendEmailAlert(
          "📉 Solar Alert: Gradual Voltage Decline",
          `Gradual voltage decline detected: dropped ${gradualDrop.toFixed(
            2
          )}V over last 15 readings. Possible battery draining faster than charging.`
        );
        alertTriggered = true;
      }
    }

    const prompt = `
You are an IoT system analyst for a solar power station.
Below are the last 30 readings of voltage (V), current (A), power (W), temperature (°C), and humidity (%).

Data:
${JSON.stringify(summarizedData, null, 2)}

Key patterns to analyze:
- Look for SUSTAINED voltage drops, not temporary fluctuations
- Check if low voltage readings persist across multiple data points
- Analyze if voltage recovers quickly after drops (healthy system)
- Look for gradual declining trends over 10+ readings
- Check correlation between temperature, sunlight, and voltage
- Focus on patterns that indicate real issues, not normal variations

Recent analysis:
${
  alertTriggered
    ? "ALERTS: Sustained anomalies detected requiring attention."
    : "No sustained anomalies detected."
}
- Voltage range in last 10 readings: ${minVoltage.toFixed(
      2
    )}V to ${maxVoltage.toFixed(2)}V
- Current zero readings in last 5: ${zeroCurrentReadings}
- Critical voltage readings in last 5: ${criticalVoltageReadings}

Reply with brief analysis (3-4 lines) focusing on sustained patterns only.
`;

    try {
      const response = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: HF_MODEL,
            provider: "novita",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 250,
            temperature: 0.6,
          }),
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const message = data?.choices?.[0]?.message?.content;
      setAiResponse(
        message || "✅ System stable. No sustained anomalies detected."
      );
    } catch (error) {
      console.error("Hugging Face API Error:", error);
      setAiResponse("⚠️ Fallback: Unable to reach AI model. Check your key.");
    } finally {
      setLoading(false);
    }
  }, [chartData]);

  return (
    <div className="p-6 flex justify-center">
      <Card className="max-w-3xl w-full bg-gradient-to-br from-blue-100/40 to-purple-100/40 shadow-lg border border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-700">
            <AlertCircle className="h-5 w-5" />
            <span>AI Trend Insights</span>
          </CardTitle>
          <CardDescription>
            Analyzes last 30 IoT readings for SUSTAINED anomalies. Alerts only
            trigger for persistent issues, not temporary fluctuations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`p-4 rounded-lg transition-all duration-300 min-h-[100px] flex items-center ${
              loading
                ? "bg-yellow-100/60 text-yellow-700 animate-pulse"
                : aiResponse.includes("⚠️") ||
                  aiResponse.includes("CRITICAL") ||
                  aiResponse.includes("ALERTS")
                ? "bg-red-100/70 text-red-800"
                : "bg-white/70 text-gray-900"
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing last 30 entries for sustained patterns...
              </div>
            ) : (
              aiResponse
            )}
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={() => {
                refetch();
                analyzeWithHF();
              }}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
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
