# আপন ফাউন্ডেশন

## Current State
App uses Internet Identity (ICP) for login. Admin role is determined by backend `getCallerUserRole()`. Settings page has an 'অ্যাডমিন তথ্য' tab that only shows instructions. No email/password-based auth exists.

## Requested Changes (Diff)

### Add
- Local email/password authentication system stored in localStorage
- `adminAuthStore.ts`: stores super admin credentials and list of regular admins (email + hashed password + role: 'superadmin'|'admin')
- On first run, default super admin: email `admin@aponfoundation.org`, password `admin123` — user prompted to change on first login
- Login page with email + password fields (replace Internet Identity login)
- Settings page new tab: "এডমিন ব্যবস্থাপনা" with two sections:
  1. সুপার এডমিন একাউন্ট — change super admin email and password
  2. এডমিন তালিকা — add new admins (enter email + create password), view list, delete admins
- After login, header shows logged-in user's email and role badge (সুপার এডমিন / এডমিন)
- Logout clears local auth session

### Modify
- `LoginPage.tsx`: replace Internet Identity button with email + password form; show validation errors; password visibility toggle
- `App.tsx`: use local auth state instead of `useInternetIdentity`; `isAdmin` derived from local auth role; keep actor/ICP connection in background silently
- `SettingsPage.tsx`: add new tab "এডমিন ব্যবস্থাপনা" (only visible when logged in as super admin)

### Remove
- Internet Identity login button from login page (keep hook internally for actor if needed)

## Implementation Plan
1. Create `src/frontend/src/store/adminAuthStore.ts` — CRUD for super admin + admin accounts in localStorage, login/logout session
2. Update `LoginPage.tsx` — email/password form, validation, login handler
3. Update `App.tsx` — use adminAuthStore for auth state, pass isAdmin/isSuperAdmin to pages
4. Update `SettingsPage.tsx` — add admin management tab with change credentials + add/remove admins (super admin only)
