import numpy as np
import random

import MCTS as mc
from game import GameState

import config
import time

import pickle

from preprocessing import index_to_move


class User():
	def __init__(self, name, action_size):
		self.name = name
		self.action_size = action_size

	def act(self, state, tau):
		action = input('Enter your chosen action: ')
		pi = np.zeros(self.action_size)
		pi[action] = 1
		value = None
		NN_value = None
		return (action, pi, value, NN_value)



class Agent():
	def __init__(self, name, action_size, mcts_simulations, cpuct, model):
		self.name = name

		self.action_size = action_size

		self.cpuct = cpuct

		self.MCTSsimulations = mcts_simulations
		self.model = model

		self.mcts = None

	def simulate(self):
		##### MOVE THE LEAF NODE
		leaf, value, done, breadcrumbs = self.mcts.moveToLeaf()
		
		##### EVALUATE THE LEAF NODE
		value, breadcrumbs = self.evaluateLeaf(leaf, value, done, breadcrumbs)

		##### BACKFILL THE VALUE THROUGH THE TREE
		self.mcts.backFill(leaf, value, breadcrumbs)


	def act(self, state, tau):
		self.buildMCTS(state)

		#### run the simulation
		for sim in range(self.MCTSsimulations):
			self.simulate()

		#### get action values
		pi, values = self.getAV(1)

		####pick the action
		action, value = self.chooseAction(pi, values, tau)

		nextState, _, done = state.takeAction(index_to_move(action))

		NN_value = 0
		if not done:
			NN_value = -self.get_preds(nextState)[0]

		return (action, pi, value, NN_value)


	def get_preds(self, state):
		#predict the leaf
		allowedActions = state.allowedActions
		
		if state.playerTurn == -1:
			state = GameState(state.flip(), state.playerTurn, state.turn)
		inputToModel = np.array([self.model.convertToModelInput(state)])

		preds = self.model.predict(inputToModel)
		value_array = preds[0]
		logits_array = preds[1]
		value = value_array[0]
		logits = logits_array[0]

		if state.playerTurn == -1:
			logits = logits[::-1]
		
		mask = np.ones(logits.shape,dtype=bool)
		mask[allowedActions] = False
		logits[mask] = 0

		probs = logits / np.sum(logits)

		return ((value, probs, allowedActions))


	def evaluateLeaf(self, leaf, value, done, breadcrumbs):
		if done == 0:
	
			value, probs, allowedActions = self.get_preds(leaf.state)
			probs = probs[allowedActions]

			for idx, action in enumerate(allowedActions):
				newState, _, _ = leaf.state.takeAction(index_to_move(action))
				if newState.id not in self.mcts.tree:
					node = mc.Node(newState)
					self.mcts.addNode(node)
				else:
					node = self.mcts.tree[newState.id]

				newEdge = mc.Edge(leaf, node, probs[idx], action)
				leaf.edges.append((action, newEdge))

		return ((value, breadcrumbs))


		
	def getAV(self, tau):
		edges = self.mcts.root.edges
		pi = np.zeros(self.action_size, dtype=np.integer)
		values = np.zeros(self.action_size, dtype=np.float32)
		
		for action, edge in edges:
			pi[action] = pow(edge.stats['N'], 1/tau)
			values[action] = edge.stats['Q']

		pi = pi / (np.sum(pi) * 1.0)
		return pi, values

	def chooseAction(self, pi, values, tau):
		if tau == 0:
			actions = np.argwhere(pi == max(pi))
			action = random.choice(actions)[0]
		else:
			action_idx = np.random.multinomial(1, pi)
			action = np.where(action_idx==1)[0][0]

		value = values[action]

		return action, value

	def replay(self, ltmemory, loss_memory):

		for i in range(config.TRAINING_LOOPS):
				minibatch = random.sample(ltmemory, min(
						config.BATCH_SIZE, len(ltmemory)))

				training_states = np.array(
						[self.model.convertToModelInput(row['state']) for row in minibatch])
				training_targets = {'value_head': np.array(
						[row['value'] for row in minibatch]), 'policy_head': np.array([row['AV'] for row in minibatch])}

				fit = self.model.fit(training_states, training_targets,
															epochs=config.EPOCHS, verbose=1, validation_split=0, batch_size=32)

				loss_memory['overall'].append(round(fit.history['loss'][config.EPOCHS - 1], 4))
				loss_memory['value'].append(round(fit.history['value_head_loss'][config.EPOCHS - 1], 4))	
				loss_memory['policy'].append(round(fit.history['policy_head_loss'][config.EPOCHS - 1], 4))

		print('\n')

	def predict(self, inputToModel):
		preds = self.model.predict(inputToModel)
		return preds

	def buildMCTS(self, state):
		self.root = mc.Node(state)
		self.mcts = mc.MCTS(self.root, self.cpuct)