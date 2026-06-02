from sqlalchemy import create_engine, text
from pgvector.sqlalchemy import Vector
from src.config import settings

engine = create_engine(settings.DATABASE_URL)

def update_product_embedding(product_id: str, embedding: list[float]):
    """Atualiza o registro do produto com o vetor gerado."""
    query = text("""
        UPDATE products 
        SET embedding = :embedding 
        WHERE id = :id
    """)
    
    with engine.begin() as conn: # .begin() já gerencia o commit/rollback automaticamente
        conn.execute(query, {
            "embedding": embedding,
            "id": product_id
        })