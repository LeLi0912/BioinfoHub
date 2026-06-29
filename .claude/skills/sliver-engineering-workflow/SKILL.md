---
name: sliver-engineering-workflow
description: Break work into thin vertical slivers — end-to-end, independently shippable increments that each deliver a complete slice of value. Use when the user wants to plan or execute work incrementally rather than in horizontal layers.
---

# Sliver Engineering Workflow

Build in **vertical slivers** — thin, end-to-end slices of functionality — rather than horizontal layers.

## Core Principle

A sliver is the smallest unit of work that:
- Is **end-to-end complete** (UI → API → DB, or equivalent full stack)
- Is **independently shippable** — can be deployed and used on its own
- Delivers **user-visible value** — not just infrastructure or scaffolding
- Is **small** — a single PR, ideally a few files, not a multi-week branch

## Why Slivers

Horizontal (layer-first) approach builds all backend, then all frontend — nothing works until the end. Slivers invert this: each increment produces something working and usable.

## Workflow

### 1. Identify the sliver
Start with the user's goal and ask: *"What's the thinnest slice that would be useful?"*

A good sliver answers: *"The user can now do X"*, not *"The database layer for X is done."*

### 2. Scope one sliver
- List every file that must change to make the sliver work end-to-end
- If the list is >6-8 files, the sliver is too thick — split further
- Include: route + service + model + UI component + test

### 3. Build the sliver
- Work from the outside in (start with the API contract or UI, then wire inward)
- Keep each layer minimal — just enough to make the sliver work
- No "future-proofing" abstractions — the next sliver will inform the real abstraction

### 4. Verify and land
- Test the sliver independently: does the user-visible behavior work?
- Merge/deploy before starting the next sliver
- Use the learning from this sliver to inform the scope of the next one

## Example

Instead of:
```
Sliver 1: All database models + migrations
Sliver 2: All API routes
Sliver 3: All React pages
```

Do:
```
Sliver 1: List tools on a page (tools table + GET /api/tools + ToolList component)
Sliver 2: Search for a tool (search index + GET filter + search input)
Sliver 3: View tool detail (slug lookup + GET /api/tools/:slug + DetailPage)
```

Each sliver is shippable. Each sliver teaches you something about the real design.

## Anti-patterns
- **The "setup" sliver** — infrastructure, auth, config with no user value
- **The "all models first" sliver** — building tables for features that don't exist yet
- **The "framework" sliver** — building an abstraction layer before you have two concrete cases
- **Slivers that are still too thick** — if it takes more than a day, split it
