import React from 'react';
import Tile from './Tile';

const Row = ({ row, boardRow, ...rest }) => {
  return (
    <div className="board-row">
      {boardRow.map((piece, col) => <Tile row={row} col={col} color={(row + col) % 2 === 0 ? 'white' : 'red'} piece={piece} {...rest} />)}
    </div>
  );
};

export default Row;
