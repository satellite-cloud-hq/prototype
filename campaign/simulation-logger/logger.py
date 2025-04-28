
import sys
from datetime import datetime, timedelta
from pathlib import Path
from influxdb_client import Point, WritePrecision
from influxdb_client.client.influxdb_client_async import InfluxDBClientAsync
import asyncio

S2E_LOG_DIR = Path('/s2e-log/')

LOGDB_URL = 'http://log-db:8086/'
LOGDB_ORG = 'satellite-cloud'
LOGDB_TOKEN = 'admin-token'

async def log_simulation_data(campaign_id):

    current_time = datetime.now().timestamp()
    newest_log_file = None
    log_files = list(S2E_LOG_DIR.glob("logs_*/*_default.csv"))
    timeout = datetime.now() + timedelta(seconds=10)
    while datetime.now() < timeout:
        log_files = list(S2E_LOG_DIR.glob("logs_*/*_default.csv"))
        if not log_files:
            await asyncio.sleep(0.1)
            continue

        newest_log_file = max(log_files, key=lambda f: f.stat().st_mtime)
        if newest_log_file.stat().st_mtime > current_time:
            break
        await asyncio.sleep(0.1)

    if not newest_log_file:
        raise ValueError("No log file found.")
    
    print(f"log file found: {newest_log_file}")

    async with InfluxDBClientAsync(url=LOGDB_URL, token=LOGDB_TOKEN, org=LOGDB_ORG) as client:
        write_api = client.write_api()

        # Open the newest log file and stream its content
        with newest_log_file.open("r") as log_file:
            chunk_size = 1024
            sleep_sec = 1
            buffer = ''

            header = []

            while True:
                chunk = log_file.read(chunk_size)
                if not chunk:
                    await asyncio.sleep(sleep_sec)
                    continue
                buffer += chunk

                points = []

                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)

                    if header == []:
                        header = line.split(',')
                        continue

                    values = line.split(',')
                    try:
                        time = datetime.strptime(values[1], '%Y/%m/%d %H:%M:%S.%f')
                    except ValueError:
                        print(f"Invalid time format: {values[1]}")
                        continue

                    point = Point(campaign_id).time(time, WritePrecision.MS)

                    for i, name in enumerate(header):
                        if not name: continue
                        if i == 1:
                            pass
                        else:
                            point.field(name, float(values[i]))
                    points.append(point)

                success = await write_api.write(bucket='simulation', record=points)
                if not success:
                    raise ValueError(f'Failed to write points to InfluxDB, {success}')


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python logger.py <campaign_id>")
        sys.exit(1)
    campaign_id = sys.argv[1]
    asyncio.run(log_simulation_data(campaign_id))