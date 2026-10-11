import "@testing-library/jest-dom";

// Tests run hermetically against the in-memory stub (no backend/network).
// Production/dev default is the real backend; see src/lib/createApiClient.ts.
import.meta.env.VITE_USE_STUB = "true";
