"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { signOut } from "@/features/auth/actions";
import { Clock, X } from "lucide-react";

// ============================================================================
// SessionTimeout — client-side idle timeout with warning modal
// ============================================================================
// Tracks user activity (mouse, keyboard, touch, scroll). After IDLE_TIMEOUT
// ms of inactivity, shows a warning modal with a countdown. If the user
// doesn't respond within WARNING_DURATION ms, signs them out.
//
// Defaults: 25 min idle → 5 min warning = 30 min total session timeout
// ============================================================================

const IDLE_TIMEOUT = 25 * 60 * 1000; // 25 minutes
const WARNING_DURATION = 5 * 60 * 1000; // 5 minute warning
const CHECK_INTERVAL = 10 * 1000; // Check every 10 seconds

export function SessionTimeout() {
  const router = useRouter();
  const { toast } = useToast();
  const [showWarning, setShowWarning] = React.useState(false);
  const [countdown, setCountdown] = React.useState(WARNING_DURATION);
  const lastActivityRef = React.useRef(0);
  const warningTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Track user activity
  React.useEffect(() => {
    lastActivityRef.current = Date.now();

    function updateActivity() {
      lastActivityRef.current = Date.now();
      // If warning was showing and user came back, dismiss it
      if (showWarningRef.current) {
        setShowWarning(false);
        if (warningTimerRef.current) {
          clearInterval(warningTimerRef.current);
          warningTimerRef.current = null;
        }
      }
    }

    const showWarningRef = { current: false };
    const events = ["mousedown", "keydown", "touchstart", "scroll", "mousemove"];

    // Use passive listeners for performance
    events.forEach((e) =>
      window.addEventListener(e, updateActivity, { passive: true }),
    );

    // Check idle time periodically
    const checkInterval = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      if (idleTime >= IDLE_TIMEOUT && !showWarningRef.current) {
        showWarningRef.current = true;
        setShowWarning(true);
        startCountdown();
      }
    }, CHECK_INTERVAL);

    function startCountdown() {
      const startTime = Date.now();
      warningTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = WARNING_DURATION - elapsed;
        if (remaining <= 0) {
          // Time's up — sign out
          handleTimeout();
        } else {
          setCountdown(remaining);
        }
      }, 1000);
    }

    async function handleTimeout() {
      if (warningTimerRef.current) {
        clearInterval(warningTimerRef.current);
        warningTimerRef.current = null;
      }
      toast({ title: "Session expired", description: "You've been signed out due to inactivity.", variant: "info" });
      try {
        await signOut();
      } catch {
        // redirect throws
      }
    }

    return () => {
      events.forEach((e) => window.removeEventListener(e, updateActivity));
      clearInterval(checkInterval);
      if (warningTimerRef.current) clearInterval(warningTimerRef.current);
    };
  }, []);

  async function handleStaySignedIn() {
    setShowWarning(false);
    lastActivityRef.current = Date.now();
    if (warningTimerRef.current) {
      clearInterval(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    toast({ title: "Session extended", variant: "success" });
  }

  async function handleSignOutNow() {
    if (warningTimerRef.current) {
      clearInterval(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    try {
      await signOut();
    } catch {
      // redirect throws
    }
  }

  function formatTime(ms: number) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-background shadow-elev-4">
        <div className="flex items-center gap-3 border-b border-border bg-card px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">Session expiring</h3>
            <p className="text-xs text-muted-foreground">You&apos;ve been inactive</p>
          </div>
          <button
            type="button"
            onClick={handleStaySignedIn}
            aria-label="Dismiss"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <p className="text-center text-sm text-muted-foreground">
            You will be signed out in
          </p>
          <p className="text-center text-4xl font-bold tabular-nums text-foreground">
            {formatTime(countdown)}
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Click below to stay signed in on this device.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSignOutNow}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Sign out
            </button>
            <button
              type="button"
              onClick={handleStaySignedIn}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground shadow-elev-1 transition-colors hover:bg-primary/90"
            >
              Stay signed in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}