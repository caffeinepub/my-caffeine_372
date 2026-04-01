# রক্তদাতা গ্রুপ

## Current State
বংশপরম্পরা চার্টের ডেটা শুধুমাত্র localStorage-এ সংরক্ষিত হচ্ছে। প্রতিটি নতুন ড্রাফট URL-এ localStorage খালি থাকে, ফলে সমস্ত নাম মুছে যায়।

## Requested Changes (Diff)

### Add
- Backend-এ FamilyNode type এবং storage (getAllFamilyNodes, upsertFamilyNode, deleteFamilyNode, setAllFamilyNodes)
- FamilyTreePage-এ canister API ব্যবহার করে data load/save
- localStorage থেকে canister-এ data migration (প্রথম লোডে localStorage data থাকলে canister-এ সংরক্ষণ)

### Modify
- FamilyTreePage: loadNodes/saveNodes → canister API calls
- useEffect for saving: localStorage.setItem → actor.setAllFamilyNodes
- Initial load: canister থেকে data fetch, fallback to localStorage

### Remove
- localStorage-only storage dependency for family tree data

## Implementation Plan
1. backend.d.ts regenerate with new FamilyNode types
2. FamilyTreePage.tsx: async load from canister on mount, save to canister on change
3. Migration: if canister is empty and localStorage has data, push to canister
4. Loading state while fetching from canister
