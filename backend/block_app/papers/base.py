"""
File: base.py
Description: This file is to provide a model of scholarly papers that are more accessible for LLM agents.
Author: Yiren Liu
Date: Jan 3, 2024
"""
from dataclasses import dataclass
from typing import Dict, List, Optional, Union




@dataclass
class PaperSection:
    """
    A class to represent a section of a scholarly paper. 
    Provides utilities to provide a more accessible format for LLM agents.
    """
    title: str
    text: str
    references: List[str] = None
    metadata: Dict[str, Union[str, int, List[str]]] = None

@dataclass
class PaperBody:
    """
    A class to represent the body of a scholarly paper. 
    Provides utilities to provide a more accessible format for LLM agents.
    """
    sections: List[PaperSection]
    metadata: Dict[str, Union[str, int, List[str]]] = None


@dataclass
class ScholarlyPaper:
    """
    A class to represent a scholarly paper. 
    Provides utilities to provide a more accessible format for LLM agents.
    """
    title: str
    authors: List[str]
    abstract: str
    doi: str = None
    url: str = None
    venue: str = None
    year: int = None
    keywords: List[str] = None
    metadata: Dict[str, Union[str, int, List[str]]] = None
    body: PaperBody = None
    references: List[str] = None



@dataclass
class ScholarlyPaperList:
    """
    A class to represent a list of scholarly papers. 
    Should provide utilities search as searching (semantic-based), filtering, sorting, etc.
    """
    papers: List[ScholarlyPaper]

    def query_papers_with_keywords(self, keywords: str, k: int = 5) -> List[ScholarlyPaper]:
        """
        Query papers with keywords.
        k: number of papers to return
        """
        raise NotImplementedError




