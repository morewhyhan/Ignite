
### Authoring or modifying a skill

**You own the skill's voice.**

1. Use the actual host skill-creator. Resolve an existing bridge to canonical before editing; new project skills go in .ai/skills/<name>/SKILL.md.
2. Run node scripts/pstack-sync.mjs --write to update metadata bridges/catalog/source hashes. Validate the skill: frontmatter has `name` and `description`, referenced files exist, cross-skill links resolve.
3. Test cases if structural. Skip if subjective.
4. Keep method-only validation proportional to the asset. Meaningful executable helpers get behavior checks; do not create model speed experiments to prove wording. Use Opening a PR only within authorized publication scope.

When in doubt, delete. Keep only prose that changes a decision. Tell it to do the thing and skip the reason. Explain only when the rule is confusing without one. Match tone to scope. Point at structural sources (types, READMEs, config) per the **encode-lessons-in-structure** principle skill. Delegate to other skills by path. Don't restate. A workflow you keep hitting but isn't captured → propose a new skill.

**Reply:** summary of the skill, key design decisions, validation notes.
