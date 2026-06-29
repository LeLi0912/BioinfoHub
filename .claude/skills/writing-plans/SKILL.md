---
name: writing-plans
description: Write structured implementation plans before writing code. Use when the user needs a step-by-step plan, an architecture design doc, or a breakdown of a complex task before execution.
---

# Writing Plans

Produce a structured plan that the user can review and approve before implementation begins.

## Plan Structure

Every plan must include:

1. **Goal** — one sentence: what are we building and why?
2. **Scope** — what's in, what's explicitly out (avoid creep)
3. **Files to touch** — list every file that will be created or modified, with a one-line description of the change
4. **Step-by-step** — numbered steps in execution order:
   - Each step is a discrete, verifiable change
   - Steps that are independent are marked [P] (can parallelize)
   - Steps include the exact function/schema/route names where applicable
5. **Risks & edge cases** — what could go wrong, what boundary conditions to watch
6. **Test plan** — how to verify correctness after implementation

## Principles
- **No code in the plan** — describe what to build, not how to write it. Implementation details (exact code) belong in the implementation phase, not the plan.
- **Prefer editing existing files** over creating new ones
- **Don't over-engineer** — three similar lines is better than a premature abstraction
- **Plan for the current task only** — no future-proofing or "we might need" features
- **If the plan needs user decisions**, call them out explicitly before proceeding

## Output
- Write the plan to the plan file (use Write tool)
- Call ExitPlanMode when ready for user approval
- After approval, proceed step-by-step, marking each done
