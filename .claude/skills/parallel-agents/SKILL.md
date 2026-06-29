---
name: parallel-agents
description: Pattern for decomposing and running independent work in parallel using the Agent tool. Use when the user has a task that can be split into independent parallel subtasks.
---

# Parallel Agents

Strategy for decomposing work into parallel Agent calls to maximize throughput.

## When to parallelize

Good candidates for parallel agents:
- Tasks that don't depend on each other's results
- Independent file read/analysis operations
- Multiple independent code changes in different files
- Research across multiple sources simultaneously
- Running independent validation checks

## Pattern

1. **Identify independent units** — break the overall task into pieces that don't share state
2. **Scope each agent clearly** — each agent gets a self-contained prompt with explicit output expectations
3. **Launch in parallel** — send all Agent tool calls in a single message
4. **Synthesize results** — after all agents return, merge findings and proceed

## Guidelines
- Each agent prompt must be self-contained (agents have no memory of the conversation)
- Specify the output format you want from each agent
- Don't over-parallelize — 2-4 agents is usually the sweet spot
- If one agent's result changes what another should do, those must be sequential
- Use `run_in_background: true` for agents whose results you don't need immediately
