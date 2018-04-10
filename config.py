

# SELF PLAY
EPISODES = 30 #30
MCTS_SIMS = 100 #80
MEMORY_SIZE = 10000 #10000
TURNS_UNTIL_TAU0 = 5  # turn on which it starts playing deterministically
CPUCT = 1
EPSILON = 0.2
ALPHA = 0.7


# RETRAINING
BATCH_SIZE = 256
EPOCHS = 1
REG_CONST = 0.0001
LEARNING_RATE = 0.01
MOMENTUM = 0.9
TRAINING_LOOPS = 10 #10

HIDDEN_CNN_LAYERS = [
    {'filters': 128, 'kernel_size': (4, 4)}, {'filters': 128, 'kernel_size': (4, 4)}, {'filters': 128, 'kernel_size': (4, 4)}, {
        'filters': 128, 'kernel_size': (4, 4)}, {'filters': 128, 'kernel_size': (4, 4)}, {'filters': 128, 'kernel_size': (4, 4)},
        {'filters': 128, 'kernel_size': (4, 4)}, {'filters': 128, 'kernel_size': (4, 4)}, {'filters': 128, 'kernel_size': (4, 4)},
        {'filters': 128, 'kernel_size': (4, 4)}
]

