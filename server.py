from flask import Flask, render_template, abort, request, Response
from flask_pymongo import PyMongo
from pymongo import MongoClient
import numpy as np
from game import Game, GameState
from agent import Agent
from model import Residual_CNN
import config
import tensorflow as tf
from preprocessing import index_to_move
from agent import Agent
import json
import Constant

client = MongoClient(Constant.MONGO_URI)
app = Flask(__name__, static_folder="./client/build/static", template_folder="./client/build")

app.config['MONGO_DBNAME'] = 'cuhorsezero'
app.config['MONGO_URI'] = Constant.MONGO_URI

mongo = PyMongo(app)

version = 18
checkers = Game()
best_NN = Residual_CNN(config.REG_CONST, config.LEARNING_RATE, checkers.input_shape, checkers.action_size, config.HIDDEN_CNN_LAYERS)
m_tmp = best_NN.read(version)
best_NN.model.set_weights(m_tmp.get_weights())
graph = tf.get_default_graph()
AI = Agent('best_player', checkers.action_size, config.MCTS_SIMS, config.CPUCT, best_NN)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/step", methods = ["POST"])
def step():
    data = request.get_json()
    state = np.array(data["state"])
    action = data["action"]
    game_state = GameState(state, 1, 0)
    action = ((action[0][0], action[0][1]), (action[1][0], action[1][1]))
    if action not in game_state.get_legal_moves():
        data = {
            "error": "Internal server error"
        }
        js = json.dumps(data)
        res = Response(js, status=500, mimetype="application/json")
        return res

    next_state, value, done = game_state.takeAction(action)
    data = {
        "board": next_state.board.tolist(),
        "value": value,
        "done": done
    }
    js = json.dumps(data)
    res = Response(js, status=200, mimetype="application/json")
    return res

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
    global graph
    with graph.as_default():
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
        next_state, value, done = game_state.takeAction(action)
        data = {
            "board": next_state.board.tolist(),
            "value": value,
            "done": done
        }
        js = json.dumps(data)
        res = Response(js, status=200, mimetype="application/json")
        return res

@app.route("/save", methods = ["POST"])
def save():
    data = request.get_json()
    result = data["result"]
    records_c = mongo.db.records
    records_c.insert({'opponent_ver': version, 'result': result})
    data = {
        "status": "ok"
    }
    js = json.dumps(data)
    res = Response(js, status=200, mimetype="application/json")
    return res

if __name__ == "__main__":
    app.run(debug=False, threaded=True)
