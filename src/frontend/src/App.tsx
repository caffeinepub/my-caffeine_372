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
  ArrowLeft,
  Bell,
  BookOpen,
  ClipboardList,
  Droplets,
  FileDown,
  GitBranch,
  Home,
  Lock,
  Menu,
  Search,
  Settings,
  Users,
  Wallet,
  WifiOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useOfflineQueue, useOnlineStatus } from "./hooks/offlineHooks";
import { useActor } from "./hooks/useActor";
import BloodDonorPage from "./pages/BloodDonorPage";
import BloodDonorRegisterPublicPage from "./pages/BloodDonorRegisterPublicPage";
import BloodDonorSearchPage from "./pages/BloodDonorSearchPage";
import BloodSearchPublicPage from "./pages/BloodSearchPublicPage";
import ConstitutionPage from "./pages/ConstitutionPage";
import DashboardPage from "./pages/DashboardPage";
import FamilyTreePage from "./pages/FamilyTreePage";
import FinancialPage from "./pages/FinancialPage";
import LoginPage from "./pages/LoginPage";
import MembersPage from "./pages/MembersPage";
import NoticeBoardPage from "./pages/NoticeBoardPage";
import ReportsPage from "./pages/ReportsPage";
import ResolutionPadPage from "./pages/ResolutionPadPage";
import SettingsPage from "./pages/SettingsPage";
import {
  type AuthSession,
  getSession,
  initAdminStore,
  logoutAdmin,
} from "./store/adminAuthStore";
import { loadSettings } from "./store/settingsStore";
import { getUrlParameter } from "./utils/urlParams";

initAdminStore();

export type Page =
  | "dashboard"
  | "members"
  | "settings"
  | "constitution"
  | "financial"
  | "noticeboard"
  | "resolution"
  | "familytree"
  | "reports"
  | "blooddonor";

const GOLD = "#D4AF37";
const GOLD_DARK = "#B8960C";
const DARK_GREEN = "#0f2d1a";

const sidebarFont: React.CSSProperties = {
  fontFamily: "'Hind Siliguri', sans-serif",
};

