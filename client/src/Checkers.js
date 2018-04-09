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
      highlightedTiles: null,
      isPlayerTurn: true
    };
  }

  onSelectPiece(e, row, col) {
    e.stopPropagation();
    if (this.state.isPlayerTurn) {
      let highlightedTiles = [];
      this.state.legalMoves.forEach(move => {
        if (move[0].toString() === [row, col].toString()) {
          highlightedTiles.push(move[1]);
        }
      });
      this.setState({
        selectedPiece: [row, col],
        highlightedTiles
      });
    }
  }

  async onSelectTile(row, col) {
    if (this.state.isPlayerTurn && this.state.selectedPiece) {
      const isLegalMove = this.state.highlightedTiles.some((tile) => {
        return tile.toString() === [row, col].toString();
      });
      if (isLegalMove) {
        const json = await api.makeMove({
          state: this.state.board,
          action: [this.state.selectedPiece, [row, col]]
        });
        this.setState({
          board: json.board,
          isPlayerTurn: false
        }, () => {
          this.moveAI();
        });
      }
      this.setState({
        selectedPiece: null,
        highlightedTiles: null
      });
    }
  }

  async getMoves() {
    const json = await api.getMoves({ state: this.state.board });
    this.setState({ legalMoves: json.moves });
  }

  async moveAI() {
    if (!this.state.isPlayerTurn) {
      const json = await api.moveAI({ state: this.state.board });
      this.setState({
        board: json.board,
        isPlayerTurn: true
      }, () => {
        this.getMoves();
      });
    }
  }

  async componentDidMount() {
    this.getMoves();
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
