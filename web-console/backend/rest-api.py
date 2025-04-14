from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

app = FastAPI()

# CORS 設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 必要に応じて特定のオリジンに制限
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/schedule")
async def get_schedule(condition: UploadFile = File(...)):
    """
    スケジュール取得
    指定した条件でスケジューリングした結果を取得する．
    """
    try:
        # ファイル処理の例
        content = await condition.read()
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
        # ファイル処理の例
        condition_content = await condition.read()
        app_content = await app.read()
        # ダミーデータを返す
        return {
            "id": "1234567890",
            "status": "running"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/simulations/{simulation_id}")
async def get_simulation(simulation_id: str):
    """
    シミュレーション情報取得
    指定したシミュレーションの情報を取得する．
    """
    try:
        # ダミーデータを返す
        return {
            "id": simulation_id,
            "status": "completed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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