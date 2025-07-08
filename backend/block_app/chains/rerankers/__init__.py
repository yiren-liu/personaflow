import os
from typing import Dict, Any, Type
from block_app.chains.rerankers.base import BaseReranker
from block_app.chains.rerankers.xinference import XInferenceReranker
from block_app.chains.rerankers.cohere_azure import AzureCohereReranker

from settings import app_settings

import logging

logger = logging.getLogger(__name__)

# Registry of available reranker types
RERANKER_REGISTRY: Dict[str, Type[BaseReranker]] = {
    'xinference': XInferenceReranker,
    'cohere_azure': AzureCohereReranker,
    # Add other rerankers to the registry as you implement them
}

def create_reranker() -> BaseReranker:
    """
    Factory function to create a reranker instance based on the api_info.

    Args: -

    Returns:
        BaseReranker: An instance of a subclass of BaseReranker.

    Raises:
        ValueError: If the 'RERANKER_TYPE' is not supported or missing.
    """
    reranker_type = app_settings.reranker_type
    if reranker_type is None:
        raise ValueError("The 'RERANKER_TYPE' key is missing from envs.")

    reranker_class = RERANKER_REGISTRY.get(reranker_type)
    if reranker_class is None:
        raise ValueError(f"Unsupported RERANKER_TYPE: {reranker_type}")

    if reranker_type == 'xinference':
        reranker = reranker_class(app_settings.xinference_api_url, app_settings.xinference_model_id)
    elif reranker_type == 'cohere_azure':
        reranker = reranker_class(app_settings.cohere_api_url, app_settings.cohere_api_key)
    logger.info(f"Created reranker instance of type '{reranker_type}'")
    return reranker
