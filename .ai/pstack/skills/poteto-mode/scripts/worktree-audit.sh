#!/usr/bin/env bash
# Local worktree inventory only; no deletion, transcript access or default network.
# Usage: worktree-audit.sh [repo-path] [--fetch]
set -u
repo=""; fetch=no
for arg in "$@"; do
  case "$arg" in
    --fetch) fetch=yes ;;
    --help|-h) printf 'Usage: worktree-audit.sh [repo-path] [--fetch]\nLocal cached refs by default. --fetch explicitly refreshes origin/main.\n'; exit 0 ;;
    --*) echo "unknown option: $arg" >&2; exit 2 ;;
    *) if [ -n "$repo" ]; then echo 'pass only one repo path' >&2; exit 2; fi; repo="$arg" ;;
  esac
done
repo="${repo:-$(git rev-parse --show-toplevel 2>/dev/null)}"
[ -z "$repo" ] && { echo 'not in a git repo; pass a repo path' >&2; exit 1; }
cd "$repo" || exit 1
git rev-parse --git-dir >/dev/null 2>&1 || exit 1
if [ "$fetch" = yes ]; then
  git fetch origin main --quiet || echo 'warn: fetch failed; cached refs may be stale' >&2
fi
now=$(date +%s)
main_wt=""
printf 'SIZE\tAGE\tMERGED_CACHED\tDIRTY\tREMOTE_CACHED\tBUCKET\tWORKTREE\n'
while IFS= read -r -d '' record; do
  case "$record" in worktree\ *) wt="${record#worktree }" ;; *) continue ;; esac
  if [ -z "$main_wt" ]; then main_wt="$wt"; continue; fi
  if ! git -C "$wt" status --porcelain >/dev/null 2>&1; then
    printf '?\t?\tunknown\tunknown\tunknown\thold-status-unavailable\t%s\n' "$wt"
    continue
  fi
  size=$(du -sh "$wt" 2>/dev/null | cut -f1)
  head=$(git -C "$wt" rev-parse HEAD 2>/dev/null)
  head_ts=$(git -C "$wt" log -1 --format='%ct' HEAD 2>/dev/null || echo 0)
  age='?'
  if [ "$head_ts" -gt 0 ] 2>/dev/null; then age="$(( (now - head_ts) / 86400 ))d"; fi
  merged=unknown
  if git rev-parse --verify origin/main >/dev/null 2>&1; then
    git merge-base --is-ancestor "$head" origin/main 2>/dev/null && merged=YES || merged=no
  fi
  dirty=clean; tracked=0; untracked=0
  while IFS= read -r -d '' change; do
    case "$change" in
      '??'*) untracked=$((untracked + 1)) ;;
      *) tracked=$((tracked + 1)); case "${change:0:2}" in *R*|*C*) IFS= read -r -d '' ignored_source || true ;; esac ;;
    esac
  done < <(git -C "$wt" status --porcelain=v1 -z 2>/dev/null)
  if [ "$tracked" -gt 0 ] || [ "$untracked" -gt 0 ]; then dirty="tracked:$tracked,untracked:$untracked"; fi
  branch=$(git -C "$wt" symbolic-ref --quiet --short HEAD 2>/dev/null || echo '')
  remote=detached
  if [ -n "$branch" ]; then
    remote=no-remote
    if git -C "$wt" show-ref --verify --quiet "refs/remotes/origin/$branch"; then
      [ "$(git -C "$wt" rev-parse "origin/$branch")" = "$head" ] && remote=pushed || remote=diverged
    fi
  fi
  bucket=review-usage-and-ignored-files
  [ "$dirty" != clean ] && bucket=hold-uncommitted
  printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\n' "$size" "$age" "$merged" "$dirty" "$remote" "$bucket" "$wt"
done < <(git worktree list --porcelain -z)
