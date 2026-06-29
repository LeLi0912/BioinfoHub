---
name: verification
description: Verify that a code change works correctly by running the app, checking behavior, and testing edge cases. Use after implementing a change to confirm it does what was intended.
---

# Verification

Confirm that implemented changes behave correctly — not just that tests pass, but that the feature actually works in practice.

## Verification Checklist

### 1. Core functionality
- Run the app and exercise the changed path end-to-end
- Test the golden path: does the primary use case work?
- Check: does the UI render correctly? are interactions responsive?

### 2. Edge cases
- Empty state / no data
- Maximum input size / boundary values
- Error state / network failure / timeout
- Concurrent operations (if applicable)

### 3. Regression check
- Do related features still work?
- Does the app still start without errors?
- Any console warnings or errors?

### 4. Code quality
- No leftover debug logs or commented-out code
- No hardcoded values that should be config
- No new TypeScript/type errors

## Output
Report as:
- **Passed**: what was verified and works
- **Issues found**: what needs attention (with reproduction steps)
- **Untested**: what couldn't be verified and why (e.g., needs production data, external service)
