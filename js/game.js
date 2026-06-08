// game.js
// Game ties the two boards and the AI together and enforces the rules and the
// turn order. It is UI-agnostic: it exposes methods the UI calls and reports
// outcomes back via return values.

import { Board, placeShipsRandomly } from './board.js';
import { AIPlayer } from './ai.js';
import { SHIPS, ATTACK_RESULT } from './constants.js';

export const PHASE = {
  PLACEMENT: 'placement', // Player is still placing ships.
  PLAYING: 'playing', // Battle in progress.
  OVER: 'over', // Someone has won.
};

export class Game {
  constructor() {
    this.reset();
  }

  // Starts a brand new game in the placement phase.
  reset() {
    this.playerBoard = new Board();
    this.aiBoard = new Board();
    this.ai = new AIPlayer();
    this.phase = PHASE.PLACEMENT;
    this.winner = null; // 'player' | 'ai'
    // Index into SHIPS for the next ship the player must place.
    this.placementIndex = 0;
    // The AI's fleet is placed up front and stays hidden until the game ends.
    placeShipsRandomly(this.aiBoard, SHIPS);
  }

  // The ship definition the player should place next, or null if done.
  get currentShipToPlace() {
    return SHIPS[this.placementIndex] || null;
  }

  // True once the player has placed all five ships.
  get allShipsPlaced() {
    return this.placementIndex >= SHIPS.length;
  }

  // Attempts to place the player's current ship. Returns true on success.
  placePlayerShip(row, col, orientation) {
    if (this.phase !== PHASE.PLACEMENT) return false;
    const shipDef = this.currentShipToPlace;
    if (!shipDef) return false;
    const ship = this.playerBoard.placeShip(shipDef, row, col, orientation);
    if (!ship) return false; // Invalid placement (overlap / out of bounds).
    this.placementIndex += 1;
    return true;
  }

  // Randomizes the player's entire fleet (clears any manual placement).
  randomizePlayerShips() {
    if (this.phase !== PHASE.PLACEMENT) return;
    placeShipsRandomly(this.playerBoard, SHIPS);
    this.placementIndex = SHIPS.length;
  }

  // Clears the player's board so they can place again from scratch.
  clearPlayerShips() {
    if (this.phase !== PHASE.PLACEMENT) return;
    this.playerBoard.reset();
    this.placementIndex = 0;
  }

  // Transitions from placement to the battle phase. Returns false if the
  // player has not finished placing their fleet.
  startBattle() {
    if (this.phase !== PHASE.PLACEMENT || !this.allShipsPlaced) return false;
    this.phase = PHASE.PLAYING;
    return true;
  }

  // The player fires at the AI's board at (row, col).
  // Returns { result, sunkShip, gameOver } where result is an ATTACK_RESULT.
  // A REPEAT result means the shot was ignored and the player keeps their turn.
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

  // The AI takes a single shot at the player's board.
  // Returns { row, col, result, sunkShip, gameOver }.
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
