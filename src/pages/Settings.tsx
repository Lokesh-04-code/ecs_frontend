import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '../components/ThemeProvider';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Settings as SettingsIcon, User, Bell, Database, Info } from 'lucide-react';

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold gradient-text">Settings</h1>
          <p className="text-muted-foreground">Manage your IoT dashboard preferences</p>
        </div>
      </div>

      {/* Appearance Settings */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="h-5 w-5 rounded bg-gradient-primary"></div>
            <span>Appearance</span>
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="theme-mode" className="text-base">
                Theme Mode
              </Label>
              <div className="text-sm text-muted-foreground">
                Choose your preferred color scheme
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
              >
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Settings */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </CardTitle>
          <CardDescription>
            Configure your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="realtime-alerts" className="text-base">
                Real-time Alerts
              </Label>
              <div className="text-sm text-muted-foreground">
                Get notified when sensor values exceed thresholds
              </div>
            </div>
            <Switch id="realtime-alerts" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="text-base">
                Email Notifications
              </Label>
              <div className="text-sm text-muted-foreground">
                Receive daily summaries via email
              </div>
            </div>
            <Switch id="email-notifications" />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound-alerts" className="text-base">
                Sound Alerts
              </Label>
              <div className="text-sm text-muted-foreground">
                Play sounds for critical alerts
              </div>
            </div>
            <Switch id="sound-alerts" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Data Settings */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Data Management</span>
          </CardTitle>
          <CardDescription>
            Configure data collection and storage settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-refresh" className="text-base">
                Auto Refresh
              </Label>
              <div className="text-sm text-muted-foreground">
                Automatically refresh data every 30 seconds
              </div>
            </div>
            <Switch id="auto-refresh" defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="data-retention" className="text-base">
                Data Retention
              </Label>
              <div className="text-sm text-muted-foreground">
                Store historical data for analysis
              </div>
            </div>
            <Switch id="data-retention" defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Account</span>
          </CardTitle>
          <CardDescription>
            Manage your account and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Current User</div>
              <div className="text-sm text-muted-foreground">admin@iotmonitor.com</div>
            </div>
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Session</div>
              <div className="text-sm text-muted-foreground">Manage your current session</div>
            </div>
            <Button variant="destructive" size="sm" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card className="bg-gradient-secondary/20 border-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5" />
            <span>System Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Version:</span> v1.0.0
          </div>
          <div>
            <span className="font-medium">API Endpoint:</span> ThingSpeak
          </div>
          <div>
            <span className="font-medium">Update Frequency:</span> 30 seconds
          </div>
          <div>
            <span className="font-medium">Status:</span> <span className="text-success">Connected</span>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="bg-gradient-primary hover:opacity-90">
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;