import React from 'react';
import Piece from './Piece';

const Tile = ({ row, col, color, piece, isHighlighted, onSelectTile, ...rest }) => {
  return (
    <div className={`square ${color === 'red' ? 'red-square' : 'white-square'}`} onClick={() => onSelectTile(row, col)} >
      <Piece piece={piece} row={row} col={col} {...rest} />
    </div>
  );
};

export default Tile;
