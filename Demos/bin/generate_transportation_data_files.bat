cd ..\data
python data_transportation_generator.py
python csv_json_converter.py data_transportation.csv
python gzip_compressor.py data_transportation.json