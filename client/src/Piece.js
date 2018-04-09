import React from 'react';

const Piece = ({ piece, row, col, onSelectPiece }) => {
  switch (piece) {
    case 1:
      return <div className="piece white-piece" onClick={(e) => onSelectPiece(e, row, col)} />
    case 3:
      return <div className="piece white-piece king" onClick={(e) => onSelectPiece(e, row, col)} />
    case -1:
      return <div className="piece black-piece" />
    case -3:
      return <div className="piece black-piece king" />
    default:
      return null;
  }
};

export default Piece;
