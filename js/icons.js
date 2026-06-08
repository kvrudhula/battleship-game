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

// Submarine (size 3) — top-down view: a smooth cigar hull with symmetric bow
// dive planes and a centered sail (conning tower) seen from above.
const submarine = `
<svg viewBox="0 0 38 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- Hull: rounded stern (left), tapered bow (right) -->
  <path d="M3 10 C3 7 6 6 10 6 H27 C32 6 36 8 36 10 C36 12 32 14 27 14 H10 C6 14 3 13 3 10 Z" fill="currentColor"/>
  <!-- Bow dive planes, port and starboard (symmetric = top-down) -->
  <rect x="22" y="3.5" width="4" height="3" rx="1" fill="currentColor"/>
  <rect x="22" y="13.5" width="4" height="3" rx="1" fill="currentColor"/>
  <!-- Sail / conning tower seen from above -->
  <rect x="14" y="7" width="7" height="6" rx="2.5" fill="${DETAIL}"/>
  <!-- Deck centerline seam -->
  <line x1="8" y1="10" x2="32" y2="10" stroke="${DETAIL}" stroke-width="0.9" stroke-dasharray="2 2" opacity="0.6"/>
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
