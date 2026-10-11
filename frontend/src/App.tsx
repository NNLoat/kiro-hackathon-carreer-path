import { useEffect, useState } from "react";

type Health = { status: string };

export default function App() {
  const [health, setHealth] = useState<string>("checking…");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json() as Promise<Health>)
      .then((data) => setHealth(data.status))
      .catch(() => setHealth("unreachable"));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-900 text-slate-100">
      <h1 className="text-4xl font-bold">Hackathon</h1>
      <p className="text-lg">
        Backend health:{" "}
        <span
          className={
            health === "ok" ? "text-green-400 font-mono" : "text-amber-400 font-mono"
          }
        >
          {health}
        </span>
      </p>
    </div>
  );
}
