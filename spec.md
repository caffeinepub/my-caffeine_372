# রক্তদাতা গ্রুপ — UI Modernization

## Current State
The app has a well-designed menu bar (dark green #0f2d1a / #1a4d2e with gold #D4AF37 accents, Hind Siliguri font, grouped nav, icons). However, the individual page modules (Dashboard, Members, Financial, NoticBoard, etc.) use plain white cards with basic styling that doesn't match the polished menu bar aesthetic.

## Requested Changes (Diff)

### Add
- Consistent page-level header section for each module (with icon + title + description in the green/gold theme)
- Modern card styling across all pages with subtle gradients, shadows, and border accents
- Consistent color tokens matching the menu bar: dark green (#1a4d2e, #0f2d1a), gold (#D4AF37), used for headings, icons, active states
- Section dividers, better spacing, and visual hierarchy throughout all pages
- Modern dashboard with feature cards for each module

### Modify
- DashboardPage: redesign welcome section and quick action cards to match modern aesthetic
- App.tsx header: modernize top header bar to match the sidebar theme (dark green/gold)
- index.css: refine typography and add utility classes for consistent Bengali text rendering
- All page headers and section titles: use consistent green/gold color scheme
- Buttons: consistent styling matching the menu bar's active state (gold gradient for primary, green outline for secondary)
- Card components: subtle left-border accents, hover shadows, modern look
- Back button: style to match the new theme

### Remove
- Mismatched plain white/gray UI elements that clash with the professional menu bar design
- Inconsistent color usage across pages

## Implementation Plan
1. Update index.css: Add page-header utility classes, modern card styles, button styles with green/gold theme
2. Update App.tsx: Modernize the top sticky header (dark green background matching sidebar), style the back button with gold accent
3. Update DashboardPage.tsx: Modern welcome banner, redesigned stat cards with icons and gradient accents, modern quick-action grid
4. Apply consistent Bengali-first typography and spacing improvements throughout existing page components via CSS classes
5. Validate build
