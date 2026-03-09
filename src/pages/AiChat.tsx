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
  // Commented out AI Report feature - Coming Soon for Review 3, it is under process
  // The original code has been commented out to disable the feature temporarily

  return (
    <div className="p-6 flex justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Coming Soon for Review 3</h1>
        <p className="text-muted-foreground">It is under process.</p>
      </div>
    </div>
  );
}

export default AIChat;
