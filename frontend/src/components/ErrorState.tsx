import { AlertCircle } from "lucide-react";
import { Button } from "./Button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

// Inline error with optional retry. Conveys error via text + icon (not color alone).
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
    >
      <AlertCircle className="h-5 w-5 flex-none" aria-hidden="true" />
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">{message}</p>
        {onRetry ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onRetry}
            data-testid="error-retry-button"
            className="self-start border-red-200 text-red-700 hover:bg-red-100"
          >
            Try again
          </Button>
        ) : null}
      </div>
    </div>
  );
}
