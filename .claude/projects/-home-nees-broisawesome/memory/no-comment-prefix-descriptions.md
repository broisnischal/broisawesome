---
name: no-comment-prefix-descriptions
description: User dislikes the "// ..." comment-style prefix on page description/subtitle text
metadata:
  type: feedback
---

Do not use the `// ` comment-style prefix on visible page description / subtitle / empty-state text in routes (e.g. the muted `<p>` under each page `<h1>`). Plain text only.

**Why:** The user is pruning decorative styling across the personal site (broisawesome) and finds the faux-code-comment prefix to be unwanted decoration.

**How to apply:** Write subtitles as plain prose ("my last 10 games on lichess", "sites I like and revisit"). This is a site-wide convention now — removed from chess, activity, listening, writing, config, notes, portfolio-curation, use. Only applies to visible UI text, not actual JS/TS code comments.
