from typing import List, Dict, Any
from xinference_client import RESTfulClient
import logging

from block_app.chains.rerankers.base import BaseReranker
from xinference_client.client.restful.restful_client import RESTfulRerankModelHandle

logger = logging.getLogger(__name__)

class XInferenceReranker(BaseReranker):
    def __init__(self, api_url: str, model_id: str):
        """
        Initialize the XInference reranker with API information.

        Args:
            api_info (Dict[str, Any]): A dictionary containing API configuration.
        """
        if not api_url:
            raise Exception("XInference URL not provided in api_info.")
        if not model_id:
            raise Exception("XInference model ID not provided in api_info.")
        self.api_url = api_url
        self.model_id = model_id
        self.client = None

    def connect(self):
        """
        Establish a connection to the XInference API.
        """
        xinf_url = self.api_url
        if not xinf_url:
            raise Exception("XInference URL not provided in api_info.")
        self.client = RESTfulClient(xinf_url)
        try:
            _ = self.client.describe_model(self.model_id)
        except Exception as e:
            logger.error(f"Failed to connect to XInference: {e}")
            self.client = None
            return
        logger.info(f"Connected to XInference at {xinf_url}")

    def rerank(self, query: str, documents: List[str]) -> List[Dict[str, Any]]:
        """
        Rerank the given documents based on the query using the XInference model.

        Args:
            query (str): The search query.
            documents (List[str]): A list of documents to rerank.

        Returns:
            List[Dict[str, Any]]: A list of dictionaries containing reranked documents and their scores.
        """
        if self.client is None:
            raise Exception("Client not connected. Call connect() before reranking.")

        # Get the reranker model
        model: RESTfulRerankModelHandle = self.client.get_model(self.model_id)
        if model is None:
            raise Exception("Failed to retrieve the reranker model from XInference.")

        # Perform reranking
        response = model.rerank(documents, query)
        results = response.get('results', [])
        return results

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

        # Prepare the corpus by formatting each paper
        corpus = []
        valid_papers = []
        for idx, paper in enumerate(papers):
            # Skip papers without an abstract
            if 'abstract' not in paper or not paper['abstract']:
                continue
            formatted_paper = f"TITLE: {paper['title']}\nABSTRACT: {paper['abstract']}"
            # Truncate to 5000 characters to meet API limits
            formatted_paper = formatted_paper[:5000]
            corpus.append(formatted_paper)
            valid_papers.append((idx, paper))  # Keep track of the original index and paper

        if not corpus:
            logger.warning("No valid papers to rerank.")
            return []

        # Rerank the documents using the query
        rerank_results = self.rerank(query, corpus) # [{'index': 0, 'relevance_score': SCORE, 'document': None}, ...]

        # Filter and sort the papers based on relevance scores
        reranked_papers = []
        for result in rerank_results:
            score = result.get('relevance_score', 0)
            if score > 0:
                paper_idx = result['index']
                original_paper = valid_papers[paper_idx][1]
                original_paper['relevance_score'] = score
                reranked_papers.append(original_paper)

        # Sort the papers by relevance score in descending order
        reranked_papers.sort(key=lambda x: x['relevance_score'], reverse=True)

        # Return the top-k papers
        return reranked_papers[:topk] # [{'title': TITLE, 'abstract': ABSTRACT, 'relevance_score': SCORE}, ...]
