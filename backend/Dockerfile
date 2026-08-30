FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
COPY product_adapters ./product_adapters
COPY migrations ./migrations
CMD uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}
