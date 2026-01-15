"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const LOADING_MESSAGES = [
  "Waking up the servers...",
  "Brewing some coffee for the API...",
  "Almost there...",
  "Just a moment...",
  "Preparing your dashboard...",
];

export function LoadingScreen({ message }: { message?: string }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);

    const messageInterval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 4000);

    return () => {
      clearInterval(dotInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6 max-w-md text-center px-4">
        {/* Logo/Brand */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
          <span className="text-3xl font-bold text-white">A</span>
        </div>

        {/* Spinner */}
        <Loader2 className="h-8 w-8 animate-spin text-primary" />

        {/* Message */}
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {message || LOADING_MESSAGES[messageIndex]}{dots}
          </p>
          <p className="text-sm text-muted-foreground">
            This may take up to 30 seconds on first load
          </p>
        </div>

        {/* Progress bar animation */}
        <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-purple-600 animate-loading-bar" />
        </div>
      </div>
    </div>
  );
}

export function useApiWarmup() {
  const [isWarm, setIsWarm] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const warmUp = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const maxAttempts = 10;
      let attempts = 0;

      while (attempts < maxAttempts) {
        try {
          const res = await fetch(`${apiUrl}/health`, {
            method: "GET",
            signal: AbortSignal.timeout(5000),
          });
          if (res.ok) {
            setIsWarm(true);
            setIsChecking(false);
            return;
          }
        } catch {
          // API not ready yet, retry
        }
        attempts++;
        await new Promise((r) => setTimeout(r, 3000));
      }

      // Even if warmup fails, let user through
      setIsWarm(true);
      setIsChecking(false);
    };

    warmUp();
  }, []);

  return { isWarm, isChecking };
}
