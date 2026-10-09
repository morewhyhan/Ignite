---
name: no-comments
description: Review scoped comments and fix accepted code problems while preserving necessary constraints and intent. Use for explicit comment cleanup; independent Comment Sicko review is conditional on useful authorized delegation.
---

# No comments

Remove comments that merely narrate code or preserve an obsolete workaround. Preserve information needed to understand a real constraint or intent until code or retained documentation communicates it.

## Review the actual scope

Use the caller's files or diff. Otherwise inspect the current diff against the verified base branch, including relevant working-tree changes. Read [.ai/pstack/agents/comment-sicko.md](../../agents/comment-sicko.md) as a review lens, subject to the preservation and authorization rules here.

Review directly for a small scope. When fresh independent scrutiny is useful and delegation is authorized, assign the scoped files and role to a read-only delegate through the actual host API. A registered Comment Sicko type is optional. Disclose when no independent reviewer ran. A review role cannot enlarge the write scope or authorize deletion.

## Decide each finding from evidence

Check accepted findings against the actual code, caller, external dependency and relevant Feature or Design. Reject scope escapes, ungrounded claims and deletions that discard needed information.

For an ambiguous IMPORTANT, do not remove or constraint comment, trace the symbol with how. Use why only if the historical reason is disputed and affects the decision. Unknown or out-of-scope constraints stay visible in the comment or an appropriate existing document, with the gap recorded in the matching Plan. Ambiguity is not permission to delete.

Fix trivial accepted code issues within authorization. If the fix needs a changed shape, use architect for the scoped design. Remove obsolete workaround comments after the root cause is corrected and the information is no longer needed. Unresolved root causes remain open; do not manufacture a guard merely to remove a comment.

## Encode a confirmed constraint

Prefer an in-scope type, runtime check, behavior test or lint rule that makes the confirmed constraint hold. Follow [engineering standards](../../../../docs/standards/README.md) and record consequential choices under [Plan rules](../../../../docs/plans/README.md). A structural encoding does not replace required behavior evidence.

Implement encodings already covered by authorization. For a product decision or work outside the scope, retain the necessary information and present the concrete remaining decision. Remove the comment only after the code or retained documentation carries its meaning.

## Report the result

State accepted fixes, important retained constraints, actual verification and remaining work. Counts and reviewer provenance are useful only when they help assess the result. Do not require an architect sketch, rerun report or empty encoding list when that branch did not occur. Apply technical-writing and unslop.
