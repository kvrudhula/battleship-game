// ui.js
// The UI class owns all DOM rendering and user interaction. It talks to the
// Game controller for rules/state and never manipulates game state directly.

import { Game, PHASE } from './game.js';
import { SHIPS, ORIENTATION, ATTACK_RESULT, BOARD_SIZE } from './constants.js';

const COLUMN_LABELS = 'ABCDEFGHIJ';

export class UI {
  constructor() {
    this.game = new Game();
    // Orientation used for the next player ship placement.
    this.orientation = ORIENTATION.HORIZONTAL;
    // Whether the AI is mid-turn (used to lock the board against double input).
    this.busy = false;

    this._cacheDom();
    this._bindEvents();
    this.render();
  }

  _cacheDom() {
    this.playerBoardEl = document.getElementById('player-board');
    this.enemyBoardEl = document.getElementById('enemy-board');
    this.statusEl = document.getElementById('status');
    this.logEl = document.getElementById('log');
    this.placementControls = document.getElementById('placement-controls');
    this.rotateBtn = document.getElementById('rotate-btn');
    this.randomBtn = document.getElementById('random-btn');
    this.clearBtn = document.getElementById('clear-btn');
    this.startBtn = document.getElementById('start-btn');
    this.playAgainBtn = document.getElementById('play-again-btn');
  }

  _bindEvents() {
    this.rotateBtn.addEventListener('click', () => {
      this.orientation =
        this.orientation === ORIENTATION.HORIZONTAL
          ? ORIENTATION.VERTICAL
          : ORIENTATION.HORIZONTAL;
      this.render();
    });

    this.randomBtn.addEventListener('click', () => {
      this.game.randomizePlayerShips();
      this.render();
    });

    this.clearBtn.addEventListener('click', () => {
      this.game.clearPlayerShips();
      this.render();
    });

    this.startBtn.addEventListener('click', () => {
      if (this.game.startBattle()) {
        this.log('Battle started! Fire at the enemy waters.');
        this.render();
      }
    });

    this.playAgainBtn.addEventListener('click', () => {
      this.game.reset();
      this.orientation = ORIENTATION.HORIZONTAL;
      this.busy = false;
      this.clearLog();
      this.render();
    });
  }

  // ---- Rendering ---------------------------------------------------------

  render() {
    this._renderControls();
    this._renderStatus();
    this._renderBoard(this.playerBoardEl, this.game.playerBoard, {
      revealShips: true,
      isEnemy: false,
    });
    this._renderBoard(this.enemyBoardEl, this.game.aiBoard, {
      // Only reveal the enemy fleet once the game is over.
      revealShips: this.game.phase === PHASE.OVER,
      isEnemy: true,
    });
  }

  _renderControls() {
    const inPlacement = this.game.phase === PHASE.PLACEMENT;
    this.placementControls.style.display = inPlacement ? 'flex' : 'none';
    this.startBtn.disabled = !this.game.allShipsPlaced;
    this.playAgainBtn.style.display =
      this.game.phase === PHASE.OVER ? 'inline-block' : 'none';
  }

  _renderStatus() {
    let msg = '';
    if (this.game.phase === PHASE.PLACEMENT) {
      const ship = this.game.currentShipToPlace;
      if (ship) {
        msg = `Place your ${ship.name} (size ${ship.size}). Orientation: ${this.orientation}.`;
      } else {
        msg = 'All ships placed. Press "Start Game" to begin!';
      }
    } else if (this.game.phase === PHASE.PLAYING) {
      msg = 'Your turn — click the enemy board to fire.';
    } else if (this.game.phase === PHASE.OVER) {
      msg =
        this.game.winner === 'player'
          ? '🎉 Victory! You sank the entire enemy fleet.'
          : '💥 Defeat! The enemy sank your fleet.';
    }
    this.statusEl.textContent = msg;
  }

  // Builds an 11x11 grid (labels + cells) for a board and wires interactions.
  _renderBoard(container, board, { revealShips, isEnemy }) {
    container.innerHTML = '';

    // Top-left corner spacer.
    container.appendChild(this._labelCell(''));
    // Column headers A–J.
    for (let c = 0; c < BOARD_SIZE; c++) {
      container.appendChild(this._labelCell(COLUMN_LABELS[c]));
    }

    for (let r = 0; r < BOARD_SIZE; r++) {
      // Row header 1–10.
      container.appendChild(this._labelCell(String(r + 1)));
      for (let c = 0; c < BOARD_SIZE; c++) {
        container.appendChild(this._gameCell(board, r, c, revealShips, isEnemy));
      }
    }
  }

