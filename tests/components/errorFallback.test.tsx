// @vitest-environment jsdom
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("@sentry/react", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../../client/src/lib/queryClient", () => ({
  queryClient: {
    resetQueries: vi.fn(),
    refetchQueries: vi.fn(),
  },
  getQueryFn: vi.fn(),
}));

import React from "react";
import { queryClient } from "../../client/src/lib/queryClient";
import { ErrorFallback } from "../../client/src/App";

describe("ErrorFallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows 'Try again' and 'Reload page' buttons initially", () => {
    render(<ErrorFallback resetError={vi.fn()} />);
    expect(screen.getByTestId("button-error-retry")).toBeInTheDocument();
    expect(screen.getByTestId("button-error-reload")).toBeInTheDocument();
    expect(screen.getByTestId("button-error-retry")).toHaveTextContent("Try again");
  });

  it("calls resetError after successful query reset and refetch", async () => {
    const resetError = vi.fn();
    (queryClient.resetQueries as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (queryClient.refetchQueries as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    render(<ErrorFallback resetError={resetError} />);

    const user = userEvent.setup();
    await user.click(screen.getByTestId("button-error-retry"));

    await waitFor(() => {
      expect(queryClient.resetQueries).toHaveBeenCalled();
      expect(queryClient.refetchQueries).toHaveBeenCalled();
      expect(resetError).toHaveBeenCalled();
    });
  });

  it("shows reload guidance when recovery fails", async () => {
    const resetError = vi.fn();
    (queryClient.resetQueries as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (queryClient.refetchQueries as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Refetch failed"),
    );

    render(<ErrorFallback resetError={resetError} />);

    const user = userEvent.setup();
    await user.click(screen.getByTestId("button-error-retry"));

    await waitFor(() => {
      expect(screen.queryByTestId("button-error-retry")).not.toBeInTheDocument();
      expect(screen.getByTestId("button-error-reload")).toBeInTheDocument();
      expect(screen.getByText(/Recovery failed/i)).toBeInTheDocument();
    });

    expect(resetError).not.toHaveBeenCalled();
  });

  it("does NOT call resetError on failed recovery", async () => {
    const resetError = vi.fn();
    (queryClient.resetQueries as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Reset failed"),
    );

    render(<ErrorFallback resetError={resetError} />);

    const user = userEvent.setup();
    await user.click(screen.getByTestId("button-error-retry"));

    await waitFor(() => {
      expect(resetError).not.toHaveBeenCalled();
    });
  });
});
