// ui.js
// Handles all DOM rendering, user interaction, overlays, and shipyard panels.

import { Game, PHASE } from './game.js';
import { SHIPS, ORIENTATION, ATTACK_RESULT, BOARD_SIZE } from './constants.js';

const COLUMN_LABELS = 'ABCDEFGHIJ';

export class UI {
  constructor() {
    this.game = new Game();
    this.orientation = ORIENTATION.HORIZONTAL;
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
    this.mainBtn = document.getElementById('main-btn');
    this.overlayEl = document.getElementById('overlay');
    this.overlayText = document.getElementById('overlay-text');
    this.playerShipyardList = document.getElementById('player-shipyard-list');
    this.enemyShipyardList = document.getElementById('enemy-shipyard-list');
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

    this.mainBtn.addEventListener('click', () => this._handleMainBtn());
  }

  // The main button cycles through states: Place Ships → Start Game → Play Again.
  _handleMainBtn() {
    const phase = this.game.phase;

    if (phase === PHASE.INITIAL) {
      // "Place Ships" clicked → show Phase 1 overlay, then enter placement.
      this.game.beginPlacement();
      this._showOverlay('Phase 1: Place your ships', () => {
        this.render();
      });
      return;
    }

    if (phase === PHASE.PLACEMENT && this.game.allShipsPlaced) {
      // "Start Game" clicked → show "Time to Battle!" then start playing.
      this.game.startBattle();
      this._showOverlay('Time to Battle!', () => {
        this.log('Battle started! Fire at the enemy waters.');
        this.render();
      });
      return;
    }

    if (phase === PHASE.OVER) {
      // "Play Again" clicked.
      this.game.reset();
      this.orientation = ORIENTATION.HORIZONTAL;
      this.busy = false;
      this.clearLog();
      this.render();
    }
  }

  // ---- Overlay ----------------------------------------------------------

  _showOverlay(text, callback) {
    this.overlayText.textContent = text;
    this.overlayEl.classList.remove('hidden');
    setTimeout(() => {
      this.overlayEl.classList.add('hidden');
      if (callback) callback();
    }, 1500);
  }

  // ---- Rendering --------------------------------------------------------

  render() {
    this._renderMainBtn();
    this._renderControls();
    this._renderStatus();
    this._renderShipyards();
    this._renderBoard(this.playerBoardEl, this.game.playerBoard, {
      revealShips: true,
      isEnemy: false,
    });
    this._renderBoard(this.enemyBoardEl, this.game.aiBoard, {
      revealShips: this.game.phase === PHASE.OVER,
      isEnemy: true,
    });
  }

  _renderMainBtn() {
    const phase = this.game.phase;
    const btn = this.mainBtn;

    if (phase === PHASE.INITIAL) {
      btn.textContent = 'Place Ships';
      btn.className = 'btn-green';
      btn.disabled = false;
      btn.style.display = 'inline-block';
    } else if (phase === PHASE.PLACEMENT) {
      btn.textContent = 'Start Game';
      if (this.game.allShipsPlaced) {
        btn.className = 'btn-green';
        btn.disabled = false;
      } else {
        btn.className = 'btn-disabled';
        btn.disabled = true;
      }
      btn.style.display = 'inline-block';
    } else if (phase === PHASE.PLAYING) {
      btn.style.display = 'none';
    } else if (phase === PHASE.OVER) {
      btn.textContent = 'Play Again';
      btn.className = 'btn-green';
      btn.disabled = false;
      btn.style.display = 'inline-block';
    }
  }

  _renderControls() {
    const showToolbar = this.game.phase === PHASE.PLACEMENT;
    this.placementControls.style.display = showToolbar ? 'flex' : 'none';
  }

