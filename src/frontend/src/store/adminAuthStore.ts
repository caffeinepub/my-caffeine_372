export type AdminRole = "superadmin" | "admin";

export interface AdminAccount {
  email: string;
  passwordHash: string;
  role: AdminRole;
}

export interface AuthSession {
  email: string;
  role: AdminRole;
}

const ACCOUNTS_KEY = "apon_admin_accounts";
const SESSION_KEY = "apon_admin_session";

function hashPassword(password: string): string {
  return btoa(`${password}apon_salt`);
}

function getAccounts(): AdminAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: AdminAccount[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export const DEFAULT_SUPER_ADMIN_EMAIL = "admin@aponfoundation.org";
export const DEFAULT_SUPER_ADMIN_PASSWORD = "Apon@2024";

export function initAdminStore(): void {
  const accounts = getAccounts();
  if (accounts.length === 0) {
    saveAccounts([
      {
        email: DEFAULT_SUPER_ADMIN_EMAIL,
        passwordHash: hashPassword(DEFAULT_SUPER_ADMIN_PASSWORD),
        role: "superadmin",
      },
    ]);
  }
}

export function resetSuperAdminToDefault(): void {
  const accounts = getAccounts();
  const idx = accounts.findIndex((a) => a.role === "superadmin");
  if (idx === -1) {
    saveAccounts([
      ...accounts,
      {
        email: DEFAULT_SUPER_ADMIN_EMAIL,
        passwordHash: hashPassword(DEFAULT_SUPER_ADMIN_PASSWORD),
        role: "superadmin",
      },
    ]);
  } else {
    accounts[idx] = {
      ...accounts[idx],
      email: DEFAULT_SUPER_ADMIN_EMAIL,
      passwordHash: hashPassword(DEFAULT_SUPER_ADMIN_PASSWORD),
    };
    saveAccounts(accounts);
  }
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ email: DEFAULT_SUPER_ADMIN_EMAIL, role: "superadmin" }),
  );
}

export function loginAdmin(
  email: string,
  password: string,
): AuthSession | null {
  const accounts = getAccounts();
  const account = accounts.find(
    (a) => a.email === email && a.passwordHash === hashPassword(password),
  );
  if (!account) return null;
  const session: AuthSession = { email: account.email, role: account.role };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logoutAdmin(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getSuperAdmin(): AdminAccount | undefined {
  return getAccounts().find((a) => a.role === "superadmin");
}

export function updateSuperAdmin(newEmail: string, newPassword: string): void {
  const accounts = getAccounts();
  const idx = accounts.findIndex((a) => a.role === "superadmin");
  if (idx === -1) return;
  accounts[idx] = {
    ...accounts[idx],
    email: newEmail,
    passwordHash: hashPassword(newPassword),
  };
  saveAccounts(accounts);
  // Update session
  const session = getSession();
  if (session && session.role === "superadmin") {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ email: newEmail, role: "superadmin" }),
    );
  }
}

export function getAdmins(): AdminAccount[] {
  return getAccounts().filter((a) => a.role === "admin");
}

export function addAdmin(email: string, password: string): void {
  const accounts = getAccounts();
  if (accounts.find((a) => a.email === email)) return;
  accounts.push({ email, passwordHash: hashPassword(password), role: "admin" });
  saveAccounts(accounts);
}

export function removeAdmin(email: string): void {
  const accounts = getAccounts();
  const filtered = accounts.filter(
    (a) => !(a.email === email && a.role === "admin"),
  );
  saveAccounts(filtered);
}
