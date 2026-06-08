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

| Round | Bug | Found by | Cause | Fix |
|------|-----|----------|-------|-----|
| 5 | Vertical ship icons rendered too small and misaligned | Devin (during dev) | Only the inner `<svg>` was rotated, so the icon was laid out in a 28 px-wide column (never stretched to the ship's length) and drifted off its footprint because rotation pivots around the element centre | Build the overlay horizontally (`width = span`, `height = CELL`), then rotate the **whole overlay** 90° about its top-left corner and offset `left` by one cell width so it lands back on the ship's cells |
| 10 | Status text always read "Your turn — click the enemy board to fire." even during the enemy's turn | **Kris V** (during play) | `_renderStatus()` used one hard-coded string for the whole `PLAYING` phase and never checked whose turn it was, despite the `busy` flag already tracking it | Branch on `this.busy`: show "Enemy's turn — incoming fire!" while the AI is firing, otherwise "Your turn …". `busy` is already toggled around the AI turn, so the status updates automatically |

Two bugs were found across the project. The Round 5 icon bug was caught by Devin
during development; the Round 10 turn-status bug was reported by Kris V during
play. Both were fixed and verified with before/after screenshots. Every other
round passed on the first full playthrough with no functional bugs and no console
errors.

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
- **Round 10** — fixed the turn-status bug above; also increased the post-shot
  delay before the AI responds (~1.4s miss / ~2s hit) so it feels like the AI is
  "thinking".
- **Round 11** — on a player loss, reveal the enemy's surviving ships (intact in
  white; partially-hit ships show un-hit cells white and hit cells green; sunk
  ships red); also tuned the AI delay down to ~1.0s miss / ~1.65s hit.

## Verification

- All edge cases handled: invalid/out-of-bounds placement, out-of-bounds and
  repeated shots, and win/loss detection — surfaced clearly in the UI.
- Each round was verified on the live deployment with screenshots (see
  `docs/images/`) and recorded playthroughs.
- No known functional bugs remain.

- **Live game:** https://battleship-game-kris-vrudhula-s-projects.vercel.app
- **Repo:** https://github.com/kvrudhula/battleship-game
