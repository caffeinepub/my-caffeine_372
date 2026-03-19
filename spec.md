# আপন ফাউন্ডেশন

## Current State
FinancialPage has income and expense tabs with add/delete. Income form: serial, date, category (fixed dropdown), donor name, address, mobile, amount, designation. Expense form: serial, date, category (custom with add-new), recipient name, address, mobile, amount. No edit functionality. No PDF per-record. No father's name fields.

## Requested Changes (Diff)

### Add
- Father's name (পিতার নাম) in income form and table
- Father's name (পিতার নাম) in expense form and table
- Custom add-new category for income (like expense already has)
- Edit button + edit dialog for both income and expense records
- Per-record PDF print: receipt for income, voucher for expense with org header (logo, name, address, email, WhatsApp, web)

### Modify
- IncomeRecord and ExpenseRecord interfaces: add fatherName
- Income/expense table columns: add fatherName
- Income dialog: add fatherName field and new-category option
- Expense dialog: add fatherName field
- Row actions: edit + print buttons in addition to delete

### Remove
- Nothing

## Implementation Plan
1. Update interfaces + seed data
2. Add income category management state (same pattern as expense)
3. Add edit state and edit dialogs
4. Add printReceipt/printVoucher functions using window.open + print CSS
5. Add edit and print buttons to table rows
