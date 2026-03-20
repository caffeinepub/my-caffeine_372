import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import {
  Bell,
  BookOpen,
  ClipboardList,
  Home,
  Lock,
  Menu,
  Settings,
  Users,
  Wallet,
  WifiOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useOfflineQueue, useOnlineStatus } from "./hooks/offlineHooks";
import { useActor } from "./hooks/useActor";
import ConstitutionPage from "./pages/ConstitutionPage";
import DashboardPage from "./pages/DashboardPage";
import FinancialPage from "./pages/FinancialPage";
import LoginPage from "./pages/LoginPage";
import MembersPage from "./pages/MembersPage";
import NoticeBoardPage from "./pages/NoticeBoardPage";
import ResolutionPadPage from "./pages/ResolutionPadPage";
import SettingsPage from "./pages/SettingsPage";
import {
  type AuthSession,
  getSession,
  initAdminStore,
  logoutAdmin,
} from "./store/adminAuthStore";
import { loadSettings } from "./store/settingsStore";

initAdminStore();

export type Page =
  | "dashboard"
  | "members"
  | "settings"
  | "constitution"
  | "financial"
  | "noticeboard"
  | "resolution";

export default function App() {
  const { actor } = useActor();
  const [session, setSession] = useState<AuthSession | null>(() =>
    getSession(),
  );
  const [page, setPage] = useState<Page>("dashboard");
  const [financialTab, setFinancialTab] = useState<string | undefined>(
    undefined,
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsVersion, setSettingsVersion] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const isOnline = useOnlineStatus();
  const pendingCount = useOfflineQueue();
  const prevOnlineRef = useRef(isOnline);

  // Show toast when coming back online
  useEffect(() => {
    if (!prevOnlineRef.current && isOnline) {
      toast.success(
        pendingCount > 0
          ? "ইন্টারনেট সংযোগ পাওয়া গেছে। ডেটা স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।"
          : "ইন্টারনেট সংযোগ পুনরায় স্থাপিত হয়েছে।",
        { duration: 4000 },
      );
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline, pendingCount]);

  const isAdmin = session?.role === "admin" || session?.role === "superadmin";
  const isSuperAdmin = session?.role === "superadmin";
  const orgSettings = loadSettings();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _sv = settingsVersion;

  function navigate(targetPage: Page, tab?: string) {
    setPage(targetPage);
    if (tab) setFinancialTab(tab);
    setSidebarOpen(false);
  }

  function handleLogout() {
    logoutAdmin();
    setSession(null);
  }

  const logoSrc =
    orgSettings.logoDataUrl ||
    "/assets/generated/apon-foundation-logo-transparent.dim_200x200.png";

  const navItems: { key: Page; label: string; icon: React.ReactNode }[] = [
    { key: "dashboard", label: "ড্যাশবোর্ড", icon: <Home size={18} /> },
    { key: "members", label: "সদস্য তালিকা", icon: <Users size={18} /> },
    { key: "constitution", label: "গঠনতন্ত্র", icon: <BookOpen size={18} /> },
    { key: "financial", label: "আর্থিক ব্যবস্থাপনা", icon: <Wallet size={18} /> },
    { key: "noticeboard", label: "নোটিশ বোর্ড", icon: <Bell size={18} /> },
    {
      key: "resolution",
      label: "রেজুলেশন প্যাড",
      icon: <ClipboardList size={18} />,
    },
    ...(isAdmin
      ? [
          {
            key: "settings" as Page,
            label: "সেটিং",
            icon: <Settings size={18} />,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-shrink-0">
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
          <div className="flex items-center gap-3">
            {/* Online/Offline status indicator */}
            {!isOnline && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: "#fee2e2", color: "#991b1b" }}
                data-ocid="nav.offline_state"
              >
                <WifiOff size={12} />
                <span>অফলাইন</span>
              </div>
            )}
            {isOnline && pendingCount > 0 && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: "#fff7ed", color: "#9a3412" }}
                data-ocid="nav.syncing_state"
              >
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ background: "#ea580c" }}
                />
                <span>সিঙ্ক হচ্ছে...</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border border-border hover:bg-secondary transition-colors"
              data-ocid="nav.menu.button"
            >
              <Menu size={18} />
              <span>মেনু</span>
            </button>
            {session ? (
              <div className="flex items-center gap-2 text-sm flex-shrink-0">
                <span className="text-muted-foreground hidden lg:block text-xs">
                  {session.email}
                </span>
                {isSuperAdmin ? (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
                    style={{ background: "#1a6b2a" }}
                  >
                    সুপার এডমিন
                  </span>
                ) : isAdmin ? (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    এডমিন
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border"
                  data-ocid="nav.logout.button"
                >
                  লগ আউট
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border border-border hover:bg-secondary transition-colors"
                style={{ color: "#1a6b2a" }}
                data-ocid="nav.login.button"
              >
                <Lock size={13} />
                এডমিন লগইন
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0" data-ocid="nav.sheet">
          <SheetHeader className="p-4 border-b">
            <SheetTitle
              className="text-left text-base font-bold"
              style={{ color: "#166534" }}
            >
              মেনু
            </SheetTitle>
          </SheetHeader>
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left ${
                  page === item.key
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary text-foreground"
                }`}
                data-ocid={`nav.${item.key}.link`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            {!session && (
              <button
                type="button"
                onClick={() => {
                  setSidebarOpen(false);
                  setLoginModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left hover:bg-secondary"
                style={{ color: "#1a6b2a" }}
                data-ocid="nav.admin_login.link"
              >
                <Lock size={18} />
                এডমিন লগইন
              </button>
            )}
          </nav>
        </SheetContent>
      </Sheet>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {page === "dashboard" && (
          <DashboardPage
            actor={actor}
            isAdmin={isAdmin}
            onNavigate={navigate}
          />
        )}
        {page === "members" && <MembersPage actor={actor} isAdmin={isAdmin} />}
        {page === "constitution" && (
          <ConstitutionPage actor={actor} isAdmin={isAdmin} />
        )}
        {page === "financial" && (
          <FinancialPage
            actor={actor}
            isAdmin={isAdmin}
            defaultTab={financialTab}
          />
        )}
        {page === "noticeboard" && (
          <NoticeBoardPage actor={actor} isAdmin={isAdmin} />
        )}
        {page === "resolution" && (
          <ResolutionPadPage actor={actor} isAdmin={isAdmin} />
        )}
        {page === "settings" && isAdmin && (
          <SettingsPage
            isSuperAdmin={isSuperAdmin}
            onSave={() => {
              setPage("dashboard");
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

      {/* Login Modal */}
      <Dialog open={loginModalOpen} onOpenChange={setLoginModalOpen}>
        <DialogContent
          className="max-w-md p-0 overflow-hidden"
          data-ocid="login.modal"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>এডমিন লগইন</DialogTitle>
          </DialogHeader>
          <LoginPage
            onLogin={(s) => {
              setSession(s);
              setLoginModalOpen(false);
            }}
            isModal
          />
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