function MainApp({ actor }: { actor: ReturnType<typeof useActor>["actor"] }) {
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
  const [menuSearch, setMenuSearch] = useState("");

  const isOnline = useOnlineStatus();
  const pendingCount = useOfflineQueue();
  const prevOnlineRef = useRef(isOnline);

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

  function handleSettingsClick() {
    setSidebarOpen(false);
    if (isAdmin) {
      setPage("settings");
    } else {
      toast.info("সেটিং পরিবর্তন করতে এডমিন লগইন করুন।", { duration: 3000 });
      setLoginModalOpen(true);
    }
  }

  function handleLogout() {
    logoutAdmin();
    setSession(null);
  }

  const logoSrc =
    orgSettings.logoDataUrl ||
    "/assets/generated/apon-foundation-logo-transparent.dim_200x200.png";

  type NavItem = {
    key: Page;
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
  };

  type NavGroup = {
    title: string;
    items: NavItem[];
  };

  const navGroups: NavGroup[] = [
    {
      title: "প্রশাসনিক",
      items: [
        { key: "dashboard", label: "ড্যাশবোর্ড", icon: <Home size={18} /> },
        { key: "members", label: "সদস্য তালিকা", icon: <Users size={18} /> },
        { key: "constitution", label: "গঠনতন্ত্র", icon: <BookOpen size={18} /> },
        {
          key: "financial",
          label: "আর্থিক ব্যবস্থাপনা",
          icon: <Wallet size={18} />,
        },
      ],
    },
    {
      title: "তথ্য ও রিপোর্ট",
      items: [
        { key: "noticeboard", label: "নোটিশ বোর্ড", icon: <Bell size={18} /> },
        {
          key: "resolution",
          label: "রেজুলেশন প্যাড",
          icon: <ClipboardList size={18} />,
        },
        {
          key: "reports",
          label: "রিপোর্ট ও এক্সপোর্ট",
          icon: <FileDown size={18} />,
        },
      ],
    },
    {
      title: "বিশেষ ফিচার",
      items: [
        {
          key: "familytree",
          label: "বংশপরম্পরা চার্ট",
          icon: <GitBranch size={18} />,
        },
        { key: "blooddonor", label: "রক্তদাতা গ্রুপ", icon: <Droplets size={18} /> },
      ],
    },
    {
      title: "সেটিংস",
      items: [
        {
          key: "settings",
          label: "সেটিং",
          icon: <Settings size={18} />,
          onClick: handleSettingsClick,
        },
      ],
    },
  ];

  const searchLower = menuSearch.toLowerCase();
  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => searchLower === "" || item.label.includes(menuSearch),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <header className="bg-white border-b border-border shadow-sm no-print sticky top-0 z-50">
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
            {/* Hamburger - icon only, green theme */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-lg transition-all"
              style={{
                background: "linear-gradient(135deg, #1a4d2e 0%, #0f2d1a 100%)",
                color: GOLD,
                boxShadow: "0 2px 8px rgba(15,45,26,0.3)",
              }}
              data-ocid="nav.menu.button"
              aria-label="মেনু খুলুন"
            >
              <Menu size={20} />
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
      <Sheet
        open={sidebarOpen}
        onOpenChange={(open) => {
          setSidebarOpen(open);
          if (!open) setMenuSearch("");
        }}
      >
        <SheetContent
          side="left"
          className="w-72 p-0 border-0"
          style={{
            background: "linear-gradient(180deg, #0f2d1a 0%, #1a4d2e 100%)",
          }}
          data-ocid="nav.sheet"
        >
          {/* Sidebar Header */}
          <SheetHeader
            className="px-4 pt-5 pb-4"
            style={{ borderBottom: "1px solid rgba(212,175,55,0.3)" }}
          >
            <div className="flex items-center gap-3">
              <img
                src={logoSrc}
                alt="লোগো"
                className="h-11 w-11 object-contain rounded-full"
                style={{ background: "rgba(255,255,255,0.08)", padding: "4px" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div style={sidebarFont}>
                <SheetTitle className="text-left text-base font-bold leading-tight p-0">
                  <span style={{ color: GOLD }}>{orgSettings.orgName1}</span>{" "}
                  <span style={{ color: "#f5e6c8" }}>
                    {orgSettings.orgName2}
                  </span>
                </SheetTitle>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {orgSettings.tagline}
                </p>
              </div>
            </div>
          </SheetHeader>

          {/* Search Box */}
          <div className="px-3 pt-3 pb-1">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <Search size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
              <input
                type="text"
                placeholder="মেনু খুঁজুন..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-sm flex-1 placeholder:text-white/30"
                style={{ color: "rgba(255,255,255,0.85)", ...sidebarFont }}
                data-ocid="nav.search_input"
              />
            </div>
          </div>

          {/* Nav Groups */}
          <nav
            className="overflow-y-auto px-2 pb-4"
            style={{ maxHeight: "calc(100vh - 220px)", ...sidebarFont }}
          >
            {filteredGroups.map((group, gi) => (
              <div key={group.title}>
                {gi > 0 && (
                  <div
                    style={{
                      height: "1px",
                      background: "rgba(255,255,255,0.08)",
                      margin: "8px 12px",
                    }}
                  />
                )}
                {/* Group Header */}
                <div
                  style={{
                    color: GOLD,
                    fontSize: "10px",
                    letterSpacing: "0.08em",
                    fontWeight: 600,
                    padding: "12px 12px 4px",
                    opacity: 0.8,
                    textTransform: "uppercase",
                    ...sidebarFont,
                  }}
                >
                  {group.title}
                </div>
                {/* Items */}
                {group.items.map((item) => {
                  const isActive = page === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        item.onClick ? item.onClick() : navigate(item.key)
                      }
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-left transition-all"
                      style={{
                        background: isActive
                          ? `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_DARK} 100%)`
                          : "transparent",
                        color: isActive ? DARK_GREEN : "rgba(255,255,255,0.85)",
                        fontWeight: isActive ? 600 : 400,
                        boxShadow: isActive
                          ? "0 2px 8px rgba(212,175,55,0.4)"
                          : "none",
                        marginBottom: "2px",
                        ...sidebarFont,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "rgba(255,255,255,0.08)";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "#ffffff";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.background = "transparent";
                          (e.currentTarget as HTMLButtonElement).style.color =
                            "rgba(255,255,255,0.85)";
                        }
                      }}
                      data-ocid={`nav.${item.key}.link`}
                    >
                      <span
                        style={{
                          color: isActive ? DARK_GREEN : "rgba(212,175,55,0.7)",
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Divider before bottom actions */}
            <div
              style={{
                height: "1px",
                background: "rgba(255,255,255,0.08)",
                margin: "12px 12px 8px",
              }}
            />

            {/* Admin Login / Logout */}
            {!session ? (
              <button
                type="button"
                onClick={() => {
                  setSidebarOpen(false);
                  setLoginModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-left transition-all"
                style={{
                  border: "1px solid rgba(212,175,55,0.4)",
                  color: GOLD,
                  background: "transparent",
                  ...sidebarFont,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(212,175,55,0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                }}
                data-ocid="nav.admin_login.link"
              >
                <Lock size={18} style={{ color: GOLD }} />
                এডমিন লগইন
              </button>
            ) : (
              <div
                className="px-3 py-3 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <p
                  className="text-xs mb-2 truncate"
                  style={{ color: "rgba(255,255,255,0.5)", ...sidebarFont }}
                >
                  {session.email}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSidebarOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-xs px-3 py-1.5 rounded-md transition-all"
                  style={{
                    border: "1px solid rgba(212,175,55,0.4)",
                    color: GOLD,
                    background: "transparent",
                    ...sidebarFont,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(212,175,55,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                  }}
                  data-ocid="nav.sidebar_logout.button"
                >
                  লগ আউট
                </button>
              </div>
            )}
          </nav>
        </SheetContent>
      </Sheet>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {page !== "dashboard" && (
          <div className="mb-4 no-print">
            <button
              type="button"
              onClick={() => navigate("dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border bg-white hover:bg-secondary transition-colors shadow-sm"
              style={{ color: "#166534" }}
              data-ocid="nav.back.button"
            >
              <ArrowLeft size={16} />
              ড্যাশবোর্ডে ফিরুন
            </button>
          </div>
        )}

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
        {page === "familytree" && <FamilyTreePage isAdmin={isAdmin} />}
        {page === "reports" && <ReportsPage actor={actor} />}
        {page === "blooddonor" && (
          <BloodDonorPage actor={actor} isAdmin={isAdmin} />
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

export default function App() {
  const { actor } = useActor();
  const viewParam = getUrlParameter("view");

  if (viewParam === "rokto-onusondhan") {
    return <BloodDonorSearchPage actor={actor} />;
  }

  if (viewParam === "blood-search") {
    return <BloodSearchPublicPage actor={actor} />;
  }

  if (viewParam === "rokto-nibondhan") {
    return <BloodDonorRegisterPublicPage actor={actor} />;
  }

  return <MainApp actor={actor} />;
}
