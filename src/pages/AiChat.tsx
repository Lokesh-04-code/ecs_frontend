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
        "template_o9h463x", // from EmailJS dashboard
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
    setAiResponse("Analyzing last 30–40 IoT entries with AI...");

    const recentData = chartData.slice(0, 40);
    const summarizedData = recentData.map((d) => ({
      time: d.time,
      voltage: d.voltage,
      current: d.current,
      temperature: d.temperature,
      humidity: d.humidity,
      power: d.powerOutput,
    }));

    const latest = summarizedData[0];
    const previous = summarizedData[1];
    const voltageDrop = previous ? previous.voltage - latest.voltage : 0;

    if (latest.current === 0) {
      await sendEmailAlert(
        "⚠️ Solar Alert: Current Dropped to 0A",
        `Alert! Current dropped to 0A at ${latest.time}. Possible battery disconnection or system fault.`
      );
    }

    if (voltageDrop >= 3) {
      await sendEmailAlert(
        "⚠️ Solar Alert: Voltage Drop Detected",
        `Voltage dropped by ${voltageDrop.toFixed(2)}V at ${
          latest.time
        }. Possible low battery or shading issue.`
      );
    }

    const prompt = `
You are an IoT system analyst for a solar power station.
Below are the last ${
      summarizedData.length
    } readings of voltage (V), current (A), power (W), temperature (°C), and humidity (%).

Data:
${JSON.stringify(summarizedData, null, 2)}

Rules:
- Normally, higher sunlight & temperature → slight voltage increase.
- If temperature high but voltage does not rise → check for dust/degradation.
- If current=0 and voltage<4 → battery low/disconnected.
- Detect sudden voltage/current drops.
- Reply briefly (max 5 lines).
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
            max_tokens: 300,
            temperature: 0.6,
          }),
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const message = data?.choices?.[0]?.message?.content;
      setAiResponse(message || "✅ System stable. No anomalies detected.");
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
            Analyze last 30–40 IoT readings for voltage/current drops or
            anomalies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`p-4 rounded-lg transition-all duration-300 min-h-[100px] flex items-center ${
              loading
                ? "bg-yellow-100/60 text-yellow-700 animate-pulse"
                : aiResponse.includes("⚠️")
                ? "bg-red-100/70 text-red-800"
                : "bg-white/70 text-gray-900"
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing with AI...
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
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AIChat;
