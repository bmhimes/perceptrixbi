import time
import csv
import json
import numpy as np
from decimal import *
import names



# Constants #####################################################################################

OUTPUT_FILENAME = 'data_online_marketing.csv'
CSV_DELIMITER = ','

IMPRESSIONS = 1009106

# Pediatric Dentistry, Display, Dental Implants, Remarketing, Braces
CAMPAIGN_NAMES = ['PD', 'D', 'DI', 'R', 'B']
P_CAMPAIGN_IMPRESSION = [0.5165, 0.0176, 0.2872, 0.0110, 0.1677]
P_CAMPAIGN_CLICK = {'PD': 0.004962341, 'D': 0.003993925, 'DI': 0.003819111, 'R': 0.009985606, 'B': 0.006186846}

# Undetermined, Male, Female
GENDERS = ['U', 'M', 'F']
P_GENDERS = [0.3800, 0.2210, 0.3990]

# Undetermined, 18-24, 24-34, 35-44, 45-54, 55-64, 65 or more
AGE_GROUPS = ['U', 1, 2, 3, 4, 5, 6]
P_AGE_GROUPS = [0.4096, 0.0711, 0.0738, 0.0641, 0.0650, 0.1132, 0.2032]

DAYS = range(1, 32)
P_DAYS = [0.00854248671747492, 0.00179449416099993, 0, 0.0209854704189332, 0.01821968203647, 0.0245356478256695, 0.0222907427796378, 0.00817378302247152, 0.0243916389032444, 0.0258776884218869, 0.0396555633404351, 0.0330056194119942, 0.0385903058504391, 0.0474871975046624, 0.0399384744859086, 0.034765388017232, 0.0503643119335394, 0.0616429681770922, 0.0678833548155154, 0.0819165647029024, 0.0326838973512572, 0.0589435668865271, 0.0388119366033913, 0.0421353765577986, 0.0414653775995653, 0.0495523467326316, 0.0355834812573919, 0.0242905262555842, 0.0262198372801311, 0.000252270949212853, 0]







# Start: Impression Generation #######################################################################

generated_row_count = IMPRESSIONS
print "generated row count =", generated_row_count

# ID, Campaign, Gender, Age Group, Day of Month, Click
ROW_HEADERS = ["id", "cid", "g", "a", "d", "c"]

impression_generation_start = time.time()

# Initialize data generation state.
current_id = 0

with open(OUTPUT_FILENAME, 'wb') as myfile:

  wr = csv.DictWriter(myfile, fieldnames=ROW_HEADERS, quoting=csv.QUOTE_MINIMAL, delimiter=CSV_DELIMITER)
  wr.writeheader()

  for row_index in range(1, generated_row_count + 1):

    # Print periodic row generation status.
    if row_index % 10000 == 0:
      print "generating impression", row_index, "of", generated_row_count, "(" + str(Decimal(1.0 * row_index / generated_row_count * 100).quantize(Decimal('0.1'))) + '%)'

    # Determine impression ID.
    current_id += 1

    # Determine input variables.
    campaign_id = np.random.choice(CAMPAIGN_NAMES, p=P_CAMPAIGN_IMPRESSION)
    ctr = P_CAMPAIGN_CLICK[campaign_id]
    gender = np.random.choice(GENDERS, p=P_GENDERS)
    age = np.random.choice(AGE_GROUPS, p=P_AGE_GROUPS)
    day = np.random.choice(DAYS, p=P_DAYS)

    click_occurred = 0
    if np.random.random() < ctr:
      click_occurred = 1

    # Generate initial data.
    generated_impression = {
      'id': current_id,
      'cid': campaign_id,
      'g': gender,
      'a': age,
      'd': day,
      'c': click_occurred
    }

    # Write data
    wr.writerow(generated_impression)

impression_generation_end = time.time()
impression_generation_duration = impression_generation_end - impression_generation_start
print "generated", generated_row_count, "impressions in", str(Decimal(impression_generation_duration).quantize(Decimal('0.1'))), "seconds"
print "generated", str(Decimal(generated_row_count / impression_generation_duration).quantize(Decimal('0.01'))), "impressions per second"

# End: impression Generation ########################################################################