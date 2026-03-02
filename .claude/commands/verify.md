Run the WorshipHub integrity check in this exact order:

1. **Tests** — `npx vitest run`
   - All tests must pass (0 failures)
   - If any test fails: show the test name, error message, and file location

2. **Type check** — `npx tsc --noEmit`
   - Must produce zero errors
   - If errors exist: list each file and error concisely

3. **Build** — `npm run build`
   - Must complete without error
   - Report bundle size if available

After all three steps, output a single summary line:
- ✅ VERIFY PASSED — safe to commit/push
- ❌ VERIFY FAILED — list what broke and the fix required before continuing

Do not proceed with any other work until VERIFY PASSED.
