// icons.js
// Inline SVG icons for the game. Ship icons are simple top-down silhouettes,
// one per ship type, with distinct lengths and superstructure so each ship is
// recognizable. Hulls use fill="currentColor" so CSS can recolor them
// (e.g. red when a ship is sunk); detail shapes use a fixed dark colour.

const DETAIL = '#0b1220';

// Carrier (size 5) — long flat-top deck with an island and a center runway.
const carrier = `
<svg viewBox="0 0 50 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M3 4 H40 L47 10 L40 16 H3 Z" fill="currentColor"/>
  <line x1="7" y1="10" x2="42" y2="10" stroke="${DETAIL}" stroke-width="1.6" stroke-dasharray="3 2"/>
  <rect x="32" y="5" width="4" height="3" rx="1" fill="${DETAIL}"/>
</svg>`;

// Battleship (size 4) — heavy hull with a central superstructure and turrets.
const battleship = `
<svg viewBox="0 0 44 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M3 5 H34 L42 10 L34 15 H3 Z" fill="currentColor"/>
  <rect x="18" y="6" width="5" height="8" rx="1" fill="${DETAIL}"/>
  <circle cx="10" cy="10" r="2" fill="${DETAIL}"/>
  <circle cx="29" cy="10" r="2" fill="${DETAIL}"/>
</svg>`;

// Cruiser (size 3) — medium hull with a bridge and a forward turret.
const cruiser = `
<svg viewBox="0 0 38 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M3 5 H29 L36 10 L29 15 H3 Z" fill="currentColor"/>
  <rect x="15" y="6" width="4" height="8" rx="1" fill="${DETAIL}"/>
  <circle cx="9" cy="10" r="2" fill="${DETAIL}"/>
</svg>`;

// Submarine (size 3) — rounded hull with a conning tower.
const submarine = `
<svg viewBox="0 0 38 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="4" y="7" width="26" height="6" rx="3" fill="currentColor"/>
  <path d="M29 7 L37 10 L29 13 Z" fill="currentColor"/>
  <rect x="15" y="4" width="5" height="4" rx="1" fill="${DETAIL}"/>
  <line x1="17.5" y1="2" x2="17.5" y2="5" stroke="${DETAIL}" stroke-width="1.4"/>
</svg>`;

// Destroyer (size 2) — small, sleek hull with a bridge and one turret.
const destroyer = `
<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M3 6 H22 L28 10 L22 14 H3 Z" fill="currentColor"/>
  <rect x="13" y="7" width="3" height="6" rx="1" fill="${DETAIL}"/>
  <circle cx="8" cy="10" r="1.8" fill="${DETAIL}"/>
</svg>`;

// Map ship id → icon markup.
export const SHIP_ICONS = {
  carrier,
  battleship,
  cruiser,
  submarine,
  destroyer,
};

// A muted "unknown" placeholder shown for enemy ships that haven't been sunk yet.
export const HIDDEN_ICON = `
<svg viewBox="0 0 38 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="3" y="4" width="32" height="12" rx="3" fill="none" stroke="currentColor"
        stroke-width="1.4" stroke-dasharray="3 3"/>
  <text x="19" y="14" text-anchor="middle" font-size="11" font-weight="700"
        fill="currentColor">?</text>
</svg>`;

// Missile icon used in the "HIT!" flash — flies in from the left, nose to the right.
export const MISSILE_ICON = `
<svg viewBox="0 0 52 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M8 12 L0 7 L4 12 L0 17 Z" fill="#f97316"/>
  <rect x="9" y="9" width="27" height="6" rx="3" fill="#cbd5e1"/>
  <path d="M36 9 L48 12 L36 15 Z" fill="#ef4444"/>
  <path d="M12 9 L7 4 L17 9 Z" fill="#94a3b8"/>
  <path d="M12 15 L7 20 L17 15 Z" fill="#94a3b8"/>
</svg>`;
