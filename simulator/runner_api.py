from enum import StrEnum
from typing import Dict
from pathlib import Path
import shutil
import subprocess
import asyncio
import uuid
import json
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from influxdb_client import Point, WritePrecision
from influxdb_client.client.influxdb_client_async import InfluxDBClientAsync
from datetime import datetime
import uuid

app = FastAPI()

simluations = {}

UPLOAD_DIR = Path('./uploads')
UPLOAD_DIR.mkdir(exist_ok=True)

S2E_WORKING_DIR = Path('./aobc-sils/s2e/')
S2E_EXEC_FILE = Path('./build/S2E_AOBC')
S2E_LOG_DIR = Path('./aobc-sils/s2e/logs/')

LOGDB_URL = 'http://log-db:8086/'
LOGDB_ORG = 'satellite-cloud'
LOGDB_TOKEN = 'admin-token'

class Simulation:

    class Status(StrEnum):
        RUNNING   = 'running'
        COMPLETED = 'completed'
        STOPPED   = 'stopped'
        FAILED    = 'failed'

    def __init__(self, condition: Dict, app_path: Path):
        self.id = str(uuid.uuid4())

        self.status = self.Status.RUNNING
        self.app_path = app_path

    def run(self):
        self.s2e_process = subprocess.Popen(str(S2E_EXEC_FILE), cwd=str(S2E_WORKING_DIR))

        self.queue = asyncio.Queue()

        asyncio.create_task(self.read_and_insert_log())
        asyncio.create_task(self.run_and_stream())

    def stop(self):
        if self.s2e_process and self.s2e_process.returncode is None:
            self.s2e_process.terminate()
        if self.app_process and self.app_process.returncode is None:
            self.app_process.terminate()
        self.status = self.Status.STOPPED

    async def read_and_insert_log(self):
        # Find the newest log file created after the current time
        current_time = datetime.now().timestamp()
        newest_log_file = None
        while self.status == self.Status.RUNNING:
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

        async with InfluxDBClientAsync(url=LOGDB_URL, token=LOGDB_TOKEN, org=LOGDB_ORG) as client:
            write_api = client.write_api()

            # Open the newest log file and stream its content
            with newest_log_file.open("r") as log_file:
                chunk_size = 1024
                sleep_sec = 1
                buffer = ''

                header = []

                while self.status == self.Status.RUNNING:
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

                        point = Point(self.id).time(time, WritePrecision.MS)

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



        

    async def run_and_stream(self):
        print('running app')
        self.app_process = await asyncio.create_subprocess_exec(
            "python", '-u', str(self.app_path),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        async def read_stream(stream, tag):
            while self.status == self.Status.RUNNING:
                if not stream:
                    break
                line = await stream.readline()
                if line:
                    await self.queue.put(f"event: {tag}\ndata: {line.decode().rstrip()}\n\n")
                else:
                    break

        await asyncio.gather(
            read_stream(self.app_process.stdout, "stdout"),
            read_stream(self.app_process.stderr, "stderr"),
        )

        await self.app_process.wait()
        await self.queue.put("event: done\ndata: [execution finished]\n\n")
        self.app_path.unlink()

    def to_dict(self):
        return {
            'id': self.id,
            'status': self.status
        }
    
@app.get('/')
async def get_simulations():
    '''
    シミュレーション一覧取得
    現在実行中のシミュレーションの一覧を取得する．
    '''
    try:
        return {
            'items': [
                sim.to_dict() for sim in simluations.values()
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/')
async def run_simulation(
    condition: str = Form(...),
    app: UploadFile = File(...) # Aplication file (Python script)
):
    '''
    シミュレーション実行
    新規シミュレーションを実行する．
    '''
    try:
        filename = f"{uuid.uuid4().hex}.py"
        file_path = UPLOAD_DIR / filename

        with file_path.open("wb") as f:
            shutil.copyfileobj(app.file, f)
        
        sim = Simulation(json.loads(condition), file_path)
        simluations[sim.id] = sim
        sim.run()

        return sim.to_dict()
    
    except Exception as e:
        raise e
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/{simulation_id}')
async def get_simulation(simulation_id: str):
    '''
    シミュレーション情報取得
    指定したシミュレーションの情報を取得する．
    '''
    try:
        if simulation_id not in simluations:
            raise HTTPException(status_code=404, 
                                detail=f'Simulation not found: {simulation_id} in {list(simluations.keys())}')
        sim = simluations[simulation_id]
        return sim.to_dict()

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get('/{simulation_id}/output')
async def get_simulation_output(simulation_id: str):
    '''
    シミュレーション情報取得
    指定したシミュレーションにおけるアプリケーションの出力を，SEEで取得する．
    '''
    try:
        if simulation_id not in simluations:
            raise HTTPException(status_code=404, 
                                detail=f'Simulation not found: {simulation_id} in {list(simluations.keys())}')
        sim = simluations[simulation_id]
        if not sim.queue:
            return StreamingResponse(iter(["event: error\ndata: Run ID not found\n\n"]),
                                     media_type="text/event-stream")

        async def event_stream():
            while True:
                try:
                    msg = await sim.queue.get()
                    yield msg
                except asyncio.CancelledError:
                    break

        return StreamingResponse(event_stream(), media_type="text/event-stream")

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/{simulation_id}/stop')
async def stop_simulation(simulation_id: str):
    '''
    シミュレーション停止
    指定したシミュレーションを停止する．
    '''
    try:
        if simulation_id not in simluations:
            raise HTTPException(status_code=404, 
                                detail=f'Simulation not found: {simulation_id} in {list(simluations.keys())}')

        sim = simluations[simulation_id]
        sim.stop()
        return sim.to_dict()

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

