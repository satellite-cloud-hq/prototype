FROM python:latest

COPY simulation-logger/requirements.txt .
COPY simulation-logger/logger.py .
RUN pip install --no-cache-dir -r requirements.txt

CMD python -u logger.py ${CAMPAIGN_ID}
