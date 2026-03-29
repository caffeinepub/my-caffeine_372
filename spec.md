# রক্তদাতা গ্রুপ

## Current State
App has a top header bar with a hamburger menu button that opens a Sheet (drawer) from the left. The sidebar has all menu items in a flat list with icons. Colors use the existing CSS primary (dark green). There is no grouping, no search, and no Bengali font in the menu.

## Requested Changes (Diff)

### Add
- Google Fonts import for Hind Siliguri (professional Bengali font)
- Section group headers in sidebar: প্রশাসনিক, তথ্য ও রিপোর্ট, বিশেষ ফিচার, সেটিংস
- Search box at top of sidebar to filter menu items
- Sticky positioning for the top header bar
- Green & gold color scheme in sidebar (deep green background, gold active state)
- Hover effects on menu items with smooth transitions
- Better spacing between menu items

### Modify
- Sidebar: add grouped sections with dividers, gold active highlight, hover effects
- Header: add sticky positioning (position sticky, top-0, z-50)
- index.css: add Google Fonts import for Hind Siliguri; apply to body
- Menu items: adequate padding and spacing, no crowding

### Remove
- Nothing removed

## Implementation Plan
1. Add Google Fonts import in index.css for Hind Siliguri
2. Update App.tsx sidebar (Sheet) with:
   - Search input at top
   - 4 grouped sections with Bengali labels
   - Deep green sidebar background with gold active highlight
   - Smooth hover transitions
   - Sticky header
