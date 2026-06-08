# Bug Report — Summary

A succinct summary of all testing, bugs found and fixes, and verification across
the build and every refinement round. The full details, per-round testing notes,
and screenshots live in [`BUG_REPORT.md`](BUG_REPORT.md).

## Testing performed

- **Headless logic tests (Node.js)** — 919 assertions covering ship placement
  (valid, out-of-bounds, overlap), attacks (hit/miss/repeat/out-of-bounds/sink),
  200 random-placement iterations, 500 full simulated AI games (no repeat or
  out-of-bounds shots; fleet always sunk, ~58.5 shots avg), and full game flow.
- **Browser end-to-end tests** — a recorded playthrough for each round
  (placement → battle → victory → Play Again), exercising invalid-placement
  rejection, rotation, repeat-shot rejection, hit/miss/sunk rendering, AI
  hunt-and-target, win/loss detection, and clean reset. Console checked for
  errors after every run.

## Bugs found and how they were fixed

| Round | Bug | Cause | Fix |
|------|-----|-------|-----|
| 5 | Vertical ship icons rendered too small and misaligned | Only the inner `<svg>` was rotated, so the icon was laid out in a 28 px-wide column (never stretched to the ship's length) and drifted off its footprint because rotation pivots around the element centre | Build the overlay horizontally (`width = span`, `height = CELL`), then rotate the **whole overlay** 90° about its top-left corner and offset `left` by one cell width so it lands back on the ship's cells |

This was the **only** bug found in the entire project, and it was caught and
fixed during development before the recorded run. Every other round passed on the
first full playthrough with no functional bugs and no console errors.

## Feature rounds (all verified, no bugs)

- **Initial build** — 10×10 boards, manual placement of all 5 ships, AI
  hunt-and-target, win/loss detection, Play Again.
- **Placement UI** — "Place Ships" button, "Phase 1" overlay, dual shipyards,
  "Start Game" enable-on-complete, "Time to Battle!" overlay.
- **Round 3** — player shipyard tracks sunk ships; green hits; "HIT!" missile
  flash; sink messages; custom top-down ship icons in both shipyards.
- **Round 4** — ship icons rendered on the board cells.
- **Round 5** — single ship icon stretched across the ship's full length.
- **Round 6** — icon-only ships (no grey background) with status colours.
- **Round 7** — full-length edge-to-edge stretch + per-cell green hit colouring.
- **Round 8** — submarine icon redrawn as a true top-down view.
- **Round 9** — reworded overlays: "You have sunk an Enemy [Ship]", "The Enemy
  has sunk your [Ship]", and "You've been Hit!".

## Verification

- All edge cases handled: invalid/out-of-bounds placement, out-of-bounds and
  repeated shots, and win/loss detection — surfaced clearly in the UI.
- Each round was verified on the live deployment with screenshots (see
  `docs/images/`) and recorded playthroughs.
- No known functional bugs remain.

- **Live game:** https://battleship-game-kris-vrudhula-s-projects.vercel.app
- **Repo:** https://github.com/kvrudhula/battleship-game
