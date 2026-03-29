# রক্তদাতা গ্রুপ - Apon Foundation App

## Current State
The app has a sidebar menu with: ড্যাশবোর্ড, সদস্য তালিকা, গঠনতন্ত্র, আর্থিক ব্যবস্থাপনা, নোটিশ বোর্ড, রেজুলেশন প্যাড, বংশপরম্পরা চার্ট, রিপোর্ট ও এক্সপোর্ট, and সেটিং.

CouncilMember type has: id, memberName, fatherName, mobile, bloodGroup, currentAddress, permanentAddress, council, designation, email, serialNumber.

## Requested Changes (Diff)

### Add
- New menu option "রক্তদাতা গ্রুপ" (with blood drop icon) in the sidebar
- New page `BloodDonorPage` with two tabs:
  1. **রক্তদাতা তথ্য** - Shows all blood donors (foundation members auto-included based on registration data + external registrants)
  2. **রক্ত অনুসন্ধান** - Search/filter donors by blood group
- External registration form accessible via a shareable link/route `/blood-register` — non-members can fill in name, father's name, mobile, address, blood group to join the donor group
- External blood donors stored separately in ICP canister (new `addBloodDonor`/`getBloodDonors` calls) or localStorage as fallback
- Search and filter by blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Share button per donor card that opens Web Share API or copies formatted text
- PDF export of donor list with standard A4 header/watermark

### Modify
- `App.tsx`: add `"blooddonor"` to Page type, add menu item, add route rendering

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/pages/BloodDonorPage.tsx` with:
   - Two views: donor list (all members + external) and blood search
   - External registration form (inline modal or separate route)
   - Blood group filter/search
   - Share button using navigator.share or clipboard copy
   - PDF export using existing shared header pattern
2. Store external donors in localStorage (no new canister changes needed for now)
3. Foundation members auto-appear by pulling from `actor.getAllMembers()`
4. Update `App.tsx`: add page key, import, menu item, render
