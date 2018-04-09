import React, { Component } from 'react';
import Row from './Row';

class Checkers extends Component {
  constructor(props) {
    super(props)
    this.state = this.getInitialState();
    this.onSelectTile = this.onSelectTile.bind(this);
    this.onSelectPiece = this.onSelectPiece.bind(this);
  }

  getInitialState() {
    return {
      board: [
        [0, -1, 0, -1, 0, -1, 0, -1],
        [-1, 0, -1, 0, -1, 0, -1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0]
      ],
      isLoading: false,
      selectedPiece: null
    };
  }

  onSelectPiece(e, row, col) {
    e.stopPropagation();
    this.setState({ selectedPiece: [row, col] }, () => {
      console.log(`Select piece: ${this.state.selectedPiece}`);
    });
  }

  onSelectTile(row, col) {
    if (this.state.selectedPiece) {
      this.setState({ selectedPiece: null }, () => {
        console.log('Reset selected piece');
        console.log(`Select tile: ${[row, col]}`)
      });
    }
  }

  render() {
    return (
      <div>
        {this.state.board.map((boardRow, row) => <Row row={row}  boardRow={boardRow} onSelectTile={this.onSelectTile} onSelectPiece={this.onSelectPiece} />)}
      </div>
    );
  }
}

export default Checkers;
