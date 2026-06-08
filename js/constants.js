// constants.js
// Shared constants for the Battleship game.

// The board is a standard 10x10 grid.
export const BOARD_SIZE = 10;

// The five standard Battleship ships, in the order players place them.
// `id` is a stable identifier, `size` is the number of cells the ship occupies.
export const SHIPS = [
  { id: 'carrier', name: 'Carrier', size: 5 },
  { id: 'battleship', name: 'Battleship', size: 4 },
  { id: 'cruiser', name: 'Cruiser', size: 3 },
  { id: 'submarine', name: 'Submarine', size: 3 },
  { id: 'destroyer', name: 'Destroyer', size: 2 },
];

// Ship orientations.
export const ORIENTATION = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
};

// Result codes returned when a cell is attacked.
export const ATTACK_RESULT = {
  MISS: 'miss',
  HIT: 'hit',
  SUNK: 'sunk',
  REPEAT: 'repeat', // The cell had already been fired at.
};
