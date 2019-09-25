import sys
import os
import csv
import json

# Get file name as first command-line argument.
file_name_input = sys.argv[1]

# Get file name alone.
file_name = os.path.basename(file_name_input)

# Get file name without extension.
file_base = os.path.splitext(file_name)[0]

csvfile = open(file_base + '.csv', 'r')
jsonfile = open(file_base + '.json', 'w')

reader = csv.DictReader(csvfile)

first_row = 1

jsonfile.write('{"data": [')
for row in reader:

    if first_row == 0:
        jsonfile.write(',\n')

    json.dump(row, jsonfile)
    
    if first_row == 1:
        first_row = 0

jsonfile.write(']}')
jsonfile.close()
csvfile.close()