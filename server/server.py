from flask import Flask, render_template, abort, request, Response
import numpy as np
from game import Game, GameState
from agent import Agent
from model import Residual_CNN
import config
from preprocessing import index_to_move
from agent import Agent
import json

app = Flask(__name__, static_folder="../static/dist", template_folder="../static")

version = 8
checkers = Game()
best_NN = Residual_CNN(config.REG_CONST, config.LEARNING_RATE, checkers.input_shape, checkers.action_size, config.HIDDEN_CNN_LAYERS)
m_tmp = best_NN.read(version)
best_NN.model.set_weights(m_tmp.get_weights())
AI = Agent('best_player', checkers.action_size, config.MCTS_SIMS, config.CPUCT, best_NN)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/moves", methods = ["POST"])
def moves():
    data = request.get_json()
    state = np.array(data["state"])
    game_state = GameState(state, 1, 0)
    legal_moves = game_state.get_legal_moves()
    data = {
        "moves": legal_moves,
    }
    js = json.dumps(data)
    res = Response(js, status=200, mimetype="application/json")
    return res

@app.route("/ai", methods = ["POST"])
def ai():
    data = request.get_json()
    state = np.array(data["state"])
    game_state = GameState(state, -1, 0)
    if len(game_state.get_legal_moves()) == 0:
        data = {
            "board": state,
            "value": 1,
            "done": 1
        }
        js = json.dumps(data)
        res = Response(js, status=200, mimetype="application/json")
        return res

    action, _, _, _ = AI.act(game_state, 0)
    action = index_to_move(action)
    new_state, value, done = game_state.takeAction(action)
    data = {
        "board": new_state.board.tolist(),
        "value": value,
        "done": done
    }
    js = json.dumps(data)
    res = Response(js, status=200, mimetype="application/json")
    return res

if __name__ == "__main__":
    app.run()
