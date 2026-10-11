import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { expect, test } from "vitest";
import { RequireProfile } from "./RequireProfile";
import { SessionProvider } from "../lib/SessionContext";

test("redirects to /login when there is no active profile", () => {
  render(
    <SessionProvider>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route
            path="/"
            element={
              <RequireProfile>
                <div data-testid="protected">secret</div>
              </RequireProfile>
            }
          />
          <Route path="/login" element={<div data-testid="login">login</div>} />
        </Routes>
      </MemoryRouter>
    </SessionProvider>,
  );
  expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
  expect(screen.getByTestId("login")).toBeInTheDocument();
});
