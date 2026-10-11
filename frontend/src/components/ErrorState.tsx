import { Button } from "./Button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

// Inline error with optional retry. Conveys error via text (not color alone).
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col gap-2 rounded-md bg-red-50 p-3 text-red-700">
      <p className="text-sm font-medium">Error: {message}</p>
      {onRetry ? (
        <Button
          type="button"
          onClick={onRetry}
          data-testid="error-retry-button"
          className="self-start bg-red-600 hover:bg-red-500"
        >
          Retry
        </Button>
      ) : null}
    </div>
  );
}
