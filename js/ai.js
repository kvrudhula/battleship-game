// ai.js
// AIPlayer implements a classic "hunt and target" Battleship strategy:
//   - HUNT mode: fire at random untried cells (using a checkerboard parity
//     pattern, since the smallest ship is length 2 and therefore must touch a
//     parity cell — this finds ships faster than pure random).
//   - TARGET mode: after a hit, queue the orthogonally-adjacent cells and fire
//     at them. Once two or more hits line up, restrict follow-up shots to that
//     line's two ends for efficiency. On a sink, return to HUNT mode.

import { BOARD_SIZE } from './constants.js';

const MODE = { HUNT: 'hunt', TARGET: 'target' };

export class AIPlayer {
  constructor(size = BOARD_SIZE) {
    this.size = size;
    // Set of "r,c" strings the AI has already fired at.
    this.tried = new Set();
    this.mode = MODE.HUNT;
    // Stack of candidate [r,c] cells to try while targeting.
    this.targetQueue = [];
    // Cells that have been hit for the ship currently being targeted.
    this.currentHits = [];
  }

  reset() {
    this.tried.clear();
    this.mode = MODE.HUNT;
    this.targetQueue = [];
    this.currentHits = [];
  }

  _key(r, c) {
    return `${r},${c}`;
  }

  _inBounds(r, c) {
    return r >= 0 && r < this.size && c >= 0 && c < this.size;
  }

  // Returns the four orthogonal neighbours of a cell that are in bounds and
  // have not yet been fired at.
  _untriedNeighbours(r, c) {
    const deltas = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    const result = [];
    for (const [dr, dc] of deltas) {
      const nr = r + dr;
      const nc = c + dc;
      if (this._inBounds(nr, nc) && !this.tried.has(this._key(nr, nc))) {
        result.push([nr, nc]);
      }
    }
    return result;
  }

  // Chooses the next cell to fire at. Returns [row, col].
  nextShot() {
    // Drain the target queue first, skipping any cells already fired at.
    while (this.mode === MODE.TARGET && this.targetQueue.length > 0) {
      const [r, c] = this.targetQueue.pop();
      if (!this.tried.has(this._key(r, c))) {
        return [r, c];
      }
    }

    // Nothing queued -> hunt. Prefer parity cells, fall back to any free cell.
    this.mode = MODE.HUNT;
    const parityCells = [];
    const allCells = [];
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        if (this.tried.has(this._key(r, c))) continue;
        allCells.push([r, c]);
        if ((r + c) % 2 === 0) parityCells.push([r, c]);
      }
    }
    const pool = parityCells.length > 0 ? parityCells : allCells;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Records the outcome of the AI's shot so future shots can adapt.
  // result is one of ATTACK_RESULT (miss/hit/sunk).
  recordResult(row, col, result) {
    this.tried.add(this._key(row, col));

    if (result === 'hit') {
      this.mode = MODE.TARGET;
      this.currentHits.push([row, col]);
      this._enqueueAroundHits();
    } else if (result === 'sunk') {
      // Ship destroyed: clear targeting state and resume hunting.
      this.mode = MODE.HUNT;
      this.targetQueue = [];
      this.currentHits = [];
    }
    // A miss in target mode simply leaves the queue to be drained next turn.
  }

  // Rebuilds the target queue based on the hits collected for the current ship.
  // With a single hit, queue all neighbours. With multiple aligned hits, only
  // queue the two ends of the line for efficient finishing.
  _enqueueAroundHits() {
    this.targetQueue = [];
    if (this.currentHits.length === 1) {
      const [r, c] = this.currentHits[0];
      for (const cell of this._untriedNeighbours(r, c)) {
        this.targetQueue.push(cell);
      }
      return;
    }

    // Determine whether hits are in a row or a column.
    const rows = this.currentHits.map(([r]) => r);
    const cols = this.currentHits.map(([, c]) => c);
    const sameRow = rows.every((r) => r === rows[0]);
    const sameCol = cols.every((c) => c === cols[0]);

    if (sameRow) {
      const r = rows[0];
      const minC = Math.min(...cols);
      const maxC = Math.max(...cols);
      for (const c of [minC - 1, maxC + 1]) {
        if (this._inBounds(r, c) && !this.tried.has(this._key(r, c))) {
          this.targetQueue.push([r, c]);
        }
      }
    } else if (sameCol) {
      const c = cols[0];
      const minR = Math.min(...rows);
      const maxR = Math.max(...rows);
      for (const r of [minR - 1, maxR + 1]) {
        if (this._inBounds(r, c) && !this.tried.has(this._key(r, c))) {
          this.targetQueue.push([r, c]);
        }
      }
    } else {
      // Hits are not collinear (adjacent ships). Fall back to neighbours of
      // every hit so we don't get stuck.
      for (const [r, c] of this.currentHits) {
        for (const cell of this._untriedNeighbours(r, c)) {
          this.targetQueue.push(cell);
        }
      }
    }
  }
}