  _labelCell(text) {
    const el = document.createElement('div');
    el.className = 'cell label';
    el.textContent = text;
    return el;
  }

  _gameCell(board, r, c, revealShips, isEnemy) {
    const el = document.createElement('div');
    el.className = 'cell';
    el.dataset.row = r;
    el.dataset.col = c;

    const ship = board.grid[r][c];
    const wasShot = board.shots[r][c];

    if (wasShot && ship) {
      el.classList.add(ship.hits >= ship.size ? 'sunk' : 'hit');
    } else if (wasShot && !ship) {
      el.classList.add('miss');
    } else if (ship && revealShips) {
      el.classList.add('ship');
    }

    if (isEnemy) {
      this._wireEnemyCell(el, r, c);
    } else if (this.game.phase === PHASE.PLACEMENT) {
      this._wirePlacementCell(el, r, c);
    }
    return el;
  }

  // ---- Placement interaction --------------------------------------------

  _wirePlacementCell(el, r, c) {
    const shipDef = this.game.currentShipToPlace;
    if (!shipDef) return; // All ships placed; nothing to preview.

    el.classList.add('placeable');

    el.addEventListener('mouseenter', () => {
      this._previewPlacement(r, c, shipDef);
    });
    el.addEventListener('mouseleave', () => {
      this._clearPreview();
    });
    el.addEventListener('click', () => {
      const ok = this.game.placePlayerShip(r, c, this.orientation);
      if (!ok) {
        this.log('Invalid placement — ships must stay on the board and not overlap.');
      }
      this.render();
    });
  }

  _previewPlacement(r, c, shipDef) {
    const cells = this.game.playerBoard.computeCells(
      r,
      c,
      shipDef.size,
      this.orientation
    );
    const valid = this.game.playerBoard.canPlaceShip(
      r,
      c,
      shipDef.size,
      this.orientation
    );
    for (const [pr, pc] of cells) {
      const sel = `[data-row="${pr}"][data-col="${pc}"]`;
      const cellEl = this.playerBoardEl.querySelector(sel);
      if (cellEl) cellEl.classList.add(valid ? 'preview-ok' : 'preview-bad');
    }
  }

  _clearPreview() {
    this.playerBoardEl
      .querySelectorAll('.preview-ok, .preview-bad')
      .forEach((el) => el.classList.remove('preview-ok', 'preview-bad'));
  }

  // ---- Battle interaction ------------------------------------------------

  _wireEnemyCell(el, r, c) {
    const playable =
      this.game.phase === PHASE.PLAYING &&
      !this.busy &&
      !this.game.aiBoard.shots[r][c];
    if (playable) el.classList.add('targetable');

    el.addEventListener('click', () => {
      if (this.game.phase !== PHASE.PLAYING || this.busy) return;
      this._handlePlayerShot(r, c);
    });
  }

  _handlePlayerShot(r, c) {
    const outcome = this.game.playerFire(r, c);
    if (outcome.result === ATTACK_RESULT.REPEAT) {
      this.log("You've already fired there — pick another cell.");
      return;
    }

    this._logShot('You', r, c, outcome);
    this.render();

    if (outcome.gameOver) {
      this.log('🎉 You win! Every enemy ship is sunk.');
      return;
    }

    // Hand the turn to the AI after a short pause so the player can follow.
    this.busy = true;
    this.render(); // Re-render to disable targeting while the AI "thinks".
    setTimeout(() => this._runAiTurn(), 600);
  }

  _runAiTurn() {
    const outcome = this.game.aiFire();
    this._logShot('Enemy', outcome.row, outcome.col, outcome);
    this.busy = false;
    this.render();

    if (outcome.gameOver) {
      this.log('💥 The enemy sank your fleet. Better luck next time!');
    }
  }

  // ---- Logging -----------------------------------------------------------

  _logShot(who, r, c, outcome) {
    const coord = `${COLUMN_LABELS[c]}${r + 1}`;
    let verb;
    switch (outcome.result) {
      case ATTACK_RESULT.MISS:
        verb = 'missed';
        break;
      case ATTACK_RESULT.HIT:
        verb = 'hit a ship';
        break;
      case ATTACK_RESULT.SUNK:
        verb = `sank the ${outcome.sunkShip ? outcome.sunkShip.name : 'ship'}`;
        break;
      default:
        verb = 'fired';
    }
    this.log(`${who} fired at ${coord} and ${verb}.`);
  }

  log(message) {
    const entry = document.createElement('li');
    entry.textContent = message;
    this.logEl.prepend(entry);
  }

  clearLog() {
    this.logEl.innerHTML = '';
  }
}
