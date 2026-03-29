import { useEffect, useRef, useState } from "react";

const STATUS_MESSAGES = [
  "Reading your dealer quote...",
  "Checking for hidden fees...",
  "Comparing pricing against real deals...",
  "Analyzing dealer tactics...",
  "Preparing your results...",
];

const TOTAL_DURATION = 50000;
const TICK_INTERVAL = 200;
const MESSAGE_INTERVAL = 3000;
const MAX_PROGRESS = 90;

interface AnalysisProgressBarProps {
  isPending: boolean;
}

export default function AnalysisProgressBar({ isPending }: AnalysisProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const startTimeRef = useRef<number>(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messageRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (tickRef.current !== null) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    if (messageRef.current !== null) {
      clearInterval(messageRef.current);
      messageRef.current = null;
    }

    if (!isPending) {
      setProgress(0);
      setMessageIndex(0);
      return;
    }

    startTimeRef.current = Date.now();
    setProgress(0);
    setMessageIndex(0);

    tickRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgress(Math.min(MAX_PROGRESS, (elapsed / TOTAL_DURATION) * MAX_PROGRESS));
    }, TICK_INTERVAL);

    let msgCount = 0;
    messageRef.current = setInterval(() => {
      msgCount += 1;
      setMessageIndex(msgCount % STATUS_MESSAGES.length);
    }, MESSAGE_INTERVAL);

    return () => {
      if (tickRef.current !== null) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      if (messageRef.current !== null) {
        clearInterval(messageRef.current);
        messageRef.current = null;
      }
    };
  }, [isPending]);

  return (
    <div
      className="mt-3 space-y-1.5"
      style={{ minHeight: "2.5rem" }}
      data-testid="analysis-progress-bar"
      aria-live="polite"
      aria-busy={isPending}
    >
      {isPending && (
        <>
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            <div
              className="h-2.5 rounded-full bg-primary transition-all duration-200 ease-linear"
              style={{ width: `${progress}%` }}
              data-testid="progress-bar-fill"
            />
          </div>
          <p
            className="text-xs text-muted-foreground text-center font-medium"
            data-testid="text-progress-status"
          >
            {STATUS_MESSAGES[messageIndex]}
          </p>
        </>
      )}
    </div>
  );
}
