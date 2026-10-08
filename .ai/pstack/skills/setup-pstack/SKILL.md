---
name: setup-pstack
description: Configure optional project-local pstack role models using the current host capabilities. Use for setup-pstack or a requested change to role model choices; defaults inherit the current host.
---

# Setup pstack

Configure this project's optional role choices in .ai/pstack/config.json. Do not write a Cursor global rule or modify account/model settings.

1. Detect the current host's actual available model IDs and supported reasoning efforts from its exposed capability list. Never invent IDs by appending effort tokens.
2. Read the local JSON. schema is 1; model_policy is inherit-current-host; roles maps a role name to a model ID or a list of model IDs. Missing roles, auto and inherit-parent mean omit the model override. Panel lists set the number of seats only when that panel is appropriate for the task. An empty roles object leaves all tasks on the current host model.
3. Use choices already authorized by the user. For a requested model change without an actual preference, show the available choices and tradeoffs. Reasoning effort remains inherited unless explicitly selected and supported; it is not part of a model ID.
4. Validate each real ID against current capabilities. An unavailable configured ID is reported and the role inherits the current model; do not guess another model or paid service. A list does not authorize an unnecessary multi-model experiment.
5. Update only .ai/pstack/config.json. Idempotent reruns preserve unaffected roles.
6. Report the changed roles and the actual host limitations. Every role-selection entry reads this JSON before dispatch, so no installed global rule or new session promise is needed. This config is an instruction convention; it does not install a scheduler, model engine or remote service.

Examples of role names are feature, refactoring; bug-fix; hillclimb; judgment and prose; how explorer; how explainer; why investigators; why synthesizer; reflect tooling; reflect judgment, divergent, synthesizer; arena runners; arena cross-judge pool; swarm workers; architect runners; interrogate reviewers.
