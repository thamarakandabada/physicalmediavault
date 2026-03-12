

## Problem

The current Oracle pool logic is too restrictive:
- Only includes standalone `Film` titles and children of `Film Collection` parents
- Excludes standalone `Documentary` and `Concert Film` titles
- Excludes children of non-"Film Collection" parent types

## Requirement

Include **all titles except TV**, but for collections (parents), only include the children, not the parent record itself. New titles added to any collection should automatically appear.

## Current media types in DB
`Film`, `Film Collection`, `Documentary`, `Concert Film`, `TV`

## Plan

**File: `src/pages/Oracle.tsx`** — Replace the `eligible` useMemo (lines 24-48):

1. Build a `Set<string>` of IDs that are referenced as `parent_id` by other titles (these are collection/parent records)
2. Filter all titles to:
   - Exclude `media_type === "TV"`
   - Exclude any title whose `id` is in the parent set (collection parents — their children are already separate rows)
3. Apply existing runtime and 4K filters

This is fully automatic — any new media type or collection child is included without code changes.

