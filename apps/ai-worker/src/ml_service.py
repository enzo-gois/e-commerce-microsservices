from sentence_transformers import SentenceTransformer

class EmbeddingService:
    def __init__(self):
        # all-MiniLM-L6-v2 gera vetores de 384 dimensões
        print("Carregando modelo de IA na memória...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        print("Modelo carregado com sucesso!")

    def generate_embedding(self, text: str) -> list[float]:
        # Codifica o texto e converte o tensor do numpy para lista nativa do Python
        embedding = self.model.encode(text)
        return embedding.tolist()

# Instância Singleton
ai_service = EmbeddingService()