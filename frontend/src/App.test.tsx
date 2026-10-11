import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import App from "./App";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({ status: "ok" }) } as Response),
    ),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("renders the title", () => {
  render(<App />);
  expect(screen.getByText("Hackathon")).toBeInTheDocument();
});
