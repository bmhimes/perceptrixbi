import numpy as np
import math
import matplotlib.pyplot as plt

MAX_ITERATIONS = 20000
CLAIM_COUNT = 1000
LARGE_CLAIM_COUNT_GOAL = 5
LARGE_CLAIM_MINIMUM_SIZE = 3000000
CLAIM_SIZE_LIMIT = 5000000
AVERAGE_CLAIM_SIZE_GOAL = 10000
MEDIAN_CLAIM_SIZE_GOAL = 10000
CLAIM_SIZE_MINIMUM = 5000

alpha = 1.0
beta = 1.0
minimum_claim_size = 1000
claim_size_scaling = 100000000
cost = 10000000000
claims = []
best_clams = []

def random_factor():
	return 2.0/(1.0 + math.exp(-np.random.standard_normal()*2))

for iteration_index in range(0, MAX_ITERATIONS):
	# print iteration_index

	candidate_alpha = max([0, alpha * random_factor()])
	candidate_beta = max([0, beta * random_factor()])
	candidate_minimum_claim_size = max([0, minimum_claim_size * random_factor()])
	candidate_claim_size_scaling = max([0, claim_size_scaling * random_factor()])

	claims = []
	claims = np.random.beta(candidate_alpha, candidate_beta, CLAIM_COUNT)
	claims = np.multiply(claims, candidate_claim_size_scaling)
	claims = np.add(claims, candidate_minimum_claim_size)
	claims = np.add(claims, np.random.normal(CLAIM_SIZE_MINIMUM/10, CLAIM_SIZE_MINIMUM / 40, CLAIM_COUNT))
	large_claim_count = 0

	for claim_index in range(0, claims.size):
		if claims[claim_index] > CLAIM_SIZE_LIMIT:
			claims[claim_index] = CLAIM_SIZE_LIMIT * random_factor()
		if claims[claim_index] < 0:
			claims[claim_index] = 0
		if claims[claim_index] > LARGE_CLAIM_MINIMUM_SIZE:
			large_claim_count += 1

	claims.sort()
	avg = np.sum(claims) / claims.size
	med = np.median(claims)
	std = np.std(claims[0:claims.size * 0.75])
	# large_claim_count = np.sum(np.greater_equal(claims, LARGE_CLAIM_MINIMUM_SIZE))

	candidate_cost = (2**0*abs(AVERAGE_CLAIM_SIZE_GOAL - avg) ** 2.5 + 2**15 * abs(MEDIAN_CLAIM_SIZE_GOAL - med) ** 3) / 1000000000 + 1000 * abs(LARGE_CLAIM_COUNT_GOAL - large_claim_count) ** 3 - 1 * std ** 1.5 + candidate_minimum_claim_size ** 2 / 2**1 - 10 * abs(med - candidate_minimum_claim_size) ** 1.75
	if large_claim_count == 0:
		candidate_cost = 10**20

	if candidate_cost < cost:
		cost = candidate_cost
		alpha = candidate_alpha
		beta = candidate_beta
		minimum_claim_size = candidate_minimum_claim_size
		claim_size_scaling = candidate_claim_size_scaling
		best_claims = claims

		print "New solution found!"
		print alpha, beta, claim_size_scaling, minimum_claim_size
		print large_claim_count, avg, med

best_claims.sort()
print best_claims
data = best_claims
plt.hist(data, bins = 10 ** np.linspace(np.log10(min(best_claims)), np.log10(max(best_claims)), 50))
plt.gca().set_xscale("log")
plt.yscale('log')
plt.show()