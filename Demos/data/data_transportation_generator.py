# 7,100 DRIVER_COUNT at a time
# 100 quit per week
# $4,500 training cost per driver
# risk: DRIVER_COUNT driving outside of region where they grew up
# risk: safety increase through truck safety technology
# risk: by driving simulator score (section failures)
# simulator weather type vs. route weather type

# TODO
# store driver names in JSON, not in file
# revise headers to be much smaller
# revise values to be much smaller (take out "dr", "rr", etc.)
# make IDs smaller

import time
import csv
import json
import numpy as np
from decimal import *
import names



# Constants #####################################################################################

BASE_DRIVER_SIMULATOR_SCORE = 0.6

DRIVER_COUNT = 7000
# DRIVER_COUNT = 7
ROUTES_PER_YEAR = 40
# ROUTES_PER_YEAR = 2
YEARS = 2
ARCHIVED_YEARS = 10



# Risk Factor Constants #######################################################################

BASE_RISK = 0.01

SIGMA_SAFETY_TECHNOLOGY = 0.05
SIGMA_ROUTE_WEATHER = 0.1
SIGMA_DRIVER_ROUTE_REGION = 0.02
SIGMA_SIMULATOR_WEATHER_SCORE = 0.1
SIGMA_DRIVER_SIMULATOR_SCORE = 0.05

MU_DRIVER_IN_REGION = 0.9
MU_DRIVER_OUT_REGION = 1.1
MU_SIMULATOR_WEATHER_SCORE = 0.5
MU_DRIVER_SIMULATOR_SCORE = 0





# Start: Risk Factor Generation ##################################################################

# Define risk factors.
RISK_FACTORS = {
  'safety_technology': {
    '1': np.random.normal(1, SIGMA_SAFETY_TECHNOLOGY),
    '2': np.random.normal(1, SIGMA_SAFETY_TECHNOLOGY),
    '3': np.random.normal(1, SIGMA_SAFETY_TECHNOLOGY),
    '4': np.random.normal(1, SIGMA_SAFETY_TECHNOLOGY),
    '5': np.random.normal(1, SIGMA_SAFETY_TECHNOLOGY),
    '6': np.random.normal(1, SIGMA_SAFETY_TECHNOLOGY),
    'N/A': 1
  },
  'route_weather': {
    '1': np.random.normal(1, SIGMA_ROUTE_WEATHER),
    '2': np.random.normal(1, SIGMA_ROUTE_WEATHER),
    '3': np.random.normal(1, SIGMA_ROUTE_WEATHER),
    '4': np.random.normal(1, SIGMA_ROUTE_WEATHER)
  },
  'driver_route_region': {
    '1': {
       '1': np.random.normal(MU_DRIVER_IN_REGION, SIGMA_DRIVER_ROUTE_REGION),
       '2': np.random.normal(MU_DRIVER_OUT_REGION, SIGMA_DRIVER_ROUTE_REGION),
       '3': np.random.normal(MU_DRIVER_OUT_REGION, SIGMA_DRIVER_ROUTE_REGION),
       '4': np.random.normal(MU_DRIVER_OUT_REGION, SIGMA_DRIVER_ROUTE_REGION)
    },
    '2': {
       '1': np.random.normal(MU_DRIVER_OUT_REGION, SIGMA_DRIVER_ROUTE_REGION),
       '2': np.random.normal(MU_DRIVER_IN_REGION, SIGMA_DRIVER_ROUTE_REGION),
       '3': np.random.normal(MU_DRIVER_OUT_REGION, SIGMA_DRIVER_ROUTE_REGION),
       '4': np.random.normal(MU_DRIVER_OUT_REGION, SIGMA_DRIVER_ROUTE_REGION)
    },
    '3': {
       '1': np.random.normal(MU_DRIVER_OUT_REGION, SIGMA_DRIVER_ROUTE_REGION),
       '2': np.random.normal(MU_DRIVER_OUT_REGION, SIGMA_DRIVER_ROUTE_REGION),
       '3': np.random.normal(MU_DRIVER_IN_REGION, SIGMA_DRIVER_ROUTE_REGION),
       '4': np.random.normal(MU_DRIVER_OUT_REGION, SIGMA_DRIVER_ROUTE_REGION)
    },
    '4': {
       '1': np.random.normal(MU_DRIVER_OUT_REGION, SIGMA_DRIVER_ROUTE_REGION),
       '2': np.random.normal(MU_DRIVER_OUT_REGION, SIGMA_DRIVER_ROUTE_REGION),
       '3': np.random.normal(MU_DRIVER_OUT_REGION, SIGMA_DRIVER_ROUTE_REGION),
       '4': np.random.normal(MU_DRIVER_IN_REGION, SIGMA_DRIVER_ROUTE_REGION)
    }
  },
  'simulator_weather_score': {
    '1': np.random.normal(MU_SIMULATOR_WEATHER_SCORE, SIGMA_SIMULATOR_WEATHER_SCORE),
    '2': np.random.normal(MU_SIMULATOR_WEATHER_SCORE, SIGMA_SIMULATOR_WEATHER_SCORE),
    '3': np.random.normal(MU_SIMULATOR_WEATHER_SCORE, SIGMA_SIMULATOR_WEATHER_SCORE),
    '4': np.random.normal(MU_SIMULATOR_WEATHER_SCORE, SIGMA_SIMULATOR_WEATHER_SCORE)
  }
}

