from typing import Any
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from httpx import AsyncClient, HTTPStatusError
import json

SIMULATOR_API = 'http://simulator'

app = FastAPI()

# CORS 設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 必要に応じて特定のオリジンに制限
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def generate_schedule(condition_file: bytes) -> dict[str, Any]:
    """
    スケジュール生成
    設定ファイルからスケジュール（シミュレーション条件）を生成する．
    """
    # ダミーデータを返す
    return {
        "start_date_time": "2023-10-01T00:00:00Z",
        "end_date_time": "2023-10-01T01:00:00Z",
        "passes": [
            {
                "id": "1234567890",
                "start_date_time": "2023-10-01T00:00:00Z",
                "end_date_time": "2023-10-01T00:30:00Z",
                "satellite": {
                    "id": "1234567890",
                    "name": "Satellite A",
                    "orbit": {
                        "epoch": "2023-10-01T00:00:00Z",
                        "inclination": 0.9006,
                        "raan": 5.837,
                        "eccentricity": 0.0004,
                        "argument_of_perigee": 6.126,
                        "mean_anomaly": 1.739,
                        "mean_motion": 15.4
                    }
                }
            }
        ]
    }

@app.post("/schedule")
async def get_schedule(condition: UploadFile = File(...)):
    """
    スケジュール取得
    指定した条件でスケジューリングした結果を取得する．
    """
    try:
        # ファイル処理の例
        schedule = generate_schedule(await condition.read())
        return schedule

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/simulations")
async def get_simulations():
    """
    シミュレーション一覧取得
    実行中および過去に実行したシミュレーションの一覧を取得する．
    """
    try:
        async with AsyncClient() as client:
            response = await client.get(SIMULATOR_API)
        response.raise_for_status()
        return response.json()
    except HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e.response.text))

@app.post("/simulations")
async def run_simulation(
    condition: UploadFile = File(...),
    app: UploadFile = File(...)
):
    """
    シミュレーション実行
    新規シミュレーションを実行する．
    """
    try:
        async with AsyncClient() as client:
            response = await client.post(
                SIMULATOR_API,
                files={"app": (app.filename, await app.read(), app.content_type)},
                data={"condition": json.dumps(generate_schedule(await condition.read()))},
            )
        response.raise_for_status()
        return response.json()
    except HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e.response.text))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/simulations/{simulation_id}")
async def get_simulation(simulation_id: str):
    """
    シミュレーション情報取得
    指定したシミュレーションの情報を取得する．
    """
    try:
        async with AsyncClient() as client:
            response = await client.get(f'{SIMULATOR_API}/{simulation_id}')
        response.raise_for_status()
        return response.json()
    except HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e.response.text))
    

@app.get("/simulations/{simulation_id}/output")
async def get_simulation_output(simulation_id: str):
    """
    シミュレーション出力取得
    指定したシミュレーションにおけるユーザーアプリの出力を取得する．
    """
    try:
        async def generator():
            async with AsyncClient(timeout=None) as client:
                async with client.stream("GET", f'{SIMULATOR_API}/{simulation_id}/output') as response:
                    async for line in response.aiter_lines():
                        yield f"{line}\n"
        return StreamingResponse(generator(), media_type="text/event-stream")

    except HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e.response.text))

@app.post("/simulations/{simulation_id}/stop")
async def stop_simulation(simulation_id: str):
    """
    シミュレーション停止
    指定したシミュレーションを停止する．
    """
    try:
        async with AsyncClient() as client:
            response = await client.post(f'{SIMULATOR_API}/{simulation_id}/stop')
        response.raise_for_status()
        return response.json()

    except HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e.response.text))


@app.get("/resources/satellites")
async def get_satellites():
    """
    衛星一覧取得
    全ての衛星を取得する．
    """
    try:
        # ダミーデータを返す
        return {
            "items": [
                {
                    "id": "1234567890",
                    "name": "Satellite A",
                    "orbit": {
                        "epoch": "2023-10-01T00:00:00Z",
                        "inclination": 0.9006,
                        "raan": 5.837,
                        "eccentricity": 0.0004,
                        "argument_of_perigee": 6.126,
                        "mean_anomaly": 1.739,
                        "mean_motion": 15.4
                    }
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/resources/ground_stations")
async def get_ground_stations():
    """
    地上局一覧取得
    全ての地上局を取得する．
    """
    try:
        # ダミーデータを返す
        return {
            "items": [
                {
                    "id": "1234567890",
                    "name": "Ground Station A",
                    "latitude": 0.7854,
                    "longitude": 1.5708,
                    "altitude": 100.0
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))