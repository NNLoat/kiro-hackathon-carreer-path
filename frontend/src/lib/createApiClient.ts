// Selects the stub or real client behind one typed interface (FR-9.4).
// Default to stub in dev so the app runs without the backend.
import type { ApiClient } from "./apiClient";
import { HttpApiClient } from "./httpApiClient";
import { StubApiClient } from "./stubApiClient";

export function createApiClient(): ApiClient {
  const useStub = import.meta.env.VITE_USE_STUB !== "false"; // default: stub unless explicitly disabled
  return useStub ? new StubApiClient() : new HttpApiClient();
}

// Shared singleton for the app.
export const apiClient: ApiClient = createApiClient();
