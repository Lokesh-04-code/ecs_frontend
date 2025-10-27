import React, { useState, useMemo } from "react";
import { useIotData } from "../hooks/useIotData";
import SensorCard from "../components/ui/sensor-card";
import LoadingSpinner from "../components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
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
import {
  Zap,
  Battery,
  Thermometer,
  Droplets,
  Lightbulb,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data,
    loading,
    error,
    lastUpdated,
    refetch,
    latestValues,
    chartData,
  } = useIotData();

  // Calculate voltage statistics for battery graph
  const voltageStats = useMemo(() => {
    if (chartData.length === 0)
      return { max: 0, min: 0, maxIndex: 0, minIndex: 0 };

    let max = chartData[0].voltage;
    let min = chartData[0].voltage;
    let maxIndex = 0;
    let minIndex = 0;

    chartData.forEach((data, index) => {
      if (data.voltage > max) {
        max = data.voltage;
        maxIndex = index;
      }
      if (data.voltage < min) {
        min = data.voltage;
        minIndex = index;
      }
    });

    return { max, min, maxIndex, minIndex };
  }, [chartData]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Latest sensor data has been loaded.",
    });
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" className="mx-auto text-primary" />
          <p className="text-muted-foreground">Loading IoT sensor data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>Connection Error</span>
            </CardTitle>
            <CardDescription>
              Failed to load sensor data: {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleManualRefresh} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sensors = [
    {
      title: "Current",
      value: latestValues?.current || 0,
      unit: "A",
      icon: Zap,
      color: "primary" as const,
    },
    {
      title: "Voltage",
      value: latestValues?.voltage || 0,
      unit: "V",
      icon: Battery,
      color: "success" as const,
    },
    {
      title: "Power Output",
      value: latestValues?.powerOutput || 0,
      unit: "W",
      icon: Zap,
      color: "primary" as const,
    },
    {
      title: "Temperature",
      value: latestValues?.temperature || 0,
      unit: "°C",
      icon: Thermometer,
      color: "warning" as const,
    },
    {
      title: "Humidity",
      value: latestValues?.humidity || 0,
      unit: "%",
      icon: Droplets,
      color: "secondary" as const,
    },
    {
      title: "Solar Radiation",
      value: latestValues?.radiation || 0,
      unit: "W/m²",
      icon: Lightbulb,
      color: "primary" as const,
    },
  ];

  const chartConfigs = [
    {
      key: "current",
      name: "Current",
      color: "hsl(var(--primary))",
      unit: "A",
    },
    {
      key: "voltage",
      name: "Voltage",
      color: "hsl(var(--success))",
      unit: "V",
    },
    {
      key: "powerOutput",
      name: "Power Output",
      color: "hsl(var(--primary))",
      unit: "W",
    },
    {
      key: "temperature",
      name: "Temperature",
      color: "hsl(var(--warning))",
      unit: "°C",
    },
    {
      key: "humidity",
      name: "Humidity",
      color: "hsl(var(--secondary))",
      unit: "%",
    },
    {
      key: "radiation",
      name: "Solar Radiation",
      color: "hsl(var(--accent))",
      unit: "W/m²",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold gradient-text">IoT Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time sensor monitoring and analytics
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {lastUpdated && (
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            )}
          </div>
          <Button
            onClick={handleManualRefresh}
            disabled={refreshing}
            size="sm"
            variant="outline"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {sensors.map((sensor) => (
          <SensorCard
            key={sensor.title}
            title={sensor.title}
            value={sensor.value}
            unit={sensor.unit}
            icon={sensor.icon}
            color={sensor.color}
          />
        ))}
      </div>

      {/* Battery Voltage Monitoring */}
      <Card className="bg-gradient-card shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Battery className="h-5 w-5 text-primary" />
            <span>Battery Voltage Monitoring</span>
          </CardTitle>
          <CardDescription>
            Real-time voltage tracking with min/max indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Voltage Stats */}
            <div className="flex justify-around p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-success">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Max Voltage</span>
                </div>
                <div className="text-2xl font-bold text-success">
                  {voltageStats.max.toFixed(2)} V
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-destructive">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-medium">Min Voltage</span>
                </div>
                <div className="text-2xl font-bold text-destructive">
                  {voltageStats.min.toFixed(2)} V
                </div>
              </div>
            </div>

            {/* Voltage Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="time"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    label={{
                      value: "Voltage (V)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "hsl(var(--muted-foreground))" },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                    formatter={(value: number) => [`${value} V`, "Voltage"]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="voltage"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={(props: { cx: number; cy: number; index: number }) => {
                      const { cx, cy, index } = props;
                      if (index === voltageStats.maxIndex) {
                        return (
                          <g>
                            <circle
                              cx={cx}
                              cy={cy}
                              r={6}
                              fill="hsl(var(--success))"
                              stroke="white"
                              strokeWidth={2}
                            />
                            <text
                              x={cx}
                              y={cy - 12}
                              textAnchor="middle"
                              fill="hsl(var(--success))"
                              fontSize={12}
                              fontWeight="bold"
                            >
                              Max
                            </text>
                          </g>
                        );
                      }
                      if (index === voltageStats.minIndex) {
                        return (
                          <g>
                            <circle
                              cx={cx}
                              cy={cy}
                              r={6}
                              fill="hsl(var(--destructive))"
                              stroke="white"
                              strokeWidth={2}
                            />
                            <text
                              x={cx}
                              y={cy + 20}
                              textAnchor="middle"
                              fill="hsl(var(--destructive))"
                              fontSize={12}
                              fontWeight="bold"
                            >
                              Min
                            </text>
                          </g>
                        );
                      }
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={3}
                          fill="hsl(var(--primary))"
                        />
                      );
                    }}
                    name="Battery Voltage (V)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Info Tooltip */}
            <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-1">
                <span className="text-primary">ℹ️</span>
                <span className="font-medium">
                  Voltage monitoring helps track battery health and solar panel
                  output efficiency. Power = Voltage × Current.
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Section */}
      <Card className="bg-gradient-card shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Analytics & Trends</span>
          </CardTitle>
          <CardDescription>
            Historical data visualization for all sensor parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="powerOutput" className="w-full">
            <TabsList className="grid grid-cols-6 mb-6">
              {chartConfigs.map((config) => (
                <TabsTrigger
                  key={config.key}
                  value={config.key}
                  className="text-xs"
                >
                  {config.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {chartConfigs.map((config) => (
              <TabsContent key={config.key} value={config.key}>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="time"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--popover-foreground))",
                        }}
                        labelFormatter={(label) => `Time: ${label}`}
                        formatter={(value: number) => [
                          `${value} ${config.unit}`,
                          config.name,
                        ]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey={config.key}
                        stroke={config.color}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{
                          r: 5,
                          stroke: config.color,
                          strokeWidth: 2,
                        }}
                        name={`${config.name} (${config.unit})`}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Data Info */}
      {data && (
        <Card className="bg-gradient-secondary/20">
          <CardHeader>
            <CardTitle className="text-lg">Data Source Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Channel ID:</span> {data.channel.id}
            </div>
            <div>
              <span className="font-medium">Total Records:</span>{" "}
              {data.feeds.length}
            </div>
            <div>
              <span className="font-medium">Last Entry ID:</span>{" "}
              {data.channel.last_entry_id}
            </div>
            <div>
              <span className="font-medium">Update Interval:</span> 30 seconds
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