  _renderStatus() {
    let msg = '';
    const phase = this.game.phase;

    if (phase === PHASE.INITIAL) {
      msg = 'Click "Place Ships" to begin setting up your fleet.';
    } else if (phase === PHASE.PLACEMENT) {
      const ship = this.game.currentShipToPlace;
      if (ship) {
        msg = `Place your ${ship.name} (size ${ship.size}). Orientation: ${this.orientation}.`;
      } else {
        msg = 'All ships placed. Press "Start Game" to begin!';
      }
    } else if (phase === PHASE.PLAYING) {
      msg = 'Your turn — click the enemy board to fire.';
    } else if (phase === PHASE.OVER) {
      msg =
        this.game.winner === 'player'
          ? 'Victory! You sank the entire enemy fleet.'
          : 'Defeat! The enemy sank your fleet.';
    }
    this.statusEl.textContent = msg;
  }

  // ---- Shipyard panels --------------------------------------------------

  _renderShipyards() {
    this._renderPlayerShipyard();
    this._renderEnemyShipyard();
  }

  _renderPlayerShipyard() {
    const list = this.playerShipyardList;
    list.innerHTML = '';
    const phase = this.game.phase;

    for (const ship of SHIPS) {
      const li = document.createElement('li');
      li.className = 'shipyard-item';

      const isPlaced = this.game.placedShipIds.has(ship.id);
      const isSelected = this.game.selectedShipId === ship.id;

      if (isPlaced) {
        li.classList.add('placed');
      } else if (isSelected) {
        li.classList.add('selected');
      }

      // Make unplaced ships clickable during placement.
      if (phase === PHASE.PLACEMENT && !isPlaced) {
        li.classList.add('selectable');
        li.addEventListener('click', () => {
          this.game.selectShip(ship.id);
          this.render();
        });
      }

      // Ship name.
      const nameSpan = document.createElement('span');
      nameSpan.textContent = ship.name;
      li.appendChild(nameSpan);

      // Dots representing ship size.
      const dots = document.createElement('span');
      dots.className = 'ship-dots';
      for (let i = 0; i < ship.size; i++) {
        const dot = document.createElement('span');
        dot.className = 'ship-dot';
        dots.appendChild(dot);
      }
      li.appendChild(dots);

      list.appendChild(li);
    }
  }

  _renderEnemyShipyard() {
    const list = this.enemyShipyardList;
    list.innerHTML = '';

    for (const ship of SHIPS) {
      const li = document.createElement('li');
      li.className = 'shipyard-item';

      // Check if this enemy ship has been sunk.
      const enemyShip = this.game.aiBoard.ships.find((s) => s.id === ship.id);
      if (enemyShip && enemyShip.hits >= enemyShip.size) {
        li.classList.add('sunk-enemy');
      }

      const nameSpan = document.createElement('span');
      nameSpan.textContent = ship.name;
      li.appendChild(nameSpan);

      const dots = document.createElement('span');
      dots.className = 'ship-dots';
      for (let i = 0; i < ship.size; i++) {
        const dot = document.createElement('span');
        dot.className = 'ship-dot';
        dots.appendChild(dot);
      }
      li.appendChild(dots);

      list.appendChild(li);
    }
  }

  // ---- Board rendering --------------------------------------------------

  _renderBoard(container, board, { revealShips, isEnemy }) {
    container.innerHTML = '';
    container.appendChild(this._labelCell(''));
    for (let c = 0; c < BOARD_SIZE; c++) {
      container.appendChild(this._labelCell(COLUMN_LABELS[c]));
    }
    for (let r = 0; r < BOARD_SIZE; r++) {
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
    if (!shipDef) return;

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
      r, c, shipDef.size, this.orientation
    );
    const valid = this.game.playerBoard.canPlaceShip(
      r, c, shipDef.size, this.orientation
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
      this.log('You win! Every enemy ship is sunk.');
      return;
    }

    this.busy = true;
    this.render();
    setTimeout(() => this._runAiTurn(), 600);
  }

  _runAiTurn() {
    const outcome = this.game.aiFire();
    this._logShot('Enemy', outcome.row, outcome.col, outcome);
    this.busy = false;
    this.render();

    if (outcome.gameOver) {
      this.log('The enemy sank your fleet. Better luck next time!');
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
