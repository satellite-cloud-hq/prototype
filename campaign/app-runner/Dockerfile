FROM python:latest

COPY app-runner/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

CMD ["/bin/sh", "-c", "python -u app/code-${CAMPAIGN_ID}.py 1> app/stdout-${CAMPAIGN_ID}.log 2> app/stderr-${CAMPAIGN_ID}.log"]
