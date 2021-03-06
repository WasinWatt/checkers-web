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
    this.surrender = this.surreder.bind(this);
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
      isPlayerTurn: true,
      isGameEnd: false,
      winner: 0
    };
  }

  reset() {
    this.setState(this.getInitialState(), this.getMoves);
  }

  surreder() {
    api.save({
      result: -1
    })
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
        isLoading: false,
        isGameEnd: (json.done == 1) ? true : false,
        winner: json.value
      }, this.getMoves);
    }
  }

  componentDidMount() {
    this.getMoves();
  }

  render() {
    return (
      <div className="checkers">
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
          <input className={`button ${this.state.isGameEnd ? '' : 'button-disabled'}`} type="button" value="Reset" disabled={this.state.isGameEnd ? false : true} onClick={this.reset} />
          <input className={`button ${this.state.isLoading ? 'button-disabled' : ''}`} type="button" value="Surrender" disabled={this.state.isLoading ? true : false} onClick={this.surrender} />
        </div>
        <div className="right">
          <h3>You're playing against :</h3>
          <h3>[ model number: 51 ]</h3>
          <div style={{paddingTop: "10%"}}>
            {this.state.isGameEnd ? <h2>Game Ended !</h2> : this.state.isPlayerTurn ? <h2>Your Turn !</h2> : <h2>Opponent's Turn !</h2>}
            {this.state.isGameEnd ? (this.state.winner == 1 ? <h2>You wins</h2> : this.state.winner == -1 ? <h2>You loses</h2> : <h2>DRAW</h2>) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default Checkers;
