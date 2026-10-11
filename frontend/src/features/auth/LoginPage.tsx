import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
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
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
            <Compass className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">CareerPath Planner</h1>
          <p className="text-slate-500">
            Map your skills to a career and get a step-by-step study plan.
          </p>
        </div>

        <div className="card p-6">
          <h2 className="mb-1 text-lg font-semibold text-slate-900">Welcome</h2>
          <p className="mb-5 text-sm text-slate-500">
            Enter a username to start a new plan or resume an existing one.
          </p>

          <UsernameForm onSubmit={handleSubmit} loading={mutation.isPending} />

          {mutation.isError ? (
            <div className="mt-4">
              <ErrorState
                message={mutation.error?.message ?? "Something went wrong"}
                onRetry={() => mutation.reset()}
              />
            </div>
          ) : null}
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          No password needed — this is a prototype profile.
        </p>
      </div>
    </main>
  );
}
