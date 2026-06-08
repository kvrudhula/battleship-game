# ⚓ Battleship

A browser-based Battleship game playable against an AI opponent. Built with
**plain HTML, CSS, and JavaScript** — no frameworks, no build step.

Each ship is drawn as a custom **top-down icon** stretched across its full
length, with animated hit/sink overlays and per-side shipyards that track the
fleets.

## Play

Open `index.html` through a local web server (ES modules require `http://`,
not `file://`):

```bash
# from the repo root
python3 -m http.server 8000
# then visit http://localhost:8000
```

Or play the live version (see the deployed URL in the repository description).

## How to play

1. **Press "Place Ships"** (green button) to start the placement phase. A
   **"Phase 1: Place your ships"** banner appears.
2. **Place your fleet.** Pick a ship from **Your Shipyard** (or place them in
   order): Carrier (5), Battleship (4), Cruiser (3), Submarine (3),
   Destroyer (2). Use **Rotate ship** to switch between horizontal and
   vertical, then click a cell on *Your Fleet* to drop the ship. A green
   preview means the placement is valid; orange means it is blocked (out of
   bounds or overlapping).
   - **Random placement** fills your board automatically.
   - **Clear board** starts placement over.
3. **Start Game** — the button turns green once all five ships are placed.
   Clicking it shows a **"Time to Battle!"** banner.
4. **Fire** by clicking cells on *Enemy Waters*. The game alternates turns with
   the AI.
5. First side to sink the opponent's entire fleet wins. Press **Play Again**
   to reset.

## Visual features

- **Ship icons on the board.** Every ship is drawn as a single top-down icon
  stretched edge-to-edge across its cells (e.g. the Carrier spans 5 cells), in
  both orientations.
- **Status colours** (see the on-screen legend):
  - Your ships are **white** while intact.
  - A struck cell turns **green** — only the hit portion of the icon, not the
    whole ship.
  - When a ship is fully sunk, the entire icon turns **red**.
  - Misses are shown as a grey dot.
- **Enemy ships stay hidden** until sunk, then reveal their icon in red.
- **Shipyards** flank both boards: *Your Shipyard* (left) and *Enemy Fleet*
  (right). Your icons are always visible; enemy icons are hidden until that
  ship is sunk. Both track which ships have been sunk.
- **Animated overlays:**
  - **"HIT!"** with a missile graphic when you hit an enemy ship; **"You've
    been Hit!"** when the enemy hits you.
  - **"You have sunk an Enemy [Ship]"** / **"The Enemy has sunk your [Ship]"**
    with the matching ship icon when a ship is sunk.

## AI strategy

The AI uses a classic **hunt-and-target** approach:

- **Hunt:** fires at random cells using a checkerboard parity pattern (the
  smallest ship is length 2, so it must cover a parity cell — this finds ships
  faster than pure random).
- **Target:** after a hit, it queues the adjacent cells. Once two hits line up,
  it restricts follow-up shots to the two ends of that line until the ship is
  sunk, then returns to hunting.

## Project structure

```
index.html        # Markup and layout
styles.css        # All styling
js/constants.js   # Board size, ship definitions, enums
js/board.js       # Board model: placement, attacks, win detection
js/ai.js          # Hunt-and-target AI
js/game.js        # Rules + turn order (UI-agnostic)
js/icons.js       # Top-down SVG ship icons + missile graphic
js/ui.js          # DOM rendering, overlays, shipyards, interaction
js/main.js        # Entry point
```

## Edge cases handled

- Invalid ship placement (out of bounds or overlapping) is rejected with a
  message; the ship is not consumed.
- Out-of-bounds shots are impossible (you can only click real cells) and are
  also rejected at the model layer.
- Repeated shots on an already-fired cell are ignored and do not waste a turn.
- The "Start Game" button is disabled until all five ships are placed.

## Testing & bug reports

- [`BUG_REPORT_SUMMARY.md`](BUG_REPORT_SUMMARY.md) — a one-page summary of all
  testing, bugs found and fixes, and verification.
- [`BUG_REPORT.md`](BUG_REPORT.md) — full per-round testing notes and
  verification screenshots.
