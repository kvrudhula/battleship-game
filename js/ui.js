// ui.js
// Handles all DOM rendering, user interaction, overlays, and shipyard panels.

import { Game, PHASE } from './game.js';
import { SHIPS, ORIENTATION, ATTACK_RESULT, BOARD_SIZE } from './constants.js';
import { SHIP_ICONS, HIDDEN_ICON, MISSILE_ICON } from './icons.js';

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
    this.flashEl = document.getElementById('flash-overlay');
    this.flashContent = document.getElementById('flash-content');
    this.flashText = document.getElementById('flash-text');
    this.flashIcon = document.getElementById('flash-icon');
    this.playerShipyardList = document.getElementById('player-shipyard-list');
    this.enemyShipyardList = document.getElementById('enemy-shipyard-list');
    this._flashTimer = null;
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

  // A brief, non-blocking flash shown on a hit or sink. `type` is 'hit' or
  // 'sunk'; `iconHtml` is optional SVG markup shown to the right of the text.
  _showFlash(text, type, iconHtml = '') {
    clearTimeout(this._flashTimer);
    this.flashText.textContent = text;
    this.flashIcon.innerHTML = iconHtml;
    this.flashContent.className = `flash-content ${type}`;
    this.flashEl.classList.remove('hidden');
    // Restart the CSS animation each time the flash is shown.
    this.flashContent.style.animation = 'none';
    void this.flashContent.offsetWidth;
    this.flashContent.style.animation = '';
    this._flashTimer = setTimeout(() => {
      this.flashEl.classList.add('hidden');
    }, 1100);
  }

  // Picks the right flash for a shot outcome. `who` is 'player' or 'ai'.
  _flashForOutcome(outcome, who) {
    if (outcome.result === ATTACK_RESULT.SUNK && outcome.sunkShip) {
      const name = outcome.sunkShip.name;
      const icon = SHIP_ICONS[outcome.sunkShip.id] || '';
      const text =
        who === 'player'
          ? `You have sunk an Enemy ${name}`
          : `The Enemy has sunk your ${name}`;
      this._showFlash(text, 'sunk', icon);
      return true;
    }
    if (outcome.result === ATTACK_RESULT.HIT) {
      const text = who === 'player' ? 'HIT!' : "You've been Hit!";
      this._showFlash(text, 'hit', MISSILE_ICON);
      return true;
    }
    return false;
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

  // Builds the icon element for a shipyard item. `iconHtml` is the SVG markup;
  // pass `hidden` to render it in the muted "unknown" state.
  _shipIcon(iconHtml, hidden = false) {
    const icon = document.createElement('span');
    icon.className = hidden ? 'ship-icon hidden-icon' : 'ship-icon';
    icon.innerHTML = iconHtml;
    return icon;
  }

  // Builds the name + size-dots column for a shipyard item.
  _shipMeta(ship) {
    const meta = document.createElement('span');
    meta.className = 'ship-meta';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'ship-name';
    nameSpan.textContent = ship.name;
    meta.appendChild(nameSpan);

    const dots = document.createElement('span');
    dots.className = 'ship-dots';
    for (let i = 0; i < ship.size; i++) {
      const dot = document.createElement('span');
      dot.className = 'ship-dot';
      dots.appendChild(dot);
    }
    meta.appendChild(dots);
    return meta;
  }

  _renderPlayerShipyard() {
    const list = this.playerShipyardList;
    list.innerHTML = '';
    const phase = this.game.phase;
    // Once the battle begins, the shipyard stops tracking placement and starts
    // tracking which of the player's ships have been sunk.
    const inBattle = phase === PHASE.PLAYING || phase === PHASE.OVER;

    for (const ship of SHIPS) {
      const li = document.createElement('li');
      li.className = 'shipyard-item';

      if (inBattle) {
        const shipObj = this.game.playerBoard.ships.find((s) => s.id === ship.id);
        if (shipObj && shipObj.hits >= shipObj.size) {
          li.classList.add('sunk-ally');
        }
      } else {
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
      }

      // The player's own ship icons are always visible.
      li.appendChild(this._shipIcon(SHIP_ICONS[ship.id]));
      li.appendChild(this._shipMeta(ship));
      list.appendChild(li);
    }
  }

  _renderEnemyShipyard() {
    const list = this.enemyShipyardList;
    list.innerHTML = '';

    for (const ship of SHIPS) {
      const li = document.createElement('li');
      li.className = 'shipyard-item';

      // Reveal the enemy ship's icon only once it has been sunk.
      const enemyShip = this.game.aiBoard.ships.find((s) => s.id === ship.id);
      const isSunk = enemyShip && enemyShip.hits >= enemyShip.size;
      if (isSunk) li.classList.add('sunk-enemy');

      const icon = isSunk
        ? this._shipIcon(SHIP_ICONS[ship.id])
        : this._shipIcon(HIDDEN_ICON, true);
      li.appendChild(icon);
      li.appendChild(this._shipMeta(ship));
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
    // Add stretched ship-icon overlays on top of the cells.
    this._renderShipOverlays(container, board, revealShips, isEnemy);
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

    if (isEnemy) {
      // Enemy board: green ✕ for hit-not-sunk; sunk cells have no bg (icon handles it)
      if (wasShot && ship) {
        if (ship.hits < ship.size) {
          el.classList.add('hit');
        }
      } else if (wasShot && !ship) {
        el.classList.add('miss');
      }
    } else {
      // Player board: only show miss dots. Ship/hit/sunk visuals handled by overlay icon.
      if (wasShot && !ship) {
        el.classList.add('miss');
      }
    }

    if (isEnemy) {
      this._wireEnemyCell(el, r, c);
    } else if (this.game.phase === PHASE.PLACEMENT) {
      this._wirePlacementCell(el, r, c);
    }
    return el;
  }

  // Renders ship icons that stretch the full length of each ship.
  // Uses per-cell clip-path layers for individual hit colouring.
  // Player board: always visible. Enemy board: only when the ship is sunk.
  _renderShipOverlays(container, board, revealShips, isEnemy) {
    const CELL = 28;
    const GAP = 2;
    const STEP = CELL + GAP; // 30px per cell slot
    const PAD = 6; // board padding

    for (const ship of board.ships) {
      const show = isEnemy ? ship.hits >= ship.size : revealShips;
      if (!show) continue;

      const [r0, c0] = ship.cells[0];
      const horiz = ship.orientation === 'horizontal';
      const len = ship.size;

      // Top-left of the ship's footprint, relative to the board's padding box.
      const left = PAD + (c0 + 1) * STEP;
      const top = PAD + (r0 + 1) * STEP;
      // Length of the ship in px (spanning all of its cells incl. gaps).
      const span = len * CELL + (len - 1) * GAP;

      const isSunk = ship.hits >= ship.size;

      // Helper: creates one overlay layer with the full icon inside.
      const makeLayer = (colorClass) => {
        const overlay = document.createElement('div');
        overlay.className = 'ship-overlay' + (colorClass ? ' ' + colorClass : '');
        overlay.style.width = `${span}px`;
        overlay.style.height = `${CELL}px`;
        if (horiz) {
          overlay.style.left = `${left}px`;
          overlay.style.top = `${top}px`;
        } else {
          overlay.style.left = `${left + CELL}px`;
          overlay.style.top = `${top}px`;
          overlay.style.transformOrigin = 'top left';
          overlay.style.transform = 'rotate(90deg)';
        }
        overlay.innerHTML = SHIP_ICONS[ship.id] || '';
        // Force SVG to stretch without preserving aspect ratio
        const svg = overlay.querySelector('svg');
        if (svg) svg.setAttribute('preserveAspectRatio', 'none');
        return overlay;
      };

      if (isSunk) {
        // Sunk: one full overlay in red
        container.appendChild(makeLayer('ship-overlay-sunk'));
      } else {
        // Base layer: white (intact portions)
        container.appendChild(makeLayer(''));
        // Hit layers: one green clip per hit cell
        for (let i = 0; i < len; i++) {
          const [cr, cc] = ship.cells[i];
          if (!board.shots[cr][cc]) continue;
          const clipLeft = i * STEP;
          const clipRight = span - (i * STEP + CELL);
          const layer = makeLayer('ship-overlay-hit');
          layer.style.clipPath = `inset(0 ${clipRight}px 0 ${clipLeft}px)`;
          container.appendChild(layer);
        }
      }
    }
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
    const flashed = this._flashForOutcome(outcome, 'player');

    if (outcome.gameOver) {
      this.log('You win! Every enemy ship is sunk.');
      return;
    }

    this.busy = true;
    this.render();
    // Give a flash time to play before the AI fires (and shows its own flash).
    setTimeout(() => this._runAiTurn(), flashed ? 1300 : 600);
  }

  _runAiTurn() {
    const outcome = this.game.aiFire();
    this._logShot('Enemy', outcome.row, outcome.col, outcome);
    this.busy = false;
    this.render();
    this._flashForOutcome(outcome, 'ai');

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
