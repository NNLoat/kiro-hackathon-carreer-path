import { useState } from "react";
import type { FormEvent } from "react";
import { Field } from "../../components/Field";
import { Button } from "../../components/Button";
import { validateUsername } from "../../lib/validateUsername";

interface UsernameFormProps {
  onSubmit: (username: string) => void;
  loading?: boolean;
}

export function UsernameForm({ onSubmit, loading }: UsernameFormProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = validateUsername(username);
    if (!result.valid) {
      setError(result.error);
      return;
    }
    setError(null);
    onSubmit(result.value);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" data-testid="login-form" noValidate>
      <Field
        id="username"
        label="Username"
        placeholder="e.g. nam"
        value={username}
        error={error}
        autoFocus
        onChange={(e) => setUsername(e.target.value)}
        data-testid="login-username-input"
      />
      <Button type="submit" loading={loading} data-testid="login-submit-button">
        Continue
      </Button>
    </form>
  );
}
