import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SensorCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: LucideIcon;
  className?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: 'primary' | 'success' | 'warning' | 'secondary';
}

const SensorCard: React.FC<SensorCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  className,
  trend,
  color = 'primary'
}) => {
  const colorClasses = {
    primary: 'from-primary/20 to-primary-glow/10 border-primary/20',
    success: 'from-success/20 to-success/10 border-success/20',
    warning: 'from-warning/20 to-warning/10 border-warning/20',
    secondary: 'from-secondary/20 to-accent/10 border-secondary/20'
  };

  const iconColors = {
    primary: 'text-primary',
    success: 'text-success',
    warning: 'text-warning',
    secondary: 'text-secondary'
  };

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:shadow-elevated hover:scale-105',
      `bg-gradient-to-br ${colorClasses[color]}`,
      'backdrop-blur-sm border',
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn('h-5 w-5', iconColors[color])} />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold tracking-tight">
            {typeof value === 'number' ? value.toFixed(2) : value}
          </span>
          <span className="text-sm text-muted-foreground font-medium">
            {unit}
          </span>
        </div>
        {trend && (
          <div className={cn(
            'text-xs mt-1',
            trend === 'up' && 'text-success',
            trend === 'down' && 'text-destructive',
            trend === 'stable' && 'text-muted-foreground'
          )}>
            {trend === 'up' && '↑ Increasing'}
            {trend === 'down' && '↓ Decreasing'}
            {trend === 'stable' && '→ Stable'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SensorCard;