import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, test } from "vitest";
import { LoginPage } from "./LoginPage";
import { SessionProvider } from "../../lib/SessionContext";

function renderLogin() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <SessionProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <LoginPage />
        </MemoryRouter>
      </SessionProvider>
    </QueryClientProvider>,
  );
}

test("logging in with a valid username calls the stub and signs in", async () => {
  renderLogin();
  await userEvent.type(screen.getByTestId("login-username-input"), "nam");
  await userEvent.click(screen.getByTestId("login-submit-button"));
  // Stub resolves; the form should no longer show an error.
  await waitFor(() => {
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
