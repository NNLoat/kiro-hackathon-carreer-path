// Selects the stub or real client behind one typed interface (FR-9.4).
// Default to the REAL backend (HttpApiClient). The in-memory stub is an explicit
// opt-in for offline/front-end-only development via VITE_USE_STUB=true.
import type { ApiClient } from "./apiClient";
import { HttpApiClient } from "./httpApiClient";
import { StubApiClient } from "./stubApiClient";

export function createApiClient(): ApiClient {
  const useStub = import.meta.env.VITE_USE_STUB === "true"; // default: real backend unless explicitly stubbed
  return useStub ? new StubApiClient() : new HttpApiClient();
}

// Shared singleton for the app.
export const apiClient: ApiClient = createApiClient();
