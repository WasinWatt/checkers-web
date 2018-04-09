import React, { Component } from 'react';
import Row from './Row';
import api from './api';

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
      selectedPiece: null,
      highlightedTiles: null
    };
  }

  onSelectPiece(e, row, col) {
    e.stopPropagation();
    this.setState({ selectedPiece: [row, col] }, () => {
      console.log(`Select piece: ${this.state.selectedPiece}`);
    });
    let highlightedTiles = [];
    this.state.legalMoves.forEach(move => {
      if (move[0].toString() === [row, col].toString()) {
        highlightedTiles.push(move[1]);
      }
    });
    this.setState({ highlightedTiles }, () => {
      console.log('Set highlightedTiles:', highlightedTiles);
    });
  }

  onSelectTile(row, col) {
    if (this.state.selectedPiece) {
      this.setState({
        selectedPiece: null,
        highlightedTiles: null
      })
    }
  }

  async componentDidMount() {
    const json = await api.getMoves({ state: this.state.board });
    this.setState({ legalMoves: json.moves });
    console.log(json);
  }

  render() {
    return (
      <div>
        {
          this.state.board.map((boardRow, row) => {
            return <Row
            row={row}
            boardRow={boardRow}
            highlightedTiles={this.state.highlightedTiles}
            onSelectTile={this.onSelectTile}
            onSelectPiece={this.onSelectPiece}
            />;
          })
        }
      </div>
    );
  }
}

export default Checkers;
