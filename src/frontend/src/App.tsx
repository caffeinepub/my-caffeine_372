import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Settings } from "lucide-react";
import { useState } from "react";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import LoginPage from "./pages/LoginPage";
import MembersPage from "./pages/MembersPage";
import SettingsPage from "./pages/SettingsPage";
import { loadSettings } from "./store/settingsStore";

export default function App() {
  const { identity, login, clear, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [page, setPage] = useState<"members" | "settings">("members");
  const [settingsVersion, setSettingsVersion] = useState(0);

  const roleQuery = useQuery({
    queryKey: ["userRole", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return "guest";
      return await actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });

  const isAdmin = roleQuery.data === "admin";
  // Re-read settings whenever settingsVersion changes
  const orgSettings = loadSettings();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _sv = settingsVersion; // reference to trigger re-render

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!identity) {
    return (
      <>
        <LoginPage onLogin={login} isLoggingIn={isLoggingIn} />
        <Toaster />
      </>
    );
  }

  const logoSrc =
    orgSettings.logoDataUrl ||
    "/assets/generated/apon-foundation-logo-transparent.dim_200x200.png";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt="লোগো"
              className="h-12 w-12 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div>
              <div className="text-xl font-bold leading-tight">
                <span style={{ color: orgSettings.color1 }}>
                  {orgSettings.orgName1}
                </span>{" "}
                <span style={{ color: orgSettings.color2 }}>
                  {orgSettings.orgName2}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {orgSettings.tagline}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex gap-1" data-ocid="main.tab">
              <button
                type="button"
                onClick={() => setPage("members")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  page === "members"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary text-foreground"
                }`}
                data-ocid="nav.members.link"
              >
                সদস্য তালিকা
              </button>
              <button
                type="button"
                onClick={() => setPage("settings")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  page === "settings"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary text-foreground"
                }`}
                data-ocid="nav.settings.link"
              >
                <Settings size={15} />
                সেটিং
              </button>
            </nav>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground hidden sm:block">
                {identity.getPrincipal().toString().slice(0, 12)}...
              </span>
              {isAdmin && (
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                  অ্যাডমিন
                </span>
              )}
              <button
                type="button"
                onClick={clear}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border"
                data-ocid="nav.logout.button"
              >
                লগ আউট
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {page === "members" && <MembersPage actor={actor} isAdmin={isAdmin} />}
        {page === "settings" && (
          <SettingsPage
            onSave={() => {
              setPage("members");
              setSettingsVersion((v) => v + 1);
            }}
          />
        )}
      </main>

      <footer className="bg-white border-t border-border py-4 text-center text-xs text-muted-foreground no-print">
        <p>
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      <Toaster />
    </div>
  );
}
