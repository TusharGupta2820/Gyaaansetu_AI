"""
GyaanSetu AI — ChromaDB RAG Service
Vector-based Retrieval-Augmented Generation using MiniLM embeddings.
Each user gets their own ChromaDB collection for private knowledge isolation.
"""

import os, uuid, logging, re
from typing import Optional
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("gyaansetu.rag")

CHROMA_PATH = os.getenv("CHROMADB_PATH", "./chroma_store")
EMBED_MODEL = "all-MiniLM-L6-v2"

_chroma_client = None
_embed_fn = None


class InMemoryCollection:
    _stores = {}

    def __init__(self, user_id: str):
        self.user_id = user_id
        self.name = f"user_{user_id.replace('-', '_')}_notes"
        if self.name not in InMemoryCollection._stores:
            InMemoryCollection._stores[self.name] = {"documents": [], "ids": [], "metadatas": []}
        self.store = InMemoryCollection._stores[self.name]

    def upsert(self, documents: list[str], ids: list[str], metadatas: list[dict]):
        for doc, doc_id, meta in zip(documents, ids, metadatas):
            if doc_id in self.store["ids"]:
                idx = self.store["ids"].index(doc_id)
                self.store["documents"][idx] = doc
                self.store["metadatas"][idx] = meta
            else:
                self.store["documents"].append(doc)
                self.store["ids"].append(doc_id)
                self.store["metadatas"].append(meta)

    def count(self) -> int:
        return len(self.store["documents"])

    def query(self, query_texts: list[str], n_results: int = 5) -> dict:
        if not self.store["documents"]:
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}

        q_words = set(query_texts[0].lower().split())
        scored = []
        for doc, meta in zip(self.store["documents"], self.store["metadatas"]):
            doc_words = set(doc.lower().split())
            intersection = len(q_words & doc_words)
            dist = 1.0 - (intersection / max(1, len(q_words)))
            scored.append((dist, doc, meta))

        scored.sort(key=lambda x: x[0])
        top = scored[:n_results]

        return {
            "documents": [[t[1] for t in top]],
            "metadatas": [[t[2] for t in top]],
            "distances": [[t[0] for t in top]]
        }


def _get_client():
    global _chroma_client
    if _chroma_client is None:
        try:
            import chromadb
            _chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
            logger.info(f"✅ ChromaDB client ready at {CHROMA_PATH}")
        except ImportError:
            logger.error("chromadb not installed. Using in-memory store.")
        except Exception as e:
            logger.error(f"ChromaDB init failed: {e}. Using in-memory store.")
    return _chroma_client


def _get_embed_fn():
    global _embed_fn
    if _embed_fn is None:
        try:
            from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
            _embed_fn = SentenceTransformerEmbeddingFunction(model_name=EMBED_MODEL)
            logger.info(f"✅ Embedding model '{EMBED_MODEL}' loaded")
        except Exception as e:
            logger.error(f"Embedding model failed: {e}")
    return _embed_fn


def _get_collection(user_id: str):
    """Get or create a per-user ChromaDB collection or in-memory fallback."""
    client = _get_client()
    embed_fn = _get_embed_fn()
    if client is not None and embed_fn is not None:
        try:
            collection_name = f"user_{user_id.replace('-', '_')}_notes"
            return client.get_or_create_collection(
                name=collection_name,
                embedding_function=embed_fn,
                metadata={"hnsw:space": "cosine"},
            )
        except Exception as e:
            logger.warning(f"ChromaDB collection error ({e}), falling back to InMemoryCollection")
    
    return InMemoryCollection(user_id)


def _chunk_text(text: str, chunk_size: int = 500, overlap: int = 80) -> list[str]:
    """Split text into overlapping chunks for better retrieval."""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current = []
    current_len = 0

    for sentence in sentences:
        sentence_len = len(sentence)
        if current_len + sentence_len > chunk_size and current:
            chunks.append(" ".join(current))
            overlap_sentences = []
            overlap_len = 0
            for s in reversed(current):
                if overlap_len + len(s) <= overlap:
                    overlap_sentences.insert(0, s)
                    overlap_len += len(s)
                else:
                    break
            current = overlap_sentences
            current_len = overlap_len
        current.append(sentence)
        current_len += sentence_len

    if current:
        chunks.append(" ".join(current))

    return [c.strip() for c in chunks if c.strip()]


async def ingest_text(user_id: str, text: str, source_name: str = "document") -> dict:
    """
    Chunk text and store embeddings in ChromaDB or InMemoryCollection.
    """
    collection = _get_collection(user_id)

    chunks = _chunk_text(text)
    if not chunks:
        return {"chunks_stored": 0, "error": "No text to ingest"}

    ids       = [f"{source_name}_{uuid.uuid4().hex[:8]}_{i}" for i in range(len(chunks))]
    metadatas = [{"source": source_name, "chunk_index": i} for i in range(len(chunks))]

    try:
        collection.upsert(documents=chunks, ids=ids, metadatas=metadatas)
        logger.info(f"Ingested {len(chunks)} chunks from '{source_name}' for user {user_id}")
        collection_name = getattr(collection, "name", "notes")
        return {"chunks_stored": len(chunks), "collection": collection_name}
    except Exception as e:
        logger.error(f"Ingest failed: {e}")
        return {"chunks_stored": 0, "error": str(e)}


async def query(user_id: str, question: str, n_results: int = 5) -> dict:
    """
    Retrieve relevant context from ChromaDB or InMemoryCollection for a user question.
    """
    collection = _get_collection(user_id)

    try:
        count = collection.count()
        if count == 0:
            return {"context": "", "sources": [], "found": False}

        results = collection.query(
            query_texts=[question],
            n_results=min(n_results, count),
        )

        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        # Filter by relevance (cosine or TF-IDF distance < 0.9)
        relevant = [
            (doc, meta) for doc, meta, dist in zip(documents, metadatas, distances)
            if dist < 0.9
        ]

        if not relevant:
            return {"context": "", "sources": [], "found": False}

        context = "\n\n---\n\n".join([doc for doc, _ in relevant])
        sources = list({meta.get("source", "unknown") for _, meta in relevant})

        return {"context": context, "sources": sources, "found": True}

    except Exception as e:
        logger.error(f"RAG query failed: {e}")
        return {"context": "", "sources": [], "found": False, "error": str(e)}


async def clear_collection(user_id: str) -> dict:
    """Delete all documents in a user's collection."""
    try:
        collection_name = f"user_{user_id.replace('-', '_')}_notes"
        if collection_name in InMemoryCollection._stores:
            InMemoryCollection._stores[collection_name] = {"documents": [], "ids": [], "metadatas": []}
        return {"success": True, "collection": collection_name}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def get_stats(user_id: str) -> dict:
    """Returns chunk count and sources for a user's collection."""
    collection = _get_collection(user_id)
    try:
        count = collection.count()
        return {"chunk_count": count, "available": True, "collection": getattr(collection, "name", "notes")}
    except Exception as e:
        return {"chunk_count": 0, "available": False, "error": str(e)}
