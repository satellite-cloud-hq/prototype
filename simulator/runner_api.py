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

app = FastAPI()

simluations = {}

UPLOAD_DIR = Path('./uploads')
UPLOAD_DIR.mkdir(exist_ok=True)

S2E_WORKING_DIR = Path('./aobc-sils/s2e/')
S2E_EXEC_FILE = Path('./build/S2E_AOBC')

class Simulation:
    id_counter = 0

    class Status(StrEnum):
        RUNNING   = 'running'
        COMPLETED = 'completed'
        STOPPED   = 'stopped'
        FAILED    = 'failed'

    def __init__(self, condition: Dict, app_path: Path):
        self.id = str(self.id_counter)
        Simulation.id_counter += 1

        self.status = self.Status.RUNNING
        self.app_path = app_path

    def run(self):
        self.s2e_process = subprocess.Popen(str(S2E_EXEC_FILE), cwd=str(S2E_WORKING_DIR))

        self.queue = asyncio.Queue()

        asyncio.create_task(self.run_and_stream())

    def stop(self):
        if self.s2e_process and self.s2e_process.returncode is None:
            self.s2e_process.terminate()
        if self.app_process and self.app_process.returncode is None:
            self.app_process.terminate()
        self.status = self.Status.STOPPED

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

