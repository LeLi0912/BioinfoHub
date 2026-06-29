---
name: systematic-debugging
description: Structured debugging methodology — hypothesis-driven, evidence-based, with clear steps to isolate root causes. Use when the user encounters a bug, error, or unexpected behavior that needs investigation.
---

# Systematic Debugging

Debug through structured hypothesis testing, not random experimentation.

## Process

### 1. Characterize the bug
- What is the exact observed behavior? (error message, wrong output, crash, hang)
- What is the expected behavior?
- How reproducible is it? (always / intermittent / one-time)
- When did it start? (after which change/commit?)

### 2. Form hypotheses
- List 2-4 plausible root causes, ranked by likelihood
- For each: what would confirm it? what would rule it out?

### 3. Isolate
- Find the narrowest reproduction case
- Use binary search on the code path: log/breakpoint halfway, check state
- Check assumptions: is the input what you think? is the config loaded? is the dependency version correct?

### 4. Fix and verify
- Make the minimal fix
- Verify the original bug case is resolved
- Check: could this fix break anything else?

## Rules
- **Don't guess and change random things** — each change should test a specific hypothesis
- **Don't fix symptoms** — find the root cause
- **Don't add debug logging and move on** — remove debug code after fixing
- **Reproduce first, fix second** — if you can't reproduce, you can't verify
- **One change at a time** — changing multiple things at once hides which one worked

## When stuck
- Re-examine assumptions: are you sure the error is where you think it is?
- Check the stack trace / logs one level deeper
- Read the library/framework source for the failing line — not just the docs
- Simplify: remove code until the bug disappears, then add back until it reappears
