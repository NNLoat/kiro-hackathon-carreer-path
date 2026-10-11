import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";

// user-event may not be installed; fall back to fireEvent-style if needed.
import { UsernameForm } from "./UsernameForm";

afterEach(() => vi.restoreAllMocks());

test("shows a validation error for an invalid username and does not submit", async () => {
  const onSubmit = vi.fn();
  render(<UsernameForm onSubmit={onSubmit} />);
  const input = screen.getByTestId("login-username-input");
  await userEvent.type(input, "ab");
  await userEvent.click(screen.getByTestId("login-submit-button"));
  expect(onSubmit).not.toHaveBeenCalled();
  expect(screen.getByRole("alert")).toBeInTheDocument();
});

test("submits a trimmed valid username", async () => {
  const onSubmit = vi.fn();
  render(<UsernameForm onSubmit={onSubmit} />);
  await userEvent.type(screen.getByTestId("login-username-input"), "  nam_01  ");
  await userEvent.click(screen.getByTestId("login-submit-button"));
  expect(onSubmit).toHaveBeenCalledWith("nam_01");
});

test("disables submit while loading", () => {
  render(<UsernameForm onSubmit={() => {}} loading />);
  expect(screen.getByTestId("login-submit-button")).toBeDisabled();
});
