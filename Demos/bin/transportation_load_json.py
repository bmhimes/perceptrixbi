import psycopg2 as pg
import json
from configparser import ConfigParser
import time
from decimal import *

def config(filename='../config/db.ini', section='postgresql'):
    # create a parser
    parser = ConfigParser()
    # read config file
    parser.read(filename)
 
    # get section, default to postgresql
    db = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            db[param[0]] = param[1]
    else:
        raise Exception('Section {0} not found in the {1} file'.format(section, filename))
 
    return db



if __name__ == '__main__':
    
    json_data = ""

    with open('../data/data_transportation.json', 'r') as json_f:
        json_data = json.loads(json_f.read())

    for i in range(0, len(json_data["data"])):
        row = json_data["data"][i]
        if row["cid"].isnumeric() == False:
            row["cid"] = None
        if row["amt"].isnumeric() == False:
            row["amt"] = None

    dbparams = config()

    # Connect to the PostgreSQL database server

    conn = None
    try:
        # read connection parameters
        params = config()
 
        # connect to the PostgreSQL server
        print('Connecting to the PostgreSQL database...')
        conn = pg.connect(**params)
 
        # create a cursor
        cur = conn.cursor()
        
        # execute a statement
        print('PostgreSQL database version:')
        cur.execute('SELECT version()')
 
        # display the PostgreSQL database server version
        db_version = cur.fetchone()
        print(db_version)

        

        prep_sql = "PREPARE insert_plan AS INSERT INTO routes (id, route_id, driver_id, driver_safety_technology, driver_simulator_score, driver_region, route_year, route_quarter, route_region, route_weather, risk, claim_id, claim_amount) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)"

        cur.execute(prep_sql)


        insert_sql = "EXECUTE insert_plan(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"

        cur.execute("TRUNCATE routes")

        execute_start = time.time()

        for i in range(0, len(json_data["data"])):
            row = json_data["data"][i]
            # if row["cid"].isnumeric() == False:
            #     row["cid"] = None
            # if row["amt"].isnumeric() == False:
            #     row["amt"] = None
            cur.execute(insert_sql, (row["id"], row["rid"], row["did"], row["dst"], row["dss"], row["dr"], row["yr"], row["qtr"], row["rr"], row["rw"], row["risk"], row["cid"], row["amt"]))
        conn.commit()
        execute_end = time.time()
        execute_duration = execute_end - execute_start
        print "execute took ", str(Decimal(execute_duration).quantize(Decimal('0.1'))), "seconds"

        cur.execute("TRUNCATE routes")
        executemany_start = time.time()
        values = []
        for i in range(0, len(json_data["data"])):
            row = json_data["data"][i]
            # if row["cid"].isnumeric() == False:
            #     row["cid"] = None
            # if row["amt"].isnumeric() == False:
            #     row["amt"] = None
            values.append((row["id"], row["rid"], row["did"], row["dst"], row["dss"], row["dr"], row["yr"], row["qtr"], row["rr"], row["rw"], row["risk"], row["cid"], row["amt"]))
        cur.executemany(insert_sql, values)

        conn.commit()

        executemany_end = time.time()
        executemany_duration = executemany_end - executemany_start
        print "executemany took ", str(Decimal(executemany_duration).quantize(Decimal('0.1'))), "seconds"


        # close the communication with the PostgreSQL
        cur.close()
    except (Exception, pg.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
            print('Database connection closed.')