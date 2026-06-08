# ⚓ Battleship

A browser-based Battleship game playable against an AI opponent. Built with
**plain HTML, CSS, and JavaScript** — no frameworks, no build step.

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

1. **Place your fleet.** You place all five ships in order: Carrier (5),
   Battleship (4), Cruiser (3), Submarine (3), Destroyer (2). Use **Rotate
   ship** to switch between horizontal and vertical, then click a cell on
   *Your Fleet* to drop the ship. A green preview means the placement is valid;
   orange means it is blocked (out of bounds or overlapping).
   - **Random placement** fills your board automatically.
   - **Clear board** starts placement over.
2. **Start Game** once all ships are placed.
3. **Fire** by clicking cells on *Enemy Waters*. Hits are red, misses are grey.
4. First side to sink the opponent's entire fleet wins. Press **Play Again**
   to reset.

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
js/ui.js          # DOM rendering and user interaction
js/main.js        # Entry point
```

## Edge cases handled

- Invalid ship placement (out of bounds or overlapping) is rejected with a
  message; the ship is not consumed.
- Out-of-bounds shots are impossible (you can only click real cells) and are
  also rejected at the model layer.
- Repeated shots on an already-fired cell are ignored and do not waste a turn.
- The "Start Game" button is disabled until all five ships are placed.
