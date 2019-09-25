import sys
import os
import gzip
import shutil

# Get file name as first command-line argument.
file_name_input = sys.argv[1]

# Get file name alone.
file_name = os.path.basename(file_name_input)

with open(file_name, 'rb') as f_in, gzip.open(file_name + '.gz', 'wb') as f_out:
    shutil.copyfileobj(f_in, f_out)