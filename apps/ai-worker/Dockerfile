FROM python:3.11-slim

WORKDIR /app

# Instala dependências do sistema necessárias para compilar o psycopg2 e pgvector
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

# Define PYTHONPATH para que as importações 'src.X' funcionem
ENV PYTHONPATH=/app

CMD ["python", "src/main.py"]