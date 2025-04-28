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
from datetime import datetime, timedelta
from cuid2 import Cuid
import os
import signal

app = FastAPI()

simluations = {}

CUID_GENERATOR: Cuid = Cuid(length=10)

APP_DIR = Path('./app')
APP_DIR.mkdir(exist_ok=True)

S2E_LOG_DIR = Path('/s2e-logs/')

LOGDB_URL = 'http://log-db:8086/'
LOGDB_ORG = 'satellite-cloud'
LOGDB_TOKEN = 'admin-token'

class Simulation:

    class Status(StrEnum):
        INITIALIZED = 'initialized'
        RUNNING   = 'running'
        COMPLETED = 'completed'
        STOPPED   = 'stopped'
        FAILED    = 'failed'

    def __init__(self, condition: Dict):
        self.id = str(CUID_GENERATOR.generate())

        filename = f"app-{self.id}.py"
        self.app_path = APP_DIR / filename

        self.start_datetime = datetime(2023, 2, 10)
        self.end_datetime = datetime(2023, 2, 10) + timedelta(seconds=5000)

        self.status = self.Status.INITIALIZED

    def run(self):

        self.queue = asyncio.Queue()

        cmd = [
           "docker", "compose",
           "-f", "compose.yaml",
           "-p", f'campaign-{self.id}',
           "up", 
           "--abort-on-container-exit",
        ]
        env = os.environ.copy()
        env.update({
            "CAMPAIGN_ID": self.id,
            "CAMPAIGN_START_TIMESTAMP_MS": str(int(self.start_datetime.timestamp() * 1000)),
        })
        self.status = self.Status.RUNNING

        proc = subprocess.Popen(cmd, env=env)

    def stop(self):

        subprocess.Popen(
            ["docker", "compose", 
             "-p", f'campaign-{self.id}', 
             "down",
             "--volumes", "--remove-orphans",
             ]
        )

        self.status = self.Status.STOPPED

    async def run_app_and_stream(self):
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
            'status': self.status,
            'start_date_time': self.start_datetime.isoformat(),
            'end_date_time': self.end_datetime.isoformat(),
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
        sim = Simulation(json.loads(condition))
        simluations[sim.id] = sim

        with sim.app_path.open("wb") as f:
            shutil.copyfileobj(app.file, f)
        
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