# Write risk factors to JSON file.
with open('transportation_risks.json', 'wb') as risk_file:
  json.dump(RISK_FACTORS, risk_file)

SAFETY_TECHNOLOGY = ['1', '2', '3', '4', '5', '6']
WEATHER = ['1', '2', '3', '4']
REGIONS = ['1', '2', '3', '4']
YEARS_LIST = [2015, 2016]
QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']

P_YEARS = [0.45, 0.55]
P_QUARTERS = [0.23, 0.25, 0.24, 0.28]

# End: Risk Factor Generation ###############################################################





# Start: Driver Generation #################################################################

driver_stats = []
driver_names = []
driver_generation_start = time.time()

for driver_index in range(1, DRIVER_COUNT):
  if driver_index % 100 == 0:
    print "generating driver", driver_index, "of", DRIVER_COUNT, "(" + str(Decimal(1.0 * driver_index / DRIVER_COUNT * 100).quantize(Decimal('0.1'))) + '%)'
  driver_stats.append({
    'driver_region': np.random.choice(REGIONS),
    'safety_technology': np.random.choice(SAFETY_TECHNOLOGY) if np.random.random() < 0.33 else "N/A",
    'simulator_weather_score': {
      '1': min(BASE_DRIVER_SIMULATOR_SCORE + np.random.normal(MU_DRIVER_SIMULATOR_SCORE, SIGMA_DRIVER_SIMULATOR_SCORE), 1),
      '2': min(BASE_DRIVER_SIMULATOR_SCORE + np.random.normal(MU_DRIVER_SIMULATOR_SCORE, SIGMA_DRIVER_SIMULATOR_SCORE), 1),
      '3': min(BASE_DRIVER_SIMULATOR_SCORE + np.random.normal(MU_DRIVER_SIMULATOR_SCORE, SIGMA_DRIVER_SIMULATOR_SCORE), 1),
      '4': min(BASE_DRIVER_SIMULATOR_SCORE + np.random.normal(MU_DRIVER_SIMULATOR_SCORE, SIGMA_DRIVER_SIMULATOR_SCORE), 1)
    }
  })
  driver_names.append(names.get_full_name())

with open('driver_names.json', 'wb') as myfile:
  myfile.write('{"names": ')
  json.dump(driver_names, myfile)
  myfile.write('}')

driver_generation_end = time.time()
driver_generation_duration = driver_generation_end - driver_generation_start
print "generated", DRIVER_COUNT, "drivers in", str(Decimal(driver_generation_duration).quantize(Decimal('0.1'))), "seconds"
print "generated", str(Decimal(DRIVER_COUNT / driver_generation_duration).quantize(Decimal('0.1'))), "drivers per second"

# End: Driver Generation ###################################################################





# Start: Route Generation #######################################################################

