import json
import pika
from pydantic import BaseModel, ValidationError
from src.config import settings
from src.ml_service import ai_service
from src.database import update_product_embedding

# Validação do payload esperado do Node.js
class ProductCreatedEvent(BaseModel):
    id: str
    name: str
    description: str

def process_message(ch, method, properties, body):
    try:
        # 1. Parse e Validação
        data = json.loads(body)
        event = ProductCreatedEvent(**data)
        
        print(f"[x] Processando produto: {event.id} - {event.name}")
        
        # 2. Concatenação de texto rico para o embedding
        # Quanto mais contexto, melhor a busca semântica depois
        text_to_embed = f"{event.name}. {event.description}"
        
        # 3. Geração do Embedding
        vector = ai_service.generate_embedding(text_to_embed)
        
        # 4. Persistência
        update_product_embedding(event.id, vector)
        
        print(f"[v] Embedding de 384 dimensões salvo para {event.id}")
        
        # 5. Confirmação de sucesso (ACK)
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except ValidationError as e:
        print(f"[!] Erro de validação de payload: {e}")
        # Rejeita sem enfileirar novamente para evitar loop infinito
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    except Exception as e:
        print(f"[!] Erro interno ao processar mensagem: {e}")
        # Pode ser requeued dependendo da sua estratégia de retentativas
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

def start_consuming():
    connection = pika.BlockingConnection(pika.URLParameters(settings.RABBITMQ_URL))
    channel = connection.channel()
    
    # Garante que a fila existe
    channel.queue_declare(queue=settings.QUEUE_NAME, durable=True)
    
    # Processa uma mensagem por vez (Fair Dispatch)
    channel.basic_qos(prefetch_count=1)
    
    channel.basic_consume(queue=settings.QUEUE_NAME, on_message_callback=process_message)
    
    print(f"[*] Aguardando eventos na fila '{settings.QUEUE_NAME}'...")
    channel.start_consuming()