// game.js
// Game ties the two boards and the AI together and enforces the rules and the
// turn order. It is UI-agnostic: it exposes methods the UI calls and reports
// outcomes back via return values.

import { Board, placeShipsRandomly } from './board.js';
import { AIPlayer } from './ai.js';
import { SHIPS, ATTACK_RESULT } from './constants.js';

export const PHASE = {
  INITIAL: 'initial', // Waiting for player to click "Place Ships".
  PLACEMENT: 'placement', // Player is placing ships.
  PLAYING: 'playing', // Battle in progress.
  OVER: 'over', // Someone has won.
};

export class Game {
  constructor() {
    this.reset();
  }

  reset() {
    this.playerBoard = new Board();
    this.aiBoard = new Board();
    this.ai = new AIPlayer();
    this.phase = PHASE.INITIAL;
    this.winner = null;
    // Track which ships have been placed by ID.
    this.placedShipIds = new Set();
    // The currently selected ship (set by the player via shipyard).
    this.selectedShipId = null;
    // The AI's fleet is placed up front.
    placeShipsRandomly(this.aiBoard, SHIPS);
  }

  // Transition from INITIAL → PLACEMENT.
  beginPlacement() {
    if (this.phase !== PHASE.INITIAL) return false;
    this.phase = PHASE.PLACEMENT;
    // Auto-select the first ship.
    this.selectedShipId = SHIPS[0].id;
    return true;
  }

  // Select which ship to place next (called from shipyard click).
  selectShip(shipId) {
    if (this.phase !== PHASE.PLACEMENT) return false;
    if (this.placedShipIds.has(shipId)) return false; // Already placed.
    this.selectedShipId = shipId;
    return true;
  }

  // Returns the ship definition for the currently selected ship, or null.
  get currentShipToPlace() {
    if (!this.selectedShipId) return null;
    return SHIPS.find((s) => s.id === this.selectedShipId) || null;
  }

  // True once all 5 ships are placed.
  get allShipsPlaced() {
    return this.placedShipIds.size >= SHIPS.length;
  }

  // Attempts to place the selected ship at the given position.
  placePlayerShip(row, col, orientation) {
    if (this.phase !== PHASE.PLACEMENT) return false;
    const shipDef = this.currentShipToPlace;
    if (!shipDef) return false;
    const ship = this.playerBoard.placeShip(shipDef, row, col, orientation);
    if (!ship) return false;
    this.placedShipIds.add(shipDef.id);
    // Auto-select the next unplaced ship.
    this._autoSelectNext();
    return true;
  }

  // Auto-select the first unplaced ship (in standard order).
  _autoSelectNext() {
    const next = SHIPS.find((s) => !this.placedShipIds.has(s.id));
    this.selectedShipId = next ? next.id : null;
  }

  // Randomizes the player's entire fleet.
  randomizePlayerShips() {
    if (this.phase !== PHASE.PLACEMENT) return;
    placeShipsRandomly(this.playerBoard, SHIPS);
    this.placedShipIds = new Set(SHIPS.map((s) => s.id));
    this.selectedShipId = null;
  }

  // Clears the player's board so they can place again from scratch.
  clearPlayerShips() {
    if (this.phase !== PHASE.PLACEMENT) return;
    this.playerBoard.reset();
    this.placedShipIds.clear();
    this.selectedShipId = SHIPS[0].id;
  }

  // Transitions to battle phase.
  startBattle() {
    if (this.phase !== PHASE.PLACEMENT || !this.allShipsPlaced) return false;
    this.phase = PHASE.PLAYING;
    return true;
  }

  // Player fires at the AI's board.
  playerFire(row, col) {
    if (this.phase !== PHASE.PLAYING) {
      return { result: ATTACK_RESULT.REPEAT, gameOver: false };
    }
    if (this.aiBoard.alreadyShot(row, col)) {
      return { result: ATTACK_RESULT.REPEAT, gameOver: false };
    }

    const result = this.aiBoard.receiveAttack(row, col);
    let sunkShip = null;
    if (result === ATTACK_RESULT.SUNK) {
      sunkShip = this.aiBoard.grid[row][col];
    }

    if (this.aiBoard.allShipsSunk()) {
      this.phase = PHASE.OVER;
      this.winner = 'player';
      return { result, sunkShip, gameOver: true };
    }
    return { result, sunkShip, gameOver: false };
  }

  // AI fires at the player's board.
  aiFire() {
    if (this.phase !== PHASE.PLAYING) {
      return { gameOver: this.phase === PHASE.OVER };
    }
    const [row, col] = this.ai.nextShot();
    const result = this.playerBoard.receiveAttack(row, col);
    this.ai.recordResult(row, col, result);

    let sunkShip = null;
    if (result === ATTACK_RESULT.SUNK) {
      sunkShip = this.playerBoard.grid[row][col];
    }

    if (this.playerBoard.allShipsSunk()) {
      this.phase = PHASE.OVER;
      this.winner = 'ai';
      return { row, col, result, sunkShip, gameOver: true };
    }
    return { row, col, result, sunkShip, gameOver: false };
  }
}
