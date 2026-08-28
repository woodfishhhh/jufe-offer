---
name: jufe-mobile-ui
description: Build or review responsive public UI in the JUFE Offer repository, especially mobile layout, touch ergonomics, optional Canvas effects, route performance, and browser acceptance for the homepage, resources, or friends surfaces.
---

# JUFE Mobile UI

Keep the public site recognizable while making its default mobile experience fast, readable, and comfortable to use.

## Before editing

1. Read the repository `AGENTS.md` and inspect the dirty worktree. Preserve unrelated changes.
2. Read the relevant guide under `node_modules/next/dist/docs/` before changing Next.js boundaries, dynamic imports, routing, images, or caching.
3. Read [references/mobile-contract.md](references/mobile-contract.md) for the route, breakpoint, effects, and acceptance contracts.
4. Inspect the affected real route at a narrow and a desktop viewport before changing it.

## Implementation rules

- Design mobile from the base styles. Phones use natural document scrolling and the bottom primary navigation.
- Keep meaningful content in ordinary DOM. Canvas, Matter, Three.js, GSAP, and experimental HTML-in-Canvas are optional enhancement layers.
- Load enhanced modules only when the viewport is at least 1024px, the primary pointer is fine, performance hints allow effects, and the surface is visible.
- Pause animation loops while offscreen or when the document is hidden.
- Keep primary touch targets at least 44px square and the mobile dock targets at least 48px tall.
- Preserve resource API/DTO semantics, including the backend `origin` field. Do not reintroduce public automated-source labels.
- Keep the resource directory as one continuous list: render the first batch promptly and lazy-render every remaining match as the sentinel approaches the viewport.
- Avoid `networkidle` as the readiness signal. Use `domcontentloaded`, route-specific selectors, and bounded waits.
- Do not commit, push, deploy, mutate production data, or exercise authenticated mutations unless the user separately authorizes it.

## Acceptance

Run the repository checks plus:

```powershell
pnpm test:mobile-ui -- --base-url http://127.0.0.1:3000 --mode ci
```

Use `--mode full` for final responsive coverage. The script writes reproducible reports and screenshots under `.cache/mobile-audit/`. Also exercise the affected interactions in a real browser and inspect console and same-origin network failures.
