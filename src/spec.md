# Specification

## Summary
**Goal:** Add Needs/Wants classification to custom categories, auto-derive it for transactions, and allow temporary per-transaction overrides in the Transactions UI.

**Planned changes:**
- Extend custom categories in the backend to store a Needs/Wants value per category, return it from `getCustomCategories`, and allow updating it without changing category IDs/names.
- Add conditional migration logic to upgrade existing stored categories (id -> name) into the new structure with a deterministic default Needs/Wants value when needed.
- Update Settings > Custom Categories to show a Need/Want toggle per custom category and persist changes to the backend.
- On the Transactions page, display a Need/Want label per transaction derived from the transaction’s effective category (including category overrides), with an explicit fallback state when missing.
- Add a per-transaction Need/Want override control (Need/Want/Auto) that is UI-only, visibly indicated when overridden, updates immediately, and is cleared by the existing Reset behavior.

**User-visible outcome:** Users can set Need/Want per custom category in Settings, see Need/Want labels on transactions that follow category settings (including category overrides), and optionally override Need/Want per individual transaction temporarily with an Auto reset option.
