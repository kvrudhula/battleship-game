// board.js
// The Board class models a single 10x10 Battleship grid: where ships sit and
// which cells have been fired at. It is deliberately UI-agnostic so it can be
// reused for both the human player and the AI.

import { BOARD_SIZE, ORIENTATION, ATTACK_RESULT } from './constants.js';

export class Board {
  constructor(size = BOARD_SIZE) {
    this.size = size;
    // grid[r][c] holds a reference to the ship occupying that cell, or null.
    this.grid = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => null)
    );
    // Tracks which cells have already been fired at to reject repeat shots.
    this.shots = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => false)
    );
    // All ships currently placed on the board.
    this.ships = [];
  }

  // Returns true if (row, col) is inside the board bounds.
  inBounds(row, col) {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  // Computes the list of [row, col] cells a ship would occupy for a given
  // anchor (top-left) position and orientation. Does NOT validate bounds.
  computeCells(row, col, size, orientation) {
    const cells = [];
    for (let i = 0; i < size; i++) {
      if (orientation === ORIENTATION.HORIZONTAL) {
        cells.push([row, col + i]);
      } else {
        cells.push([row + i, col]);
      }
    }
    return cells;
  }

  // Validates whether a ship of `size` can be placed at the anchor position.
  // Rejects out-of-bounds placement and any overlap with an existing ship.
  canPlaceShip(row, col, size, orientation) {
    const cells = this.computeCells(row, col, size, orientation);
    for (const [r, c] of cells) {
      if (!this.inBounds(r, c)) return false; // Out of bounds.
      if (this.grid[r][c] !== null) return false; // Overlaps another ship.
    }
    return true;
  }

  // Places a ship on the board. Returns the created ship object, or null if
  // the placement was invalid (caller should handle the null).
  placeShip(shipDef, row, col, orientation) {
    if (!this.canPlaceShip(row, col, shipDef.size, orientation)) {
      return null;
    }
    const cells = this.computeCells(row, col, shipDef.size, orientation);
    const ship = {
      id: shipDef.id,
      name: shipDef.name,
      size: shipDef.size,
      cells,
      hits: 0,
      orientation,
    };
    for (const [r, c] of cells) {
      this.grid[r][c] = ship;
    }
    this.ships.push(ship);
    return ship;
  }

  // Removes all ships and resets shots — used when re-randomizing placement.
  reset() {
    this.grid = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => null)
    );
    this.shots = Array.from({ length: this.size }, () =>
      Array.from({ length: this.size }, () => false)
    );
    this.ships = [];
  }

  // Applies an attack at (row, col).
  // Returns one of ATTACK_RESULT. REPEAT means the cell was already fired at
  // and the turn should not be consumed.
  receiveAttack(row, col) {
    if (!this.inBounds(row, col)) return ATTACK_RESULT.REPEAT;
    if (this.shots[row][col]) return ATTACK_RESULT.REPEAT;

    this.shots[row][col] = true;
    const ship = this.grid[row][col];
    if (!ship) return ATTACK_RESULT.MISS;

    ship.hits += 1;
    return ship.hits >= ship.size ? ATTACK_RESULT.SUNK : ATTACK_RESULT.HIT;
  }

  // True once every placed ship has been fully sunk.
  allShipsSunk() {
    return this.ships.length > 0 && this.ships.every((s) => s.hits >= s.size);
  }

  // Returns true if the given cell has already been fired at.
  alreadyShot(row, col) {
    return this.inBounds(row, col) && this.shots[row][col];
  }
}

// Randomly places all of the provided ship definitions on a board.
// Used for the AI and for the player's "Random" placement helper.
export function placeShipsRandomly(board, shipDefs) {
  board.reset();
  for (const shipDef of shipDefs) {
    let placed = false;
    // Retry until a valid spot is found. With a 10x10 board and 5 ships this
    // terminates quickly, but we cap attempts to avoid any infinite loop.
    let attempts = 0;
    while (!placed && attempts < 1000) {
      attempts += 1;
      const orientation =
        Math.random() < 0.5 ? ORIENTATION.HORIZONTAL : ORIENTATION.VERTICAL;
      const row = Math.floor(Math.random() * board.size);
      const col = Math.floor(Math.random() * board.size);
      if (board.placeShip(shipDef, row, col, orientation)) {
        placed = true;
      }
    }
  }
  return board;
}
