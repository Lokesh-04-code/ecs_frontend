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
  // Commented out Alerts feature - Coming Soon for Review 3, it is under process
  // The original code has been commented out to disable the feature temporarily

  return (
    <div className="p-6 flex justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Coming Soon for Review 3</h1>
        <p className="text-muted-foreground">It is under process.</p>
      </div>
    </div>
  );
};

export default AlertsGallery;
