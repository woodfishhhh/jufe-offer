# JUFE Offer mobile contract

## Layout and navigation

- Phone: below 768px. Natural page scroll, fixed bottom tabs for 首页 / 资源 / 友链, safe-area padding.
- Tablet or constrained mode: 768–1023px, coarse pointer, reduced motion, Save-Data, 2G, low memory, or low CPU. Natural scroll and lightweight content.
- Enhanced desktop: at least 1024px, fine pointer, and no constrained-device hint. Full-screen homepage Deck and optional visual effects are allowed.
- Test the exact edges around 640px, 768px, and 1024px. The minimum supported viewport width is 320px.

## Route contracts

- `/1`–`/6`: mobile sections scroll naturally; the visible section replaces the numeric path without adding history entries. Default mobile Canvas count is zero.
- `/resources`: default mobile rendering is a continuous feed with no Canvas. Render 20 initial cards, then automatically append batches of 20 as the lazy sentinel approaches the viewport until every matching resource is reachable. Search/category/sort/view URL parameters and the existing API stay compatible.
- `/friends`: mobile and constrained devices render the readable directory with zero Canvas. Enhanced desktop may show the interactive map.
- `/friends/orbit`: explicit opt-in map route with at most one Canvas and a 48px return control.
- `/playground/navigation` is not part of the public mobile acceptance matrix.

## Visual language

- Preserve the red, black, white palette, school emblem, editorial typography, and numbered story structure.
- Prefer strong hierarchy, quiet surfaces, rounded cards, thin borders, and restrained red accents over decorative clutter.
- Frequent UI feedback uses 100–180ms transform/color transitions. Gate hover effects behind fine-pointer media queries and remove motion transforms for reduced-motion users.

## Required checks

- No horizontal document overflow, clipped fixed controls, hydration errors, page errors, or unexpected same-origin 4xx/5xx.
- Primary controls are at least 44×44px; mobile dock items are at least 48px tall.
- Resource initial DOM contains at most 20 cards; scrolling to the lazy sentinel appends another batch without requiring pagination controls.
- Mobile `/1`–`/6`, `/resources`, and `/friends` contain zero Canvas; `/friends/orbit` contains no more than one.
- Validate 320×700, 390×844, 412×915, 768×1024, 1024×768, and 1440×900 plus breakpoint edges.
- Record performance separately from structural CI checks. Use three controlled runs before claiming an improvement.
