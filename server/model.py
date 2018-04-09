import logging
import config
import numpy as np

from keras.models import Sequential, load_model, Model
from keras.layers import Input, Dense, Conv2D, Flatten, BatchNormalization, Activation, LeakyReLU, add
from keras.optimizers import SGD, Adam
from keras import regularizers

import keras.backend as K

from settings import run_folder

class Gen_Model():
	def __init__(self, reg_const, learning_rate, input_dim, output_dim):
		self.reg_const = reg_const
		self.learning_rate = learning_rate
		self.input_dim = input_dim
		self.output_dim = output_dim

	def predict(self, x):
		return self.model.predict(x)

	def fit(self, states, targets, epochs, verbose, validation_split, batch_size):
		return self.model.fit(states, targets, epochs=epochs, verbose=verbose, validation_split = validation_split, batch_size = batch_size)

	def write(self, game, version):
		self.model.save(run_folder + 'models/version' + "{0:0>4}".format(version) + '.h5')

	def read(self, version):
		return load_model( run_folder + "models/version" + "{0:0>4}".format(version) + '.h5')

class Residual_CNN(Gen_Model):
	def __init__(self, reg_const, learning_rate, input_dim,  output_dim, hidden_layers):
		Gen_Model.__init__(self, reg_const, learning_rate, input_dim, output_dim)
		self.hidden_layers = hidden_layers
		self.num_layers = len(hidden_layers)
		self.model = self._build_model()

	def residual_layer(self, input_block, filters, kernel_size):

		x = self.conv_layer(input_block, filters, kernel_size)

		x = Conv2D(
		filters = filters
		, kernel_size = kernel_size
		, data_format="channels_first"
		, padding = 'same'
		, use_bias=False
		, kernel_regularizer = regularizers.l2(self.reg_const)
		)(x)

		x = BatchNormalization(axis=1)(x)

		x = add([input_block, x])

		x = Activation("relu")(x)

		return (x)

	def conv_layer(self, x, filters, kernel_size):

		x = Conv2D(
		filters = filters
		, kernel_size = kernel_size
		, data_format="channels_first"
		, padding = 'same'
		, use_bias=False
		, kernel_regularizer = regularizers.l2(self.reg_const)
		)(x)

		x = BatchNormalization(axis=1)(x)
		x = Activation("relu")(x)

		return (x)

	def value_head(self, x):

		x = Conv2D(
		filters = 2
		, kernel_size = (1,1)
		, data_format="channels_first"
		, padding = 'same'
		, use_bias=False
		, kernel_regularizer = regularizers.l2(self.reg_const)
		)(x)


		x = BatchNormalization(axis=1)(x)
		x = Activation("relu")(x)

		x = Flatten()(x)

		x = Dense(
			128
			, use_bias=False
			, activation='relu'
			, kernel_regularizer=regularizers.l2(self.reg_const)
			)(x)


		x = Dense(
			1
			, use_bias=False
			, activation='tanh'
			, kernel_regularizer=regularizers.l2(self.reg_const)
			, name = 'value_head'
			)(x)



		return (x)

	def policy_head(self, x):

		x = Conv2D(
		filters = 2
		, kernel_size = (1,1)
		, data_format="channels_first"
		, padding = 'same'
		, use_bias=False
		, kernel_regularizer = regularizers.l2(self.reg_const)
		)(x)

		x = BatchNormalization(axis=1)(x)
		x = Activation("relu")(x)

		x = Flatten()(x)

		x = Dense(
			self.output_dim
			, use_bias=False
			, activation='softmax'
			, kernel_regularizer=regularizers.l2(self.reg_const)
			, name = 'policy_head'
			)(x)

		return (x)

	def _build_model(self):

		main_input = Input(shape = self.input_dim, name = 'main_input')

		x = self.conv_layer(main_input, self.hidden_layers[0]['filters'], self.hidden_layers[0]['kernel_size'])

		if len(self.hidden_layers) > 1:
			for h in self.hidden_layers[1:]:
				x = self.residual_layer(x, h['filters'], h['kernel_size'])

		vh = self.value_head(x)
		ph = self.policy_head(x)

		model = Model(inputs=[main_input], outputs=[vh, ph])
		model.compile(loss={'value_head': 'mean_squared_error', 'policy_head': 'categorical_crossentropy'},
			optimizer=Adam(),
			loss_weights={'value_head': 0.5, 'policy_head': 0.5}
			)

		return model

	def convertToModelInput(self, state):
		inputToModel =  state.binary #np.append(state.binary, [(state.playerTurn + 1)/2] * self.input_dim[1] * self.input_dim[2])
		inputToModel = np.reshape(inputToModel, self.input_dim)
		return (inputToModel)
