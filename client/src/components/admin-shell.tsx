/**
 * AdminShell — shared authentication wrapper for all admin dashboard pages.
 *
 * Eliminates the copy-pasted admin-key input form and "Access Denied" card
 * that was duplicated in every admin-*.tsx page (~30 lines each).
 */

import { useState, type ReactNode } from "react";
import { AdminNav } from "@/components/admin-nav";
import { useAdminKey } from "@/hooks/use-admin-key";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface AdminShellProps {
  /** Render prop — receives the validated admin key. */
  children: (adminKey: string, clearKey: () => void) => ReactNode;
  /**
   * If true, show a loading placeholder while the key hasn't been entered yet.
   * Defaults to false (just show the key entry form).
   */
  showLoadingWhenNoKey?: boolean;
}

export function AdminShell({ children }: AdminShellProps) {
  const [adminKey, setAdminKey, clearKey] = useAdminKey();
  const [keyInput, setKeyInput] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />

      {!adminKey && (
        <div className="flex items-center justify-center py-24">
          <div className="w-full max-w-sm space-y-4 p-6">
            <h1 className="text-xl font-bold text-center">Admin Access</h1>
            <p className="text-sm text-muted-foreground text-center">
              Enter your admin key to continue
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                className="flex-1 border rounded-md px-3 py-2 text-sm bg-background"
                placeholder="Admin key"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && keyInput) setAdminKey(keyInput);
                }}
                data-testid="input-admin-key"
                autoFocus
              />
              <Button
                onClick={() => {
                  if (keyInput) setAdminKey(keyInput);
                }}
                disabled={!keyInput}
                data-testid="button-submit-admin-key"
              >
                Go
              </Button>
            </div>
          </div>
        </div>
      )}

      {adminKey && children(adminKey, clearKey)}
    </div>
  );
}

/**
 * Shared "Access Denied" error card shown when an API call returns 401/403.
 * Use this instead of building custom error UI per page.
 */
export function AdminAccessDenied({ clearKey }: { clearKey: () => void }) {
  return (
    <div className="flex items-center justify-center p-6 py-24">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            Unable to load data. Please check your access key.
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={clearKey} data-testid="button-clear-admin-key">
              Clear key and re-enter
            </Button>
            <Link href="/">
              <Button variant="ghost" data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
