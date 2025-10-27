import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Image as ImageIcon, AlertTriangle, Clock } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface AlertData {
  image: string;
  timestamp: string;
}

const AlertsGallery: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = "https://ecs-backend-python.onrender.com/api/alerts"; // Flask backend URL

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get(API_URL);
        console.log("API Response:", res.data);

        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];

        // ✅ Sort by timestamp (newest first) and take latest 10
        const sorted = [...data]
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .slice(0, 10);

        setAlerts(sorted);
      } catch (err) {
        console.error("Error fetching alerts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" className="mx-auto text-primary" />
          <p className="text-muted-foreground">
            Fetching recent board touch alerts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center space-x-3">
        <AlertTriangle className="h-8 w-8 text-destructive animate-pulse" />
        <div>
          <h1 className="text-3xl font-bold gradient-text">
            Recent Board Touch Alerts
          </h1>
          <p className="text-muted-foreground">
            Showing the 10 most recent alerts (latest first)
          </p>
        </div>
      </div>

      {/* Alerts Grid */}
      {!Array.isArray(alerts) || alerts.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>No alerts captured yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((alert, i) => (
            <Card
              key={i}
              className="bg-gradient-card shadow-card hover:shadow-lg transition-all duration-300"
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  <span>Alert #{i + 1}</span>
                </CardTitle>
                <CardDescription>Captured snapshot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative w-full h-48 overflow-hidden rounded-xl">
                  <img
                    src={`data:image/jpeg;base64,${alert.image?.replace(
                      /^b'|^b"|"$|'$/g,
                      ""
                    )}`}
                    alt={`Alert ${i + 1}`}
                    className="object-cover w-full h-full transition-transform hover:scale-105"
                  />
                </div>

                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <b>Time:</b> {alert.timestamp}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsGallery;
