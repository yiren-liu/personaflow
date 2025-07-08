from typing import List, Dict, Any
import cohere
import logging
import os

from block_app.chains.rerankers.base import BaseReranker

logger = logging.getLogger(__name__)

class AzureCohereReranker(BaseReranker):
    def __init__(self, api_url, api_key):
        """
        Initialize the Azure Cohere reranker with API information.
        """
        self.api_url = api_url
        self.api_key = api_key
        if not self.api_url or not self.api_key:
            raise Exception("Cohere API URL or API Key not provided in environment variables.")
        self.client = None

    def connect(self):
        """
        Establish a connection to the Azure Cohere API.
        """
        try:
            self.client = cohere.Client(api_key=self.api_key, base_url=self.api_url)
            # Test the connection
            # self.client.check_api_key()
            logger.info(f"Connected to Cohere at {self.api_url}")
        except Exception as e:
            logger.error(f"Failed to connect to Cohere: {e}")
            self.client = None

    def rerank(self, query: str, documents: List[Dict[str, str]], top_n: int = 10) -> List[Dict[str, Any]]:
        """
        Rerank the given documents based on the query using the Cohere model.

        Args:
            query (str): The search query.
            documents (List[Dict[str, str]]): A list of documents to rerank.
            top_n (int, optional): Number of top documents to return. Defaults to 10.

        Returns:
            List[Dict[str, Any]]: A list of dictionaries containing reranked documents and their scores.
        """
        if self.client is None:
            raise Exception("Client not connected. Call connect() before reranking.")

        try:
            response = self.client.rerank(
                query=query,
                documents=documents,
                rank_fields=["Title", "Content"],
                top_n=top_n,
                return_documents=True
            )
            results = response.results
            return results
        except Exception as e:
            logger.error(f"Failed to rerank documents: {e}")
            raise Exception(f"Failed to rerank documents: {e}")

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
        # Ensure client is connected
        if self.client is None:
            raise Exception("Client not connected. Call connect() before reranking.")

        # Prepare the documents by formatting each paper
        documents = []
        valid_papers = []
        for idx, paper in enumerate(papers):
            # Skip papers without an abstract
            if 'abstract' not in paper or not paper['abstract']:
                continue
            document = {
                "Title": paper['title'],
                "Content": paper['abstract'][:5000]  # Truncate to 5000 characters if needed
            }
            documents.append(document)
            valid_papers.append((idx, paper))  # Keep track of the original index and paper

        if not documents:
            logger.warning("No valid papers to rerank.")
            return []

        # Rerank the documents using the query
        rerank_results = self.rerank(query=query, documents=documents, top_n=topk)

        # Map reranked results back to the original papers
        reranked_papers = []
        for result in rerank_results:
            score = result.relevance_score
            idx = result.index
            if score > 0:
                original_paper = valid_papers[idx][1]
                original_paper['relevance_score'] = score
                reranked_papers.append(original_paper)

        # Sort the papers by relevance score in descending order
        reranked_papers.sort(key=lambda x: x['relevance_score'], reverse=True)

        # Return the top-k papers
        return reranked_papers[:topk]
