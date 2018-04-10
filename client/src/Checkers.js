import React, { Component } from 'react';
import Row from './Row';
import api from './api';

class Checkers extends Component {
  constructor(props) {
    super(props)
    this.state = this.getInitialState();
    this.onSelectTile = this.onSelectTile.bind(this);
    this.onSelectPiece = this.onSelectPiece.bind(this);
    this.reset = this.reset.bind(this);
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

  reset() {
    this.setState(this.getInitialState(), this.getMoves);
  }

  getIsLoading() {
    return this.state.isLoading;
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
          isPlayerTurn: false,
          isLoading: true
        }, this.moveAI);
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
        isPlayerTurn: true,
        isLoading: false
      }, this.getMoves);
    }
  }

  componentDidMount() {
    this.getMoves();
  }

  render() {
    return (
      <div>
        <div className="left">
          <div className="center">
            {
              this.state.board.map((boardRow, row) => {
                return (
                  <Row
                  row={row}
                  boardRow={boardRow}
                  highlightedTiles={this.state.highlightedTiles}
                  onSelectTile={this.onSelectTile}
                  onSelectPiece={this.onSelectPiece}
                  />
                );
              })
            }
          </div>
          <input className={`button ${this.state.isLoading ? 'button-disabled' : ''}`} type="button" value="Reset" disabled={this.state.isLoading ? true : false} onClick={this.reset} />
        </div>
        <div className="right">
          <h2>You're playing against :</h2>
          <h2>[ model number: 8 ]</h2>
          <div style={{paddingTop: "10%"}}>
            {this.state.isPlayerTurn ? <h1>Your Turn!</h1> : <h1>Opponent's Turn</h1>}
          </div>
        </div>
      </div>
    );
  }
}

export default Checkers;
