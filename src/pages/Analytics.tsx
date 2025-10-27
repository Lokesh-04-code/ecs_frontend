import React from "react";
import { useIotData } from "../hooks/useIotData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LoadingSpinner from "../components/ui/loading-spinner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { BarChart3, TrendingUp, Activity, Sun } from "lucide-react";

const Analytics: React.FC = () => {
  const { chartData, loading, latestValues } = useIotData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" className="mx-auto text-primary" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  const getAverage = (key: string) => {
    if (!chartData.length) return 0;
    const sum = chartData.reduce(
      (acc, item) => acc + ((item[key as keyof typeof item] as number) || 0),
      0
    );
    return (sum / chartData.length).toFixed(2);
  };

  const getMinMax = (key: string) => {
    if (!chartData.length) return { min: 0, max: 0 };
    const values = chartData.map(
      (item) => (item[key as keyof typeof item] as number) || 0
    );
    return {
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
    };
  };

  // ✅ Updated metrics to match dashboard data structure
  const metrics = [
    {
      key: "current",
      name: "Current",
      unit: "A",
      color: "hsl(var(--primary))",
    },
    {
      key: "voltage",
      name: "Voltage",
      unit: "V",
      color: "hsl(var(--success))",
    },
    {
      key: "powerOutput",
      name: "Power Output",
      unit: "W",
      color: "hsl(var(--primary))",
    },
    {
      key: "temperature",
      name: "Temperature",
      unit: "°C",
      color: "hsl(var(--warning))",
    },
    {
      key: "humidity",
      name: "Humidity",
      unit: "%",
      color: "hsl(var(--secondary))",
    },
    {
      key: "radiation", // ✅ Changed from "lighting" to "radiation" to match dashboard
      name: "Solar Radiation",
      unit: "W/m²",
      color: "hsl(var(--accent))",
    },
  ];

  // Debug: Check if radiation data exists
  console.log("Analytics Chart data sample:", chartData.slice(0, 3));
  console.log(
    "Radiation values:",
    chartData.map((item) => item.radiation).filter(Boolean)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <BarChart3 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold gradient-text">
            Advanced Analytics
          </h1>
          <p className="text-muted-foreground">
            Detailed solar and environmental data analysis
          </p>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chartData.length}</div>
            <p className="text-xs text-muted-foreground">
              Active sensor readings
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Power Output
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getAverage("powerOutput")} W
            </div>
            <p className="text-xs text-muted-foreground">
              Over {chartData.length} readings
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Radiation
            </CardTitle>
            <Sun className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {(latestValues?.radiation || 0).toFixed(2)} W/m²
            </div>
            <p className="text-xs text-muted-foreground">
              Solar radiation intensity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Combined Trend Chart */}
      <Card className="bg-gradient-card shadow-elevated">
        <CardHeader>
          <CardTitle>Multi-Parameter Trend Analysis</CardTitle>
          <CardDescription>
            Compare solar and environmental parameters over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                {metrics.map((metric) => (
                  <Line
                    key={metric.key}
                    type="monotone"
                    dataKey={metric.key}
                    stroke={metric.color}
                    strokeWidth={2}
                    dot={false}
                    name={`${metric.name} (${metric.unit})`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Individual Metric Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {metrics.map((metric) => {
          const minMax = getMinMax(metric.key);
          const hasData = chartData.some(
            (item) =>
              item[metric.key as keyof typeof item] !== undefined &&
              item[metric.key as keyof typeof item] !== null
          );

          return (
            <Card key={metric.key} className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">
                  {metric.name} Analysis
                  {!hasData && (
                    <span className="text-sm text-muted-foreground ml-2">
                      (No data available)
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Statistical overview and visualization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Average:</span>
                    <div className="font-bold">
                      {getAverage(metric.key)} {metric.unit}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Min:</span>
                    <div className="font-bold">
                      {minMax.min} {metric.unit}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max:</span>
                    <div className="font-bold">
                      {minMax.max} {metric.unit}
                    </div>
                  </div>
                </div>

                <div className="h-48">
                  {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" fontSize={10} />
                        <YAxis fontSize={10} />
                        <Tooltip
                          formatter={(value: number) => [
                            `${value} ${metric.unit}`,
                            metric.name,
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey={metric.key}
                          stroke={metric.color}
                          fill={metric.color}
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <Sun className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No {metric.name.toLowerCase()} data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Analytics;
