import asyncio
import httpx
from pathlib import Path
import time
import json

server = 'http://localhost:8920'

test_script_path = Path("test_app.py")
condition = {}

with test_script_path.open("rb") as file:
    response = httpx.post(
        server,
        files={"app": ("test_script.py", file, "text/x-python")},
        data={"condition": json.dumps(condition)},
    )
    print(response.status_code, response.text)
    data = json.loads(response.text)
    simulation_id = data["id"]

try:
    with httpx.stream("GET", f'{server}/{simulation_id}/output', timeout=5) as response:
        print(response.status_code)
        for line in response.iter_lines():
            print(line)
except httpx.ReadTimeout:
    pass

response = httpx.post(f'{server}/{simulation_id}/stop')
print(response.status_code, response.text)
