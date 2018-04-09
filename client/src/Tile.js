import React from 'react';
import Piece from './Piece';

const Tile = ({ row, col, color, piece, highlightedTiles, onSelectTile, ...rest }) => {
  let isHighlighted = false;
  if (highlightedTiles) {
    isHighlighted = highlightedTiles.some((tile) => {
      return tile.toString() === [row, col].toString();
    });
  }
  return (
    <div className={`square ${color === 'red' ? 'red-square' : 'white-square'} ${isHighlighted ? 'highlighted' : ''}`} onClick={() => onSelectTile(row, col)} >
      <Piece piece={piece} row={row} col={col} {...rest} />
    </div>
  );
};

export default Tile;