generated_row_count = DRIVER_COUNT * ROUTES_PER_YEAR * YEARS
print "generated row count =", generated_row_count

ROW_HEADERS = ["id", "rid", "did", "dst", "dss", "dr", "yr", "qtr", "rr", "rw", "risk", "cid", "amt"]

route_generation_start = time.time()
with open('data_transportation.csv', 'wb') as myfile:
  # wr = csv.writer(myfile, quoting=csv.QUOTE_ALL)
  wr = csv.DictWriter(myfile, fieldnames=ROW_HEADERS, quoting=csv.QUOTE_MINIMAL)
  wr.writeheader()

  # Initialize data generation state.
  current_id = 1
  current_route_id = 1
  current_claim_id = 1
  claim_count = 0
  claim_sum = 0.0
  top10 = np.linspace(0,1,10)

  for row_index in range(1, generated_row_count + 1):

    # Print periodic row generation status.
    if row_index % 10000 == 0:
      print "generating route", row_index, "of", generated_row_count, "(" + str(Decimal(1.0 * row_index / generated_row_count * 100).quantize(Decimal('0.1'))) + '%)'

    # Determine route driver.
    driver_id = np.random.randint(1, DRIVER_COUNT - 1)

    # Determine input variables.
    driver_region = driver_stats[driver_id]['driver_region']
    driver_safety_technology = driver_stats[driver_id]['safety_technology']
    route_weather = np.random.choice(WEATHER)
    driver_simulator_score = driver_stats[driver_id]['simulator_weather_score'][route_weather]
    route_region = np.random.choice(REGIONS)

    # Generate initial data.
    generated_route = {
      'id': current_id,
      'rid': current_route_id,
      'did': driver_id,
      'yr': np.random.choice(YEARS_LIST, p=P_YEARS),
      'qtr': np.random.choice(QUARTERS, p=P_QUARTERS),
      'rr': route_region,
      'rw': route_weather,
      'dr': driver_region,
      'dst': driver_safety_technology,
      # Convert driver simulator score to [0,100].
      'dss': int(driver_simulator_score * 100),
      'cid': 'N/A',
      'amt': ''
    }

    # Calculate weather risk.
    weather_risk_factor = (1 - driver_simulator_score) * RISK_FACTORS['simulator_weather_score'][route_weather]
    
    # Calculate total risk of insurance claim.
    risk = (BASE_RISK 
      * RISK_FACTORS['safety_technology'][driver_safety_technology] 
      * RISK_FACTORS['route_weather'][route_weather] 
      * RISK_FACTORS['driver_route_region'][driver_region][route_region]
      * weather_risk_factor)
    generated_route['risk'] = Decimal(risk).quantize(Decimal('0.00001'))

    claim_occurred = 0
    if np.random.random() < risk:
      claim_occurred = 1

    if claim_occurred == 1:
      generated_route['cid'] = current_claim_id
      # Generate claim total incurred.
      claim_size = int(min(1000 + np.random.power(0.001) * 500000000 + np.random.exponential(1/5.0) * 50000, 5000000))
      generated_route['amt'] = '$' + str(claim_size)

      current_claim_id += 1
      claim_count += 1
      claim_sum += claim_size

      top10MinIndex = top10.argmin()
      if claim_size > top10[top10MinIndex]:
        top10[top10MinIndex] = claim_size


    # Update state.
    current_id += 1
    current_route_id += 1

    # Write data
    wr.writerow(generated_route)

  route_generation_end = time.time()
  route_generation_duration = route_generation_end - route_generation_start
  print "generated", generated_row_count, "routes in", str(Decimal(route_generation_duration).quantize(Decimal('0.1'))), "seconds"
  print "generated", str(Decimal(generated_row_count / route_generation_duration).quantize(Decimal('0.01'))), "routes per second"
  
  # Print dataset statistics.
  print "claim count =", claim_count
  top10 = list(top10.flat)
  top10.sort()
  top10.reverse()
  for claim in top10:
    print '$' + str(Decimal(claim).quantize(Decimal('1')))
  # print top10
  print 'avg = $' + str(Decimal(claim_sum / claim_count).quantize(Decimal('1')))

# End: Route Generation ########################################################################