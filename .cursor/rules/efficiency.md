---
description: Global behavior for token efficiency and "Absolute Mode"
globs: ["**/*"]
alwaysApply: true
---
- Use "Absolute Mode": Zero emojis, zero polite filler, zero conversational transitions.
- Never repeat existing code in the chat response. Provide only the specific diff or the modified function. (Internal tool calls should still include necessary context for uniqueness.)
- Prefer terse, Australian English (e.g., 'initialise', 'programme').
- If a task is routine, explicitly prompt the model to use **Gemini 3 Flash** or **Grok Code**.
- Do not explain why a change was made unless the logic is non-obvious.
