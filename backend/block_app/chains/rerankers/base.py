from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseReranker(ABC):
    @abstractmethod
    def __init__(self, api_info: Dict[str, Any]):
        """
        Initialize the reranker with API information.

        Args:
            api_info (Dict[str, Any]): A dictionary containing API configuration.
        """
        pass

    @abstractmethod
    def connect(self):
        """
        Establish a connection to the reranker model or API.
        """
        pass

    @abstractmethod
    def rerank(self, query: str, documents: List[str]) -> List[Dict[str, Any]]:
        """
        Rerank the given documents based on the query.

        Args:
            query (str): The search query.
            documents (List[str]): A list of documents to rerank.

        Returns:
            List[Dict[str, Any]]: A list of dictionaries containing reranked documents and their scores.
        """
        pass

    @abstractmethod
    def rerank_papers(
        self,
        query: str,
        papers: List[Dict[str, Any]],
        sub_queries: List[Dict[str, str]],
        rq_text: str,
        persona_text: str,
        topk: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Rerank papers based on the query, sub-queries, research question, and persona.

        Args:
            query (str): The original query text.
            papers (List[Dict[str, Any]]): A list of papers to rerank.
            sub_queries (List[Dict[str, str]]): A list of sub-queries with rationales.
            rq_text (str): The research question text.
            persona_text (str): The persona description.
            topk (int, optional): Number of top papers to return. Defaults to 10.

        Returns:
            List[Dict[str, Any]]: A list of top-k reranked papers.
        """
        pass
