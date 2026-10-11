import { useNavigate } from "react-router-dom";
import { UsernameForm } from "./UsernameForm";
import { ErrorState } from "../../components/ErrorState";
import { useSession } from "../../lib/SessionContext";
import { useCreateOrLoadProfile } from "../../lib/queryHooks";

export function LoginPage() {
  const { signIn } = useSession();
  const navigate = useNavigate();
  const mutation = useCreateOrLoadProfile();

  function handleSubmit(username: string) {
    mutation.mutate(username, {
      onSuccess: (profile) => {
        signIn(profile);
        navigate("/");
      },
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <header className="flex flex-col gap-1 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Career Path Planner</h1>
        <p className="text-slate-500">Enter a username to start or resume planning.</p>
      </header>

      <UsernameForm onSubmit={handleSubmit} loading={mutation.isPending} />

      {mutation.isError ? (
        <ErrorState
          message={mutation.error?.message ?? "Something went wrong"}
          onRetry={() => mutation.reset()}
        />
      ) : null}
    </main>
  );
}
